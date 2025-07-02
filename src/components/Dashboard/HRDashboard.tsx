
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Target, TrendingUp, Settings, FileText, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const HRDashboard: React.FC = () => {
  const overviewStats = [
    { label: '전체 직원 수', value: '248', icon: Users, color: 'text-blue-600' },
    { label: '평가 완료율', value: '73%', icon: Target, color: 'text-green-600' },
    { label: '달성률', value: '82%', icon: TrendingUp, color: 'text-purple-600' },
    { label: '평가 프로세스', value: '5개', icon: Settings, color: 'text-orange-600' },
  ];

  const recentActivities = [
    { user: '김민준 대리', action: '평가자 변경 처리', time: '2시간 전', type: 'update' },
    { user: '박서준 팀장', action: '하반기 평가 완료', time: '4시간 전', type: 'complete' },
    { user: '이하나 사원', action: '과업 가중치 수정', time: '6시간 전', type: 'edit' },
    { user: '최수현 팀장', action: '피드백 작성 완료', time: '1일 전', type: 'feedback' },
  ];

  const evaluationProgress = [
    { department: '개발팀', total: 45, completed: 38, percentage: 84 },
    { department: '마케팅팀', total: 32, completed: 28, percentage: 88 },
    { department: '영업팀', total: 41, completed: 25, percentage: 61 },
    { department: '디자인팀', total: 18, completed: 16, percentage: 89 },
    { department: '인사팀', total: 12, completed: 12, percentage: 100 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR 관리자 대시보드</h2>
          <p className="text-muted-foreground">전사 성과관리 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            보고서 생성
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            평가 설정
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="progress">부서별 진행률</TabsTrigger>
          <TabsTrigger value="activities">최근 활동</TabsTrigger>
          <TabsTrigger value="settings">시스템 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>평가 진행 현황</CardTitle>
                <CardDescription>부서별 평가 완료 상황</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {evaluationProgress.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-muted-foreground">
                        {dept.completed}/{dept.total} ({dept.percentage}%)
                      </span>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>이번 달 마감 예정</CardTitle>
                <CardDescription>주요 평가 일정</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">상반기 평가 마감</p>
                    <p className="text-sm text-muted-foreground">2024년 6월 30일</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">피드백 입력 마감</p>
                    <p className="text-sm text-muted-foreground">2024년 6월 25일</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">하반기 평가 시작</p>
                    <p className="text-sm text-muted-foreground">2024년 7월 1일</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>부서별 상세 진행률</CardTitle>
              <CardDescription>각 부서의 평가 진행 상황과 세부 통계</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evaluationProgress.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{dept.department}</h3>
                      <Badge variant={dept.percentage >= 80 ? "default" : "secondary"}>
                        {dept.percentage}% 완료
                      </Badge>
                    </div>
                    <Progress value={dept.percentage} className="mb-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>완료: {dept.completed}명</div>
                      <div>미완료: {dept.total - dept.completed}명</div>
                      <div>전체: {dept.total}명</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 활동 내역</CardTitle>
              <CardDescription>시스템에서 발생한 주요 활동들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'complete' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'edit' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>평가 매트릭스 설정</CardTitle>
                <CardDescription>기여 유형과 범위별 점수 설정</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  매트릭스 편집
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>평가자 관리</CardTitle>
                <CardDescription>평가자-피평가자 매칭 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  매칭 관리
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>시스템 알림 및 마감일 설정</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  알림 설정
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>데이터 내보내기</CardTitle>
                <CardDescription>평가 데이터 백업 및 리포트</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  데이터 내보내기
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
