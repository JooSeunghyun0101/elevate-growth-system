
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, X } from 'lucide-react';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose
}) => {
  const { markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
      <Card className="shadow-lg border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">알림</CardTitle>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                모두 읽음
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
          <ScrollArea className="h-80">
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
