import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import {
  Search,
  TrendingUp,
  Award,
  Users,
  Gamepad2,
  Trash2,
  UserPlus,
  UserCheck,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ExploreViewProps {
  onSelectUser: (user: User) => void;
  onSelectTag: (tag: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectUser,
  onSelectTag
}) => {
  const { user, followUser, unfollowUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('gt_search_history') || '["FreeFireMAX", "BGMI", "Clutch"]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadExploreData();
  }, [searchQuery]);

  const loadExploreData = async () => {
    try {
      const [fetchedUsers, fetchedPosts] = await Promise.all([
        api.getUsers(searchQuery || undefined),
        api.getPosts('trending')
      ]);
      setUsers(fetchedUsers);
      setPosts(fetchedPosts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const updated = [searchQuery.trim(), ...searchHistory.filter((s) => s !== searchQuery.trim())].slice(0, 8);
    setSearchHistory(updated);
    localStorage.setItem('gt_search_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('gt_search_history');
  };

  const trendingTags = [
    { name: 'FreeFireMAX', postsCount: 1840, hot: true },
    { name: 'BGMI', postsCount: 2310, hot: true },
    { name: 'GrandmasterClutch', postsCount: 940, hot: false },
    { name: 'Minecraft', postsCount: 820, hot: false },
    { name: 'BootcampAWM', postsCount: 650, hot: false },
    { name: 'GamerTube', postsCount: 3410, hot: true }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by gamer tag, username, game category, or #hashtag..."
          className="w-full pl-12 pr-4 py-3 bg-[#090d18] border border-gray-800 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 shadow-xl"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </form>

      {/* Search History Chips */}
      {searchHistory.length > 0 && !searchQuery && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-gray-500 font-medium">Recent:</span>
            {searchHistory.map((item, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(item)}
                className="px-2.5 py-1 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-300 hover:border-cyan-500/40 whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={handleClearHistory}
            className="text-gray-500 hover:text-rose-400 flex items-center gap-1 flex-shrink-0 ml-2"
          >
            <Trash2 className="w-3 h-3" />
            <span className="text-[10px]">Clear</span>
          </button>
        </div>
      )}

      {/* Recommended Creators & Verified Streamers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Featured Creators & Rising Legends</span>
          </h3>
          <span className="text-[11px] text-gray-500">Auto Blue Tick at 100 followers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.slice(0, 6).map((creator) => {
            const isFollowing = user ? user.following.includes(creator.id) : false;
            const progress = Math.min(100, Math.round((creator.followersCount / 100) * 100));

            return (
              <div
                key={creator.id}
                className="p-4 rounded-2xl bg-[#090d18] border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <AvatarWithFrame
                        avatarUrl={creator.avatar}
                        displayName={creator.displayName}
                        size="md"
                        frameStyle={creator.frameStyle}
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-white text-sm">
                          <span className="truncate max-w-[110px]">{creator.displayName}</span>
                          {creator.isVerified && <BlueTickBadge size="sm" />}
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400">@{creator.username}</div>
                      </div>
                    </div>

                    <MembershipBadge tier={creator.membershipTier} size="sm" />
                  </div>

                  <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {creator.bio}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-800/80">
                  {/* Follower progress bar */}
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Followers:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {creator.isVerified ? `${creator.followersCount} (Verified)` : `${creator.followersCount}/100`}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        creator.isVerified
                          ? 'bg-gradient-to-r from-cyan-400 to-violet-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                      }`}
                      style={{ width: `${creator.isVerified ? 100 : progress}%` }}
                    />
                  </div>

                  {user && user.id !== creator.id && (
                    <button
                      onClick={() => (isFollowing ? unfollowUser(creator.id) : followUser(creator.id))}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isFollowing
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow (+25 XP)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Trending Hashtags */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-400" />
          <span>Trending Gaming Transmissions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {trendingTags.map((tag) => (
            <div
              key={tag.name}
              onClick={() => onSelectTag(tag.name)}
              className="p-3 rounded-2xl bg-[#090d18] border border-gray-800 hover:border-violet-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-cyan-300 flex items-center gap-1">
                  <span>#{tag.name}</span>
                  {tag.hot && <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{tag.postsCount} transmissions</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Popular Public Media Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>Hot Highlights & Scrim Clips</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {posts
            .filter((p) => p.mediaUrls && p.mediaUrls.length > 0)
            .slice(0, 6)
            .map((post) => (
              <div
                key={post.id}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black group cursor-pointer border border-gray-800"
              >
                <img
                  src={post.mediaUrls[0]}
                  alt="Clip thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <div className="text-white text-xs truncate">
                    <div className="font-bold truncate">{post.author.displayName}</div>
                    <div className="text-[10px] text-cyan-300">{post.gameCategory}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
