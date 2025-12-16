# Backend Bugs Report - Game Flow Issues

**Date:** December 15, 2025  
**Status:** 🔴 Critical Bugs Found

---

## 🐛 Bug #1: Premature Events on Game Start

### Symptoms:

1. Guru membuat room ✅
2. Pemain join room ✅
3. Guru mulai quiz ✅
4. **Pemain "menunggu soal"** tapi tiba-tiba **"notif salah"** muncul
5. **Soal belum muncul** tapi sudah tampil **leaderboard 0pt**
6. Event racing - multiple leaderboard dalam 0.5 detik

### Root Cause:

Backend emit `question_end` dan `update_leaderboard` **sebelum** atau **bersamaan** dengan `question_start`

### Expected Flow:

```
1. game:started → ✅
2. question_start (soal 1) → ✅
3. [wait for answers]
4. question_end (soal 1) → ✅
5. update_leaderboard → ✅
6. question_start (soal 2) → ✅
... repeat
```

### Actual Flow (BUG):

```
1. game:started → ✅
2. question_end (???) → ❌ TOO EARLY
3. update_leaderboard (0pt) → ❌ TOO EARLY
4. question_start (soal 1) → ✅ Finally!
5. question_end racing with next question
```

### Backend Investigation Needed:

1. **Check `start_game` handler:**

   - Does it emit `question_end` immediately?
   - Does it emit `update_leaderboard` before first question?

2. **Check `question_start` timing:**

   - Is there a delay before first question?
   - Are events queued properly?

3. **Check event order:**

   ```javascript
   // ❌ WRONG ORDER
   io.to(roomCode).emit("update_leaderboard", ...);
   io.to(roomCode).emit("question_start", ...);

   // ✅ CORRECT ORDER
   io.to(roomCode).emit("question_start", ...);
   // ... wait for answers ...
   // ... time expires ...
   io.to(roomCode).emit("question_end", ...);
   io.to(roomCode).emit("update_leaderboard", ...);
   ```

### Suggested Fix:

```javascript
// In gameHandler.js or similar

function startGame(roomCode) {
  const room = rooms.get(roomCode);

  // 1. Emit game:started
  io.to(roomCode).emit("game:started", {
    questionCount: room.questions.length,
    quizId: room.quizId,
  });

  // 2. Start first question immediately
  startQuestion(roomCode, 0);

  // ❌ DO NOT emit question_end or leaderboard here!
}

function startQuestion(roomCode, qIndex) {
  const room = rooms.get(roomCode);
  const question = room.questions[qIndex];

  // Reset answer tracking
  room.currentQuestionAnswers = [];
  room.questionStartTime = Date.now();

  // Emit question_start
  io.to(roomCode).emit("question_start", {
    qIndex: qIndex,
    qText: question.question_text,
    options: question.options,
    duration: question.time_limit || 20,
    points: question.points || 20,
  });

  // Schedule question_end after duration
  setTimeout(() => {
    endQuestion(roomCode, qIndex);
  }, (question.time_limit || 20) * 1000);
}

function endQuestion(roomCode, qIndex) {
  const room = rooms.get(roomCode);
  const question = room.questions[qIndex];

  // 1. Emit question_end
  io.to(roomCode).emit("question_end", {
    correctAnswerIdx: question.correct_idx,
  });

  // 2. Calculate and emit leaderboard
  const leaderboard = calculateLeaderboard(room);
  io.to(roomCode).emit("update_leaderboard", {
    leaderboard: leaderboard,
  });

  // ✅ DO NOT auto-start next question
  // Wait for host to click "Next Question"
}
```

---

## 🐛 Bug #2: Off-by-One Error (n-1 Questions)

### Symptoms:

- Quiz memiliki **3 soal**
- Guru hanya bisa menampilkan **2 soal**
- Soal ke-2 → klik "Next Question" → Game selesai ❌
- Soal ke-3 tidak pernah muncul

