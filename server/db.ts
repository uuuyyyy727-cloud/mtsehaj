import {
  User,
  Post,
  Story,
  StoryHighlight,
  Reel,
  Message,
  Conversation,
  NotificationItem,
  PaymentClaim,
  MembershipPlan,
  Community,
  AdminAuditLog
} from '../src/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const DATA_FILE = path.resolve(process.cwd(), 'gamertube-data.json');

export interface DatabaseState {
  users: User[];
  posts: Post[];
  stories: Story[];
  highlights: StoryHighlight[];
  reels: Reel[];
  messages: Message[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  claims: PaymentClaim[];
  plans: MembershipPlan[];
  communities: Community[];
  auditLogs: AdminAuditLog[];
}

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(`gamertube_salt_${plain}`).digest('hex');
}

// Initial Plans
const initialPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'FREE GAMER',
    tier: 'FREE',
    price: 0,
    period: 'month',
    badge: '🎮',
    color: 'from-gray-700 to-gray-800',
    accentHex: '#94a3b8',
    perks: [
      'Basic profile & public feed',
      'Standard posts, likes & comments',
      'Public gaming communities access',
      'Basic XP & achievements progression'
    ],
    active: true
  },
  {
    id: 'starter',
    name: 'STARTER',
    tier: 'STARTER',
    price: 19,
    period: 'month',
    badge: '⚡',
    color: 'from-cyan-500 to-blue-600',
    accentHex: '#06b6d4',
    perks: [
      'Starter membership neon badge',
      'Extra neon profile frames & themes',
      'Selected members-only content access',
      'Starter missions & bonus XP'
    ],
    active: true
  },
  {
    id: 'pro',
    name: 'PRO',
    tier: 'PRO',
    price: 49,
    period: 'month',
    badge: '🔥',
    color: 'from-violet-600 to-purple-800',
    accentHex: '#8b5cf6',
    perks: [
      'Everything in Starter',
      'Pro cyber themes & animated profile frames',
      'Pro-only discussions & creator channels',
      'Additional cosmetic custom tags',
      'Exclusive Pro weekly bounties'
    ],
    active: true
  },
  {
    id: 'elite',
    name: 'ELITE',
    tier: 'ELITE',
    price: 69,
    period: 'month',
    badge: '🛡️',
    color: 'from-fuchsia-600 to-pink-600',
    accentHex: '#d946ef',
    perks: [
      'Everything in Pro',
      'Elite holographic emblem & premium styling',
      'Elite community secret lounges',
      'Exclusive high-tier guide posts',
      'Special cosmetic rewards & early badge showcases'
    ],
    active: true
  },
  {
    id: 'legend',
    name: 'LEGEND',
    tier: 'LEGEND',
    price: 99,
    period: 'month',
    badge: '👑',
    color: 'from-amber-400 to-yellow-600',
    accentHex: '#f59e0b',
    perks: [
      'Everything in Elite',
      'Rare Legend animated gold frame & royal emblem',
      'Full Legend cosmetic collection',
      'Early access to tournaments & scrim passes',
      'Priority spotlight in Explore creator feed'
    ],
    active: true
  }
];

// Seed dummy follower IDs to simulate 100+ followers for genuine verification demonstration
function makeFollowerIds(prefix: string, count: number): string[] {
  const ids: string[] = [];
  for (let i = 1; i <= count; i++) {
    ids.push(`seed_gamer_${prefix}_${i}`);
  }
  return ids;
}

