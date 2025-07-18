import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle, Clock, MessageSquare, TrendingUp, Settings, Award, Calendar as CalendarIcon, Star, Trophy, Users, ChevronDown, ChevronUp } from 'lucide-react';
import TaskGanttChart from '@/components/TaskGanttChart';
import TaskManagementDB from './TaskManagementDB';
import { FeedbackHistoryItem } from '@/types/evaluation';
import { useEvaluationDataDB } from '@/hooks/useEvaluationDataDB';
import EvaluationGuide from '@/components/Dashboard/EvaluationGuide';
import EvaluationSummary from '@/components/Evaluation/EvaluationSummary';

export const EvaluateeDashboardDB: React.FC = () => {
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
  const [lastFeedbackCheck, setLastFeedbackCheck] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastFeedbackCheck') || '';
    }
    return '';
  });

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

  // 새 피드백 개수 계산
  const newFeedbackCount = allFeedbacks.filter(fb => 
    !lastFeedbackCheck || new Date(fb.date) > new Date(lastFeedbackCheck)
  ).length;

  // 피드백 탭 클릭 시 마지막 확인 시각 저장
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (tab === 'feedback') {
      const now = new Date().toISOString();
      setLastFeedbackCheck(now);
      localStorage.setItem('lastFeedbackCheck', now);
    }
  };

  // 과업 관리 저장 핸들러
  const handleTaskManagementSave = async () => {
    setShowTaskManagement(false);
    await reloadData(); // 데이터 새로고침
  };

  // 과업별 피드백 접기/펼치기
  const toggleTaskFeedbacks = (taskTitle: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskTitle]: !prev[taskTitle]
    }));
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">피평가자 대시보드에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">데이터 로딩 중...</h2>
          <p className="text-gray-600">평가 데이터를 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">평가 데이터가 없습니다</h2>
          <p className="text-gray-600">평가 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const { exactScore, flooredScore } = calculateTotalScore();
  const totalWeight = evaluationData.tasks.reduce((sum, task) => sum + task.weight, 0);
  const taskStats = evaluationData.tasks.reduce(
    (stats, task) => {
      stats.total++;
      if (task.score !== undefined) stats.scored++;
      if (task.feedback) stats.withFeedback++;
      return stats;
    },
    { total: 0, scored: 0, withFeedback: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{evaluationData.evaluateeName}님의 성과 대시보드</h1>
          <p className="text-gray-600 mt-1">
            {evaluationData.evaluateeDepartment} | {evaluationData.evaluateePosition} | 성장레벨 {evaluationData.growthLevel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEvaluationGuide(true)}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            평가 가이드
          </Button>
          <Button
            onClick={() => setShowTaskManagement(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            과업 관리
          </Button>
        </div>
      </div>

      {/* 성과 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 점수</p>
                <p className="text-2xl font-bold text-orange-600">{exactScore.toFixed(1)}점</p>
                <p className="text-xs text-gray-500">목표: {evaluationData.growthLevel}점</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">달성 여부</p>
                <p className={`text-2xl font-bold ${isAchieved() ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isAchieved() ? '달성' : '미달성'}
                </p>
                <p className="text-xs text-gray-500">{flooredScore}점 기준</p>
              </div>
              {isAchieved() ? (
                <Trophy className="h-8 w-8 text-green-500" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">과업 현황</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.scored}/{taskStats.total}</p>
                <p className="text-xs text-gray-500">점수 입력 완료</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">가중치 합계</p>
                <p className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalWeight}%
                </p>
                <p className="text-xs text-gray-500">목표: 100%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">과업 현황</TabsTrigger>
          <TabsTrigger value="feedback">
            피드백 이력
            {newFeedbackCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-2 py-1">
                {newFeedbackCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary">성과 요약</TabsTrigger>
          <TabsTrigger value="gantt">일정 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                등록된 과업 목록
              </CardTitle>
              <CardDescription>
                현재 등록된 과업들의 상세 정보와 평가 상태를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationData.tasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge variant="outline" className="bg-orange-50">
                            가중치: {task.weight}%
                          </Badge>
                          {task.score !== undefined && (
                            <Badge variant={task.score >= evaluationData.growthLevel ? "default" : "secondary"}>
                              {task.score}점
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">시작일:</span>
                          <span className="ml-2">{task.startDate || '미설정'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">종료일:</span>
                          <span className="ml-2">{task.endDate || '미설정'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">기여방식:</span>
                          <span className="ml-2">{task.contributionMethod || '미설정'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">기여범위:</span>
                          <span className="ml-2">{task.contributionScope || '미설정'}</span>
                        </div>
                      </div>

                      {task.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-700 mb-1">최근 피드백:</p>
                          <p className="text-sm text-gray-600">{task.feedback}</p>
                          {task.evaluatorName && (
                            <p className="text-xs text-gray-500 mt-1">
                              평가자: {task.evaluatorName}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskFeedbacks(taskTitle)}
                                className="w-full text-xs sm:text-sm mt-2"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    피드백 접기
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    {feedbacks.length - 1}개 피드백 더보기
                                  </>
                                )}
                              </Button>
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

        <TabsContent value="summary" className="space-y-6">
          <EvaluationSummary
            evaluationData={evaluationData}
            totalScore={flooredScore}
            exactScore={exactScore}
            isAchieved={isAchieved()}
          />
        </TabsContent>

        <TabsContent value="gantt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                과업 일정 관리
              </CardTitle>
              <CardDescription>
                등록된 과업들의 일정을 간트 차트로 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskGanttChart tasks={evaluationData.tasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 과업 관리 모달 */}
      {showTaskManagement && (
        <TaskManagementDB
          evaluationData={evaluationData}
          onSave={handleTaskManagementSave}
          onClose={() => setShowTaskManagement(false)}
        />
      )}

      {/* 평가 가이드 모달 */}
      {showEvaluationGuide && (
        <EvaluationGuide onClose={() => setShowEvaluationGuide(false)} />
      )}
    </div>
  );
}; 