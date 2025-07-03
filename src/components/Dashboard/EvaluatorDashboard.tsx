
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EvaluationGuide from './EvaluationGuide';

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
    feedbackDate?: string;
    lastModified?: string;
    evaluatorName?: string;
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

interface RecentFeedback {
  evaluatee: string;
  task: string;
  feedback: string;
  date: string;
  score: string;
  evaluatorName?: string;
}

// Employee mapping - evaluator to evaluatees (updated with new positions)
const evaluatorMapping: Record<string, Array<{id: string, name: string, position: string, department: string, growthLevel: number}>> = {
  'H0908033': [ // 박판근
    { id: 'H1310172', name: '이수한', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1411166', name: '주승현', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1911042', name: '김민선', position: '대리', department: '인사기획팀', growthLevel: 2 }
  ],
  'H1310159': [ // 김남엽
    { id: 'H1411231', name: '최은송', position: '차장', department: '인사팀', growthLevel: 3 },
    { id: 'H1205006', name: '황정원', position: '대리', department: '인사팀', growthLevel: 2 },
    { id: 'H2301040', name: '김민영', position: '사원', department: '인사팀', growthLevel: 1 },
    { id: 'H1501077', name: '조혜인', position: '대리', department: '인사팀', growthLevel: 2 }
  ],
  'H0807021': [ // 박준형
    { id: 'H0908033', name: '박판근', position: '차장', department: '인사기획팀', growthLevel: 3 },
    { id: 'H1310159', name: '김남엽', position: '차장', department: '인사팀', growthLevel: 3 }
  ]
};

