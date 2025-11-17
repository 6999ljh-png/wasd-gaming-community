import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  accessToken: string;
}

export function ReportDialog({ open, onOpenChange, targetType, targetId, accessToken }: ReportDialogProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'spam', label: t('report.reasons.spam') || 'Spam or misleading' },
    { value: 'harassment', label: t('report.reasons.harassment') || 'Harassment or hate speech' },
    { value: 'inappropriate', label: t('report.reasons.inappropriate') || 'Inappropriate content' },
    { value: 'violence', label: t('report.reasons.violence') || 'Violence or harm' },
    { value: 'copyright', label: t('report.reasons.copyright') || 'Copyright violation' },
    { value: 'other', label: t('report.reasons.other') || 'Other' },
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast.error(t('report.selectReason') || 'Please select a reason');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            targetType,
            targetId,
            reason,
            description,
          }),
        }
      );

      if (response.ok) {
        toast.success(t('report.success') || 'Report submitted successfully');
        onOpenChange(false);
        setReason('');
        setDescription('');
      } else {
        toast.error(t('report.error') || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(t('report.error') || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t('report.title') || 'Report Content'}
          </DialogTitle>
          <DialogDescription>
            {t('report.description') || 'Help us keep our community safe by reporting inappropriate content'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
              {t('report.reasonLabel') || 'Reason for reporting'} *
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('report.selectReasonPlaceholder') || 'Select a reason'} />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">
              {t('report.descriptionLabel') || 'Additional details (optional)'}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder') || 'Provide any additional context...'}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              {t('report.warning') || 'False reports may result in action against your account'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (t('report.submitting') || 'Submitting...') : (t('report.submit') || 'Submit Report')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
