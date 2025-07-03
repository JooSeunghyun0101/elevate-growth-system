import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, MessageCircle, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { EvaluationData } from '@/types/evaluation';
import TaskManagement from './TaskManagement';

export const EvaluateeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [showTaskManagement, setShowTaskManagement] = useState(false);

  // Load evaluation data for the current user
  useEffect(() => {
    if (user) {
      loadMyEvaluationData();
      
      // Refresh data every 5 seconds to catch changes from evaluator
      const interval = setInterval(loadMyEvaluationData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMyEvaluationData = () => {
    if (!user) return;
    
    const savedData = localStorage.getItem(`evaluation-${user.id}`);
    if (savedData) {
      try {
        const parsedData: EvaluationData = JSON.parse(savedData);
        setEvaluationData(parsedData);
      } catch (error) {
        console.error('Failed to load evaluation data:', error);
      }
    } else {
      // Create default evaluation data if none exists
      const defaultData: EvaluationData = {
        evaluateeId: user.id,
        evaluateeName: user.name,
        evaluateePosition: user.position || '사원',
        evaluateeDepartment: user.department,
        growthLevel: user.growthLevel || 1,
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
      };
      setEvaluationData(defaultData);
    }
  };

  if (!user || !evaluationData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-gray-500">평가 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const completedTasks = evaluationData.tasks.filter(task => task.score !== undefined).length;
  const progress = Math.round((completedTasks / evaluationData.tasks.length) * 100);
  const totalScore = Math.floor(evaluationData.tasks.reduce((sum, task) => {
    if (task.score) {
      return sum + (task.score * task.weight / 100);
    }
    return sum;
  }, 0));

  const isAchieved = totalScore >= evaluationData.growthLevel;
  const feedbackCount = evaluationData.tasks.filter(task => task.feedback).length;

  // Updated stats with only 3 cards (removed current score)
  const myStats = [
    { 
      label: '등록한 과업', 
      value: `${evaluationData.tasks.length}개`, 
      icon: Target, 
      color: 'text-orange-600' 
    },
    { 
      label: '완료된 평가', 
      value: `${completedTasks}개`, 
      icon: TrendingUp, 
      color: 'text-yellow-600' 
    },
    { 
      label: '받은 피드백', 
      value: `${feedbackCount}건`, 
      icon: MessageCircle, 
      color: 'text-amber-600' 
    }
  ];

  const getStatusBadge = (status: 'completed' | 'in-review' | 'in-progress' | 'ongoing') => {
    switch (status) {
      case 'completed':
        return <Badge className="status-achieved">평가 완료</Badge>;
      case 'in-review':
        return <Badge className="status-in-progress">검토 중</Badge>;
      case 'in-progress':
        return <Badge variant="outline">진행 중</Badge>;
      case 'ongoing':
        return <Badge variant="secondary">상시 업무</Badge>;
      default:
        return <Badge variant="outline">대기</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">내 성과 대시보드</h2>
          <p className="text-muted-foreground">
            {user.name} {user.position} • {user.department}
          </p>
        </div>
        <Button 
          className="ok-orange hover:opacity-90"
          onClick={() => setShowTaskManagement(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          과업 관리
        </Button>
      </div>

      {/* My Stats - Updated to 3 columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {myStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary - Updated order and text */}
      <Card>
        <CardHeader>
          <CardTitle>나의 성과 요약</CardTitle>
          <CardDescription>현재 평가 점수와 달성 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">Lv.{evaluationData.growthLevel}</div>
              <p className="text-sm text-muted-foreground">성장 레벨</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{totalScore}</div>
              <p className="text-sm text-muted-foreground">현재 점수</p>
            </div>
            <div className="text-center">
              <Badge 
                className={`text-lg px-4 py-2 ${isAchieved ? 'status-achieved' : 'status-in-progress'}`}
              >
                {isAchieved ? '달성' : '미달성'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">현재 상태</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>전체 진행률</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="[&>div]:ok-orange" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">내 과업</TabsTrigger>
          <TabsTrigger value="feedback">받은 피드백</TabsTrigger>
          <TabsTrigger value="history">평가 이력</TabsTrigger>
          <TabsTrigger value="goals">목표 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>등록한 과업 목록</CardTitle>
                  <CardDescription>
                    총 가중치: {evaluationData.tasks.reduce((sum, task) => sum + task.weight, 0)}% • 
                    완료: {completedTasks}/{evaluationData.tasks.length}
                  </CardDescription>
                </div>
                <Badge 
                  variant={evaluationData.evaluationStatus === 'completed' ? 'default' : 'secondary'}
                  className={evaluationData.evaluationStatus === 'completed' ? 'status-achieved' : 'status-in-progress'}
                >
                  {evaluationData.evaluationStatus === 'completed' ? '평가 완료' : '평가 진행 중'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationData.tasks.map((task, index) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>가중치: {task.weight}%</span>
                          <span>과업 {index + 1}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {task.score !== undefined ? (
                          <div className="space-y-1">
                            <Badge className="status-achieved mb-1">평가 완료</Badge>
                            <div className="text-sm text-gray-600">
                              {task.score}점/Lv.{evaluationData.growthLevel}
                            </div>
                          </div>
                        ) : (
                          <Badge className="status-in-progress">평가 대기</Badge>
                        )}
                      </div>
                    </div>

                    {task.contributionMethod && task.contributionScope && (
                      <div className="border border-orange-100 bg-white p-3 rounded-md mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">기여 방식/범위</span>
                          <Badge variant="outline" className="border-orange-200 text-orange-700">
                            {task.contributionMethod}/{task.contributionScope}
                          </Badge>
                        </div>
                        {task.feedback && (
                          <p className="text-sm text-gray-700">💬 {task.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>받은 피드백</CardTitle>
              <CardDescription>평가자로부터 받은 모든 피드백</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationData.tasks.filter(task => task.feedback).map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">평가자 피드백</p>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        {task.score}점
                      </Badge>
                    </div>
                    <div className="border border-orange-100 bg-white p-3 rounded-md">
                      <p className="text-sm">💬 {task.feedback}</p>
                    </div>
                  </div>
                ))}
                {evaluationData.tasks.filter(task => task.feedback).length === 0 && (
                  <p className="text-center text-gray-500 py-8">받은 피드백이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>평가 이력</CardTitle>
              <CardDescription>과거 평가 결과와 성장 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">2024년 상반기</h4>
                    <Badge className={evaluationData.evaluationStatus === 'completed' ? 'status-achieved' : 'status-in-progress'}>
                      {evaluationData.evaluationStatus === 'completed' ? '완료' : '진행 중'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-amber-600">Lv.{evaluationData.growthLevel}</div>
                      <p className="text-xs text-muted-foreground">성장 레벨</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{totalScore}</div>
                      <p className="text-xs text-muted-foreground">현재 점수</p>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${isAchieved ? 'text-green-600' : 'text-red-600'}`}>
                        {isAchieved ? '달성' : '미달성'}
                      </div>
                      <p className="text-xs text-muted-foreground">현재 결과</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>목표 설정 및 관리</CardTitle>
              <CardDescription>개인 성장 목표와 달성 계획</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-orange-100 bg-white rounded-lg">
                  <h4 className="font-medium mb-2">2024년 성장 목표</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    현재 레벨 {evaluationData.growthLevel} 달성을 목표로 하며, 
                    총 {totalScore}점 중 {evaluationData.growthLevel}점 이상 달성이 목표입니다.
                  </p>
                  <Progress value={progress} className="mb-2 [&>div]:ok-orange" />
                  <p className="text-xs text-muted-foreground">목표 달성률: {progress}%</p>
                </div>

                <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                  목표 설정 수정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Management Modal */}
      {showTaskManagement && (
        <TaskManagement
          evaluationData={evaluationData}
          onClose={() => setShowTaskManagement(false)}
          onSave={(updatedData) => {
            setEvaluationData(updatedData);
            localStorage.setItem(`evaluation-${user.id}`, JSON.stringify(updatedData));
            setShowTaskManagement(false);
          }}
        />
      )}
    </div>
  );
};
