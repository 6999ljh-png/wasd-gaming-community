import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Gamepad2, FileText, Plus } from 'lucide-react';
import { Progress } from './ui/progress';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';
import { EditProfileDialog } from './EditProfileDialog';
import { GameLibraryDialog } from './GameLibraryDialog';

export function PersonalPage() {
  const { currentUser } = useUser();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGameLibraryOpen, setIsGameLibraryOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser) {
      fetchUserPosts();
    }
    setLoading(false);
  }, [currentUser]);

  const fetchUserPosts = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${currentUser.id}/posts`,
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

  const calculateDaysJoined = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / 86400000);
  };

  // Calculate experience progress to next level
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

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">{t('personal.loginRequired')}</p>
      </div>
    );
  }

  const expProgress = calculateExpProgress(currentUser.experience);

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Profile Card */}
      <Card className="glass-dark border-purple-500/30 p-6 shadow-xl shadow-purple-900/10 hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-purple-500 group-hover:ring-pink-500 transition-all duration-300 group-hover:scale-110">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 shadow-lg animate-pulse">
              <span className="text-white text-sm font-bold">LV.{currentUser.level}</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <h2 className="text-white text-2xl font-bold">{currentUser.name}</h2>
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
          
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300" onClick={() => setIsEditDialogOpen(true)}>
            {t('personal.editProfile')}
          </Button>
        </div>
      </Card>

      {/* Stats Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h3 className="text-white text-xl font-bold">{t('personal.statistics')}</h3>
          </div>
          <Button
            onClick={() => setIsGameLibraryOpen(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
          >
            <Gamepad2 className="w-4 h-4" />
            {t('personal.gameLibrary')}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: currentUser.stats.gamesCount, label: t('personal.gamesCount'), icon: '🎮', color: 'from-blue-500 to-cyan-500' },
            { value: currentUser.stats.postsCount, label: t('personal.postsCount'), icon: '📝', color: 'from-purple-500 to-pink-500' },
            { value: currentUser.stats.commentsCount, label: t('personal.commentsCount'), icon: '💬', color: 'from-green-500 to-emerald-500' },
            { value: currentUser.stats.likesReceived, label: t('personal.likesReceived'), icon: '❤️', color: 'from-red-500 to-rose-500' }
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

      {/* My Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-white text-xl font-bold">{t('personal.myPosts')}</h3>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : userPosts.length > 0 ? (
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
            <p className="text-slate-500 text-sm mt-1">{t('personal.createFirstPost')}</p>
          </Card>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onProfileUpdated={fetchUserPosts}
      />

      {/* Game Library Dialog */}
      <GameLibraryDialog 
        open={isGameLibraryOpen} 
        onOpenChange={setIsGameLibraryOpen}
      />
    </div>
  );
}