"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGame } from "@/contexts/GameContext";
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
  const { setRoomCode, playerName, setPlayerName, setGameState } = useGame();

  const [localNickname, setLocalNickname] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const currentRoomCode = params.roomCode as string;

  useEffect(() => {
    if (currentRoomCode) {
      setRoomCode(currentRoomCode);
    }
  }, [currentRoomCode, setRoomCode]);

  useEffect(() => {
    if (!socket) return;

    // Listen for successful join
    socket.on("player_joined_success", (data: { status: string }) => {
      console.log("Successfully joined room:", data);
      setHasJoined(true);
      setIsJoining(false);
      setPlayerName(localNickname);
      toast.success("Berhasil bergabung ke room!");
    });

    // Listen for game start
    socket.on("game_started", () => {
      console.log("Game is starting...");
      setGameState("PLAYING");
      router.push(`/play/${currentRoomCode}/live`);
    });

    // Listen for errors
    socket.on("error_message", (data: { msg: string }) => {
      toast.error(data.msg);
      setIsJoining(false);

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

    return () => {
      socket.off("player_joined_success");
      socket.off("game_started");
      socket.off("error_message");
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
