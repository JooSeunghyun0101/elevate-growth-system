import { supabase } from '../supabase';
import { Setting } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const settingService = {
  // 사용자 설정 조회
  async getUserSetting(userId: string, settingType: string): Promise<Setting | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .eq('setting_type', settingType)
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

  // 설정 저장
  async saveSetting(userId: string, settingType: string, settingData: any): Promise<Setting> {
    try {
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
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 사용자의 모든 설정 조회
  async getUserSettings(userId: string): Promise<Setting[]> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 설정 삭제
  async deleteSetting(userId: string, settingType: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', userId)
        .eq('setting_type', settingType);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 사용자의 모든 설정 삭제
  async deleteAllUserSettings(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 