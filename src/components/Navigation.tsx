import { Gamepad2, Home, User, Trophy, MessageSquare, Users, Moon, Sun, Globe, Plus, Check, LogOut, ChevronDown } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          {/* Left side - Submit button and brand */}
          <div className="flex items-center gap-6">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
              onClick={() => setIsSubmitDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {t('nav.submit')}
            </Button>
            <div className="flex items-center gap-2 group cursor-pointer">
              <Gamepad2 className="w-6 h-6 text-purple-400 group-hover:text-pink-400 transition-colors group-hover:rotate-12 transform duration-300" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-xl font-bold tracking-wider">WASD</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                onClick={toggleTheme}
                title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
              >
                {theme === 'dark' ? 
                  <Moon className="w-5 h-5 hover:rotate-12 transition-transform" /> : 
                  <Sun className="w-5 h-5 hover:rotate-90 transition-transform" />
                }
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 rounded-full"
                  >
                    <Globe className="w-5 h-5 hover:rotate-12 transition-transform" />
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
            </div>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => onTabChange('home')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group ${
                activeTab === 'home' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              {activeTab === 'home' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Home className={`w-4 h-4 relative z-10 ${activeTab === 'home' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="relative z-10">{t('nav.home')}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onTabChange('personal')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group ${
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
              onClick={() => onTabChange('leaderboard')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group ${
                activeTab === 'leaderboard' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              {activeTab === 'leaderboard' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Trophy className={`w-4 h-4 relative z-10 ${activeTab === 'leaderboard' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="relative z-10">{t('nav.leaderboard')}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onTabChange('forum')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group ${
                activeTab === 'forum' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              {activeTab === 'forum' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <MessageSquare className={`w-4 h-4 relative z-10 ${activeTab === 'forum' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="relative z-10">{t('nav.forum')}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onTabChange('friends')}
              className={`gap-2 transition-all duration-300 rounded-xl relative overflow-hidden group ${
                activeTab === 'friends' 
                  ? 'text-white bg-purple-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              {activeTab === 'friends' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-gradient" />
              )}
              <Users className={`w-4 h-4 relative z-10 ${activeTab === 'friends' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className="relative z-10">{t('nav.friends')}</span>
            </Button>
            
            <div className="ml-4 flex items-center gap-2">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-white dark:text-white light:text-slate-900 text-sm">{currentUser.name}</span>
                        <span className="text-xs text-slate-400">{t('personal.level')} {currentUser.level}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 dark:bg-slate-800 light:bg-white border-slate-700 dark:border-slate-700 light:border-slate-200">
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
                  <span className="text-slate-400 text-sm">{t('auth.clickToLogin')}</span>
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