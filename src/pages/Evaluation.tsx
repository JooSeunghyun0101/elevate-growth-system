
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, User, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ScoringChart from '@/components/ScoringChart';
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  weight: number;
  contributionMethod?: string;
  contributionScope?: string;
  score?: number;
  feedback?: string;
}

interface EvaluationData {
  evaluateeId: string;
  evaluateeName: string;
  evaluateePosition: string;
  evaluateeDepartment: string;
  growthLevel: number;
  evaluationStatus: 'in-progress' | 'completed';
  lastModified: string;
  tasks: Task[];
}

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

  const calculateWeightedScore = (score: number, weight: number) => {
    return ((score * weight) / 100).toFixed(1);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoBack}
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로 가기
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">성과 평가</h1>
                <p className="text-gray-600">팀원의 과업별 성과를 평가하세요</p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              평가 저장
            </Button>
          </div>

          {/* Evaluatee Info & Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{evaluationData.evaluateeName} {evaluationData.evaluateePosition}</h2>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>{evaluationData.evaluateeDepartment}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 평가 점수</p>
                    <p className="text-2xl font-bold text-orange-500">{calculateTotalScore()}점</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">성장 레벨</p>
                    <p className="text-lg font-semibold text-blue-600">{evaluationData.growthLevel}점</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">달성 여부</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isAchieved() ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-700">달성</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-red-700">미달성</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">완료 과업</p>
                    <p className="text-lg font-semibold">
                      {evaluationData.tasks.filter(task => task.score).length}/{evaluationData.tasks.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tasks Evaluation */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {evaluationData.tasks.map((task, index) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    가중치 {task.weight}%
                  </Badge>
                  {task.score && (
                    <Badge className="bg-orange-500 text-white">
                      {calculateWeightedScore(task.score, task.weight)}점
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left: Scoring Chart */}
                <div className="flex flex-col items-center justify-start">
                  <ScoringChart
                    selectedMethod={task.contributionMethod}
                    selectedScope={task.contributionScope}
                    size="medium"
                    title={`과업 ${index + 1} 스코어링`}
                    onMethodClick={(method) => handleMethodClick(task.id, method)}
                    onScopeClick={(scope) => handleScopeClick(task.id, scope)}
                  />
                </div>

                {/* Right: Feedback Input and Score Display */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`feedback-${task.id}`} className="text-base font-medium mb-3 block">
                      피드백
                    </Label>
                    <Textarea
                      id={`feedback-${task.id}`}
                      placeholder="이 과업에 대한 구체적인 피드백을 작성해주세요..."
                      value={task.feedback || ''}
                      onChange={(e) => updateTask(task.id, 'feedback', e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  {/* Score Display Section - Moved from left side */}
                  {task.score && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">기본 점수</p>
                      <p className="text-2xl font-bold text-orange-500 mb-2">{task.score}점</p>
                      <p className="text-sm text-gray-600">가중치 적용: {calculateWeightedScore(task.score, task.weight)}점</p>
                    </div>
                  )}
                  
                  {task.contributionMethod && task.contributionScope && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">선택된 평가</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">기여방식:</span> {task.contributionMethod}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">기여범위:</span> {task.contributionScope}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">점수:</span> {task.score}점
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Evaluation;
