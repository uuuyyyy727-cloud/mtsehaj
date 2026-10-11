import React, { useState, useEffect } from 'react';
import { User, Post, Reel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import { PostCard } from './PostCard';
import {
  Award,
  Crown,
  Grid,
  PlaySquare,
  Bookmark,
  Share2,
  Edit3,
  ExternalLink,
  Flame,
  Shield,
  Zap,
  Check,
  X
} from 'lucide-react';

interface ProfileViewProps {
  targetUser?: User | null;
  onOpenMembership: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  targetUser,
  onOpenMembership
}) => {
  const { user: authUser, refreshUser } = useAuth();
  const { t } = useLanguage();

  const profile = targetUser || authUser;
  const isSelf = authUser?.id === profile?.id;

  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'achievements'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Profile Form State
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [gamerTag, setGamerTag] = useState(profile?.gamerTag || '');
  const [favoriteGames, setFavoriteGames] = useState<string[]>(profile?.favoriteGames || []);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      loadProfileContent();
    }
  }, [profile?.id]);

  const loadProfileContent = async () => {
    if (!profile) return;
    try {
      const [allPosts, allReels] = await Promise.all([
        api.getPosts(),
        api.getReels()
      ]);
      setUserPosts(allPosts.filter((p) => p.authorId === profile.id));
      setUserReels(allReels.filter((r) => r.authorId === profile.id));
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return null;

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.origin + `?u=${profile.username}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.updateProfile(profile.username, {
        displayName,
        bio,
        gamerTag,
        favoriteGames
      });
      await refreshUser();
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const followerProgress = Math.min(100, Math.round((profile.followersCount / 100) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Profile Header Banner & Card */}
      <div className="bg-[#090d18] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Image */}
        <div className="h-44 sm:h-56 w-full relative bg-gray-950 overflow-hidden">
          <img
            src={
              profile.coverImage ||
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
            }
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-transparent to-black/30" />
        </div>

        {/* Profile Main Body */}
        <div className="px-5 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4">
              <AvatarWithFrame
                avatarUrl={profile.avatar}
                displayName={profile.displayName}
                size="2xl"
                frameStyle={profile.frameStyle}
              />
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-wide">
                    {profile.displayName}
                  </h1>
                  {profile.isVerified && <BlueTickBadge size="md" />}
                  <MembershipBadge tier={profile.membershipTier} size="md" showLabel />
                </div>
                <div className="flex items-center gap-2.5 text-xs mt-0.5">
                  <span className="font-mono text-cyan-400 font-bold">@{profile.username}</span>
                  <span className="text-gray-500">•</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold text-[11px]">
                    ID: {profile.gtId}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="font-mono text-amber-300 font-bold text-[11px]">
                    {profile.gamerTag}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action CTAs */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {isSelf ? (
                <>
                  <button
                    onClick={() => {
                      setDisplayName(profile.displayName);
                      setBio(profile.bio);
                      setGamerTag(profile.gamerTag);
                      setShowEditModal(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-500 text-white text-xs font-bold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.editProfile}</span>
                  </button>

                  <button
                    onClick={onOpenMembership}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-extrabold shadow-md hover:brightness-110 transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{profile.membershipTier === 'FREE' ? 'Upgrade Plan' : 'Manage Plan'}</span>
                  </button>
                </>
              ) : null}

              <button
                onClick={handleShareProfile}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Automatic 100-Follower Blue Tick Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-[#0d1222] border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>GAMER TUBE Blue Tick Verification</span>
              </span>
              <span className="font-mono text-cyan-200">
                {profile.isVerified ? 'VERIFIED (100+ Followers Met)' : `${profile.followersCount} / 100 Genuine Followers`}
              </span>
            </div>

            <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profile.isVerified
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_10px_#22d3ee]'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                }`}
                style={{ width: `${profile.isVerified ? 100 : followerProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              {profile.isVerified
                ? `Officially verified under GAMER TUBE community rules. Verified at ${new Date(profile.verifiedAt || '').toLocaleDateString()}.`
                : `Automatic verification is granted once an account crosses 100 qualifying genuine followers (excluding duplicate, deleted, or blocked accounts). No manual application or shortcut needed.`}
            </p>
          </div>

          {/* Bio & Details */}
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-200 leading-relaxed max-w-2xl">{profile.bio}</p>

            {/* Favorite Games Tags */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-gray-500 font-medium">Favorite Games:</span>
              {profile.favoriteGames.map((game, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 font-bold text-[11px]"
                >
                  🎮 {game}
                </span>
              ))}
            </div>

            {/* Creator External Links */}
            {profile.creatorLinks && Object.keys(profile.creatorLinks).length > 0 && (
              <div className="flex items-center gap-3 text-xs pt-1 text-cyan-400 font-semibold flex-wrap">
                {profile.creatorLinks.youtube && (
                  <a
                    href={profile.creatorLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span>YouTube Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.creatorLinks.discord && (
                  <a
                    href={profile.creatorLinks.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span>Discord Server</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Counts Bar */}
            <div className="flex items-center gap-6 pt-3 border-t border-gray-800/80 text-xs">
              <div>
                <strong className="text-base text-white font-black">{userPosts.length}</strong>{' '}
                <span className="text-gray-400">Transmissions</span>
              </div>
              <div>
                <strong className="text-base text-cyan-300 font-black">{profile.followersCount}</strong>{' '}
                <span className="text-gray-400">Followers</span>
              </div>
              <div>
                <strong className="text-base text-white font-black">{profile.followingCount}</strong>{' '}
                <span className="text-gray-400">Following</span>
              </div>
              <div>
                <strong className="text-base text-amber-400 font-black">Level {profile.level}</strong>{' '}
                <span className="text-gray-400">({profile.xp} XP)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'posts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'reels'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>Clips ({userReels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'achievements'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Leveling</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="p-12 text-center bg-[#090d18] border border-dashed border-gray-800 rounded-3xl text-xs text-gray-500">
              No gaming transmissions posted yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={() => loadProfileContent()}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'reels' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userReels.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#090d18] border border-dashed border-gray-800 rounded-3xl text-xs text-gray-500">
              No clips uploaded yet.
            </div>
          ) : (
            userReels.map((reel) => (
              <div
                key={reel.id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-gray-800 group"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white text-xs">
                    <p className="line-clamp-1 font-bold">{reel.caption}</p>
                    <span className="text-[10px] text-cyan-300 font-mono">{reel.views} Views</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-extrabold text-white text-sm">Century Club (100 Followers)</h4>
                <p className="text-xs text-gray-400">Reach 100 genuine followers on GAMER TUBE</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 font-bold">
              {profile.followersCount >= 100 ? 'UNLOCKED • BLUE TICK GRANTED' : `${profile.followersCount} / 100 Complete`}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-extrabold text-white text-sm">Transmission Pioneer</h4>
                <p className="text-xs text-gray-400">Share clutch gameplay updates with the community</p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold">
              UNLOCKED • +200 XP
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0d18] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Edit Gamer Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Gamer Tag</label>
                <input
                  type="text"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  placeholder="e.g. VORTEX#1337"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-md hover:bg-cyan-400"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
