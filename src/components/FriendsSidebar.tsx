import { Users, UserPlus, Gamepad2 } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { OnlineStatus } from './OnlineStatus';
import { ScrollArea } from './ui/scroll-area';

interface FriendsSidebarProps {
  onViewProfile: (userId: string) => void;
  onAddFriend?: () => void;
}

export function FriendsSidebar({ onViewProfile, onAddFriend }: FriendsSidebarProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser?.accessToken) {
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchFriends = async () => {
    if (!currentUser?.accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/friends`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Card className="glass-dark border-purple-500/20 p-6">
        <div className="text-center space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-slate-400 text-sm">{t('friends.loginRequired')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-dark border-purple-500/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold">{t('friends.myFriends')}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddFriend}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-8 w-8 p-0"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-5xl opacity-50">👥</div>
          <p className="text-slate-400 text-sm">{t('friends.noFriends')}</p>
          <Button
            size="sm"
            onClick={onAddFriend}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            {t('friends.addFriend')}
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-16rem)] -mx-2 px-2">
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => onViewProfile(friend.id)}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer group border border-transparent hover:border-purple-500/30"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12 ring-2 ring-purple-500/30 group-hover:ring-purple-400 transition-all">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <OnlineStatus userId={friend.id} size="sm" showTooltip={false} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-purple-300 transition-colors">
                    {friend.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {friend.posts || 0}
                    </span>
                    <span>•</span>
                    <span className="text-purple-400">Lv.{friend.level || 1}</span>
                  </div>
                  {friend.currentGame && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Playing: {friend.currentGame}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {friends.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            {friends.length} {friends.length === 1 ? t('friends.friend') : t('friends.friends')}
          </p>
        </div>
      )}
    </Card>
  );
}