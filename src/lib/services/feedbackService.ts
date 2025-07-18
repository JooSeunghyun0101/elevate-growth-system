import { supabase } from '../supabase';
import { FeedbackHistory } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const feedbackService = {
  // 과업 ID로 피드백 히스토리 조회
  async getFeedbackHistoryByTaskId(taskId: string): Promise<FeedbackHistory[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_history')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // task_id로 피드백 히스토리 조회
  async getFeedbackHistoryByTaskIdString(taskIdString: string): Promise<FeedbackHistory[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_history')
        .select('*')
        .eq('task_id', taskIdString)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 피드백 히스토리 생성
  async createFeedbackHistory(feedback: Omit<FeedbackHistory, 'id' | 'created_at'>): Promise<FeedbackHistory> {
    try {
      const { data, error } = await supabase
        .from('feedback_history')
        .insert(feedback)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 피드백 히스토리 삭제
  async deleteFeedbackHistory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feedback_history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 과업 ID로 모든 피드백 히스토리 삭제
  async deleteFeedbackHistoryByTaskId(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feedback_history')
        .delete()
        .eq('task_id', taskId);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가자별 피드백 히스토리 조회
  async getFeedbackHistoryByEvaluator(evaluatorName: string): Promise<FeedbackHistory[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_history')
        .select('*')
        .eq('evaluator_name', evaluatorName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 