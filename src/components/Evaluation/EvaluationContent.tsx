
import React from 'react';
import TaskCard from './TaskCard';
import { EvaluationData } from '@/types/evaluation';

interface EvaluationContentProps {
  evaluationData: EvaluationData;
  onMethodClick: (taskId: string, method: string) => void;
  onScopeClick: (taskId: string, scope: string) => void;
  onFeedbackChange: (taskId: string, feedback: string) => void;
  onWeightChange: (taskId: string, weight: number) => void;
  onTaskUpdate?: (taskId: string, updates: { title?: string; description?: string; startDate?: string; endDate?: string }) => void;
}

const EvaluationContent: React.FC<EvaluationContentProps> = ({
  evaluationData,
  onMethodClick,
  onScopeClick,
  onFeedbackChange,
  onWeightChange,
  onTaskUpdate
}) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {evaluationData.tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          onMethodClick={onMethodClick}
          onScopeClick={onScopeClick}
          onFeedbackChange={onFeedbackChange}
          onWeightChange={onWeightChange}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
};

export default EvaluationContent;
