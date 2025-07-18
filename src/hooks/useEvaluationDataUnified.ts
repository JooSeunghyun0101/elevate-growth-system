import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  employeeService, 
  evaluationService, 
  taskService, 
  feedbackService 
} from '@/lib/services';
import { 
  EvaluationData, 
  TaskData, 
  Employee, 
  Evaluation, 
  Task, 
  FeedbackHistory,
  CONSTANTS 
} from '@/types';
import { feedbackValidation, weightValidation } from '@/utils/validation';
import { errorHandler } from '@/utils/errorHandler';
import { checkSimilarFeedback } from '@/lib/gemini';

export const useEvaluationDataUnified = () => {
  const { id: employeeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tempFeedbacks, setTempFeedbacks] = useState<Record<string, string>>({});

  // 데이터 로드
  const loadEvaluationData = useCallback(async () => {
    if (!employeeId || !user) return;

    try {
      setIsLoading(true);
      
      // 직원 정보 조회
      const employee = await employeeService.getEmployeeById(employeeId);
      if (!employee) {
        toast({
          title: "오류",
          description: "직원 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // 평가 정보 조회
      const evaluation = await evaluationService.getEvaluationByEmployeeId(employeeId);
      if (!evaluation) {
        toast({
          title: "오류",
          description: "평가 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // 과업 정보 조회
      const tasks = await taskService.getTasksByEvaluationId(evaluation.id);
      
      // 피드백 히스토리 조회 (task_id 사용)
      const tasksWithFeedback = await Promise.all(
        tasks.map(async (task) => {
          const feedbackHistory = await feedbackService.getFeedbackHistoryByTaskIdString(task.task_id);
          return {
            ...task,
            feedbackHistory
          };
        })
      );

      // 프론트엔드용 데이터 구조로 변환
      const transformedTasks: TaskData[] = tasksWithFeedback.map(task => ({
        id: task.id,
        taskId: task.task_id,
        title: task.title,
        description: task.description || '',
        weight: task.weight,
        startDate: task.start_date || '',
        endDate: task.end_date || '',
        contributionMethod: task.contribution_method || '',
        contributionScope: task.contribution_scope || '',
        score: task.score,
        feedback: task.feedback,
        feedbackHistory: task.feedbackHistory
      }));

      const data: EvaluationData = {
        employeeId: employee.employee_id,
        employeeName: employee.name,
        employeePosition: employee.position,
        employeeDepartment: employee.department,
        growthLevel: employee.growth_level || 1,
        evaluationStatus: evaluation.evaluation_status,
        tasks: transformedTasks,
        lastModified: evaluation.last_modified
      };

      setEvaluationData(data);
    } catch (error) {
      const appError = errorHandler.createAppError(error);
      errorHandler.logError(appError, 'useEvaluationDataUnified');
      
      toast({
        title: "오류",
        description: appError.getUserMessage(),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, user, navigate, toast]);

  // 데이터 새로고침
  const refreshData = useCallback(() => {
    loadEvaluationData();
  }, [loadEvaluationData]);

  // 초기 로드
  useEffect(() => {
    loadEvaluationData();
  }, [loadEvaluationData]);

  // 과업 업데이트
  const updateTask = useCallback((taskId: string, updates: Partial<TaskData>) => {
    setEvaluationData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      };
    });
  }, []);

  // 임시 피드백 업데이트
  const updateTempFeedback = useCallback((taskId: string, feedback: string) => {
    setTempFeedbacks(prev => ({
      ...prev,
      [taskId]: feedback
    }));
  }, []);

  // 가중치 검증
  const validateWeights = useCallback(() => {
    if (!evaluationData) return false;
    
    const weights = evaluationData.tasks.map(task => task.weight);
    const validation = weightValidation.validateWeights(weights);
    
    if (!validation.isValid) {
      toast({
        title: "가중치 오류",
        description: validation.errors.join('\n'),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [evaluationData, toast]);

  // 피드백 검증
  const validateFeedbacks = useCallback(async () => {
    if (!evaluationData || !user) return { isValid: true, warnings: [] };
    
    const warnings: string[] = [];
    
    // 각 과업의 피드백 검증
    for (const task of evaluationData.tasks) {
      const currentFeedback = tempFeedbacks[task.id] || task.feedback || '';
      if (!currentFeedback.trim()) continue;
      
      const validation = feedbackValidation.validateFeedback(currentFeedback);
      if (!validation.isValid) {
        warnings.push(`"${task.title}": ${validation.errors.join(', ')}`);
      }
    }
    
    // AI 기반 중복 검사 (다른 피평가자들과 비교)
    try {
      const myEvaluatees = await employeeService.getEvaluateesByEvaluator(user.employeeId);
      const otherEvaluateeFeedbacks: string[] = [];
      
      for (const evaluatee of myEvaluatees) {
        if (evaluatee.employee_id === employeeId) continue;
        
        const evaluateeEvaluation = await evaluationService.getEvaluationByEmployeeId(evaluatee.employee_id);
        if (evaluateeEvaluation) {
          const evaluateeTasks = await taskService.getTasksByEvaluationId(evaluateeEvaluation.id);
          evaluateeTasks.forEach(task => {
            if (task.feedback && task.feedback.trim()) {
              otherEvaluateeFeedbacks.push(task.feedback);
            }
          });
        }
      }
      
      // AI 중복 검사
      for (const task of evaluationData.tasks) {
        const currentFeedback = tempFeedbacks[task.id] || task.feedback || '';
        if (!currentFeedback.trim() || otherEvaluateeFeedbacks.length === 0) continue;
        
        try {
          const duplicateCheck = await checkSimilarFeedback(
            currentFeedback, 
            otherEvaluateeFeedbacks,
            user.name
          );
          
          if (duplicateCheck.isDuplicate) {
            warnings.push(`"${task.title}": ${duplicateCheck.summary}`);
          }
        } catch (error) {
          console.warn('AI 중복 검사 실패:', error);
        }
      }
    } catch (error) {
      console.warn('다른 피평가자 피드백 수집 실패:', error);
    }
    
    return { isValid: warnings.length === 0, warnings };
  }, [evaluationData, user, employeeId, tempFeedbacks]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!evaluationData || !user) return false;

    try {
      setIsSaving(true);
      
      // 가중치 검증
      if (!validateWeights()) {
        return false;
      }
      
      // 피드백 검증
      const feedbackValidation = await validateFeedbacks();
      if (!feedbackValidation.isValid) {
        const shouldContinue = window.confirm(
          `다음 문제들이 감지되었습니다:\n\n${feedbackValidation.warnings.join('\n\n')}\n\n계속 저장하시겠습니까?`
        );
        
        if (!shouldContinue) {
          return false;
        }
      }
      
      // 데이터베이스 저장
      const evaluation = await evaluationService.getEvaluationByEmployeeId(employeeId!);
      if (!evaluation) throw new Error('평가 정보를 찾을 수 없습니다.');
      
      // 과업 업데이트 (task_id 보존)
      for (const task of evaluationData.tasks) {
        const currentFeedback = tempFeedbacks[task.id] || task.feedback || '';
        
        // 기존 과업 정보 조회하여 task_id 보존
        const existingTask = await taskService.getTasksByEvaluationId(evaluation.id);
        const taskToUpdate = existingTask.find((t: any) => t.id === task.id);
        
        if (taskToUpdate) {
          await taskService.updateTask(task.id, {
            weight: task.weight,
            score: task.score,
            contribution_method: task.contributionMethod,
            contribution_scope: task.contributionScope,
            feedback: currentFeedback,
            feedback_date: currentFeedback ? new Date().toISOString() : null,
            evaluator_name: user.name
          });
          
          // 피드백 히스토리에 추가 (task_id 사용)
          if (currentFeedback && currentFeedback !== task.feedback) {
            await feedbackService.createFeedbackHistory({
              task_id: taskToUpdate.task_id,
              content: currentFeedback,
              evaluator_name: user.name
            });
          }
        }
      }
      
      // 평가 상태 업데이트
      await evaluationService.updateEvaluation(evaluation.id, {
        evaluation_status: 'completed',
        last_modified: new Date().toISOString()
      });
      
      toast({
        title: "저장 완료",
        description: "평가가 성공적으로 저장되었습니다.",
      });
      
      return true;
    } catch (error) {
      const appError = errorHandler.createAppError(error);
      errorHandler.logError(appError, 'handleSave');
      
      toast({
        title: "저장 실패",
        description: appError.getUserMessage(),
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [evaluationData, user, employeeId, tempFeedbacks, validateWeights, validateFeedbacks, toast]);

  return {
    evaluationData,
    isLoading,
    isSaving,
    tempFeedbacks,
    updateTask,
    updateTempFeedback,
    handleSave,
    refreshData,
    validateWeights,
    validateFeedbacks
  };
}; 