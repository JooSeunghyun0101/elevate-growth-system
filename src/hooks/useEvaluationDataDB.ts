import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContextDB';
import { EvaluationData, Task, FeedbackHistoryItem } from '@/types/evaluation';
import { employeeService, evaluationService, taskService, feedbackService, notificationService } from '@/lib/database';
import { checkSimilarFeedback } from '@/lib/gemini';
import { feedbackValidation } from '@/utils/validation';

export const useEvaluationDataDB = (employeeId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // 점수 매트릭스 (방식 x 범위) - 의존적, 독립적, 상호적, 전략적 순서
  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

  const contributionMethods = ['총괄', '리딩', '실무', '지원'];
  const contributionScopes = ['의존적', '독립적', '상호적', '전략적'];

  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [tempFeedbacks, setTempFeedbacks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 데이터베이스에서 평가 데이터 로드
  const loadEvaluationData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 평가 데이터 로드 시작:', employeeId);

      // 1. 평가 정보 조회
      let evaluation = await evaluationService.getEvaluationByEmployeeId(employeeId);
      
      // 2. 평가가 없으면 생성
      if (!evaluation) {
        console.log('📝 새 평가 생성 중...');
        const employee = await import('@/lib/database').then(m => m.employeeService.getEmployeeById(employeeId));
        if (!employee) {
          throw new Error('직원 정보를 찾을 수 없습니다.');
        }

        evaluation = await evaluationService.createEvaluation({
          evaluatee_id: employeeId,
          evaluatee_name: employee.name,
          evaluatee_position: employee.position,
          evaluatee_department: employee.department,
          growth_level: employee.growth_level || 1,
          evaluation_status: 'in-progress',
          last_modified: new Date().toISOString()
        });
      }

      // 3. 과업들 조회
      let tasks = await taskService.getTasksByEvaluationId(evaluation.id);
      
      // 4. 과업이 없는지 확인 (삭제된 과업도 포함하여 체크)
      if (tasks.length === 0) {
        // 삭제된 과업까지 포함해서 확인
        const allTasks = await supabase
          .from('tasks')
          .select('id')
          .eq('evaluation_id', evaluation.id);
        
        // 삭제된 과업도 없다면 (완전히 처음) 기본 과업 생성
        // 사용자가 의도적으로 모든 과업을 삭제했다면 자동 생성하지 않음
        if (allTasks.data && allTasks.data.length === 0) {
          console.log('📋 완전히 새로운 평가입니다. 기본 과업들을 생성합니다.');
          tasks = await taskService.createDefaultTasks(evaluation.id, evaluation.evaluatee_id);
          console.log('✅ 기본 과업 생성 완료:', tasks.length, '개');
        } else {
          console.log('ℹ️ 사용자가 모든 과업을 삭제했습니다. 자동 생성하지 않습니다.');
        }
      }

      // 5. 각 과업의 피드백 히스토리 로드
      const tasksWithHistory = await Promise.all(
        tasks.map(async (task) => {
          console.log('🔍 피평가자 대시보드 - 피드백 히스토리 조회:', { 
            taskUUID: task.id, 
            taskId: task.task_id, 
            taskTitle: task.title,
            employeeId: employeeId
          });
          
          let feedbackHistory: any[] = [];
          try {
            feedbackHistory = await feedbackService.getFeedbackHistoryByTaskId(task.task_id);
            console.log('📜 피평가자 대시보드 - 조회된 피드백 히스토리:', {
              taskTitle: task.title,
              taskId: task.task_id,
              historyCount: feedbackHistory.length,
              histories: feedbackHistory.map(fh => ({ 
                id: fh.id, 
                content_preview: fh.content.substring(0, 50) + '...', 
                evaluator: fh.evaluator_name,
                createdAt: fh.created_at,
                content_length: fh.content.length
              }))
            });
          } catch (error) {
            console.error('❌ 피평가자 대시보드 - 피드백 히스토리 조회 실패:', {
              taskId: task.task_id,
              taskTitle: task.title,
              error: error,
              message: error instanceof Error ? error.message : 'Unknown error'
            });
            feedbackHistory = [];
          }
          
          // 피드백 히스토리를 feedbackHistory로 사용
          const feedbackHistoryItems = feedbackHistory.map(fh => ({
            id: fh.id,
            content: fh.content,
            date: fh.created_at,
            evaluatorName: fh.evaluator_name || '평가자',
            evaluatorId: user?.id || 'unknown'
          }));

          // 날짜순으로 정렬 (최신순)
          feedbackHistoryItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          console.log(`📝 피평가자 대시보드 - ${task.title} 최종 피드백 히스토리:`, {
            taskId: task.task_id,
            taskUUID: task.id,
            historyCount: feedbackHistoryItems.length,
            items: feedbackHistoryItems.map(f => ({ 
              id: f.id,
              content_preview: f.content.substring(0, 30) + '...', 
              evaluator: f.evaluatorName,
              date: f.date,
              content_length: f.content.length
            }))
          });
          
          return {
            id: task.task_id, // 기존 코드와 호환성을 위해 task_id를 id로 사용
            taskId: task.task_id, // DB 삭제를 위한 taskId 필드 추가
            title: task.title,
            description: task.description || '',
            weight: task.weight,
            startDate: task.start_date || undefined,
            endDate: task.end_date || undefined,
            contributionMethod: task.contribution_method || undefined,
            contributionScope: task.contribution_scope || undefined,
            score: task.score || undefined,
            feedback: task.feedback || undefined,
            feedbackDate: task.feedback_date || undefined,
            evaluatorName: task.evaluator_name || undefined,
            feedbackHistory: feedbackHistoryItems
          } as Task;
        })
      );

      // 6. EvaluationData 형태로 변환
      const evaluationDataResult: EvaluationData = {
        evaluateeId: evaluation.evaluatee_id,
        evaluateeName: evaluation.evaluatee_name,
        evaluateePosition: evaluation.evaluatee_position,
        evaluateeDepartment: evaluation.evaluatee_department,
        growthLevel: evaluation.growth_level,
        evaluationStatus: evaluation.evaluation_status,
        lastModified: evaluation.last_modified,
        tasks: tasksWithHistory
      };

      setEvaluationData(evaluationDataResult);

      // 7. 현재 피드백들을 tempFeedbacks에 설정
      const currentFeedbacks: Record<string, string> = {};
      tasksWithHistory.forEach(task => {
        if (task.feedback) {
          currentFeedbacks[task.id] = task.feedback;
        }
      });
      setTempFeedbacks(currentFeedbacks);

      console.log('✅ 피평가자 대시보드 - 평가 데이터 로드 완료:', {
        evaluateeId: evaluationDataResult.evaluateeId,
        evaluateeName: evaluationDataResult.evaluateeName,
        taskCount: evaluationDataResult.tasks.length,
        totalFeedbackHistory: evaluationDataResult.tasks.reduce((sum, task) => sum + (task.feedbackHistory?.length || 0), 0),
        tasksWithFeedback: evaluationDataResult.tasks.filter(task => (task.feedbackHistory?.length || 0) > 0).map(task => ({
          taskId: task.id,
          title: task.title,
          historyCount: task.feedbackHistory?.length || 0,
          latestFeedback: task.feedbackHistory?.[0]?.content.substring(0, 30) + '...' || '없음'
        }))
      });
    } catch (error) {
      console.error('❌ 평가 데이터 로드 실패:', error);
      toast({
        title: "데이터 로드 실패",
        description: "평가 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (employeeId) {
      loadEvaluationData();
    }
  }, [employeeId]);

  const updateTask = async (taskId: string, field: keyof Task, value: any) => {
    if (!evaluationData) return;

    try {
      console.log('🔄 로컬 과업 업데이트 (DB 저장은 저장 버튼 시에만):', { taskId, field, value });

      // 로컬 상태만 업데이트 (데이터베이스 업데이트는 저장 시에만)
      setEvaluationData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, [field]: value };
            }
            return task;
          }),
          lastModified: new Date().toISOString()
        };
      });

      console.log('✅ 로컬 상태 업데이트 완료 (DB는 저장 시 업데이트)');
    } catch (error) {
      console.error('❌ 과업 업데이트 실패:', error);
      toast({
        title: "업데이트 실패",
        description: "과업 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleWeightChange = (taskId: string, weight: number) => {
    updateTask(taskId, 'weight', weight);
    
    if (!evaluationData) return;
    
    // 알림 생성 제거 - 저장 시에만 생성하도록 변경
    
    const newTotalWeight = evaluationData.tasks.reduce((sum, t) => {
      return sum + (t.id === taskId ? weight : t.weight);
    }, 0);
    
    if (newTotalWeight !== 100) {
      toast({
        title: "가중치 확인 필요",
        description: `현재 총 가중치: ${newTotalWeight}% (100%가 되도록 조정해주세요)`,
        variant: "destructive",
      });
    }
  };

  const handleMethodClick = (taskId: string, method: string) => {
    if (!evaluationData) return;

    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousScore = task.score;
    const previousMethod = task.contributionMethod;
    
    let newScore = task.score;
    let newScope = task.contributionScope;
    
    if (method === '기여없음') {
      newScope = '기여없음';
      newScore = 0;
      updateTask(taskId, 'contributionScope', '기여없음');
      updateTask(taskId, 'score', 0);
    } else if (task.contributionScope && task.contributionScope !== '기여없음') {
      const methodIndex = contributionMethods.indexOf(method);
      const scopeIndex = contributionScopes.indexOf(task.contributionScope);
      if (methodIndex !== -1 && scopeIndex !== -1) {
        newScore = scoreMatrix[methodIndex][scopeIndex];
        updateTask(taskId, 'score', newScore);
      }
    }

    updateTask(taskId, 'contributionMethod', method);

    // 알림 생성 제거 - 저장 시에만 생성하도록 변경
  };

  const handleScopeClick = (taskId: string, scope: string) => {
    if (!evaluationData) return;

    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousScore = task.score;
    const previousScope = task.contributionScope;
    
    let newScore = task.score;
    let newMethod = task.contributionMethod;
    
    if (scope === '기여없음') {
      newMethod = '기여없음';
      newScore = 0;
      updateTask(taskId, 'contributionMethod', '기여없음');
      updateTask(taskId, 'score', 0);
    } else if (task.contributionMethod && task.contributionMethod !== '기여없음') {
      const methodIndex = contributionMethods.indexOf(task.contributionMethod);
      const scopeIndex = contributionScopes.indexOf(scope);
      if (methodIndex !== -1 && scopeIndex !== -1) {
        newScore = scoreMatrix[methodIndex][scopeIndex];
        updateTask(taskId, 'score', newScore);
      }
    }

    updateTask(taskId, 'contributionScope', scope);

    // 알림 생성 제거 - 저장 시에만 생성하도록 변경
  };

  const handleTaskUpdate = async (taskId: string, updates: { title?: string; description?: string; startDate?: string; endDate?: string }) => {
    if (!evaluationData) return;

    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    // 각 필드를 개별적으로 업데이트
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== task[key as keyof Task]) {
        await updateTask(taskId, key as keyof Task, value);
      }
    }

    // 알림 생성 제거 - 저장 시에만 생성하도록 변경
  };

  const handleFeedbackChange = (taskId: string, feedback: string) => {
    setTempFeedbacks(prev => ({
      ...prev,
      [taskId]: feedback
    }));

    // 로컬 상태도 업데이트 (UI 반영용)
    setEvaluationData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId 
            ? { ...task, feedback }
            : task
        ),
        lastModified: new Date().toISOString()
      };
    });
  };

  const calculateTotalScore = () => {
    if (!evaluationData) return { exactScore: 0, flooredScore: 0 };

    const totalWeightedScore = evaluationData.tasks.reduce((sum, task) => {
      if (task.score) {
        return sum + (task.score * task.weight / 100);
      }
      return sum;
    }, 0);
    
    return {
      exactScore: Math.round(totalWeightedScore * 100) / 100,
      flooredScore: Math.floor(totalWeightedScore)
    };
  };

  const isEvaluationComplete = () => {
    if (!evaluationData) return false;
    return evaluationData.tasks.every(task => task.score !== undefined);
  };

  const isAchieved = () => {
    if (!evaluationData) return false;
    const { flooredScore } = calculateTotalScore();
    return flooredScore >= evaluationData.growthLevel;
  };

  const handleSave = async () => {
    if (!evaluationData || !user) return false;

    try {
      console.log('💾 평가 저장 시작...');
      console.log('🔍 저장 시작 시점 데이터 확인:', {
        taskCount: evaluationData.tasks.length,
        tasks: evaluationData.tasks.map(t => ({
          id: t.id,
          title: t.title,
          weight: t.weight,
          score: t.score,
          contributionMethod: t.contributionMethod,
          contributionScope: t.contributionScope
        })),
        tempFeedbacks: Object.keys(tempFeedbacks).map(id => ({
          taskId: id,
          feedbackLength: tempFeedbacks[id]?.length || 0
        }))
      });

      // 변경된 과업들 기록 (통합 알림용)
      const changedTasks: Array<{id: string, title: string, hasNewFeedback?: boolean, changeDetails?: string}> = [];

      // 1. 가중치 검사
      const totalWeight = evaluationData.tasks.reduce((sum, task) => sum + task.weight, 0);
      
      if (totalWeight !== 100) {
        toast({
          title: "저장 실패",
          description: `가중치 합계가 100%가 아닙니다. 현재: ${totalWeight}%\n가중치를 조정한 후 다시 저장해주세요.`,
          variant: "destructive",
        });
        return false;
      }

      // 2. 중복 피드백 검사 (다른 피평가자들과 비교) - 강화된 검사
      console.log('🔍 피드백 중복 검사 시작...');
      console.log('📝 현재 저장할 피드백들:', Object.keys(tempFeedbacks).map(taskId => ({
        taskId,
        feedbackLength: tempFeedbacks[taskId]?.length || 0,
        preview: tempFeedbacks[taskId]?.substring(0, 30) + '...' || '(없음)'
      })));
      
      const duplicateWarnings: string[] = [];
      
      // 먼저 현재 피드백들 검사 (단순한 검사부터)
      for (const taskId of Object.keys(tempFeedbacks)) {
        const currentFeedback = tempFeedbacks[taskId];
        
        const task = evaluationData.tasks.find(t => t.id === taskId);
        const taskTitle = task?.title || `과업 ${taskId}`;
        
        if (!currentFeedback || !currentFeedback.trim()) {
          duplicateWarnings.push(`"${taskTitle}": 피드백이 입력되지 않았습니다. 모든 과업에 대한 피드백을 작성해주세요.`);
          console.log(`⚠️ ${taskId}: 빈 피드백 감지`);
          continue;
        }

        // validation.ts를 사용한 고도화된 피드백 검증
        const validationResult = feedbackValidation.validateFeedback(currentFeedback);
        
        console.log(`🔍 ${taskTitle} 고도화된 검증:`, {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          preview: currentFeedback.substring(0, 50) + '...'
        });

        if (!validationResult.isValid) {
          // 모든 오류를 하나의 경고 메시지로 합치기
          const errorMessage = validationResult.errors.join(' ');
          duplicateWarnings.push(`"${taskTitle}": ${errorMessage}`);
          console.log(`⚠️ ${taskTitle}: 피드백 검증 실패 - ${errorMessage}`);
          continue;
        }
      }

      // AI 기반 중복 검사는 현재 피평가자의 피드백만 검사 (다른 피평가자와의 비교는 제거)
      console.log('🤖 현재 피평가자의 피드백만 AI 검수 진행:', employeeId);
      
      // 현재 피평가자의 기존 피드백만 수집 (자기 자신의 이전 피드백과만 비교)
      const currentEvaluateeFeedbacks: string[] = [];
      try {
        const evaluation = await evaluationService.getEvaluationByEmployeeId(employeeId);
        if (evaluation) {
          const currentTasks = await taskService.getTasksByEvaluationId(evaluation.id);
          console.log(`📝 현재 피평가자(${employeeId})의 과업 수:`, currentTasks.length);
          
          for (const task of currentTasks) {
            // 현재 과업의 기존 피드백 수집 (현재 입력 중인 피드백 제외)
            if (task.feedback && task.feedback.trim()) {
              currentEvaluateeFeedbacks.push(task.feedback.trim());
              console.log(`✅ 기존 피드백 수집 (${task.title}):`, task.feedback.substring(0, 50) + '...');
            }
            
            // 현재 과업의 피드백 히스토리도 수집
            try {
              const feedbackHistory = await feedbackService.getFeedbackHistoryByTaskId(task.task_id);
              console.log(`📚 ${task.title} 히스토리 개수:`, feedbackHistory.length);
              for (const fh of feedbackHistory) {
                if (fh.content && fh.content.trim()) {
                  currentEvaluateeFeedbacks.push(fh.content.trim());
                  console.log(`✅ 히스토리 피드백 수집:`, fh.content.substring(0, 50) + '...');
                }
              }
            } catch (historyError) {
              console.warn(`⚠️ ${task.title} 히스토리 조회 실패:`, historyError);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ 현재 피평가자 피드백 수집 실패:', error);
      }

      console.log('📊 현재 피평가자의 기존 피드백 총 개수:', currentEvaluateeFeedbacks.length);

      // AI 기반 중복 검사 (현재 피평가자의 기존 피드백과만 비교) - 병렬 처리
      if (currentEvaluateeFeedbacks.length > 0) {
        console.log('🤖 AI 기반 중복 검사 시작 (병렬 처리)...');
        
        // 모든 AI 검사를 병렬로 실행
        const aiCheckPromises = Object.keys(tempFeedbacks)
          .filter(taskId => tempFeedbacks[taskId] && tempFeedbacks[taskId].trim())
          .map(async (taskId) => {
            const currentFeedback = tempFeedbacks[taskId];
            const task = evaluationData.tasks.find(t => t.id === taskId);
            const taskTitle = task?.title || `과업 ${taskId}`;

            try {
              console.log(`🤖 AI 중복 검사 시작: ${taskTitle}`);
              const duplicateCheck = await checkSimilarFeedback(
                currentFeedback, 
                currentEvaluateeFeedbacks,
                user.name
              );
              
              console.log(`🔍 ${taskTitle} AI 검사 결과:`, {
                isDuplicate: duplicateCheck.isDuplicate,
                summary: duplicateCheck.summary
              });
              
              if (duplicateCheck.isDuplicate) {
                console.log(`⚠️ AI 중복 피드백 감지: ${taskTitle} - ${duplicateCheck.summary}`);
                return { taskTitle, warning: `"${taskTitle}": ${duplicateCheck.summary}` };
              }
              return null;
            } catch (error) {
              console.warn(`⚠️ AI 중복검사 건너뜀 (API 오류): ${taskTitle}`, error.message);
              return null;
            }
          });

        // 모든 AI 검사 완료 대기
        const aiCheckResults = await Promise.all(aiCheckPromises);
        
        // 경고 수집
        aiCheckResults.forEach(result => {
          if (result && result.warning) {
            duplicateWarnings.push(result.warning);
          }
        });
      } else {
        console.log('⏭️ 현재 피평가자의 기존 피드백이 없어 AI 검사 건너뜀');
      }

      console.log('📝 최종 중복 경고 개수:', duplicateWarnings.length);
      console.log('⚠️ 감지된 경고들:', duplicateWarnings);
      
      // 3. 중복 경고 처리
      if (duplicateWarnings.length > 0) {
        console.log('⚠️ 중복 피드백 경고 표시:', duplicateWarnings);
        const shouldContinue = window.confirm(
          `⚠️ 성의없는 피드백이 감지되었습니다:\n\n${duplicateWarnings.join('\n\n')}\n\n계속 저장하시겠습니까?`
        );
        
        if (!shouldContinue) {
          console.log('❌ 사용자가 저장 취소');
          return false;
        } else {
          console.log('✅ 사용자가 경고 무시하고 저장 진행');
        }
      } else {
        console.log('✅ 중복 피드백 없음 - 저장 진행');
      }

      // 4. 데이터베이스 저장
      const evaluation = await evaluationService.getEvaluationByEmployeeId(employeeId);
      if (!evaluation) throw new Error('평가 정보를 찾을 수 없습니다.');

      const dbTasks = await taskService.getTasksByEvaluationId(evaluation.id);
      
      console.log('🗄️ 데이터베이스에서 조회된 과업 정보:', {
        dbTaskCount: dbTasks.length,
        dbTasks: dbTasks.map(t => ({
          id: t.id,
          task_id: t.task_id,
          title: t.title,
          weight: t.weight,
          score: t.score,
          contribution_method: t.contribution_method,
          contribution_scope: t.contribution_scope,
          feedback: t.feedback?.substring(0, 30) + '...' || '(없음)'
        }))
      });

      // 5. 각 과업별로 피드백 처리 및 업데이트
      for (const task of evaluationData.tasks) {
        const dbTask = dbTasks.find(t => t.task_id === task.id);
        if (!dbTask) continue;

        const currentFeedback = tempFeedbacks[task.id] || '';
        const previousFeedback = dbTask.feedback || ''; // 데이터베이스에 저장된 피드백과 비교
        
        console.log('🔍 피드백 비교 상세:', {
          taskTitle: task.title,
          taskId: task.id,
          dbTaskId: dbTask.task_id,
          currentFeedback: currentFeedback,
          previousFeedback: previousFeedback,
          currentTrimmed: currentFeedback.trim(),
          previousTrimmed: previousFeedback.trim(),
          isEmpty: !currentFeedback.trim(),
          isChanged: currentFeedback.trim() !== previousFeedback.trim(),
          tempFeedbacksKeys: Object.keys(tempFeedbacks),
          hasCurrentFeedback: !!tempFeedbacks[task.id]
        });

        // 과업 변경사항 추적을 위한 변수
        let hasChanges = false;
        let hasNewFeedback = false;
        let changeDetails: string[] = [];

        // 피드백 변경 상세 분석
        console.log('🔍 피드백 변경 분석:', {
          taskTitle: task.title,
          currentFeedback: currentFeedback,
          previousFeedback: previousFeedback,
          currentTrimmed: currentFeedback.trim(),
          previousTrimmed: previousFeedback.trim(),
          isEmpty: !currentFeedback.trim(),
          isChanged: currentFeedback.trim() !== previousFeedback.trim(),
          exact_comparison: currentFeedback !== previousFeedback
        });

        // 피드백이 있고 변경되었을 때 히스토리에 저장 (새로운 피드백이거나 변경된 피드백)
        if (currentFeedback.trim() && (currentFeedback.trim() !== previousFeedback.trim() || !previousFeedback.trim())) {
          const isNewFeedback = !previousFeedback.trim();
          const isChangedFeedback = currentFeedback.trim() !== previousFeedback.trim();
          
          console.log('💬 피드백 변경 감지 - 히스토리 저장:', {
            dbTaskId: dbTask.id,
            taskId: task.id,
            previousFeedback: previousFeedback || '(없음)',
            currentFeedback: currentFeedback,
            evaluator_name: user.name,
            isNewFeedback: isNewFeedback,
            isChangedFeedback: isChangedFeedback
          });
          
          try {
            console.log('💾 피드백 히스토리 저장 시도:', {
              task_uuid: dbTask.id,
              task_id: dbTask.task_id,
              content_length: currentFeedback.length,
              evaluator_name: user.name,
              evaluator_id: user.id
            });

            const savedFeedback = await feedbackService.createFeedbackHistory({
              task_id: dbTask.task_id, // tasks 테이블의 task_id (H1411166_T1 등) 사용
              content: currentFeedback,
              evaluator_name: user.name
            });
            
            console.log('✅ 피드백 히스토리 저장 완료:', {
              feedbackId: savedFeedback.id,
              taskId: dbTask.id,
              createdAt: savedFeedback.created_at,
              isNewFeedback: isNewFeedback,
              isChangedFeedback: isChangedFeedback
            });
            hasNewFeedback = true;
            hasChanges = true;
            changeDetails.push('피드백');
          } catch (error) {
            console.error('❌ 피드백 히스토리 저장 실패:', error);
            console.error('피드백 저장 실패 상세:', {
              error: error,
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : 'No stack',
              task_uuid: dbTask.id,
              task_id: dbTask.task_id,
              feedback_length: currentFeedback.length
            });
          }
        } else if (currentFeedback.trim() && currentFeedback.trim() === previousFeedback.trim()) {
          console.log('⚪ 피드백 변경 없음 - 히스토리 저장 건너뜀:', {
            taskTitle: task.title,
            feedback: currentFeedback.substring(0, 50) + '...',
            reason: 'same_content'
          });
        } else if (!currentFeedback.trim()) {
          console.log('⚪ 피드백 비어있음 - 히스토리 저장 건너뜀:', {
            taskTitle: task.title,
            reason: 'empty_feedback'
          });
        } else {
          console.log('⚪ 피드백 처리 완료:', {
            taskTitle: task.title,
            hasCurrentFeedback: !!currentFeedback.trim(),
            hasPreviousFeedback: !!previousFeedback.trim(),
            isChanged: currentFeedback.trim() !== previousFeedback.trim()
          });
        }

        // 과업 정보 업데이트
        const updateData: any = {};
        
        // 피드백이 있으면 업데이트
        if (currentFeedback.trim()) {
          updateData.feedback = currentFeedback;
          updateData.feedback_date = new Date().toISOString();
          updateData.evaluator_name = user.name;
        }

        // 다른 과업 정보도 업데이트하고 변경사항 추적
        console.log('🔍 변경사항 검사:', {
          taskId: task.id,
          taskTitle: task.title,
          currentWeight: task.weight,
          dbWeight: dbTask.weight,
          currentScore: task.score,
          dbScore: dbTask.score,
          currentMethod: task.contributionMethod,
          dbMethod: dbTask.contribution_method,
          currentScope: task.contributionScope,
          dbScope: dbTask.contribution_scope
        });

        // 가중치 변경 확인
        if (task.weight !== dbTask.weight) {
          updateData.weight = task.weight;
          hasChanges = true;
          changeDetails.push(`가중치(${task.weight}%)`);
          console.log('📊 가중치 변경 감지:', `${dbTask.weight}% → ${task.weight}%`);
        } else {
          console.log('📊 가중치 변경 없음:', `${dbTask.weight}% = ${task.weight}%`);
        }
        
        // 점수 변경 확인 (undefined/null 처리 개선)
        const currentScore = task.score;
        const dbScore = dbTask.score;
        if (currentScore !== dbScore) {
          if (currentScore !== undefined && currentScore !== null) {
            updateData.score = currentScore;
            hasChanges = true;
            changeDetails.push(`점수(${currentScore}점)`);
            console.log('🎯 점수 변경 감지:', `${dbScore || 'null'} → ${currentScore}`);
          } else {
            console.log('🎯 점수 제거 감지:', `${dbScore || 'null'} → ${currentScore || 'null'}`);
          }
        } else {
          console.log('🎯 점수 변경 없음:', `${dbScore || 'null'} = ${currentScore || 'null'}`);
        }
        
        // 기여방식 변경 확인 (null/undefined 정규화하여 비교)
        const currentMethod = task.contributionMethod || null;
        const dbMethod = dbTask.contribution_method || null;
        if (currentMethod !== dbMethod) {
          // 데이터베이스 업데이트
          updateData.contribution_method = currentMethod;
          
          // 알림에 변경사항 포함 (값이 있든 없든 변경은 변경)
          hasChanges = true;
          if (currentMethod) {
            changeDetails.push(`기여방식(${currentMethod})`);
            console.log('🔧 기여방식 변경 감지:', `${dbMethod || 'null'} → ${currentMethod}`);
          } else {
            changeDetails.push('기여방식 제거됨');
            console.log('🔧 기여방식 제거 감지:', `${dbMethod || 'null'} → null`);
          }
        } else {
          console.log('🔧 기여방식 변경 없음:', `${dbMethod || 'null'} = ${currentMethod || 'null'}`);
        }
        
        // 기여범위 변경 확인 (null/undefined 정규화하여 비교)
        const currentScope = task.contributionScope || null;
        const dbScope = dbTask.contribution_scope || null;
        if (currentScope !== dbScope) {
          // 데이터베이스 업데이트
          updateData.contribution_scope = currentScope;
          
          // 알림에 변경사항 포함 (값이 있든 없든 변경은 변경)
          hasChanges = true;
          if (currentScope) {
            changeDetails.push(`기여범위(${currentScope})`);
            console.log('🎚️ 기여범위 변경 감지:', `${dbScope || 'null'} → ${currentScope}`);
          } else {
            changeDetails.push('기여범위 제거됨');
            console.log('🎚️ 기여범위 제거 감지:', `${dbScope || 'null'} → null`);
          }
        } else {
          console.log('🎚️ 기여범위 변경 없음:', `${dbScope || 'null'} = ${currentScope || 'null'}`);
        }

        // 업데이트할 데이터가 있으면 실행
        if (Object.keys(updateData).length > 0) {
          await taskService.updateTask(dbTask.id, updateData);
        }

        // 변경된 과업 기록 (알림용)
        if (hasChanges) {
          const taskChange = {
            id: task.id,
            title: task.title,
            hasNewFeedback,
            changeDetails: changeDetails.join(', ')
          };
          changedTasks.push(taskChange);
          console.log('📝 변경된 과업 기록:', taskChange);
        } else {
          console.log('📝 변경사항 없음:', task.title);
        }
      }

      // 6. 평가 상태 업데이트
      const isComplete = isEvaluationComplete();
      await evaluationService.updateEvaluation(evaluation.id, {
        evaluation_status: isComplete ? 'completed' : 'in-progress',
        last_modified: new Date().toISOString()
      });

      // 7. 로컬 상태 업데이트
      setEvaluationData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          evaluationStatus: isComplete ? 'completed' : 'in-progress',
          lastModified: new Date().toISOString()
        };
      });

      // 8. 과업별 개별 알림 생성 (평가자가 저장할 때만)
      console.log('📧 알림 생성 검사:', {
        userRole: user.role,
        changedTasksCount: changedTasks.length,
        changedTasks: changedTasks.map(t => ({ title: t.title, changes: t.changeDetails }))
      });

      if (user.role === 'evaluator' && changedTasks.length > 0) {
        console.log('📩 과업별 개별 알림 생성 시작...');
        
        // 각 과업별로 개별 알림 생성
        for (const task of changedTasks) {
          if (task.changeDetails) {
            const message = `"${task.title}" 과업이 업데이트되었습니다.\n\n변경사항: ${task.changeDetails}`;
            
            console.log('📤 과업별 알림 메시지:', {
              taskTitle: task.title,
              changeDetails: task.changeDetails,
              message: message
            });

            console.log('📧 과업별 알림 전송 정보:', {
              recipientId: employeeId,
              senderId: user.id,
              senderName: user.name,
              taskTitle: task.title,
              messagePreview: message.substring(0, 50) + '...'
            });

            try {
              await addNotification({
                recipientId: employeeId,
                title: `평가 업데이트: ${task.title}`,
                message: message,
                type: 'task_updated',
                priority: 'medium',
                senderId: user.id,
                senderName: user.name,
                relatedEvaluationId: employeeId,
                relatedTaskId: task.id
              });
              
              console.log('✅ 과업별 알림 생성 완료:', {
                taskId: task.id,
                taskTitle: task.title,
                recipient: employeeId,
                messageLength: message.length
              });
            } catch (error) {
              console.error('❌ 과업별 알림 생성 실패:', error);
              console.error('과업별 알림 생성 실패 상세:', {
                error: error,
                stack: error instanceof Error ? error.stack : 'No stack',
                taskId: task.id,
                taskTitle: task.title,
                recipientId: employeeId,
                senderId: user.id
              });
            }
          }
        }
        
        console.log('✅ 모든 과업별 알림 생성 완료:', {
          totalTasks: changedTasks.length,
          recipient: employeeId
        });
      } else {
        console.log('⚠️ 알림 생성 조건 불만족:', {
          userRole: user.role,
          isEvaluator: user.role === 'evaluator',
          hasChanges: changedTasks.length > 0
        });
      }

      toast({
        title: "평가 저장 완료",
        description: `평가 내용이 성공적으로 저장되었습니다. ${isComplete ? '평가가 완료되었습니다.' : ''}`,
      });

      // 9. 저장 후 데이터 새로고침 (피드백 히스토리 즉시 반영)
      console.log('🔄 평가 저장 완료 - 최신 데이터 새로고침 (피드백 히스토리 포함)');
      await loadEvaluationData();

      // 10. 피평가자에게도 즉시 데이터 새로고침 신호 (localStorage 업데이트)
      if (user.role === 'evaluator') {
        console.log('📤 피평가자용 데이터 localStorage 업데이트');
        // 평가 데이터를 localStorage에도 업데이트하여 피평가자가 즉시 볼 수 있도록 함
        localStorage.setItem(`evaluation-${employeeId}`, JSON.stringify({
          ...evaluationData,
          lastModified: new Date().toISOString()
        }));
      }

      console.log('✅ 평가 저장 완료');
      return true;
    } catch (error) {
      console.error('❌ 평가 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "평가 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    evaluationData,
    isLoading,
    handleWeightChange,
    handleMethodClick,
    handleScopeClick,
    handleFeedbackChange,
    handleTaskUpdate,
    calculateTotalScore,
    isEvaluationComplete,
    isAchieved,
    handleSave,
    reloadData: loadEvaluationData
  };
}; 