
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import EvaluationSummary from './EvaluationSummary';
import { EvaluationData } from '@/types/evaluation';

interface EvaluationHeaderProps {
  evaluationData: EvaluationData;
  totalScore: number;
  isAchieved: boolean;
  onGoBack: () => void;
  onSave: () => void;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  evaluationData,
  totalScore,
  isAchieved,
  onGoBack,
  onSave
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGoBack}
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">성과 평가</h1>
              <p className="text-gray-600">팀원의 과업별 성과를 평가하세요</p>
            </div>
          </div>
          <Button 
            onClick={onSave}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            평가 저장
          </Button>
        </div>

        <EvaluationSummary
          evaluationData={evaluationData}
          totalScore={totalScore}
          isAchieved={isAchieved}
        />
      </div>
    </div>
  );
};

export default EvaluationHeader;
