import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FileText, Video, Upload } from 'lucide-react';
import { Card } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { projectId } from '../utils/supabase/info';

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

type SubmitType = 'text' | 'video' | null;

export function SubmitDialog({ open, onOpenChange, onPostCreated }: SubmitDialogProps) {
  const { t } = useLanguage();
  const { currentUser } = useUser();
  const [submitType, setSubmitType] = useState<SubmitType>(null);
  const [gameName, setGameName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setSubmitType(null);
    setGameName('');
    setTitle('');
    setContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.accessToken) {
      alert(t('forum.loginRequired'));
      return;
    }

    if (!gameName.trim() || !title.trim() || !content.trim()) {
      alert('请填写所有必填字段');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/posts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: submitType,
            gameName,
            title,
            content,
          }),
        }
      );

      if (response.ok) {
        handleReset();
        onOpenChange(false);
        onPostCreated?.();
        alert('发布成功！');
      } else {
        const error = await response.json();
        alert(error.error || t('forum.postError'));
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert(t('forum.postError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) handleReset();
    }}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('submit.title')}</DialogTitle>
          <DialogDescription>
            {t('submit.desc')}
          </DialogDescription>
        </DialogHeader>

        {!submitType ? (
          <div className="grid md:grid-cols-2 gap-4 py-4">
            <Card 
              className="bg-slate-900/50 border-slate-700 p-8 cursor-pointer hover:border-purple-500 transition-colors group"
              onClick={() => setSubmitType('text')}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white text-xl mb-2">{t('submit.text')}</h3>
                  <p className="text-slate-400 text-sm">{t('submit.textDesc')}</p>
                </div>
              </div>
            </Card>

            <Card 
              className="bg-slate-900/50 border-slate-700 p-8 cursor-pointer hover:border-purple-500 transition-colors group"
              onClick={() => setSubmitType('video')}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <Video className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white text-xl mb-2">{t('submit.video')}</h3>
                  <p className="text-slate-400 text-sm">{t('submit.videoDesc')}</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              {submitType === 'text' ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{submitType === 'text' ? t('submit.textPost') : t('submit.videoPost')}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSubmitType(null)}
                className="ml-auto text-slate-400 hover:text-white"
              >
                {t('submit.backToSelect')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameName">{t('submit.gameName')}</Label>
              <Input
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder={t('submit.gameNamePlaceholder')}
                className="bg-slate-700 border-purple-500/20 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t('submit.title.label')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('submit.titlePlaceholder')}
                className="bg-slate-700 border-purple-500/20 text-white"
                required
              />
            </div>

            {submitType === 'text' ? (
              <div className="space-y-2">
                <Label htmlFor="content">{t('submit.content')}</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('submit.contentPlaceholder')}
                  className="bg-slate-700 border-purple-500/20 text-white min-h-[200px]"
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t('submit.videoDesc')}</Label>
                  <Textarea
                    id="description"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('submit.videoDescPlaceholder')}
                    className="bg-slate-700 border-purple-500/20 text-white min-h-[120px]"
                    required
                  />
                </div>

                <Card className="bg-slate-700/50 border-slate-600 p-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-slate-300 text-sm">{t('submit.uploadFile')}</p>
                      <p className="text-slate-500 text-xs mt-1">{t('submit.uploadFileDesc')}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      {t('submit.chooseFile')}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t('submit.cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!gameName || !title || !content || submitting}
              >
                {submitting ? t('submit.submitting') : t('submit.publish')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
