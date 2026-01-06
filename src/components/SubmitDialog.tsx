import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FileText, Video, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { TagInput } from './TagInput';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

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
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setSubmitType(null);
    setGameName('');
    setTitle('');
    setContent('');
    setTags([]);
    setImages([]);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      toast.error(t('submit.maxImages') || 'Maximum 4 images allowed');
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/upload/post-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentUser?.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64 }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          newImages.push(data.url);
        } else {
          console.error('Upload failed');
          toast.error(t('submit.uploadError') || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(t('submit.uploadError') || 'Failed to upload image');
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.accessToken) {
      toast.error(t('forum.loginRequired'));
      return;
    }

    if (!gameName.trim() || !title.trim() || !content.trim()) {
      toast.error(t('submit.fillRequired') || 'Please fill in all required fields');
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
            tags,
            images,
          }),
        }
      );

      if (response.ok) {
        handleReset();
        onOpenChange(false);
        onPostCreated?.();
        toast.success(t('submit.success') || 'Post published successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || t('forum.postError'));
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error(t('forum.postError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) handleReset();
    }}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSubmitType(null)}
                className="p-0 h-auto hover:bg-transparent text-slate-400 hover:text-white flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('submit.backToSelect')}
              </Button>
              <div className="h-4 w-px bg-slate-700 mx-2" />
              {submitType === 'text' ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{submitType === 'text' ? t('submit.textPost') : t('submit.videoPost')}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            {submitType === 'text' ? (
              <div className="space-y-4">
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

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>{t('submit.images') || 'Images'}</span>
                    <span className="text-xs text-slate-400">{images.length}/4</span>
                  </Label>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-600 group">
                        <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {images.length < 4 && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 hover:bg-purple-500/5 flex flex-col items-center justify-center cursor-pointer transition-colors"
                      >
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs text-slate-400">{t('submit.addImages') || 'Add Image'}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
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

            <div className="space-y-2">
              <Label htmlFor="tags">{t('tags.trending') || '标签'}</Label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                maxTags={5}
              />
            </div>

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
                className="bg-purple-600 hover:bg-purple-700 gap-2"
                disabled={!gameName || !title || !content || submitting || uploading}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? t('submit.submitting') : t('submit.publish')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
