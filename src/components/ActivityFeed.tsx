import { Heart, MessageCircle, Share2, Trophy, UserPlus } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { OnlineStatus } from './OnlineStatus';

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'post' | 'like' | 'comment' | 'friend' | 'achievement';
  action: string;
  targetTitle?: string;
  targetId?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface ActivityFeedProps {
  userId?: string; // If provided, show only this user's activity
  onViewPost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function ActivityFeed({ userId, onViewPost, onViewProfile }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const url = userId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${userId}/activities`
        : `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/activities/feed`;

      const response = await fetch(url, {
        headers: {
          'Authorization': currentUser?.accessToken 
            ? `Bearer ${currentUser.accessToken}`
            : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'friend':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Share2 className="w-5 h-5 text-slate-500" />;
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 glass-dark border-slate-800 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="glass-dark border-slate-800 p-12 text-center">
        <div className="text-6xl mb-4 opacity-50">📊</div>
        <p className="text-slate-400">No recent activity</p>
        <p className="text-sm text-slate-500 mt-2">
          {userId ? 'This user hasn\'t been active recently' : 'Follow friends to see their activity here'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card
          key={activity.id}
          className="glass-dark border-slate-800 p-4 hover:border-purple-500/30 transition-all"
        >
          <div className="flex gap-3">
            <div className="relative">
              <Avatar 
                className="w-12 h-12 border-2 border-slate-800 cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => onViewProfile?.(activity.userId)}
              >
                <AvatarImage src={activity.userAvatar} />
                <AvatarFallback>{activity.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <OnlineStatus userId={activity.userId} size="sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-slate-200">
                    <button
                      onClick={() => onViewProfile?.(activity.userId)}
                      className="font-semibold hover:text-purple-400 transition-colors"
                    >
                      {activity.userName}
                    </button>
                    {' '}
                    <span className="text-slate-400">{activity.action}</span>
                    {activity.targetTitle && (
                      <>
                        {' '}
                        <button
                          onClick={() => activity.targetId && onViewPost?.(activity.targetId)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          "{activity.targetTitle}"
                        </button>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>

              {(activity.likes > 0 || activity.comments > 0) && (
                <div className="flex items-center gap-4 mt-3 ml-7 text-xs text-slate-500">
                  {activity.likes > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{activity.likes}</span>
                    </div>
                  )}
                  {activity.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{activity.comments}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
