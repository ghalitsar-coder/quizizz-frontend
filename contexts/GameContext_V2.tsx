import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GameState = 'LOBBY' | 'PLAYING' | 'FEEDBACK' | 'LEADERBOARD' | 'RESULT';

interface Question {
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

interface LeaderboardPlayer {
  name: string;
  score: number;
  rank: number;
}

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question | null) => void;
  selectedAnswer: number | null;
  setSelectedAnswer: (answer: number | null) => void;
  answerResult: AnswerResult | null;
  setAnswerResult: (result: AnswerResult | null) => void;
  leaderboard: LeaderboardPlayer[];
  setLeaderboard: (leaderboard: LeaderboardPlayer[]) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  totalQuestions: number;
  setTotalQuestions: (total: number) => void;
  score: number;
  setScore: (score: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [score, setScore] = useState(0);

  const resetGame = useCallback(() => {
    setGameState('LOBBY');
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setLeaderboard([]);
    setScore(0);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        currentQuestion,
        setCurrentQuestion,
        selectedAnswer,
        setSelectedAnswer,
        answerResult,
        setAnswerResult,
        leaderboard,
        setLeaderboard,
        playerName,
        setPlayerName,
        totalQuestions,
        setTotalQuestions,
        score,
        setScore,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
