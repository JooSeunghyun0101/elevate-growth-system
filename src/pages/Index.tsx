
import React, { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { HRDashboard } from '@/components/Dashboard/HRDashboard';
import { EvaluatorDashboard } from '@/components/Dashboard/EvaluatorDashboard';
import { EvaluateeDashboard } from '@/components/Dashboard/EvaluateeDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type UserRole = 'hr' | 'evaluator' | 'evaluatee';

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('hr');
  const [currentUser, setCurrentUser] = useState('김민준');

  // 사용자 역할에 따른 대시보드 렌더링
  const renderDashboard = () => {
    switch (currentRole) {
      case 'hr':
        return <HRDashboard />;
      case 'evaluator':
        return <EvaluatorDashboard />;
      case 'evaluatee':
        return <EvaluateeDashboard />;
      default:
        return <HRDashboard />;
    }
  };

  // 데모용 역할 전환 컴포넌트
  const RoleSwitcher = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">데모 모드</CardTitle>
          <CardDescription className="text-xs">
            다양한 사용자 역할을 체험해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">현재 역할:</span>
              <Badge className={
                currentRole === 'hr' ? 'role-hr' :
                currentRole === 'evaluator' ? 'role-evaluator' :
                'role-evaluatee'
              }>
                {currentRole === 'hr' ? 'HR 관리자' :
                 currentRole === 'evaluator' ? '평가자' :
                 '피평가자'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">사용자:</span>
              <span className="text-sm font-medium">{currentUser}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant={currentRole === 'hr' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentRole('hr');
                setCurrentUser('김민준');
              }}
              className="text-xs"
            >
              HR 관리자
            </Button>
            <Button
              size="sm"
              variant={currentRole === 'evaluator' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentRole('evaluator');
                setCurrentUser('박서준');
              }}
              className="text-xs"
            >
              평가자
            </Button>
            <Button
              size="sm"
              variant={currentRole === 'evaluatee' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentRole('evaluatee');
                setCurrentUser('이하나');
              }}
              className="text-xs"
            >
              피평가자
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={currentRole} userName={currentUser} />
      
      <main className="max-w-7xl mx-auto">
        {renderDashboard()}
      </main>

      <RoleSwitcher />
    </div>
  );
};

export default Index;