### Root Cause:

Backend question index management salah (0-based vs 1-based confusion)

### Expected Behavior:

```
Quiz: 3 soal (index 0, 1, 2)

Flow:
1. Start game → Show soal 0 ✅
2. Next → Show soal 1 ✅
3. Next → Show soal 2 ✅
4. Next → Game ended ✅
```

### Actual Behavior (BUG):

```
Quiz: 3 soal (index 0, 1, 2)

Flow:
1. Start game → Show soal 0 ✅
2. Next → Show soal 1 ✅
3. Next → Game ended ❌ (soal 2 tidak muncul!)
```

### Backend Investigation Needed:

1. **Check question counter:**

   ```javascript
   // ❌ WRONG - Off by one
   if (currentQuestionIndex >= questions.length - 1) {
     endGame(); // This ends at index 1 for 3 questions!
   }

   // ✅ CORRECT
   if (currentQuestionIndex >= questions.length) {
     endGame();
   }
   ```

2. **Check `game:next` handler:**

   ```javascript
   // ❌ WRONG
   socket.on("game:next", (data) => {
     room.currentQuestionIndex++;

     // Bug: Checks AFTER increment
     if (room.currentQuestionIndex >= room.questions.length - 1) {
       endGame(roomCode);
     } else {
       startQuestion(roomCode, room.currentQuestionIndex);
     }
   });

   // ✅ CORRECT
   socket.on("game:next", (data) => {
     room.currentQuestionIndex++;

     // Check with proper boundary
     if (room.currentQuestionIndex >= room.questions.length) {
       endGame(roomCode);
     } else {
       startQuestion(roomCode, room.currentQuestionIndex);
     }
   });
   ```

3. **Check initial index:**

   ```javascript
   // ❌ WRONG - Starts at 1
   room.currentQuestionIndex = 1;

   // ✅ CORRECT - Starts at 0
   room.currentQuestionIndex = 0;
   ```

### Debugging Checklist:

```javascript
// Add logging to backend
console.log("=== DEBUG QUESTION FLOW ===");
console.log("Total questions:", room.questions.length);
console.log("Current index:", room.currentQuestionIndex);
console.log("Next index will be:", room.currentQuestionIndex + 1);
console.log(
  "Should end game?",
  room.currentQuestionIndex + 1 >= room.questions.length
);
console.log("===========================");
```

### Test Case:

```sql
-- Quiz dengan 3 soal (dari user's SQL)
SELECT * FROM questions WHERE quiz_id = 'a0010001-0000-0000-0000-000000000001';
-- Should return 3 rows (index 0, 1, 2)

Expected: Show all 3 questions
Actual: Shows only 2 questions (0 and 1)
Bug: Question index 2 never displayed
```

---

## 🔧 Frontend Changes Already Applied:

### ✅ Fixed Race Conditions:

1. Removed auto-timeout untuk leaderboard display
2. Added guard untuk prevent premature state changes
3. Only show leaderboard after valid question_end
4. Added state validation before transitions

### ✅ Added Auto-Transition:

- FEEDBACK → LEADERBOARD after 3 seconds
- Smooth flow between states
- Prevents UI stuck states

### Code Changes:

- `app/play/[roomCode]/live/page.tsx`:
  - Line ~119: Removed `setTimeout` from `update_leaderboard`
  - Line ~104: Added guards di `question_end`
  - Line ~215: Added auto-transition useEffect

---

## 📊 Test Data Analysis:

### ✅ API Endpoint Verification (CONFIRMED WORKING):

```bash
$ curl -X GET http://localhost:3001/api/quizzes
```

**Result:** ✅ API returns **3 questions correctly** for quiz "Dasar Ilmu Komputer"

