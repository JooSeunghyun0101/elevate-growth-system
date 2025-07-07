
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Target, Edit3, Check, X, Calendar } from 'lucide-react';
import ScoringChart from '@/components/ScoringChart';
import ScoreDisplay from './ScoreDisplay';
import { Task } from '@/types/evaluation';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCardProps {
  task: Task;
  index: number;
  onMethodClick: (taskId: string, method: string) => void;
  onScopeClick: (taskId: string, scope: string) => void;
  onFeedbackChange: (taskId: string, feedback: string) => void;
  onWeightChange: (taskId: string, weight: number) => void;
  onTaskUpdate?: (taskId: string, updates: { title?: string; description?: string; startDate?: string; endDate?: string }) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onMethodClick,
  onScopeClick,
  onFeedbackChange,
  onWeightChange,
  onTaskUpdate
}) => {
  const { user } = useAuth();
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(task.weight);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [tempTitle, setTempTitle] = useState(task.title);
  const [tempDescription, setTempDescription] = useState(task.description);
  const [tempStartDate, setTempStartDate] = useState(task.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(task.endDate || '');

  const handleWeightEdit = () => {
    setTempWeight(task.weight);
    setIsEditingWeight(true);
  };

  const handleWeightSave = () => {
    if (tempWeight >= 1 && tempWeight <= 100) {
      onWeightChange(task.id, tempWeight);
      setIsEditingWeight(false);
    }
  };

  const handleWeightCancel = () => {
    setTempWeight(task.weight);
    setIsEditingWeight(false);
  };

  const handleTaskEdit = () => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStartDate(task.startDate || '');
    setTempEndDate(task.endDate || '');
    setIsEditingTask(true);
  };

  const handleTaskSave = () => {
    if (onTaskUpdate) {
      const updates: { title?: string; description?: string; startDate?: string; endDate?: string } = {};
      
      if (tempTitle.trim() !== task.title) {
        updates.title = tempTitle.trim();
      }
      if (tempDescription.trim() !== task.description) {
        updates.description = tempDescription.trim();
      }
      if (tempStartDate !== (task.startDate || '')) {
        updates.startDate = tempStartDate;
      }
      if (tempEndDate !== (task.endDate || '')) {
        updates.endDate = tempEndDate;
      }

      if (Object.keys(updates).length > 0) {
        onTaskUpdate(task.id, updates);
      }
    }
    setIsEditingTask(false);
  };

  const handleTaskCancel = () => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStartDate(task.startDate || '');
    setTempEndDate(task.endDate || '');
    setIsEditingTask(false);
  };

  const isNoContribution = task.contributionMethod === '기여없음' && task.contributionScope === '기여없음';
  const canEditTask = user?.role === 'evaluator' && onTaskUpdate;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            {isEditingTask ? (
              <div className="space-y-3">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-base sm:text-lg font-semibold"
                  placeholder="과업명을 입력하세요"
                />
                <Textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="text-xs sm:text-sm resize-none"
                  rows={2}
                  placeholder="과업 설명을 입력하세요"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">시작일</label>
                    <Input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">종료일</label>
                    <Input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTaskSave}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTaskCancel}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{task.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                  {task.startDate && task.endDate && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {task.startDate} ~ {task.endDate}
                      </span>
                    </div>
                  )}
                </div>
                {canEditTask && (
                  <button
                    onClick={handleTaskEdit}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditingWeight ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(Number(e.target.value))}
                  className="w-12 sm:w-16 h-6 sm:h-8 text-center text-xs sm:text-sm"
                  min="1"
                  max="100"
                />
                <span className="text-xs sm:text-sm">%</span>
                <button
                  onClick={handleWeightSave}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleWeightCancel}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="border-orange-500 text-orange-900 bg-orange-100 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-lg font-bold">
                  <span className="hidden sm:inline">가중치 {task.weight}%</span>
                  <span className="inline sm:hidden">{task.weight}%</span>
                </Badge>
                {user?.role === 'evaluator' && (
                  <button
                    onClick={handleWeightEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Scoring Chart */}
          <div className="flex flex-col items-center justify-start w-full">
            <ScoringChart
              selectedMethod={task.contributionMethod}
              selectedScope={task.contributionScope}
              size="small"
              title={`과업 ${index + 1} 스코어링`}
              onMethodClick={(method) => onMethodClick(task.id, method)}
              onScopeClick={(scope) => onScopeClick(task.id, scope)}
            />
          </div>

          {/* Score Display and Feedback Input */}
          <div className="flex flex-col w-full min-h-[300px] sm:min-h-[420px]">
            {/* Score Display Section */}
            {task.score !== undefined || isNoContribution ? (
              <ScoreDisplay
                score={isNoContribution ? 0 : task.score!}
                weight={task.weight}
                contributionMethod={task.contributionMethod}
                contributionScope={task.contributionScope}
              />
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6 text-center">
                <div className="text-gray-500 space-y-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto opacity-50" />
                  <p className="text-xs sm:text-sm">기여방식과 범위를 선택하면<br />점수가 표시됩니다</p>
                </div>
              </div>
            )}

            {/* Feedback Input - Takes remaining space */}
            <div className="flex-1 flex flex-col mt-3 sm:mt-4">
              <Label htmlFor={`feedback-${task.id}`} className="text-sm sm:text-base font-bold mb-2 sm:mb-3 block text-amber-800">
                피드백
              </Label>
              <Textarea
                id={`feedback-${task.id}`}
                placeholder="이 과업에 대한 구체적인 피드백을 작성해주세요..."
                value={task.feedback || ''}
                onChange={(e) => onFeedbackChange(task.id, e.target.value)}
                className="flex-1 min-h-[120px] sm:min-h-[160px] resize-none text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
