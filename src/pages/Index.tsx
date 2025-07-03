
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { HRDashboard } from '@/components/Dashboard/HRDashboard';
import { EvaluatorDashboard } from '@/components/Dashboard/EvaluatorDashboard';
import { EvaluateeDashboard } from '@/components/Dashboard/EvaluateeDashboard';

const Index = () => {
  const { user } = useAuth();

  // 사용자 역할에 따른 대시보드 렌더링
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={user.role} userName={user.name} />
      
      <main className="max-w-7xl mx-auto">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Index;
