import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = [
    { label: 'Victory Royale', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Esports Setup', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80' },
    { label: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80' },
    { label: 'Neon Arena', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80' }
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    setIsSubmitting(true);
    try {
      await api.createStory({
        mediaUrl,
        mediaType: 'image',
        caption: caption.trim() || undefined
      });
      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#090d18] border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Create 24H Story Transmission</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview or Presets */}
        <div className="space-y-3">
          {mediaUrl ? (
            <div className="relative h-48 rounded-2xl overflow-hidden border border-cyan-400/50">
              <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-700 hover:border-cyan-400 rounded-2xl cursor-pointer bg-[#07090e] transition-colors">
                <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-xs text-gray-300 font-bold">Upload Gaming Screenshot / Clip</span>
                <span className="text-[10px] text-gray-500">PNG, JPG, MP4 under 15MB</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="text-[11px] text-gray-400 font-medium">Or select an esports preset:</div>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setMediaUrl(p.url)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-cyan-500/50 text-left text-xs text-gray-300"
                  >
                    <img src={p.url} alt={p.label} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Caption (Optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Live in 10 mins! Clutch moment..."
              className="w-full px-3 py-2 bg-[#07090e] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!mediaUrl || isSubmitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Publishing Story...' : 'Broadcast Story (Active 24H)'}
        </button>
      </div>
    </div>
  );
};
