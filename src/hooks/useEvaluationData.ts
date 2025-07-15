import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { EvaluationData, Task, FeedbackHistoryItem } from '@/types/evaluation';
import { getEmployeeData } from '@/utils/employeeData';
import { checkSimilarFeedback } from '@/lib/openai';

export const useEvaluationData = (employeeId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  const employeeInfo = getEmployeeData(employeeId);

  // 점수 매트릭스 (방식 x 범위) - 의존적, 독립적, 상호적, 전략적 순서
  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

  const contributionMethods = ['총괄', '리딩', '실무', '지원'];
  const contributionScopes = ['의존적', '독립적', '상호적', '전략적'];

  // Mock data with dynamic employee info
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    evaluateeId: employeeId,
    evaluateeName: employeeInfo.name,
    evaluateePosition: employeeInfo.position,
    evaluateeDepartment: employeeInfo.department,
    growthLevel: employeeInfo.growthLevel,
    evaluationStatus: 'in-progress',
    lastModified: new Date().toISOString(),
    tasks: [
      {
        id: '1',
        title: '브랜드 캠페인 기획',
        description: 'Q2 신제품 출시를 위한 통합 브랜드 캠페인 기획 및 실행',
        weight: 30,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        feedbackHistory: []
      },
      {
        id: '2',
        title: '고객 만족도 조사',
        description: '기존 고객 대상 만족도 조사 설계 및 분석',
        weight: 25,
        startDate: '2024-02-01',
        endDate: '2024-04-01',
        feedbackHistory: []
      },
      {
        id: '3',
        title: '소셜미디어 콘텐츠 관리',
        description: '월간 소셜미디어 콘텐츠 계획 및 게시물 관리',
        weight: 20,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        feedbackHistory: []
      },
      {
        id: '4',
        title: '팀 프로젝트 협업',
        description: '디자인팀과의 협업 프로젝트 진행',
        weight: 25,
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        feedbackHistory: []
      }
    ]
  });

  // Store feedback temporarily without adding to history
  const [tempFeedbacks, setTempFeedbacks] = useState<Record<string, string>>({});

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`evaluation-${employeeId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEvaluationData(prev => ({
          ...parsedData,
          evaluateeName: employeeInfo.name,
          evaluateePosition: employeeInfo.position,
          evaluateeDepartment: employeeInfo.department,
          growthLevel: employeeInfo.growthLevel,
        }));

        const initialTempFeedbacks: Record<string, string> = {};
        parsedData.tasks.forEach((task: Task) => {
          if (task.feedback) {
            initialTempFeedbacks[task.id] = task.feedback;
          }
        });
        setTempFeedbacks(initialTempFeedbacks);
      } catch (error) {
        console.error('Failed to load saved evaluation data:', error);
      }
    }
  }, [employeeId, employeeInfo.name, employeeInfo.position, employeeInfo.department, employeeInfo.growthLevel]);

  const updateTask = (taskId: string, field: keyof Task, value: any) => {
    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, [field]: value };
        }
        return task;
      }),
      lastModified: new Date().toISOString()
    }));
  };

  const handleTaskUpdate = (taskId: string, updates: { title?: string; description?: string; startDate?: string; endDate?: string }) => {
    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === taskId 
          ? { ...t, ...updates, lastModified: new Date().toISOString() }
          : t
      ),
      lastModified: new Date().toISOString()
    }));

    if (user?.role === 'evaluator') {
      const changes = Object.entries(updates)
        .filter(([_, value]) => value !== undefined && value !== task[_ as keyof Task])
        .map(([key, value]) => {
          switch (key) {
            case 'title': return `과업명: ${value}`;
            case 'description': return `설명: ${value}`;
            case 'startDate': return `시작일: ${value}`;
            case 'endDate': return `종료일: ${value}`;
            default: return `${key}: ${value}`;
          }
        });

      if (changes.length > 0) {
        addNotification({
          recipientId: employeeId,
          title: `"${task.title}" 과업 수정`,
          message: `• ${changes.join('\n• ')}`,
          type: 'task_summary',
          priority: 'medium',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }
    }
  };

  const handleWeightChange = (taskId: string, weight: number) => {
    const task = evaluationData.tasks.find(t => t.id === taskId);
    const previousWeight = task?.weight;
    
    updateTask(taskId, 'weight', weight);
    
    if (user?.role === 'evaluator' && task && previousWeight !== weight) {
      addNotification({
        recipientId: employeeId,
        title: `"${task.title}" 과업 수정`,
        message: `• 가중치 변경: ${previousWeight}% → ${weight}%`,
        type: 'task_summary',
        priority: 'medium',
        senderId: user.id,
        senderName: user.name,
        relatedEvaluationId: employeeId,
        relatedTaskId: taskId
      });
    }
    
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
    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousScore = task.score;
    const previousMethod = task.contributionMethod;
    const updatedTask = { ...task, contributionMethod: method };
    
    if (method === '기여없음') {
      updatedTask.contributionScope = '기여없음';
      updatedTask.score = 0;
    } else if (updatedTask.contributionScope && updatedTask.contributionScope !== '기여없음') {
      const methodIndex = contributionMethods.indexOf(method);
      const scopeIndex = contributionScopes.indexOf(updatedTask.contributionScope);
      if (methodIndex !== -1 && scopeIndex !== -1) {
        updatedTask.score = scoreMatrix[methodIndex][scopeIndex];
      }
    }

    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
      lastModified: new Date().toISOString()
    }));

    if (user?.role === 'evaluator') {
      const changes: string[] = [];
      
      if (previousMethod !== method) {
        changes.push(`기여방식 변경: ${previousMethod || '미설정'} → ${method}`);
      }

      if (previousScore !== updatedTask.score) {
        changes.push(`점수 변경: ${previousScore || 0}점 → ${updatedTask.score}점`);
      }

      if (changes.length > 0) {
        addNotification({
          recipientId: employeeId,
          title: `"${task.title}" 과업 수정`,
          message: `• ${changes.join('\n• ')}`,
          type: 'task_summary',
          priority: 'high',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }
    }
  };

  const handleScopeClick = (taskId: string, scope: string) => {
    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousScore = task.score;
    const previousScope = task.contributionScope;
    const updatedTask = { ...task, contributionScope: scope };
    
    if (scope === '기여없음') {
      updatedTask.contributionMethod = '기여없음';
      updatedTask.score = 0;
    } else if (updatedTask.contributionMethod && updatedTask.contributionMethod !== '기여없음') {
      const methodIndex = contributionMethods.indexOf(updatedTask.contributionMethod);
      const scopeIndex = contributionScopes.indexOf(scope);
      if (methodIndex !== -1 && scopeIndex !== -1) {
        updatedTask.score = scoreMatrix[methodIndex][scopeIndex];
      }
    }

    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
      lastModified: new Date().toISOString()
    }));

    if (user?.role === 'evaluator') {
      const changes: string[] = [];
      
      if (previousScope !== scope) {
        changes.push(`기여범위 변경: ${previousScope || '미설정'} → ${scope}`);
      }

      if (previousScore !== updatedTask.score) {
        changes.push(`점수 변경: ${previousScore || 0}점 → ${updatedTask.score}점`);
      }

      if (changes.length > 0) {
        addNotification({
          recipientId: employeeId,
          title: `"${task.title}" 과업 수정`,
          message: `• ${changes.join('\n• ')}`,
          type: 'task_summary',
          priority: 'high',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }
    }
  };

  const handleFeedbackChange = (taskId: string, feedback: string) => {
    setTempFeedbacks(prev => ({
      ...prev,
      [taskId]: feedback
    }));

    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId 
          ? { ...task, feedback }
          : task
      ),
      lastModified: new Date().toISOString()
    }));
  };

  const calculateTotalScore = () => {
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
    return evaluationData.tasks.every(task => task.score !== undefined);
  };

  const isAchieved = () => {
    const { flooredScore } = calculateTotalScore();
    return flooredScore >= evaluationData.growthLevel;
  };

  const handleSave = async () => {
    try {
      // Check if total weight is 100%
      const totalWeight = evaluationData.tasks.reduce((sum, task) => sum + task.weight, 0);
      
      if (totalWeight !== 100) {
        toast({
          title: "저장 실패",
          description: `가중치 합계가 100%가 아닙니다. 현재: ${totalWeight}%\n가중치를 조정한 후 다시 저장해주세요.`,
          variant: "destructive",
        });
        return false;
      }

      // 자동 중복검사 수행
      const duplicateWarnings: string[] = [];
      
      for (const task of evaluationData.tasks) {
        const currentFeedback = tempFeedbacks[task.id] || task.feedback || '';
        if (currentFeedback.trim()) {
          // 현재 과업의 기존 피드백들을 제외한 다른 피드백들 수집
          const otherFeedbacks = evaluationData.tasks
            .filter(t => t.id !== task.id) // 현재 과업 제외
            .flatMap(t => {
              const feedbacks = [];
              if (t.feedback && t.feedback.trim()) feedbacks.push(t.feedback);
              if (t.feedbackHistory) {
                feedbacks.push(...t.feedbackHistory.map(fh => fh.content));
              }
              return feedbacks;
            })
            .filter(fb => fb.trim());

          if (otherFeedbacks.length > 0) {
            try {
              const duplicateCheck = await checkSimilarFeedback(currentFeedback, otherFeedbacks);
              if (!duplicateCheck.includes('유사한 피드백이 없습니다')) {
                duplicateWarnings.push(`"${task.title}": ${duplicateCheck}`);
              }
            } catch (error) {
              console.error('중복검사 중 오류:', error);
              // 중복검사 실패시에도 저장은 진행
            }
          }
        }
      }

      // 중복 경고가 있으면 사용자에게 알림
      if (duplicateWarnings.length > 0) {
        const shouldContinue = window.confirm(
          `다음 과업들의 피드백이 다른 과업과 유사할 수 있습니다:\n\n${duplicateWarnings.join('\n\n')}\n\n계속 저장하시겠습니까?`
        );
        
        if (!shouldContinue) {
          return false;
        }
      }

      const previousDataString = localStorage.getItem(`evaluation-${employeeId}`);
      let previousData: EvaluationData | null = null;
      
      if (previousDataString) {
        try {
          previousData = JSON.parse(previousDataString);
        } catch (error) {
          console.error('Failed to parse previous data:', error);
        }
      }

      const updatedTasks = evaluationData.tasks.map(task => {
        const currentFeedback = tempFeedbacks[task.id] || '';
        const previousTask = previousData?.tasks.find(t => t.id === task.id);
        const previousFeedback = previousTask?.feedback || '';

        let updatedFeedbackHistory = task.feedbackHistory || [];

        if (currentFeedback.trim() && currentFeedback !== previousFeedback) {
          const newFeedbackItem: FeedbackHistoryItem = {
            id: `feedback-${Date.now()}-${task.id}`,
            content: currentFeedback,
            date: new Date().toISOString(),
            evaluatorName: user?.name || '평가자',
            evaluatorId: user?.id || 'unknown'
          };
          updatedFeedbackHistory = [...updatedFeedbackHistory, newFeedbackItem];

          if (user?.role === 'evaluator') {
            addNotification({
              recipientId: employeeId,
              title: `"${task.title}" 과업 수정`,
              message: `• 피드백 등록`,
              type: 'task_summary',
              priority: 'medium',
              senderId: user.id,
              senderName: user.name,
              relatedEvaluationId: employeeId,
              relatedTaskId: task.id
            });
          }
        }

        return {
          ...task,
          feedback: currentFeedback,
          feedbackHistory: updatedFeedbackHistory,
          feedbackDate: currentFeedback !== previousFeedback ? new Date().toISOString() : task.feedbackDate,
          evaluatorName: user?.name || task.evaluatorName
        };
      });

      const updatedData = {
        ...evaluationData,
        tasks: updatedTasks,
        evaluationStatus: isEvaluationComplete() ? 'completed' as const : 'in-progress' as const,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(`evaluation-${employeeId}`, JSON.stringify(updatedData));
      setEvaluationData(updatedData);
      
      toast({
        title: "평가 저장 완료",
        description: `평가 내용이 성공적으로 저장되었습니다. ${isEvaluationComplete() ? '평가가 완료되었습니다.' : ''}`,
      });

      return true;
    } catch (error) {
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
    handleWeightChange,
    handleMethodClick,
    handleScopeClick,
    handleFeedbackChange,
    handleTaskUpdate,
    calculateTotalScore,
    isEvaluationComplete,
    isAchieved,
    handleSave
  };
};
