import React from 'react';
import { Loader2, Wifi } from 'lucide-react';

export const ReconnectingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in">
      <div className="flex flex-col items-center gap-4 p-6 bg-game-card rounded-2xl">
        <div className="relative">
          <Wifi className="w-12 h-12 text-white/50" />
          <Loader2 className="absolute inset-0 w-12 h-12 text-white animate-spin" />
        </div>
        <p className="text-lg font-medium text-white">
          Menghubungkan kembali...
        </p>
      </div>
    </div>
  );
};
