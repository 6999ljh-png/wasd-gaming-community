import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { projectId } from '../utils/supabase/info';

interface QuickReactionsProps {
  postId: string;
  initialReactions?: Record<string, number>;
  initialUserReactions?: string[];
}

const REACTIONS = [
  { emoji: '👍', key: 'thumbsup', label: 'Like' },
  { emoji: '😂', key: 'laugh', label: 'Funny' },
  { emoji: '😭', key: 'cry', label: 'Sad' },
  { emoji: '🔥', key: 'fire', label: 'Fire' },
  { emoji: '💯', key: 'hundred', label: 'Perfect' },
  { emoji: '👏', key: 'clap', label: 'Applause' },
];

export function QuickReactions({ postId, initialReactions = {}, initialUserReactions = [] }: QuickReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
  const [userReactions, setUserReactions] = useState<string[]>(initialUserReactions);
  const { currentUser } = useUser();

  useEffect(() => {
    setReactions(initialReactions);
    setUserReactions(initialUserReactions);
  }, [initialReactions, initialUserReactions]);

  const handleReaction = async (reactionKey: string) => {
    if (!currentUser?.accessToken) {
      alert('Please login to react');
      return;
    }

    const hasReacted = userReactions.includes(reactionKey);
    const newCount = (reactions[reactionKey] || 0) + (hasReacted ? -1 : 1);
    
    // Optimistic update
    setReactions(prev => ({ ...prev, [reactionKey]: Math.max(0, newCount) }));
    setUserReactions(prev => 
      hasReacted 
        ? prev.filter(r => r !== reactionKey)
        : [...prev, reactionKey]
    );

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${postId}/react`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reaction: reactionKey }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReactions(data.userReactions);
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
      // Revert on error
      setReactions(initialReactions);
      setUserReactions(initialUserReactions);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {REACTIONS.map(({ emoji, key, label }) => {
        const count = reactions[key] || 0;
        const hasReacted = userReactions.includes(key);
        
        return (
          <motion.button
            key={key}
            onClick={() => handleReaction(key)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              group relative flex items-center gap-1 px-2 py-1 rounded-full text-sm
              transition-all duration-200
              ${hasReacted 
                ? 'bg-purple-500/30 ring-1 ring-purple-500/50' 
                : 'bg-slate-800/50 hover:bg-slate-700/50'
              }
            `}
            title={label}
          >
            <span className="text-base leading-none">{emoji}</span>
            {count > 0 && (
              <span className={`text-xs font-medium ${hasReacted ? 'text-purple-300' : 'text-slate-400'}`}>
                {count}
              </span>
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              {label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
