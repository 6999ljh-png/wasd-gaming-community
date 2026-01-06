import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Mic, MicOff, X, MessageCircle, UserPlus, Zap, Loader2, Wifi, Swords, Coffee, Monitor, CheckCircle2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [matchData, setMatchData] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Selection State
  const [selectedGame, setSelectedGame] = useState<string>('lol');
  const [selectedMode, setSelectedMode] = useState<string>('casual');
  const [micPreference, setMicPreference] = useState(true);

  const pollIntervalRef = useRef<any>(null);

  // Random online count effect
  useEffect(() => {
    setOnlineCount(Math.floor(Math.random() * 500) + 1200);
  }, [open]);

  // Clean up on close
  useEffect(() => {
    if (!open) {
      handleCancel();
    }
  }, [open]);

  // Polling logic
  useEffect(() => {
    if (status === 'searching') {
      const poll = async () => {
        try {
          if (!currentUser?.accessToken) return;

          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/status`, {
            headers: {
              'Authorization': `Bearer ${currentUser.accessToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'found' && data.opponent) {
              setMatchData(data.opponent);
              setStatus('found');
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };

      // Poll every 2 seconds
      pollIntervalRef.current = setInterval(poll, 2000);
      
      // Timer
      const timerInterval = setInterval(() => setTimer(t => t + 1), 1000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        clearInterval(timerInterval);
      };
    }
  }, [status, currentUser]);

  const handleStart = async () => {
    if (!currentUser?.accessToken) return;
    
    setStatus('searching');
    setTimer(0);
    
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
  };

  const handleCancel = async () => {
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
    setStatus('idle');
    setMatchData(null);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCancel() && onOpenChange(false)}>
      <DialogContent className="max-w-full w-full h-full md:h-[700px] md:w-[1000px] p-0 border-0 md:border md:border-purple-500/30 bg-slate-950 md:rounded-3xl overflow-hidden flex flex-col items-center justify-center relative shadow-[0_0_100px_rgba(88,28,135,0.4)]">
        
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
          onClick={() => { handleCancel(); onOpenChange(false); }}
          className="absolute top-6 right-6 z-50 p-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-md rounded-full text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 hover:border-slate-500"
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
              className="z-10 w-full max-w-5xl px-4 md:px-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-stretch h-full py-12 md:py-16"
            >
              {/* Left Side: Title & Description */}
              <div className="flex-1 flex flex-col justify-center space-y-6 text-center md:text-left">
                <div className="space-y-4">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto md:mx-0 mb-4">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                      <Zap className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {t('match.randomDuo') || 'Random Duo'}
                  </h2>
                  <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto md:mx-0">
                    {t('match.desc') || 'Select your mission parameters and find the perfect partner for your next game.'}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-green-400 font-mono bg-green-900/20 py-1 px-3 rounded-full w-fit mx-auto md:mx-0 border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {onlineCount.toLocaleString()} {t('match.online') || 'Agents Online'}
                  </div>
                </div>
              </div>

              {/* Right Side: Configuration Panel */}
              <div className="flex-1 w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                
                {/* 1. Select Game */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mission Target (Game)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {GAMES.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGame(game.id)}
                        className={`p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${
                          selectedGame === game.id 
                            ? 'bg-slate-800 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                         {selectedGame === game.id && (
                           <motion.div layoutId="activeGame" className="absolute inset-0 bg-purple-500/10" />
                         )}
                         <span className={`font-bold relative z-10 ${selectedGame === game.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                           {game.name}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select Mode */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Engagement Protocol</label>
                  <div className="flex gap-2">
                    {MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          selectedMode === mode.id
                            ? 'bg-slate-800 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <mode.icon className={`w-5 h-5 ${selectedMode === mode.id ? 'text-purple-400' : ''}`} />
                        <span className="font-bold text-sm">{mode.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mic & Start */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${micPreference ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {micPreference ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-bold text-slate-300">Voice Comms</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setMicPreference(!micPreference)}
                      className={micPreference ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-slate-300'}
                    >
                      {micPreference ? 'ENABLED' : 'DISABLED'}
                    </Button>
                  </div>

                  <Button 
                    onClick={handleStart}
                    className="w-full h-16 text-xl font-black italic bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-t border-white/20"
                  >
                    <Zap className="w-6 h-6 mr-2 fill-current" />
                    {t('match.start') || 'INITIATE SCAN'}
                  </Button>
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
              className="z-10 flex flex-col items-center justify-center w-full h-full p-4"
            >
              {/* Complex Radar UI */}
              <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center mb-12">
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
                   Searching: {GAMES.find(g => g.id === selectedGame)?.name} • {selectedMode === 'competitive' ? 'Ranked' : 'Casual'}
                </div>

                {/* Random Blips */}
                <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                <div className="absolute bottom-[30%] left-[20%] w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-50 delay-700" />
                <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60 delay-300" />

                {/* Center User */}
                <div className="relative z-10">
                  <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  {t('match.searching') || 'Scanning Network...'}
                </h3>
                <p className="text-purple-300 font-mono text-xl tracking-widest">{formatTime(timer)}</p>
                
                <div className="flex items-center gap-4 mt-6">
                   <div className="h-10 px-4 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center gap-2 text-sm text-slate-400">
                     <Monitor className="w-4 h-4" />
                     {GAMES.find(g => g.id === selectedGame)?.name}
                   </div>
                   <div className="h-10 px-4 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center gap-2 text-sm text-slate-400">
                     {selectedMode === 'competitive' ? <Swords className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                     {selectedMode === 'competitive' ? 'Ranked' : 'Casual'}
                   </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="mt-12 text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                onClick={handleCancel}
              >
                {t('common.cancel')}
              </Button>
            </motion.div>
          )}

          {status === 'found' && matchData && (
            <motion.div 
              key="found"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="z-10 w-full max-w-4xl px-4 md:px-8 flex flex-col items-center"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 md:mb-12"
              >
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 italic tracking-tighter drop-shadow-sm">
                  MATCH FOUND!
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-4">
                  <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 py-1 px-4 rounded-full border border-green-500/20">
                    <Wifi className="w-4 h-4" />
                    <span>Connection Established</span>
                  </div>
                  <div className="text-slate-500 text-sm font-mono">
                    Playing {GAMES.find(g => g.id === matchData.game)?.name} ({matchData.mode})
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 w-full">
                {/* Current User Card */}
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 w-64 shadow-xl"
                >
                  <Avatar className="w-24 h-24 ring-4 ring-blue-500 shadow-lg">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-white font-bold text-xl truncate w-full">{currentUser.name}</h3>
                    <p className="text-blue-400 text-sm font-bold mt-1">LV.{currentUser.level}</p>
                    {micPreference && <div className="mt-2 text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center justify-center gap-1"><Mic className="w-3 h-3" /> Mic ON</div>}
                  </div>
                </motion.div>

                {/* VS Icon */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.6 }}
                  className="relative z-20"
                >
                  <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
                  <span className="text-6xl md:text-8xl font-black text-white italic drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">VS</span>
                </motion.div>

                {/* Opponent Card */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 w-64 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
                  <Avatar className="w-24 h-24 ring-4 ring-red-500 shadow-lg z-10">
                    <AvatarImage src={matchData.avatar} />
                    <AvatarFallback>{matchData.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-center z-10">
                    <h3 className="text-white font-bold text-xl truncate w-full">{matchData.name}</h3>
                    <p className="text-red-400 text-sm font-bold mt-1">LV.{matchData.level}</p>
                    {matchData.mic && <div className="mt-2 text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center justify-center gap-1"><Mic className="w-3 h-3" /> Mic ON</div>}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
              >
                <Button 
                  className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/25 rounded-xl transition-all hover:-translate-y-1"
                  onClick={() => alert('Feature coming soon: Chat')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('match.sayHi') || 'SAY HI'}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-14 text-lg font-bold border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
                  onClick={() => {
                    handleCancel();
                    setStatus('searching');
                    // Need to restart search manually or reset to idle
                    setStatus('idle'); 
                  }}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('match.next') || 'NEXT'}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}