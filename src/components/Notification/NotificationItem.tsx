
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  FileText, 
  MessageCircle, 
  Play, 
  CheckCircle, 
  UserPlus,
  AlertCircle 
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification 
}) => {
  const { markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_updated':
        return <FileText className="h-4 w-4" />;
      case 'evaluation_updated':
        return <AlertCircle className="h-4 w-4" />;
      case 'evaluation_started':
        return <Play className="h-4 w-4" />;
      case 'evaluation_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'hr_message':
        return <MessageCircle className="h-4 w-4" />;
      case 'user_assigned':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium truncate">
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>보낸이: {notification.senderName}</span>
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ko
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
