import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { FileText, ArrowLeft, UserPlus } from 'lucide-react';
import { Progress } from './ui/progress';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
}

export function UserProfilePage({ userId, onBack }: UserProfilePageProps) {
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { currentUser } = useUser();

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${userId}/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const formatTimestamp = (isoDate: string) => {
    const now = new Date();
    const date = new Date(isoDate);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    return `${days} ${t('common.daysAgo')}`;
  };

  const calculateExpProgress = (experience: number) => {
    const currentLevel = Math.floor(Math.sqrt(experience / 100));
    const currentLevelExp = currentLevel * currentLevel * 100;
    const nextLevelExp = (currentLevel + 1) * (currentLevel + 1) * 100;
    const expInLevel = experience - currentLevelExp;
    const expNeeded = nextLevelExp - currentLevelExp;
    return {
      currentExp: expInLevel,
      maxExp: expNeeded,
      percentage: Math.floor((expInLevel / expNeeded) * 100)
    };
  };

  const handleAddFriend = async () => {
    if (!currentUser?.accessToken) {
      alert(t('friends.loginRequired'));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/friends/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ friendId: userId }),
        }
      );

      if (response.ok) {
        alert(t('friends.addSuccess'));
      } else {
        alert(t('friends.addError'));
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert(t('friends.addError'));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">{t('personal.userNotFound')}</p>
        <Button onClick={onBack} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const expProgress = calculateExpProgress(userData.experience);
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Back Button */}
      <Button 
        onClick={onBack}
        variant="ghost"
        className="gap-2 text-slate-400 hover:text-white hover:bg-purple-500/10"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </Button>

      {/* Profile Card */}
      <Card className="glass-dark border-purple-500/30 p-6 shadow-xl shadow-purple-900/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-purple-500 group-hover:ring-pink-500 transition-all duration-300 group-hover:scale-110">
              <AvatarImage src={userData.avatar} />
              <AvatarFallback>{userData.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 shadow-lg animate-pulse">
              <span className="text-white text-sm font-bold">LV.{userData.level}</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <h2 className="text-white text-2xl font-bold">{userData.name}</h2>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t('personal.experience')}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">
                  {expProgress.currentExp}/{expProgress.maxExp}
                </span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                  style={{ width: `${expProgress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
          
          {!isOwnProfile && (
            <Button 
              onClick={handleAddFriend}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t('friends.addFriend')}
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h3 className="text-white text-xl font-bold">{t('personal.statistics')}</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: userData.stats.gamesCount, label: t('personal.gamesCount'), icon: '🎮', color: 'from-blue-500 to-cyan-500' },
            { value: userData.stats.postsCount, label: t('personal.postsCount'), icon: '📝', color: 'from-purple-500 to-pink-500' },
            { value: userData.stats.commentsCount, label: t('personal.commentsCount'), icon: '💬', color: 'from-green-500 to-emerald-500' },
            { value: userData.stats.likesReceived, label: t('personal.likesReceived'), icon: '❤️', color: 'from-red-500 to-rose-500' }
          ].map((stat, index) => (
            <Card 
              key={index}
              className="glass-dark border-purple-500/20 p-6 text-center hover:scale-105 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
              <p className={`text-transparent bg-clip-text bg-gradient-to-r ${stat.color} text-3xl font-bold group-hover:scale-110 transition-transform duration-300`}>
                {stat.value}
              </p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-white text-xl font-bold">{t('personal.posts')}</h3>
          </div>
        </div>

        {userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post, index) => (
              <Card 
                key={post.id} 
                className="glass-dark border-purple-500/20 p-4 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-slide-up relative overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-pink-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white text-lg font-bold group-hover:text-purple-300 transition-colors">{post.title || post.gameName}</h4>
                      <p className="text-slate-400 text-sm line-clamp-2 mt-1">{post.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="px-2 py-1 bg-purple-500/20 rounded-full text-purple-400">{post.gameName}</span>
                      <span className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                        <span>👍</span> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                        <span>💬</span> {post.comments}
                      </span>
                    </div>
                    <span className="text-slate-500 text-sm">{formatTimestamp(post.createdAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-dark border-purple-500/20 p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="text-slate-400">{t('personal.noPosts')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
