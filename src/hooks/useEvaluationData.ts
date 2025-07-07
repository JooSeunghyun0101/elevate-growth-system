import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { EvaluationData, Task } from '@/types/evaluation';
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
        weight: 30
      },
      {
        id: '2',
        title: '고객 만족도 조사',
        description: '기존 고객 대상 만족도 조사 설계 및 분석',
        weight: 25
      },
      {
        id: '3',
        title: '소셜미디어 콘텐츠 관리',
        description: '월간 소셜미디어 콘텐츠 계획 및 게시물 관리',
        weight: 20
      },
      {
        id: '4',
        title: '팀 프로젝트 협업',
        description: '디자인팀과의 협업 프로젝트 진행',
        weight: 25
      }
    ]
  });

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

  const handleWeightChange = (taskId: string, weight: number) => {
    updateTask(taskId, 'weight', weight);
    
    // Show warning if total weight is not 100%
    const newTotalWeight = evaluationData.tasks.reduce((sum, task) => {
      return sum + (task.id === taskId ? weight : task.weight);
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
  };

  const handleScopeClick = (taskId: string, scope: string) => {
    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

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
  };

  const handleFeedbackChange = (taskId: string, feedback: string) => {
    setEvaluationData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              feedback,
              feedbackDate: new Date().toISOString(),
              evaluatorName: user?.name || '평가자'
            }
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

      const updatedData = {
        ...evaluationData,
        evaluationStatus: isEvaluationComplete() ? 'completed' as const : 'in-progress' as const,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(`evaluation-${employeeId}`, JSON.stringify(updatedData));
      setEvaluationData(updatedData);
      
      toast({
        title: "평가 저장 완료",
        description: `평가 내용이 성공적으로 저장되었습니다. ${isEvaluationComplete() ? '평가가 완료되었습니다.' : ''}`,
      });

      // Send notifications only for actual changes when evaluator saves
      if (user?.role === 'evaluator' && previousData) {
        const changes: string[] = [];
        
        // Compare each task for changes
        evaluationData.tasks.forEach(currentTask => {
          const previousTask = previousData.tasks.find(t => t.id === currentTask.id);
          if (!previousTask) return; // Skip new tasks
          
          // Check for evaluation changes
          if (previousTask.contributionMethod !== currentTask.contributionMethod) {
            changes.push(`"${currentTask.title}" 기여방식 변경`);
          }
          
          if (previousTask.contributionScope !== currentTask.contributionScope) {
            changes.push(`"${currentTask.title}" 기여범위 변경`);
          }
          
          if (previousTask.score !== currentTask.score) {
            changes.push(`"${currentTask.title}" 점수 변경`);
          }
          
          if (previousTask.feedback !== currentTask.feedback && currentTask.feedback?.trim()) {
            changes.push(`"${currentTask.title}" 피드백 ${previousTask.feedback ? '수정' : '추가'}`);
          }
        });

        // Send notification only if there are actual changes
        if (changes.length > 0) {
          const changeMessage = changes.length === 1 
            ? changes[0] 
            : `${changes.length}개 변경사항: ${changes.slice(0, 2).join(', ')}${changes.length > 2 ? ' 외' : ''}`;

          addNotification({
            recipientId: employeeId,
            title: isEvaluationComplete() ? '평가 완료' : '평가 내용 수정',
            message: isEvaluationComplete() 
              ? `평가자가 성과평가를 완료했습니다.`
              : `평가자가 평가 내용을 수정했습니다. ${changeMessage}`,
            type: isEvaluationComplete() ? 'evaluation_completed' : 'evaluation_updated',
            priority: isEvaluationComplete() ? 'high' : 'medium',
            senderId: user.id,
            senderName: user.name,
            relatedEvaluationId: employeeId
          });
        } else if (isEvaluationComplete() && previousData.evaluationStatus !== 'completed') {
          // Send completion notification even if no changes in current save
          addNotification({
            recipientId: employeeId,
            title: '평가 완료',
            message: '평가자가 성과평가를 완료했습니다.',
            type: 'evaluation_completed',
            priority: 'high',
            senderId: user.id,
            senderName: user.name,
            relatedEvaluationId: employeeId
          });
        }
      }

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
    calculateTotalScore,
    isEvaluationComplete,
    isAchieved,
    handleSave
  };
};
