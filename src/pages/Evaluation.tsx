import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import EvaluationHeader from '@/components/Evaluation/EvaluationHeader';
import TaskCard from '@/components/Evaluation/TaskCard';
import { EvaluationData, Task } from '@/types/evaluation';

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Dynamic employee data based on ID
  const getEmployeeData = (employeeId: string) => {
    const employees = {
      '1': { name: '이하나', position: '사원', department: '마케팅팀', growthLevel: 1 },
      '2': { name: '김대리', position: '대리', department: '개발팀', growthLevel: 2 },
      '3': { name: '박차장', position: '차장', department: '영업팀', growthLevel: 3 },
      '4': { name: '최부장', position: '부장', department: '기획팀', growthLevel: 4 },
      '5': { name: '정사원', position: '사원', department: '디자인팀', growthLevel: 1 },
    };
    return employees[employeeId as keyof typeof employees] || employees['1'];
  };

  const employeeInfo = getEmployeeData(id || '1');

  // Mock data with dynamic employee info
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    evaluateeId: id || '1',
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

  // 점수 매트릭스 (방식 x 범위)
  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

  const contributionMethods = ['총괄', '리딩', '실무', '지원'];
  const contributionScopes = ['의존적', '독립적', '상호적', '전략적'];

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`evaluation-${id}`);
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
  }, [id, employeeInfo.name, employeeInfo.position, employeeInfo.department, employeeInfo.growthLevel]);

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
    updateTask(taskId, 'feedback', feedback);
  };

  const calculateTotalScore = () => {
    const totalWeightedScore = evaluationData.tasks.reduce((sum, task) => {
      if (task.score) {
        return sum + (task.score * task.weight / 100);
      }
      return sum;
    }, 0);
    return Math.floor(totalWeightedScore);
  };

  const isEvaluationComplete = () => {
    return evaluationData.tasks.every(task => task.score !== undefined);
  };

  const isAchieved = () => {
    const totalScore = calculateTotalScore();
    return totalScore >= evaluationData.growthLevel;
  };

  const handleSave = () => {
    try {
      const updatedData = {
        ...evaluationData,
        evaluationStatus: isEvaluationComplete() ? 'completed' as const : 'in-progress' as const,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(`evaluation-${id}`, JSON.stringify(updatedData));
      setEvaluationData(updatedData);
      
      toast({
        title: "평가 저장 완료",
        description: `평가 내용이 성공적으로 저장되었습니다. ${isEvaluationComplete() ? '평가가 완료되었습니다.' : ''}`,
      });

      // Navigate back to dashboard after save
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "평가 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (!user || user.role !== 'evaluator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600">평가자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  const achieved = isAchieved();

  return (
    <div className="min-h-screen bg-gray-50">
      <EvaluationHeader
        evaluationData={evaluationData}
        totalScore={totalScore}
        isAchieved={achieved}
        onGoBack={handleGoBack}
        onSave={handleSave}
      />

      {/* Tasks Evaluation */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {evaluationData.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onMethodClick={handleMethodClick}
            onScopeClick={handleScopeClick}
            onFeedbackChange={handleFeedbackChange}
            onWeightChange={handleWeightChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Evaluation;
