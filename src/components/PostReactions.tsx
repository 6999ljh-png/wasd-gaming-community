import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Smile } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface PostReactionsProps {
  postId: string;
}

const AVAILABLE_EMOJIS = ['👍', '❤️', '😂', '🎮', '🔥', '👏', '😮', '🎉'];

export function PostReactions({ postId }: PostReactionsProps) {
  const [reactions, setReactions] = useState<any>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${postId}/reactions`
      );

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || {});
        
        // Determine which emojis the current user has reacted with
        if (currentUser) {
          const userReactedEmojis: string[] = [];
          Object.entries(data.reactions || {}).forEach(([emoji, data]: [string, any]) => {
            if (data.users && data.users.includes(currentUser.id)) {
              userReactedEmojis.push(emoji);
            }
          });
          setUserReactions(userReactedEmojis);
        }
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!currentUser?.accessToken) {
      alert('Please login to react to posts');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${postId}/reactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || {});
        
        // Update user reactions
        if (data.userReacted) {
          setUserReactions([...userReactions, emoji]);
        } else {
          setUserReactions(userReactions.filter(e => e !== emoji));
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get sorted reactions by count
  const sortedReactions = Object.entries(reactions)
    .sort((a: any, b: any) => b[1].count - a[1].count);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Display existing reactions */}
      {sortedReactions.map(([emoji, data]: [string, any]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => handleReaction(emoji)}
          disabled={loading}
          className={`gap-1.5 h-8 px-3 transition-all duration-200 ${
            userReactions.includes(emoji)
              ? 'bg-purple-500/30 border border-purple-400/50 hover:bg-purple-500/40 scale-105' 
              : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/70'
          }`}
        >
          <span className="text-base">{emoji}</span>
          <span className={`text-xs ${
            userReactions.includes(emoji) ? 'text-purple-300 font-semibold' : 'text-slate-400'
          }`}>
            {data.count}
          </span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!currentUser || loading}
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 border border-slate-700/50 hover:border-purple-500/30 transition-all"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 glass-dark border-purple-500/20">
          <div className="grid grid-cols-4 gap-1">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(emoji)}
                className={`text-2xl h-10 w-10 p-0 hover:scale-125 transition-transform ${
                  userReactions.includes(emoji) ? 'bg-purple-500/20' : ''
                }`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
