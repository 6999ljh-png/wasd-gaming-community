interface OnlineStatusBadgeProps {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OnlineStatusBadge({ isOnline = false, size = 'md', className = '' }: OnlineStatusBadgeProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const positionClasses = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0.5 right-0.5',
    lg: 'bottom-1 right-1'
  };

  if (!isOnline) return null;

  return (
    <div 
      className={`absolute ${positionClasses[size]} ${sizeClasses[size]} bg-green-500 rounded-full ring-2 ring-slate-900 ${className}`}
    >
      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
    </div>
  );
}
