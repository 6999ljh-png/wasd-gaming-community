import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFriend: (friendId: string) => void;
}

export function AddFriendDialog({ open, onOpenChange, onAddFriend }: AddFriendDialogProps) {
  const [friendId, setFriendId] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId.trim()) return;

    onAddFriend(friendId);
    setFriendId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle>{t('friends.addFriendTitle')}</DialogTitle>
          <DialogDescription>
            {t('friends.addFriendDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="friendId">{t('friends.friendIdLabel')}</Label>
            <Input
              id="friendId"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              placeholder={t('friends.friendIdPlaceholder')}
              className="bg-slate-700 border-purple-500/20 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!friendId.trim()}
            >
              {t('friends.addFriend')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}