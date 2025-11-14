import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Gamepad2, Trash2, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { projectId } from '../utils/supabase/info';
import { Badge } from './ui/badge';

interface GameLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Game {
  id: string;
  gameId: string;
  gameName: string;
  cover: string;
  status: string;
  playTime: number;
  achievement: number;
}

export function GameLibraryDialog({ open, onOpenChange }: GameLibraryDialogProps) {
  const { t } = useLanguage();
  const { currentUser } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (open && currentUser) {
      fetchUserGames();
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchGames();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchUserGames = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${currentUser.id}/games`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGames = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/games/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser?.accessToken}`,
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

  const addGame = async (game: any) => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${currentUser.id}/games`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameId: game.id,
            gameName: game.name,
            cover: game.cover,
            status: 'playing',
            playTime: 0,
            achievement: 0,
          }),
        }
      );

      if (response.ok) {
        setSearchQuery('');
        setSearchResults([]);
        fetchUserGames();
      }
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const removeGame = async (gameId: string) => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${currentUser.id}/games/${gameId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        fetchUserGames();
      }
    } catch (error) {
      console.error('Error removing game:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'wishlist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'dropped': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'playing': return t('games.playing');
      case 'completed': return t('games.completed');
      case 'wishlist': return t('games.wishlist');
      case 'dropped': return t('games.dropped');
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            {t('games.library')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            {t('games.libraryDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('games.searchPlaceholder')}
            className="pl-10 bg-slate-900/50 border-purple-500/20 text-white"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-purple-500/20 rounded-lg p-3 bg-slate-900/50 max-h-48 overflow-y-auto">
            <p className="text-sm text-slate-400 mb-2">{t('games.searchResults')}</p>
            <div className="space-y-2">
              {searchResults.map((game) => (
                <div 
                  key={game.id} 
                  className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer group"
                  onClick={() => addGame(game)}
                >
                  <img 
                    src={game.cover} 
                    alt={game.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white">{game.name}</p>
                    <div className="flex gap-1 mt-1">
                      {game.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User's Games */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-slate-400 py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.map((game) => (
                <Card 
                  key={game.id} 
                  className="glass-dark border-purple-500/20 p-3 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex gap-3">
                    <img 
                      src={game.cover} 
                      alt={game.gameName}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{game.gameName}</h4>
                      <Badge className={`mt-1 text-xs ${getStatusColor(game.status)}`}>
                        {getStatusLabel(game.status)}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                        {game.playTime > 0 && (
                          <p>⏱️ {game.playTime}h</p>
                        )}
                        {game.achievement > 0 && (
                          <p>🏆 {game.achievement}%</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGame(game.gameId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t('games.noGames')}</p>
              <p className="text-sm mt-2">{t('games.searchToAdd')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}