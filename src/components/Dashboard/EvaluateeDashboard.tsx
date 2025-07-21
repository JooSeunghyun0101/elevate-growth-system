
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, CheckCircle, Clock, MessageSquare, TrendingUp, ChevronDown, ChevronUp, Settings, Award, Calendar as CalendarIcon, Star, Trophy, Users } from 'lucide-react';
import TaskGanttChart from '@/components/TaskGanttChart';
import TaskManagement from '@/components/Dashboard/TaskManagement';
import { Task, FeedbackHistoryItem, EvaluationData } from '@/types/evaluation';
import { useEvaluationDataDB } from '@/hooks/useEvaluationDataDB';
import EvaluationGuide from '@/components/Dashboard/EvaluationGuide';
import EvaluationSummary from '@/components/Evaluation/EvaluationSummary';
import { getContributionTooltip } from '@/utils/evaluationUtils';

export const EvaluateeDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // 데이터베이스 연동 훅 사용
  const {
    evaluationData,
    isLoading,
    handleTaskUpdate,
    calculateTotalScore,
    isEvaluationComplete,
    isAchieved,
    reloadData
  } = useEvaluationDataDB(user?.employeeId || '');

  const [allFeedbacks, setAllFeedbacks] = useState<(FeedbackHistoryItem & { taskTitle: string })[]>([]);
  const [groupedFeedbacks, setGroupedFeedbacks] = useState<Record<string, (FeedbackHistoryItem & { taskTitle: string })[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const [showEvaluationGuide, setShowEvaluationGuide] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [allFeedbacksBadgeRead, setAllFeedbacksBadgeRead] = useState(false);
  const [lastFeedbackCheck, setLastFeedbackCheck] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastFeedbackCheck') || '';
    }
    return '';
  });

  // 새 피드백 개수 계산
  const newFeedbackCount = allFeedbacks.filter(fb => !lastFeedbackCheck || new Date(fb.date) > new Date(lastFeedbackCheck)).length;

  // 피드백 탭 클릭 시 마지막 확인 시각 저장
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (tab === 'feedback') {
      setAllFeedbacksBadgeRead(true);
      const now = new Date().toISOString();
      setLastFeedbackCheck(now);
      localStorage.setItem('lastFeedbackCheck', now);
    }
  };

  // 피드백 데이터 업데이트 - 모든 과업 포함
  useEffect(() => {
    if (!evaluationData) return;

    // Collect all feedback history items with task titles
    const feedbackItems: (FeedbackHistoryItem & { taskTitle: string })[] = [];
    evaluationData.tasks.forEach(task => {
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

    // Group feedbacks by task - 모든 과업 포함 (피드백이 없는 과업도 포함)
    const grouped: Record<string, (FeedbackHistoryItem & { taskTitle: string })[]> = {};
    
    // 모든 과업을 먼저 초기화 (빈 배열로)
    evaluationData.tasks.forEach(task => {
      grouped[task.title] = [];
    });
    
    // 피드백이 있는 과업들의 피드백 추가
    feedbackItems.forEach(feedback => {
      if (grouped[feedback.taskTitle]) {
        grouped[feedback.taskTitle].push(feedback);
      }
    });

    // Sort each group by date (most recent first)
    Object.keys(grouped).forEach(taskTitle => {
      grouped[taskTitle].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setGroupedFeedbacks(grouped);
    console.log('📬 피드백 이력 업데이트:', feedbackItems.length, '개 (전체 과업:', evaluationData.tasks.length, '개)');
  }, [evaluationData]);

  // 자동 새로고침 제거 - 저장/완료 버튼 클릭 시에만 새로고침

  const handleTaskManagementSave = async (updatedData: EvaluationData) => {
    setShowTaskManagement(false);
    console.log('💾 과업 관리 저장 완료 - 데이터 새로고침');
    await reloadData(); // 데이터 새로고침
  };

  const toggleTaskFeedbacks = (taskTitle: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskTitle]: !prev[taskTitle]
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!evaluationData) {
    return <div>평가 데이터가 없습니다.</div>;
  }

  const totalTasks = evaluationData.tasks.length;
  const completedTasks = evaluationData.tasks.filter(task => task.score !== undefined).length;
  const inProgressTasks = totalTasks - completedTasks;

  // Calculate performance metrics for summary
  const { exactScore, flooredScore } = calculateTotalScore();

  const myStats = [
    {
      label: { full: '전체 과업', mobile: '과업' },
      value: `${evaluationData.tasks.length}개`,
      icon: Target,
      color: 'text-orange-600',
    },
    {
      label: { full: '완료된 평가', mobile: '완료' },
      value: `${completedTasks}개`,
      icon: CheckCircle,
      color: 'text-yellow-500',
    },
    {
      label: { full: '진행 중인 평가', mobile: '진행중' },
      value: `${inProgressTasks}개`,
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      label: { full: '받은 피드백', mobile: '피드백' },
      value: `${allFeedbacks.length}건`,
      icon: MessageSquare,
      color: 'text-orange-400',
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
        <Button 
          variant="outline"
          className="text-xs sm:text-sm px-2 sm:px-4"
          onClick={() => setShowEvaluationGuide(true)}
        >
          <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          <span className="hidden sm:inline">평가 가이드</span>
          <span className="inline sm:hidden">가이드</span>
        </Button>
      </div>
      {showEvaluationGuide && (
        <EvaluationGuide onClose={() => setShowEvaluationGuide(false)} />
      )}

      {/* 상단 카드: 성과평가 입력 화면과 동일하게 EvaluationSummary 사용 */}
      <EvaluationSummary
        evaluationData={evaluationData}
        totalScore={flooredScore}
        exactScore={exactScore}
        isAchieved={isAchieved()}
      />

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm flex items-center">
            <span className="hidden sm:inline">내 과업</span>
            <span className="inline sm:hidden">과업</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm flex items-center">
            <span className="hidden sm:inline">과업 일정</span>
            <span className="inline sm:hidden">일정</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm flex items-center">
            <span className="hidden sm:inline">피드백 이력</span>
            <span className="inline sm:hidden">피드백</span>
            {!allFeedbacksBadgeRead && newFeedbackCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center text-xs p-0">{newFeedbackCount}</Badge>
            )}
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
                  className="bg-[#F55000] text-white hover:bg-[#FFAA00]"
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
                {evaluationData.tasks.map((task, index) => {
                  const weightedScore = task.score !== undefined ? ((task.score * task.weight) / 100).toFixed(2) : null;
                  return (
                    <div key={task.id} className="p-4 sm:p-6 border rounded-xl bg-white shadow-sm mb-2">
                      <div className="flex justify-between items-start border-b pb-2 mb-2">
                          {/* 좌측: 제목, 비중, 기간 */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className="font-bold text-base sm:text-lg truncate text-gray-900">{task.title}</h4>
                              {task.weight !== undefined && (
                                <Badge variant="outline" className="border-orange-500 text-orange-900 bg-orange-50 text-sm font-semibold px-2 py-0.5 ml-1">비중 {task.weight}%</Badge>
                              )}
                            </div>
                            {task.startDate && task.endDate && (
                              <span className="text-xs text-gray-500 mt-1">기간: {task.startDate} ~ {task.endDate}</span>
                            )}
                          </div>
                          {/* 우측: 기여방식, 범위 */}
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            {task.contributionMethod && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-transparent cursor-help">
                                    <TrendingUp className="w-5 h-5" style={{ color: '#F55000' }} />
                                    <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#F55000' }}>{task.contributionMethod}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 bg-orange-50 border-orange-200 shadow-lg">
                                  <p className="text-sm text-orange-900 leading-relaxed">
                                    {getContributionTooltip('method', task.contributionMethod)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {task.contributionScope && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-transparent cursor-help">
                                    <Users className="w-5 h-5" style={{ color: '#55474A' }} />
                                    <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#55474A' }}>{task.contributionScope}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 bg-amber-50 border-amber-200 shadow-lg">
                                  <p className="text-sm text-amber-900 leading-relaxed">
                                    {getContributionTooltip('scope', task.contributionScope)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center mt-2 justify-between">
                        <span className="text-sm text-gray-700 font-medium">{task.description}</span>
                        {/* 하단 비중 배지는 제거 */}
                        {/* 점수/비중점수는 하단 오른쪽에 배치 */}
                        <div className="flex flex-col items-end ml-auto">
                          {task.score !== undefined && (
                            <span className="text-2xl sm:text-3xl font-extrabold text-orange-600 leading-none">{task.score}점</span>
                          )}
                          {weightedScore && (
                            <span className="mt-1 text-base font-bold text-yellow-700">비중점수 {weightedScore}</span>
                          )}
                        </div>
                      </div>

                      {/* 최종 피드백 표시 */}
                      {(() => {
                        // 최종 피드백 찾기 (가장 최근 피드백 또는 현재 피드백)
                        let finalFeedback = null;
                        let feedbackDate = null;
                        let evaluatorName = null;

                        if (task.feedbackHistory && task.feedbackHistory.length > 0) {
                          // 피드백 히스토리가 있으면 가장 최근 것 사용
                          const sortedHistory = [...task.feedbackHistory].sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                          );
                          finalFeedback = sortedHistory[0].content;
                          feedbackDate = sortedHistory[0].date;
                          evaluatorName = sortedHistory[0].evaluatorName;
                        } else if (task.feedback) {
                          // 피드백 히스토리가 없지만 현재 피드백이 있으면 그것 사용
                          finalFeedback = task.feedback;
                          feedbackDate = task.lastModified;
                          evaluatorName = task.evaluatorName || '평가자';
                        }

                        if (finalFeedback) {
                          return (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-800">최종 피드백</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <span>평가자: {evaluatorName}</span>
                                  {feedbackDate && (
                                    <span>
                                      {new Date(feedbackDate).toLocaleDateString('ko-KR', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed break-words">
                                {finalFeedback}
                              </p>
                              {task.feedbackHistory && task.feedbackHistory.length > 1 && (
                                <div className="mt-2 text-xs text-blue-600">
                                  총 {task.feedbackHistory.length}개의 피드백 이력이 있습니다.
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">아직 받은 피드백이 없습니다.</span>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  );
                })}
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
                  <p className="text-center text-gray-500 py-8 text-sm">과업 데이터가 없습니다.</p>
                ) : (
                  Object.entries(groupedFeedbacks).map(([taskTitle, feedbacks]) => {
                    const isExpanded = expandedTasks[taskTitle];
                    const displayedFeedbacks = isExpanded ? feedbacks : feedbacks.slice(0, 1);
                    
                    return (
                      <div key={taskTitle} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900">{taskTitle}</h4>
                          {feedbacks.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {feedbacks.length}개 피드백
                            </Badge>
                          )}
                        </div>
                        
                        {feedbacks.length === 0 ? (
                          // 피드백이 없는 경우
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">아직 받은 피드백이 없습니다.</span>
                            </div>
                          </div>
                        ) : (
                          // 피드백이 있는 경우
                          <>
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
                            
                            {feedbacks.length > 1 && (
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
                                      {feedbacks.length - 1}개 더보기
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </>
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
