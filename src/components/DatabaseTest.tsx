import React, { useState, useEffect } from 'react';
import { employeeService, evaluationService, taskService } from '@/lib/database';
import { Employee, Evaluation, Task } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const DatabaseTest: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
      toast({
        title: "직원 데이터 로드 완료",
        description: `${data.length}명의 직원 데이터를 불러왔습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "직원 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Employee load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      const data = await evaluationService.getAllEvaluations();
      setEvaluations(data);
      toast({
        title: "평가 데이터 로드 완료",
        description: `${data.length}개의 평가 데이터를 불러왔습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "평가 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Evaluation load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasksForFirstEvaluation = async () => {
    if (evaluations.length === 0) {
      toast({
        title: "평가 데이터 없음",
        description: "먼저 평가 데이터를 로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await taskService.getTasksByEvaluationId(evaluations[0].id);
      setTasks(data);
      toast({
        title: "과업 데이터 로드 완료",
        description: `${data.length}개의 과업 데이터를 불러왔습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "과업 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Task load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTasksForFirstEvaluation = async () => {
    if (evaluations.length === 0) {
      toast({
        title: "평가 데이터 없음",
        description: "먼저 평가 데이터를 로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await taskService.createDefaultTasks(evaluations[0].id, evaluations[0].evaluatee_id);
      setTasks(data);
      toast({
        title: "기본 과업 생성 완료",
        description: `${data.length}개의 기본 과업이 생성되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "기본 과업 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Task creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadEvaluations();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>데이터베이스 연결 테스트</CardTitle>
          <CardDescription>
            Supabase 데이터베이스 연결 상태를 확인하고 데이터를 테스트합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadEmployees} disabled={isLoading}>
              직원 데이터 로드
            </Button>
            <Button onClick={loadEvaluations} disabled={isLoading}>
              평가 데이터 로드
            </Button>
            <Button onClick={loadTasksForFirstEvaluation} disabled={isLoading}>
              과업 데이터 로드
            </Button>
            <Button onClick={createDefaultTasksForFirstEvaluation} disabled={isLoading}>
              기본 과업 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>직원 목록 ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className="p-2 border rounded">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-600">
                    {employee.position} - {employee.department}
                  </div>
                  <div className="text-xs text-gray-500">
                    성장레벨: {employee.growth_level || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>평가 목록 ({evaluations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-2 border rounded">
                  <div className="font-medium">{evaluation.evaluatee_name}</div>
                  <div className="text-sm text-gray-600">
                    {evaluation.evaluatee_position} - {evaluation.evaluatee_department}
                  </div>
                  <div className="text-xs text-gray-500">
                    상태: {evaluation.evaluation_status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>과업 목록 ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="p-2 border rounded">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    가중치: {task.weight}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {task.start_date} ~ {task.end_date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 