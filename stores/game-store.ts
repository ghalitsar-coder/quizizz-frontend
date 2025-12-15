import { create } from 'zustand';

type GameState = 'LOBBY' | 'PLAYING' | 'FEEDBACK' | 'LEADERBOARD' | 'RESULT' | 'ENDED';

interface QuestionData {
  qIndex: number;
  qText: string;
  imageUrl?: string | null;
  options: string[];
  duration: number;
  points: number;
}

interface AnswerResult {
  isCorrect: boolean;
  scoreEarned: number;
  currentTotal: number;
  correctAnswerIdx: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
}

interface GameStore {
  // Game state
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Room info
  roomCode: string;
  setRoomCode: (code: string) => void;

  // Player info
  playerName: string;
  setPlayerName: (name: string) => void;
  playerScore: number;
  setPlayerScore: (score: number) => void;
  playerRank: number;
  setPlayerRank: (rank: number) => void;

  // Current question
  currentQuestion: QuestionData | null;
  setCurrentQuestion: (question: QuestionData | null) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;

  // Answer state
  selectedAnswer: number | null;
  setSelectedAnswer: (answer: number | null) => void;
  hasAnswered: boolean;
  setHasAnswered: (answered: boolean) => void;
  isCorrect: boolean | null;
  setIsCorrect: (correct: boolean | null) => void;
  scoreEarned: number;
  setScoreEarned: (score: number) => void;

  // Answer result (V2 addition)
  answerResult: AnswerResult | null;
  setAnswerResult: (result: AnswerResult | null) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;

  // Total questions (V2 addition)
  totalQuestions: number;
  setTotalQuestions: (total: number) => void;

  // Score alias (V2 uses 'score' instead of 'playerScore')
  score: number;
  setScore: (score: number) => void;

  // Reset
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  gameState: 'LOBBY',
  roomCode: '',
  playerName: '',
  playerScore: 0,
  playerRank: 0,
  currentQuestion: null,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  hasAnswered: false,
  isCorrect: null,
  scoreEarned: 0,
  leaderboard: [],
  answerResult: null,
  totalQuestions: 10,
  score: 0,

  // Actions
  setGameState: (gameState) => set({ gameState }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayerName: (playerName) => set({ playerName }),
  setPlayerScore: (playerScore) => set({ playerScore, score: playerScore }),
  setPlayerRank: (playerRank) => set({ playerRank }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setSelectedAnswer: (selectedAnswer) => set({ selectedAnswer }),
  setHasAnswered: (hasAnswered) => set({ hasAnswered }),
  setIsCorrect: (isCorrect) => set({ isCorrect }),
  setScoreEarned: (scoreEarned) => set({ scoreEarned }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setAnswerResult: (answerResult) => set({ answerResult }),
  setTotalQuestions: (totalQuestions) => set({ totalQuestions }),
  setScore: (score) => set({ score, playerScore: score }),

  resetGame: () =>
    set({
      gameState: 'LOBBY',
      roomCode: '',
      playerName: '',
      playerScore: 0,
      playerRank: 0,
      currentQuestion: null,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      hasAnswered: false,
      isCorrect: null,
      scoreEarned: 0,
      leaderboard: [],
      answerResult: null,
      score: 0,
    }),
}));
