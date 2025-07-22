// 기존 database.ts 파일은 새로운 서비스 모듈로 대체됩니다.
// 새로운 서비스들을 사용하세요:
// import { employeeService, evaluationService, taskService, feedbackService, notificationService, settingService } from './services';

import { supabase } from './supabase';
import { Employee, Evaluation, Task, FeedbackHistory, Notification, Setting } from '@/types';

// 직원 관련 함수들
export const employeeService = {
  // 모든 직원 조회
  async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // 직원 ID로 조회
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    console.log('🔎 데이터베이스 조회 시작:', employeeId);
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single();
    
    console.log('📊 데이터베이스 응답:', { data, error });
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ 직원 정보 없음 (PGRST116)');
        return null; // No rows found
      }
      console.error('❌ 데이터베이스 오류:', error);
      throw error;
    }
    return data;
  },

  // 평가자 ID로 피평가자들 조회
  async getEvaluateesByEvaluator(evaluatorId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('evaluator_id', evaluatorId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};

// 평가 관련 함수들
export const evaluationService = {
  // 모든 평가 조회
  async getAllEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('evaluatee_name');
    
    if (error) throw error;
    return data || [];
  },

  // 특정 직원의 평가 조회
  async getEvaluationByEmployeeId(employeeId: string): Promise<Evaluation | null> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('evaluatee_id', employeeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // 평가 생성
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 평가 업데이트
  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .update({ ...updates, last_modified: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// 과업 관련 함수들
export const taskService = {
  // 평가 ID로 과업들 조회
  async getTasksByEvaluationId(evaluationId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('evaluation_id', evaluationId)
      .is('deleted_at', null)
      .order('task_id');
    
    if (error) throw error;
    return data || [];
  },

  // 과업 생성
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 과업 업데이트
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 과업 소프트 삭제
  async softDeleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // 과업 하드 삭제 (완전 삭제)
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 평가 ID로 모든 과업 삭제
  async deleteTasksByEvaluationId(evaluationId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('evaluation_id', evaluationId);
    
    if (error) throw error;
  },

  // 여러 과업 일괄 생성
  async createDefaultTasks(evaluationId: string, evaluateeId: string): Promise<Task[]> {
    const defaultTasks = [
      {
        task_id: `${evaluateeId}_T1`,
        evaluation_id: evaluationId,
        title: '브랜드 캠페인 기획',
        description: 'Q2 신제품 출시를 위한 통합 브랜드 캠페인 기획 및 실행',
        weight: 30,
        start_date: '2024-01-15',
        end_date: '2024-03-15'
      },
      {
        task_id: `${evaluateeId}_T2`,
        evaluation_id: evaluationId,
        title: '고객 만족도 조사',
        description: '기존 고객 대상 만족도 조사 설계 및 분석',
        weight: 25,
        start_date: '2024-02-01',
        end_date: '2024-04-01'
      },
      {
        task_id: `${evaluateeId}_T3`,
        evaluation_id: evaluationId,
        title: '소셜미디어 콘텐츠 관리',
        description: '월간 소셜미디어 콘텐츠 계획 및 게시물 관리',
        weight: 20,
        start_date: '2024-01-01',
        end_date: '2024-06-30'
      },
      {
        task_id: `${evaluateeId}_T4`,
        evaluation_id: evaluationId,
        title: '팀 프로젝트 협업',
        description: '디자인팀과의 협업 프로젝트 진행',
        weight: 25,
        start_date: '2024-03-01',
        end_date: '2024-05-31'
      }
    ];

    const { data, error } = await supabase
      .from('tasks')
      .insert(defaultTasks)
      .select();
    
    if (error) throw error;
    return data || [];
  }
};

// 피드백 히스토리 관련 함수들
export const feedbackService = {
  // 과업 ID로 피드백 히스토리 조회
  async getFeedbackHistoryByTaskId(taskId: string): Promise<FeedbackHistory[]> {
    console.log('🔍 피드백 히스토리 데이터베이스 조회 시작:', taskId);
    
    const { data, error } = await supabase
      .from('feedback_history')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    console.log('📊 피드백 히스토리 조회 결과:', {
      taskId,
      found: data?.length || 0,
      error: error,
      data: data?.map(d => ({ 
        id: d.id, 
        content: d.content.substring(0, 30) + '...', 
        created_at: d.created_at 
      })) || []
    });
    
    if (error) {
      console.error('❌ 피드백 히스토리 조회 오류:', error);
      throw error;
    }
    return data || [];
  },

  // 피드백 히스토리 생성
  async createFeedbackHistory(feedback: Omit<FeedbackHistory, 'id' | 'created_at'>): Promise<FeedbackHistory> {
    console.log('💾 피드백 히스토리 데이터베이스 저장 시작:', {
      task_id: feedback.task_id,
      content_length: feedback.content.length,
      evaluator_name: feedback.evaluator_name
    });
    
    const { data, error } = await supabase
      .from('feedback_history')
      .insert(feedback)
      .select()
      .single();
    
    if (error) {
      console.error('❌ 피드백 히스토리 저장 데이터베이스 오류:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        feedback
      });
      throw error;
    }
    
    console.log('✅ 피드백 히스토리 데이터베이스 저장 완료:', {
      id: data.id,
      task_id: data.task_id,
      created_at: data.created_at
    });
    
    return data;
  }
};

// 알림 관련 함수들
export const notificationService = {
  // 수신자 ID로 알림들 조회
  async getNotificationsByRecipientId(recipientId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // 알림 생성
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 알림 삭제
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // 사용자의 모든 알림 삭제
  async deleteAllNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('recipient_id', userId);
    
    if (error) throw error;
  },

  // 알림을 읽음으로 표시
  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 여러 알림을 읽음으로 표시
  async markAllAsRead(recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false);
    
    if (error) throw error;
  }
};

// 설정 관련 함수들
export const settingsService = {
  // 사용자 설정 조회
  async getUserSetting(userId: string, settingType: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .eq('setting_type', settingType)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116은 "not found" 에러
    return data;
  },

  // 사용자 설정 저장/업데이트
  async saveSetting(userId: string, settingType: string, settingData: any): Promise<Setting> {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        setting_type: settingType,
        setting_data: settingData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 사용자의 모든 설정 조회
  async getUserSettings(userId: string): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // 설정 삭제
  async deleteSetting(userId: string, settingType: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('user_id', userId)
      .eq('setting_type', settingType);
    
    if (error) throw error;
  }
}; 