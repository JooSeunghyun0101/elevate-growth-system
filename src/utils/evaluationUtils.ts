
import { EvaluationData } from '@/types/evaluation';

export interface EmployeeInfo {
  id: string;
  name: string;
  position: string;
  department: string;
  growthLevel: number;
  evaluatorId?: string;
}

export interface DepartmentStats {
  department: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface ActivityRecord {
  user: string;
  action: string;
  time: string;
  type: 'update' | 'complete' | 'edit' | 'feedback';
}

// Get all employees from the new employee data
export const getAllEmployees = (): EmployeeInfo[] => {
  return [
    // 평가자들 (이중 역할)
    { id: 'H0908033', name: '박판근', position: '팀장', department: '인사기획팀', growthLevel: 3, evaluatorId: 'H0807021' },
    { id: 'H1310159', name: '김남엽', position: '팀장', department: '인사팀', growthLevel: 3, evaluatorId: 'H0807021' },
    // 피평가자들
    { id: 'H1310172', name: '이수한', position: '사원', department: '인사기획팀', growthLevel: 1, evaluatorId: 'H0908033' },
    { id: 'H1411166', name: '주승현', position: '사원', department: '인사기획팀', growthLevel: 1, evaluatorId: 'H0908033' },
    { id: 'H1911042', name: '김민선', position: '사원', department: '인사기획팀', growthLevel: 1, evaluatorId: 'H0908033' },
    { id: 'H1411231', name: '최은송', position: '사원', department: '인사팀', growthLevel: 1, evaluatorId: 'H1310159' },
    { id: 'H1205006', name: '황정원', position: '사원', department: '인사팀', growthLevel: 1, evaluatorId: 'H1310159' },
    { id: 'H2301040', name: '김민영', position: '사원', department: '인사팀', growthLevel: 1, evaluatorId: 'H1310159' },
    { id: 'H1501077', name: '조혜인', position: '사원', department: '인사팀', growthLevel: 1, evaluatorId: 'H1310159' },
  ];
};

// Clear old localStorage data and initialize with new structure
export const clearOldData = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('evaluation-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Initialize with new employee data structure
export const initializeEmployeeData = () => {
  clearOldData();
  console.log('기존 평가 데이터가 삭제되고 새로운 직원 데이터로 초기화되었습니다.');
};

// Load evaluation data from localStorage
export const loadAllEvaluationData = (): EvaluationData[] => {
  const employees = getAllEmployees();
  const evaluations: EvaluationData[] = [];
  
  employees.forEach(employee => {
    const savedData = localStorage.getItem(`evaluation-${employee.id}`);
    if (savedData) {
      try {
        evaluations.push(JSON.parse(savedData));
      } catch (error) {
        console.error(`Failed to load evaluation data for ${employee.id}:`, error);
      }
    }
  });
  
  return evaluations;
};

// Calculate department statistics
export const getDepartmentStats = (): DepartmentStats[] => {
  const employees = getAllEmployees();
  const evaluations = loadAllEvaluationData();
  const departmentMap = new Map<string, { total: number; completed: number }>();
  
  // Initialize departments
  employees.forEach(emp => {
    if (!departmentMap.has(emp.department)) {
      departmentMap.set(emp.department, { total: 0, completed: 0 });
    }
    const dept = departmentMap.get(emp.department)!;
    dept.total++;
  });
  
  // Count completed evaluations
  evaluations.forEach(evaluation => {
    const dept = departmentMap.get(evaluation.evaluateeDepartment);
    if (dept && evaluation.evaluationStatus === 'completed') {
      dept.completed++;
    }
  });
  
  return Array.from(departmentMap.entries()).map(([department, stats]) => ({
    department,
    total: stats.total,
    completed: stats.completed,
    percentage: Math.round((stats.completed / stats.total) * 100)
  }));
};

// Get recent activities
export const getRecentActivities = (): ActivityRecord[] => {
  const evaluations = loadAllEvaluationData();
  const activities: ActivityRecord[] = [];
  
  evaluations.forEach(evaluation => {
    // Add completion activities
    if (evaluation.evaluationStatus === 'completed') {
      activities.push({
        user: evaluation.evaluateeName,
        action: '평가 완료',
        time: formatTimeAgo(evaluation.lastModified),
        type: 'complete'
      });
    }
    
    // Add feedback activities
    evaluation.tasks.forEach(task => {
      if (task.feedback && task.feedbackDate) {
        activities.push({
          user: task.evaluatorName || '평가자',
          action: `${task.title} 피드백 작성`,
          time: formatTimeAgo(task.feedbackDate),
          type: 'feedback'
        });
      }
    });
  });
  
  // Sort by time (most recent first) and limit to 10
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);
};

// Format time ago
const formatTimeAgo = (isoString: string): string => {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else {
    return '방금 전';
  }
};

// Calculate overall statistics
export const getOverallStats = () => {
  const employees = getAllEmployees();
  const evaluations = loadAllEvaluationData();
  const completedEvaluations = evaluations.filter(e => e.evaluationStatus === 'completed');
  
  // Calculate achievement rate
  let totalAchieved = 0;
  completedEvaluations.forEach(evaluation => {
    const totalScore = evaluation.tasks.reduce((sum, task) => {
      return sum + (task.score ? (task.score * task.weight / 100) : 0);
    }, 0);
    if (Math.floor(totalScore) >= evaluation.growthLevel) {
      totalAchieved++;
    }
  });
  
  return {
    totalEmployees: employees.length,
    completionRate: Math.round((completedEvaluations.length / employees.length) * 100),
    achievementRate: completedEvaluations.length > 0 ? Math.round((totalAchieved / completedEvaluations.length) * 100) : 0,
    inProgressEvaluations: evaluations.filter(e => e.evaluationStatus === 'in-progress').length
  };
};
