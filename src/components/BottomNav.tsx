import React from 'react';
import { Home, Compass, PlusCircle, PlaySquare, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreate: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreate
}) => {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'feed' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'filter drop-shadow-[0_0_6px_#22d3ee]' : ''}`} />
          <span className="text-[10px] tracking-tight">{t.home}</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'explore' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'filter drop-shadow-[0_0_6px_#22d3ee]' : ''}`} />
          <span className="text-[10px] tracking-tight">{t.explore}</span>
        </button>

        {/* Create Center Button */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center justify-center -mt-4 group"
          title="Create Transmission"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-cyan-500 to-fuchsia-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.6)] group-active:scale-95 transition-transform">
            <div className="w-full h-full bg-[#0a0d18] rounded-[14px] flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-[9px] font-bold text-cyan-400 tracking-wider mt-0.5">TRANSMIT</span>
        </button>

        {/* Reels / Clips */}
        <button
          onClick={() => onSelectTab('reels')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'reels' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <PlaySquare className={`w-5 h-5 ${activeTab === 'reels' ? 'filter drop-shadow-[0_0_6px_#22d3ee]' : ''}`} />
          <span className="text-[10px] tracking-tight">{t.reels}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'filter drop-shadow-[0_0_6px_#22d3ee]' : ''}`} />
          <span className="text-[10px] tracking-tight">{t.profile}</span>
        </button>
      </div>
    </nav>
  );
};
