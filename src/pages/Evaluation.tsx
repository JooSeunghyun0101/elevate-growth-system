
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EvaluationHeader from '@/components/Evaluation/EvaluationHeader';
import EvaluationContent from '@/components/Evaluation/EvaluationContent';
import { useEvaluationDataDB } from '@/hooks/useEvaluationDataDB';

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    evaluationData,
    isLoading,
    handleWeightChange,
    handleMethodClick,
    handleScopeClick,
    handleFeedbackChange,
    handleTaskUpdate,
    calculateTotalScore,
    isEvaluationComplete,
    isAchieved,
    handleSave
  } = useEvaluationDataDB(id || '');

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSaveAndNavigate = async () => {
    const success = await handleSave();
    if (success) {
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  if (!user || user.role !== 'evaluator') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
          <p className="text-sm sm:text-base text-gray-600">평가자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">평가 데이터 로딩 중...</h2>
          <p className="text-sm sm:text-base text-gray-600">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">평가 데이터를 찾을 수 없습니다</h2>
          <p className="text-sm sm:text-base text-gray-600">해당 직원의 평가 데이터가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  const { exactScore, flooredScore } = calculateTotalScore();
  const achieved = isAchieved();

  return (
    <div className="min-h-screen bg-gray-50">
      <EvaluationHeader
        evaluationData={evaluationData}
        totalScore={flooredScore}
        exactScore={exactScore}
        isAchieved={achieved}
        onGoBack={handleGoBack}
        onSave={handleSaveAndNavigate}
      />

      <EvaluationContent
        evaluationData={evaluationData}
        onMethodClick={handleMethodClick}
        onScopeClick={handleScopeClick}
        onFeedbackChange={handleFeedbackChange}
        onWeightChange={handleWeightChange}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default Evaluation;
