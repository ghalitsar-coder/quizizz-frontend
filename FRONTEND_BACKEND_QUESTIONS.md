# Frontend-Backend Integration Questions

**Date:** December 15, 2025  
**Purpose:** Tracking missing information and integration issues between frontend and backend

---

## 🔴 Critical Issues

### 1. Missing `quizId` in `game:started` Event

**Current State:**
- PRD_BACKEND.md line 177: `game:started` only sends `{ questionCount: number }`
- Frontend needs `quizId` to fetch questions from `/api/quiz/:id/questions`

**SOCKET_guide.md Analysis:**
- Line 248 confirms: `game:started` event sends `{ questionCount: number }` - **no quizId**
- Line 177 (event table): Same structure, no quizId in payload

**Question:**
- Can backend include `quizId` in `game:started` event payload?
- Suggested payload: `{ questionCount: number, quizId: string }`

**Impact:**
- Frontend currently cannot fetch questions from API on game start
- Relying on socket `question_start` event for question data (full question in socket)
- This is inefficient and increases socket payload size per question

**Frontend Code Reference:**
- `app/play/[roomCode]/live/page.tsx` line ~40-60

---

### 2. Question Data Source Strategy - **CLARIFIED FROM SOCKET_guide.md**

**Current Backend Implementation (from SOCKET_guide.md line 269-271):**
```javascript
socketInstance.on("question_start", (data) => {
  // Backend sends full question data via socket:
  // { qIndex, qText, imageUrl, options, duration, points }
});
```

