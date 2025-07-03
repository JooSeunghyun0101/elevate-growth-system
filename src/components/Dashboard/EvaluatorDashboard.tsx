
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EvaluatorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const myStats = [
    { label: '담당 피평가자', value: '12명', icon: Users, color: 'text-orange-600' },
    { label: '완료한 평가', value: '8건', icon: CheckCircle, color: 'text-yellow-600' },
    { label: '대기 중인 평가', value: '4건', icon: Clock, color: 'text-amber-600' },
    { label: '작성한 피드백', value: '15건', icon: MessageSquare, color: 'text-orange-500' },
  ];

  const myEvaluatees = [
    {
      id: '1',
      name: '이하나',
      position: '사원',
      department: '마케팅팀',
      progress: 75,
      tasksCompleted: 3,
      totalTasks: 4,
      lastActivity: '2일 전',
      status: 'in-progress'
    },
    {
      id: '2',
      name: '김철수',
      position: '주임',
      department: '개발팀',
      progress: 100,
      tasksCompleted: 5,
      totalTasks: 5,
      lastActivity: '1주 전',
      status: 'completed'
    },
    {
      id: '3',
      name: '박영희',
      position: '대리',
      department: '디자인팀',
      progress: 40,
      tasksCompleted: 2,
      totalTasks: 5,
      lastActivity: '3일 전',
      status: 'in-progress'
    },
    {
      id: '4',
      name: '정민호',
      position: '사원',
      department: '마케팅팀',
      progress: 60,
      tasksCompleted: 3,
      totalTasks: 5,
      lastActivity: '1일 전',
      status: 'in-progress'
    },
  ];

  const recentFeedbacks = [
    {
      evaluatee: '이하나 사원',
      task: '브랜드 캠페인 기획',
      feedback: '창의적인 아이디어와 체계적인 기획이 돋보였습니다.',
      date: '2024-06-15',
      score: '상호적/실무'
    },
    {
      evaluatee: '김철수 주임',
      task: '시스템 개발',
      feedback: '기술적 완성도가 높고 일정 관리도 우수했습니다.',
      date: '2024-06-14',
      score: '독립적/리딩'
    },
  ];

  const handleEvaluateClick = (evaluateeId: string) => {
    navigate(`/evaluation/${evaluateeId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">평가자 대시보드</h2>
          <p className="text-muted-foreground">담당 팀원들의 성과를 평가하고 피드백을 제공하세요</p>
        </div>
        <Button className="ok-orange hover:opacity-90">
          <Star className="mr-2 h-4 w-4" />
          평가 가이드
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

      <Tabs defaultValue="evaluatees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evaluatees">담당 피평가자</TabsTrigger>
          <TabsTrigger value="pending">대기 중인 평가</TabsTrigger>
          <TabsTrigger value="completed">완료한 평가</TabsTrigger>
          <TabsTrigger value="feedback">피드백 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluatees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {myEvaluatees.map((person, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{person.name} {person.position}</CardTitle>
                      <CardDescription>{person.department}</CardDescription>
                    </div>
                    <Badge 
                      variant={person.status === 'completed' ? 'default' : 'secondary'}
                      className={person.status === 'completed' ? 'status-achieved' : 'status-in-progress'}
                    >
                      {person.status === 'completed' ? '완료' : '진행 중'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>과업 진행률</span>
                      <span>{person.tasksCompleted}/{person.totalTasks} ({person.progress}%)</span>
                    </div>
                    <Progress value={person.progress} className="[&>div]:ok-orange" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      마지막 활동: {person.lastActivity}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleEvaluateClick(person.id)}
                      className="ok-orange hover:opacity-90"
                    >
                      평가하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>대기 중인 평가 항목</CardTitle>
              <CardDescription>아직 평가하지 않은 과업들입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myEvaluatees.filter(person => person.status === 'in-progress').map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{person.name} {person.position}</p>
                      <p className="text-sm text-muted-foreground">
                        미완료 과업: {person.totalTasks - person.tasksCompleted}개
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleEvaluateClick(person.id)}
                      className="ok-orange hover:opacity-90"
                    >
                      평가 진행
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>완료한 평가</CardTitle>
              <CardDescription>최근 완료한 평가 결과입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myEvaluatees.filter(person => person.status === 'completed').map((person, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{person.name} {person.position}</p>
                        <p className="text-sm text-muted-foreground">{person.department}</p>
                      </div>
                      <Badge className="status-achieved">평가 완료</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      완료일: {person.lastActivity} • 총 {person.totalTasks}개 과업 평가
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
              <CardTitle>최근 작성한 피드백</CardTitle>
              <CardDescription>팀원들에게 제공한 피드백 내역</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedbacks.map((feedback, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{feedback.evaluatee}</p>
                        <p className="text-sm text-muted-foreground">{feedback.task}</p>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        {feedback.score}
                      </Badge>
                    </div>
                    <p className="text-sm ok-bright-gray p-3 rounded-md mb-2">
                      "{feedback.feedback}"
                    </p>
                    <p className="text-xs text-muted-foreground">{feedback.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
