
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="grid md:grid-cols-5 gap-4">
      <Card className="col-span-3">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {evaluationData.evaluateeName} {evaluationData.evaluateePosition}
              </h2>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{evaluationData.evaluateeDepartment}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">성장 레벨</p>
                  <p className="text-lg font-semibold text-blue-600">Lv. {evaluationData.growthLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">총 평가 점수</p>
            <p className="text-lg font-bold text-orange-500">{totalScore}점</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">달성 여부</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              {isAchieved ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold text-green-700">달성</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-lg font-semibold text-red-700">미달성</span>
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
