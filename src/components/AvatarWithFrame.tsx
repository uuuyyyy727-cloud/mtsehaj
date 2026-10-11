import React from 'react';

interface AvatarWithFrameProps {
  avatarUrl: string;
  displayName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  frameStyle?: string;
  isOnline?: boolean;
  className?: string;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  avatarUrl,
  displayName,
  size = 'md',
  frameStyle = 'none',
  isOnline,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28'
  };

  const frameEffects: Record<string, string> = {
    'none': 'border border-gray-700/60 ring-1 ring-gray-800/40',
    'starter-neon': 'ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] border-2 border-cyan-300',
    'pro-cyber': 'ring-2 ring-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.7)] border-2 border-fuchsia-400',
    'elite-plasma': 'ring-2 ring-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.8)] border-2 border-purple-300 animate-pulse',
    'legend-gold': 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] border-2 border-yellow-200'
  };

  const selectedFrame = frameEffects[frameStyle || 'none'] || frameEffects['none'];

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div className={`rounded-full overflow-hidden p-0.5 bg-[#090d16] ${selectedFrame} transition-all duration-300`}>
        <img
          src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=gamer'}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          loading="lazy"
        />
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#07090e] rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
      )}
    </div>
  );
};
