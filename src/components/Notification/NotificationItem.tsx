
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bell, CheckCircle, AlertCircle, MessageSquare, Edit, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'score_changed':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'task_content_changed':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'feedback_added':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'evaluation_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'evaluation_updated':
      case 'task_updated':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const shouldTruncate = notification.message.length > 100;
  const displayMessage = shouldTruncate && !isExpanded 
    ? notification.message.substring(0, 100) + '...' 
    : notification.message;

  return (
    <div className={`p-4 border rounded-lg ${getPriorityColor()} ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{notification.title}</h4>
              {!notification.isRead && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">새로운</Badge>
              )}
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="whitespace-pre-wrap break-words">
                {displayMessage}
              </div>
              {shouldTruncate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-auto p-0 text-blue-600 hover:text-blue-800 text-xs"
                >
                  {isExpanded ? '접기' : '더보기'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{notification.senderName}</span>
              <span>•</span>
              <span>{format(new Date(notification.createdAt), 'MM/dd HH:mm')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs px-2 py-1 h-auto"
            >
              읽음
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-800"
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
