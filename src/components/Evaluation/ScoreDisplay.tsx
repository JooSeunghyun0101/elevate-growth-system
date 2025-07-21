
import React from 'react';

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
        {/* Main Score Display - Single Line Layout */}
        <div className="grid grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Contribution Method */}
          {contributionMethod && (
            <div className="text-center flex flex-col justify-center h-20">
              <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">기여방식</div>
              <div className="text-lg sm:text-xl font-bold text-blue-900">
                {contributionMethod}
              </div>
            </div>
          )}

          {/* Contribution Scope */}
          {contributionScope && (
            <div className="text-center flex flex-col justify-center h-20">
              <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">기여범위</div>
              <div className="text-lg sm:text-xl font-bold text-green-900">
                {contributionScope}
              </div>
            </div>
          )}

          {/* Basic Score */}
          <div className="text-center flex flex-col justify-center h-20">
            <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">기본점수</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{score}점</div>
          </div>

          {/* Weighted Score */}
          <div className="text-center flex flex-col justify-center h-20">
            <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">가중치적용</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-700">
              {calculateWeightedScore(score, weight)}점
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
