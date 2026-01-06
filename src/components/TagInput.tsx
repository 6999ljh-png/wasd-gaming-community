import { useState, KeyboardEvent, useEffect } from 'react';
import { Input } from './ui/input';
import { PostTags } from './PostTags';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from './ui/badge';
import { Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

const SUGGESTED_TAGS = [
  'RPG', 'FPS', 'MOBA', 'Strategy', 'Adventure', 
  'Guide', 'Bug Report', 'Discussion', 'Fan Art', 'Meme'
];

export function TagInput({ tags, onTagsChange, maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Filter suggestions based on input and already selected tags
    if (!inputValue.trim()) {
      setSuggestions(SUGGESTED_TAGS.filter(tag => !tags.includes(tag)));
    } else {
      setSuggestions(
        SUGGESTED_TAGS.filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) && 
          !tags.includes(tag)
        )
      );
    }
  }, [inputValue, tags]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = (value: string) => {
    const trimmedValue = value.trim().replace(/^#+/, ''); // Remove leading #
    
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length < maxTags ? t('tags.placeholder') || 'Add tags... (press Enter)' : ''}
          disabled={tags.length >= maxTags}
          className="bg-slate-800/50 border-purple-500/30 focus:border-purple-500 text-white"
        />
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {tags.length}/{maxTags}
        </span>
      </div>
      
      {tags.length > 0 && (
        <PostTags 
          tags={tags} 
          editable 
          onRemoveTag={removeTag}
        />
      )}

      {/* Suggestions */}
      {tags.length < maxTags && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs text-slate-500 self-center mr-1">Suggested:</span>
          {suggestions.slice(0, 6).map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-purple-500/20 hover:text-purple-300 border-slate-700 transition-colors"
              onClick={() => addTag(tag)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <p className="text-xs text-slate-500">
        {t('tags.hint') || 'Separate tags with Enter, comma, or space'}
      </p>
    </div>
  );
}
