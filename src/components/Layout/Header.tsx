
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Settings, User, LogOut, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  userRole: 'hr' | 'evaluator' | 'evaluatee';
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ userRole, userName }) => {
  const { logout } = useAuth();

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

  const getRoleClassName = (role: string) => {
    switch (role) {
      case 'hr':
        return 'role-hr';
      case 'evaluator':
        return 'role-evaluator';
      case 'evaluatee':
        return 'role-evaluatee';
      default:
        return '';
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="ok-orange w-8 h-8 rounded-lg flex items-center justify-center">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Performance Management</h1>
            <p className="text-sm text-gray-500">차세대 성과관리 시스템</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleClassName(userRole)}`}>
            {getRoleDisplay(userRole)}
          </div>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback>
                    {userName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleDisplay(userRole)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
