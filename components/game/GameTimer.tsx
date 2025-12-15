import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GameTimerProps {
  duration: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeUp, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const percentage = (timeLeft / duration) * 100;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUp, isPaused]);

  const getTimerColor = () => {
    if (percentage > 50) return 'bg-game-timer-safe';
    if (percentage > 25) return 'bg-game-timer-warning';
    return 'bg-game-timer-danger';
  };

  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear',
              getTimerColor()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            'min-w-[48px] h-12 rounded-full flex items-center justify-center text-xl font-bold text-white',
            getTimerColor(),
            timeLeft <= 5 && 'animate-pulse-scale'
          )}
        >
          {timeLeft}
        </div>
      </div>
    </div>
  );
};
