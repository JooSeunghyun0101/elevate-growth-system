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

// Updated employee list with new positions and growth levels (excluding directors)
export const getAllEmployees = (): EmployeeInfo[] => {
  return [
    // 차장급 - 평가자 겸 피평가자
    { id: 'H0908033', name: '박판근', position: '차장', department: '인사기획팀', growthLevel: 3, evaluatorId: 'H0807021' },
    { id: 'H1310159', name: '김남엽', position: '차장', department: '인사팀', growthLevel: 3, evaluatorId: 'H0807021' },
    // 차장급 - 피평가자만
    { id: 'H1310172', name: '이수한', position: '차장', department: '인사기획팀', growthLevel: 3, evaluatorId: 'H0908033' },
    { id: 'H1411166', name: '주승현', position: '차장', department: '인사기획팀', growthLevel: 3, evaluatorId: 'H0908033' },
    { id: 'H1411231', name: '최은송', position: '차장', department: '인사팀', growthLevel: 3, evaluatorId: 'H1310159' },
    // 대리급 - 피평가자만
    { id: 'H1911042', name: '김민선', position: '대리', department: '인사기획팀', growthLevel: 2, evaluatorId: 'H0908033' },
    { id: 'H1205006', name: '황정원', position: '대리', department: '인사팀', growthLevel: 2, evaluatorId: 'H1310159' },
    { id: 'H1501077', name: '조혜인', position: '대리', department: '인사팀', growthLevel: 2, evaluatorId: 'H1310159' },
    // 사원급 - 피평가자만
    { id: 'H2301040', name: '김민영', position: '사원', department: '인사팀', growthLevel: 1, evaluatorId: 'H1310159' },
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

// 기여방식과 기여범위 상세 설명
export const contributionMethodDescriptions = {
  '총괄': '업무 전체를 책임지고 관리하며, 프로젝트의 전체적인 방향을 설정하고 조율합니다. 모든 관련 업무를 포괄적으로 관리하고 최종 결과물에 대한 책임을 집니다.',
  '리딩': '특정 영역을 주도적으로 담당하며, 해당 영역의 성과에 직접적인 책임을 집니다. 팀이나 그룹을 이끌며 방향성을 제시하고 성과를 창출합니다.',
  '실무': '핵심 업무를 직접 수행하며, 업무의 질적 완성도에 기여합니다. 구체적인 업무 실행과 결과물 생성을 담당합니다.',
  '지원': '다른 구성원을 보조하고 지원하며, 주 담당자를 보조하는 역할을 수행합니다. 업무의 원활한 진행을 돕는 보조적 역할을 담당합니다.'
};

export const contributionScopeDescriptions = {
  '전략적': '조직 전체에 영향을 미치는 전략적 수준입니다. 부서를 넘어 조직 전체의 방향성이나 성과에 영향을 미치는 범위로, 조직의 미래 방향을 결정하는 중요한 역할을 합니다.',
  '상호적': '팀 단위 협업을 통해 공동 목표를 달성하는 범위입니다. 팀 내 다른 구성원들과 긴밀히 협력하여 상호 보완적인 역할을 수행하며, 팀의 성과 향상에 기여합니다.',
  '독립적': '개인의 판단과 책임 하에 독립적으로 업무를 기획하고 실행하는 범위입니다. 자율적으로 업무를 수행하며, 개인의 전문성과 역량을 발휘하여 성과를 창출합니다.',
  '의존적': '상급자나 동료의 지시나 가이드라인에 따라 업무를 수행하는 범위입니다. 다른 사람의 도움이나 지시가 필요한 수준으로, 주어진 지침에 따라 업무를 완수합니다.'
};

// 툴팁 표시를 위한 유틸리티 함수
export const getContributionTooltip = (type: 'method' | 'scope', value: string): string => {
  if (type === 'method') {
    return contributionMethodDescriptions[value as keyof typeof contributionMethodDescriptions] || '';
  } else {
    return contributionScopeDescriptions[value as keyof typeof contributionScopeDescriptions] || '';
  }
};
