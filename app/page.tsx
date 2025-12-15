"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi kode game
    if (!gameCode || gameCode.length < 5 || gameCode.length > 6) {
      toast.error("Kode game harus 5-6 karakter");
      return;
    }

    // Validasi alfanumerik
    if (!/^[a-zA-Z0-9]+$/.test(gameCode)) {
      toast.error("Kode game hanya boleh berisi huruf dan angka");
      return;
    }

    setIsLoading(true);

    // Redirect ke halaman lobby
    router.push(`/play/${gameCode.toUpperCase()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">Quizizz Clone</h1>
          <p className="text-white/90 text-lg">
            Join the fun! Enter game code below
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Join Game</CardTitle>
            <CardDescription>
              Masukkan kode game yang diberikan oleh guru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Game Code (e.g., ABC123)"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl font-bold tracking-wider h-14"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Joining..." : "Join Game"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Atau</p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Login as Teacher
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-white/80 text-sm">
          <p>© 2024 Quizizz Clone - Open Source Project</p>
        </div>
      </div>
    </div>
  );
}
