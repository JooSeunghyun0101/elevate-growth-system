
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, X, Trash2 } from 'lucide-react';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContextDB';
import { useAuth } from '@/contexts/AuthContext';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose
}) => {
  const { markAllAsRead, markAsRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const { user } = useAuth();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteAll = () => {
    if (user) {
      deleteAllNotifications(user.employeeId);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-[28rem] lg:w-[32rem] max-w-[calc(100vw-2rem)] z-50">
      <Card className="shadow-lg border bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm sm:text-base font-semibold">알림</CardTitle>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">모두삭제</span>
                <span className="inline sm:hidden">삭제</span>
              </Button>
            )}
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs px-2 py-1 h-auto"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">모두 읽음</span>
                <span className="inline sm:hidden">읽음</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                새로운 알림이 없습니다
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDropdown;
