import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog@1.1.6';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Mic, MicOff, X, MessageCircle, UserPlus, Zap, Loader2, Wifi, Swords, Coffee, Monitor, CheckCircle2, Search, Clock, Users as UsersIcon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { Input } from './ui/input';
import { MatchingForumFeed } from './MatchingForumFeed';
import { updateGamePreferences, GAME_ID_MAPPING } from '../utils/updateGamePreferences';
import { VirtualLobby } from './VirtualLobby';

interface RandomMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GAMES = [
  { id: 'lol', name: 'League of Legends', color: 'text-yellow-500' },
  { id: 'valorant', name: 'Valorant', color: 'text-red-500' },
  { id: 'apex', name: 'Apex Legends', color: 'text-orange-500' },
  { id: 'ow2', name: 'Overwatch 2', color: 'text-orange-400' },
  { id: 'genshin', name: 'Genshin Impact', color: 'text-purple-400' },
  { id: 'minecraft', name: 'Minecraft', color: 'text-green-500' },
  { id: 'cs2', name: 'CS2', color: 'text-yellow-600' },
  { id: 'dota2', name: 'Dota 2', color: 'text-red-600' },
];

const MODES = [
  { id: 'casual', name: 'Casual / Chill', icon: Coffee, desc: 'No pressure, just vibes' },
  { id: 'competitive', name: 'Competitive', icon: Swords, desc: 'Tryhard mode ON' },
];

