import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface OnlineStatusProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function OnlineStatus({ userId, size = 'md', showTooltip = true }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [userId]);

  const checkOnlineStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${userId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    } catch (error) {
      console.error('Error checking online status:', error);
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
    return 'Long time ago';
  };

  const sizeClass = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  const statusIndicator = (
    <div className={`${sizeClass} rounded-full ${
      isOnline ? 'bg-green-500' : 'bg-slate-600'
    } border-2 border-slate-900`} />
  );

  if (!showTooltip) {
    return statusIndicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {statusIndicator}
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 border-slate-700">
          <p>{isOnline ? 'Online' : lastSeen ? `Last seen ${getTimeAgo(lastSeen)}` : 'Offline'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
