import React, { useState } from 'react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  MoreHorizontal,
  Send,
  Lock,
  Flame,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserCheck,
  CornerDownRight,
  Sparkles
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostDeleted: (postId: string) => void;
  onFollowToggled?: () => void;
  onRequireAuth?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onFollowToggled,
  onRequireAuth
}) => {
  const { user, followUser, unfollowUser } = useAuth();
  const { t } = useLanguage();

  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(user ? post.likedBy.includes(user.id) : false);
  const [saves, setSaves] = useState(post.saves);
  const [saved, setSaved] = useState(user ? post.savedBy.includes(user.id) : false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || (post.comments ? post.comments.length : 0));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [commentLikedState, setCommentLikedState] = useState<Record<string, { count: number; liked: boolean }>>(() => {
    const map: Record<string, { count: number; liked: boolean }> = {};
    (post.comments || []).forEach((c) => {
      map[c.id] = {
        count: c.likes || 0,
        liked: user ? (c.likedBy || []).includes(user.id) : false
      };
    });
    return map;
  });

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === 'admin';
  const isFollowing = user ? user.following.includes(post.authorId) : false;

  const quickReactions = [
    '🔥 Insane Clutch!',
    '🎯 Pure AWM Headshot!',
    '👑 GGWP King',
    '⚡ Sens breakdown please?',
    '💀 Lmao legendary moment'
  ];

  const handleLike = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res = await api.likePost(post.id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res = await api.savePost(post.id);
      setSaves(res.saves);
      setSaved(res.saved);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = (customText !== undefined ? customText : commentText).trim();
    if (!textToSubmit) return;

    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsSubmittingComment(true);
    try {
      const newComment = await api.addComment(post.id, textToSubmit);
      setComments((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);
      setCommentText('');
      setCommentLikedState((prev) => ({
        ...prev,
        [newComment.id]: { count: 0, liked: false }
      }));
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res = await api.likeComment(post.id, commentId);
      setCommentLikedState((prev) => ({
        ...prev,
        [commentId]: { count: res.likes, liked: res.liked }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(post.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplyTo = (authorUsername: string) => {
    setShowComments(true);
    setCommentText(`@${authorUsername} `);
  };

  const handleDelete = async () => {
    if (confirm('Delete this gaming transmission permanently?')) {
      await api.deletePost(post.id);
      onPostDeleted(post.id);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (user.id === post.authorId) return;
    if (isFollowing) {
      await unfollowUser(post.authorId);
    } else {
      await followUser(post.authorId);
    }
    if (onFollowToggled) onFollowToggled();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `?post=${post.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <article className="cyber-card rounded-2xl overflow-hidden mb-5 transition-all">
      {/* Post Top Bar: Cyber HUD line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-cyan-400 to-fuchsia-600 opacity-60" />

      {/* Post Author Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-800/40">
        <div className="flex items-center gap-3">
          <AvatarWithFrame
            avatarUrl={post.author.avatar}
            displayName={post.author.displayName}
            size="md"
            frameStyle={post.author.frameStyle}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-white text-sm hover:text-cyan-300 transition-colors cursor-pointer font-heading tracking-wide">
                {post.author.displayName}
              </span>
              {post.author.isVerified && <BlueTickBadge size="sm" />}
              <MembershipBadge tier={post.author.membershipTier} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-mono text-cyan-400">@{post.author.username}</span>
              <span>•</span>
              <span className="font-mono text-gray-500 text-[11px]">{post.author.gtId}</span>
              <span>•</span>
              <span className="text-[11px] text-gray-500">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Follow & Options Menu */}
        <div className="flex items-center gap-2">
          {user && user.id !== post.authorId && (
            <button
              onClick={handleFollowToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isFollowing
                  ? 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
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
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-[#0d111c] border border-gray-800 rounded-xl shadow-2xl py-1 z-30">
                <button
                  onClick={() => { handleShare(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share Link</span>
                </button>
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 sm:px-5 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-violet-950/80 border border-violet-500/50 text-violet-300 text-[10px] font-bold tracking-wider uppercase font-mono shadow-[0_0_8px_rgba(139,92,246,0.25)]">
            {post.gameCategory}
          </span>
          {post.visibility === 'members' && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Members Only</span>
            </span>
          )}
        </div>

        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Carousel / Single Image */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative mt-2 bg-black overflow-hidden max-h-[500px] flex items-center justify-center border-y border-gray-800/60">
          <img
            src={post.mediaUrls[currentMediaIndex]}
            alt="Gaming transmission"
            className="w-full max-h-[500px] object-contain select-none"
            loading="lazy"
          />

          {post.mediaUrls.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={() => setCurrentMediaIndex((prev) => prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {currentMediaIndex < post.mediaUrls.length - 1 && (
                <button
                  onClick={() => setCurrentMediaIndex((prev) => prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm">
                {post.mediaUrls.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentMediaIndex ? 'bg-cyan-400 w-4' : 'bg-gray-500 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="p-3.5 sm:px-5 flex items-center justify-between border-t border-gray-800/60 mt-1 text-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all active:scale-95 ${
              liked ? 'text-rose-500 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                liked ? 'fill-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : ''
              }`}
            />
            <span className="font-mono">{likes}</span>
          </button>

          {/* Comment Trigger */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 transition-colors ${
              showComments ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-cyan-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-mono">{commentsCount}</span>
            <span className="hidden sm:inline text-[11px] text-gray-500">Comments</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Share Transmission"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? 'Copied Link' : post.reposts}</span>
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`transition-colors p-1 rounded-lg hover:bg-gray-800/60 ${
            saved ? 'text-amber-400' : 'text-gray-400 hover:text-white'
          }`}
          title="Save Transmission"
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* ENHANCED & FIXED COMMENT DRAWER */}
      {showComments && (
        <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-gray-800/80 space-y-3.5 bg-[#050811] animate-in fade-in">
          {/* Quick Reaction Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Quick:</span>
            </span>
            {quickReactions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddComment(undefined, chip)}
                className="px-2.5 py-1 rounded-lg bg-gray-900/90 border border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-[11px] text-gray-300 hover:text-cyan-300 font-medium whitespace-nowrap transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={(e) => handleAddComment(e)} className="flex items-center gap-2">
              <AvatarWithFrame
                avatarUrl={user.avatar}
                displayName={user.displayName}
                size="xs"
                frameStyle={user.frameStyle}
              />
              <div className="flex-1 flex items-center bg-[#090e1c] border border-gray-800 focus-within:border-cyan-400 rounded-xl px-3 py-1.5 transition-colors">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Drop your thoughts or clutch reply..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="p-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-30 transition-all font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Sign in with real-time OTP to join the transmission discussion.</span>
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-3 py-1.5 bg-cyan-500 text-black rounded-lg text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                Log In
              </button>
            </div>
          )}

          {/* Comment Stream */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">
                No comments yet. Be the first gamer to transmit feedback!
              </p>
            ) : (
              comments.map((comment) => {
                const commentState = commentLikedState[comment.id] || { count: comment.likes || 0, liked: false };
                const canDelete = user && (user.id === comment.authorId || isOwner || isAdmin);

                return (
                  <div key={comment.id} className="flex items-start gap-2.5 text-xs group">
                    <AvatarWithFrame
                      avatarUrl={comment.author.avatar}
                      displayName={comment.author.displayName}
                      size="xs"
                    />
                    <div className="flex-1 bg-[#090d18] p-3 rounded-2xl border border-gray-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white text-xs">
                            {comment.author.displayName}
                          </span>
                          {comment.author.isVerified && <BlueTickBadge size="sm" />}
                          <span className="text-[10px] text-gray-500 font-mono">
                            @{comment.author.username}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-gray-200 text-xs leading-relaxed">{comment.text}</p>

                      {/* Comment Actions: Like, Reply, Delete */}
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            commentState.liked ? 'text-rose-400 font-bold' : 'hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${commentState.liked ? 'fill-rose-400' : ''}`} />
                          <span>{commentState.count > 0 ? commentState.count : 'Like'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReplyTo(comment.author.username)}
                          className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </article>
  );
};