export function RandomMatchDialog({ open, onOpenChange }: RandomMatchDialogProps) {
  const { currentUser, setCurrentUser } = useUser();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [matchData, setMatchData] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [gameSearch, setGameSearch] = useState('');
  
  // Selection State with localStorage persistence
  const [selectedGame, setSelectedGame] = useState<string>(() => {
    return localStorage.getItem('randomMatch_lastGame') || 'lol';
  });
  const [selectedMode, setSelectedMode] = useState<string>(() => {
    return localStorage.getItem('randomMatch_lastMode') || 'casual';
  });
  const [micPreference, setMicPreference] = useState(() => {
    const saved = localStorage.getItem('randomMatch_micPref');
    return saved !== null ? saved === 'true' : true;
  });

  const pollIntervalRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('randomMatch_lastGame', selectedGame);
  }, [selectedGame]);

  useEffect(() => {
    localStorage.setItem('randomMatch_lastMode', selectedMode);
  }, [selectedMode]);

  useEffect(() => {
    localStorage.setItem('randomMatch_micPref', String(micPreference));
  }, [micPreference]);

  // Filtered games based on search
  const filteredGames = useMemo(() => {
    if (!gameSearch) return GAMES;
    return GAMES.filter(game => 
      game.name.toLowerCase().includes(gameSearch.toLowerCase())
    );
  }, [gameSearch]);

  // Estimate wait time based on timer
  const estimatedWaitTime = useMemo(() => {
    if (timer < 15) return 'Less than 30s';
    if (timer < 30) return '~30-60s';
    if (timer < 60) return '~1-2 min';
    return '~2+ min';
  }, [timer]);

  // Random online count effect
  useEffect(() => {
    setOnlineCount(Math.floor(Math.random() * 500) + 1200);
    setQueueCount(Math.floor(Math.random() * 30) + 10);
  }, [open]);

  // Clean up on close
  useEffect(() => {
    if (!open) {
      handleCancel();
      setGameSearch('');
    }
  }, [open]);

  // Polling logic with AbortController
  useEffect(() => {
    if (status === 'searching') {
      abortControllerRef.current = new AbortController();
      
      const poll = async () => {
        try {
          if (!currentUser?.accessToken) return;

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/status`, {
            headers: {
              'Authorization': `Bearer ${currentUser.accessToken}`
            },
            signal: abortControllerRef.current?.signal
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'found' && data.opponent) {
              setMatchData(data.opponent);
              setStatus('found');
              // Play success sound (optional)
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ8aYK/q7adRFQlEnN/yuWsfBzaO1vLRgTQGIHTJ8d2UQAsUWrPn7ahXEwpDmN/yuGseBy+F0PPWhTEHKH7P8duVPw8SX7bm7q1aFg1Ep+Xxs2scBzSM1fLMfi8HNYvT8sCZVxgLSJ7j8K9kGQc4iNL0t3MgBDaO1fLFgiQFNZDW8rCYUhgKTKPl8a5kGAg3itDzuHQdBjiP1vPAmiUFMYrS8rdyIgU1jtTzt3IeBC2F0PPEeiwGLHfM8dCPOwoXZLfq7KdYFglEn9/yuWwdBTWK0vK9cyEGMIjS8711HwU0j9Xy');
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (e) {}
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Polling error:', error);
          }
        }
      };

      // Poll every 2 seconds
      pollIntervalRef.current = setInterval(poll, 2000);
      
      // Timer
      const timerInterval = setInterval(() => setTimer(t => t + 1), 1000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        clearInterval(timerInterval);
        abortControllerRef.current?.abort();
      };
    }
  }, [status, currentUser]);

  const handleStart = useCallback(async () => {
    if (!currentUser?.accessToken || status === 'searching') return;
    
    setStatus('searching');
    setTimer(0);
    
    // Auto-update game preferences based on the game they're matching for
    const mappedGameId = GAME_ID_MAPPING[selectedGame];
    if (mappedGameId && currentUser.accessToken && currentUser.id) {
      const updatedPrefs = await updateGamePreferences(
        mappedGameId,
        currentUser.accessToken,
        currentUser.id
      );
      
      if (updatedPrefs && setCurrentUser) {
        // Update the user context with new preferences
        setCurrentUser({
          ...currentUser,
          gamePreferences: updatedPrefs
        });
      }
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game: selectedGame,
          mode: selectedMode,
          mic: micPreference
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to join queue');
      }
      
      const data = await response.json();
      if (data.status === 'found') {
        setMatchData(data.opponent);
        setStatus('found');
      }
    } catch (error) {
      console.error('Join error:', error);
      setStatus('idle');
    }
  }, [currentUser, setCurrentUser, status, selectedGame, selectedMode, micPreference]);

  const handleCancel = useCallback(async () => {
    if (status === 'searching' && currentUser?.accessToken) {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/leave`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`
          }
        });
      } catch (e) {
        console.error('Leave error:', e);
      }
    }
    abortControllerRef.current?.abort();
    setStatus('idle');
    setMatchData(null);
    setTimer(0);
  }, [status, currentUser]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentUser) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content 
          className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full h-full md:max-w-[90vw] md:max-h-[90vh] md:h-auto md:w-auto p-0 border-0 md:border md:border-purple-500/30 bg-slate-950 md:rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-[0_0_100px_rgba(88,28,135,0.4)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
        >
        
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(76, 29, 149, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 29, 149, 0.2) 1px, transparent 1px)', 
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
             }} 
        />
        
        {/* Close Button */}
        <button 
          onClick={() => { 
            handleCancel(); 
            onOpenChange(false); 
          }}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-md rounded-full text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 hover:border-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="z-10 w-full max-w-7xl px-4 md:px-8 lg:px-12 py-8 md:py-12 lg:py-16"
            >
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-stretch">
                {/* Left Side: Title & Description */}
                <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6 text-center lg:text-left min-w-0">
                  <div className="space-y-3 md:space-y-4">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto lg:mx-0 mb-2 md:mb-4">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                      <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        <Zap className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {t('match.randomDuo') || 'Random Duo'}
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-md mx-auto lg:mx-0">
                      {t('match.desc') || 'Select your mission parameters and find the perfect partner for your next game.'}
                    </p>
                  </div>
                </div>

                {/* Right Side: Configuration Panel */}
                <div className="flex-1 w-full max-w-2xl lg:max-w-md mx-auto lg:mx-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                  
                  {/* 1. Select Game */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Mission Target (Game)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] md:max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                      {filteredGames.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => setSelectedGame(game.id)}
                          className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all text-left group relative overflow-hidden ${
                            selectedGame === game.id 
                              ? 'bg-slate-800 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                           {selectedGame === game.id && (
                             <motion.div layoutId="activeGame" className="absolute inset-0 bg-purple-500/10" />
                           )}
                           <span className={`text-sm md:text-base font-bold relative z-10 ${selectedGame === game.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                             {game.name}
                           </span>
                        </button>
                      ))}
                    </div>
                    <Input 
                      type="text" 
                      placeholder="Search games..." 
                      value={gameSearch} 
                      onChange={(e) => setGameSearch(e.target.value)}
                      className="mt-2 h-8 md:h-10 px-3 md:px-4 bg-slate-900/50 rounded-lg border border-slate-800 text-xs md:text-sm text-slate-400"
                    />
                  </div>

                  {/* 2. Select Mode */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Engagement Protocol</label>
                    <div className="flex gap-2">
                      {MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={`flex-1 p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all flex flex-col items-center gap-1 ${
                            selectedMode === mode.id
                              ? 'bg-slate-800 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <mode.icon className={`w-4 h-4 md:w-5 md:h-5 ${selectedMode === mode.id ? 'text-purple-400' : ''}`} />
                          <span className="font-bold text-xs md:text-sm">{mode.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Mic & Start */}
                  <div className="mt-auto space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between bg-slate-950/50 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`p-1.5 md:p-2 rounded-lg ${micPreference ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                          {micPreference ? <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                        </div>
                        <span className="text-xs md:text-sm font-bold text-slate-300">Voice Comms</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMicPreference(!micPreference)}
                        className={`text-xs md:text-sm ${micPreference ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {micPreference ? 'ENABLED' : 'DISABLED'}
                      </Button>
                    </div>

                    <Button 
                      onClick={handleStart}
                      className="w-full h-12 md:h-16 text-lg md:text-xl font-black italic bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] rounded-lg md:rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-t border-white/20"
                    >
                      <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 fill-current" />
                      {t('match.start') || 'INITIATE SCAN'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'searching' && (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 w-full h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8"
            >
              {/* Left Side: Radar Scanner (Sticky) */}
              <div className="lg:w-2/5 flex-shrink-0">
                <div className="lg:sticky lg:top-4 flex flex-col items-center justify-start space-y-4">
                  {/* Compact Radar UI */}
                  <div className="relative w-[240px] h-[240px] md:w-64 md:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                    {/* Rings */}
                    <div className="absolute inset-0 rounded-full border border-purple-500/20" />
                    <div className="absolute inset-[20%] rounded-full border border-purple-500/20" />
                    <div className="absolute inset-[40%] rounded-full border border-purple-500/20" />
                    
                    {/* Rotating Scanner Line */}
                    <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] origin-center">
                      <div className="w-1/2 h-full bg-gradient-to-l from-transparent via-purple-500/10 to-transparent blur-sm transform rotate-90 origin-bottom-right opacity-50" style={{ clipPath: 'polygon(100% 50%, 0 50%, 100% 0)' }} />
                      <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-b from-purple-400 to-transparent shadow-[0_0_10px_#a855f7]" />
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono text-purple-300 whitespace-nowrap">
                      {GAMES.find(g => g.id === selectedGame)?.name} • {selectedMode === 'competitive' ? 'Ranked' : 'Casual'}
                    </div>

                    {/* Random Blips */}
                    <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute bottom-[30%] left-[20%] w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-50 delay-700" />
                    <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60 delay-300" />

                    {/* Center User */}
                    <div className="relative z-10">
                      <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />
                      <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-4 ring-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Matching Status */}
                  <div className="text-center space-y-3 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                      {t('match.searching') || 'Scanning...'}
                    </h3>
                    <p className="text-purple-300 font-mono text-lg tracking-widest">{formatTime(timer)}</p>
                    
                    <div className="flex flex-col gap-2">
                      <div className="h-9 px-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center gap-2 text-sm text-slate-400">
                        <Monitor className="w-4 h-4" />
                        {GAMES.find(g => g.id === selectedGame)?.name}
                      </div>
                      <div className="h-9 px-3 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center gap-2 text-sm text-slate-400">
                        {selectedMode === 'competitive' ? <Swords className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                        {selectedMode === 'competitive' ? 'Competitive' : 'Casual'}
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="mt-4 text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 w-full"
                      onClick={handleCancel}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side: Forum Feed */}
              <div className="flex-1 lg:overflow-hidden flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    {t('match.browseForum') || 'Browse while waiting...'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Live Feed</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                  <MatchingForumFeed />
                </div>
              </div>
            </motion.div>
          )}

          {status === 'found' && matchData && (
            <motion.div 
              key="found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 w-full h-full flex items-center justify-center"
            >
              <VirtualLobby 
                currentUser={currentUser}
                opponent={matchData}
                gameId={selectedGame}
                mode={selectedMode}
                onReady={() => onOpenChange(false)}
                onCancel={handleCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
