import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Card } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GameSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameSelect?: (game: any) => void;
}

export function GameSearchDialog({ open, onOpenChange, onGameSelect }: GameSearchDialogProps) {
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
            <div className="text-center text-slate-400 py-8">
              <p>{t('games.searchHint')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}