import { Card } from './ui/card';
import { PostDetail } from './PostDetail';
import { TrendingTags } from './TrendingTags';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface Post {
  id: string;
  author: string;
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

export function DiscussionBoard({ onViewProfile }: { onViewProfile: (userId: string) => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (selectedTag) {
      fetchPostsByTag(selectedTag);
    } else {
      fetchPosts();
    }
  }, [selectedTag]);

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
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByTag = async (tag: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/tags/${encodeURIComponent(tag)}/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = () => {
    if (selectedTag) {
      fetchPostsByTag(selectedTag);
    } else {
      fetchPosts();
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 animate-scale-in">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-3xl md:text-4xl font-extrabold">{t('forum.title')}</h1>
        <p className="text-slate-400">{t('forum.subtitle')}</p>
      </div>

      {/* Trending Tags */}
      <TrendingTags onTagClick={handleTagClick} limit={30} />
      
      {/* Active tag filter */}
      {selectedTag && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-400">{t('tags.filtering') || 'Filtering by:'}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearTagFilter}
            className="gap-2 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
          >
            #{selectedTag}
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <PostDetail 
                post={post} 
                onViewProfile={onViewProfile}
                onPostDeleted={handlePostDeleted}
                onTagClick={handleTagClick}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass-dark border-purple-500/20 p-12 text-center">
          <div className="text-6xl mb-4 opacity-50">📝</div>
          <p className="text-slate-400">{t('forum.noPosts')}</p>
        </Card>
      )}
    </div>
  );
}