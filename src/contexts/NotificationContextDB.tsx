import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContext as INotificationContext } from '@/types/notification';
import { notificationService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProviderDB: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // 사용자별 알림 로드
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      console.log('📬 알림 데이터 로드 시작:', user.employeeId);
      const dbNotifications = await notificationService.getNotificationsByRecipientId(user.employeeId);
      console.log('📮 DB에서 조회된 알림:', dbNotifications.length, '개');
      
      // 데이터베이스 형식을 프론트엔드 형식으로 변환
      const formattedNotifications: Notification[] = dbNotifications.map(n => ({
        id: n.id,
        type: n.notification_type as any,
        title: n.title,
        message: n.message,
        priority: n.priority,
        senderId: n.sender_id,
        senderName: n.sender_name,
        recipientId: n.recipient_id,
        relatedEvaluationId: n.related_evaluation_id || undefined,
        relatedTaskId: n.related_task_id || undefined,
        isRead: n.is_read,
        createdAt: n.created_at,
        readAt: undefined, // 데이터베이스에서 read_at 필드가 없음
        lastModified: undefined
      }));

      setNotifications(formattedNotifications);
      console.log('✅ 알림 데이터 로드 완료:', formattedNotifications.length);
    } catch (error) {
      console.error('❌ 알림 로드 실패:', error);
    }
  };

  // 사용자가 변경되면 알림 로드
  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // 자동 새로고침 제거 - 저장/완료 버튼 클릭 시에만 새로고침
      
      return () => {};
    } else {
      setNotifications([]);
    }
  }, [user]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      console.log('📤 알림 생성 시작:', notificationData);

      // 피평가자에게 보내는 알림인 경우 과업별로 통합
      if (notificationData.recipientId && notificationData.relatedTaskId && notificationData.type === 'task_summary') {
        const existingNotification = notifications.find(n => 
          n.recipientId === notificationData.recipientId && 
          n.relatedTaskId === notificationData.relatedTaskId &&
          n.type === 'task_summary' &&
          !n.isRead &&
          new Date().getTime() - new Date(n.createdAt).getTime() < 5 * 60 * 1000 // 5분 이내
        );

        if (existingNotification) {
          // 기존 알림을 업데이트하여 통합 (현재는 새로 생성)
          console.log('⚠️ 기존 알림과 통합 처리 (현재는 새로 생성)');
        }
      }

      // 데이터베이스에 알림 생성
      console.log('💾 데이터베이스 알림 생성 시도:', {
        notification_type: notificationData.type,
        title: notificationData.title,
        message_length: notificationData.message.length,
        sender_id: notificationData.senderId,
        recipient_id: notificationData.recipientId
      });

      const dbNotification = await notificationService.createNotification({
        notification_type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        sender_id: notificationData.senderId,
        sender_name: notificationData.senderName,
        recipient_id: notificationData.recipientId,
        related_evaluation_id: notificationData.relatedEvaluationId || null,
        related_task_id: notificationData.relatedTaskId || null,
        is_read: false
      });

      console.log('✅ 데이터베이스 알림 생성 완료:', {
        notificationId: dbNotification.id,
        createdAt: dbNotification.created_at,
        recipientId: dbNotification.recipient_id
      });

      // 로컬 상태 업데이트 (현재 사용자가 수신자인 경우만)
      if (user && notificationData.recipientId === user.employeeId) {
        const newNotification: Notification = {
          id: dbNotification.id,
          type: dbNotification.notification_type as any,
          title: dbNotification.title,
          message: dbNotification.message,
          priority: dbNotification.priority,
          senderId: dbNotification.sender_id,
          senderName: dbNotification.sender_name,
          recipientId: dbNotification.recipient_id,
          relatedEvaluationId: dbNotification.related_evaluation_id || undefined,
          relatedTaskId: dbNotification.related_task_id || undefined,
          isRead: dbNotification.is_read,
          createdAt: dbNotification.created_at,
          readAt: undefined,
          lastModified: undefined
        };

        setNotifications(prev => [newNotification, ...prev]);
      }

      // 알림 생성 후 즉시 새로고침 (저장/완료 버튼 클릭 시에만 실행)
      console.log('🔄 알림 생성 완료 - 즉시 새로고침');
      await loadNotifications();
      
      console.log('✅ 알림 생성 및 새로고침 완료');
    } catch (error) {
      console.error('❌ 알림 생성 실패:', error);
      console.error('알림 생성 오류 상세:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        notificationData: {
          type: notificationData.type,
          title: notificationData.title,
          recipientId: notificationData.recipientId,
          senderId: notificationData.senderId
        }
      });
      
      // 오류가 발생해도 로컬 알림은 생성하지 않음 (데이터베이스 우선)
      throw error; // 오류를 상위로 전파
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📖 알림 읽음 처리:', notificationId);
      
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      ));

      console.log('✅ 알림 읽음 처리 완료');
    } catch (error) {
      console.error('❌ 알림 읽음 처리 실패:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      console.log('📖 모든 알림 읽음 처리');
      
      await notificationService.markAllAsRead(user.employeeId);
      
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString()
      })));

      console.log('✅ 모든 알림 읽음 처리 완료');
    } catch (error) {
      console.error('❌ 모든 알림 읽음 처리 실패:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('🗑️ 알림 삭제:', notificationId);
      
      // 데이터베이스에서 삭제
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      console.log('✅ 알림 삭제 완료');
    } catch (error) {
      console.error('❌ 알림 삭제 실패:', error);
    }
  };

  const deleteAllNotifications = async (userId: string) => {
    try {
      console.log('🗑️ 모든 알림 삭제:', userId);
      
      // 데이터베이스에서 삭제
      await notificationService.deleteAllNotifications(userId);
      
      if (user && userId === user.employeeId) {
        setNotifications([]);
      }
      
      console.log('✅ 모든 알림 삭제 완료');
    } catch (error) {
      console.error('❌ 모든 알림 삭제 실패:', error);
    }
  };

  const cleanupOldNotifications = async () => {
    try {
      console.log('🧹 오래된 알림 정리');
      
      // 30일 이상 된 읽은 알림들 삭제
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDelete = notifications.filter(n => 
        n.isRead && new Date(n.createdAt) < thirtyDaysAgo
      );

      if (toDelete.length > 0) {
        // TODO: 데이터베이스에서 일괄 삭제 기능 추가
        for (const notification of toDelete) {
          await deleteNotification(notification.id);
        }
        
        console.log(`✅ ${toDelete.length}개의 오래된 알림 정리 완료`);
      }
    } catch (error) {
      console.error('❌ 알림 정리 실패:', error);
    }
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications.filter(n => n.recipientId === userId);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const contextValue: INotificationContext = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    cleanupOldNotifications,
    getNotificationsForUser
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): INotificationContext => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 