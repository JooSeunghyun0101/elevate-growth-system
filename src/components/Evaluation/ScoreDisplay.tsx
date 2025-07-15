
import React from 'react';
import { Target, Star } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  weight: number;
  contributionMethod?: string;
  contributionScope?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  weight,
  contributionMethod,
  contributionScope
}) => {
  const calculateWeightedScore = (score: number, weight: number) => {
    return ((score * weight) / 100).toFixed(2);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4 sm:p-6 shadow-sm">
      <div className="space-y-3 sm:space-y-4">
        {/* Main Score Display - Responsive Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Basic Score and Weighted Score */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">기본 점수</span>
                <span className="inline sm:hidden">기본</span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-orange-600">{score}점</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">가중치 적용</span>
                <span className="inline sm:hidden">가중치</span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-orange-700">
                {calculateWeightedScore(score, weight)}점
              </div>
            </div>
          </div>
        </div>

        {/* Method and Scope Info */}
        {contributionMethod && contributionScope && (
          <div className="pt-2 sm:pt-3 border-t border-orange-200/50">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-1">기여방식</p>
                <p className="text-gray-800 font-semibold bg-white/60 rounded-lg py-1 px-1 sm:px-2 truncate">
                  {contributionMethod}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-1">기여범위</p>
                <p className="text-gray-800 font-semibold bg-white/60 rounded-lg py-1 px-1 sm:px-2 truncate">
                  {contributionScope}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;
