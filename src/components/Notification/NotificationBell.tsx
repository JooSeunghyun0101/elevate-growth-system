
import React, { useState } from 'react';
// import { Bell } from 'lucide-react'; // Replaced with custom icon
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContextDB';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { notificationService } from '@/lib/database';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, getNotificationsForUser } = useNotifications();
  const { user } = useAuth();

  if (!user) return null;

  const userNotifications = getNotificationsForUser(user.employeeId);
  const userUnreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleBellClick = () => {
    // 자동 새로고침 제거 - 저장/완료 버튼 클릭 시에만 새로고침
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="relative"
      >
        <img src="/느낌표_orange.png" alt="Notification" className="h-7 w-7" />
        {userUnreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {userUnreadCount > 99 ? '99+' : userUnreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <NotificationDropdown 
          notifications={userNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
