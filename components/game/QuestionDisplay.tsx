import React from 'react';

interface QuestionDisplayProps {
  questionIndex: number;
  totalQuestions: number;
  questionText: string;
  imageUrl?: string | null;
  points: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  questionIndex,
  totalQuestions,
  questionText,
  imageUrl,
  points,
}) => {
  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      {/* Question Counter & Points */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
          Soal {questionIndex}/{totalQuestions}
        </span>
        <span className="px-3 py-1 bg-game-yellow rounded-full text-sm font-bold text-black">
          +{points} pt
        </span>
      </div>

      {/* Question Image */}
      {imageUrl && (
        <div className="w-full max-w-md mb-4">
          <img
            src={imageUrl}
            alt="Question"
            className="w-full h-auto max-h-48 object-contain rounded-xl bg-white/10"
            loading="lazy"
          />
        </div>
      )}

      {/* Question Text */}
      <div className="w-full max-w-lg">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {questionText}
        </h2>
      </div>
    </div>
  );
};
