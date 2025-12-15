import React from 'react';
import { cn } from '@/lib/utils';
import { Triangle, Square, Circle, Star } from 'lucide-react';

interface AnswerGridProps {
  options: string[];
  selectedAnswer: number | null;
  correctAnswer?: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const answerConfig = [
  {
    color: 'bg-game-red hover:bg-game-red-hover',
    selectedColor: 'bg-game-red ring-4 ring-white',
    icon: Triangle,
    label: 'A',
  },
  {
    color: 'bg-game-blue hover:bg-game-blue-hover',
    selectedColor: 'bg-game-blue ring-4 ring-white',
    icon: Square,
    label: 'B',
  },
  {
    color: 'bg-game-yellow hover:bg-game-yellow-hover',
    selectedColor: 'bg-game-yellow ring-4 ring-white',
    icon: Circle,
    label: 'C',
  },
  {
    color: 'bg-game-green hover:bg-game-green-hover',
    selectedColor: 'bg-game-green ring-4 ring-white',
    icon: Star,
    label: 'D',
  },
];

export const AnswerGrid: React.FC<AnswerGridProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  onSelect,
  disabled = false,
}) => {
  const getButtonState = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = correctAnswer === index;
    const showResult = correctAnswer !== undefined && correctAnswer !== null;

    if (showResult) {
      if (isCorrect) return 'correct';
      if (isSelected && !isCorrect) return 'incorrect';
      return 'dimmed';
    }

    return isSelected ? 'selected' : 'default';
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-6">
      {options.map((option, index) => {
        const config = answerConfig[index];
        const Icon = config.icon;
        const state = getButtonState(index);

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={cn(
              'relative flex flex-col items-center justify-center p-4 min-h-[120px] rounded-2xl transition-all duration-200 transform',
              'text-white font-semibold text-lg',
              // Default state
              state === 'default' && config.color,
              state === 'default' && !disabled && 'active:scale-95',
              // Selected state
              state === 'selected' && config.selectedColor,
              state === 'selected' && 'scale-[1.02]',
              // Correct answer
              state === 'correct' && 'bg-game-correct ring-4 ring-white animate-bounce-in',
              // Incorrect answer
              state === 'incorrect' && 'bg-game-incorrect ring-4 ring-white animate-shake',
              // Dimmed state (not selected, not correct)
              state === 'dimmed' && 'opacity-40 bg-gray-500',
              // Disabled
              disabled && 'cursor-not-allowed'
            )}
          >
            <Icon className="w-6 h-6 mb-2 fill-current" />
            <span className="text-center leading-tight break-words">
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
};
