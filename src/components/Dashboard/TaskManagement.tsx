import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { EvaluationData, Task } from '@/types/evaluation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface TaskManagementProps {
  evaluationData: EvaluationData;
  onClose: () => void;
  onSave: (updatedData: EvaluationData) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  evaluationData,
  onClose,
  onSave
}) => {
  const [tasks, setTasks] = useState<Task[]>(evaluationData.tasks);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '새 과업',
      description: '과업 설명을 입력하세요',
      weight: 0,
      lastModified: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask.id);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setEditingTask(null);
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

  const handleSave = () => {
    // Find original tasks to preserve evaluation data
    const originalTasksMap = new Map(evaluationData.tasks.map(task => [task.id, task]));
    
    // Check for content changes in existing tasks (title, description, weight)
    const hasTaskContentChanges = tasks.some(task => {
      const original = originalTasksMap.get(task.id);
      if (!original) return false; // New task, not a content change
      return (
        original.title !== task.title || 
        original.description !== task.description || 
        original.weight !== task.weight
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
          feedbackDate: originalTask.feedbackDate
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
          original.weight !== task.weight
        );
      }).map(t => ({ id: t.id, title: t.title }))
    });

    // Send notifications for changes if user is evaluatee
    if (user?.role === 'evaluatee' && (hasTaskContentChanges || hasStructuralChanges)) {
      // Find the evaluator to send notification to
      // For now, we'll send to a generic evaluator - in a real system, this would be the assigned evaluator
      const evaluatorId = 'evaluator-1'; // This should come from the evaluation assignment

      // Collect all changes for a comprehensive notification
      const changes: string[] = [];
      
      // Check for content changes
      const changedTasks = tasks.filter(task => {
        const original = originalTasksMap.get(task.id);
        return original && (
          original.title !== task.title || 
          original.description !== task.description || 
          original.weight !== task.weight
        );
      });

      changedTasks.forEach(task => {
        const original = originalTasksMap.get(task.id);
        if (original) {
          if (original.title !== task.title) {
            changes.push(`"${original.title}" 과업명 변경`);
          }
          if (original.description !== task.description) {
            changes.push(`"${task.title}" 과업 설명 수정`);
          }
          if (original.weight !== task.weight) {
            changes.push(`"${task.title}" 가중치 ${original.weight}% → ${task.weight}%`);
          }
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

      if (changes.length > 0) {
        const changeMessage = changes.length === 1 
          ? changes[0] 
          : `${changes.length}개 변경사항: ${changes.slice(0, 2).join(', ')}${changes.length > 2 ? ' 외' : ''}`;

        addNotification({
          recipientId: evaluatorId,
          title: '과업 관리 변경',
          message: `${evaluationData.evaluateeName}님이 과업을 수정했습니다. ${changeMessage}`,
          type: 'task_updated',
          priority: 'medium',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: evaluationData.evaluateeId
        });
      }
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
              <div className="flex items-center gap-2">
                <span>총 가중치: {totalWeight}%</span>
                {totalWeight !== 100 && (
                  <Badge variant="destructive" className="text-xs">
                    가중치 합계가 100%가 아닙니다
                  </Badge>
                )}
              </div>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
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
                    onClick={() => deleteTask(task.id)}
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
                </div>
              ) : (
                <div>
                  <h3 className="font-medium mb-1 text-sm sm:text-base">{task.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-xs sm:text-sm text-muted-foreground">
                    <span>가중치: {task.weight}%</span>
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
            <Plus className="mr-2 h-4 w-4" />
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
                  className="ok-orange hover:opacity-90 flex-1 sm:flex-none text-sm"
                  disabled={totalWeight !== 100}
                >
                  <Save className="mr-2 h-4 w-4" />
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
