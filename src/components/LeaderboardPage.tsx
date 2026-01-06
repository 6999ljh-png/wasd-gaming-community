import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';

interface LeaderboardPageProps {
  onViewProfile: (userId: string) => void;
}

export function LeaderboardPage({ onViewProfile }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/leaderboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="text-center space-y-2">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-3xl md:text-4xl font-extrabold">{t('leaderboard.title')}</h1>
        <p className="text-slate-400">{t('leaderboard.subtitle')}</p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="glass-dark border border-purple-500/30 w-full h-12 p-1">
          <TabsTrigger value="global" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">{t('leaderboard.global')}</TabsTrigger>
          <TabsTrigger value="friends" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300">{t('leaderboard.friends')}</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <Card 
                key={player.id}
                className={`glass-dark border-purple-500/20 p-4 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 animate-slide-up group cursor-pointer ${ 
                  index < 3 ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onViewProfile(player.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-16 h-16 relative">
                    {index + 1 === 1 && (
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg animate-pulse" />
                    )}
                    {index + 1 === 1 && <span className="text-4xl relative z-10 animate-float">🥇</span>}
                    {index + 1 === 2 && <span className="text-4xl relative z-10 animate-float" style={{ animationDelay: '0.3s' }}>🥈</span>}
                    {index + 1 === 3 && <span className="text-4xl relative z-10 animate-float" style={{ animationDelay: '0.6s' }}>🥉</span>}
                    {index + 1 > 3 && (
                      <span className="text-white text-2xl font-bold group-hover:scale-125 transition-transform">#{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-14 h-14 ring-2 ring-purple-500/30 group-hover:ring-purple-400 group-hover:scale-110 transition-all">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>

                  {/* Player Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-bold group-hover:text-purple-300 transition-colors">{player.name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 bg-purple-500/20 rounded-full text-xs">
                        {t('common.level')} {player.level}
                      </span>
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-2xl font-bold group-hover:scale-110 transition-transform inline-block">
                      {player.score.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">{t('common.score')}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right text-sm text-slate-400 space-y-1 min-w-[100px]">
                    <p className="flex items-center justify-end gap-1">
                      <span className="text-purple-400">📝</span> {player.stats.postsCount}
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <span className="text-pink-400">❤️</span> {player.stats.likesReceived}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 glass-dark rounded-xl p-8">
              <p className="text-slate-400">{t('leaderboard.noData')}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <div className="text-center py-12 glass-dark rounded-xl p-8">
            <p className="text-slate-400">{t('leaderboard.friendsComingSoon')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}