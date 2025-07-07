
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, Edit3, Check, X, Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
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
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    task.startDate ? new Date(task.startDate) : undefined
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(
    task.endDate ? new Date(task.endDate) : undefined
  );

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
    setTempStartDate(task.startDate ? new Date(task.startDate) : undefined);
    setTempEndDate(task.endDate ? new Date(task.endDate) : undefined);
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
      if (tempStartDate) {
        const newStartDate = format(tempStartDate, 'yyyy-MM-dd');
        if (newStartDate !== task.startDate) {
          updates.startDate = newStartDate;
        }
      }
      if (tempEndDate) {
        const newEndDate = format(tempEndDate, 'yyyy-MM-dd');
        if (newEndDate !== task.endDate) {
          updates.endDate = newEndDate;
        }
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
    setTempStartDate(task.startDate ? new Date(task.startDate) : undefined);
    setTempEndDate(task.endDate ? new Date(task.endDate) : undefined);
    setIsEditingTask(false);
  };

  const isNoContribution = task.contributionMethod === '기여없음' && task.contributionScope === '기여없음';
  const canEditTask = user?.role === 'evaluator' && onTaskUpdate;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                    <label className="text-xs text-gray-600 mb-1 block">시작일</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-xs",
                            !tempStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {tempStartDate ? format(tempStartDate, "yyyy-MM-dd") : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tempStartDate}
                          onSelect={setTempStartDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">종료일</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-xs",
                            !tempEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {tempEndDate ? format(tempEndDate, "yyyy-MM-dd") : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tempEndDate}
                          onSelect={setTempEndDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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
              <div className="space-y-2">
                <div className="relative">
                  <CardTitle className="text-base sm:text-lg">{task.title}</CardTitle>
                  {canEditTask && (
                    <button
                      onClick={handleTaskEdit}
                      className="absolute -left-6 top-1 text-gray-500 hover:text-gray-700"
                      title="과업 내용 수정"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
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
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 relative">
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
              <>
                {user?.role === 'evaluator' && (
                  <button
                    onClick={handleWeightEdit}
                    className="absolute -left-6 top-1 text-gray-500 hover:text-gray-700"
                    title="가중치 수정"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                <Badge variant="outline" className="border-orange-500 text-orange-900 bg-orange-100 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-lg font-bold">
                  <span className="hidden sm:inline">가중치 {task.weight}%</span>
                  <span className="inline sm:hidden">{task.weight}%</span>
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* Scoring Chart - Adjusted container */}
          <div className="flex flex-col min-h-[450px] sm:min-h-[500px]">
            <div className="flex-1 flex items-center justify-center">
              <ScoringChart
                selectedMethod={task.contributionMethod}
                selectedScope={task.contributionScope}
                size="medium"
                title={`과업 ${index + 1} 스코어링`}
                onMethodClick={(method) => onMethodClick(task.id, method)}
                onScopeClick={(scope) => onScopeClick(task.id, scope)}
              />
            </div>
          </div>

          {/* Score Display and Feedback Input - Adjusted container */}
          <div className="flex flex-col min-h-[450px] sm:min-h-[500px]">
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
                className="flex-1 min-h-[150px] sm:min-h-[180px] resize-none text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
