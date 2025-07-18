import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { EvaluationData, Task } from '@/types/evaluation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { taskService, evaluationService, notificationService } from '@/lib/database';

interface TaskManagementDBProps {
  evaluationData: EvaluationData;
  onSave: () => Promise<void>;
  onClose: () => void;
}

interface TaskFormData {
  id: string;
  title: string;
  description: string;
  weight: number;
  startDate: string;
  endDate: string;
}

const TaskManagementDB: React.FC<TaskManagementDBProps> = ({ evaluationData, onSave, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    const initialTasks: TaskFormData[] = evaluationData.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      weight: task.weight,
      startDate: task.startDate || '',
      endDate: task.endDate || ''
    }));
    setTasks(initialTasks);
  }, [evaluationData]);

  // 새 과업 추가
  const addTask = () => {
    const newTask: TaskFormData = {
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      weight: 0,
      startDate: '',
      endDate: ''
    };
    setTasks([...tasks, newTask]);
  };

  // 과업 삭제
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // 과업 수정
  const updateTask = (taskId: string, field: keyof TaskFormData, value: string | number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  // 저장
  const handleSave = async () => {
    try {
      setIsLoading(true);
      console.log('💾 과업 관리 저장 시작...');

      // 1. 유효성 검사
      const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
      if (totalWeight !== 100) {
        toast({
          title: "저장 실패",
          description: `가중치 합계가 100%가 아닙니다. 현재: ${totalWeight}%`,
          variant: "destructive",
        });
        return;
      }

      // 빈 제목 검사
      const emptyTitleTasks = tasks.filter(task => !task.title.trim());
      if (emptyTitleTasks.length > 0) {
        toast({
          title: "저장 실패",
          description: "모든 과업에 제목을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 2. 평가 정보 조회
      const evaluation = await evaluationService.getEvaluationByEmployeeId(evaluationData.evaluateeId);
      if (!evaluation) {
        throw new Error('평가 정보를 찾을 수 없습니다.');
      }

      // 3. 기존 과업들 조회
      const existingTasks = await taskService.getTasksByEvaluationId(evaluation.id);

      // 4. 기존 과업들과 새 과업들을 매핑하여 업데이트 또는 생성
      const existingTasksMap = new Map(existingTasks.map((task: any) => [task.task_id, task]));
      
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
      
      for (const task of tasks) {
        const existingTask = existingTasksMap.get(task.id);
        
        if (existingTask) {
          // 기존 과업 업데이트 - task_id 보존
          await taskService.updateTask(existingTask.id, {
            title: task.title,
            description: task.description || null,
            weight: task.weight,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            contribution_method: existingTask.contribution_method,
            contribution_scope: existingTask.contribution_scope,
            score: existingTask.score,
            feedback: existingTask.feedback,
            feedback_date: existingTask.feedback_date,
            evaluator_name: existingTask.evaluator_name
          });
          console.log(`✅ 기존 과업 업데이트: ${existingTask.task_id} - ${task.title}`);
        } else {
          // 새 과업 생성 - 순차적인 task_id 생성
          const newTaskId = `${evaluationData.evaluateeId}_T${nextTaskNumber}`;
          console.log(`🆔 새 task_id 할당: ${newTaskId} (번호: ${nextTaskNumber})`);
          
          console.log('📝 새 과업 생성 데이터:', {
            task_id: newTaskId,
            title: task.title,
            description: task.description,
            weight: task.weight,
            start_date: task.startDate,
            end_date: task.endDate
          });
          
          await taskService.createTask({
            task_id: newTaskId,
            evaluation_id: evaluation.id,
            title: task.title,
            description: task.description || null,
            weight: task.weight,
            start_date: task.startDate || null,
            end_date: task.endDate || null,
            contribution_method: null,
            contribution_scope: null,
            score: null,
            feedback: null,
            feedback_date: null,
            evaluator_name: null
          });
          console.log(`✅ 새 과업 생성: ${newTaskId} - ${task.title}`);
          
          // 다음 번호로 증가
          nextTaskNumber++;
        }
      }

      // 5. 삭제된 과업들 처리
      const updatedTaskIds = new Set(tasks.map(task => task.id));
      const deletedTasks = existingTasks.filter((task: any) => !updatedTaskIds.has(task.task_id));
      
      for (const deletedTask of deletedTasks) {
        await taskService.deleteTask(deletedTask.id);
        console.log(`🗑️ 과업 삭제: ${deletedTask.task_id} - ${deletedTask.title}`);
      }

      // 6. 알림 생성 (평가자가 있는 경우)
      if (user?.role === 'evaluatee' && evaluationData.evaluateeId) {
        // 평가자에게 알림 생성
        const employee = await import('@/lib/database').then(m => m.employeeService.getEmployeeById(evaluationData.evaluateeId));
        if (employee?.evaluator_id) {
          await notificationService.createNotification({
            recipient_id: employee.evaluator_id,
            title: `${evaluationData.evaluateeName} 과업 정보 업데이트`,
            message: `• 총 ${tasks.length}개의 과업이 등록/수정되었습니다.\n• 가중치 합계: ${totalWeight}%`,
            notification_type: 'task_updated',
            priority: 'medium',
            sender_id: user.id,
            sender_name: user.name,
            related_evaluation_id: evaluationData.evaluateeId,
            related_task_id: null,
            is_read: false
          });
        }
      }

      toast({
        title: "저장 완료",
        description: `${tasks.length}개의 과업이 성공적으로 저장되었습니다.`,
      });

      console.log('✅ 과업 관리 저장 완료');
      await onSave();
    } catch (error) {
      console.error('❌ 과업 관리 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "과업 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>과업 관리</CardTitle>
              <CardDescription>
                과업을 등록, 수정, 삭제할 수 있습니다. 가중치 합계는 100%가 되어야 합니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={totalWeight === 100 ? "default" : "destructive"}
                className="text-sm"
              >
                총 가중치: {totalWeight}%
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
          {tasks.map((task, index) => (
            <Card key={task.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">과업 #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">과업명 *</label>
                    <Input
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                      placeholder="과업명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">과업 설명</label>
                    <Textarea
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                      placeholder="과업에 대한 상세 설명을 입력하세요"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">가중치 (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={task.weight}
                      onChange={(e) => updateTask(task.id, 'weight', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">시작일</label>
                    <Input
                      type="date"
                      value={task.startDate}
                      onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">종료일</label>
                    <Input
                      type="date"
                      value={task.endDate}
                      onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addTask}
            className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 과업 추가
          </Button>
        </CardContent>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              총 {tasks.length}개 과업 | 가중치 합계: {totalWeight}%
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                취소
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading || totalWeight !== 100}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskManagementDB; 