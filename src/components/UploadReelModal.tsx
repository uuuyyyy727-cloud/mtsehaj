import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Upload, Video, Sparkles } from 'lucide-react';

interface UploadReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export const UploadReelModal: React.FC<UploadReelModalProps> = ({
  isOpen,
  onClose,
  onUploaded
}) => {
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gameCategory, setGameCategory] = useState('Free Fire MAX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetVideos = [
    {
      title: 'Esports Cyber Dash',
      category: 'Free Fire MAX',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-game-animation-with-neon-lights-42939-large.mp4'
    },
    {
      title: 'Futuristic Mecha March',
      category: 'BGMI',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-character-walking-42721-large.mp4'
    },
    {
      title: 'Neon Matrix Grid',
      category: 'Minecraft',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-cube-with-lights-in-the-dark-43301-large.mp4'
    }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsSubmitting(true);
    try {
      await api.createReel({
        videoUrl,
        caption: caption.trim(),
        gameCategory,
        tags: [gameCategory.replace(/\s+/g, ''), 'GamerTubeClips']
      });
      onUploaded();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error uploading gaming clip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#090d18] border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Upload Gaming Short / Reel</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Select Preset or Paste Video MP4 URL</label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://.../clip.mp4"
              className="w-full px-3 py-2 bg-[#07090e] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-gray-400 font-medium">Or choose high-FPS gameplay sample:</div>
            <div className="grid grid-cols-1 gap-2">
              {presetVideos.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => { setVideoUrl(p.url); setGameCategory(p.category); }}
                  className={`text-left p-2 rounded-xl border text-xs flex items-center justify-between ${
                    videoUrl === p.url
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-[10px] text-gray-400 uppercase">{p.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Game Category</label>
            <select
              value={gameCategory}
              onChange={(e) => setGameCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#07090e] border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="Free Fire MAX">Free Fire MAX</option>
              <option value="BGMI">BGMI</option>
              <option value="Minecraft">Minecraft</option>
              <option value="GTA V">GTA V</option>
              <option value="Valorant">Valorant</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Caption & Hashtags</label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="1v4 clutch in Bootcamp! MP40 spray down #FreeFire #Clutch..."
              className="w-full px-3 py-2 bg-[#07090e] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!videoUrl || isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Transmitting Clip...' : 'Broadcast Gaming Short (+100 XP)'}
          </button>
        </form>
      </div>
    </div>
  );
};
