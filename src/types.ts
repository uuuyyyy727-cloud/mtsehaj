export type Role = 'user' | 'admin';
export type MembershipTier = 'FREE' | 'STARTER' | 'PRO' | 'ELITE' | 'LEGEND';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type PostVisibility = 'public' | 'followers' | 'members';

export interface CreatorLinks {
  youtube?: string;
  twitch?: string;
  discord?: string;
  instagram?: string;
  x?: string;
}

export interface User {
  id: string;
  gtId: string; // e.g. GT-00101
  username: string;
  displayName: string;
  email: string;
  password?: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  gamerTag: string; // e.g. VORTEX#1337
  favoriteGames: string[];
  creatorLinks: CreatorLinks;
  isVerified: boolean; // Auto GAMER TUBE Blue Tick (>= 100 qualifying followers)
  verifiedAt?: string;
  followersCount: number;
  followingCount: number;
  followers: string[]; // User IDs
  following: string[]; // User IDs
  followRequests?: string[]; // User IDs for private accounts
  role: Role;
  isPrivate: boolean;
  membershipTier: MembershipTier;
  membershipExpiresAt?: string;
  xp: number;
  level: number;
  customTheme?: string;
  frameStyle?: 'none' | 'starter-neon' | 'pro-cyber' | 'elite-plasma' | 'legend-gold';
  blockedUsers: string[];
  mutedUsers: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    membershipTier: MembershipTier;
    gtId: string;
  };
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    gamerTag: string;
    isVerified: boolean;
    membershipTier: MembershipTier;
    gtId: string;
    frameStyle?: string;
  };
  content: string;
  mediaUrls: string[];
  mediaType: 'text' | 'image' | 'video' | 'carousel';
  tags: string[];
  mentions: string[];
  gameCategory: string;
  likes: number;
  likedBy: string[];
  saves: number;
  savedBy: string[];
  reposts: number;
  repostedBy?: string[];
  commentsCount: number;
  comments: Comment[];
  visibility: PostVisibility;
  isSponsored?: boolean;
  sponsorBrand?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    membershipTier: MembershipTier;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[]; // user IDs
  reactions: { userId: string; emoji: string }[];
}

export interface StoryHighlight {
  id: string;
  authorId: string;
  title: string;
  coverUrl: string;
  storyIds: string[];
  createdAt: string;
}

export interface Reel {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    gamerTag: string;
    isVerified: boolean;
    membershipTier: MembershipTier;
    gtId: string;
  };
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  gameCategory: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  commentsCount: number;
  views: number;
  soundTitle: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  text: string;
  mediaUrl?: string;
  createdAt: string;
  isRead: boolean;
  reaction?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  updatedAt: string;
  unreadCount?: number;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
  };
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'follow_request'
    | 'blue_tick'
    | 'payment_approved'
    | 'payment_rejected'
    | 'xp_level'
    | 'mention'
    | 'story_reaction';
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentClaim {
  id: string;
  userId: string;
  userUsername: string;
  userDisplayName: string;
  userGtId: string;
  userAvatar: string;
  planId: string;
  planName: string;
  amount: number;
  utr: string; // 12-digit UPI Transaction Reference
  screenshotUrl?: string;
  status: PaymentStatus;
  adminNotes?: string;
  reviewedBy?: string; // Admin username
  reviewedAt?: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  price: number; // in INR
  period: string; // e.g. "month"
  badge: string;
  color: string;
  accentHex: string;
  perks: string[];
  active: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner: string;
  icon: string;
  gameCategory: string;
  isPrivate: boolean;
  membersCount: number;
  members: string[]; // user IDs
  createdBy: string;
  rules: string[];
  announcements?: string[];
  postsCount: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: 'payment_claim' | 'user' | 'post' | 'membership_plan' | 'blue_tick';
  targetId: string;
  details: string;
  createdAt: string;
}
