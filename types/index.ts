export interface QuizQuestion {
  id: string;
  qText: string;
  imageUrl?: string;
  options: string[];
  correctAnswerIdx: number;
  duration: number;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Date;
  userId: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface Room {
  code: string;
  quizId: string;
  hostId: string;
  players: Player[];
  currentQuestionIndex: number;
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
}

export interface AnswerStats {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface QuestionStartPayload {
  qIndex: number;
  qText: string;
  imageUrl?: string;
  options: string[];
  duration: number;
  points: number;
}

export interface SubmitAnswerPayload {
  roomCode: string;
  answerIdx: number;
  timeElapsed: number;
  clientTimestamp: number;
}

export interface AnswerResultPayload {
  isCorrect: boolean;
  scoreEarned: number;
  currentTotal: number;
  correctAnswerIdx: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
}

export interface UpdateLeaderboardPayload {
  leaderboard: LeaderboardEntry[];
}

export interface FinalResultsPayload {
  winner: string;
  top3: LeaderboardEntry[];
}
