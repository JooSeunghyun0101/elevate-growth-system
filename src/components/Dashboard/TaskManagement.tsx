import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { EvaluationData, Task } from '@/types/evaluation';

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

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '새 과업',
      description: '과업 설명을 입력하세요',
      weight: 0
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
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleSave = () => {
    // Find original tasks to preserve evaluation data
    const originalTasksMap = new Map(evaluationData.tasks.map(task => [task.id, task]));
    
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
          feedback: originalTask.feedback
        };
      } else {
        // New task - no evaluation data
        return task;
      }
    });

    // Check if there are any changes or new tasks
    const hasChanges = tasks.length !== evaluationData.tasks.length || 
      tasks.some(task => {
        const original = originalTasksMap.get(task.id);
        return !original || 
               original.title !== task.title || 
               original.description !== task.description || 
               original.weight !== task.weight;
      });

    // Determine evaluation status
    const completedTasks = updatedTasks.filter(task => task.score !== undefined).length;
    let evaluationStatus: 'in-progress' | 'completed' = evaluationData.evaluationStatus;
    
    // If there are changes, reset to in-progress
    if (hasChanges && completedTasks < updatedTasks.length) {
      evaluationStatus = 'in-progress';
    }

    const updatedData: EvaluationData = {
      ...evaluationData,
      tasks: updatedTasks,
      evaluationStatus,
      lastModified: new Date().toISOString()
    };
    
    console.log('Task management save:', {
      hasChanges,
      completedTasks,
      totalTasks: updatedTasks.length,
      newStatus: evaluationStatus
    });
    
    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">과업 관리</CardTitle>
            <CardDescription className="flex items-center gap-2">
              과업을 추가하거나 수정할 수 있습니다. 총 가중치: {totalWeight}%
              {totalWeight !== 100 && (
                <Badge variant="destructive">
                  가중치 합계가 100%가 아닙니다
                </Badge>
              )}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[70vh] space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">과업 {index + 1}</Badge>
                  {task.score !== undefined && (
                    <Badge className="status-achieved">평가됨</Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                  >
                    {editingTask === task.id ? '완료' : '편집'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingTask === task.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`title-${task.id}`}>과업명</Label>
                    <Input
                      id={`title-${task.id}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      placeholder="과업명을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${task.id}`}>과업 설명</Label>
                    <Textarea
                      id={`description-${task.id}`}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                      placeholder="과업 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`weight-${task.id}`}>가중치 (%)</Label>
                    <Input
                      id={`weight-${task.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={task.weight}
                      onChange={(e) => updateTask(task.id, { weight: parseInt(e.target.value) || 0 })}
                      placeholder="가중치를 입력하세요"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>가중치: {task.weight}%</span>
                    {task.contributionMethod && task.contributionScope && (
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
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
            className="w-full border-dashed border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            새 과업 추가
          </Button>
        </CardContent>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            총 {tasks.length}개 과업 • 가중치 합계: {totalWeight}%
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              onClick={handleSave}
              className="ok-orange hover:opacity-90"
              disabled={totalWeight !== 100}
            >
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskManagement;
