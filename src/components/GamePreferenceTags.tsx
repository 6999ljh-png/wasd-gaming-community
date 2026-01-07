import { Shield, Zap, Target, Users, Brain, Heart, Swords, Crosshair, Bomb, Trophy, Sparkles, Pickaxe } from 'lucide-react';

export const GAME_PREFERENCES = [
  { id: 'lol', label: '英雄联盟', icon: Trophy, color: 'blue' },
  { id: 'csgo', label: 'CS:GO', icon: Crosshair, color: 'yellow' },
  { id: 'valorant', label: 'VALORANT', icon: Target, color: 'red' },
  { id: 'dota2', label: 'DOTA 2', icon: Shield, color: 'orange' },
  { id: 'apex', label: 'Apex英雄', icon: Zap, color: 'pink' },
  { id: 'overwatch', label: '守望先锋', icon: Users, color: 'blue' },
  { id: 'pubg', label: 'PUBG', icon: Bomb, color: 'green' },
  { id: 'fortnite', label: '堡垒之夜', icon: Swords, color: 'purple' },
  { id: 'genshin', label: '原神', icon: Sparkles, color: 'purple' },
  { id: 'minecraft', label: '我的世界', icon: Pickaxe, color: 'green' },
];

interface GamePreferenceTagsProps {
  preferences: string[];
  editable?: boolean;
  onToggle?: (prefId: string) => void;
}

export function GamePreferenceTags({ preferences, editable = false, onToggle }: GamePreferenceTagsProps) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const selectedPrefs = GAME_PREFERENCES.filter(pref => preferences.includes(pref.id));

  if (!editable && selectedPrefs.length === 0) {
    return null;
  }

  const displayPrefs = editable ? GAME_PREFERENCES : selectedPrefs;

  return (
    <div className="flex flex-wrap gap-2">
      {displayPrefs.map(pref => {
        const Icon = pref.icon;
        const isSelected = preferences.includes(pref.id);
        
        return (
          <button
            key={pref.id}
            onClick={() => editable && onToggle?.(pref.id)}
            disabled={!editable}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
              transition-all duration-200
              ${isSelected 
                ? colorClasses[pref.color as keyof typeof colorClasses]
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
              }
              ${editable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{pref.label}</span>
          </button>
        );
      })}
    </div>
  );
}