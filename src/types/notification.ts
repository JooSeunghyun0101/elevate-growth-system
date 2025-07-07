
export type NotificationType = 
  | 'task_updated'
  | 'evaluation_updated' 
  | 'evaluation_started'
  | 'evaluation_completed'
  | 'hr_message'
  | 'user_assigned';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  senderId: string;
  senderName: string;
  recipientId: string;
  relatedEvaluationId?: string;
  relatedTaskId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationContext {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
}
