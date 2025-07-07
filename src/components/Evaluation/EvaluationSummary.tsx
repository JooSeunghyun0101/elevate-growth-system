
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { EvaluationData } from '@/types/evaluation';

interface EvaluationSummaryProps {
  evaluationData: EvaluationData;
  totalScore: number;
  isAchieved: boolean;
}

const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
  evaluationData,
  totalScore,
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
            <p className="text-lg sm:text-2xl font-bold text-orange-500">{totalScore}점</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">달성 여부</p>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1">
              {isAchieved ? (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-lg font-semibold text-green-700">달성</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <span className="text-sm sm:text-lg font-semibold text-red-700">미달성</span>
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
