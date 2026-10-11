import React, { useState, useEffect } from 'react';
import { Community } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Flame,
  Award,
  Calendar,
  MessageSquare,
  Shield,
  CheckCircle,
  Plus,
  Gamepad2
} from 'lucide-react';

export const CommunitiesView: React.FC = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedComm, setSelectedComm] = useState<Community | null>(null);

  useEffect(() => {
    api.getCommunities().then((data) => {
      setCommunities(data);
      if (data.length > 0) setSelectedComm(data[0]);
    });
  }, []);

  const handleJoinToggle = async (comm: Community) => {
    if (!user) return;
    const isMember = comm.members.includes(user.id);
    if (isMember) {
      const res = await api.leaveCommunity(comm.id);
      setCommunities(communities.map((c) => (c.id === comm.id ? { ...c, members: c.members.filter((uid) => uid !== user.id), membersCount: res.membersCount } : c)));
    } else {
      const res = await api.joinCommunity(comm.id);
      setCommunities(communities.map((c) => (c.id === comm.id ? { ...c, members: [...c.members, user.id], membersCount: res.membersCount } : c)));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-950/40 via-[#0a0d18] to-cyan-950/40 border border-violet-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white font-heading tracking-wide flex items-center gap-2">
            <span>GAMING GUILDS & ESPORTS SQUADS</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
              COMMUNITY HUBS
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Join verified squads, compete in custom room scrims, and discuss strategies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left List of Communities */}
        <div className="md:col-span-5 space-y-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Available Guilds ({communities.length})
          </div>

          <div className="space-y-2.5">
            {communities.map((comm) => {
              const isSelected = selectedComm?.id === comm.id;
              const isMember = user ? comm.members.includes(user.id) : false;

              return (
                <div
                  key={comm.id}
                  onClick={() => setSelectedComm(comm)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border-cyan-400 shadow-md'
                      : 'bg-[#090d18] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 bg-gray-900 rounded-xl border border-gray-800">
                        {comm.icon}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-white text-xs tracking-wide">
                          {comm.name}
                        </h4>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span className="text-cyan-400 font-mono">{comm.gameCategory}</span>
                          <span>•</span>
                          <span>{comm.membersCount} members</span>
                        </div>
                      </div>
                    </div>

                    {isMember && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        JOINED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-7 bg-[#090d18] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          {selectedComm ? (
            <div>
              {/* Cover */}
              <div className="h-36 w-full relative bg-gray-950">
                <img src={selectedComm.banner} alt={selectedComm.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-transparent to-black/30" />
              </div>

              <div className="p-6 -mt-10 relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-heading">{selectedComm.name}</h2>
                    <span className="text-xs text-cyan-400 font-mono font-bold">
                      {selectedComm.gameCategory}
                    </span>
                  </div>

                  {user && (
                    <button
                      onClick={() => handleJoinToggle(selectedComm)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedComm.members.includes(user.id)
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold shadow-md'
                      }`}
                    >
                      {selectedComm.members.includes(user.id) ? 'Leave Guild' : 'Join Guild (+50 XP)'}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{selectedComm.description}</p>

                {/* Announcements */}
                {selectedComm.announcements && selectedComm.announcements.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-[#0c101c] border border-amber-500/40 space-y-1">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Guild Announcement & Scrim Schedule</span>
                    </div>
                    <p className="text-xs text-gray-200">{selectedComm.announcements[0]}</p>
                  </div>
                )}

                {/* Rules */}
                <div className="space-y-2 pt-2 border-t border-gray-800/80">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Squad Rules</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {selectedComm.rules.map((rule, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-gray-500">Select a community</div>
          )}
        </div>
      </div>
    </div>
  );
};
