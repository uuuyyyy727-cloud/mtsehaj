import React, { useState, useEffect } from 'react';
import { Post, Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { StoriesBar } from './StoriesBar';
import { PostCard } from './PostCard';
import { AvatarWithFrame } from './AvatarWithFrame';
import {
  Image as ImageIcon,
  Flame,
  Send,
  Sparkles,
  Lock,
  Globe,
  Upload,
  X,
  RefreshCw,
  Gamepad2
} from 'lucide-react';

interface FeedProps {
  onSelectStory: (story: Story) => void;
  onOpenCreateStory: () => void;
  selectedCategory: string;
  onRequireAuth?: () => void;
}

export const Feed: React.FC<FeedProps> = ({
  onSelectStory,
  onOpenCreateStory,
  selectedCategory,
  onRequireAuth
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [feedFilter, setFeedFilter] = useState<'forYou' | 'following' | 'trending' | 'membersOnly'>('forYou');
  const [isLoading, setIsLoading] = useState(true);

  // Post Composer State
  const [composerText, setComposerText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [gameCategory, setGameCategory] = useState(selectedCategory !== 'All' ? selectedCategory : 'Free Fire MAX');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'members'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [feedFilter, selectedCategory]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const [fetchedPosts, fetchedStories] = await Promise.all([
        api.getPosts(feedFilter, selectedCategory !== 'All' ? selectedCategory : undefined),
        api.getStories()
      ]);
      setPosts(fetchedPosts);
      setStories(fetchedStories);
    } catch (e) {
      console.error('Failed to load feed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !mediaUrl) return;

    setIsPosting(true);
    try {
      const newPost = await api.createPost({
        content: composerText.trim(),
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        mediaType: mediaUrl ? 'image' : 'text',
        gameCategory,
        visibility
      });
      setPosts([newPost, ...posts]);
      setComposerText('');
      setMediaUrl('');
      setShowMediaInput(false);
    } catch (err: any) {
      alert(err.message || 'Error creating post');
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-20 md:pb-8">
      {/* 24-Hour Stories Bar */}
      <StoriesBar
        stories={stories}
        onSelectStory={onSelectStory}
        onOpenCreateStory={onOpenCreateStory}
      />

      {/* Esports Transmission Composer */}
      {user && (
        <div className="bg-[#090d18] border border-gray-800/90 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="flex items-start gap-3">
              <AvatarWithFrame
                avatarUrl={user.avatar}
                displayName={user.displayName}
                size="md"
                frameStyle={user.frameStyle}
              />
              <div className="flex-1 min-w-0">
                <textarea
                  rows={2}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={t.postComposer.placeholder}
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                />

                {/* Media Preview if attached */}
                {mediaUrl && (
                  <div className="relative mt-2 max-h-48 rounded-2xl overflow-hidden border border-cyan-400/50 inline-block">
                    <img src={mediaUrl} alt="Attached" className="max-h-48 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Media URL input */}
            {showMediaInput && !mediaUrl && (
              <div className="flex items-center gap-2 p-2 bg-[#07090e] border border-gray-800 rounded-xl">
                <input
                  type="text"
                  placeholder="Paste image URL or screenshot link..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="p-1 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Composer Footer Actions */}
            <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                {/* Media Button */}
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Media</span>
                </button>

                {/* Game Category Selector */}
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Free Fire MAX">Free Fire MAX</option>
                  <option value="BGMI">BGMI</option>
                  <option value="Minecraft">Minecraft</option>
                  <option value="GTA V">GTA V</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Call of Duty">Call of Duty</option>
                </select>

                {/* Visibility */}
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="public">🌐 Public</option>
                  <option value="followers">👥 Followers</option>
                  <option value="members">👑 Members Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={(!composerText.trim() && !mediaUrl) || isPosting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit (+50 XP)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Filters Tabs */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-2 text-xs font-bold">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['forYou', 'following', 'trending', 'membersOnly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFeedFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                feedFilter === tab
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'forYou' && t.feedTabs.forYou}
              {tab === 'following' && t.feedTabs.following}
              {tab === 'trending' && t.feedTabs.trending}
              {tab === 'membersOnly' && (
                <span className="flex items-center gap-1 text-amber-300">
                  <Lock className="w-3 h-3" />
                  <span>{t.feedTabs.membersOnly}</span>
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={loadFeed}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg"
          title="Refresh Feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#090d18] border border-gray-800 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-28 h-3 bg-gray-800 rounded" />
                  <div className="w-20 h-2 bg-gray-800 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-gray-800 rounded" />
              <div className="w-full h-64 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-[#090d18] border border-dashed border-gray-800 rounded-3xl space-y-3">
          <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Transmissions Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Be the first gamer to share clutch highlights or connect with fellow squad members!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onFollowToggled={loadFeed}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
};
