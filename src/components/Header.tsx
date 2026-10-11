import React, { useState } from 'react';
import { GamerTubeLogo } from './GamerTubeLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import {
  Bell,
  MessageSquare,
  Search,
  Sparkles,
  Shield,
  LogOut,
  User as UserIcon,
  Globe,
  Crown
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenMembership: () => void;
  onOpenAuth: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenMessages,
  onOpenNotifications,
  onOpenMembership,
  onOpenAuth,
  onSelectTab,
  activeTab
}) => {
  const { user, logout, switchUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const demoAccounts = [
    { username: 'admin', label: 'Alex Vortex (Admin / Founder)', role: 'admin', verified: true, count: 154 },
    { username: 'shadow_sniper', label: 'Rohan Sharma (104 Followers • Verified)', role: 'user', verified: true, count: 104 },
    { username: 'clutch_queen', label: 'Ananya Verma (118 Followers • Verified)', role: 'user', verified: true, count: 118 },
    { username: 'pixel_architect', label: 'Kabir Das (89/100 Followers)', role: 'user', verified: false, count: 89 },
    { username: 'bgmi_warlord', label: 'Vikram Singh (76/100 Followers)', role: 'user', verified: false, count: 76 }
  ];

  return (
    <>
      {/* Tactical Esports HUD Bar */}
      <div className="w-full bg-[#030509] border-b border-gray-900 px-3 py-1 text-[9px] font-mono text-gray-500 hidden sm:flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>GT-NET // REAL-TIME OTP PROTOCOL</span>
          </span>
          <span className="text-gray-700">|</span>
          <span>CLUSTER: ASIA-EAST-1</span>
          <span className="text-gray-700">|</span>
          <span className="text-emerald-400 font-bold">SERVER STATUS: 100% OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-3">
          <span>TICK-RATE: 128Hz</span>
          <span className="text-gray-700">|</span>
          <span className="text-cyan-300 font-bold">PING: 16ms</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-[#04060c]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 py-2.5 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div
          onClick={() => onSelectTab('feed')}
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <GamerTubeLogo size="md" showTagline={false} />
        </div>

        {/* Center: Search Trigger (Desktop/Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-4 py-2 bg-[#0e1320] border border-gray-800 rounded-xl text-sm text-gray-400 hover:border-cyan-500/50 hover:text-gray-200 transition-all shadow-inner group"
          >
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">{t.searchPlaceholder}</span>
            <kbd className="ml-auto text-[10px] bg-gray-800/80 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger for Mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg bg-[#0e1320] text-gray-300 hover:text-cyan-400 border border-gray-800"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1320] text-gray-300 hover:text-cyan-400 border border-gray-800 text-xs font-semibold uppercase tracking-wider"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'hi-en' ? 'Hinglish' : language === 'hi' ? 'हिंदी' : 'EN'}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-[#0d111c] border border-gray-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLanguage('hi-en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-violet-950/40 hover:text-cyan-300 flex items-center justify-between ${
                    language === 'hi-en' ? 'text-cyan-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  <span>Hinglish (Gaming)</span>
                  {language === 'hi-en' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
                <button
                  onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-violet-950/40 hover:text-cyan-300 flex items-center justify-between ${
                    language === 'en' ? 'text-cyan-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-violet-950/40 hover:text-cyan-300 flex items-center justify-between ${
                    language === 'hi' ? 'text-cyan-400 font-bold' : 'text-gray-300'
                  }`}
                >
                  <span>हिंदी (Hindi)</span>
                  {language === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Switcher (Simulates testing Admin, 100+ Verified Creator, 89/100 Rising Creator) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-950/60 to-purple-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:border-violet-400"
              title="Switch demo account"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span>Switch User</span>
            </button>

            {showSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c101c] border border-violet-500/40 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-gray-800">
                  Switch Demo Account
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    onClick={() => {
                      switchUser(acc.username);
                      setShowSwitcher(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between mb-1 ${
                      user?.username === acc.username
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 font-semibold">
                        <span>@{acc.username}</span>
                        {acc.verified && <BlueTickBadge size="sm" />}
                        {acc.role === 'admin' && (
                          <span className="text-[9px] bg-red-900/60 text-red-300 px-1 rounded">ADMIN</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{acc.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <button
            onClick={onOpenMessages}
            className="p-2 rounded-xl bg-[#0e1320] text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 border border-gray-800 relative transition-all"
            title={t.messages}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-[#0e1320] text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 border border-gray-800 relative transition-all"
            title={t.notifications}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
          </button>

          {/* Membership Upgrade Button */}
          <button
            onClick={onOpenMembership}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-violet-600/30 to-cyan-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-300 font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_18px_rgba(245,158,11,0.45)] transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>₹19 - ₹99 PLANS</span>
          </button>

          {/* User Profile Pill & Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full bg-[#0e1320] border border-gray-800 hover:border-gray-700 transition-all"
              >
                <AvatarWithFrame
                  avatarUrl={user.avatar}
                  displayName={user.displayName}
                  size="xs"
                  frameStyle={user.frameStyle}
                />
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white max-w-[80px] truncate">
                      {user.displayName}
                    </span>
                    {user.isVerified && <BlueTickBadge size="sm" />}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono leading-none">
                    {user.gtId}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0d111c] border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-gray-800/80 mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{user.displayName}</span>
                      <MembershipBadge tier={user.membershipTier} size="sm" showLabel />
                    </div>
                    <span className="text-[11px] text-gray-400">@{user.username}</span>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                      <span>ID: {user.gtId}</span>
                      <span>Level {user.level} ({user.xp} XP)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800/70 hover:text-white rounded-lg flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.profile}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenMembership();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 rounded-lg flex items-center gap-2"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.membership} Plans (UPI QR)</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onSelectTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2 font-bold"
                    >
                      <Shield className="w-3.5 h-3.5 text-red-400" />
                      <span>{t.adminDashboard}</span>
                    </button>
                  )}

                  <div className="border-t border-gray-800/80 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <span>⚡</span>
              <span>OTP LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  </>
  );
};
