import { Share2, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { useUser } from '../contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

interface ShareButtonProps {
  postId: string;
  postTitle?: string;
  onShare?: () => void;
}

export function ShareButton({ postId, postTitle, onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { currentUser } = useUser();

  const handleCopyLink = async () => {
    const url = `${window.location.origin}?post=${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToActivity = async () => {
    if (!currentUser?.accessToken) {
      toast.error('Please log in to share');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts/${postId}/share`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Shared to your activity feed!');
        onShare?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to share');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer hover:bg-slate-800"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copy link
        </DropdownMenuItem>
        {currentUser && (
          <DropdownMenuItem
            onClick={handleShareToActivity}
            className="cursor-pointer hover:bg-slate-800"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share to activity
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
