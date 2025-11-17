import { useState, useEffect } from 'react';
import { Bookmark, BookmarkX } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PostDetail } from './PostDetail';

interface BookmarksPageProps {
  onViewProfile?: (userId: string) => void;
}

export function BookmarksPage({ onViewProfile }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser?.accessToken) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchBookmarks = async () => {
    if (!currentUser?.accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/bookmarks`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkRemoved = () => {
    // Refresh bookmarks when one is removed
    fetchBookmarks();
  };

  const handleTagClick = (tag: string) => {
    // Do nothing - we don't have tag filtering in bookmarks yet
    console.log('Tag clicked:', tag);
  };

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-white text-3xl">{t('bookmarks.title') || '📚 My Bookmarks'}</h2>
          <p className="text-purple-200 mt-1">{t('bookmarks.subtitle') || 'Your saved posts'}</p>
        </div>
        
        <Card className="glass-dark border-purple-500/20 p-12 text-center space-y-4">
          <Bookmark className="w-16 h-16 mx-auto text-slate-600" />
          <p className="text-slate-400">{t('bookmarks.loginRequired')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-white text-3xl">{t('bookmarks.title') || '📚 My Bookmarks'}</h2>
        <p className="text-purple-200 mt-1">
          {bookmarks.length} {bookmarks.length === 1 ? t('bookmarks.bookmark') : t('bookmarks.bookmarks')}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="glass-dark border-purple-500/20 p-12 text-center space-y-4">
          <BookmarkX className="w-16 h-16 mx-auto text-slate-600" />
          <p className="text-slate-400 text-lg">{t('bookmarks.noBookmarks') || 'No bookmarks yet'}</p>
          <p className="text-slate-500 text-sm">
            {t('bookmarks.hint') || 'Click the bookmark icon on posts to save them here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((post) => (
            <PostDetail
              key={post.id}
              post={post}
              onViewProfile={onViewProfile || (() => {})}
              onPostDeleted={handleBookmarkRemoved}
              onPostUpdated={handleBookmarkRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}