import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  Shield, Swords, Zap, CheckCircle2, Clock, 
  MessageSquare, Mic, MicOff, User, AlertTriangle, 
  Gamepad2, Trophy, Ghost
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VirtualLobbyProps {
  currentUser: any;
  opponent: any;
  gameId: string;
  mode: string;
  onReady: () => void;
  onCancel: () => void;
}

export function VirtualLobby({ currentUser, opponent, gameId, mode, onReady, onCancel }: VirtualLobbyProps) {
  const { t } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{sender: 'me' | 'them' | 'system', text: string}>>([]);
  const [showIds, setShowIds] = useState(false);

  // Simulate opponent becoming ready
  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 10000) + 5000; // 5-15s
    const timer = setTimeout(() => {
      setOpponentReady(true);
      setMessages(prev => [...prev, { sender: 'system', text: `${opponent.name || 'Opponent'} is ready.` }]);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [opponent]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  // Handle both ready
  useEffect(() => {
    if (isReady && opponentReady) {
      setTimeout(() => {
        setShowIds(true);
      }, 500);
    }
  }, [isReady, opponentReady]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { sender: 'me', text: chatMessage }]);
    setChatMessage('');
  };

  // Mock Radar Data based on random stats
  const radarData = [
    { subject: 'Aggression', A: 80 + Math.random() * 20, B: 60 + Math.random() * 40, fullMark: 100 },
    { subject: 'Vision', A: 60 + Math.random() * 30, B: 70 + Math.random() * 30, fullMark: 100 },
    { subject: 'Mechanics', A: 90, B: 85, fullMark: 100 },
    { subject: 'Teamwork', A: 70, B: 90, fullMark: 100 },
    { subject: 'Survival', A: 50, B: 60, fullMark: 100 },
    { subject: 'Objectives', A: 85, B: 75, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full flex flex-col md:max-w-6xl md:mx-auto md:p-6 md:gap-6 md:h-auto relative bg-slate-950 md:bg-transparent">
      
      {/* --- Mobile Layout: TikTok/RedNote Style --- */}
      
      {/* 1. Mobile Header (Floating/Transparent) */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 p-4 flex items-start justify-between bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-2">
           <div className="relative">
             <svg className="w-10 h-10 -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
               <circle 
                 cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                 className={timeLeft < 15 ? 'text-red-500' : 'text-purple-500'}
                 strokeDasharray="283"
                 strokeDashoffset={283 - (283 * timeLeft) / 60}
                 strokeLinecap="round"
               />
             </svg>
             <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md">
               {timeLeft}
             </span>
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-white shadow-black drop-shadow-md">Match Found</span>
             <span className="text-[10px] text-slate-300 shadow-black drop-shadow-md flex items-center gap-1">
               <Shield className="w-3 h-3" /> Secure Room
             </span>
           </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-white/70 hover:text-white bg-black/20 backdrop-blur-sm rounded-full">
           <Swords className="w-4 h-4" />
        </Button>
      </div>

      {/* 2. Mobile Main Content (Scrollable Area) */}
      <div className="md:hidden flex-1 overflow-y-auto scrollbar-hide pb-[120px] bg-slate-950">
         {/* A. The "Stage" (Visuals) */}
         <div className="pt-20 pb-4 px-4 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950 pointer-events-none" />
            
            {/* PK Bar Style Layout */}
            <div className="flex items-center justify-between mb-6 relative z-10 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
               {/* Me */}
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {isReady && <div className="absolute -bottom-1 -right-1 bg-green-500 text-black p-0.5 rounded-full border-2 border-slate-950"><CheckCircle2 className="w-3 h-3" /></div>}
                  </div>
                  <div className="text-center mt-1">
                    <div className="text-[10px] font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 truncate max-w-[80px]">{currentUser.name}</div>
                  </div>
               </motion.div>

               {/* VS / Radar (Compact) */}
               <div className="flex flex-col items-center justify-center -mt-2">
                  <div className="text-xl font-black italic text-white/20 mb-1">VS</div>
                  <div className="w-20 h-20 relative">
                     <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                         <PolarGrid stroke="#ffffff30" strokeWidth={0.5} />
                         <PolarAngleAxis dataKey="subject" tick={false} />
                         <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar name="You" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                         <Radar name="Opponent" dataKey="B" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.4} />
                       </RadarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="text-[9px] text-purple-300 font-bold uppercase tracking-widest mt-1">87% Synergy</div>
               </div>

               {/* Opponent */}
               <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <Avatar className={`w-14 h-14 ring-2 ${showIds ? 'ring-red-500' : 'ring-slate-700'} shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all`}>
                      <AvatarImage src={showIds ? opponent.avatar : undefined} className={showIds ? 'opacity-100' : 'opacity-0'} />
                      <AvatarFallback className="bg-slate-900"><User className="w-5 h-5 text-slate-600" /></AvatarFallback>
                    </Avatar>
                    {opponentReady && <div className="absolute -bottom-1 -left-1 bg-green-500 text-black p-0.5 rounded-full border-2 border-slate-950"><CheckCircle2 className="w-3 h-3" /></div>}
                  </div>
                  <div className="text-center mt-1">
                    <div className="text-[10px] font-bold text-white bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30 truncate max-w-[80px] transition-all">
                      {showIds ? (opponent.name || 'Opponent') : 'Unknown'}
                    </div>
                  </div>
               </motion.div>
            </div>

            {/* Tags Row */}
            <div className="flex justify-center gap-2 mb-2 flex-wrap px-4">
               {opponent.tags?.slice(0, 3).map((tag: string, i: number) => (
                 <span key={i} className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-300 shadow-sm">
                   {tag}
                 </span>
               )) || <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-medium text-slate-300 shadow-sm">Flexible Player</span>}
            </div>

            {/* Match Secured Banner */}
            <AnimatePresence>
               {showIds && (
                 <motion.div 
                   initial={{ y: 20, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }}
                   className="mx-2 mt-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-3 text-center backdrop-blur-md"
                 >
                    <div className="text-green-400 font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wide">
                       <Swords className="w-4 h-4" /> Match Secured
                    </div>
                    <div className="text-[10px] text-green-200/70 mt-1 font-mono">
                       ID: <span className="text-white select-all">{currentUser.id.substring(0,4)}</span> vs <span className="text-white select-all">{opponent.id?.substring(0,4) || '8832'}</span>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* B. Chat Stream (TikTok/Live Style) */}
         <div className="px-4 space-y-2 min-h-[200px]">
            <div className="text-[10px] text-slate-600 text-center mb-4 uppercase tracking-widest font-bold">Live Chat</div>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'system' ? (
                   <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] px-3 py-1 rounded-full shadow-sm">
                     {msg.text}
                   </span>
                ) : (
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm backdrop-blur-md shadow-sm ${
                    msg.sender === 'me' 
                      ? 'bg-purple-600/90 text-white rounded-br-sm' 
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-sm border border-slate-700/50'
                  }`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
         </div>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Fixed) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-3 pb-8 z-30 flex items-center gap-3">
         <div className="flex-1 relative">
            <Input 
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Send a message..." 
              className="bg-slate-800/50 border-white/10 rounded-full h-11 pl-5 pr-11 text-sm focus:border-purple-500/50 focus:bg-slate-800 transition-all text-white placeholder:text-slate-500"
            />
            <Button 
               type="submit" 
               size="icon" 
               variant="ghost" 
               onClick={(e) => handleSendMessage(e)}
               className="absolute right-1.5 top-1.5 h-8 w-8 text-purple-400 hover:text-white hover:bg-purple-500 rounded-full transition-colors"
            >
               <Zap className="w-4 h-4 fill-current" />
            </Button>
         </div>
         
         <Button 
           onClick={() => isReady && showIds ? onReady() : setIsReady(true)}
           disabled={isReady && !showIds}
           className={`h-11 px-6 rounded-full font-black tracking-wide shadow-lg transition-all active:scale-95 ${
             isReady 
               ? (showIds ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700') 
               : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-purple-500/20'
           }`}
         >
           {isReady ? (showIds ? 'START' : 'READY') : 'READY'}
         </Button>
      </div>

      {/* --- Desktop Layout (Original) --- */}
      <div className="hidden md:flex shrink-0 bg-slate-900/80 backdrop-blur-md p-3 md:p-4 md:rounded-xl border-b md:border border-slate-800 items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
             <svg className="w-8 h-8 -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-800" />
               <circle 
                 cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                 className={timeLeft < 15 ? 'text-red-500 transition-all duration-300' : 'text-purple-500 transition-all duration-300'}
                 strokeDasharray="283"
                 strokeDashoffset={283 - (283 * timeLeft) / 60}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
               {timeLeft}
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Lobby Closing</span>
            <span className="text-[10px] text-slate-500">Auto-Dissolve Enabled</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
             {mode === 'competitive' ? 'RANKED' : 'CASUAL'}
           </span>
           <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-slate-500 hover:text-white">
             <Swords className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-hidden relative">
        {/* Desktop View: Full Matchup Cards */}
        <div className="flex flex-[2] flex-col gap-6 min-h-[400px]">
           <div className="flex items-stretch gap-4 flex-1">
             {/* You */}
             <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className={`flex-1 bg-slate-900/80 rounded-2xl border ${isReady ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-slate-800'} p-6 flex flex-col items-center relative overflow-hidden transition-all`}
             >
               {isReady && <div className="absolute top-0 right-0 p-2 bg-green-500/20 rounded-bl-xl text-green-400"><CheckCircle2 className="w-5 h-5" /></div>}
               <Avatar className="w-24 h-24 ring-4 ring-blue-500/50 mb-4">
                 <AvatarImage src={currentUser.avatar} />
                 <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
               </Avatar>
               <h3 className="text-xl font-bold text-white mb-1">{currentUser.name}</h3>
               <div className="flex flex-wrap justify-center gap-2 mb-6">
                 <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">LV.{currentUser.level || 1}</span>
                 <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">Mage Main</span>
               </div>
               <div className="mt-auto w-full">
                 <Button 
                   onClick={() => setIsReady(true)}
                   disabled={isReady}
                   className={`w-full h-12 text-lg font-bold tracking-wider transition-all ${
                     isReady 
                       ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                       : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                   }`}
                 >
                   {isReady ? 'READY LOCKED' : 'CONFIRM READY'}
                 </Button>
               </div>
             </motion.div>

             {/* Radar Desktop */}
             <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800 p-4 w-[240px] shrink-0">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Synergy Scan</h4>
                <div className="w-full h-[180px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="You" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                       <Radar name="Opponent" dataKey="B" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                     </RadarChart>
                   </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">87%</div>
                  <div className="text-[10px] text-slate-500 uppercase">Compatibility</div>
                </div>
             </div>

             {/* Opponent */}
             <motion.div 
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className={`flex-1 bg-slate-900/80 rounded-2xl border ${opponentReady ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-slate-800'} p-6 flex flex-col items-center relative overflow-hidden transition-all`}
             >
               {opponentReady && <div className="absolute top-0 left-0 p-2 bg-green-500/20 rounded-br-xl text-green-400"><CheckCircle2 className="w-5 h-5" /></div>}
               <div className="relative">
                 <Avatar className={`w-24 h-24 ring-4 ${showIds ? 'ring-red-500/50' : 'ring-slate-700'} mb-4 transition-all duration-500`}>
                   <AvatarImage src={showIds ? opponent.avatar : undefined} className={showIds ? 'opacity-100' : 'opacity-0'} />
                   <AvatarFallback className="bg-slate-800 text-slate-600"><User className="w-10 h-10" /></AvatarFallback>
                 </Avatar>
                 {!showIds && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-full backdrop-blur-[2px]"><span className="text-2xl">?</span></div>}
               </div>
               <h3 className="text-xl font-bold text-white mb-1 transition-all">{showIds ? (opponent.name || 'Opponent') : 'Unknown Player'}</h3>
               <div className="flex flex-wrap justify-center gap-2 mb-6">
                 <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">{opponent.tags?.[0] || 'Flexible'}</span>
                 <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">
                   {opponent.mic ? <Mic className="w-3 h-3 inline mr-1" /> : <MicOff className="w-3 h-3 inline mr-1" />}
                   {opponent.mic ? 'Voice On' : 'No Mic'}
                 </span>
               </div>
               <div className="mt-auto w-full text-center">
                  {opponentReady ? (
                    <div className="h-12 flex items-center justify-center gap-2 text-green-400 font-bold bg-green-500/10 rounded-lg border border-green-500/20"><CheckCircle2 className="w-5 h-5" /> READY</div>
                  ) : (
                    <div className="h-12 flex items-center justify-center gap-2 text-slate-500 font-bold bg-slate-800/50 rounded-lg border border-slate-700 animate-pulse"><Clock className="w-4 h-4" /> WAITING...</div>
                  )}
               </div>
             </motion.div>
           </div>

           {/* Desktop Reveal Info */}
           <AnimatePresence>
             {showIds && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center justify-between"
               >
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-green-500/20 rounded-full text-green-400"><Swords className="w-6 h-6" /></div>
                   <div>
                     <h4 className="text-green-400 font-bold text-lg">MATCH SECURED</h4>
                     <p className="text-green-300/70 text-sm">Game IDs revealed. You can now invite your partner.</p>
                   </div>
                 </div>
                 <Button onClick={onReady} className="bg-green-600 hover:bg-green-500 text-white font-bold px-8">GO TO GAME</Button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Chat Area (Desktop) */}
        <div className="flex-1 flex flex-col bg-slate-900/50 md:bg-slate-900/50 border-t md:border border-slate-800 md:rounded-2xl overflow-hidden min-h-0">
          <div className="p-2 md:p-3 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-slate-300">Secure Channel</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          
          <ScrollArea className="flex-1 p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              <div className="text-center my-2 md:my-4">
                <span className="text-[10px] md:text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                  Room created.
                </span>
              </div>
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'system' ? (
                     <div className="w-full text-center text-[10px] md:text-xs text-yellow-500/70 italic my-1">
                       {msg.text}
                     </div>
                  ) : (
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'me' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input (Desktop) */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800">
             <form onSubmit={handleSendMessage} className="flex gap-2">
               <Input 
                 value={chatMessage}
                 onChange={e => setChatMessage(e.target.value)}
                 placeholder="Say hello..."
                 className="bg-slate-950 border-slate-800 text-slate-200 h-10"
               />
               <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-500 h-10 w-10">
                 <Zap className="w-4 h-4" />
               </Button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
