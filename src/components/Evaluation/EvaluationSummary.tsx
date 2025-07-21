import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { EvaluationData } from '@/types/evaluation';

interface EvaluationSummaryProps {
  evaluationData: EvaluationData;
  totalScore: number;
  exactScore: number;
  isAchieved: boolean;
}

const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
  evaluationData,
  totalScore,
  exactScore,
  isAchieved
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAchievementHover = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleAchievementLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="col-span-2 lg:col-span-1">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold truncate">
                {evaluationData.evaluateeName} {evaluationData.evaluateePosition}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm mt-1">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{evaluationData.evaluateeDepartment}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-center flex-1">
              <p className="text-xs sm:text-sm text-gray-600">성장 레벨</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">Lv. {evaluationData.growthLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">총 평가 점수</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-500">
              {totalScore}점
              {exactScore !== totalScore && (
                <span className="text-sm text-gray-500 ml-1">
                  ({exactScore.toFixed(2)})
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`group hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer ${
          isAchieved 
            ? 'hover:border-green-200 hover:bg-green-50' 
            : 'hover:border-red-200 hover:bg-red-50'
        }`}
        onMouseEnter={handleAchievementHover}
        onMouseLeave={handleAchievementLeave}
        data-confetti-trigger={isAchieved ? 'true' : undefined}
        data-not-achieved={!isAchieved ? 'true' : undefined}
        title={isAchieved ? '클릭하여 축하 폭죽 효과를 확인하세요!' : undefined}
      >
        <CardContent className="p-3 sm:p-4 relative">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">달성 여부</p>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1">
              {isAchieved ? (
                <>
                  <div className="relative inline-block">
                    <span className={`text-2xl sm:text-3xl transition-all duration-300 ${
                      isHovered ? 'scale-125' : 'group-hover:scale-125'
                    }`}>
                      🎉
                    </span>
                  </div>
                  <span className={`text-sm sm:text-lg font-semibold transition-colors duration-300 ${
                    isHovered ? 'text-green-800' : 'text-green-700 group-hover:text-green-800'
                  }`}>달성</span>
                </>
              ) : (
                <>
                  <div className="relative inline-block">
                    <span className={`text-2xl sm:text-3xl transition-all duration-300 ${
                      isHovered ? 'scale-125' : 'group-hover:scale-125'
                    }`}>
                      😢
                    </span>
                  </div>
                  <span className={`text-sm sm:text-lg font-semibold transition-colors duration-300 ${
                    isHovered ? 'text-red-800' : 'text-red-700 group-hover:text-red-800'
                  }`}>미달성</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationSummary;
