"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const setRoomCode = useGameStore((state) => state.setRoomCode);
  const playerName = useGameStore((state) => state.playerName);
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const setGameState = useGameStore((state) => state.setGameState);

  const [localNickname, setLocalNickname] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(0);

  const currentRoomCode = params.roomCode as string;

  useEffect(() => {
    if (currentRoomCode) {
      setRoomCode(currentRoomCode);
    }
  }, [currentRoomCode, setRoomCode]);

  useEffect(() => {
    if (!socket) return;

    // Listen for successful join
    socket.on(
      "player_joined_success",
      (data: {
        status: string;
        quizTitle?: string;
        questionCount?: number;
      }) => {
        console.log("✅ Successfully joined room:", data);
        setHasJoined(true);
        setIsJoining(false);
        setPlayerName(localNickname);

        // Store quiz metadata (backend updated payload)
        if (data.quizTitle) setQuizTitle(data.quizTitle);
        if (data.questionCount) setQuestionCount(data.questionCount);

        toast.success("Berhasil bergabung ke room!");
      }
    );

    // Listen for game start (sesuai PRD_BACKEND.md: event name = "game:started")
    const handleGameStart = (data?: any) => {
      console.log("🎮 Game is starting...", data);
      setGameState("PLAYING");
      router.push(`/play/${currentRoomCode}/live`);
      toast.success("Game dimulai!");
    };

    socket.on("game:started", handleGameStart); // Event name dari PRD
    socket.on("game_started", handleGameStart); // Fallback untuk compatibility
    socket.on("start_game", handleGameStart); // Alternative

    // Listen for errors
    socket.on("error_message", (data: { msg: string }) => {
      console.error("❌ Socket error:", data.msg);
      toast.error(data.msg);
      setIsJoining(false);

      // Handle specific errors
      if (data.msg === "Host disconnected") {
        toast.error("Host terputus. Game berakhir.");
        setTimeout(() => {
          router.push("/");
        }, 5000);
        return;
      }

      // If room not found, redirect back
      if (
        data.msg.includes("tidak ditemukan") ||
        data.msg.includes("not found")
      ) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });

    // Debug: listen to all events
    socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event received: ${eventName}`, args);
    });

    return () => {
      socket.off("player_joined_success");
      socket.off("game:started", handleGameStart);
      socket.off("game_started", handleGameStart);
      socket.off("start_game", handleGameStart);
      socket.off("error_message");
      socket.offAny();
    };
  }, [
    socket,
    currentRoomCode,
    router,
    localNickname,
    setPlayerName,
    setGameState,
  ]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localNickname.trim()) {
      toast.error("Masukkan nickname Anda");
      return;
    }

    if (localNickname.length < 2 || localNickname.length > 20) {
      toast.error("Nickname harus 2-20 karakter");
      return;
    }

    if (!socket || !isConnected) {
      toast.error("Belum terhubung ke server. Tunggu sebentar...");
      return;
    }

    setIsJoining(true);

    // Emit join_room event
    socket.emit("join_room", {
      roomCode: currentRoomCode,
      nickname: localNickname.trim(),
    });
  };

  // Show nickname form if not yet joined
  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Join Game</CardTitle>
            <CardDescription>
              Room Code:{" "}
              <span className="font-bold text-lg">{currentRoomCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Nickname</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={localNickname}
                  onChange={(e) => setLocalNickname(e.target.value)}
                  className="text-lg h-12"
                  maxLength={20}
                  autoFocus
                  disabled={isJoining}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isJoining || !isConnected}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>

              {!isConnected && (
                <p className="text-sm text-center text-amber-600">
                  Menghubungkan ke server...
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show waiting room after joined
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Waiting for Host</CardTitle>
          <CardDescription className="text-base">
            Room Code:{" "}
            <span className="font-bold text-xl">{currentRoomCode}</span>
          </CardDescription>
          {quizTitle && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Quiz:
              </p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {quizTitle}
              </p>
              {questionCount > 0 && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  {questionCount} pertanyaan
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Info */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <p className="font-semibold text-green-700 dark:text-green-400">
                You&apos;re connected!
              </p>
            </div>
            <p className="text-lg font-bold">{playerName}</p>
          </div>

          {/* Loading Animation */}
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground animate-pulse">
              Menunggu host memulai game...
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm text-center">
            <p className="text-blue-700 dark:text-blue-400">
              💡 Tip: Siapkan diri Anda! Game akan segera dimulai oleh guru.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
