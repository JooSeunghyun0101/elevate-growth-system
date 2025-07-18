import React from 'react';
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

      <Card className="group hover:shadow-lg hover:scale-105 hover:border-green-200 transition-all duration-300 relative overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">달성 여부</p>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1">
              {isAchieved ? (
                <>
                  <div className="relative inline-block">
                    <span className="text-2xl sm:text-3xl group-hover:animate-celebration transition-all duration-300">
                      🎉
                    </span>
                    {/* 반짝이는 효과 - 5개로 증가 */}
                    <span className="absolute -top-1 -right-1 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-all duration-300" style={{ animationDelay: '0s' }}>✨</span>
                    <span className="absolute -bottom-1 -left-1 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-all duration-300" style={{ animationDelay: '0.3s' }}>⭐</span>
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-all duration-300" style={{ animationDelay: '0.6s' }}>✨</span>
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-all duration-300" style={{ animationDelay: '0.9s' }}>⭐</span>
                    <span className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-all duration-300" style={{ animationDelay: '1.2s' }}>✨</span>
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-green-700 group-hover:text-green-800 transition-colors duration-300">달성</span>
                </>
              ) : (
                <>
                  <div className="relative inline-block">
                    <span className="text-2xl sm:text-3xl group-hover:animate-sad-face transition-all duration-300">
                      😢
                    </span>
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-red-700 group-hover:text-red-800 transition-colors duration-300">미달성</span>
                  
                  {/* 눈물 애니메이션 - 카드 위쪽 바깥에서 시작 */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* 눈물 이모티콘들 - 자연스러운 떨어지는 시점으로 조정 */}
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '20%', animationDelay: '0s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '50%', animationDelay: '0.3s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '80%', animationDelay: '0.8s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '35%', animationDelay: '1.2s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '65%', animationDelay: '0.6s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '10%', animationDelay: '1.7s' }}>💧</div>
                    <div className="absolute text-xs opacity-0 group-hover:opacity-100 group-hover:animate-rain-drop" style={{ top: '-20px', left: '90%', animationDelay: '0.4s' }}>💧</div>
                  </div>
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