const initialUsers: User[] = [
  {
    id: 'usr_admin',
    gtId: 'GT-00001',
    username: 'admin',
    displayName: 'Alex Vortex (Admin)',
    email: 'admin@gamertube.gg',
    password: hashPassword('admin123'),
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    bio: 'Founder & Head of Esports Ops @ GAMER TUBE. Verifying legends & keeping toxicity out.',
    gamerTag: 'VORTEX#0001',
    favoriteGames: ['Free Fire MAX', 'BGMI', 'Valorant'],
    creatorLinks: { youtube: 'https://youtube.com', discord: 'https://discord.gg' },
    isVerified: true,
    verifiedAt: '2026-01-01T00:00:00Z',
    followersCount: 154,
    followingCount: 35,
    followers: makeFollowerIds('adm', 154),
    following: ['usr_shadow', 'usr_clutch', 'usr_pixel'],
    role: 'admin',
    isPrivate: false,
    membershipTier: 'LEGEND',
    membershipExpiresAt: '2027-12-31T23:59:59Z',
    xp: 4850,
    level: 28,
    frameStyle: 'legend-gold',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_shadow',
    gtId: 'GT-00101',
    username: 'shadow_sniper',
    displayName: 'Rohan Sharma',
    email: 'rohan@gamertube.gg',
    password: hashPassword('password123'),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    bio: 'BGMI Assaulter & AWM specialist. Clutch King of Bootcamp 🎯 Join my scrim squad!',
    gamerTag: 'SHADOW#9901',
    favoriteGames: ['BGMI', 'Free Fire MAX'],
    creatorLinks: { youtube: 'https://youtube.com', instagram: 'https://instagram.com' },
    isVerified: true, // Has 104 followers -> verified!
    verifiedAt: '2026-02-14T10:00:00Z',
    followersCount: 104,
    followingCount: 18,
    followers: makeFollowerIds('shd', 104),
    following: ['usr_admin', 'usr_clutch'],
    role: 'user',
    isPrivate: false,
    membershipTier: 'ELITE',
    membershipExpiresAt: '2026-11-20T00:00:00Z',
    xp: 3200,
    level: 19,
    frameStyle: 'elite-plasma',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'usr_clutch',
    gtId: 'GT-00102',
    username: 'clutch_queen',
    displayName: 'Ananya Verma',
    email: 'ananya@gamertube.gg',
    password: hashPassword('password123'),
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    bio: 'Free Fire MAX Grandmaster | 1v4 Specialist 👑 Headshots only. Daily streams & montages.',
    gamerTag: 'QUEEN#7788',
    favoriteGames: ['Free Fire MAX', 'Valorant'],
    creatorLinks: { twitch: 'https://twitch.tv', youtube: 'https://youtube.com' },
    isVerified: true, // 118 followers -> verified!
    verifiedAt: '2026-03-01T15:30:00Z',
    followersCount: 118,
    followingCount: 42,
    followers: makeFollowerIds('clt', 118),
    following: ['usr_admin', 'usr_shadow'],
    role: 'user',
    isPrivate: false,
    membershipTier: 'PRO',
    membershipExpiresAt: '2026-11-15T00:00:00Z',
    xp: 2950,
    level: 17,
    frameStyle: 'pro-cyber',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'usr_pixel',
    gtId: 'GT-00103',
    username: 'pixel_architect',
    displayName: 'Kabir Das',
    email: 'kabir@gamertube.gg',
    password: hashPassword('password123'),
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    bio: 'Minecraft megastructures & Redstone engineering. 89/100 to Blue Tick! Follow to support.',
    gamerTag: 'KABIR#3321',
    favoriteGames: ['Minecraft', 'GTA V'],
    creatorLinks: { youtube: 'https://youtube.com' },
    isVerified: false, // 89 followers -> Close to 100!
    followersCount: 89,
    followingCount: 12,
    followers: makeFollowerIds('pxl', 89),
    following: ['usr_admin'],
    role: 'user',
    isPrivate: false,
    membershipTier: 'STARTER',
    membershipExpiresAt: '2026-11-10T00:00:00Z',
    xp: 1850,
    level: 12,
    frameStyle: 'starter-neon',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'usr_bgmi_warlord',
    gtId: 'GT-00104',
    username: 'bgmi_warlord',
    displayName: 'Vikram Singh',
    email: 'vikram@gamertube.gg',
    password: hashPassword('password123'),
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    bio: 'Tier 1 Scrim IGL | Erangel conqueror | 76/100 followers to GAMER TUBE Blue Tick!',
    gamerTag: 'WARLORD#1111',
    favoriteGames: ['BGMI'],
    creatorLinks: { youtube: 'https://youtube.com' },
    isVerified: false, // 76 followers!
    followersCount: 76,
    followingCount: 20,
    followers: makeFollowerIds('wrl', 76),
    following: ['usr_shadow'],
    role: 'user',
    isPrivate: false,
    membershipTier: 'FREE',
    xp: 1240,
    level: 9,
    frameStyle: 'none',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: '2026-02-10T00:00:00Z'
  }
];

