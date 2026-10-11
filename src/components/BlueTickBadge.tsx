import React from 'react';

interface BlueTickBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const BlueTickBadge: React.FC<BlueTickBadgeProps> = ({
  size = 'md',
  className = '',
  showTooltip = true
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center justify-center relative group cursor-pointer ${className}`}
      title={showTooltip ? 'GAMER TUBE Verified Creator (100+ Genuine Followers)' : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} text-cyan-400 filter drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]`}
      >
        {/* Esports 8-point faceted star shield badge */}
        <path
          d="M12 1.5L14.7 4.2L18.5 3.5L19.5 7.2L23 9L21.8 12.7L23.7 16.2L20.2 17.8L19.7 21.6L15.9 21.2L13.5 24.2L10.5 22.8L7.2 24.2L5.8 20.6L2 20.2L2.5 16.4L0.2 13.5L2 10.2L1.2 6.5L4.9 5.8L6.2 2.2L10 3.2L12 1.5Z"
          fill="url(#gt-blue-gradient)"
          stroke="#22d3ee"
          strokeWidth="1"
        />
        {/* Crisp checkmark */}
        <path
          d="M8 12.5L11 15.5L16.5 9"
          stroke="#07090e"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="gt-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip on hover */}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-[#0f1422] text-cyan-300 border border-cyan-500/30 rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          GAMER TUBE Verified (100+ Followers)
        </span>
      )}
    </span>
  );
};
