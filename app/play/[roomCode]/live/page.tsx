"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGame } from "@/contexts/GameContext";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type {
  QuestionStartPayload,
  AnswerResultPayload,
  UpdateLeaderboardPayload,
} from "@/types";

const ANSWER_COLORS = [
  {
    bg: "bg-red-500 hover:bg-red-600",
    text: "text-white",
    border: "border-red-600",
  },
  {
    bg: "bg-blue-500 hover:bg-blue-600",
    text: "text-white",
    border: "border-blue-600",
  },
  {
    bg: "bg-yellow-500 hover:bg-yellow-600",
    text: "text-white",
    border: "border-yellow-600",
  },
  {
    bg: "bg-green-500 hover:bg-green-600",
    text: "text-white",
    border: "border-green-600",
  },
];

const ANSWER_LABELS = ["A", "B", "C", "D"];

export default function GameArenaPage() {
  const params = useParams();
  const router = useRouter();
  const { socket } = useSocket();
  const {
    currentQuestion,
    setCurrentQuestion,
    playerName,
    playerScore,
    setPlayerScore,
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
    setPlayerRank,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const roomCode = params.roomCode as string;

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || hasAnswered) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, hasAnswered]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Question starts
    socket.on("question_start", (data: QuestionStartPayload) => {
      console.log("Question started:", data);
      setCurrentQuestion({
        qIndex: data.qIndex,
        qText: data.qText,
        imageUrl: data.imageUrl,
        options: data.options,
        duration: data.duration,
        points: data.points,
      });
      setTimeLeft(data.duration);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setIsCorrect(null);
      setShowFeedback(false);
      setShowLeaderboard(false);
      setAnswerStartTime(Date.now());
    });

    // Answer result (private)
    socket.on("answer_result", (data: AnswerResultPayload) => {
      console.log("Answer result:", data);
      setIsCorrect(data.isCorrect);
      setScoreEarned(data.scoreEarned);
      setPlayerScore(data.currentTotal);
      setShowFeedback(true);
    });

    // Question end
    socket.on("question_end", (data: { correctAnswerIdx: number }) => {
      console.log("Question ended. Correct answer:", data.correctAnswerIdx);
      // Show correct answer
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    });

    // Leaderboard update
    socket.on("update_leaderboard", (data: UpdateLeaderboardPayload) => {
      console.log("Leaderboard updated:", data);
      setLeaderboard(data.leaderboard);

      // Find player rank
      const playerIndex = data.leaderboard.findIndex(
        (p) => p.name === playerName
      );
      if (playerIndex !== -1) {
        setPlayerRank(playerIndex + 1);
      }

      setShowLeaderboard(true);

      // Hide leaderboard after 5 seconds
      setTimeout(() => {
        setShowLeaderboard(false);
      }, 5000);
    });

    // Game over
    socket.on("game_over", () => {
      console.log("Game ended");
      toast.success("Game selesai!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    });

    return () => {
      socket.off("question_start");
      socket.off("answer_result");
      socket.off("question_end");
      socket.off("update_leaderboard");
      socket.off("game_over");
    };
  }, [
    socket,
    playerName,
    router,
    setCurrentQuestion,
    setPlayerScore,
    setIsCorrect,
    setScoreEarned,
    setLeaderboard,
    setPlayerRank,
    setSelectedAnswer,
    setHasAnswered,
  ]);

  const handleSelectAnswer = (answerIdx: number) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedAnswer(answerIdx);
    setHasAnswered(true);

    const now = Date.now();
    const timeElapsed = (now - answerStartTime) / 1000;

    // Emit answer to server
    socket?.emit("submit_answer", {
      roomCode,
      answerIdx,
      timeElapsed,
      clientTimestamp: now,
    });
  };

  const renderLeaderboardTop5 = () => {
    const top5 = leaderboard.slice(0, 5);
    const playerIndex = leaderboard.findIndex((p) => p.name === playerName);
    const playerRank = playerIndex + 1;

    return (
      <div className="space-y-2">
        {top5.map((player, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.name === playerName
                ? "bg-primary/20 border-2 border-primary"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : idx === 1
                    ? "bg-gray-300 text-gray-900"
                    : idx === 2
                    ? "bg-orange-400 text-orange-900"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {idx + 1}
              </div>
              <span className="font-semibold">{player.name}</span>
            </div>
            <span className="font-bold">{player.score} pts</span>
          </div>
        ))}

        {/* Show current player if not in top 5 */}
        {playerRank > 5 && (
          <>
            <div className="text-center text-muted-foreground py-2">...</div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/20 border-2 border-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gray-200 text-gray-700">
                  {playerRank}
                </div>
                <span className="font-semibold">{playerName}</span>
              </div>
              <span className="font-bold">
                {leaderboard[playerIndex].score} pts
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Menunggu soal berikutnya...
          </h2>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  const progressPercentage = (timeLeft / currentQuestion.duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-4">
      <div className="max-w-4xl mx-auto py-4">
        {/* Header - Question Info */}
        <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestion.qIndex}
            </span>
            <span className="text-sm font-medium">
              {playerName} - {playerScore} pts
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="text-center mt-2 text-2xl font-bold">{timeLeft}s</div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            {currentQuestion.qText}
          </h2>

          {currentQuestion.imageUrl && (
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src={currentQuestion.imageUrl}
                alt="Question image"
                fill
                className="object-contain"
              />
            </div>
          )}
        </Card>

        {/* Answer Options - Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => (
            <Button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              disabled={hasAnswered}
              className={`h-24 md:h-32 text-lg md:text-xl font-bold transition-all ${
                ANSWER_COLORS[idx].bg
              } ${selectedAnswer === idx ? "ring-4 ring-white scale-105" : ""}`}
            >
              <span className="mr-2">{ANSWER_LABELS[idx]}.</span>
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isCorrect ? (
                <div className="flex flex-col items-center gap-2 text-green-600">
                  <CheckCircle className="h-16 w-16" />
                  <span className="text-2xl">Benar!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-red-600">
                  <XCircle className="h-16 w-16" />
                  <span className="text-2xl">Salah!</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">
              {isCorrect ? `+${scoreEarned}` : "+0"} pts
            </p>
            <p className="text-muted-foreground">
              Total Skor: {playerScore} pts
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl">Leaderboard</span>
            </DialogTitle>
          </DialogHeader>
          {renderLeaderboardTop5()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
