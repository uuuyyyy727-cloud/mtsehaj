import React from 'react';
import { MembershipTier } from '../types';

interface MembershipBadgeProps {
  tier: MembershipTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  tier,
  size = 'md',
  showLabel = false
}) => {
  if (tier === 'FREE') return null;

  const config = {
    STARTER: {
      label: 'STARTER',
      icon: '⚡',
      bg: 'bg-cyan-950/80',
      border: 'border-cyan-500/40 text-cyan-300',
      glow: 'shadow-[0_0_8px_rgba(6,182,212,0.35)]'
    },
    PRO: {
      label: 'PRO',
      icon: '🔥',
      bg: 'bg-violet-950/80',
      border: 'border-violet-500/50 text-violet-300',
      glow: 'shadow-[0_0_10px_rgba(139,92,246,0.4)]'
    },
    ELITE: {
      label: 'ELITE',
      icon: '🛡️',
      bg: 'bg-fuchsia-950/80',
      border: 'border-fuchsia-500/50 text-fuchsia-300',
      glow: 'shadow-[0_0_12px_rgba(217,70,239,0.45)]'
    },
    LEGEND: {
      label: 'LEGEND',
      icon: '👑',
      bg: 'bg-amber-950/90',
      border: 'border-amber-400 text-amber-300',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]'
    }
  };

  const item = config[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${item.bg} ${item.border} ${item.glow} backdrop-blur-sm`}
    >
      <span>{item.icon}</span>
      {showLabel && <span>{item.label}</span>}
    </span>
  );
};
