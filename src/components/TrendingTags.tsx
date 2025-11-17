import { useState, useEffect } from 'react';
import { Hash, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from '../contexts/LanguageContext';

interface TrendingTagsProps {
  onTagClick?: (tag: string) => void;
  limit?: number;
}

export function TrendingTags({ onTagClick, limit = 20 }: TrendingTagsProps) {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b33c7dce/tags`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTags(data.tags.slice(0, limit));
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-dark border-purple-500/20 p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  if (tags.length === 0) {
    return (
      <Card className="glass-dark border-purple-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-bold">{t('tags.trending')}</h3>
        </div>
        <p className="text-slate-400 text-sm text-center py-4">
          {t('tags.noTags') || 'No tags yet'}
        </p>
      </Card>
    );
  }

  // Calculate size based on count
  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  const getSize = (count: number) => {
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    if (normalized > 0.7) return 'lg';
    if (normalized > 0.4) return 'md';
    return 'sm';
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'lg': return 'text-base px-4 py-2';
      case 'md': return 'text-sm px-3 py-1.5';
      default: return 'text-xs px-2 py-1';
    }
  };

  return (
    <Card className="glass-dark border-purple-500/20 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold">{t('tags.trending') || '🔥 Trending Tags'}</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const size = getSize(tag.count);
          return (
            <Badge
              key={`${tag.tag}-${index}`}
              variant="outline"
              onClick={() => onTagClick?.(tag.tag)}
              className={`gap-1.5 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer ${getSizeClass(size)}`}
            >
              <Hash className="w-3 h-3" />
              <span>{tag.tag}</span>
              <span className="text-slate-500 text-xs ml-1">({tag.count})</span>
            </Badge>
          );
        })}
      </div>
    </Card>
  );
}
