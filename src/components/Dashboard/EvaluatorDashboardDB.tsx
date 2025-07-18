import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MiniGanttChart from '@/components/MiniGanttChart';
import { employeeService, evaluationService, taskService } from '@/lib/database';
import { EvaluationData } from '@/types/evaluation';

interface EvaluateeInfo {
  id: string;
  name: string;
  position: string;
  department: string;
  progress: number;
  growthLevel: number;
  lastModified: string;
  status: 'in-progress' | 'completed';
  totalTasks: number;
  completedTasks: number;
  totalScore: number;
  isAchieved: boolean;
}

export const EvaluatorDashboardDB: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [evaluatees, setEvaluatees] = useState<EvaluateeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // 피평가자 데이터 로드
  useEffect(() => {
    const loadEvaluatees = async () => {
      if (!user?.employeeId) return;

      try {
        setIsLoading(true);
        console.log('🔍 평가자 대시보드 데이터 로딩 시작...');

                 // 내가 평가하는 직원들 조회
         const employees = await employeeService.getEvaluateesByEvaluator(user.employeeId);
        console.log('👥 담당 직원들:', employees);

        const evaluateeList: EvaluateeInfo[] = [];

        for (const employee of employees) {
          // 각 직원의 평가 데이터 조회
          const evaluation = await evaluationService.getEvaluationByEmployeeId(employee.employee_id);
          if (!evaluation) continue;

          // 해당 평가의 과업들 조회
          const tasks = await taskService.getTasksByEvaluationId(evaluation.id);

          // 통계 계산
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.score !== null).length;
          const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
          const totalScore = tasks.reduce((sum, task) => {
            if (task.score !== null) {
              return sum + (task.score * task.weight / 100);
            }
            return sum;
          }, 0);

          const isAchieved = Math.floor(totalScore) >= employee.growth_level;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          evaluateeList.push({
            id: employee.employee_id,
            name: employee.name,
            position: employee.position,
            department: employee.department,
            progress: progress,
            growthLevel: employee.growth_level,
            lastModified: evaluation.updated_at || evaluation.created_at,
            status: progress === 100 ? 'completed' : 'in-progress',
            totalTasks,
            completedTasks,
            totalScore,
            isAchieved
          });
        }

        setEvaluatees(evaluateeList);
        console.log('✅ 평가자 대시보드 데이터 로딩 완료:', evaluateeList);
      } catch (error) {
        console.error('❌ 평가자 대시보드 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluatees();
  }, [user]);

  // 평가 페이지로 이동
  const handleEvaluate = (evaluateeId: string) => {
    navigate(`/evaluation/${evaluateeId}`);
  };

  // 통계 계산
  const totalEvaluatees = evaluatees.length;
  const completedEvaluations = evaluatees.filter(e => e.status === 'completed').length;
  const inProgressEvaluations = evaluatees.filter(e => e.status === 'in-progress').length;
  const averageProgress = evaluatees.length > 0 
    ? evaluatees.reduce((sum, e) => sum + e.progress, 0) / evaluatees.length 
    : 0;
  const achievedCount = evaluatees.filter(e => e.isAchieved).length;

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">평가자 대시보드에 접근하려면 로그인해주세요.</p>
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

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.name}님의 평가자 대시보드</h1>
          <p className="text-gray-600 mt-1">
            {user.department} | {user.position} | 담당 직원: {totalEvaluatees}명
          </p>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 담당 직원</p>
                <p className="text-2xl font-bold text-blue-600">{totalEvaluatees}명</p>
                <p className="text-xs text-gray-500">평가 대상자</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">완료된 평가</p>
                <p className="text-2xl font-bold text-green-600">{completedEvaluations}명</p>
                <p className="text-xs text-gray-500">평가 완료</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">진행 중인 평가</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressEvaluations}명</p>
                <p className="text-xs text-gray-500">평가 진행 중</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">목표 달성자</p>
                <p className="text-2xl font-bold text-orange-600">{achievedCount}명</p>
                <p className="text-xs text-gray-500">성장레벨 달성</p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">평가 현황</TabsTrigger>
          <TabsTrigger value="progress">진행률 상세</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                담당 직원 목록
              </CardTitle>
              <CardDescription>
                각 직원의 평가 상태와 진행률을 확인하고 평가를 진행할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluatees.map((evaluatee) => (
                  <Card key={evaluatee.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{evaluatee.name}</h3>
                            <Badge variant="outline" className="bg-blue-50">
                              {evaluatee.position}
                            </Badge>
                            <Badge variant={evaluatee.isAchieved ? "default" : "secondary"}>
                              성장레벨 {evaluatee.growthLevel} {evaluatee.isAchieved ? '달성' : '미달성'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{evaluatee.department}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge 
                            variant={evaluatee.status === 'completed' ? "default" : "secondary"}
                            className={evaluatee.status === 'completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {evaluatee.status === 'completed' ? '평가 완료' : '평가 진행 중'}
                          </Badge>
                          <Button
                            onClick={() => handleEvaluate(evaluatee.id)}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            평가하기
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">총 과업:</span>
                          <span className="ml-2 font-medium">{evaluatee.totalTasks}개</span>
                        </div>
                        <div>
                          <span className="text-gray-500">완료 과업:</span>
                          <span className="ml-2 font-medium">{evaluatee.completedTasks}개</span>
                        </div>
                        <div>
                          <span className="text-gray-500">총 점수:</span>
                          <span className="ml-2 font-medium">{evaluatee.totalScore.toFixed(1)}점</span>
                        </div>
                        <div>
                          <span className="text-gray-500">수정일:</span>
                          <span className="ml-2 font-medium">
                            {new Date(evaluatee.lastModified).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>

                      {/* 진행률 바 */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${evaluatee.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        진행률: {evaluatee.progress.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                진행률 상세 분석
              </CardTitle>
              <CardDescription>
                각 직원별 평가 진행 상황을 상세히 분석합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 전체 진행률 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">평균 진행률</p>
                    <p className="text-2xl font-bold text-orange-600">{averageProgress.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">평가 완료율</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalEvaluatees > 0 ? ((completedEvaluations / totalEvaluatees) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">목표 달성률</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalEvaluatees > 0 ? ((achievedCount / totalEvaluatees) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                {/* 개별 진행률 */}
                <div className="space-y-4">
                  {evaluatees.map((evaluatee) => (
                    <div key={evaluatee.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-medium">{evaluatee.name}</h4>
                          <p className="text-sm text-gray-600">{evaluatee.department} | {evaluatee.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{evaluatee.progress.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">{evaluatee.completedTasks}/{evaluatee.totalTasks} 완료</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${evaluatee.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>총 점수: {evaluatee.totalScore.toFixed(1)}점</span>
                        <span className={evaluatee.isAchieved ? "text-green-600" : "text-red-600"}>
                          목표: {evaluatee.growthLevel}점 {evaluatee.isAchieved ? '달성' : '미달성'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 