```json
{
  "id": "a0010001-0000-0000-0000-000000000001",
  "title": "Dasar Ilmu Komputer",
  "questions": [
    {
      "id": "d6faaab0-63e3-465a-ae4a-a16daec5d2c0",
      "question_text": "Otak dari sebuah komputer yang memproses instruksi disebut?",
      "points": 20,
      "time_limit": 15
    },
    {
      "id": "1b1f59a6-132d-4b56-a2ac-0cf495cfce95",
      "question_text": "Sistem bilangan yang hanya menggunakan angka 0 dan 1 disebut?",
      "points": 20,
      "time_limit": 15
    },
    {
      "id": "bbf218ee-d1bd-48e2-921d-1be1bc070e21",
      "question_text": "Manakah di bawah ini yang termasuk perangkat lunak (software)?",
      "points": 20,
      "time_limit": 10
    }
  ]
}
```

**Conclusion:** ✅ **Database and API are working correctly**  
**Problem:** ❌ **Socket event logic in backend gameHandler**

---

### Your SQL Data:

```sql
-- Quiz 1: Dasar Komputer
-- ID: a0010001-0000-0000-0000-000000000001
-- Expected: 3 questions

Question 1: "Otak dari sebuah komputer..."
Question 2: "Sistem bilangan yang hanya..."
Question 3: "Manakah di bawah ini yang termasuk..."
```

### Testing Checklist:

- [ ] All 3 questions display (currently only 2)
- [ ] No premature feedback modal
- [ ] No premature leaderboard (0pt)
- [ ] Correct event order
- [ ] Proper timing between events

---

## 🔍 How to Debug with Enhanced Logging:

### Frontend Now Has Enhanced Logging:

**Open browser console** saat test game. You will see:

```
========== EVENT: game:started [2025-12-15T10:30:00.123Z] ==========
🎮 Game started: { questionCount: 3, quizId: 'a0010001...' }
Expected questions: 3
=================================================

========== EVENT: question_end [2025-12-15T10:30:00.456Z] ==========  ← ❌ BUG! Too early!
⏱️ Question ended (server)
Correct answer index: 2
Current question: NONE  ← ❌ No active question yet!
⚠️ GUARD TRIGGERED: No active question - IGNORING EVENT
=================================================

========== EVENT: update_leaderboard [2025-12-15T10:30:00.500Z] ========== ← ❌ BUG! Too early!
📊 Leaderboard data: { leaderboard: [{name: "Student1", score: 0}] }
Player count: 1
=================================================

========== EVENT: question_start [2025-12-15T10:30:00.789Z] ========== ← ✅ Finally!
📝 Question INDEX: 0
📝 Question TEXT: Otak dari sebuah komputer...
⏱️ Duration: 15 seconds
=================================================
```

### What to Look For:

1. **Event Order:** Does `question_end` come before `question_start`? ❌
2. **Question Count:** Does it show all 3 questions? Currently shows 2
3. **Timestamps:** How close are events? Should be seconds apart, not milliseconds
4. **Guard Triggers:** How many times does "GUARD TRIGGERED" appear?

---

## 🎯 Action Items:

### Backend Team (Critical):

1. **Fix event order in `start_game`** (Bug #1)

   - Don't emit `question_end` before first question
   - Don't emit `update_leaderboard` before first question

2. **Fix question index boundary check** (Bug #2)

   - Change `>= length - 1` to `>= length`
   - Verify 0-based indexing throughout

3. **Add event flow logging**
   - Log every event emission with timestamp
   - Log question index changes
   - Log game state transitions

### Frontend Team (Completed):

- ✅ Race condition guards
- ✅ State validation
- ✅ Auto-transition logic

---

## 📝 Next Steps:

1. Backend team: Review `socket/gameHandler.js` or equivalent
2. Check `start_game`, `game:next`, `endQuestion` functions
3. Add debug logging to trace event order
4. Test with 3-question quiz
5. Verify all questions display correctly
6. Confirm no premature events

---

**Priority:** 🔴 **CRITICAL**  
**Impact:** Game completely broken - students can't play properly  
**Estimated Fix Time:** 30-60 minutes backend work
