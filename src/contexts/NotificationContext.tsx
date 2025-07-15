
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContext as INotificationContext } from '@/types/notification';

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
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
        // 기존 알림을 업데이트하여 통합
        setNotifications(prev => prev.map(n => {
          if (n.id === existingNotification.id) {
            const existingChanges = n.message.includes('•') 
              ? n.message.split('\n').filter(line => line.startsWith('•'))
              : [];
            
            const newChanges = notificationData.message.includes('•')
              ? notificationData.message.split('\n').filter(line => line.startsWith('•'))
              : [notificationData.message];

            const allChanges = [...existingChanges, ...newChanges];
            const uniqueChanges = [...new Set(allChanges)];

            return {
              ...n,
              message: `${notificationData.title}\n\n${uniqueChanges.map(change => `• ${change.replace('• ', '')}`).join('\n')}`,
              lastModified: new Date().toISOString()
            };
          }
          return n;
        }));
        return;
      }
    }

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev => 
      prev.map(notification => 
        notification.isRead 
          ? notification 
          : { ...notification, isRead: true, readAt: now }
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const deleteAllNotifications = (userId: string) => {
    setNotifications(prev => prev.filter(n => n.recipientId !== userId));
  };

  const cleanupOldNotifications = () => {
    // 기존의 분리된 알림들을 정리하고 task_summary로 통합
    setNotifications(prev => {
      const taskSummaryMap = new Map<string, Notification>();
      const otherNotifications: Notification[] = [];

      prev.forEach(notification => {
        if (notification.relatedTaskId && 
            (notification.type === 'score_changed' || 
             notification.type === 'task_content_changed' || 
             notification.type === 'feedback_added')) {
          
          const key = `${notification.recipientId}-${notification.relatedTaskId}`;
          
          if (!taskSummaryMap.has(key)) {
            // 새로운 task_summary 알림 생성
            const taskSummary: Notification = {
              ...notification,
              id: `summary-${Date.now()}-${notification.relatedTaskId}`,
              type: 'task_summary',
              title: `"${notification.title.split('"')[1] || '과업'}" 과업 수정`,
              message: `• ${notification.message}`,
              createdAt: notification.createdAt,
              isRead: notification.isRead,
              readAt: notification.readAt
            };
            taskSummaryMap.set(key, taskSummary);
          } else {
            // 기존 task_summary에 메시지 추가
            const existing = taskSummaryMap.get(key)!;
            const newMessage = notification.message.startsWith('•') 
              ? notification.message 
              : `• ${notification.message}`;
            
            existing.message = existing.message + '\n' + newMessage;
            existing.lastModified = new Date().toISOString();
          }
        } else {
          otherNotifications.push(notification);
        }
      });

      return [...Array.from(taskSummaryMap.values()), ...otherNotifications];
    });
  };

  const getNotificationsForUser = (userId: string) => {
    return notifications.filter(n => n.recipientId === userId);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: INotificationContext = {
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
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
