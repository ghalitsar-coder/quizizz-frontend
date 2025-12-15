"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGameStore } from "@/stores/game-store";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { GameTimer } from "@/components/game/GameTimer";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { FeedbackModal } from "@/components/game/FeedbackModal";
import { LeaderboardOverlay } from "@/components/game/LeaderboardOverlay";
import { ReconnectingOverlay } from "@/components/game/ReconnectingOverlay";
import { toast } from "sonner";

export default function GameArenaPage() {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  // Zustand store
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const setCurrentQuestion = useGameStore((state) => state.setCurrentQuestion);
  const playerName = useGameStore((state) => state.playerName);
  const score = useGameStore((state) => state.score);
  const setScore = useGameStore((state) => state.setScore);
  const selectedAnswer = useGameStore((state) => state.selectedAnswer);
  const setSelectedAnswer = useGameStore((state) => state.setSelectedAnswer);
  const answerResult = useGameStore((state) => state.answerResult);
  const setAnswerResult = useGameStore((state) => state.setAnswerResult);
  const leaderboard = useGameStore((state) => state.leaderboard);
  const setLeaderboard = useGameStore((state) => state.setLeaderboard);
  const totalQuestions = useGameStore((state) => state.totalQuestions);
  const setTotalQuestions = useGameStore((state) => state.setTotalQuestions);

  const roomCode = params.roomCode as string;
  const answerStartTime = useRef<number>(0);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Game started event - track metadata (backend now sends quizId)
  useEffect(() => {
    if (!socket) return;

    socket.on(
      "game:started",
      (data: { questionCount: number; quizId?: string }) => {
        console.log("🎮 Game started:", data);
        setTotalQuestions(data.questionCount || 0);

        // Backend now includes quizId (per BACKEND_CHANGES_SUMMARY.md)
        if (data.quizId) {
          setQuizId(data.quizId);
          console.log("✅ Quiz ID received:", data.quizId);
        }

        // Note: Questions delivered via question_start events (socket-based approach)
      }
    );

    return () => {
      socket.off("game:started");
    };
  }, [socket, setTotalQuestions]);

  // Socket event listeners for game flow
  useEffect(() => {
    if (!socket) return;

    // Question starts (backend sends full question data via socket)
    socket.on("question_start", (data: any) => {
      console.log("📝 Question started:", data);

      setCurrentQuestion({
        qIndex: data.qIndex,
        qText: data.qText,
        imageUrl: data.imageUrl,
        options: data.options,
        duration: data.duration,
        points: data.points || 20,
      });

      setSelectedAnswer(null);
      setAnswerResult(null);
      setGameState("PLAYING");
      answerStartTime.current = Date.now();
    });

    // Answer result (private feedback)
    socket.on("answer_result", (data: any) => {
      console.log("Answer result:", data);
      setAnswerResult({
        isCorrect: data.isCorrect,
        scoreEarned: data.scoreEarned,
        currentTotal: data.currentTotal,
        correctAnswerIdx: data.correctAnswerIdx,
      });
      setScore(data.currentTotal);
      setGameState("FEEDBACK");
    });

    // Question ends (time up) - sync with server timer
    socket.on("question_end", (data: any) => {
      console.log("⏱️ Question ended (server):", data);

      // Force stop timer and disable answers (server says time is up)
      if (!answerResult) {
        setAnswerResult({
          isCorrect: false,
          scoreEarned: 0,
          currentTotal: score,
          correctAnswerIdx: data.correctAnswerIdx,
        });
        setGameState("FEEDBACK");
      }
    });

    // Leaderboard update
    socket.on("update_leaderboard", (data: any) => {
      console.log("Leaderboard updated:", data);
      const leaderboardData = data.leaderboard || data;
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);

      // Show leaderboard after short delay
      setTimeout(() => {
        setGameState("LEADERBOARD");
      }, 2000);
    });

    // Game over (PRD: game:ended event)
    socket.on("game:ended", (data: any) => {
      console.log("🏁 Game ended:", data);
      setLeaderboard(data.finalLeaderboard || []);
      setGameState("RESULT");
    });

    // Fallback untuk final_results (compatibility)
    socket.on("final_results", (data: any) => {
      console.log("🏁 Final results:", data);
      setLeaderboard(data.top3 || data.leaderboard || []);
      setGameState("RESULT");
    });

    // Error handling
    socket.on("error_message", (data: { msg: string }) => {
      console.error("❌ Socket error:", data.msg);
      toast.error(data.msg);
    });

    // Debug: log all events
    socket.onAny((eventName, ...args) => {
      console.log(`📡 [Game Arena] Event: ${eventName}`, args);
    });

    return () => {
      socket.off("question_start");
      socket.off("answer_result");
      socket.off("question_end");
      socket.off("update_leaderboard");
      socket.off("game:ended");
      socket.off("final_results");
      socket.off("error_message");
      socket.offAny();
    };
  }, [
    socket,
    setGameState,
    setCurrentQuestion,
    setAnswerResult,
    setLeaderboard,
    setSelectedAnswer,
    setScore,
    answerResult,
    score,
  ]);

  // Submit answer
  const submitAnswer = useCallback(
    (answerIdx: number) => {
      if (!socket || selectedAnswer !== null) return;

      const timeElapsed = (Date.now() - answerStartTime.current) / 1000;
      setSelectedAnswer(answerIdx);

      socket.emit("submit_answer", {
        roomCode,
        answerIdx,
        timeElapsed,
        clientTimestamp: Date.now(),
      });
    },
    [socket, roomCode, selectedAnswer, setSelectedAnswer]
  );

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (selectedAnswer === null && gameState === "PLAYING") {
      toast.warning("Waktu habis!");
    }
  }, [selectedAnswer, gameState]);

  // Rejoin room on reconnect
  useEffect(() => {
    if (isConnected && roomCode && playerName && gameState === "LOBBY") {
      socket?.emit("rejoin_room", { roomCode, nickname: playerName });
    }
  }, [isConnected, roomCode, playerName, gameState, socket]);

  // Render based on game state
  if (!isConnected) {
    return <ReconnectingOverlay />;
  }

  if (!currentQuestion && gameState === "PLAYING") {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Menunggu soal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen game-gradient flex flex-col">
      {/* Main Game Content */}
      {gameState === "PLAYING" && currentQuestion && (
        <>
          {/* Timer */}
          <GameTimer
            duration={currentQuestion.duration}
            onTimeUp={handleTimeUp}
            isPaused={selectedAnswer !== null}
          />

          {/* Question */}
          <QuestionDisplay
            questionIndex={currentQuestion.qIndex + 1}
            totalQuestions={totalQuestions}
            questionText={currentQuestion.qText}
            imageUrl={currentQuestion.imageUrl}
            points={currentQuestion.points}
          />

          {/* Answer Grid */}
          <div className="flex-1 flex items-end">
            <AnswerGrid
              options={currentQuestion.options}
              selectedAnswer={selectedAnswer}
              onSelect={submitAnswer}
              disabled={selectedAnswer !== null}
            />
          </div>
        </>
      )}

      {/* Feedback Modal */}
      {gameState === "FEEDBACK" && answerResult && (
        <FeedbackModal
          isCorrect={answerResult.isCorrect}
          scoreEarned={answerResult.scoreEarned}
          currentTotal={answerResult.currentTotal}
        />
      )}

      {/* Leaderboard Overlay */}
      {gameState === "LEADERBOARD" && (
        <LeaderboardOverlay
          leaderboard={leaderboard}
          currentUserName={playerName}
        />
      )}

      {/* Final Results */}
      {gameState === "RESULT" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Game Selesai!
            </h1>
            <div className="mb-8">
              <p className="text-white/80 text-lg mb-2">Skor Akhir Kamu:</p>
              <p className="text-6xl font-bold text-white">{score} pt</p>
            </div>

            {leaderboard.length > 0 && (
              <div className="space-y-3 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Top 3 Players
                </h3>
                {leaderboard.slice(0, 3).map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                      <span className="text-white font-semibold">
                        {player.name}
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {player.score} pt
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
