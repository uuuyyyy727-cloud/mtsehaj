import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Award,
  Crown,
  Check,
  CheckCheck,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    await api.markNotificationsRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-violet-400" />;
      case 'blue_tick':
        return <Award className="w-4 h-4 text-cyan-400" />;
      case 'payment_approved':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'payment_rejected':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#090d18] border border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-extrabold text-white font-heading">
            GAMING ALERTS & TRANSMISSIONS
          </h2>
        </div>

        <button
          onClick={markAllRead}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
        >
          <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-gray-500">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-[#090d18] border border-dashed border-gray-800 rounded-3xl text-xs text-gray-400">
            No alerts yet. Follow creators, post clutches, or scan UPI QR for memberships!
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                notif.isRead
                  ? 'bg-[#090d18] border-gray-800/80 text-gray-300'
                  : 'bg-gradient-to-r from-violet-950/30 to-[#090d18] border-cyan-500/40 text-white shadow-md'
              }`}
            >
              <div className="relative">
                <AvatarWithFrame
                  avatarUrl={notif.sender.avatar}
                  displayName={notif.sender.displayName}
                  size="sm"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#090d18]">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                  {new Date(notif.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {' • '}
                  {new Date(notif.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