export const EvaluatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evaluatees, setEvaluatees] = useState<EvaluateeInfo[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([]);
  const [showEvaluationGuide, setShowEvaluationGuide] = useState(false);

  const loadEvaluationData = () => {
    if (!user) return;

    // Get evaluatees for current evaluator
    const myEvaluatees = evaluatorMapping[user.employeeId] || [];
    const updatedEvaluatees: EvaluateeInfo[] = [];
    const allFeedbacks: RecentFeedback[] = [];

    myEvaluatees.forEach(evaluatee => {
      const savedData = localStorage.getItem(`evaluation-${evaluatee.id}`);
      
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

          const status = evaluationData.evaluationStatus;

          // Extract feedback data
          evaluationData.tasks.forEach((task) => {
            if (task.feedback && task.feedback.trim()) {
              allFeedbacks.push({
                evaluatee: `${evaluationData.evaluateeName} ${evaluationData.evaluateePosition}`,
                task: task.title,
                feedback: task.feedback,
                date: task.feedbackDate || task.lastModified || evaluationData.lastModified,
                score: task.score ? `${task.score}점` : '평가중',
                evaluatorName: task.evaluatorName || user.name
              });
            }
          });

          updatedEvaluatees.push({
            id: evaluatee.id,
            name: evaluatee.name,
            position: evaluatee.position,
            department: evaluatee.department,
            progress,
            tasksCompleted: completedTasks,
            totalTasks: evaluationData.tasks.length,
            lastActivity: new Date(evaluationData.lastModified).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric'
            }) + ' 전',
            status,
            totalScore,
            growthLevel: evaluationData.growthLevel
          });
        } catch (error) {
          console.error(`Failed to parse evaluation data for ${evaluatee.id}:`, error);
        }
      }
      
      // Return default data if no saved evaluation found
      if (!savedData) {
        updatedEvaluatees.push({
          id: evaluatee.id,
          name: evaluatee.name,
          position: evaluatee.position,
          department: evaluatee.department,
          progress: 0,
          tasksCompleted: 0,
          totalTasks: 4, // Default task count
          lastActivity: '미시작',
          status: 'in-progress' as const,
          totalScore: 0,
          growthLevel: evaluatee.growthLevel
        });
      }
    });

    // Sort feedbacks by date and take top 5
    const sortedFeedbacks = allFeedbacks
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(feedback => ({
        ...feedback,
        date: new Date(feedback.date).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

    console.log('Updated evaluatees data:', updatedEvaluatees);
    console.log('Recent feedbacks (sorted):', sortedFeedbacks);
    
    setEvaluatees(updatedEvaluatees);
    setRecentFeedbacks(sortedFeedbacks);
  };

  // Load data on mount and set up refresh
  useEffect(() => {
    loadEvaluationData();
    
    const interval = setInterval(loadEvaluationData, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Also refresh when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEvaluationData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const myStats = [
    { 
      label: { full: '담당 피평가자', mobile: '담당자' },
      value: `${evaluatees.length}명`, 
      icon: Users, 
      color: 'text-orange-600' 
    },
    { 
      label: { full: '완료한 평가', mobile: '완료' },
      value: `${evaluatees.filter(e => e.status === 'completed').length}건`, 
      icon: CheckCircle, 
      color: 'text-yellow-600' 
    },
    { 
      label: { full: '대기 중인 평가', mobile: '대기중' },
      value: `${evaluatees.filter(e => e.status === 'in-progress').length}건`, 
      icon: Clock, 
      color: 'text-amber-600' 
    },
    { 
      label: { full: '작성한 피드백', mobile: '피드백' },
      value: `${recentFeedbacks.length}건`, 
      icon: MessageSquare, 
      color: 'text-orange-500' 
    },
  ];

  const handleEvaluateClick = (evaluateeId: string) => {
    navigate(`/evaluation/${evaluateeId}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="hidden md:inline">평가자 대시보드</span>
            <span className="inline md:hidden">평가 대시보드</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            <span className="hidden md:inline">담당 팀원들의 성과를 평가하고 피드백을 제공하세요</span>
            <span className="inline md:hidden">담당 팀원 평가 및 피드백</span>
          </p>
        </div>
        <Button 
          className="ok-orange hover:opacity-90 text-xs sm:text-sm px-2 sm:px-4"
          onClick={() => setShowEvaluationGuide(true)}
        >
          <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">평가 가이드</span>
          <span className="inline sm:hidden">가이드</span>
        </Button>
      </div>

      {/* My Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {myStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">{stat.label.full}</span>
                <span className="inline sm:hidden">{stat.label.mobile}</span>
              </CardTitle>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="evaluatees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evaluatees" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">담당 피평가자</span>
            <span className="inline sm:hidden">피평가자</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">대기 중인 평가</span>
            <span className="inline sm:hidden">대기중</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">완료한 평가</span>
            <span className="inline sm:hidden">완료</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">피드백 내역</span>
            <span className="inline sm:hidden">피드백</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluatees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {evaluatees.map((person, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{person.name} {person.position}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{person.department}</CardDescription>
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
                          {person.totalScore}점/Lv.{person.growthLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span>평가진행률</span>
                      <span>{person.tasksCompleted}/{person.totalTasks} ({person.progress}%)</span>
                    </div>
                    <Progress value={person.progress} className="[&>div]:ok-orange" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      마지막 활동: {person.lastActivity}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleEvaluateClick(person.id)}
                      className="ok-orange hover:opacity-90 text-xs sm:text-sm px-2 sm:px-4"
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
              <CardTitle className="text-base sm:text-lg">대기 중인 평가 항목</CardTitle>
              <CardDescription className="text-xs sm:text-sm">아직 완료되지 않은 평가들입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluatees.filter(person => person.status === 'in-progress').map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{person.name} {person.position}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        미완료 과업: {person.totalTasks - person.tasksCompleted}개 • 진행률: {person.progress}%
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleEvaluateClick(person.id)}
                      className="ok-orange hover:opacity-90 text-xs sm:text-sm px-2 sm:px-4"
                    >
                      <span className="hidden sm:inline">평가 진행</span>
                      <span className="inline sm:hidden">진행</span>
                    </Button>
                  </div>
                ))}
                {evaluatees.filter(person => person.status === 'in-progress').length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm">대기 중인 평가가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">완료한 평가</CardTitle>
              <CardDescription className="text-xs sm:text-sm">완료된 평가 결과입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluatees.filter(person => person.status === 'completed').map((person, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{person.name} {person.position}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{person.department}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="status-achieved mb-1 text-xs">평가 완료</Badge>
                        <p className="text-xs sm:text-sm text-gray-600">
                          총점: {person.totalScore}점 / 목표: {person.growthLevel}점
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      완료일: {person.lastActivity} • 총 {person.totalTasks}개 과업 평가
                    </div>
                  </div>
                ))}
                {evaluatees.filter(person => person.status === 'completed').length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm">완료된 평가가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">최근 작성한 피드백</CardTitle>
              <CardDescription className="text-xs sm:text-sm">팀원들에게 제공한 피드백 내역 (최신순)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedbacks.map((feedback, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm sm:text-lg">{feedback.evaluatee}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {feedback.task}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-orange-200 text-orange-700 mb-1 text-xs">
                          {feedback.score}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{feedback.date}</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">평가자: {feedback.evaluatorName || '평가자 미확인'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {feedback.feedback}
                      </p>
                    </div>
                  </div>
                ))}
                {recentFeedbacks.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm">작성된 피드백이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluation Guide Modal */}
      {showEvaluationGuide && (
        <EvaluationGuide onClose={() => setShowEvaluationGuide(false)} />
      )}
    </div>
  );
};