const initialPosts: Post[] = [
  {
    id: 'post_1',
    authorId: 'usr_clutch',
    author: {
      id: 'usr_clutch',
      username: 'clutch_queen',
      displayName: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'QUEEN#7788',
      isVerified: true,
      membershipTier: 'PRO',
      gtId: 'GT-00102',
      frameStyle: 'pro-cyber'
    },
    content: 'Just dropped an insane 1v4 clutch in Free Fire MAX Grandmaster lobby! 🔥 Never give up even when zone shrinks to 2m and your squad is eliminated. Drop a 🔥 if you want the sensitivity breakdown in my next guide!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    tags: ['FreeFireMAX', 'GrandmasterClutch', 'EsportsIndia', 'GamerTube'],
    mentions: ['shadow_sniper'],
    gameCategory: 'Free Fire MAX',
    likes: 48,
    likedBy: ['usr_admin', 'usr_shadow', 'usr_pixel'],
    saves: 14,
    savedBy: ['usr_admin'],
    reposts: 7,
    commentsCount: 3,
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        authorId: 'usr_shadow',
        author: {
          id: 'usr_shadow',
          username: 'shadow_sniper',
          displayName: 'Rohan Sharma',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isVerified: true,
          membershipTier: 'ELITE',
          gtId: 'GT-00101'
        },
        text: 'That Gloo Wall placement was surgical! GG Queen 🔥🎯',
        createdAt: '2026-10-10T14:30:00Z',
        likes: 12,
        likedBy: ['usr_clutch', 'usr_admin']
      },
      {
        id: 'c_2',
        postId: 'post_1',
        authorId: 'usr_admin',
        author: {
          id: 'usr_admin',
          username: 'admin',
          displayName: 'Alex Vortex (Admin)',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
          isVerified: true,
          membershipTier: 'LEGEND',
          gtId: 'GT-00001'
        },
        text: 'Featured this clutch in the Weekly Esports Highlights showcase! Keep grinding.',
        createdAt: '2026-10-10T15:10:00Z',
        likes: 9,
        likedBy: ['usr_clutch']
      }
    ],
    visibility: 'public',
    createdAt: '2026-10-10T14:00:00Z'
  },
  {
    id: 'post_2',
    authorId: 'usr_shadow',
    author: {
      id: 'usr_shadow',
      username: 'shadow_sniper',
      displayName: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'SHADOW#9901',
      isVerified: true,
      membershipTier: 'ELITE',
      gtId: 'GT-00101',
      frameStyle: 'elite-plasma'
    },
    content: 'Bootcamp Pecado dual sniper montage coming tomorrow! Tested the new 90 FPS update on BGMI and the spray control feels locked in. Who else is competing in the BGMI Open Qualifiers next weekend? #BGMI #SniperMontage #GamerTube',
    mediaUrls: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'carousel',
    tags: ['BGMI', 'Esports', 'AWM', 'Bootcamp'],
    mentions: [],
    gameCategory: 'BGMI',
    likes: 67,
    likedBy: ['usr_clutch', 'usr_pixel', 'usr_admin'],
    saves: 21,
    savedBy: ['usr_clutch'],
    reposts: 12,
    commentsCount: 2,
    comments: [
      {
        id: 'c_3',
        postId: 'post_2',
        authorId: 'usr_bgmi_warlord',
        author: {
          id: 'usr_bgmi_warlord',
          username: 'bgmi_warlord',
          displayName: 'Vikram Singh',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
          isVerified: false,
          membershipTier: 'FREE',
          gtId: 'GT-00104'
        },
        text: 'Bhai let us team up for custom rooms tonight at 9 PM!',
        createdAt: '2026-10-10T16:00:00Z',
        likes: 5,
        likedBy: ['usr_shadow']
      }
    ],
    visibility: 'public',
    createdAt: '2026-10-10T15:00:00Z'
  },
  {
    id: 'post_3',
    authorId: 'usr_pixel',
    author: {
      id: 'usr_pixel',
      username: 'pixel_architect',
      displayName: 'Kabir Das',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'KABIR#3321',
      isVerified: false,
      membershipTier: 'STARTER',
      gtId: 'GT-00103',
      frameStyle: 'starter-neon'
    },
    content: 'Finished my Cyberpunk Neo-Tokyo metropolis in Minecraft after 140 hours! Fully automated Redstone monorail, neon street lighting, and custom shaders. I am currently at 89/100 followers towards the GAMER TUBE Blue Tick — help me cross 100! 🚀🎮 #Minecraft #Megabuild #Redstone',
    mediaUrls: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    tags: ['Minecraft', 'NeoTokyo', 'Redstone', 'GamerTube'],
    mentions: [],
    gameCategory: 'Minecraft',
    likes: 52,
    likedBy: ['usr_admin', 'usr_shadow'],
    saves: 28,
    savedBy: ['usr_admin'],
    reposts: 9,
    commentsCount: 1,
    comments: [],
    visibility: 'public',
    createdAt: '2026-10-10T17:30:00Z'
  }
];

