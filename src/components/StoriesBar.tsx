import React from 'react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { Plus } from 'lucide-react';

interface StoriesBarProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onOpenCreateStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  onOpenCreateStory
}) => {
  const { user } = useAuth();

  // Group stories by author
  const authorStoryMap = new Map<string, Story>();
  stories.forEach((s) => {
    if (!authorStoryMap.has(s.authorId)) {
      authorStoryMap.set(s.authorId, s);
    }
  });
  const uniqueAuthorStories = Array.from(authorStoryMap.values());

  return (
    <div className="w-full bg-[#090d18] border border-gray-800/80 rounded-2xl p-3 sm:p-4 mb-4 overflow-x-auto shadow-md">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-max">
        {/* Add Story Button for current user */}
        {user && (
          <div
            onClick={onOpenCreateStory}
            className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
          >
            <div className="relative">
              <AvatarWithFrame
                avatarUrl={user.avatar}
                displayName={user.displayName}
                size="md"
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center font-black shadow-[0_0_8px_#22d3ee] group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">
              Add Story
            </span>
          </div>
        )}

        {/* Stories from creators */}
        {uniqueAuthorStories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_16px_rgba(6,182,212,0.7)] group-hover:scale-105 transition-all">
              <div className="p-0.5 bg-[#090d18] rounded-full">
                <img
                  src={story.author.avatar}
                  alt={story.author.displayName}
                  className="w-11 h-11 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-300 max-w-[64px] truncate text-center group-hover:text-cyan-400">
              {story.author.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
