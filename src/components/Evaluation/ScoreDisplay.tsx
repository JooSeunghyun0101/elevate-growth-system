
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getContributionTooltip } from '@/utils/evaluationUtils';

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
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center flex flex-col justify-center h-20 cursor-help">
                  <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">기여방식</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#F55000' }}>{contributionMethod}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3 bg-orange-50 border-orange-200 shadow-lg">
                <p className="text-sm text-orange-900 leading-relaxed">
                  {getContributionTooltip('method', contributionMethod)}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Contribution Scope */}
          {contributionScope && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center flex flex-col justify-center h-20 cursor-help">
                  <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">기여범위</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#55474A' }}>{contributionScope}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3 bg-amber-50 border-amber-200 shadow-lg">
                <p className="text-sm text-amber-900 leading-relaxed">
                  {getContributionTooltip('scope', contributionScope)}
                </p>
              </TooltipContent>
            </Tooltip>
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
