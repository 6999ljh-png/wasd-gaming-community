import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ThumbsUp, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';
import { OnlineStatusBadge } from './OnlineStatusBadge';

interface Post {
  id: string;
  author: string | { name: string; avatar?: string; level?: number };
  authorId: string;
  authorAvatar: string;
  gameName: string;
  gameImage: string;
  rating: number;
  opinion: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface MatchingForumFeedProps {
  onPostClick?: (postId: string) => void;
}

export function MatchingForumFeed({ onPostClick }: MatchingForumFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/4" />
                <div className="h-3 bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-slate-500">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  const getAuthorName = (author: any): string => {
    if (!author) return 'Anonymous';
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
       return author.name || 'Anonymous';
    }
    return 'Anonymous';
  };

  const getAuthorAvatar = (post: Post): string => {
    if (post.author && typeof post.author === 'object' && (post.author as any).avatar) {
      return (post.author as any).avatar;
    }
    return post.authorAvatar || '';
  };

  return (
    <div className="space-y-3">
      {posts.map((post, index) => {
        const authorName = getAuthorName(post.author);
        const authorImage = getAuthorAvatar(post);
        
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:bg-slate-900/70 transition-all cursor-pointer hover:border-purple-500/30"
              onClick={() => onPostClick && onPostClick(post.id)}
            >
              <div className="flex gap-3">
                {/* Author Avatar */}
                <Avatar className="w-10 h-10 ring-2 ring-slate-700">
                  <AvatarImage src={authorImage} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm truncate">{authorName}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">{post.gameName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(post.timestamp)}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-bold text-yellow-500">{post.rating}/10</span>
                    </div>
                  </div>

                  {/* Opinion Text */}
                  <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                    {post.opinion}
                  </p>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}