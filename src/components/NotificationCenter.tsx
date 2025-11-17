import { Bell, Heart, MessageCircle, UserPlus, Share2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'share' | 'mention';
  actorId: string;
  actorName: string;
  actorAvatar: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  content?: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser?.accessToken) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'friend_request':
      case 'friend_accept':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.actorName} liked your ${notification.targetType}`;
      case 'comment':
        return `${notification.actorName} commented on your ${notification.targetType}`;
      case 'friend_request':
        return `${notification.actorName} sent you a friend request`;
      case 'friend_accept':
        return `${notification.actorName} accepted your friend request`;
      case 'share':
        return `${notification.actorName} shared your ${notification.targetType}`;
      case 'mention':
        return `${notification.actorName} mentioned you in a ${notification.targetType}`;
      default:
        return 'New notification';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (!currentUser) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-slate-800/50"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-slate-900"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-slate-900 border-slate-800" 
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-400">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-purple-500/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 border-2 border-slate-800">
                      <AvatarImage src={notification.actorAvatar} />
                      <AvatarFallback>{notification.actorName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm text-slate-200 flex-1">
                          {getNotificationText(notification)}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-1" />
                        )}
                      </div>
                      {notification.content && (
                        <p className="text-xs text-slate-400 line-clamp-2 ml-6">
                          "{notification.content}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1 ml-6">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
