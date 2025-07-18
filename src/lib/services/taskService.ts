import { supabase } from '../supabase';
import { Task } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const taskService = {
  // 평가 ID로 과업들 조회
  async getTasksByEvaluationId(evaluationId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .order('task_id');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // task_id로 과업 조회
  async getTaskByTaskId(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 과업 생성
  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 과업 업데이트
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 과업 삭제
  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가 ID로 모든 과업 삭제
  async deleteTasksByEvaluationId(evaluationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('evaluation_id', evaluationId);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
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

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(defaultTasks)
        .select();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 과업 점수 업데이트
  async updateTaskScore(id: string, score: number, feedback: string, evaluatorName: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          score,
          feedback,
          feedback_date: new Date().toISOString(),
          evaluator_name: evaluatorName
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 