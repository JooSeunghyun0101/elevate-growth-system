import { supabase } from '../supabase';
import { Evaluation } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const evaluationService = {
  // 모든 평가 조회
  async getAllEvaluations(): Promise<Evaluation[]> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('evaluatee_name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 특정 직원의 평가 조회
  async getEvaluationByEmployeeId(employeeId: string): Promise<Evaluation | null> {
    try {
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
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가 생성
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>): Promise<Evaluation> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가 업데이트
  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .update({ ...updates, last_modified: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가 상태별 조회
  async getEvaluationsByStatus(status: 'in-progress' | 'completed'): Promise<Evaluation[]> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('evaluation_status', status)
        .order('evaluatee_name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가 삭제
  async deleteEvaluation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 