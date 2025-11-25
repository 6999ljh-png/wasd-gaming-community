import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Gamepad2, UserPlus, MessageSquare, Trophy, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

type MatchStatus = 'idle' | 'searching' | 'matched' | 'playing' | 'finished';

export function MatchmakingPage() {
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const [status, setStatus] = useState<MatchStatus>('idle');
  const [opponent, setOpponent] = useState<any>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const pollInterval = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      if (status === 'searching') leaveQueue();
    };
  }, [status]);

  const joinQueue = async () => {
    if (!currentUser) {
      toast.error(t('auth.loginRequired'));
      return;
    }

    try {
      setStatus('searching');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'matched') {
          handleMatchFound(data);
        } else {
          startPolling();
        }
      } else {
        setStatus('idle');
        toast.error('Failed to join queue');
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      toast.error('Error joining queue');
    }
  };

  const leaveQueue = async () => {
    if (!currentUser) return;
    
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
        },
      });
      setStatus('idle');
      if (pollInterval.current) clearInterval(pollInterval.current);
    } catch (error) {
      console.error(error);
    }
  };

  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/match/status`, {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.state === 'matched') {
            handleMatchFound(data);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, 2000);
  };

  const handleMatchFound = (data: any) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    setMatchId(data.matchId);
    setOpponent(data.opponent);
    setStatus('matched');
    
    // Simulate transition to playing
    setTimeout(() => {
      setStatus('playing');
    }, 3000);
  };

  const endGame = () => {
    setStatus('finished');
  };

  const reset = () => {
    setStatus('idle');
    setOpponent(null);
    setMatchId(null);
  };

  const addFriend = async () => {
    if (!currentUser || !opponent) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/friends/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: opponent.id }),
      });

      if (response.ok) {
        toast.success(`Friend request sent to ${opponent.name}`);
      } else {
        toast.error('Failed to add friend');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding friend');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 relative z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              <Gamepad2 className="w-32 h-32 text-white mx-auto relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Find Your Duo
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Match with other players, play games together, and build your squad.
              </p>
            </div>

            <Button
              size="lg"
              onClick={joinQueue}
              className="text-xl px-12 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Start Matchmaking
            </Button>
          </motion.div>
        )}

        {status === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 relative z-10"
          >
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              {/* Radar animation */}
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-4 border-4 border-purple-500/40 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              <div className="absolute inset-8 border-4 border-purple-500/50 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
              
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl relative z-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white animate-pulse">Looking for teammates...</h2>
              <p className="text-slate-400">Finding the perfect match for you</p>
            </div>

            <Button
              variant="outline"
              onClick={leaveQueue}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Cancel Search
            </Button>
          </motion.div>
        )}

        {status === 'matched' && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 relative z-10"
          >
            <div className="flex items-center justify-center gap-8 md:gap-16">
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xl font-bold text-white">{currentUser?.name}</span>
              </motion.div>

              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">VS</div>

              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <Avatar className="w-32 h-32 border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                  <AvatarImage src={opponent?.avatar} />
                  <AvatarFallback>{opponent?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xl font-bold text-white">{opponent?.name}</span>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Match Found!</h2>
              <p className="text-slate-400">Starting game session...</p>
            </div>
          </motion.div>
        )}

        {status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl relative z-10"
          >
            <Card className="bg-slate-900/80 border-purple-500/20 backdrop-blur-xl p-8 text-center space-y-8">
              <div className="flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-purple-500">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-white">{currentUser?.name}</span>
                </div>
                
                <div className="px-4 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm font-mono">
                  GAME IN PROGRESS
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">{opponent?.name}</span>
                  <Avatar className="w-12 h-12 border-2 border-pink-500">
                    <AvatarImage src={opponent?.avatar} />
                    <AvatarFallback>{opponent?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="aspect-video bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 relative overflow-hidden group">
                {/* Game placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                
                <div className="relative z-10 text-center space-y-4">
                  <Gamepad2 className="w-24 h-24 text-white mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold text-white">Gaming together...</h3>
                  <p className="text-slate-300">Chat not implemented yet.</p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={endGame}
                className="w-full max-w-md mx-auto"
              >
                End Game Session
              </Button>
            </Card>
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 relative z-10"
          >
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Good Game!</h2>
              <p className="text-slate-400 text-lg">
                You just played with <span className="text-purple-400 font-bold">{opponent?.name}</span>
              </p>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Button
                size="lg"
                onClick={addFriend}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add as Friend
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={reset}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
