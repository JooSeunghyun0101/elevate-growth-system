import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeeService } from '@/lib/services';
import { User, Employee, UserRole, CONSTANTS } from '@/types';
import { errorHandler } from '@/utils/errorHandler';

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  getAvailableRoles: (employeeId: string) => Promise<UserRole[]>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert database employee to available roles
const getAvailableRolesFromEmployee = (employee: Employee): UserRole[] => {
  // Temporary HR access for H1411166 (주승현)
  if (employee.employee_id === 'H1411166') {
    return ['evaluatee', 'hr'];
  }
  
  // HR role is not currently implemented in the database, so we'll use a simple rule:
  // Only the director (이사) gets evaluator role, others get appropriate roles based on available_roles
  return employee.available_roles as UserRole[];
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

  const getAvailableRoles = async (employeeId: string): Promise<UserRole[]> => {
    try {
      const employee = await employeeService.getEmployeeById(employeeId);
      return employee ? getAvailableRolesFromEmployee(employee) : [];
    } catch (error) {
      console.error('Error fetching employee roles:', error);
      return [];
    }
  };

  const login = async (employeeId: string, password: string, role?: string): Promise<boolean> => {
    try {
      console.log('🔐 로그인 시도:', { employeeId, password: '***' });
      
      // Mock authentication with employee ID
      if (password !== CONSTANTS.DEFAULT_PASSWORD) {
        console.log('❌ 비밀번호 불일치');
        return false;
      }

      console.log('🔍 데이터베이스에서 직원 정보 조회 중...');
      const employee = await employeeService.getEmployeeById(employeeId);
      console.log('👤 조회된 직원 정보:', employee);
      
      if (!employee) {
        console.log('❌ 직원 정보를 찾을 수 없음');
        return false;
      }

      const availableRoles = getAvailableRolesFromEmployee(employee);
      console.log('🎭 사용 가능한 역할:', availableRoles);
      
      // If role is provided, use it; otherwise use the first available role
      const selectedRole = role as UserRole || availableRoles[0];
      console.log('👔 선택된 역할:', selectedRole);
      
      // Check if the selected role is available for this employee
      if (!availableRoles.includes(selectedRole)) {
        console.log('❌ 선택된 역할이 사용 불가능');
        return false;
      }
      
      const loggedInUser: User = {
        id: employee.id,
        employeeId: employee.employee_id,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        growthLevel: employee.growth_level || undefined,
        evaluatorId: employee.evaluator_id || undefined,
        availableRoles,
        role: selectedRole
      };
      
      console.log('✅ 로그인 성공, 사용자 정보:', loggedInUser);
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    
    try {
      const employee = await employeeService.getEmployeeById(user.employeeId);
      if (employee && getAvailableRolesFromEmployee(employee).includes(role)) {
        const updatedUser = { ...user, role };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Role switch error:', error);
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
