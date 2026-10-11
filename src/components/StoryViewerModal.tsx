import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BlueTickBadge } from './BlueTickBadge';
import { X, Heart, Eye } from 'lucide-react';

interface StoryViewerModalProps {
  story: Story | null;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ story, onClose }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [reacted, setReacted] = useState(false);

  useEffect(() => {
    if (!story) return;

    // View tracking
    api.viewStory(story.id);

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story]);

  if (!story) return null;

  const handleReact = (emoji: string) => {
    api.reactStory(story.id, emoji);
    setReacted(true);
    setTimeout(() => setReacted(false), 1500);
  };

  const isOwner = user?.id === story.authorId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in">
      <div className="relative w-full max-w-sm h-[85vh] bg-[#090d18] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-gray-800">
        {/* Progress Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-100 shadow-[0_0_8px_#22d3ee]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top Story Info */}
        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <img
              src={story.author.avatar}
              alt={story.author.displayName}
              className="w-8 h-8 rounded-full border border-cyan-400 object-cover"
            />
            <div>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{story.author.displayName}</span>
                {story.author.isVerified && <BlueTickBadge size="sm" />}
              </div>
              <span className="text-[10px] text-gray-300 font-mono">
                {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Background */}
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          <img
            src={story.mediaUrl}
            alt="Story media"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-20 text-center">
            <p className="inline-block px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/10 shadow-lg">
              {story.caption}
            </p>
          </div>
        )}

        {/* Bottom Reaction Bar / Viewer Counter */}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between">
          {/* Reaction Emojis */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {['🔥', '⚡', '🎯', '👑', '💀', '❤️'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-lg hover:scale-130 transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Viewers list for owner */}
          {isOwner && (
            <div className="flex items-center gap-1 text-[11px] text-gray-300 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 font-bold">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{story.viewers.length} Views</span>
            </div>
          )}
        </div>

        {reacted && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-ping">
            <span className="text-6xl">🔥</span>
          </div>
        )}
      </div>
    </div>
  );
};
