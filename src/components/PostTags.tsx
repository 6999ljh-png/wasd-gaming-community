import { Hash } from 'lucide-react';
import { Badge } from './ui/badge';

interface PostTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  editable?: boolean;
  onRemoveTag?: (tag: string) => void;
}

export function PostTags({ tags, onTagClick, editable = false, onRemoveTag }: PostTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="outline"
          onClick={() => onTagClick?.(tag)}
          className={`gap-1 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all ${
            onTagClick ? 'cursor-pointer' : ''
          }`}
        >
          <Hash className="w-3 h-3" />
          <span>{tag}</span>
          {editable && onRemoveTag && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag);
              }}
              className="ml-1 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}
