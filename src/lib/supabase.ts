import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxpxrtrbvdmhqojjzziz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cHhydHJidmRtaHFvamp6eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Njg4MzQsImV4cCI6MjA2ODE0NDgzNH0.sEb5r15i1Ndk4kbj32Rwy6_PjrPuA8bzyQI2W2EuamU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
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

export interface Evaluation {
  id: string;
  evaluatee_id: string;
  evaluatee_name: string;
  evaluatee_position: string;
  evaluatee_department: string;
  growth_level: number;
  evaluation_status: 'in-progress' | 'completed';
  last_modified: string;
  created_at: string;
  updated_at: string;
}

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

export interface FeedbackHistory {
  id: string;
  task_id: string;
  content: string;
  evaluator_name: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  related_evaluation_id: string | null;
  related_task_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Setting {
  id: string;
  user_id: string;
  setting_type: string;
  setting_data: any;
  created_at: string;
  updated_at: string;
} 