**Current Approach: ✅ Socket-based (Backend's Design Choice)**
- Backend sends full question data in each `question_start` event
- No need to fetch from API during game
- Frontend receives: `{ qIndex, qText, imageUrl, options, duration, points }`

**Trade-offs Analysis:**
- **Socket Approach (Current):**
  - ✅ No additional HTTP requests during game
  - ✅ Server has full control over timing
  - ✅ Simpler frontend logic - just listen to socket
  - ❌ Larger socket payloads per question (~500-1000 bytes per question)
  - ❌ Cannot prefetch questions for offline/caching

**Question Resolution:**
- ✅ **SOLVED FROM SOCKET_guide.md**: Backend intentionally uses socket-based delivery
- Frontend should remove API fetch logic and rely on `question_start` event
- No action needed on backend for this issue

---

### 3. Room-Quiz Relationship Endpoint

**Missing Endpoint:**
- No endpoint to get quiz info from roomCode
- Current endpoints: `GET /api/quizzes` and `GET /api/quizzes/:id`

**SOCKET_guide.md Finding:**
- Line 251: `room_created` event sends `{ roomCode, quizTitle, questionCount }` to host
- Students joining via `join_room` don't receive quiz info until game starts

**Questions:**
1. Should backend provide `GET /api/rooms/:roomCode` endpoint for public quiz info?
   - Response: `{ quizTitle, questionCount, hostName, status }`
   - Use case: Show quiz info on join/lobby page
   
2. Can `player_joined_success` event include quiz metadata?
   - Current: `{ status: "OK" }`
   - Suggested: `{ status: "OK", quizTitle: string, questionCount: number }`

**Impact:**
- Students in lobby cannot see what quiz they're about to play
- Frontend can only show roomCode, not quiz name/info

---

## 🟡 Clarification Needed

### 4. Event Name Consistency - **VERIFIED FROM SOCKET_guide.md**

**Status:** ✅ **SOLVED FROM SOCKET_guide.md**

**SOCKET_guide.md Confirmation (line 833-848):**
Backend uses **colon notation** for game lifecycle events:
- ✅ `game:started` (not `game_started`)
- ✅ `game:next` (not `next_question`)
- ✅ `game:end` (not `game_over`)
- ✅ `game:ended` (not `game_ended`)

**Frontend Status:**
- ✅ Updated all listeners to use colon notation (primary)
- ✅ Added fallback listeners for underscore notation (compatibility)
- ✅ Host emits correct event names (`game:next`, `game:end`)

**Testing Status:**
- Debug logging active via `socket.onAny()` in all game pages
- Can monitor actual events received in browser console

---

### 5. Leaderboard Data Structure - **CONFIRMED FROM SOCKET_guide.md**

**Status:** ✅ **SOLVED FROM SOCKET_guide.md**

**SOCKET_guide.md line 850:**
```typescript
update_leaderboard | { leaderboard: [{name, score, rank}] }
```

**Confirmed Structure:**
```typescript
type LeaderboardEntry = {
  name: string;
  score: number;
  rank: number; // ✅ Backend includes rank
}
```

**Frontend Implementation:**
- ✅ Already using correct type in all components
- ✅ No calculation needed - rank comes from backend

---

### 6. Answer Submission Timing - **PARTIALLY CLARIFIED**

**Current Implementation (SOCKET_guide.md line 518-523):**
```javascript
socket.emit("submit_answer", {
  roomCode: roomCode,
  answerIdx: answerIdx,
  timeElapsed: timeElapsed, // ✅ Confirmed field name
});
```

**Frontend Enhancement:**
- Frontend also sends `clientTimestamp: Date.now()` for debugging
- Backend should use `timeElapsed` for scoring (confirmed from guide)

**Questions Still Open:**
1. Does backend validate `timeElapsed <= duration + 2s` (per PRD late submission rules)?
2. Clock skew handling: Does backend trust `timeElapsed` or recalculate on server?
3. What happens if `timeElapsed > duration + 2`? Silent reject or error event?

**PRD Reference (line 144-148):**
> Server menolak jawaban yang masuk > (Batas Waktu + 2 detik toleransi latensi).

**Testing Needed:**
- Submit answer after time expires (duration + 3s)
- Check if `answer_result` event received or error thrown

---

## 🟢 Working/Confirmed

### 7. Cookie Authentication
- ✅ **SOLVED FROM SOCKET_guide.md**: No cookie/auth mentioned in socket events
- ✅ Frontend sends credentials: 'include' on all API calls (REST endpoints only)
- ✅ Socket.io uses separate connection (no cookie auth on WebSocket)
- ✅ No localStorage token usage

**Note:** Socket.io authentication happens at connection level, not per-event

---

### 8. Socket Connection - **VERIFIED FROM SOCKET_guide.md**

**Status:** ✅ **SOLVED FROM SOCKET_guide.md**

**Confirmed Configuration (line 6-14):**
```javascript
const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

**Frontend Implementation:**
- ✅ Matches guide specification
- ✅ Auto-reconnect with 1s delay, max 5 attempts
- ✅ Debug logging via `socket.onAny()`
- ✅ Reconnection strategy in SocketContext

**Production Ready:**
- ✅ Environment variable support: `process.env.REACT_APP_SOCKET_URL`
- ✅ Fallback to localhost for development

---

### 9. Game Flow Events (Frontend Ready) - **VERIFIED FROM SOCKET_guide.md**

**All Events Confirmed (line 833-851):**

| Event                   | Frontend Listener | Status |
| ----------------------- | ----------------- | ------ |
| `game:started`          | ✅ Implemented    | Ready  |
| `question_start`        | ✅ Implemented    | Ready  |
| `answer_result`         | ✅ Implemented    | Ready  |
| `question_end`          | ✅ Implemented    | Ready  |
| `update_leaderboard`    | ✅ Implemented    | Ready  |
| `game:ended`            | ✅ Implemented    | Ready  |
| `final_results`         | ✅ Fallback       | Ready  |
| `live_stats` (host)     | ✅ Implemented    | Ready  |
| `room_created` (host)   | ✅ Implemented    | Ready  |
| `player_joined` (host)  | ✅ Implemented    | Ready  |
| `player_joined_success` | ✅ Implemented    | Ready  |
| `error_message`         | ✅ Implemented    | Ready  |

**Event Emitters (Frontend to Backend):**

| Event           | Frontend Emit    | Status |
| --------------- | ---------------- | ------ |
| `create_room`   | ✅ Host UI       | Ready  |
| `join_room`     | ✅ Lobby Page    | Ready  |
| `start_game`    | ✅ Host UI       | Ready  |
| `submit_answer` | ✅ Game Arena    | Ready  |
| `game:next`     | ✅ Host UI       | Ready  |
| `game:end`      | ✅ Host UI       | Ready  |

---

## 📝 Next Steps

1. ✅ **COMPLETED:** Read SOCKET_guide.md to understand backend socket implementation
2. ✅ **COMPLETED:** Updated this file based on findings - marked 4 issues as SOLVED
3. **TODO:** Remove unnecessary API fetch logic from game arena (use socket-only approach)
4. **TODO:** Test game flow end-to-end to verify event delivery
5. **TODO:** Monitor console logs for actual events received
6. **TODO:** Test late submission (after duration + 2s) to verify backend validation

---

## 🆕 New Questions Added from SOCKET_guide.md

### 10. Reconnection Strategy for Students

**SOCKET_guide.md (line 895-912) shows reconnection logic:**
```javascript
socket.on("connect", () => {
  // Rejoin room if was in one
  if (currentRoomCode) {
    if (isHost) {
      console.warn("Host disconnected, room may be closed");
    } else {
      socket.emit("join_room", {
        roomCode: currentRoomCode,
        nickname: savedNickname,
      });
    }
  }
});
```

**Questions:**
1. Does backend support rejoining a room mid-game?
2. What event does backend send when student rejoins?
   - `player_joined_success` again?
   - Special `player_rejoined` event?
3. Does rejoining student receive:
   - Current question state?
   - Current score?
   - Missed questions count?
4. Host reconnection: Does room persist or auto-close when host disconnects?

**Frontend Implementation Status:**
- ✅ Basic reconnection in SocketContext
- ❌ No rejoin logic on reconnect
- ❌ No state recovery after reconnection

**Use Case:**
- Student's internet drops for 10 seconds during question 3 of 10
- Should they be able to rejoin and continue from question 4?

---

### 11. Host Disconnect Behavior

**Question from SOCKET_guide.md line 905:**
> "Host can't rejoin, need to recreate room" - Is this accurate?

**Questions:**
1. What happens to room when host disconnects?
   - Room stays active? 
   - Room auto-closes?
   - Game pauses for X seconds waiting for host?
2. Can students continue playing if host disconnects?
3. Can host reconnect and resume the same game?
4. Should frontend show "Host disconnected, game paused" message?

**Impact:**
- Critical for game stability
- Need clear UX for students when host connection drops

---

### 12. Timer Synchronization

**SOCKET_guide.md shows client-side timer (line 781-786):**
```javascript
let timeLeft = data.duration;
const timer = setInterval(() => {
  timeLeft--;
  setQuestionTimer(timeLeft);
  if (timeLeft <= 0) clearInterval(timer);
}, 1000);
```

**Concerns:**
1. Client timers can drift from server timer (browser throttling, tab inactive, etc.)
2. Student submits at "1 second left" on client, but server sees "time expired"
3. No synchronization mechanism

**Questions:**
1. Does backend emit `question_end` event when time expires?
2. If yes, should frontend stop accepting answers on `question_end` instead of local timer?
3. Should backend send periodic time sync events? (e.g., `time_remaining` every 5s)

**Suggested Improvement:**
```javascript
// Option 1: Trust server time
socket.on("question_end", () => {
  setQuestionTimer(0); // Force timer to 0
  disableAnswers();
});

// Option 2: Server sends time updates
socket.on("time_sync", (data) => {
  setQuestionTimer(data.timeRemaining);
});
```

**Current Risk:**
- Student sees 2 seconds left, clicks answer
- Server already expired timer, rejects answer
- Bad UX: "You answered in time but it didn't count"

---

### 13. Live Stats Update Frequency

**SOCKET_guide.md line 279-281:**
```javascript
socket.on("live_stats", (stats) => {
  setLiveStats(stats); // { a: 0, b: 0, c: 0, d: 0 }
});
```

**Questions:**
1. When does backend emit `live_stats`?
   - After each student submits answer? (real-time)
   - Every X seconds in batch? (throttled)
   - Only when question ends?
2. Is `live_stats` sent to:
   - Host only?
   - All participants?
3. Performance concern: 50 students = 50 `live_stats` events per second?

**Frontend Expectation:**
- Host sees bar chart updating in real-time as students answer
- Need fast updates for good UX
- But need to avoid socket flooding

**Suggested Backend Strategy:**
- Emit to host only (not all students)
- Throttle to max 2-3 updates per second (batch updates)

---

### 14. Error Message Handling - **NEW ERRORS DISCOVERED**

**SOCKET_guide.md shows error handling (line 864-881):**

Additional error cases found:
- ✅ "Room tidak ditemukan" - handled
- ✅ "Game sudah dimulai" - handled
- ✅ "Nama sudah dipakai" - handled
- ❓ **NEW:** What other errors can backend send?

**Missing Error Scenarios:**
1. Room full (max players limit)?
   - Error: "Room sudah penuh"
   - Frontend: Show capacity message
2. Invalid roomCode format?
   - Error: "Kode room tidak valid"
3. Quiz not found (deleted during game)?
   - Error: "Quiz tidak tersedia"
4. Database connection lost?
   - Error: "Server error, please retry"

**Question:**
- Complete list of possible `error_message` values?
- Should we create error code enum for type-safe handling?

**Suggested Frontend Improvement:**
```typescript
enum SocketErrorCode {
  ROOM_NOT_FOUND = "Room tidak ditemukan",
  GAME_STARTED = "Game sudah dimulai",
  NAME_TAKEN = "Nama sudah dipakai",
  ROOM_FULL = "Room sudah penuh",
  INVALID_CODE = "Kode room tidak valid",
  // ... etc
}
```

---

## 🔧 Frontend Workarounds Currently Active

1. **Missing quizId:** Frontend has conditional logic to handle both API and socket-based question delivery
   - **ACTION NEEDED:** Remove API fetch code, use socket-only (per SOCKET_guide.md design)
   
2. **Event name fallbacks:** Multiple listeners for same events (colon vs underscore notation)
   - **ACTION NEEDED:** Remove fallbacks after confirming backend uses colon notation
   
3. **Debug logging:** `socket.onAny()` in all game pages for troubleshooting
   - **KEEP:** Useful for production debugging too (can disable in prod via env var)

4. **Client-side timer:** Using local `setInterval` for countdown
   - **RISK:** Timer drift can cause UX issues
   - **ACTION NEEDED:** Add `question_end` event listener to force timer stop

---

## 📊 Summary of Changes from SOCKET_guide.md Review

**Resolved Issues:** 4
- Question data strategy ✅
- Event name consistency ✅
- Leaderboard structure ✅
- Socket connection config ✅

**New Questions Added:** 5
- Reconnection strategy (#10)
- Host disconnect behavior (#11)
- Timer synchronization (#12)
- Live stats frequency (#13)
- Error message completeness (#14)

**Total Open Questions:** 9
- 3 Critical (red)
- 4 Clarification needed (yellow)
- 5 New from SOCKET_guide.md (yellow)

**Confidence Level:**
- Socket events: 95% ✅ (well documented in guide)
- Game flow: 90% ✅ (clear examples)
- Edge cases: 50% ⚠️ (need testing)
- Error handling: 60% ⚠️ (partial coverage)

