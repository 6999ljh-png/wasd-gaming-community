import { Crown, Trophy, Star, Zap, Heart, MessageCircle, Award, Flame } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface UserBadgesProps {
  user: {
    postsCount?: number;
    likesReceived?: number;
    commentsCount?: number;
    friendsCount?: number;
    memberSince?: string;
    level?: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function UserBadges({ user, size = 'md' }: UserBadgesProps) {
  const badges = [];

  // VIP Badge (100+ posts)
  if ((user.postsCount || 0) >= 100) {
    badges.push({
      icon: Crown,
      label: 'VIP Member',
      description: 'Posted 100+ times',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    });
  }

  // Popular Badge (500+ likes received)
  if ((user.likesReceived || 0) >= 500) {
    badges.push({
      icon: Star,
      label: 'Popular',
      description: 'Received 500+ likes',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    });
  }

  // Active Contributor (50+ comments)
  if ((user.commentsCount || 0) >= 50) {
    badges.push({
      icon: MessageCircle,
      label: 'Active Contributor',
      description: 'Posted 50+ comments',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    });
  }

  // Social Butterfly (20+ friends)
  if ((user.friendsCount || 0) >= 20) {
    badges.push({
      icon: Heart,
      label: 'Social Butterfly',
      description: '20+ friends',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    });
  }

  // Early Adopter (member for 6+ months)
  const memberSince = user.memberSince ? new Date(user.memberSince) : null;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (memberSince && memberSince < sixMonthsAgo) {
    badges.push({
      icon: Award,
      label: 'Early Adopter',
      description: 'Member for 6+ months',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    });
  }

  // On Fire (10+ posts in last week)
  badges.push({
    icon: Flame,
    label: 'On Fire',
    description: 'Very active recently',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  });

  // Level Badge
  const level = user.level || Math.floor((user.postsCount || 0) / 10) + 1;
  if (level >= 10) {
    badges.push({
      icon: Trophy,
      label: `Level ${level}`,
      description: `Reached level ${level}`,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    });
  }

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'md' ? 'text-xs px-2 py-1' : 'text-sm px-2.5 py-1.5';

  if (badges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {badges.slice(0, 5).map((badge, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={`${badge.bg} ${badge.color} border-0 ${badgeSize} cursor-help flex items-center gap-1`}
              >
                <badge.icon className={iconSize} />
                <span>{badge.label}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 border-slate-700">
              <p>{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {badges.length > 5 && (
          <Badge
            variant="secondary"
            className="bg-slate-800/50 text-slate-400 border-0 text-xs px-2 py-1"
          >
            +{badges.length - 5}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}
