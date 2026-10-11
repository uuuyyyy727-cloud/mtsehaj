import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import {
  Heart,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Plus,
  Flame,
  Upload,
  UserPlus,
  UserCheck
} from 'lucide-react';

interface ReelsViewerProps {
  onOpenUpload: () => void;
}

export const ReelsViewer: React.FC<ReelsViewerProps> = ({ onOpenUpload }) => {
  const { user, followUser, unfollowUser } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const data = await api.getReels();
      setReels(data);
      const initialLikes: Record<string, boolean> = {};
      const initialCounts: Record<string, number> = {};
      data.forEach((r) => {
        initialLikes[r.id] = user ? r.likedBy.includes(user.id) : false;
        initialCounts[r.id] = r.likes;
      });
      setLiked(initialLikes);
      setLikesCount(initialCounts);
    } catch (e) {
      console.error(e);
    }
  };

  const currentReel = reels[currentIndex];

  useEffect(() => {
    if (currentReel) {
      api.viewReel(currentReel.id);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [currentIndex, currentReel?.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    if (!user || !currentReel) return;
    const isCurrentlyLiked = liked[currentReel.id];
    setLiked((prev) => ({ ...prev, [currentReel.id]: !isCurrentlyLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [currentReel.id]: isCurrentlyLiked ? prev[currentReel.id] - 1 : prev[currentReel.id] + 1
    }));
    await api.likeReel(currentReel.id);
  };

  const nextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#07090e]">
        <Flame className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white">No Gaming Shorts Yet</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mb-4">
          Upload clutch moments, sniper shots, or high-tier trickshots to get featured!
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
        >
          Upload Gaming Short
        </button>
      </div>
    );
  }

  const isFollowing = user && currentReel ? user.following.includes(currentReel.authorId) : false;

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-130px)] md:h-[calc(100vh-90px)] relative bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center select-none">
      {/* Video Stream */}
      <video
        ref={videoRef}
        src={currentReel.videoUrl}
        poster={currentReel.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Floating Header (Upload clip button + sound info) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{currentReel.gameCategory}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1 bg-violet-600/80 hover:bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-violet-400/30 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Clip</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Play/Pause center overlay indicator */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Play className="w-8 h-8 ml-1" />
          </div>
        </div>
      )}

      {/* Right Side Engagement Column */}
      <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-5">
        {/* Author Avatar with quick follow */}
        <div className="relative">
          <AvatarWithFrame
            avatarUrl={currentReel.author.avatar}
            displayName={currentReel.author.displayName}
            size="sm"
          />
          {user && user.id !== currentReel.authorId && !isFollowing && (
            <button
              onClick={() => followUser(currentReel.authorId)}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              liked[currentReel.id]
                ? 'bg-rose-500/30 text-rose-500 border border-rose-500/50'
                : 'bg-black/50 text-white hover:text-rose-400'
            }`}
          >
            <Heart
              className={`w-6 h-6 ${
                liked[currentReel.id] ? 'fill-rose-500 drop-shadow-[0_0_8px_#f43f5e]' : ''
              }`}
            />
          </button>
          <span className="text-[10px] text-white font-bold mt-1 drop-shadow-md">
            {likesCount[currentReel.id] || 0}
          </span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center">
          <button className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:text-cyan-400">
            <MessageSquare className="w-6 h-6" />
          </button>
          <span className="text-[10px] text-white font-bold mt-1 drop-shadow-md">
            {currentReel.commentsCount}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `?reel=${currentReel.id}`);
              alert('Clip link copied to clipboard!');
            }}
            className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:text-cyan-400"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[10px] text-white font-bold mt-1 drop-shadow-md">Share</span>
        </div>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute left-4 right-16 bottom-4 z-30 space-y-1.5 text-white">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm drop-shadow-md">
            {currentReel.author.displayName}
          </span>
          {currentReel.author.isVerified && <BlueTickBadge size="sm" />}
          <span className="text-xs text-gray-300 font-mono">@{currentReel.author.username}</span>
        </div>

        <p className="text-xs text-gray-100 line-clamp-2 drop-shadow-md">{currentReel.caption}</p>

        {/* Soundtrack / Audio Info */}
        <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono pt-1 truncate">
          <span className="animate-spin">💿</span>
          <span className="truncate">{currentReel.soundTitle}</span>
        </div>
      </div>

      {/* Up / Down Navigation Floaters for Desktop */}
      <div className="hidden md:flex flex-col gap-2 absolute right-[-54px] top-1/2 -translate-y-1/2">
        <button
          onClick={prevReel}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-[#090d18] text-white border border-gray-800 hover:border-cyan-400 disabled:opacity-30 transition-all shadow-xl"
          title="Previous Clip"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={nextReel}
          disabled={currentIndex === reels.length - 1}
          className="p-3 rounded-full bg-[#090d18] text-white border border-gray-800 hover:border-cyan-400 disabled:opacity-30 transition-all shadow-xl"
          title="Next Clip"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
