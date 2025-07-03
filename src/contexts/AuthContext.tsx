
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: 'hr' | 'evaluator' | 'evaluatee';
  department: string;
  position?: string;
  growthLevel?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Expanded mock users to include all 5 evaluatees from the evaluator dashboard
const mockUsers: Record<string, User> = {
  'hr@company.com': {
    id: 'hr',
    name: '김민준',
    role: 'hr',
    department: '인사팀'
  },
  'evaluator@company.com': {
    id: 'evaluator',
    name: '박서준',
    role: 'evaluator',
    department: '개발팀'
  },
  // 5 evaluatees matching the evaluator dashboard
  'evaluatee1@company.com': {
    id: '1',
    name: '이하나',
    role: 'evaluatee',
    department: '마케팅팀',
    position: '사원',
    growthLevel: 1
  },
  'evaluatee2@company.com': {
    id: '2',
    name: '김대리',
    role: 'evaluatee',
    department: '개발팀',
    position: '대리',
    growthLevel: 2
  },
  'evaluatee3@company.com': {
    id: '3',
    name: '박차장',
    role: 'evaluatee',
    department: '영업팀',
    position: '차장',
    growthLevel: 3
  },
  'evaluatee4@company.com': {
    id: '4',
    name: '최부장',
    role: 'evaluatee',
    department: '기획팀',
    position: '부장',
    growthLevel: 4
  },
  'evaluatee5@company.com': {
    id: '5',
    name: '정사원',
    role: 'evaluatee',
    department: '디자인팀',
    position: '사원',
    growthLevel: 1
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (mockUsers[email] && password === 'password') {
      const loggedInUser = mockUsers[email];
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
