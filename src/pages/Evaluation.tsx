
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

  // Mock data with growth level
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    evaluateeId: id || '1',
    evaluateeName: '이하나',
    evaluateePosition: '사원',
    evaluateeDepartment: '마케팅팀',
    growthLevel: 3,
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
        setEvaluationData(parsedData);
      } catch (error) {
        console.error('Failed to load saved evaluation data:', error);
      }
    }
  }, [id]);

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

  const handleMethodClick = (taskId: string, method: string) => {
    const task = evaluationData.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, contributionMethod: method };
    
    // Calculate score if both method and scope are selected
    if (updatedTask.contributionScope) {
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
    
    // Calculate score if both method and scope are selected
    if (updatedTask.contributionMethod) {
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
          />
        ))}
      </div>
    </div>
  );
};

export default Evaluation;
