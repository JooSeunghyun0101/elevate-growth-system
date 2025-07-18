
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, UserCheck } from 'lucide-react';

const Login = () => {
  const { user, login, getAvailableRoles } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [availableRoles, setAvailableRoles] = useState<('hr' | 'evaluator' | 'evaluatee')[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [step, setStep] = useState<'credentials' | 'role'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'hr':
        return 'HR 관리자';
      case 'evaluator':
        return '평가자';
      case 'evaluatee':
        return '피평가자';
      default:
        return '';
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !password) {
      setError('사번과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const roles = await getAvailableRoles(employeeId);
      if (roles.length === 0) {
        setError('사번 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      if (roles.length === 1) {
        // Single role - login directly
        setIsLoading(true);
        const success = await login(employeeId, password, roles[0]);
        if (!success) {
          setError('사번 또는 비밀번호가 올바르지 않습니다.');
        }
        setIsLoading(false);
      } else {
        // Multiple roles - show role selection
        setAvailableRoles(roles);
        setStep('role');
      }
    } catch (error) {
      console.error('역할 조회 오류:', error);
      setError('사번 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(employeeId, password, selectedRole);
    
    if (!success) {
      setError('로그인 중 오류가 발생했습니다.');
    }
    
    setIsLoading(false);
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setSelectedRole('');
    setAvailableRoles([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'hsl(var(--ok-bright-gray))' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-white rounded-lg flex items-center justify-center border border-gray-200">
            <img src="/느낌표_orange.png" alt="OK Logo" className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl">Performance Management</CardTitle>
          <CardDescription>차세대 성과관리_기여도평가 시스템에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">사번</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="사번을 입력하세요 (예: H1411166)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">역할 선택</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">역할을 선택하세요</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplay(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToCredentials}
                >
                  이전으로
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
