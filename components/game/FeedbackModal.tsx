import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface FeedbackModalProps {
  isCorrect: boolean;
  scoreEarned: number;
  currentTotal: number;
  onContinue?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isCorrect,
  scoreEarned,
  currentTotal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div
        className={cn(
          'flex flex-col items-center p-8 rounded-3xl animate-bounce-in',
          isCorrect ? 'bg-game-correct' : 'bg-game-incorrect'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mb-4',
            'bg-white/20'
          )}
        >
          {isCorrect ? (
            <Check className="w-14 h-14 text-white" strokeWidth={4} />
          ) : (
            <X className="w-14 h-14 text-white" strokeWidth={4} />
          )}
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {isCorrect ? 'Benar!' : 'Salah!'}
        </h2>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl font-bold text-white">
            +{scoreEarned} pt
          </span>
          <span className="text-lg text-white/80">
            Total: {currentTotal} pt
          </span>
        </div>
      </div>
    </div>
  );
};
