import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Supabase 연결 테스트 시작...');
    
    // 간단한 테이블 조회로 연결 테스트
    const { data, error, status, statusText } = await supabase
      .from('employees')
      .select('count')
      .limit(1);
    
    console.log('📡 Supabase 응답:', { 
      data, 
      error, 
      status, 
      statusText
    });
    
    if (error) {
      console.error('❌ Supabase 연결 실패:', error);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공!');
    return true;
  } catch (err) {
    console.error('💥 Supabase 연결 테스트 예외:', err);
    return false;
  }
};

// 브라우저 콘솔에서 직접 호출할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
} 