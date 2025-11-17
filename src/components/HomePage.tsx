import { Search, Gamepad2, Flame, ChevronDown, ChevronUp, Eye, Heart, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';
import { GameSearchDialog } from './GameSearchDialog';
import { ExternalLink } from 'lucide-react';
import { FriendsSidebar } from './FriendsSidebar';
import { AddFriendDialog } from './AddFriendDialog';

interface HomePageProps {
  onViewProfile: (userId: string) => void;
  onViewPost?: (postId: string) => void;
}

export function HomePage({ onViewProfile, onViewPost }: HomePageProps) {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [trendingGames, setTrendingGames] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchTopPlayers();
    fetchTrendingGames();
    fetchTrendingPosts();
  }, []);

  const fetchTopPlayers = async () => {
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
        const top3 = data.leaderboard.slice(0, 3).map((player: any, index: number) => ({
          id: player.id,
          name: player.name,
          avatar: player.avatar,
          rank: index + 1,
          score: player.score,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
        }));
        setTopPlayers(top3);
      }
    } catch (error) {
      console.error('Error fetching top players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingGames = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/games/trending?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrendingGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching trending games:', error);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/trending?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrendingPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const displayedGames = showAllGames ? trendingGames : trendingGames.slice(0, 5);
  const displayedPosts = showAllPosts ? trendingPosts : trendingPosts.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 animate-gradient p-12 md:p-20 overflow-hidden shadow-2xl">
        <div className="relative z-10 text-center space-y-6 animate-scale-in">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg">
            {t('home.title')}
          </h1>
          <p className="text-white/90 text-lg md:text-xl">
            {t('home.subtitle')}
          </p>
          
          <div className="flex justify-center pt-4">
            <div className="relative max-w-md w-full group cursor-pointer" onClick={() => setIsSearchDialogOpen(true)}>
              <Input
                placeholder={t('home.searchPlaceholder')}
                className="pl-12 pr-4 py-6 rounded-full bg-white/95 backdrop-blur-sm text-slate-900 border-0 text-center shadow-xl focus:shadow-2xl focus:scale-105 transition-all duration-300 cursor-pointer"
                readOnly
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
        
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-300/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Players Section */}
      <div className="space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-glow" />
            <h2 className="text-white text-2xl md:text-3xl font-bold">{t('home.topPlayersTitle')}</h2>
          </div>
          <p className="text-slate-400">{t('home.topPlayersSubtitle')}</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : topPlayers.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {topPlayers.map((player, index) => (
              <Card 
                key={player.id}
                className={`glass-dark border-purple-500/30 p-6 relative overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group ${
                  index === 0 ? 'md:scale-105 ring-2 ring-purple-500/50 animate-glow' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 text-3xl animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                  {player.badge}
                </div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      <Avatar className="w-20 h-20 ring-4 ring-purple-500/50 group-hover:ring-purple-400 transition-all">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-white text-xl font-bold">{player.name}</h3>
                      <p className="text-slate-400 text-sm">{t('common.rank')} #{player.rank}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-500/20">
                    <p className="text-slate-400 text-sm">{t('common.totalScore')}</p>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-2xl font-bold">
                      {player.score.toLocaleString()}
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
                    size="sm"
                    onClick={() => onViewProfile(player.id)}
                  >
                    {t('common.viewProfile')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8 glass-dark rounded-xl p-8">
            {t('home.noPlayers')}
          </div>
        )}
      </div>

      {/* Trending Sections Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Trending Games */}
        <Card className="glass-dark border-purple-500/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h3 className="text-white text-xl font-bold">{t('home.trendingGames')}</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            {displayedGames.length > 0 ? displayedGames.map((game, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-purple-500/10 hover:border-purple-500/30"
              >
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    #{index + 1}
                  </span>
                </div>
                <Gamepad2 className="w-10 h-10 text-purple-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{game.gameName}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {game.count} {t('home.posts')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {game.totalLikes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {game.totalViews}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-400 py-8">
                {t('home.noGames')}
              </div>
            )}
          </div>

          {trendingGames.length > 5 && (
            <Button
              variant="outline"
              className="w-full border-purple-500/20 hover:bg-purple-500/10 text-purple-400"
              onClick={() => setShowAllGames(!showAllGames)}
            >
              {showAllGames ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  {t('home.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  {t('home.showMore')}
                </>
              )}
            </Button>
          )}
        </Card>

        {/* Trending Posts */}
        <Card className="glass-dark border-purple-500/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <h3 className="text-white text-xl font-bold">{t('home.trendingPosts')}</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            {displayedPosts.length > 0 ? displayedPosts.map((post, index) => (
              <div 
                key={post.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-purple-500/10 hover:border-purple-500/30 cursor-pointer group"
                onClick={() => {
                  if (post.isExternal && post.url) {
                    // Open external link in new tab
                    window.open(post.url, '_blank', 'noopener,noreferrer');
                  } else if (onViewPost) {
                    // Navigate to internal post
                    onViewPost(post.id);
                  }
                }}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    #{index + 1}
                  </span>
                </div>
                <Flame className="w-10 h-10 text-orange-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white truncate flex-1">{post.title}</p>
                    {post.isExternal && (
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes || 0}
                    </span>
                    <span className="text-purple-400">{post.gameName}</span>
                    {post.isExternal && post.source && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        {post.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-400 py-8">
                {t('home.noPosts')}
              </div>
            )}
          </div>

          {trendingPosts.length > 5 && (
            <Button
              variant="outline"
              className="w-full border-purple-500/20 hover:bg-purple-500/10 text-purple-400"
              onClick={() => setShowAllPosts(!showAllPosts)}
            >
              {showAllPosts ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  {t('home.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  {t('home.showMore')}
                </>
              )}
            </Button>
          )}
        </Card>
      </div>

      {/* Game Search Dialog */}
      <GameSearchDialog 
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onGameSelect={(game) => console.log('Selected game:', game)}
      />

      {/* Add Friend Dialog */}
      <AddFriendDialog 
        open={isAddFriendDialogOpen}
        onOpenChange={setIsAddFriendDialogOpen}
      />
    </div>
  );
}