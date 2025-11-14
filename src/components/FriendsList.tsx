import { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FriendCard } from './FriendCard';
import { AddFriendDialog } from './AddFriendDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUser } from '../contexts/UserContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'playing';
  currentGame?: string;
  lastSeen?: string;
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchFriends = async () => {
    if (!currentUser?.accessToken) return;

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
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/friends/${friendId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== friendId));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/friends/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ friendId }),
        }
      );

      if (response.ok) {
        fetchFriends();
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">{t('friends.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-3xl">{t('friends.title')}</h2>
          <p className="text-purple-200 mt-1">{t('friends.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <UserPlus className="w-4 h-4" />
          {t('friends.addFriend')}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-800/50 border border-purple-500/20">
          <TabsTrigger value="all">{t('friends.allFriends')} ({friends.length})</TabsTrigger>
          <TabsTrigger value="online">
            {t('friends.online')} ({friends.filter(f => f.status !== 'offline').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('friends.searchPlaceholder')}
              className="pl-10 bg-slate-800/50 border-purple-500/20 text-white"
            />
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-8">
              {t('common.loading')}
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <FriendCard 
                  key={friend.id} 
                  friend={friend} 
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              {t('friends.noFriends')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="online" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center text-slate-400 py-8">
              {t('common.loading')}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends
                .filter(f => f.status !== 'offline')
                .map((friend) => (
                  <FriendCard 
                    key={friend.id} 
                    friend={friend} 
                    onRemove={handleRemoveFriend}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddFriendDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
}