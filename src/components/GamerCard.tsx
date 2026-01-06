import { forwardRef } from 'react';
import { User } from '../contexts/UserContext';
import QRCode from 'react-qr-code';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface GamerCardProps {
  user: User;
}

export const GamerCard = forwardRef<HTMLDivElement, GamerCardProps>(({ user }, ref) => {
  // Calculate level progress
  const currentLevel = Math.floor(Math.sqrt(user.experience / 100));
  const currentLevelExp = currentLevel * currentLevel * 100;
  const nextLevelExp = (currentLevel + 1) * (currentLevel + 1) * 100;
  const expInLevel = user.experience - currentLevelExp;
  const expNeeded = nextLevelExp - currentLevelExp;
  const percentage = Math.floor((expInLevel / expNeeded) * 100);

  return (
    <div 
      ref={ref}
      className="w-[400px] h-[600px] bg-slate-900 relative overflow-hidden flex flex-col font-sans select-none"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600 rounded-full blur-[80px]" />
        <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] bg-blue-600 rounded-full blur-[60px]" />
      </div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Header / Top Section */}
      <div className="relative z-10 pt-10 px-8 flex flex-col items-center">
        {/* Avatar Ring */}
        <div className="relative mb-4 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-75" />
          <Avatar className="w-32 h-32 border-4 border-slate-900 relative z-10">
            <AvatarImage src={user.avatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-slate-800 text-purple-400">
              {user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-20 whitespace-nowrap">
            LV.{user.level}
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mb-1 tracking-tight text-center mt-2">{user.name}</h2>
        <p className="text-purple-300 text-sm font-medium tracking-widest uppercase opacity-80 mb-6">GameHub Player</p>

        {/* Level Progress */}
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>EXP</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 flex flex-col items-center">
            <span className="text-2xl mb-1">🎮</span>
            <span className="text-xl font-bold text-white">{user.stats.gamesCount}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Games</span>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 flex flex-col items-center">
            <span className="text-2xl mb-1">📝</span>
            <span className="text-xl font-bold text-white">{user.stats.postsCount}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Posts</span>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 flex flex-col items-center">
            <span className="text-2xl mb-1">❤️</span>
            <span className="text-xl font-bold text-white">{user.stats.likesReceived}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Likes</span>
          </div>
        </div>
      </div>

      {/* Footer / QR Code */}
      <div className="mt-auto relative z-10 bg-slate-900/60 backdrop-blur-xl p-6 border-t border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs mb-1">Scan to view profile</p>
          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            GameHub
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Join the community</p>
        </div>
        
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <QRCode 
            value={`https://gamehub-demo.com/user/${user.id}`} 
            size={64}
            fgColor="#0f172a"
          />
        </div>
      </div>
    </div>
  );
});

GamerCard.displayName = 'GamerCard';
