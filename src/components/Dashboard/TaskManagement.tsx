
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, Trash2, Save, Calendar as CalendarIcon } from 'lucide-react';
import { EvaluationData, Task } from '@/types/evaluation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContextDB';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { taskService, evaluationService, notificationService } from '@/lib/services';
import { supabase } from '@/lib/supabase';

interface TaskManagementProps {
  evaluationData: EvaluationData;
  onClose: () => void;
  onSave: (updatedData: EvaluationData) => void;
}

// Employee mapping - evaluator to evaluatees
const evaluatorMapping: Record<string, Array<{id: string, name: string, position: string, department: string, growthLevel: number}>> = {
  'H0908033': [ // 박판근
    { id: 'H1310172', name: '이수한', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1411166', name: '주승현', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1911042', name: '김민선', position: '대리', department: '인사기획팀', growthLevel: 2 }
  ],
  'H1310159': [ // 김남엽
    { id: 'H1411231', name: '최은송', position: '차장', department: '인사팀', growthLevel: 3 },
    { id: 'H1205006', name: '황정원', position: '대리', department: '인사팀', growthLevel: 2 },
    { id: 'H2301040', name: '김민영', position: '사원', department: '인사팀', growthLevel: 1 },
    { id: 'H1501077', name: '조혜인', position: '대리', department: '인사팀', growthLevel: 2 }
  ],
  'H0807021': [ // 박준형
    { id: 'H0908033', name: '박판근', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1310159', name: '김남엽', position: '차장', department: '인사팀', growthLevel: 3 }
  ]
};

const TaskManagement: React.FC<TaskManagementProps> = ({
  evaluationData,
  onClose,
  onSave
}) => {
  console.log('🎯 TaskManagement 컴포넌트 렌더링됨', { evaluateeName: evaluationData?.evaluateeName, tasksCount: evaluationData?.tasks?.length });
  
  const [tasks, setTasks] = useState<Task[]>(evaluationData.tasks);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);

  // Function to find evaluator for a specific evaluatee
  const findEvaluatorForEvaluatee = (evaluateeId: string): string | null => {
    for (const [evaluatorId, evaluatees] of Object.entries(evaluatorMapping)) {
      if (evaluatees.some(e => e.id === evaluateeId)) {
        return evaluatorId;
      }
    }
    return null;
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      weight: 0,
      lastModified: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask.id);
  };

  const deleteTask = (taskId: string) => {
    console.log('🚀 deleteTask 함수 시작 (로컬만):', { taskId });
    
    // 로컬 상태에서만 제거 (DB는 저장 시에 처리)
    setTasks(prev => {
      const filtered = prev.filter(task => task.id !== taskId);
      console.log('🔄 로컬 상태 업데이트:', { 이전개수: prev.length, 이후개수: filtered.length });
      return filtered;
    });
    setEditingTask(null);
    
    console.log('✅ deleteTask 함수 완료 (로컬만)');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { 
        ...task, 
        ...updates,
        lastModified: new Date().toISOString()
      } : task
    ));
  };

  const handleSave = async () => {
    // Find original tasks to preserve evaluation data
    const originalTasksMap = new Map(evaluationData.tasks.map(task => [task.id, task]));
    
    // Check for content changes in existing tasks (title, description, weight, dates)
    const hasTaskContentChanges = tasks.some(task => {
      const original = originalTasksMap.get(task.id);
      if (!original) return false; // New task, not a content change
      return (
        original.title !== task.title || 
        original.description !== task.description || 
        original.weight !== task.weight ||
        original.startDate !== task.startDate ||
        original.endDate !== task.endDate
      );
    });

    // Check for structural changes (added/removed tasks)
    const hasStructuralChanges = tasks.length !== evaluationData.tasks.length ||
      tasks.some(task => !originalTasksMap.has(task.id));

    // Preserve existing evaluation data for unchanged tasks
    const updatedTasks = tasks.map(task => {
      const originalTask = originalTasksMap.get(task.id);
      if (originalTask) {
        // Keep existing evaluation data if task exists
        return {
          ...task,
          score: originalTask.score,
          contributionMethod: originalTask.contributionMethod,
          contributionScope: originalTask.contributionScope,
          feedback: originalTask.feedback,
          feedbackDate: originalTask.feedbackDate,
          feedbackHistory: originalTask.feedbackHistory
        };
      } else {
        // New task - no evaluation data
        return task;
      }
    });

    // Determine evaluation status
    const completedTasks = updatedTasks.filter(task => task.score !== undefined).length;
    let evaluationStatus: 'in-progress' | 'completed' = evaluationData.evaluationStatus;
    
    // If there are content changes to existing evaluated tasks, OR structural changes,
    // and the evaluation was previously completed, reset to in-progress
    if ((hasTaskContentChanges || hasStructuralChanges)) {
      if (evaluationData.evaluationStatus === 'completed') {
        evaluationStatus = 'in-progress';
      }
    }
    
    // If all tasks are completed and no changes were made, keep as completed
    if (completedTasks === updatedTasks.length && !hasTaskContentChanges && !hasStructuralChanges) {
      evaluationStatus = 'completed';
    }

    const updatedData: EvaluationData = {
      ...evaluationData,
      tasks: updatedTasks,
      evaluationStatus,
      lastModified: new Date().toISOString()
    };
    
    console.log('Task management save:', {
      hasTaskContentChanges,
      hasStructuralChanges,
      completedTasks,
      totalTasks: updatedTasks.length,
      newStatus: evaluationStatus,
      originalStatus: evaluationData.evaluationStatus,
      changedTasks: tasks.filter(task => {
        const original = originalTasksMap.get(task.id);
        return original && (
          original.title !== task.title || 
          original.description !== task.description || 
          original.weight !== task.weight ||
          original.startDate !== task.startDate ||
          original.endDate !== task.endDate
        );
      }).map(t => ({ id: t.id, title: t.title }))
    });



    // 데이터베이스에 저장
    try {
      console.log('💾 과업 관리 저장 시작...');
      
      // 1. 평가 정보 조회
      const evaluation = await evaluationService.getEvaluationByEmployeeId(evaluationData.evaluateeId);
      if (!evaluation) {
        throw new Error('평가 정보를 찾을 수 없습니다.');
      }

      // 2. 기존 과업들 조회
      const existingTasks = await taskService.getTasksByEvaluationId(evaluation.id);
      console.log(`🔍 저장 시 기존 과업 조회:`, {
        count: existingTasks.length,
        tasks: existingTasks.map((t: any) => ({ task_id: t.task_id, title: t.title, deleted_at: t.deleted_at }))
      });
      
      const existingTasksMap = new Map(existingTasks.map((task: any) => [task.task_id, task]));
      
      console.log(`📋 저장할 과업들:`, {
        count: updatedTasks.length,
        tasks: updatedTasks.map(t => ({ id: t.id, title: t.title }))
      });

      // 3. 과업별로 업데이트 또는 생성
      // 이번 저장 과정에서 생성될 새 과업들의 task_id를 미리 계산
      let nextTaskNumber = 1;
      
      // 기존 과업들의 번호를 수집하여 다음 번호 계산
      const existingTaskNumbers = existingTasks
        .map((t: any) => t.task_id)
        .filter((id: string) => id.startsWith(evaluationData.evaluateeId))
        .map((id: string) => {
          const match = id.match(new RegExp(`^${evaluationData.evaluateeId}_T(\\d+)$`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0)
        .sort((a: number, b: number) => b - a);
      
      if (existingTaskNumbers.length > 0) {
        nextTaskNumber = existingTaskNumbers[0] + 1;
      }
      
      console.log('🔍 기존 과업 번호들:', existingTaskNumbers);
      console.log('🆔 다음 과업 번호 시작:', nextTaskNumber);
      
      for (const task of updatedTasks) {
        const existingTask = existingTasksMap.get(task.id) as any;
        
        if (existingTask) {
          // 기존 과업 업데이트 - task_id 보존
          await taskService.updateTask(existingTask.id, {
            title: task.title,
            description: task.description || null,
            weight: task.weight,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            contribution_method: task.contributionMethod || null,
            contribution_scope: task.contributionScope || null,
            score: task.score || null,
            feedback: task.feedback || null,
            feedback_date: task.feedbackDate || null,
            evaluator_name: task.evaluatorName || null
          });
          console.log(`✅ 기존 과업 업데이트: ${existingTask.task_id} - ${task.title}`);
        } else {
          // 새 과업 생성 - 순차적인 task_id 생성
          const newTaskId = `${evaluationData.evaluateeId}_T${nextTaskNumber}`;
          console.log(`🆔 새 task_id 할당: ${newTaskId} (번호: ${nextTaskNumber})`);
          
          await taskService.createTask({
            task_id: newTaskId,
            evaluation_id: evaluation.id,
            title: task.title,
            description: task.description || null,
            weight: task.weight,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            contribution_method: task.contributionMethod || null,
            contribution_scope: task.contributionScope || null,
            score: task.score || null,
            feedback: task.feedback || null,
            feedback_date: task.feedbackDate || null,
            evaluator_name: task.evaluatorName || null
          });
          console.log(`✅ 새 과업 생성: ${newTaskId} - ${task.title}`);
          
          // 다음 번호로 증가
          nextTaskNumber++;
        }
      }

      // 4. 삭제된 과업들 처리 - 저장 시 DB에 반영
      const updatedTaskIds = new Set(updatedTasks.map(task => task.id));
      const deletedTasks = existingTasks.filter(task => !updatedTaskIds.has(task.task_id));
      
      console.log('🗑️ 삭제할 과업들:', {
        count: deletedTasks.length,
        tasks: deletedTasks.map(t => ({ task_id: t.task_id, title: t.title }))
      });
      
      for (const deletedTask of deletedTasks) {
        await taskService.softDeleteTask(deletedTask.id);
        console.log(`🗑️ 과업 소프트 삭제: ${deletedTask.task_id} - ${deletedTask.title}`);
      }

      // 4. 평가 상태 업데이트
      await evaluationService.updateEvaluation(evaluation.id, {
        evaluation_status: evaluationStatus,
        last_modified: new Date().toISOString()
      });
      console.log('📊 평가 상태 업데이트:', evaluationStatus);

      // 6. 알림 생성 (데이터베이스 저장 성공 후)
      if (user?.role === 'evaluatee' && (hasTaskContentChanges || hasStructuralChanges)) {
        // Find the evaluator for this evaluatee
        const evaluatorId = findEvaluatorForEvaluatee(evaluationData.evaluateeId);

        if (evaluatorId) {
          // Collect all changes for a comprehensive notification
          const changes: string[] = [];
          
          // Check for content changes
          const changedTasks = tasks.filter(task => {
            const original = originalTasksMap.get(task.id);
            return original && (
              original.title !== task.title || 
              original.description !== task.description || 
              original.weight !== task.weight ||
              original.startDate !== task.startDate ||
              original.endDate !== task.endDate
            );
          });

          changedTasks.forEach(task => {
            const original = originalTasksMap.get(task.id);
            if (original) {
              if (original.title !== task.title) changes.push(`"${original.title}" → "${task.title}" 제목 변경`);
              if (original.description !== task.description) changes.push(`"${task.title}" 설명 수정`);
              if (original.weight !== task.weight) changes.push(`"${task.title}" 가중치 ${original.weight}% → ${task.weight}%`);
              if (original.startDate !== task.startDate) changes.push(`"${task.title}" 시작일 변경`);
              if (original.endDate !== task.endDate) changes.push(`"${task.title}" 종료일 변경`);
            }
          });

          // Check for new tasks
          const newTasks = tasks.filter(task => !originalTasksMap.has(task.id));
          newTasks.forEach(task => {
            changes.push(`"${task.title}" 새 과업 추가`);
          });

          // Check for deleted tasks
          const deletedTasks = evaluationData.tasks.filter(task => !tasks.find(t => t.id === task.id));
          deletedTasks.forEach(task => {
            changes.push(`"${task.title}" 과업 삭제`);
          });

          // 평가 상태 변경 알림 추가
          if (evaluationData.evaluationStatus === 'completed' && evaluationStatus === 'in-progress') {
            changes.push('평가 상태: 완료 → 진행중 (재평가 필요)');
          }

          if (changes.length > 0) {
            const changeMessage = changes.length === 1 
              ? changes[0] 
              : `${changes.length}개 변경사항:\n${changes.map(change => `• ${change}`).join('\n')}`;

            await addNotification({
              recipientId: evaluatorId,
              title: '과업 관리 변경',
              message: `${evaluationData.evaluateeName}님이 과업을 수정했습니다.\n\n${changeMessage}`,
              type: 'task_content_changed',
              priority: evaluationStatus === 'in-progress' ? 'high' : 'medium',
              senderId: user.id,
              senderName: user.name,
              relatedEvaluationId: evaluationData.evaluateeId
            });
            
            console.log('📧 과업 변경 알림 생성:', { evaluatorId, changes: changes.length, newStatus: evaluationStatus });
            console.log('📣 과업 변경 알림 생성 완료, 평가자에게 즉시 반영됨');
          }
        }
      }

      console.log('✅ 과업 관리 저장 완료');
    } catch (error) {
      console.error('❌ 과업 관리 저장 실패:', error);
    }
    
    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <CardTitle className="text-xl sm:text-2xl">과업 관리</CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span>과업을 추가하거나 수정할 수 있습니다.</span>
              <span className="flex items-center gap-2">
                <span>총 가중치: {totalWeight}%</span>
                {totalWeight !== 100 && (
                  <Badge variant="destructive" className="text-xs">
                    가중치 합계가 100%가 아닙니다
                  </Badge>
                )}
              </span>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4 text-[#F55000]" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 sm:px-6">
          {tasks.map((task, index) => (
            <div key={task.id} className="p-3 sm:p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">과업 {index + 1}</Badge>
                  {task.score !== undefined && (
                    <Badge className="status-achieved text-xs">평가됨</Badge>
                  )}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {editingTask === task.id ? '완료' : '편집'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      console.log('🖱️ 삭제 버튼 클릭됨:', task.id);
                      deleteTask(task.id);
                    }}
                    className="px-2 sm:px-3"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {editingTask === task.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`title-${task.id}`} className="text-sm">과업명</Label>
                    <Input
                      id={`title-${task.id}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      placeholder="과업명을 입력하세요"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${task.id}`} className="text-sm">과업 설명</Label>
                    <Textarea
                      id={`description-${task.id}`}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                      placeholder="과업 설명을 입력하세요"
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`weight-${task.id}`} className="text-sm">가중치 (%)</Label>
                    <Input
                      id={`weight-${task.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={task.weight}
                      onChange={(e) => updateTask(task.id, { weight: parseInt(e.target.value) || 0 })}
                      placeholder="가중치를 입력하세요"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">시작일</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !task.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {task.startDate ? format(new Date(task.startDate), 'yyyy-MM-dd') : '시작일 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.startDate ? new Date(task.startDate) : undefined}
                            onSelect={(date) => updateTask(task.id, { startDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm">종료일</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal text-sm",
                              !task.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {task.endDate ? format(new Date(task.endDate), 'yyyy-MM-dd') : '종료일 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.endDate ? new Date(task.endDate) : undefined}
                            onSelect={(date) => updateTask(task.id, { endDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium mb-1 text-sm sm:text-base">{task.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-xs sm:text-sm text-muted-foreground">
                    <span>가중치: {task.weight}%</span>
                    {task.startDate && task.endDate && (
                      <span className="text-blue-600">
                        {format(new Date(task.startDate), 'MM/dd')} - {format(new Date(task.endDate), 'MM/dd')}
                      </span>
                    )}
                    {task.contributionMethod && task.contributionScope && (
                      <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs">
                        {task.contributionMethod}/{task.contributionScope}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addNewTask}
            className="w-full border-dashed border-orange-200 text-orange-700 hover:bg-orange-50 text-sm"
          >
            <Plus className="mr-2 h-4 w-4 text-[#FFAA00]" />
            새 과업 추가
          </Button>
        </CardContent>

        <div className="border-t bg-gray-50 flex-shrink-0">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-muted-foreground">
                총 {tasks.length}개 과업 • 가중치 합계: {totalWeight}%
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 sm:flex-none text-sm"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-[#F55000] hover:bg-[#FFAA00] text-white flex-1 sm:flex-none text-sm"
                  disabled={totalWeight !== 100}
                >
                  <Save className="mr-2 h-4 w-4 text-white" />
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskManagement;
