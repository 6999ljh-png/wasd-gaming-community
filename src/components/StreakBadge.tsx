import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface StreakBadgeProps {
  streak: number; // positive for win streak, negative for loss streak
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) {
    return (
      <div className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg
        bg-slate-700/50 border border-slate-600/50
        ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}
      `}>
        <Minus className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 font-medium">无连胜/连败</span>
      </div>
    );
  }

  const isWinStreak = streak > 0;
  const absStreak = Math.abs(streak);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg
        ${isWinStreak 
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50' 
          : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/50'
        }
        ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}
      `}
    >
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-lg blur-md opacity-50
        ${isWinStreak ? 'bg-green-500/30' : 'bg-red-500/30'}
      `} />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        {isWinStreak ? (
          <TrendingUp className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-green-400`} />
        ) : (
          <TrendingDown className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-red-400`} />
        )}
        
        <div className="flex flex-col">
          <span className={`${isWinStreak ? 'text-green-400' : 'text-red-400'} font-bold`}>
            {absStreak} {isWinStreak ? '连胜' : '连败'}
          </span>
          {absStreak >= 5 && (
            <span className="text-xs text-slate-400">
              {isWinStreak ? '🔥 状态火热!' : '💪 继续加油!'}
            </span>
          )}
        </div>

        {/* Flame animation for high streaks */}
        {absStreak >= 5 && isWinStreak && (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-2xl"
          >
            🔥
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
