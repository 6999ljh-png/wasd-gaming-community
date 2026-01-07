import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Search, Gamepad2, Flame, TrendingUp, Heart, Eye, ExternalLink } from 'lucide-react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GameSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameSelect?: (game: any) => void;
  trendingGames?: any[];
  trendingPosts?: any[];
}

export function GameSearchDialog({ open, onOpenChange, onGameSelect, trendingGames = [], trendingPosts = [] }: GameSearchDialogProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchGames();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchGames = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/games/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.games);
      }
    } catch (error) {
      console.error('Error searching games:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleGameClick = (game: any) => {
    onGameSelect?.(game);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-400" />
            {t('games.searchTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            {t('games.searchDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('games.searchPlaceholder')}
              className="pl-10 bg-slate-900/50 border-purple-500/20 text-white"
              autoFocus
            />
          </div>

          {searching && (
            <div className="text-center text-slate-400 py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((game) => (
                <Card
                  key={game.id}
                  className="glass-dark border-purple-500/20 p-3 hover:border-purple-500/50 transition-all cursor-pointer group"
                  onClick={() => handleGameClick(game)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={game.cover}
                      alt={game.name}
                      className="w-16 h-16 rounded object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                        {game.name}
                      </h4>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {game.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <p>{t('games.noResults')}</p>
            </div>
          )}

          {searchQuery.length < 2 && (
            <div className="mt-2">
               <Tabs defaultValue="games" className="w-full">
                 <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-700">
                   <TabsTrigger value="games" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                     <Gamepad2 className="w-4 h-4 mr-2" />
                     {t('home.trendingGames')}
                   </TabsTrigger>
                   <TabsTrigger value="posts" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                     <Flame className="w-4 h-4 mr-2" />
                     {t('home.trendingPosts')}
                   </TabsTrigger>
                 </TabsList>
                 
                 <TabsContent value="games" className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {trendingGames.length > 0 ? (
                      trendingGames.map((game, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors border border-transparent hover:border-purple-500/10 cursor-pointer group"
                          onClick={() => {
                            // If we have game selection logic for trending, we can add it here. 
                            // For now, let's just log or maybe select it if it matches the format?
                            // Assuming trending games have similar structure to search results
                            handleGameClick(game);
                          }}
                        >
                          <div className={`flex-shrink-0 w-6 text-center text-sm font-bold ${
                            index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <img 
                            src={game.cover || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=100&h=100&fit=crop'} 
                            alt={game.gameName}
                            className="w-10 h-10 rounded object-cover bg-slate-800"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{game.gameName}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-purple-400" />
                                {game.count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-pink-500" />
                                {game.totalLikes}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-8 text-sm">
                        No trending games right now.
                      </div>
                    )}
                 </TabsContent>
                 
                 <TabsContent value="posts" className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {trendingPosts.length > 0 ? (
                      trendingPosts.map((post, index) => (
                        <div 
                          key={post.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors border border-transparent hover:border-orange-500/10 cursor-pointer group"
                          onClick={() => {
                            if (post.isExternal && post.url) {
                              window.open(post.url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <div className={`flex-shrink-0 w-6 text-center text-sm font-bold ${
                            index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' : 'text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-white text-sm font-medium truncate flex-1">{post.title}</p>
                              {post.isExternal && <ExternalLink className="w-3 h-3 text-slate-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                               <span className="text-purple-400 truncate max-w-[80px]">{post.gameName}</span>
                               <span>•</span>
                               <span className="flex items-center gap-1">
                                 <Eye className="w-3 h-3" /> {post.views}
                               </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-8 text-sm">
                        No trending posts right now.
                      </div>
                    )}
                 </TabsContent>
               </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}