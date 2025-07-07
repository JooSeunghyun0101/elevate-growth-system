
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import EvaluationSummary from './EvaluationSummary';
import { EvaluationData } from '@/types/evaluation';

interface EvaluationHeaderProps {
  evaluationData: EvaluationData;
  totalScore: number;
  exactScore: number;
  isAchieved: boolean;
  onGoBack: () => void;
  onSave: () => void;
}

const EvaluationHeader: React.FC<EvaluationHeaderProps> = ({
  evaluationData,
  totalScore,
  exactScore,
  isAchieved,
  onGoBack,
  onSave
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGoBack}
              className="border-orange-500 text-orange-500 hover:bg-orange-50 px-2 sm:px-3"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">뒤로 가기</span>
              <span className="inline sm:hidden">뒤로</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                <span className="hidden sm:inline">성과 평가</span>
                <span className="inline sm:hidden">평가</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <span className="hidden sm:inline">팀원의 과업별 성과를 평가하세요</span>
                <span className="inline sm:hidden">과업별 성과 평가</span>
              </p>
            </div>
          </div>
          <Button 
            onClick={onSave}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">평가 저장</span>
            <span className="inline sm:hidden">저장</span>
          </Button>
        </div>

        <EvaluationSummary
          evaluationData={evaluationData}
          totalScore={totalScore}
          exactScore={exactScore}
          isAchieved={isAchieved}
        />
      </div>
    </div>
  );
};

export default EvaluationHeader;
