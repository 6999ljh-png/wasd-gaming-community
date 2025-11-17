import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Star, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Rating {
  id: string;
  gameId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
  user?: {
    name: string;
    avatar: string;
    level: number;
  };
}

interface GameRatingProps {
  gameId: string;
  gameName: string;
  accessToken: string;
  user: any;
}

export function GameRating({ gameId, gameName, accessToken, user }: GameRatingProps) {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    loadRatings();
  }, [gameId]);

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/games/${gameId}/ratings`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
        setAverage(data.average || 0);
        setCount(data.count || 0);

        // Check if user has rated
        const existingRating = data.ratings.find((r: Rating) => r.userId === user.id);
        if (existingRating) {
          setUserRating(existingRating.rating);
          setUserReview(existingRating.review);
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/games/${gameId}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            rating: userRating,
            review: userReview,
          }),
        }
      );

      if (response.ok) {
        toast.success('Rating submitted successfully!');
        setShowRateDialog(false);
        loadRatings();
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const renderStars = (rating: number, interactive = false, onHover?: (r: number) => void, onClick?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (interactive && hoverRating ? hoverRating : rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl text-slate-900 dark:text-white">{average.toFixed(1)}</span>
              {renderStars(Math.round(average))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {count} {count === 1 ? 'rating' : 'ratings'}
            </p>
          </div>

          <Button
            onClick={() => setShowRateDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {userRating > 0 ? (t('rating.updateRating') || 'Update Rating') : (t('rating.rateGame') || 'Rate Game')}
          </Button>
        </div>
      </Card>

      {/* Ratings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : ratings.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="mb-2 text-slate-900 dark:text-white">
            {t('rating.noRatings') || 'No ratings yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t('rating.beFirst') || 'Be the first to rate this game!'}
          </p>
          <Button onClick={() => setShowRateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            {t('rating.rateGame') || 'Rate Game'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="flex items-start gap-4">
                {rating.user && (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={rating.user.avatar} />
                    <AvatarFallback>{rating.user.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 dark:text-white">
                          {rating.user?.name || 'Unknown User'}
                        </span>
                        {rating.user && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Lv {rating.user.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-slate-700 dark:text-slate-300 mt-2">{rating.review}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rate Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('rating.rateGame') || 'Rate Game'}</DialogTitle>
            <DialogDescription>
              {t('rating.shareExperience') || `Share your experience with ${gameName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
                {t('rating.yourRating') || 'Your Rating'} *
              </label>
              <div className="flex items-center gap-2">
                {renderStars(userRating, true, setHoverRating, setUserRating)}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {userRating > 0 && `${userRating} / 5`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
                {t('rating.review') || 'Review (Optional)'}
              </label>
              <Textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder={t('rating.reviewPlaceholder') || 'Share your thoughts about this game...'}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowRateDialog(false)}>
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button onClick={submitRating} className="bg-purple-600 hover:bg-purple-700">
                {t('rating.submit') || 'Submit Rating'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
