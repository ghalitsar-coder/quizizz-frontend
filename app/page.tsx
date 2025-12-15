"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");

  const handleJoin = () => {
    if (!gameCode || gameCode.trim().length < 5) {
      toast.error("Kode game harus minimal 5 karakter");
      return;
    }

    // Validasi alfanumerik
    if (!/^[a-zA-Z0-9]+$/.test(gameCode)) {
      toast.error("Kode game hanya boleh berisi huruf dan angka");
      return;
    }

    router.push(`/play/${gameCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center p-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <Gamepad2 className="w-12 h-12 text-white" />
        <h1 className="text-4xl md:text-5xl font-bold text-white">Quizizz Clone</h1>
      </div>

      {/* Join Game Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4 shadow-2xl animate-slide-up">
        <h2 className="text-xl font-semibold text-white text-center">
          Masuk ke Game
        </h2>
        
        <Input
          type="text"
          placeholder="Masukkan Kode Game"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          maxLength={6}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="text-center text-2xl font-bold h-14 bg-white border-none placeholder:text-gray-400 text-gray-900"
        />
        
        <Button
          onClick={handleJoin}
          disabled={gameCode.trim().length < 5}
          className="w-full h-14 text-lg font-bold bg-game-green hover:bg-game-green-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Game
        </Button>
      </div>

      {/* Teacher Login Link */}
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm mb-2">
          Guru?{" "}
          <Link href="/login" className="text-white underline hover:text-white/90">
            Login di sini
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-white/50 text-xs">
        <p>© 2024 Quizizz Clone - Interactive Quiz Game</p>
      </div>
    </div>
  );
}
