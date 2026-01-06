import { ThumbsUp, ThumbsDown, MessageCircle, Star, Trash2, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PostReactions } from './PostReactions';
import { BookmarkButton } from './BookmarkButton';
import { PostTags } from './PostTags';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface PostDetailProps {
  post: any;
  onViewProfile?: (userId: string) => void;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
  onTagClick?: (tag: string) => void;
}

export function PostDetail({ post, onViewProfile, onPostDeleted, onPostUpdated, onTagClick }: PostDetailProps) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { currentUser } = useUser();
  const { t } = useLanguage();

  const isAuthor = currentUser?.id === post.userId;

  useEffect(() => {
    // Check if current user has liked/disliked this post
    if (currentUser && post.likedBy) {
      setIsLiked(post.likedBy.includes(currentUser.id));
    }
    if (currentUser && post.dislikedBy) {
      setIsDisliked(post.dislikedBy.includes(currentUser.id));
    }
  }, [currentUser, post]);

  const handleLike = async () => {
    if (!currentUser?.accessToken) {
      alert(t('forum.loginRequired'));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${post.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setIsLiked(data.isLiked);
        setIsDisliked(data.isDisliked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentUser?.accessToken) {
      alert(t('forum.loginRequired'));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${post.id}/dislike`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setIsLiked(data.isLiked);
        setIsDisliked(data.isDisliked);
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setLoadingComments(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${post.id}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUser?.accessToken) {
      alert(t('forum.loginRequired'));
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${post.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setCommentsCount(commentsCount + 1);
        setNewComment('');
        setShowComments(true);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser?.accessToken) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${post.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        onPostDeleted?.();
      } else {
        const error = await response.json();
        alert(error.error || t('forum.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(t('forum.deleteError'));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser?.accessToken) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        setCommentsCount(Math.max(0, commentsCount - 1));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatTimestamp = (isoDate: string) => {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('forum.justNow');
    if (diffMins < 60) return `${diffMins} ${t('common.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('common.hoursAgo')}`;
    return `${diffDays} ${t('common.daysAgo')}`;
  };

  return (
    <Card className="glass-dark border-purple-500/20 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group animate-slide-up relative">
      {/* Game Image Background Banner */}
      {post.gameImage && (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={post.gameImage || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80'} 
            alt={post.gameName}
            className="w-full h-full object-cover blur-sm scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
          
          {/* Game Title Overlay */}
          <div className="absolute bottom-4 left-6 flex items-center gap-4">
            <div className="relative overflow-hidden rounded-lg ring-2 ring-purple-500/50 shadow-lg">
              <img 
                src={post.gameImage || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80'} 
                alt={post.gameName}
                className="w-20 h-20 object-cover"
              />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">{post.gameName}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 transition-all duration-300 ${
                      i < (post.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                        : 'text-slate-600'
                    }`}
                  />
                ))}
                <span className="text-sm text-slate-300 ml-2">{post.rating}/5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-pink-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group/author"
              onClick={() => onViewProfile?.(post.userId)}
            >
              <Avatar className="w-12 h-12 ring-2 ring-purple-500/30 group-hover/author:ring-purple-400 group-hover/author:scale-110 transition-all">
                <AvatarImage src={post.author?.avatar} />
                <AvatarFallback>{post.author?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium group-hover/author:text-purple-300 transition-colors">{post.author?.name || 'Unknown'}</p>
                <p className="text-slate-400 text-sm">{formatTimestamp(post.createdAt)}</p>
              </div>
            </div>

            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div>
            {post.title && <h3 className="text-white text-xl font-bold mb-3">{post.title}</h3>}
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            
            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-2 mt-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.images.map((image: string, index: number) => (
                  <div 
                    key={index} 
                    className={`rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-colors ${
                      post.images.length === 3 && index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Post attachment ${index + 1}`} 
                      className="w-full h-full object-cover max-h-[500px]"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4">
                <PostTags tags={post.tags} onTagClick={onTagClick} />
              </div>
            )}
          </div>

          {/* Reactions */}
          <div className="pt-3">
            <PostReactions postId={post.id} />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 transition-all duration-300 ${
                isLiked 
                  ? 'text-purple-400 bg-purple-500/20' 
                  : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-purple-400' : ''}`} />
              <span>{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`gap-2 transition-all duration-300 ${
                isDisliked 
                  ? 'text-red-400 bg-red-500/20' 
                  : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-red-400' : ''}`} />
              <span>{dislikes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadComments}
              className="gap-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </Button>

            {/* Bookmark Button */}
            <div className="ml-auto">
              <BookmarkButton postId={post.id} />
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-slide-up">
              {/* Comment Input */}
              {currentUser && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder={t('forum.addComment')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] bg-slate-800/50 border-purple-500/30 focus:border-purple-500 text-white resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !newComment.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                        size="sm"
                      >
                        <Send className="w-3 h-3" />
                        {submittingComment ? t('forum.submitting') : t('forum.comment')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors group/comment">
                      <Avatar 
                        className="w-8 h-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
                        onClick={() => onViewProfile?.(comment.userId)}
                      >
                        <AvatarImage src={comment.author?.avatar} />
                        <AvatarFallback>{comment.author?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-purple-300 transition-colors"
                            onClick={() => onViewProfile?.(comment.userId)}
                          >
                            <p className="text-white text-sm font-medium">{comment.author?.name || 'Unknown'}</p>
                            <span className="text-purple-400 text-xs">Lv.{comment.author?.level || 1}</span>
                          </div>
                          {currentUser?.id === comment.userId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover/comment:opacity-100 text-red-400 hover:text-red-300 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
                        <p className="text-slate-500 text-xs mt-1">{formatTimestamp(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">{t('forum.noComments')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-dark border-purple-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('forum.deletePostTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {t('forum.deletePostConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('forum.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}