import React, { useState, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Search,
  CheckCheck,
  Shield,
  Smile,
  X,
  Trash2,
  Lock
} from 'lucide-react';

interface DirectMessagesProps {
  onClose?: () => void;
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversations();
    api.getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConversation) {
        setActiveConversation(convs[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await api.getMessages(convId);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !mediaAttachment) || !activeConversation || !user) return;

    // Find other participant
    const recipientId = activeConversation.participants.find((p) => p !== user.id) || activeConversation.participants[0];

    setIsSending(true);
    try {
      const newMsg = await api.sendMessage({
        recipientId,
        text: messageText.trim(),
        mediaUrl: mediaAttachment || undefined
      });
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
      setMediaAttachment('');
      loadConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const startNewConversation = (targetUser: User) => {
    const existing = conversations.find((c) => c.participants.includes(targetUser.id));
    if (existing) {
      setActiveConversation(existing);
    } else {
      const pseudoConv: Conversation = {
        id: `conv_${Date.now()}`,
        participants: [user?.id || '', targetUser.id],
        isGroup: false,
        updatedAt: new Date().toISOString()
      };
      setConversations([pseudoConv, ...conversations]);
      setActiveConversation(pseudoConv);
    }
    setShowNewChat(false);
  };

  const getParticipantUser = (conv: Conversation): User | undefined => {
    const otherId = conv.participants.find((id) => id !== user?.id) || conv.participants[0];
    return users.find((u) => u.id === otherId);
  };

  const activeParticipant = activeConversation ? getParticipantUser(activeConversation) : undefined;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] bg-[#090d18] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-800/80 flex flex-col bg-[#07090e]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-sm text-white font-heading">DIRECT TRANSMISSIONS</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30"
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No active chats. Start one by clicking "+ New Chat".
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getParticipantUser(conv);
              const isSelected = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-violet-950/40 border-l-2 border-cyan-400' : 'hover:bg-gray-900/50'
                  }`}
                >
                  <AvatarWithFrame
                    avatarUrl={other?.avatar || ''}
                    displayName={other?.displayName || 'Gamer'}
                    size="sm"
                    frameStyle={other?.frameStyle}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-bold text-xs text-white truncate">
                        <span>{other?.displayName || 'Gamer'}</span>
                        {other?.isVerified && <BlueTickBadge size="sm" />}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Start chatting...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#090d18]">
        {activeConversation && activeParticipant ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0a0e1c]">
              <div className="flex items-center gap-3">
                <AvatarWithFrame
                  avatarUrl={activeParticipant.avatar}
                  displayName={activeParticipant.displayName}
                  size="sm"
                  frameStyle={activeParticipant.frameStyle}
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-xs text-white">
                    <span>{activeParticipant.displayName}</span>
                    {activeParticipant.isVerified && <BlueTickBadge size="sm" />}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <span>@{activeParticipant.username}</span>
                    <span>•</span>
                    <span>{activeParticipant.gtId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800 text-[10px]">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Participant Protected</span>
                </span>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  Transmissions encrypted and protected. Say hello to @{activeParticipant.username}!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#0f1424] text-gray-200 border border-gray-800 rounded-bl-none'
                        }`}
                      >
                        {msg.text && <p>{msg.text}</p>}
                        {msg.mediaUrl && (
                          <img
                            src={msg.mediaUrl}
                            alt="Media attachment"
                            className="mt-2 rounded-xl max-h-48 object-cover"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-0.5 px-1 font-mono">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-[#07090e] flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message @${activeParticipant.username}...`}
                className="flex-1 px-4 py-2.5 bg-[#090d18] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !mediaAttachment}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold hover:brightness-110 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 text-xs">
            <Lock className="w-10 h-10 text-gray-700 mb-2" />
            <p>Select a conversation or start a new chat transmission.</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0a0d18] border border-gray-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-extrabold text-white">Select Gamer to Transmit</h3>
              <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {users
                .filter((u) => u.id !== user?.id)
                .map((target) => (
                  <div
                    key={target.id}
                    onClick={() => startNewConversation(target)}
                    className="p-2 rounded-xl hover:bg-gray-800/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AvatarWithFrame avatarUrl={target.avatar} displayName={target.displayName} size="xs" />
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-white">
                          <span>{target.displayName}</span>
                          {target.isVerified && <BlueTickBadge size="sm" />}
                        </div>
                        <span className="text-[10px] text-gray-400">@{target.username}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">{target.gtId}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
