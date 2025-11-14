import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, Upload, Loader2, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { projectId } from '../utils/supabase/info';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export function EditProfileDialog({ open, onOpenChange, onProfileUpdated }: EditProfileDialogProps) {
  const { t } = useLanguage();
  const { currentUser, setCurrentUser } = useUser();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;

        try {
          // Upload to server
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/upload/avatar`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentUser?.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image: base64Image }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            setAvatar(data.url);
          } else {
            const error = await response.json();
            alert(error.error || '上传失败');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('上传失败');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        alert('读取文件失败');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('处理文件失败');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.accessToken) {
      alert(t('auth.loginRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/users/${currentUser.id}/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${currentUser.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            avatar: avatar.trim(),
            bio: bio.trim(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update user context
        setCurrentUser({
          ...currentUser,
          ...data.user,
        });
        onOpenChange(false);
        onProfileUpdated?.();
        alert(t('profile.updateSuccess'));
      } else {
        const error = await response.json();
        alert(error.error || t('profile.updateError'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('profile.updateError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            {t('profile.editProfile')}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t('profile.editProfileDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              className="bg-slate-900/50 border-purple-500/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('profile.avatar')}</Label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative">
                <img 
                  src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`} 
                  alt="Avatar preview" 
                  className="w-20 h-20 rounded-full ring-2 ring-purple-500/50 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`;
                  }}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-500/20 hover:bg-purple-500/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      上传头像
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-400 mt-2">
                  支持 JPG、PNG、GIF 格式，最大5MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('profile.bio')}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              className="bg-slate-900/50 border-purple-500/20 text-white min-h-[100px]"
              maxLength={200}
            />
            <p className="text-xs text-slate-400 text-right">
              {bio.length}/200
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-purple-500/20 hover:bg-purple-500/10"
              disabled={submitting || uploading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={submitting || uploading}
            >
              {submitting ? t('profile.updating') : t('profile.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
