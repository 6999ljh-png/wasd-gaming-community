import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, Download, Share2 } from 'lucide-react';
import { GamerCard } from './GamerCard';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';

interface ShareProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareProfileDialog({ open, onOpenChange }: ShareProfileDialogProps) {
  const { currentUser } = useUser();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true, // Important for external images like avatars
        scale: 2, // Higher quality
        backgroundColor: '#0f172a', // Match background color
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `gamehub-card-${currentUser?.name || 'player'}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating card:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-purple-500/20 text-white max-w-md p-0 overflow-hidden flex flex-col items-center">
        <div className="p-6 text-center w-full bg-slate-800/50 border-b border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{t('personal.shareProfile') || 'Share Gamer Card'}</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              {t('personal.shareProfileDesc') || 'Show off your stats to the world!'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-slate-950 w-full flex justify-center overflow-y-auto max-h-[70vh]">
          {/* We render the card here directly for preview AND capture */}
          <div className="shadow-2xl shadow-purple-900/50 rounded-lg overflow-hidden ring-1 ring-slate-700">
            <GamerCard ref={cardRef} user={currentUser} />
          </div>
        </div>

        <div className="p-6 w-full bg-slate-800/50 border-t border-slate-700 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 hover:bg-slate-700 text-slate-300"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-purple-600 hover:bg-purple-700 gap-2 min-w-[140px]"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('common.processing') || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t('common.download') || 'Download Image'}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
