"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type GameState = "LOBBY" | "PLAYING" | "RESULT" | "ENDED";

interface QuestionData {
  qIndex: number;
  qText: string;
  imageUrl?: string;
  options: string[];
  duration: number;
  points: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
}

interface GameContextType {
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

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;

  // Reset
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>("LOBBY");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const resetGame = () => {
    setGameState("LOBBY");
    setRoomCode("");
    setPlayerName("");
    setPlayerScore(0);
    setPlayerRank(0);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsCorrect(null);
    setScoreEarned(0);
    setLeaderboard([]);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        roomCode,
        setRoomCode,
        playerName,
        setPlayerName,
        playerScore,
        setPlayerScore,
        playerRank,
        setPlayerRank,
        currentQuestion,
        setCurrentQuestion,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        selectedAnswer,
        setSelectedAnswer,
        hasAnswered,
        setHasAnswered,
        isCorrect,
        setIsCorrect,
        scoreEarned,
        setScoreEarned,
        leaderboard,
        setLeaderboard,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
