import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, User, Building2, CheckCircle } from 'lucide-react';
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
  tasks: Task[];
}

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data - 실제로는 API에서 가져올 데이터
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    evaluateeId: id || '1',
    evaluateeName: '이하나',
    evaluateePosition: '사원',
    evaluateeDepartment: '마케팅팀',
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

  const contributionMethods = ['총괄', '리딩', '실무', '지원'];
  const contributionScopes = ['의존적', '독립적', '상호적', '전략적'];

  // 점수 매트릭스 (방식 x 범위)
  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

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
          const updatedTask = { ...task, [field]: value };
          
          // 기여 방식과 범위가 모두 선택되었을 때 점수 자동 계산
          if (field === 'contributionMethod' || field === 'contributionScope') {
            if (updatedTask.contributionMethod && updatedTask.contributionScope) {
              const methodIndex = contributionMethods.indexOf(updatedTask.contributionMethod);
              const scopeIndex = contributionScopes.indexOf(updatedTask.contributionScope);
              updatedTask.score = scoreMatrix[methodIndex][scopeIndex];
            }
          }
          
          return updatedTask;
        }
        return task;
      })
    }));
  };

  const calculateTotalScore = () => {
    return evaluationData.tasks.reduce((sum, task) => {
      if (task.score) {
        return sum + (task.score * task.weight);
      }
      return sum;
    }, 0);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(`evaluation-${id}`, JSON.stringify(evaluationData));
      toast({
        title: "평가 저장 완료",
        description: "평가 내용이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "평가 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
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
                onClick={() => navigate(-1)}
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
          <div className="grid md:grid-cols-2 gap-4">
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
                      {task.score * task.weight}점
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left: Selection Controls */}
                <div className="space-y-4">
                  
                  {/* 기여 방식 선택 */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">기여 방식</Label>
                    <RadioGroup
                      value={task.contributionMethod || ''}
                      onValueChange={(value) => updateTask(task.id, 'contributionMethod', value)}
                    >
                      {contributionMethods.map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <RadioGroupItem value={method} id={`${task.id}-method-${method}`} />
                          <Label htmlFor={`${task.id}-method-${method}`}>{method}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* 기여 범위 선택 */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">기여 범위</Label>
                    <RadioGroup
                      value={task.contributionScope || ''}
                      onValueChange={(value) => updateTask(task.id, 'contributionScope', value)}
                    >
                      {contributionScopes.map((scope) => (
                        <div key={scope} className="flex items-center space-x-2">
                          <RadioGroupItem value={scope} id={`${task.id}-scope-${scope}`} />
                          <Label htmlFor={`${task.id}-scope-${scope}`}>{scope}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* 피드백 입력 */}
                  <div>
                    <Label htmlFor={`feedback-${task.id}`} className="text-base font-medium mb-3 block">
                      피드백
                    </Label>
                    <Textarea
                      id={`feedback-${task.id}`}
                      placeholder="이 과업에 대한 구체적인 피드백을 작성해주세요..."
                      value={task.feedback || ''}
                      onChange={(e) => updateTask(task.id, 'feedback', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Right: Scoring Chart */}
                <div className="flex flex-col items-center justify-start">
                  <ScoringChart
                    selectedMethod={task.contributionMethod}
                    selectedScope={task.contributionScope}
                    size="medium"
                    title={`과업 ${index + 1} 스코어링`}
                  />
                  {task.score && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">기본 점수</p>
                      <p className="text-2xl font-bold text-orange-500">{task.score}점</p>
                      <p className="text-sm text-gray-600 mt-1">가중치 적용: {task.score * task.weight}점</p>
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
