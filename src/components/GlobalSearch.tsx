import { useState, useEffect, useRef } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search, User, FileText, Gamepad2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';

interface GlobalSearchProps {
  accessToken: string;
  onSelectUser?: (userId: string) => void;
  onSelectPost?: (postId: string) => void;
  onSelectGame?: (gameId: string) => void;
}

export function GlobalSearch({ accessToken, onSelectUser, onSelectPost, onSelectGame }: GlobalSearchProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ users: [], posts: [], games: [] });
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ users: [], posts: [], games: [] });
      return;
    }

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async () => {
    if (query.length < 2) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery('');
    setResults({ users: [], posts: [], games: [] });

    if (type === 'user' && onSelectUser) {
      onSelectUser(id);
    } else if (type === 'post' && onSelectPost) {
      onSelectPost(id);
    } else if (type === 'game' && onSelectGame) {
      onSelectGame(id);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">{t('search.placeholder') || 'Search...'}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t('search.typeToSearch') || 'Type to search users, posts, and games...'}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('search.typeAtLeast') || 'Type at least 2 characters to search'}
            </div>
          ) : (
            <>
              {results.users.length === 0 && results.posts.length === 0 && results.games.length === 0 ? (
                <CommandEmpty>{t('search.noResults') || 'No results found'}</CommandEmpty>
              ) : (
                <>
                  {results.users.length > 0 && (
                    <CommandGroup heading={t('search.users') || 'Users'}>
                      {results.users.map((user: any) => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => handleSelect('user', user.id)}
                          className="cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <Avatar className="mr-2 h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1">{user.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            Lv {user.level}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {results.posts.length > 0 && (
                    <CommandGroup heading={t('search.posts') || 'Posts'}>
                      {results.posts.map((post: any) => (
                        <CommandItem
                          key={post.id}
                          value={post.id}
                          onSelect={() => handleSelect('post', post.id)}
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{post.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {post.gameName} • {post.author?.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{post.likes} 👍</span>
                            <span>{post.comments} 💬</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {results.games.length > 0 && (
                    <CommandGroup heading={t('search.games') || 'Games'}>
                      {results.games.map((game: any) => (
                        <CommandItem
                          key={game.id}
                          value={game.id}
                          onSelect={() => handleSelect('game', game.id)}
                          className="cursor-pointer"
                        >
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          <div className="flex-1">
                            <div>{game.name}</div>
                            {game.genre && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">{game.genre}</div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
