import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Send, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Reply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  author?: {
    name: string;
    avatar: string;
    level: number;
  };
}

interface NestedRepliesProps {
  commentId: string;
  accessToken: string;
  currentUserId: string;
}

export function NestedReplies({ commentId, accessToken, currentUserId }: NestedRepliesProps) {
  const { t } = useLanguage();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (showReplies) {
      loadReplies();
    }
  }, [showReplies, commentId]);

  const loadReplies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/comments/${commentId}/replies`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReply = async () => {
    if (!newReply.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/comments/${commentId}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content: newReply }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplies([...replies, data.reply]);
        setNewReply('');
        toast.success('Reply added!');
      } else {
        toast.error('Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/replies/${replyId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setReplies(replies.filter((r) => r.id !== replyId));
        toast.success('Reply deleted');
      } else {
        toast.error('Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 30) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="mt-3 ml-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReplies(!showReplies)}
        className="text-sm text-slate-400 hover:text-purple-400 mb-2"
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        {showReplies
          ? t('replies.hide') || 'Hide replies'
          : `${replies.length > 0 ? `${replies.length} ` : ''}${t('replies.show') || 'Show replies'}`}
      </Button>

      {showReplies && (
        <div className="space-y-3 pt-2 border-l-2 border-slate-700 pl-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {replies.map((reply) => (
                <div key={reply.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reply.author?.avatar} />
                      <AvatarFallback>{reply.author?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300">{reply.author?.name || 'Unknown'}</span>
                          {reply.author && (
                            <span className="text-xs text-slate-500">Lv {reply.author.level}</span>
                          )}
                          <span className="text-xs text-slate-500">{formatTimestamp(reply.createdAt)}</span>
                        </div>
                        {reply.userId === currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReply(reply.id)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mt-1">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add reply input */}
              <div className="flex gap-2 mt-3">
                <Input
                  type="text"
                  placeholder={t('replies.typeReply') || 'Type a reply...'}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addReply();
                    }
                  }}
                  className="flex-1 bg-slate-700 border-slate-600 text-sm h-8"
                  disabled={isSubmitting}
                />
                <Button
                  size="sm"
                  onClick={addReply}
                  disabled={!newReply.trim() || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 h-8 px-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
