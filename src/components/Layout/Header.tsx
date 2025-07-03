
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  userRole: string;
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ userRole, userName }) => {
  const { logout } = useAuth();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'hr':
        return 'role-hr';
      case 'evaluator':
        return 'role-evaluator';
      case 'evaluatee':
        return 'role-evaluatee';
      default:
        return 'role-hr';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'hr':
        return { full: 'HR 관리자', mobile: 'HR' };
      case 'evaluator':
        return { full: '평가자', mobile: '평가' };
      case 'evaluatee':
        return { full: '피평가자', mobile: '피평가' };
      default:
        return { full: 'HR 관리자', mobile: 'HR' };
    }
  };

  const handleLogout = () => {
    logout();
  };

  const roleDisplay = getRoleDisplayName(userRole);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 performance-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">OK</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="hidden md:inline">Performance Management</span>
                <span className="inline md:hidden">PM 시스템</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="hidden md:inline">차세대 성과관리 시스템</span>
                <span className="inline md:hidden">성과관리</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{userName}</span>
            <Badge className={getRoleBadgeClass(userRole)}>
              <span className="hidden sm:inline">{roleDisplay.full}</span>
              <span className="inline sm:hidden">{roleDisplay.mobile}</span>
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
