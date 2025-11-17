import { useState, KeyboardEvent } from 'react';
import { Input } from './ui/input';
import { PostTags } from './PostTags';
import { useLanguage } from '../contexts/LanguageContext';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ tags, onTagsChange, maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { t } = useLanguage();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().replace(/^#+/, ''); // Remove leading #
    
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
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
      
      <p className="text-xs text-slate-500">
        {t('tags.hint') || 'Separate tags with Enter, comma, or space'}
      </p>
    </div>
  );
}