const initialStories: Story[] = [
  {
    id: 'story_1',
    authorId: 'usr_clutch',
    author: {
      id: 'usr_clutch',
      username: 'clutch_queen',
      displayName: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      membershipTier: 'PRO'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Warmup scrims started! 🎯 Live in 15 mins.',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    viewers: ['usr_admin', 'usr_shadow'],
    reactions: [{ userId: 'usr_admin', emoji: '🔥' }]
  },
  {
    id: 'story_2',
    authorId: 'usr_shadow',
    author: {
      id: 'usr_shadow',
      username: 'shadow_sniper',
      displayName: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      membershipTier: 'ELITE'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'New mechanical keyboard arrived! Cherry MX Speed Silvers ⚡',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    viewers: ['usr_admin'],
    reactions: [{ userId: 'usr_admin', emoji: '⚡' }]
  },
  {
    id: 'story_3',
    authorId: 'usr_pixel',
    author: {
      id: 'usr_pixel',
      username: 'pixel_architect',
      displayName: 'Kabir Das',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isVerified: false,
      membershipTier: 'STARTER'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Almost at 100 followers! Blue tick soon! 🚀',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    viewers: [],
    reactions: []
  }
];

const initialReels: Reel[] = [
  {
    id: 'reel_1',
    authorId: 'usr_clutch',
    author: {
      id: 'usr_clutch',
      username: 'clutch_queen',
      displayName: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'QUEEN#7788',
      isVerified: true,
      membershipTier: 'PRO',
      gtId: 'GT-00102'
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-game-animation-with-neon-lights-42939-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    caption: 'Ranked season finale! 1v3 rush clutch with MP40 🔥 #FreeFireMAX #ClutchQueen #Esports',
    gameCategory: 'Free Fire MAX',
    tags: ['FreeFireMAX', 'Clutch', 'ProGamer'],
    likes: 312,
    likedBy: ['usr_admin', 'usr_shadow'],
    commentsCount: 24,
    views: 1840,
    soundTitle: 'Original Audio - GamerTube Beats',
    createdAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'reel_2',
    authorId: 'usr_shadow',
    author: {
      id: 'usr_shadow',
      username: 'shadow_sniper',
      displayName: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'SHADOW#9901',
      isVerified: true,
      membershipTier: 'ELITE',
      gtId: 'GT-00101'
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-character-walking-42721-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    caption: 'Insane 360 no-scope snipe from Georgepool tower! 🎯 900m bullet drop calculated! #BGMI #Sniper',
    gameCategory: 'BGMI',
    tags: ['BGMI', 'SniperKing', 'NoScope'],
    likes: 489,
    likedBy: ['usr_clutch', 'usr_admin'],
    commentsCount: 38,
    views: 3120,
    soundTitle: 'Cyber Trap Anthem - Synthwave',
    createdAt: '2026-10-08T20:00:00Z'
  },
  {
    id: 'reel_3',
    authorId: 'usr_pixel',
    author: {
      id: 'usr_pixel',
      username: 'pixel_architect',
      displayName: 'Kabir Das',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      gamerTag: 'KABIR#3321',
      isVerified: false,
      membershipTier: 'STARTER',
      gtId: 'GT-00103'
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-cube-with-lights-in-the-dark-43301-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    caption: 'How to build an undetectable secret vault door with 1 Redstone comparator! 🧱 #MinecraftTutorial',
    gameCategory: 'Minecraft',
    tags: ['Minecraft', 'RedstoneTutorial', 'GamerHacks'],
    likes: 198,
    likedBy: ['usr_admin'],
    commentsCount: 15,
    views: 1450,
    soundTitle: 'Lo-Fi Chill Craft - PixelVibe',
    createdAt: '2026-10-07T12:00:00Z'
  }
];

const initialCommunities: Community[] = [
  {
    id: 'comm_ff',
    name: 'Free Fire MAX India League',
    slug: 'free-fire-india',
    description: 'The official community for Free Fire MAX players, custom tournaments, guild recruitment, and clutch clips.',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    icon: '🔥',
    gameCategory: 'Free Fire MAX',
    isPrivate: false,
    membersCount: 1420,
    members: ['usr_admin', 'usr_clutch', 'usr_shadow'],
    createdBy: 'usr_admin',
    rules: [
      'No toxic toxicity or spam',
      'Guild recruitment allowed in weekly thread only',
      'Share clips with genuine gamer tag'
    ],
    announcements: ['Weekly 500-Diamond custom room tournament starts this Saturday at 7 PM!'],
    postsCount: 382
  },
  {
    id: 'comm_bgmi',
    name: 'BGMI Bootcamp & Esports Scrims',
    slug: 'bgmi-esports',
    description: 'Competitive tier 1/2 scrim registrations, zone strategy discussions, and roster announcements.',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    icon: '🎯',
    gameCategory: 'BGMI',
    isPrivate: false,
    membersCount: 2180,
    members: ['usr_admin', 'usr_shadow', 'usr_bgmi_warlord'],
    createdBy: 'usr_admin',
    rules: [
      'Verified IGLs must link their gamer tag',
      'No team poaching without prior consent',
      'Post match results with genuine screenshots'
    ],
    announcements: ['Erangel custom scrim schedule updated for Season 14.'],
    postsCount: 540
  },
  {
    id: 'comm_minecraft',
    name: 'Minecraft Builders Guild',
    slug: 'minecraft-builders',
    description: 'Share your schematics, mega builds, redstone machines, and survival realms.',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    icon: '🧱',
    gameCategory: 'Minecraft',
    isPrivate: false,
    membersCount: 940,
    members: ['usr_admin', 'usr_pixel'],
    createdBy: 'usr_pixel',
    rules: [
      'Credit texture packs and shaders',
      'No griefing on shared realm IPs',
      'Constructive feedback only'
    ],
    postsCount: 215
  },
  {
    id: 'comm_gta',
    name: 'GTA V Los Santos Heist Crew',
    slug: 'gta-v-heists',
    description: 'Find crew members for Cayo Perico, Diamond Casino, and car meet showcase.',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    icon: '🏎️',
    gameCategory: 'GTA V',
    isPrivate: false,
    membersCount: 810,
    members: ['usr_admin'],
    createdBy: 'usr_admin',
    rules: ['Fair cut distributions on heists (min 20%)', 'Mic required for stealth runs'],
    postsCount: 164
  }
];

const initialClaims: PaymentClaim[] = [
  {
    id: 'claim_demo_1',
    userId: 'usr_bgmi_warlord',
    userUsername: 'bgmi_warlord',
    userDisplayName: 'Vikram Singh',
    userGtId: 'GT-00104',
    userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    planId: 'pro',
    planName: 'PRO',
    amount: 49,
    utr: '428910375921',
    screenshotUrl: '/vgalphax-upi-qr.png',
    status: 'pending',
    createdAt: '2026-10-11T06:20:00Z'
  }
];

const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'audit_init_1',
    adminId: 'usr_admin',
    adminUsername: 'admin',
    action: 'SYSTEM_BOOTSTRAP',
    targetType: 'blue_tick',
    targetId: 'usr_shadow',
    details: 'Verified shadow_sniper automatically upon reaching 104 qualifying genuine followers threshold (rule: >= 100 followers).',
    createdAt: '2026-02-14T10:00:00Z'
  },
  {
    id: 'audit_init_2',
    adminId: 'usr_admin',
    adminUsername: 'admin',
    action: 'SYSTEM_BOOTSTRAP',
    targetType: 'blue_tick',
    targetId: 'usr_clutch',
    details: 'Verified clutch_queen automatically upon reaching 118 qualifying genuine followers threshold (rule: >= 100 followers).',
    createdAt: '2026-03-01T15:30:00Z'
  }
];

class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading db file, falling back to seeds:', e);
    }
    return {
      users: initialUsers,
      posts: initialPosts,
      stories: initialStories,
      highlights: [],
      reels: initialReels,
      messages: [],
      conversations: [
        {
          id: 'conv_1',
          participants: ['usr_admin', 'usr_shadow'],
          isGroup: false,
          updatedAt: '2026-10-10T16:00:00Z',
          lastMessage: {
            text: 'Welcome to GAMER TUBE! Scrims ready for weekend.',
            senderId: 'usr_admin',
            createdAt: '2026-10-10T16:00:00Z'
          }
        }
      ],
      notifications: [
        {
          id: 'notif_1',
          recipientId: 'usr_shadow',
          senderId: 'usr_admin',
          sender: {
            id: 'usr_admin',
            username: 'admin',
            displayName: 'Alex Vortex',
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            isVerified: true
          },
          type: 'blue_tick',
          message: 'Congratulations! You reached 100+ followers and unlocked the GAMER TUBE Blue Tick!',
          isRead: true,
          createdAt: '2026-02-14T10:00:00Z'
        }
      ],
      claims: initialClaims,
      plans: initialPlans,
      communities: initialCommunities,
      auditLogs: initialAuditLogs
    };
  }

  public save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db file:', e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Follower Calculation & Automatic Blue Tick Engine
  public recalculateVerification(userId: string): { changed: boolean; newStatus: boolean; followerCount: number } {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return { changed: false, newStatus: false, followerCount: 0 };

    // Genuine Qualifying Followers Rules:
    // 1. Exclude self-follow
    // 2. Exclude blocked users
    // 3. Exclude duplicate follower IDs
    const uniqueFollowers = Array.from(new Set(user.followers)).filter((fId) => {
      if (fId === user.id) return false;
      if (user.blockedUsers.includes(fId)) return false;
      return true;
    });

    user.followersCount = uniqueFollowers.length;
    const meetsThreshold = uniqueFollowers.length >= 100;
    let changed = false;

    if (meetsThreshold && !user.isVerified) {
      user.isVerified = true;
      user.verifiedAt = new Date().toISOString();
      changed = true;

      // Add to audit log
      this.state.auditLogs.unshift({
        id: `audit_bt_${Date.now()}`,
        adminId: 'system_engine',
        adminUsername: 'SYSTEM_VERIFIER',
        action: 'BLUE_TICK_AUTOMATIC_GRANT',
        targetType: 'blue_tick',
        targetId: user.id,
        details: `Automatic GAMER TUBE Blue Tick granted to @${user.username} (GT-ID: ${user.gtId}). Qualifying followers reached ${uniqueFollowers.length}/100.`,
        createdAt: new Date().toISOString()
      });

      // Send congratulatory notification
      this.state.notifications.unshift({
        id: `notif_bt_${Date.now()}`,
        recipientId: user.id,
        senderId: 'usr_admin',
        sender: {
          id: 'usr_admin',
          username: 'gamertube',
          displayName: 'GAMER TUBE Official',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
          isVerified: true
        },
        type: 'blue_tick',
        message: '🏆 Victory Royale! You crossed 100 genuine followers. Your official GAMER TUBE Blue Tick has been automatically activated!',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else if (!meetsThreshold && user.isVerified && user.role !== 'admin') {
      // If followers dropped below 100 (e.g. unfollows/blocks), recalculate and revoke
      user.isVerified = false;
      user.verifiedAt = undefined;
      changed = true;

      this.state.auditLogs.unshift({
        id: `audit_bt_rev_${Date.now()}`,
        adminId: 'system_engine',
        adminUsername: 'SYSTEM_VERIFIER',
        action: 'BLUE_TICK_AUTOMATIC_REVOKE',
        targetType: 'blue_tick',
        targetId: user.id,
        details: `Automatic GAMER TUBE Blue Tick revoked from @${user.username} as qualifying followers dropped to ${uniqueFollowers.length}/100.`,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return { changed, newStatus: user.isVerified, followerCount: uniqueFollowers.length };
  }
}

export const db = new Database();
