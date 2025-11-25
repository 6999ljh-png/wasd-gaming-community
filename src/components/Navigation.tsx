import { Gamepad2, Home, User, Trophy, MessageSquare, Users, Bookmark, Moon, Sun, Globe, Plus, Check, LogOut, ChevronDown, Swords } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { TabType } from '../App';
import { useState, useEffect } from 'react';
import { SubmitDialog } from './SubmitDialog';
import { AuthDialog } from './AuthDialog';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { NotificationCenter } from './NotificationCenter';
import { useIsMobile } from './ui/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onPostCreated?: () => void;
}

export function Navigation({ activeTab, onTabChange, onPostCreated }: NavigationProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { currentUser, setCurrentUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();

  const supabase = getSupabaseClient();

  const languages: { code: Language; label: string }[] = [
    { code: 'zh-CN', label: t('lang.zh-CN') },
    { code: 'zh-TW', label: t('lang.zh-TW') },
    { code: 'en', label: t('lang.en') }
  ];

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch user data from backend
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({ ...userData.user, accessToken: session.access_token });
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/auth/user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({ ...userData.user, accessToken: session.access_token });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <nav className="glass-dark border-b border-purple-500/20 sticky top-0 z-50 shadow-lg shadow-purple-900/10">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Brand and Submit (Desktop) */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div 
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => onTabChange('home')}
            >
              <Gamepad2 className="w-6 h-6 text-purple-400 group-hover:text-pink-400 transition-colors group-hover:rotate-12 transform duration-300" />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold tracking-wider ${isMobile ? 'hidden sm:inline' : ''}`}>WASD</span>
            </div>

            {!isMobile && (
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
                onClick={() => setIsSubmitDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('nav.submit')}
              </Button>
            )}
          </div>
          
          {/* Center - Navigation (Scrollable on Mobile) */}
          <div className={`flex items-center gap-1 ${isMobile ? 'overflow-x-auto pb-2 -mb-2 mask-linear-fade' : ''} flex-1 justify-center`}>
            <Button
              variant="ghost"
              onClick={() => onTabChange('home')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                activeTab === 'home' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
              size={isMobile ? 'icon' : 'default'}
            >
              {activeTab === 'home' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Home className={`w-4 h-4 relative z-10 ${activeTab === 'home' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {!isMobile && <span className="relative z-10">{t('nav.home')}</span>}
            </Button>

            {/* Matchmaking - Prominent on Mobile */}
            <Button
              variant="ghost"
              onClick={() => onTabChange('matchmaking')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                activeTab === 'matchmaking' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
              size={isMobile ? 'icon' : 'default'}
            >
              {activeTab === 'matchmaking' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Swords className={`w-4 h-4 relative z-10 ${activeTab === 'matchmaking' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {!isMobile && <span className="relative z-10">Match</span>}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onTabChange('forum')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                activeTab === 'forum' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
              size={isMobile ? 'icon' : 'default'}
            >
              {activeTab === 'forum' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <MessageSquare className={`w-4 h-4 relative z-10 ${activeTab === 'forum' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {!isMobile && <span className="relative z-10">{t('nav.forum')}</span>}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onTabChange('friends')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                activeTab === 'friends' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
              size={isMobile ? 'icon' : 'default'}
            >
              {activeTab === 'friends' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Users className={`w-4 h-4 relative z-10 ${activeTab === 'friends' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {!isMobile && <span className="relative z-10">{t('nav.friends')}</span>}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onTabChange('leaderboard')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                activeTab === 'leaderboard' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
              size={isMobile ? 'icon' : 'default'}
            >
              {activeTab === 'leaderboard' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Trophy className={`w-4 h-4 relative z-10 ${activeTab === 'leaderboard' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {!isMobile && <span className="relative z-10">{t('nav.leaderboard')}</span>}
            </Button>

            {!isMobile && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onTabChange('personal')}
                  className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                    activeTab === 'personal' 
                      ? 'text-white bg-purple-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  {activeTab === 'personal' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
                  )}
                  <User className={`w-4 h-4 relative z-10 ${activeTab === 'personal' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                  <span className="relative z-10">{t('nav.personal')}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => onTabChange('bookmarks')}
                  className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group flex-shrink-0 ${
                    activeTab === 'bookmarks' 
                      ? 'text-white bg-purple-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  {activeTab === 'bookmarks' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
                  )}
                  <Bookmark className={`w-4 h-4 relative z-10 ${activeTab === 'bookmarks' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                  <span className="relative z-10">{t('bookmarks.title')}</span>
                </Button>
              </>
            )}
          </div>

          {/* Right side - User & Tools */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isMobile && (
              <Button 
                variant="ghost"
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-purple-500/50"
                onClick={() => setIsSubmitDialogOpen(true)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}

            {!isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                    >
                      <Globe className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-dark border-purple-500/30 backdrop-blur-xl">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="text-slate-300 hover:text-white hover:bg-purple-500/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{lang.label}</span>
                          {language === lang.code && <Check className="w-4 h-4 ml-2 text-purple-400" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {/* Notification Center */}
            {currentUser && <NotificationCenter />}
            
            <div className={`flex items-center gap-2 ${isMobile ? '' : 'ml-4'}`}>
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                      </Avatar>
                      {!isMobile && (
                        <div className="flex flex-col items-start">
                          <span className="text-white dark:text-white light:text-slate-900 text-sm">{currentUser.name}</span>
                          <span className="text-xs text-slate-400">{t('personal.level')} {currentUser.level}</span>
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 dark:bg-slate-800 light:bg-white border-slate-700 dark:border-slate-700 light:border-slate-200">
                    {isMobile && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onTabChange('personal')}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {t('nav.personal')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTabChange('bookmarks')}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          {t('bookmarks.title')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                          onClick={toggleTheme}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          {theme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                          {theme === 'dark' ? t('theme.light') : t('theme.dark')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const nextLang = language === 'en' ? 'zh-CN' : language === 'zh-CN' ? 'zh-TW' : 'en';
                            setLanguage(nextLang);
                          }}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          {t('lang.' + language)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => onTabChange('personal')}
                      className="text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('auth.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  {!isMobile && <span className="text-slate-400 text-sm">{t('auth.clickToLogin')}</span>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <SubmitDialog 
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        onPostCreated={onPostCreated}
      />
      
      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </nav>
  );
}