import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import {
  Home,
  Compass,
  PlaySquare,
  Users,
  MessageSquare,
  Bell,
  Crown,
  Shield,
  Flame,
  Award,
  Gamepad2,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenMembership: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedCategory,
  onSelectCategory,
  onOpenMembership
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const gameCategories = [
    { name: 'All Games', icon: '🎮' },
    { name: 'Free Fire MAX', icon: '🔥' },
    { name: 'BGMI', icon: '🎯' },
    { name: 'Minecraft', icon: '🧱' },
    { name: 'GTA V', icon: '🏎️' },
    { name: 'Valorant', icon: '⚡' }
  ];

  const followerProgress = user ? Math.min(100, Math.round((user.followersCount / 100) * 100)) : 0;

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 h-[calc(100vh-65px)] sticky top-[65px] border-r border-gray-800/80 bg-[#07090e]/80 backdrop-blur-md p-4 overflow-y-auto">
      {/* User Mini Card with GAMER TUBE ID & Blue Tick Progress */}
      {user && (
        <div className="p-3.5 mb-5 rounded-2xl bg-gradient-to-br from-[#0d1222] to-[#080b14] border border-gray-800/90 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <AvatarWithFrame
              avatarUrl={user.avatar}
              displayName={user.displayName}
              size="md"
              frameStyle={user.frameStyle}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-white truncate">{user.displayName}</span>
                {user.isVerified && <BlueTickBadge size="sm" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/40">
                  {user.gtId}
                </span>
                <MembershipBadge tier={user.membershipTier} size="sm" />
              </div>
            </div>
          </div>

          {/* Automatic 100-Follower Blue Tick Progress Tracker */}
          <div className="mt-3 pt-3 border-t border-gray-800/60">
            <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
              <span className="text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                {user.isVerified ? 'Verified Creator' : 'Blue Tick Progress'}
              </span>
              <span className="text-cyan-300 font-bold font-mono">
                {user.isVerified ? '100+ / 100' : `${user.followersCount} / 100`}
              </span>
            </div>

            <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  user.isVerified
                    ? 'bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_8px_#22d3ee]'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${user.isVerified ? 100 : followerProgress}%` }}
              />
            </div>
            {!user.isVerified && (
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                Reach 100 qualifying followers to automatically unlock GAMER TUBE Blue Tick.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="space-y-1 mb-6">
        <button
          onClick={() => onSelectTab('feed')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'feed'
              ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>{t.home}</span>
        </button>

        <button
          onClick={() => onSelectTab('explore')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'explore'
              ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>{t.explore}</span>
        </button>

        <button
          onClick={() => onSelectTab('reels')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'reels'
              ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <PlaySquare className="w-4 h-4 text-cyan-400" />
          <span>{t.reels}</span>
        </button>

        <button
          onClick={() => onSelectTab('communities')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'communities'
              ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>{t.communities}</span>
        </button>
      </nav>

      {/* Esports Game Categories */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
          <span>Categories</span>
          <Gamepad2 className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <div className="space-y-1">
          {gameCategories.map((game) => (
            <button
              key={game.name}
              onClick={() => onSelectCategory(game.name === 'All Games' ? 'All' : game.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                (selectedCategory === 'All' && game.name === 'All Games') ||
                selectedCategory === game.name
                  ? 'bg-violet-900/30 text-violet-300 border border-violet-500/40 font-bold'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* UPI QR Membership Banner */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#0d111d] to-[#07090e] border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>MEMBERSHIP PLANS</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Upgrade to Starter, Pro, Elite, or Legend via Instant UPI QR scan (₹19 - ₹99).
        </p>
        <button
          onClick={onOpenMembership}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN FROM ₹19/MO</span>
        </button>
      </div>

      {/* Admin Panel CTA for Admin Users */}
      {user?.role === 'admin' && (
        <button
          onClick={() => onSelectTab('admin')}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'admin'
              ? 'bg-red-950/60 text-red-300 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-950/40'
          }`}
        >
          <Shield className="w-4 h-4 text-red-400" />
          <span>ADMIN DASHBOARD</span>
        </button>
      )}
    </aside>
  );
};
