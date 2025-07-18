import { supabase } from '../supabase';
import { Notification } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const notificationService = {
  // 수신자 ID로 알림 조회
  async getNotificationsByRecipientId(recipientId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 알림 생성
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 알림 삭제
  async deleteNotification(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 사용자의 모든 알림 삭제
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', userId);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 알림 읽음 처리
  async markAsRead(id: string): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 사용자의 모든 알림 읽음 처리
  async markAllAsRead(recipientId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', recipientId);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(recipientId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 