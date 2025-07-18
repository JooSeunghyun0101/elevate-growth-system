// 기본 타입 정의
export type UserRole = 'hr' | 'evaluator' | 'evaluatee';
export type EvaluationStatus = 'in-progress' | 'completed';
export type NotificationPriority = 'low' | 'medium' | 'high';

// 사용자 관련 타입
export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  department: string;
  position?: string;
  growthLevel?: number;
  evaluatorId?: string;
  availableRoles?: UserRole[];
}

// 직원 관련 타입
export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  position: string;
  department: string;
  growth_level: number | null;
  evaluator_id: string | null;
  available_roles: string[];
  created_at: string;
  updated_at: string;
}

// 평가 관련 타입
export interface Evaluation {
  id: string;
  evaluatee_id: string;
  evaluatee_name: string;
  evaluatee_position: string;
  evaluatee_department: string;
  growth_level: number;
  evaluation_status: EvaluationStatus;
  last_modified: string;
  created_at: string;
  updated_at: string;
}

// 과업 관련 타입
export interface Task {
  id: string;
  task_id: string;
  evaluation_id: string;
  title: string;
  description: string | null;
  weight: number;
  start_date: string | null;
  end_date: string | null;
  contribution_method: string | null;
  contribution_scope: string | null;
  score: number | null;
  feedback: string | null;
  feedback_date: string | null;
  evaluator_name: string | null;
  created_at: string;
}

// 피드백 히스토리 타입
export interface FeedbackHistory {
  id: string;
  task_id: string;
  content: string;
  evaluator_name: string | null;
  created_at: string;
}

// 알림 관련 타입
export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  related_evaluation_id: string | null;
  related_task_id: string | null;
  is_read: boolean;
  created_at: string;
}

// 설정 관련 타입
export interface Setting {
  id: string;
  user_id: string;
  setting_type: string;
  setting_data: any;
  created_at: string;
  updated_at: string;
}

// 평가 데이터 타입 (프론트엔드용)
export interface EvaluationData {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  growthLevel: number;
  evaluationStatus: EvaluationStatus;
  tasks: TaskData[];
  lastModified: string;
}

export interface TaskData {
  id: string;
  taskId: string;
  title: string;
  description: string;
  weight: number;
  startDate: string;
  endDate: string;
  contributionMethod: string;
  contributionScope: string;
  score: number | null;
  feedback: string | null;
  feedbackHistory?: FeedbackHistory[];
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// 폼 관련 타입
export interface LoginFormData {
  employeeId: string;
  password: string;
  role?: UserRole;
}

// 상수 정의
export const CONSTANTS = {
  // 가중치 관련
  TOTAL_WEIGHT: 100,
  MIN_FEEDBACK_LENGTH: 30,
  MIN_FEEDBACK_SENTENCES: 2,
  
  // 기본 비밀번호 (개발용)
  DEFAULT_PASSWORD: '1234',
  
  // 페이지 제목
  PAGE_TITLES: {
    LOGIN: '로그인',
    DASHBOARD: '대시보드',
    EVALUATION: '평가',
    NOT_FOUND: '페이지를 찾을 수 없습니다'
  },
  
  // 알림 타입
  NOTIFICATION_TYPES: {
    EVALUATION_COMPLETED: 'evaluation_completed',
    FEEDBACK_RECEIVED: 'feedback_received',
    TASK_UPDATED: 'task_updated'
  }
} as const;

// 유틸리티 타입
export type ApiError = {
  code: string;
  message: string;
  details?: any;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'; 