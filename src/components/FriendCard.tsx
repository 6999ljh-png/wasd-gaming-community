import { UserMinus, Check, X, Gamepad2 } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Friend } from './FriendsList';

interface FriendCardProps {
  friend: Friend;
  isRequest?: boolean;
  onRemove?: (friendId: string) => void;
  onAccept?: (friendId: string) => void;
  onDecline?: (friendId: string) => void;
}

export function FriendCard({ friend, isRequest, onRemove, onAccept, onDecline }: FriendCardProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-slate-500',
    playing: 'bg-purple-500'
  };

  return (
    <Card className="glass-dark border-purple-500/20 backdrop-blur-sm p-4 hover:border-purple-500/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer animate-scale-in relative overflow-hidden">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-pink-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="w-14 h-14 ring-2 ring-purple-500/30 group-hover:ring-purple-400 group-hover:scale-110 transition-all">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${statusColors[friend.status]}`}>
              {friend.status !== 'offline' && (
                <div className={`absolute inset-0 rounded-full ${statusColors[friend.status]} animate-ping opacity-75`} />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">{friend.name}</p>
            {friend.status === 'playing' && friend.currentGame ? (
              <div className="flex items-center gap-1 text-purple-300 text-sm mt-1">
                <Gamepad2 className="w-3 h-3 animate-pulse" />
                <span className="truncate">{friend.currentGame}</span>
              </div>
            ) : friend.status === 'online' ? (
              <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </p>
            ) : (
              <p className="text-slate-400 text-sm mt-1">{friend.lastSeen || 'Offline'}</p>
            )}
          </div>
        </div>

        {isRequest ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAccept?.(friend.id)}
              className="h-9 w-9 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20 transition-all duration-300 hover:scale-110"
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDecline?.(friend.id)}
              className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20 transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove?.(friend.id)}
            className="h-9 w-9 p-0 text-purple-300 hover:text-red-400 hover:bg-red-400/20 transition-all duration-300 hover:scale-110 hover:rotate-12"
          >
            <UserMinus className="w-5 h-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}