
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calendar, Plus, Edit, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EvaluateeDashboard: React.FC = () => {
  const myStats = [
    { label: '등록한 과업', value: '5개', icon: Target, color: 'text-blue-600' },
    { label: '현재 진행률', value: '78%', icon: TrendingUp, color: 'text-green-600' },
    { label: '받은 피드백', value: '8건', icon: MessageCircle, color: 'text-purple-600' },
    { label: '평가 마감일', value: '15일', icon: Calendar, color: 'text-orange-600' },
  ];

  const myTasks = [
    {
      id: 1,
      title: '브랜드 캠페인 기획 및 실행',
      weight: 40,
      period: '2024.03 - 2024.06',
      status: 'completed',
      score: 3,
      contributionType: '실무',
      contributionScope: '상호적',
      feedback: '창의적이고 체계적인 접근이 인상적이었습니다. 유관부서와의 협업도 원활했습니다.',
      evaluator: '박서준 팀장'
    },
    {
      id: 2,
      title: '고객 만족도 조사 및 분석',
      weight: 25,
      period: '2024.04 - 2024.05',
      status: 'in-review',
      score: null,
      contributionType: null,
      contributionScope: null,
      feedback: null,
      evaluator: '박서준 팀장'
    },
    {
      id: 3,
      title: '신제품 런칭 지원 업무',
      weight: 20,
      period: '2024.05 - 2024.07',
      status: 'in-progress',
      score: null,
      contributionType: null,
      contributionScope: null,
      feedback: null,
      evaluator: '최수현 팀장'
    },
    {
      id: 4,
      title: '마케팅 자료 제작 및 관리',
      weight: 15,
      period: '2024.01 - 2024.12',
      status: 'ongoing',
      score: 2,
      contributionType: '지원',
      contributionScope: '독립적',
      feedback: '꾸준하고 안정적인 업무 수행이 돋보입니다.',
      evaluator: '최수현 팀장'
    }
  ];

  const currentScore = 2.75; // 예시 점수
  const targetLevel = 1; // 사원 레벨
  const isAchieved = currentScore >= targetLevel;

  const getStatusBadge = (status: string) => {
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
          <p className="text-muted-foreground">나의 과업과 평가 결과를 확인하고 관리하세요</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          과업 추가
        </Button>
      </div>

      {/* My Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>나의 성과 요약</CardTitle>
          <CardDescription>현재 평가 점수와 달성 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{currentScore.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">현재 점수</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Lv.{targetLevel}</div>
              <p className="text-sm text-muted-foreground">목표 레벨 (사원)</p>
            </div>
            <div className="text-center">
              <Badge 
                className={`text-lg px-4 py-2 ${isAchieved ? 'status-achieved' : 'status-not-achieved'}`}
              >
                {isAchieved ? '목표 달성' : '목표 미달성'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">현재 상태</p>
            </div>
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
                  <CardDescription>총 가중치: {myTasks.reduce((sum, task) => sum + task.weight, 0)}%</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  가중치 수정
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{task.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>가중치: {task.weight}%</span>
                          <span>기간: {task.period}</span>
                          <span>평가자: {task.evaluator}</span>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    {task.score && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">평가 결과</span>
                          <Badge variant="outline">
                            {task.contributionScope}/{task.contributionType} (점수: {task.score})
                          </Badge>
                        </div>
                        {task.feedback && (
                          <p className="text-sm text-gray-700">💬 {task.feedback}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-3 space-x-2">
                      <Button variant="outline" size="sm">수정</Button>
                      {task.status === 'in-progress' && (
                        <Button size="sm">진행 상황 업데이트</Button>
                      )}
                    </div>
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
              <CardDescription>평가자들로부터 받은 모든 피드백</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.filter(task => task.feedback).map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.evaluator}</p>
                      </div>
                      <Badge variant="outline">
                        {task.contributionScope}/{task.contributionType}
                      </Badge>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm">💬 {task.feedback}</p>
                    </div>
                  </div>
                ))}
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
                    <Badge className="status-in-progress">진행 중</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{currentScore.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">현재 점수</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold">Lv.1</div>
                      <p className="text-xs text-muted-foreground">목표 레벨</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">달성</div>
                      <p className="text-xs text-muted-foreground">예상 결과</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg opacity-75">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">2023년 연간</h4>
                    <Badge className="status-achieved">달성</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">2.2</div>
                      <p className="text-xs text-muted-foreground">최종 점수</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold">Lv.1</div>
                      <p className="text-xs text-muted-foreground">목표 레벨</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">달성</div>
                      <p className="text-xs text-muted-foreground">최종 결과</p>
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
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">2024년 성장 목표</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    마케팅 전문성을 높이고 프로젝트 리딩 경험을 쌓아 차년도 승진을 목표로 합니다.
                  </p>
                  <Progress value={65} className="mb-2" />
                  <p className="text-xs text-muted-foreground">목표 달성률: 65%</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">전문성 향상</h5>
                    <p className="text-xs text-muted-foreground">마케팅 자격증 취득, 외부 교육 참여</p>
                    <Progress value={80} className="mt-2" />
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">리더십 개발</h5>
                    <p className="text-xs text-muted-foreground">프로젝트 리딩, 멘토링 활동</p>
                    <Progress value={50} className="mt-2" />
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  목표 수정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
