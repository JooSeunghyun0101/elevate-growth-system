
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
    return ((score * weight) / 100).toFixed(1);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Main Score Display - Horizontal Layout */}
        <div className="flex items-center justify-center gap-8">
          {/* Basic Score and Weighted Score in same row */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-700 text-sm font-medium mb-2">
                <Target className="w-4 h-4" />
                <span>기본 점수</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{score}점</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium mb-2">
                <Star className="w-4 h-4" />
                <span>가중치 적용</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                {calculateWeightedScore(score, weight)}점
              </div>
            </div>
          </div>
        </div>

        {/* Method and Scope Info */}
        {contributionMethod && contributionScope && (
          <div className="pt-3 border-t border-orange-200/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-1">기여방식</p>
                <p className="text-gray-800 font-semibold bg-white/60 rounded-lg py-1 px-2">
                  {contributionMethod}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-1">기여범위</p>
                <p className="text-gray-800 font-semibold bg-white/60 rounded-lg py-1 px-2">
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
