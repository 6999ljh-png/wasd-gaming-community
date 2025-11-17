import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export function BookmarkButton({ postId, size = 'sm', showLabel = false }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser?.accessToken) {
      checkBookmarkStatus();
    }
  }, [postId, currentUser]);

  const checkBookmarkStatus = async () => {
    if (!currentUser?.accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/bookmarks/${postId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events

    if (!currentUser?.accessToken) {
      alert(t('bookmarks.loginRequired') || 'Please login to bookmark posts');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/bookmarks/${postId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleBookmark}
      disabled={loading || !currentUser}
      className={`gap-2 transition-all duration-300 ${
        isBookmarked 
          ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30' 
          : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'
      }`}
      title={isBookmarked ? t('bookmarks.unbookmark') : t('bookmarks.bookmark')}
    >
      <Bookmark 
        className={`w-4 h-4 transition-all ${isBookmarked ? 'fill-yellow-400' : ''}`} 
      />
      {showLabel && (
        <span>{isBookmarked ? t('bookmarks.bookmarked') : t('bookmarks.bookmark')}</span>
      )}
    </Button>
  );
}
