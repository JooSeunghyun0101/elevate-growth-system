
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, getNotificationsForUser } = useNotifications();
  const { user } = useAuth();

  if (!user) return null;

  const userNotifications = getNotificationsForUser(user.id);
  const userUnreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
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
