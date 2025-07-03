
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import ScoringChart from '@/components/ScoringChart';
import ScoreDisplay from './ScoreDisplay';
import { Task } from '@/types/evaluation';

interface TaskCardProps {
  task: Task;
  index: number;
  onMethodClick: (taskId: string, method: string) => void;
  onScopeClick: (taskId: string, scope: string) => void;
  onFeedbackChange: (taskId: string, feedback: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onMethodClick,
  onScopeClick,
  onFeedbackChange
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <p className="text-gray-600 mt-1">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-500 text-orange-900 bg-orange-100 px-4 py-2 text-lg font-bold">
              가중치 {task.weight}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Scoring Chart */}
          <div className="flex flex-col items-center justify-start">
            <ScoringChart
              selectedMethod={task.contributionMethod}
              selectedScope={task.contributionScope}
              size="medium"
              title={`과업 ${index + 1} 스코어링`}
              onMethodClick={(method) => onMethodClick(task.id, method)}
              onScopeClick={(scope) => onScopeClick(task.id, scope)}
            />
          </div>

          {/* Right: Score Display and Feedback Input */}
          <div className="flex flex-col h-full min-h-[420px]">
            {/* Score Display Section */}
            {task.score ? (
              <ScoreDisplay
                score={task.score}
                weight={task.weight}
                contributionMethod={task.contributionMethod}
                contributionScope={task.contributionScope}
              />
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-gray-500 space-y-2">
                  <Target className="w-6 h-6 mx-auto opacity-50" />
                  <p className="text-sm">기여방식과 범위를 선택하면<br />점수가 표시됩니다</p>
                </div>
              </div>
            )}

            {/* Feedback Input - Takes remaining space */}
            <div className="flex-1 flex flex-col mt-4">
              <Label htmlFor={`feedback-${task.id}`} className="text-base font-medium mb-3 block">
                피드백
              </Label>
              <Textarea
                id={`feedback-${task.id}`}
                placeholder="이 과업에 대한 구체적인 피드백을 작성해주세요..."
                value={task.feedback || ''}
                onChange={(e) => onFeedbackChange(task.id, e.target.value)}
                className="flex-1 min-h-[140px] resize-none"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
