import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle, Clock, MessageSquare, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import TaskGanttChart from '@/components/TaskGanttChart';
import { Task, FeedbackHistoryItem } from '@/types/evaluation';
import { getEmployeeData } from '@/utils/employeeData';

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

export const EvaluateeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<(FeedbackHistoryItem & { taskTitle: string })[]>([]);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);

  useEffect(() => {
    if (!user) return;

    const employeeInfo = getEmployeeData(user.employeeId);
    const savedData = localStorage.getItem(`evaluation-${user.employeeId}`);
    
    if (savedData) {
      try {
        const data: EvaluationData = JSON.parse(savedData);
        setEvaluationData(data);

        // Collect all feedback history items with task titles
        const feedbackItems: (FeedbackHistoryItem & { taskTitle: string })[] = [];
        data.tasks.forEach(task => {
          if (task.feedbackHistory && task.feedbackHistory.length > 0) {
            task.feedbackHistory.forEach(feedback => {
              feedbackItems.push({
                ...feedback,
                taskTitle: task.title
              });
            });
          }
        });

        // Sort by date (most recent first)
        feedbackItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllFeedbacks(feedbackItems);
      } catch (error) {
        console.error('Failed to parse evaluation data:', error);
      }
    } else {
      // Create default data if no saved evaluation found
      setEvaluationData({
        evaluateeId: user.employeeId,
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
            weight: 30,
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            feedbackHistory: []
          },
          {
            id: '2',
            title: '고객 만족도 조사',
            description: '기존 고객 대상 만족도 조사 설계 및 분석',
            weight: 25,
            startDate: '2024-02-01',
            endDate: '2024-04-01',
            feedbackHistory: []
          },
          {
            id: '3',
            title: '소셜미디어 콘텐츠 관리',
            description: '월간 소셜미디어 콘텐츠 계획 및 게시물 관리',
            weight: 20,
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            feedbackHistory: []
          },
          {
            id: '4',
            title: '팀 프로젝트 협업',
            description: '디자인팀과의 협업 프로젝트 진행',
            weight: 25,
            startDate: '2024-03-01',
            endDate: '2024-05-31',
            feedbackHistory: []
          }
        ]
      });
    }
  }, [user]);

  if (!evaluationData) {
    return <div>Loading...</div>;
  }

  const totalTasks = evaluationData.tasks.length;
  const completedTasks = evaluationData.tasks.filter(task => task.score !== undefined).length;
  const inProgressTasks = totalTasks - completedTasks;

  const displayedFeedbacks = showAllFeedbacks ? allFeedbacks : allFeedbacks.slice(0, 5);

  const myStats = [
    { 
      label: { full: '전체 과업', mobile: '과업' },
      value: `${evaluationData.tasks.length}개`, 
      icon: Target, 
      color: 'text-blue-600' 
    },
    { 
      label: { full: '완료된 평가', mobile: '완료' },
      value: `${completedTasks}개`, 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      label: { full: '진행 중인 평가', mobile: '진행중' },
      value: `${inProgressTasks}개`, 
      icon: Clock, 
      color: 'text-yellow-600' 
    },
    { 
      label: { full: '받은 피드백', mobile: '피드백' },
      value: `${allFeedbacks.length}건`, 
      icon: MessageSquare, 
      color: 'text-purple-600' 
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="hidden md:inline">피평가자 대시보드</span>
            <span className="inline md:hidden">내 대시보드</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            <span className="hidden md:inline">나의 성과를 확인하고 평가 과정을 추적하세요</span>
            <span className="inline md:hidden">성과 확인 및 평가 추적</span>
          </p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-900 bg-green-100 text-xs">
          Lv. {evaluationData.growthLevel}
        </Badge>
      </div>

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

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">내 과업</span>
            <span className="inline sm:hidden">과업</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">평가 현황</span>
            <span className="inline sm:hidden">현황</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">피드백 이력</span>
            <span className="inline sm:hidden">피드백</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">성과 분석</span>
            <span className="inline sm:hidden">성과</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">내 과업 목록</CardTitle>
              <CardDescription className="text-xs sm:text-sm">현재 진행 중인 과업들과 평가 현황을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {evaluationData.tasks.map((task, index) => (
                  <div key={task.id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{task.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        {task.startDate && task.endDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            기간: {task.startDate} ~ {task.endDate}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3">
                        <Badge variant="outline" className="border-orange-500 text-orange-900 bg-orange-100 text-xs">
                          {task.weight}%
                        </Badge>
                        {task.contributionMethod && task.contributionScope && task.contributionMethod !== '기여없음' && (
                          <div className="text-xs text-gray-600 text-right">
                            {task.contributionMethod}, {task.contributionScope}
                          </div>
                        )}
                        {task.score !== undefined && (
                          <Badge className="status-achieved text-xs">
                            {task.score}점
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Task Schedule Gantt Chart */}
              <div className="mt-6">
                <h4 className="font-medium text-sm sm:text-base mb-3">과업 일정</h4>
                <TaskGanttChart tasks={evaluationData.tasks} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">피드백 이력</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                평가자로부터 받은 피드백을 확인하세요 (최신순)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayedFeedbacks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">받은 피드백이 없습니다.</p>
                ) : (
                  <>
                    {displayedFeedbacks.map((feedback, index) => (
                      <div key={feedback.id} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            {feedback.taskTitle}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium">평가자: {feedback.evaluatorName}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">
                            {feedback.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {allFeedbacks.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllFeedbacks(!showAllFeedbacks)}
                          className="text-sm"
                        >
                          {showAllFeedbacks ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              접기
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              {allFeedbacks.length - 5}개 더보기
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">평가 진행 현황</CardTitle>
              <CardDescription className="text-xs sm:text-sm">과업별 평가 진행 상황을 한눈에 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationData.tasks.map((task, index) => (
                  <div key={task.id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{task.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                      </div>
                      {task.score !== undefined ? (
                        <Badge className="status-achieved text-xs">
                          {task.score}점
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          평가 대기 중
                        </Badge>
                      )}
                    </div>
                    <Progress value={task.score !== undefined ? 100 : 0} className="[&>div]:ok-green" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">종합 성과 분석</CardTitle>
              <CardDescription className="text-xs sm:text-sm">전체 과업 평가 결과를 기반으로 한 성과 분석 리포트입니다</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                아직 평가가 완료되지 않았습니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
