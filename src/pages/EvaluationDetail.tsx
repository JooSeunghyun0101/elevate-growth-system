
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, MessageSquare, TrendingUp, Calendar, User } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import ScoringChart from '@/components/Charts/ScoringChart';

const EvaluationDetail: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [contributionType, setContributionType] = useState<'총괄' | '리딩' | '실무' | '지원'>('실무');
  const [contributionScope, setContributionScope] = useState<'전략적' | '상호적' | '독립적' | '의존적'>('상호적');

  // 샘플 데이터
  const evaluateeData = {
    name: '이하나',
    position: '사원',
    department: '마케팅팀',
    level: 1,
    evaluationPeriod: '2024년 상반기',
    totalScore: 2.75,
    achievement: 'achieved'
  };

  const tasks = [
    {
      id: 1,
      name: '브랜드 캠페인 기획 및 실행',
      description: 'Q1-Q2 신제품 론칭을 위한 통합 마케팅 캠페인 기획 및 실행',
      weight: 50,
      contributionType: '실무' as const,
      contributionScope: '상호적' as const,
      score: 3,
      feedback: '창의적인 아이디어와 체계적인 기획이 돋보였습니다. 유관부서와의 협업도 원활했으며, 캠페인 성과도 목표치를 초과 달성했습니다.',
      status: 'completed',
      dueDate: '2024-06-30',
      completedDate: '2024-06-25'
    },
    {
      id: 2,
      name: '고객 만족도 조사 및 분석',
      description: '분기별 고객 만족도 조사 설계, 실행 및 결과 분석 보고서 작성',
      weight: 30,
      contributionType: '실무' as const,
      contributionScope: '독립적' as const,
      score: 2,
      feedback: '조사 설계와 분석 방법론은 우수했으나, 결과 해석에서 일부 개선이 필요합니다.',
      status: 'completed',
      dueDate: '2024-05-31',
      completedDate: '2024-05-28'
    },
    {
      id: 3,
      name: '마케팅 데이터 대시보드 구축',
      description: '마케팅 성과 지표를 실시간으로 모니터링할 수 있는 대시보드 구축',
      weight: 20,
      contributionType: '지원' as const,
      contributionScope: '상호적' as const,
      score: 2,
      feedback: '기술적 이해도가 향상되었고, 개발팀과의 협업도 원활했습니다.',
      status: 'in-progress',
      dueDate: '2024-07-15',
      completedDate: null
    }
  ];

  const calculateWeightedScore = (score: number, weight: number) => {
    return (score * weight / 100).toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="status-achieved">완료</Badge>;
      case 'in-progress':
        return <Badge className="status-in-progress">진행 중</Badge>;
      default:
        return <Badge variant="outline">대기</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole="evaluator" userName="박서준" />
      
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">평가 상세</h1>
            <p className="text-muted-foreground">
              {evaluateeData.name} {evaluateeData.position}의 {evaluateeData.evaluationPeriod} 평가
            </p>
          </div>
        </div>

        {/* 피평가자 정보 요약 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {evaluateeData.name} {evaluateeData.position}
                  </CardTitle>
                  <CardDescription>
                    {evaluateeData.department} • 성장 레벨 {evaluateeData.level}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {evaluateeData.totalScore}점
                  </span>
                </div>
                <Badge className={evaluateeData.achievement === 'achieved' ? 'status-achieved' : 'status-not-achieved'}>
                  {evaluateeData.achievement === 'achieved' ? '달성' : '미달성'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">평가 기간: {evaluateeData.evaluationPeriod}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm">총 {tasks.length}개 과업</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm">목표 대비 {evaluateeData.achievement === 'achieved' ? '달성' : '미달성'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 과업별 평가 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">과업별 평가 내역</h2>
          
          {tasks.map((task, index) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{task.name}</CardTitle>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription className="mb-3">
                      {task.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>가중치: {task.weight}%</span>
                      <span>기한: {task.dueDate}</span>
                      {task.completedDate && <span>완료: {task.completedDate}</span>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 스코어링 차트 */}
                  <div className="lg:col-span-1">
                    <ScoringChart
                      contributionType={task.contributionType}
                      contributionScope={task.contributionScope}
                      score={task.score}
                      weight={task.weight}
                      taskName="점수 분석"
                    />
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">점수 계산</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>기본 점수: {task.score}점</div>
                        <div>가중치: {task.weight}%</div>
                        <div className="border-t pt-1 font-medium">
                          가중 점수: {calculateWeightedScore(task.score, task.weight)}점
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 평가 및 피드백 */}
                  <div className="lg:col-span-2 space-y-4">
                    {task.status === 'completed' ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">평가 결과</Label>
                          <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-4 mb-3">
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {task.contributionType}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                {task.contributionScope}
                              </Badge>
                              <span className="text-lg font-bold text-blue-600">
                                {task.score}점
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">피드백</Label>
                          <div className="mt-2 p-4 bg-gray-50 border rounded-lg">
                            <p className="text-sm">{task.feedback}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">기여 유형</Label>
                            <Select value={contributionType} onValueChange={(value: '총괄' | '리딩' | '실무' | '지원') => setContributionType(value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="총괄">총괄</SelectItem>
                                <SelectItem value="리딩">리딩</SelectItem>
                                <SelectItem value="실무">실무</SelectItem>
                                <SelectItem value="지원">지원</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">기여 범위</Label>
                            <Select value={contributionScope} onValueChange={(value: '전략적' | '상호적' | '독립적' | '의존적') => setContributionScope(value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="전략적">전략적</SelectItem>
                                <SelectItem value="상호적">상호적</SelectItem>
                                <SelectItem value="독립적">독립적</SelectItem>
                                <SelectItem value="의존적">의존적</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">피드백</Label>
                          <Textarea
                            placeholder="이 과업에 대한 상세한 피드백을 작성해주세요..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        
                        <Button className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          평가 저장
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 전체 점수 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>최종 점수 요약</CardTitle>
            <CardDescription>모든 과업의 가중 평균 점수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{task.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({task.weight}%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{task.score}점</span>
                    <span className="text-sm text-gray-500 ml-2">
                      = {calculateWeightedScore(task.score, task.weight)}점
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">최종 총점</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      {evaluateeData.totalScore}점
                    </span>
                    <div className="text-sm text-gray-500">
                      (레벨 {evaluateeData.level} 기준 {evaluateeData.achievement === 'achieved' ? '달성' : '미달성'})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EvaluationDetail;
