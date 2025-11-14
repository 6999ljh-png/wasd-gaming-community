import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star } from 'lucide-react';
import { Post } from './DiscussionBoard';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
}

export function CreatePostDialog({ open, onOpenChange, onCreatePost }: CreatePostDialogProps) {
  const [gameName, setGameName] = useState('');
  const [opinion, setOpinion] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !opinion || rating === 0) return;

    onCreatePost({
      author: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      gameName,
      gameImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
      rating,
      opinion
    });

    // Reset form
    setGameName('');
    setOpinion('');
    setRating(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Game Opinion</DialogTitle>
          <DialogDescription>
            Rate and review your favorite games
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gameName">Game Name</Label>
            <Input
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name..."
              className="bg-slate-700 border-purple-500/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opinion">Your Opinion</Label>
            <Textarea
              id="opinion"
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="Share your thoughts about this game..."
              className="bg-slate-700 border-purple-500/20 text-white min-h-[150px]"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!gameName || !opinion || rating === 0}
            >
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}