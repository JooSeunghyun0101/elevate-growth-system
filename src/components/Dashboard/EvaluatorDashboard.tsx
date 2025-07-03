
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EvaluationData {
  evaluateeId: string;
  evaluateeName: string;
  evaluateePosition: string;
  evaluateeDepartment: string;
  growthLevel: number;
  evaluationStatus: 'in-progress' | 'completed';
  lastModified: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    weight: number;
    contributionMethod?: string;
    contributionScope?: string;
    score?: number;
    feedback?: string;
  }>;
}

interface EvaluateeInfo {
  id: string;
  name: string;
  position: string;
  department: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  lastActivity: string;
  status: 'in-progress' | 'completed';
  totalScore?: number;
  growthLevel?: number;
}

export const EvaluatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [evaluatees, setEvaluatees] = useState<EvaluateeInfo[]>([]);

  // Base evaluatee information
  const baseEvaluatees = [
    {
      id: '1',
      name: '이하나',
      position: '사원',
      department: '마케팅팀',
      totalTasks: 4,
      growthLevel: 3
    },
    {
      id: '2',
      name: '김철수',
      position: '주임',
      department: '개발팀',
      totalTasks: 5,
      growthLevel: 4
    },
    {
      id: '3',
      name: '박영희',
      position: '대리',
      department: '디자인팀',
      totalTasks: 5,
      growthLevel: 3
    },
    {
      id: '4',
      name: '정민호',
      position: '사원',
      department: '마케팅팀',
      totalTasks: 5,
      growthLevel: 2
    },
  ];

  const loadEvaluationData = () => {
    const updatedEvaluatees = baseEvaluatees.map(base => {
      const savedData = localStorage.getItem(`evaluation-${base.id}`);
      
      if (savedData) {
        try {
          const evaluationData: EvaluationData = JSON.parse(savedData);
          const completedTasks = evaluationData.tasks.filter(task => task.score !== undefined).length;
          const progress = Math.round((completedTasks / evaluationData.tasks.length) * 100);
          
          // Calculate total score
          const totalScore = Math.floor(evaluationData.tasks.reduce((sum, task) => {
            if (task.score) {
              return sum + (task.score * task.weight / 100);
            }
            return sum;
          }, 0));

          return {
            id: base.id,
            name: base.name,
            position: base.position,
            department: base.department,
            progress,
            tasksCompleted: completedTasks,
            totalTasks: evaluationData.tasks.length,
            lastActivity: new Date(evaluationData.lastModified).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric'
            }) + ' 전',
            status: evaluationData.evaluationStatus,
            totalScore,
            growthLevel: evaluationData.growthLevel
          };
        } catch (error) {
          console.error(`Failed to parse evaluation data for ${base.id}:`, error);
        }
      }
      
      // Return default data if no saved evaluation found
      return {
        id: base.id,
        name: base.name,
        position: base.position,
        department: base.department,
        progress: 0,
        tasksCompleted: 0,
        totalTasks: base.totalTasks,
        lastActivity: '미시작',
        status: 'in-progress' as const,
        totalScore: 0,
        growthLevel: base.growthLevel
      };
    });

    setEvaluatees(updatedEvaluatees);
  };

  // Load data on mount and set up periodic refresh
  useEffect(() => {
    loadEvaluationData();
    
    // Refresh data every 5 seconds to catch changes
    const interval = setInterval(loadEvaluationData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const myStats = [
    { 
      label: '담당 피평가자', 
      value: `${evaluatees.length}명`, 
      icon: Users, 
      color: 'text-orange-600' 
    },
    { 
      label: '완료한 평가', 
      value: `${evaluatees.filter(e => e.status === 'completed').length}건`, 
      icon: CheckCircle, 
      color: 'text-yellow-600' 
    },
    { 
      label: '대기 중인 평가', 
      value: `${evaluatees.filter(e => e.status === 'in-progress').length}건`, 
      icon: Clock, 
      color: 'text-amber-600' 
    },
    { 
      label: '작성한 피드백', 
      value: `${evaluatees.reduce((sum, e) => sum + e.tasksCompleted, 0)}건`, 
      icon: MessageSquare, 
      color: 'text-orange-500' 
    },
  ];

  const recentFeedbacks = evaluatees
    .filter(e => e.tasksCompleted > 0)
    .slice(0, 3)
    .map(e => ({
      evaluatee: `${e.name} ${e.position}`,
      task: '최근 평가 과업',
      feedback: `${e.name}님의 성과가 우수합니다.`,
      date: e.lastActivity,
      score: `${e.totalScore}점/${e.growthLevel}점`
    }));

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
            {evaluatees.map((person, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{person.name} {person.position}</CardTitle>
                      <CardDescription>{person.department}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={person.status === 'completed' ? 'default' : 'secondary'}
                        className={person.status === 'completed' ? 'status-achieved' : 'status-in-progress'}
                      >
                        {person.status === 'completed' ? '완료' : '진행 중'}
                      </Badge>
                      {person.totalScore !== undefined && person.growthLevel && (
                        <div className="text-xs text-gray-600">
                          {person.totalScore}점/{person.growthLevel}점
                        </div>
                      )}
                    </div>
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
              <CardDescription>아직 완료되지 않은 평가들입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluatees.filter(person => person.status === 'in-progress').map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{person.name} {person.position}</p>
                      <p className="text-sm text-muted-foreground">
                        미완료 과업: {person.totalTasks - person.tasksCompleted}개 • 진행률: {person.progress}%
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
                {evaluatees.filter(person => person.status === 'in-progress').length === 0 && (
                  <p className="text-center text-gray-500 py-8">대기 중인 평가가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>완료한 평가</CardTitle>
              <CardDescription>완료된 평가 결과입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluatees.filter(person => person.status === 'completed').map((person, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{person.name} {person.position}</p>
                        <p className="text-sm text-muted-foreground">{person.department}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="status-achieved mb-1">평가 완료</Badge>
                        <p className="text-sm text-gray-600">
                          총점: {person.totalScore}점 / 목표: {person.growthLevel}점
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      완료일: {person.lastActivity} • 총 {person.totalTasks}개 과업 평가
                    </div>
                  </div>
                ))}
                {evaluatees.filter(person => person.status === 'completed').length === 0 && (
                  <p className="text-center text-gray-500 py-8">완료된 평가가 없습니다.</p>
                )}
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
                {recentFeedbacks.length === 0 && (
                  <p className="text-center text-gray-500 py-8">작성된 피드백이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
