
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  employeeId: string;
  name: string;
  role: 'hr' | 'evaluator' | 'evaluatee';
  department: string;
  position?: string;
  growthLevel?: number;
  evaluatorId?: string;
  availableRoles?: ('hr' | 'evaluator' | 'evaluatee')[];
}

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'hr' | 'evaluator' | 'evaluatee') => void;
  getAvailableRoles: (employeeId: string) => ('hr' | 'evaluator' | 'evaluatee')[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Updated user data with multi-role support
const employeeData: Record<string, Omit<User, 'role'> & { availableRoles: ('hr' | 'evaluator' | 'evaluatee')[] }> = {
  // HR 관리자 (동시에 피평가자)
  'H1411166': {
    id: 'H1411166',
    employeeId: 'H1411166',
    name: '주승현',
    department: '인사기획팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H0908033',
    availableRoles: ['hr', 'evaluatee']
  },
  // 평가자들 (동시에 피평가자)
  'H0807021': {
    id: 'H0807021',
    employeeId: 'H0807021',
    name: '박준형',
    department: '인사부',
    position: '이사',
    availableRoles: ['evaluator']
  },
  'H0908033': {
    id: 'H0908033',
    employeeId: 'H0908033',
    name: '박판근',
    department: '인사기획팀',
    position: '팀장',
    growthLevel: 3,
    evaluatorId: 'H0807021',
    availableRoles: ['evaluator', 'evaluatee']
  },
  'H1310159': {
    id: 'H1310159',
    employeeId: 'H1310159',
    name: '김남엽',
    department: '인사팀',
    position: '팀장',
    growthLevel: 3,
    evaluatorId: 'H0807021',
    availableRoles: ['evaluator', 'evaluatee']
  },
  // 피평가자들
  'H1310172': {
    id: 'H1310172',
    employeeId: 'H1310172',
    name: '이수한',
    department: '인사기획팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H0908033',
    availableRoles: ['evaluatee']
  },
  'H1911042': {
    id: 'H1911042',
    employeeId: 'H1911042',
    name: '김민선',
    department: '인사기획팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H0908033',
    availableRoles: ['evaluatee']
  },
  'H1411231': {
    id: 'H1411231',
    employeeId: 'H1411231',
    name: '최은송',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159',
    availableRoles: ['evaluatee']
  },
  'H1205006': {
    id: 'H1205006',
    employeeId: 'H1205006',
    name: '황정원',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159',
    availableRoles: ['evaluatee']
  },
  'H2301040': {
    id: 'H2301040',
    employeeId: 'H2301040',
    name: '김민영',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159',
    availableRoles: ['evaluatee']
  },
  'H1501077': {
    id: 'H1501077',
    employeeId: 'H1501077',
    name: '조혜인',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159',
    availableRoles: ['evaluatee']
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const getAvailableRoles = (employeeId: string): ('hr' | 'evaluator' | 'evaluatee')[] => {
    const employee = employeeData[employeeId];
    return employee ? employee.availableRoles : [];
  };

  const login = async (employeeId: string, password: string, role?: string): Promise<boolean> => {
    // Mock authentication with employee ID
    if (employeeData[employeeId] && password === '1234') {
      const employee = employeeData[employeeId];
      
      // If role is provided, use it; otherwise use the first available role
      const selectedRole = role as 'hr' | 'evaluator' | 'evaluatee' || employee.availableRoles[0];
      
      // Check if the selected role is available for this employee
      if (!employee.availableRoles.includes(selectedRole)) {
        return false;
      }
      
      const loggedInUser: User = {
        ...employee,
        role: selectedRole
      };
      
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    
    return false;
  };

  const switchRole = (role: 'hr' | 'evaluator' | 'evaluatee') => {
    if (user && employeeData[user.employeeId]?.availableRoles.includes(role)) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, getAvailableRoles, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
