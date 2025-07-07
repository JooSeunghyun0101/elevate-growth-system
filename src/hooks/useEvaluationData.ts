
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { EvaluationData, Task, FeedbackHistoryItem } from '@/types/evaluation';
import { getEmployeeData } from '@/utils/employeeData';

export const useEvaluationData = (employeeId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  const employeeInfo = getEmployeeData(employeeId);

  // 점수 매트릭스 (방식 x 범위)
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
        // Update with current employee info but keep evaluation data
        setEvaluationData(prev => ({
          ...parsedData,
          evaluateeName: employeeInfo.name,
          evaluateePosition: employeeInfo.position,
          evaluateeDepartment: employeeInfo.department,
          growthLevel: employeeInfo.growthLevel,
        }));

        // Initialize temp feedbacks with current feedback values
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

    // Send notification to evaluatee if evaluator made changes
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
          title: '과업 내용 변경',
          message: `평가자가 "${task.title}" 과업을 수정했습니다.\n\n변경된 내용:\n${changes.join('\n')}`,
          type: 'task_content_changed',
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
    
    // Send weight change notification
    if (user?.role === 'evaluator' && task && previousWeight !== weight) {
      addNotification({
        recipientId: employeeId,
        title: '과업 가중치 변경',
        message: `"${task.title}" 과업의 가중치가 변경되었습니다.\n${previousWeight}% → ${weight}%`,
        type: 'task_content_changed',
        priority: 'medium',
        senderId: user.id,
        senderName: user.name,
        relatedEvaluationId: employeeId,
        relatedTaskId: taskId
      });
    }
    
    // Show warning if total weight is not 100%
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
    
    // Handle "기여없음" case
    if (method === '기여없음') {
      updatedTask.contributionScope = '기여없음';
      updatedTask.score = 0;
    } else if (updatedTask.contributionScope && updatedTask.contributionScope !== '기여없음') {
      // Calculate score if both method and scope are selected (and not "기여없음")
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

    // Send notifications to evaluatee if evaluator made changes
    if (user?.role === 'evaluator') {
      // Send method change notification
      if (previousMethod !== method) {
        addNotification({
          recipientId: employeeId,
          title: '평가 내용 변경',
          message: `"${task.title}" 과업의 기여방식이 변경되었습니다.\n${previousMethod || '미설정'} → ${method}`,
          type: 'task_content_changed',
          priority: 'medium',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }

      // Send score change notification if score actually changed
      if (previousScore !== updatedTask.score) {
        addNotification({
          recipientId: employeeId,
          title: '평가 점수 변경',
          message: `"${task.title}" 과업의 점수가 변경되었습니다.\n${previousScore || 0}점 → ${updatedTask.score}점`,
          type: 'score_changed',
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
    
    // Handle "기여없음" case
    if (scope === '기여없음') {
      updatedTask.contributionMethod = '기여없음';
      updatedTask.score = 0;
    } else if (updatedTask.contributionMethod && updatedTask.contributionMethod !== '기여없음') {
      // Calculate score if both method and scope are selected (and not "기여없음")
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

    // Send notifications to evaluatee if evaluator made changes
    if (user?.role === 'evaluator') {
      // Send scope change notification
      if (previousScope !== scope) {
        addNotification({
          recipientId: employeeId,
          title: '평가 내용 변경',
          message: `"${task.title}" 과업의 기여범위가 변경되었습니다.\n${previousScope || '미설정'} → ${scope}`,
          type: 'task_content_changed',
          priority: 'medium',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }

      // Send score change notification if score actually changed
      if (previousScore !== updatedTask.score) {
        addNotification({
          recipientId: employeeId,
          title: '평가 점수 변경',
          message: `"${task.title}" 과업의 점수가 변경되었습니다.\n${previousScore || 0}점 → ${updatedTask.score}점`,
          type: 'score_changed',
          priority: 'high',
          senderId: user.id,
          senderName: user.name,
          relatedEvaluationId: employeeId,
          relatedTaskId: taskId
        });
      }
    }
  };

  // Handle temporary feedback changes (don't save to history yet)
  const handleFeedbackChange = (taskId: string, feedback: string) => {
    setTempFeedbacks(prev => ({
      ...prev,
      [taskId]: feedback
    }));

    // Update the current feedback in the task (but not history)
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
      exactScore: Math.round(totalWeightedScore * 10) / 10, // 소수점 첫째자리까지
      flooredScore: Math.floor(totalWeightedScore) // 버림한 정수
    };
  };

  const isEvaluationComplete = () => {
    return evaluationData.tasks.every(task => task.score !== undefined);
  };

  const isAchieved = () => {
    const { flooredScore } = calculateTotalScore();
    return flooredScore >= evaluationData.growthLevel;
  };

  const handleSave = () => {
    try {
      // Get the previously saved data to compare changes
      const previousDataString = localStorage.getItem(`evaluation-${employeeId}`);
      let previousData: EvaluationData | null = null;
      
      if (previousDataString) {
        try {
          previousData = JSON.parse(previousDataString);
        } catch (error) {
          console.error('Failed to parse previous data:', error);
        }
      }

      // Process feedback changes and add to history only if feedback actually changed
      const updatedTasks = evaluationData.tasks.map(task => {
        const currentFeedback = tempFeedbacks[task.id] || '';
        const previousTask = previousData?.tasks.find(t => t.id === task.id);
        const previousFeedback = previousTask?.feedback || '';

        let updatedFeedbackHistory = task.feedbackHistory || [];

        // Only add to history if feedback changed and is not empty
        if (currentFeedback.trim() && currentFeedback !== previousFeedback) {
          const newFeedbackItem: FeedbackHistoryItem = {
            id: `feedback-${Date.now()}-${task.id}`,
            content: currentFeedback,
            date: new Date().toISOString(),
            evaluatorName: user?.name || '평가자',
            evaluatorId: user?.id || 'unknown'
          };
          updatedFeedbackHistory = [...updatedFeedbackHistory, newFeedbackItem];

          // Send feedback notification
          if (user?.role === 'evaluator') {
            addNotification({
              recipientId: employeeId,
              title: '피드백 등록',
              message: `"${task.title}" 과업에 새로운 피드백이 등록되었습니다.\n\n${currentFeedback}`,
              type: 'feedback_added',
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
