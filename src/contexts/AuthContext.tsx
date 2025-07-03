
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
}

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// New user data based on provided employee information
const mockUsers: Record<string, User> = {
  // HR 관리자
  'H1411166': {
    id: 'H1411166',
    employeeId: 'H1411166',
    name: '주승현',
    role: 'hr',
    department: '인사기획팀',
    position: '사원'
  },
  // 평가자들
  'H0807021': {
    id: 'H0807021',
    employeeId: 'H0807021',
    name: '박준형',
    role: 'evaluator',
    department: '인사부',
    position: '이사'
  },
  'H0908033': {
    id: 'H0908033',
    employeeId: 'H0908033',
    name: '박판근',
    role: 'evaluator',
    department: '인사기획팀',
    position: '팀장'
  },
  'H1310159': {
    id: 'H1310159',
    employeeId: 'H1310159',
    name: '김남엽',
    role: 'evaluator',
    department: '인사팀',
    position: '팀장'
  },
  // 피평가자들
  'H0908033_evaluatee': {
    id: 'H0908033_evaluatee',
    employeeId: 'H0908033',
    name: '박판근',
    role: 'evaluatee',
    department: '인사기획팀',
    position: '팀장',
    growthLevel: 3,
    evaluatorId: 'H0807021'
  },
  'H1310159_evaluatee': {
    id: 'H1310159_evaluatee',
    employeeId: 'H1310159',
    name: '김남엽',
    role: 'evaluatee',
    department: '인사팀',
    position: '팀장',
    growthLevel: 3,
    evaluatorId: 'H0807021'
  },
  'H1310172': {
    id: 'H1310172',
    employeeId: 'H1310172',
    name: '이수한',
    role: 'evaluatee',
    department: '인사기획팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H0908033'
  },
  'H1911042': {
    id: 'H1911042',
    employeeId: 'H1911042',
    name: '김민선',
    role: 'evaluatee',
    department: '인사기획팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H0908033'
  },
  'H1411231': {
    id: 'H1411231',
    employeeId: 'H1411231',
    name: '최은송',
    role: 'evaluatee',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159'
  },
  'H1205006': {
    id: 'H1205006',
    employeeId: 'H1205006',
    name: '황정원',
    role: 'evaluatee',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159'
  },
  'H2301040': {
    id: 'H2301040',
    employeeId: 'H2301040',
    name: '김민영',
    role: 'evaluatee',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159'
  },
  'H1501077': {
    id: 'H1501077',
    employeeId: 'H1501077',
    name: '조혜인',
    role: 'evaluatee',
    department: '인사팀',
    position: '사원',
    growthLevel: 1,
    evaluatorId: 'H1310159'
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

  const login = async (employeeId: string, password: string): Promise<boolean> => {
    // Mock authentication with employee ID
    if (mockUsers[employeeId] && password === '1234') {
      const loggedInUser = mockUsers[employeeId];
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    
    // Check for evaluatee version of evaluator IDs
    const evaluateeKey = `${employeeId}_evaluatee`;
    if (mockUsers[evaluateeKey] && password === '1234') {
      const loggedInUser = mockUsers[evaluateeKey];
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
