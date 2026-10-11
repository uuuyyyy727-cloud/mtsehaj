import React from 'react';

interface GamerTubeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const GamerTubeLogo: React.FC<GamerTubeLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Esports Holographic Hex-Shield Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} flex-shrink-0 group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-cyan-500 to-fuchsia-500 rounded-lg blur-[6px] opacity-70 group-hover:opacity-100 transition-opacity" />
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="relative w-full h-full filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
        >
          {/* Outer Cyber Shield */}
          <polygon
            points="20,2 36,9 36,25 20,38 4,25 4,9"
            fill="#090d19"
            stroke="url(#gt-shield-grad)"
            strokeWidth="2"
          />
          {/* Inner Gaming Nexus / "GT" dynamic play slash */}
          <path
            d="M14 13L24 13M19 13L19 27M23 18L28 21.5L23 25"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing Center Core */}
          <circle cx="20" cy="20" r="2" fill="#a855f7" className="animate-ping" opacity="0.6" />
          <circle cx="20" cy="20" r="2.5" fill="#f43f5e" />

          <defs>
            <linearGradient id="gt-shield-grad" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-wider leading-none flex items-center font-heading ${textSizes[size]}`}>
          <span className="text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            GAMER
          </span>
          <span className="ml-1.5 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent italic drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
            TUBE
          </span>
          <span className="ml-1 text-[9px] uppercase px-1 py-0.2 bg-violet-950/80 text-violet-300 border border-violet-500/40 rounded font-sans tracking-tight">
            PRO
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium mt-0.5">
            Your Game. Your Fame. Your Community.
          </span>
        )}
      </div>
    </div>
  );
};
