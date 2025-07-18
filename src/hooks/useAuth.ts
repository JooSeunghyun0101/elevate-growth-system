import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export const useAuth = () => {
  const auth = useAuthContext();
  
  // 추가적인 인증 관련 로직
  const isAuthenticated = !!auth.user;
  const isHR = auth.user?.role === 'hr';
  const isEvaluator = auth.user?.role === 'evaluator';
  const isEvaluatee = auth.user?.role === 'evaluatee';
  
  const canAccessEvaluation = (requiredRole?: UserRole) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true;
    return auth.user?.role === requiredRole;
  };
  
  const canManageEmployees = () => {
    return isHR;
  };
  
  const canEvaluate = () => {
    return isEvaluator || isHR;
  };
  
  return {
    ...auth,
    isAuthenticated,
    isHR,
    isEvaluator,
    isEvaluatee,
    canAccessEvaluation,
    canManageEmployees,
    canEvaluate
  };
}; 