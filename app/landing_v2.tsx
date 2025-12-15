import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');

  const handleJoin = () => {
    if (gameCode.trim().length >= 5) {
      navigate(`/play/${gameCode.trim().toUpperCase()}/live`);
    }
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center p-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 mb-8">
        <Gamepad2 className="w-12 h-12 text-white" />
        <h1 className="text-4xl font-bold text-white">Quizizz</h1>
      </div>

      {/* Join Game Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white text-center">
          Masuk ke Game
        </h2>
        
        <Input
          type="text"
          placeholder="Masukkan Kode Game"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="text-center text-2xl font-bold h-14 bg-white border-none placeholder:text-gray-400 text-gray-900"
        />
        
        <Button
          onClick={handleJoin}
          disabled={gameCode.trim().length < 5}
          className="w-full h-14 text-lg font-bold bg-game-green hover:bg-game-green-hover text-white"
        >
          Join Game
        </Button>
      </div>

      {/* Demo Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/demo')}
        className="mt-6 text-white/80 hover:text-white hover:bg-white/10"
      >
        🎮 Lihat Demo
      </Button>

      {/* Teacher Login Link */}
      <p className="mt-8 text-white/60 text-sm">
        Guru? <span className="text-white underline cursor-pointer">Login di sini</span>
      </p>
    </div>
  );
};

export default Index;
