
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EvaluationHeader from '@/components/Evaluation/EvaluationHeader';
import EvaluationContent from '@/components/Evaluation/EvaluationContent';
import { useEvaluationData } from '@/hooks/useEvaluationData';

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    evaluationData,
    handleWeightChange,
    handleMethodClick,
    handleScopeClick,
    handleFeedbackChange,
    handleTaskUpdate,
    calculateTotalScore,
    isAchieved,
    handleSave
  } = useEvaluationData(id || '');

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
