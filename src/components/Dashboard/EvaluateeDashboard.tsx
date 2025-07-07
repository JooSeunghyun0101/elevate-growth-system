
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle, Clock, MessageSquare, TrendingUp, ChevronDown, ChevronUp, Settings, PieChart, Award, Calendar as CalendarIcon } from 'lucide-react';
import TaskGanttChart from '@/components/TaskGanttChart';
import TaskManagement from '@/components/Dashboard/TaskManagement';
import { Task, FeedbackHistoryItem, EvaluationData } from '@/types/evaluation';
import { getEmployeeData } from '@/utils/employeeData';

export const EvaluateeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<(FeedbackHistoryItem & { taskTitle: string })[]>([]);
  const [groupedFeedbacks, setGroupedFeedbacks] = useState<Record<string, (FeedbackHistoryItem & { taskTitle: string })[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [showTaskManagement, setShowTaskManagement] = useState(false);

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

        // Group feedbacks by task
        const grouped: Record<string, (FeedbackHistoryItem & { taskTitle: string })[]> = {};
        feedbackItems.forEach(feedback => {
          if (!grouped[feedback.taskTitle]) {
            grouped[feedback.taskTitle] = [];
          }
          grouped[feedback.taskTitle].push(feedback);
        });

        // Sort each group by date (most recent first)
        Object.keys(grouped).forEach(taskTitle => {
          grouped[taskTitle].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        setGroupedFeedbacks(grouped);
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

  const handleTaskManagementSave = (updatedData: EvaluationData) => {
    setEvaluationData(updatedData);
    localStorage.setItem(`evaluation-${user!.employeeId}`, JSON.stringify(updatedData));
    setShowTaskManagement(false);
  };

  const toggleTaskFeedbacks = (taskTitle: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskTitle]: !prev[taskTitle]
    }));
  };

  if (!evaluationData) {
    return <div>Loading...</div>;
  }

  const totalTasks = evaluationData.tasks.length;
  const completedTasks = evaluationData.tasks.filter(task => task.score !== undefined).length;
  const inProgressTasks = totalTasks - completedTasks;

  // Calculate performance metrics for summary
  const totalWeightedScore = evaluationData.tasks.reduce((sum, task) => {
    if (task.score) {
      return sum + (task.score * task.weight / 100);
    }
    return sum;
  }, 0);
  const flooredScore = Math.floor(totalWeightedScore);
  const isAchieved = flooredScore >= evaluationData.growthLevel;

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

      {/* Performance Summary Section */}
      {completedTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">나의 성과 요약</CardTitle>
            <CardDescription className="text-xs sm:text-sm">전체 과업 평가 결과를 기반으로 한 성과 분석입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-center mb-4">
                  <Award className={`w-8 h-8 mr-2 ${isAchieved ? 'text-green-600' : 'text-orange-600'}`} />
                  <h3 className="text-xl font-bold">종합 점수</h3>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {flooredScore}점
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  목표 레벨: {evaluationData.growthLevel}점
                </div>
                <Badge 
                  className={isAchieved ? 'status-achieved' : 'bg-orange-100 text-orange-800 border-orange-200'}
                >
                  {isAchieved ? '목표 달성' : '목표 미달성'}
                </Badge>
              </div>

              {/* Evaluation Progress */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-sm mb-2">평가 진행 상황</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-gray-600">완료된 평가</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{inProgressTasks}</div>
                    <div className="text-xs text-gray-600">진행 중인 평가</div>
                  </div>
                </div>
                <Progress 
                  value={(completedTasks / totalTasks) * 100} 
                  className="mt-3 [&>div]:ok-green" 
                />
                <div className="text-xs text-gray-600 text-center mt-2">
                  전체 진행률: {Math.round((completedTasks / totalTasks) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">내 과업</span>
            <span className="inline sm:hidden">과업</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">과업 일정</span>
            <span className="inline sm:hidden">일정</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">피드백 이력</span>
            <span className="inline sm:hidden">피드백</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">내 과업 목록</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">현재 진행 중인 과업들과 평가 현황을 확인하세요</CardDescription>
                </div>
                <Button
                  onClick={() => setShowTaskManagement(true)}
                  className="ok-orange hover:opacity-90"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">과업 관리</span>
                  <span className="inline sm:hidden">관리</span>
                </Button>
              </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                과업 일정표
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">내 과업들의 전체 일정을 간트차트로 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskGanttChart tasks={evaluationData.tasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">피드백 이력</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                평가자로부터 받은 피드백을 과업별로 확인하세요 (최신순)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(groupedFeedbacks).length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">받은 피드백이 없습니다.</p>
                ) : (
                  Object.entries(groupedFeedbacks).map(([taskTitle, feedbacks]) => {
                    const isExpanded = expandedTasks[taskTitle];
                    const displayedFeedbacks = isExpanded ? feedbacks : feedbacks.slice(0, 5);
                    
                    return (
                      <div key={taskTitle} className="space-y-3">
                        <h4 className="font-medium text-sm sm:text-base text-gray-900">{taskTitle}</h4>
                        
                        <div className="space-y-3">
                          {displayedFeedbacks.map((feedback, index) => (
                            <div key={feedback.id} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium">평가자: {feedback.evaluatorName}</span>
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
                              <p className="text-xs sm:text-sm text-gray-700">
                                {feedback.content}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {feedbacks.length > 5 && (
                          <div className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTaskFeedbacks(taskTitle)}
                              className="text-sm"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  접기
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  {feedbacks.length - 5}개 더보기
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showTaskManagement && evaluationData && (
        <TaskManagement
          evaluationData={evaluationData}
          onClose={() => setShowTaskManagement(false)}
          onSave={handleTaskManagementSave}
        />
      )}
    </div>
  );
};
