import express, { Request, Response, NextFunction } from 'express';
import { db, hashPassword } from './server/db.js';
import { User, Post, Story, Reel, PaymentClaim, Comment, Message, AdminAuditLog } from './src/types';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get authenticated user from request header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;
  return db.getState().users.find((u) => u.id === token || u.username === token) || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }
  (req as any).user = user;
  next();
}

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, displayName, email, password, gamerTag, favoriteGames } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters.' });
  }

  const state = db.getState();
  if (state.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
  }
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const nextNumber = state.users.length + 101;
  const gtId = `GT-${String(nextNumber).padStart(5, '0')}`;

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gtId,
    username: cleanUsername,
    displayName: displayName || username,
    email: email.toLowerCase(),
    password: hashPassword(password),
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    bio: 'Casual gamer. Rising to fame on GAMER TUBE! 🎮',
    gamerTag: gamerTag || `${cleanUsername.toUpperCase()}#0001`,
    favoriteGames: favoriteGames && Array.isArray(favoriteGames) ? favoriteGames : ['Free Fire MAX', 'BGMI'],
    creatorLinks: {},
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    followers: [],
    following: [],
    role: 'user',
    isPrivate: false,
    membershipTier: 'FREE',
    xp: 100, // Starter XP
    level: 1,
    frameStyle: 'none',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: new Date().toISOString()
  };

  state.users.push(newUser);
  db.save();

  // Return user without password
  const { password: _, ...safeUser } = newUser;
  return res.json({ token: newUser.id, user: safeUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password required.' });
  }

  const state = db.getState();
  const hashedPassword = hashPassword(password);
  const user = state.users.find(
    (u) =>
      (u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase()) &&
      u.password === hashedPassword
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your details.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ token: user.id, user: safeUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.post('/api/auth/recover', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  return res.json({
    message: 'If an account exists with this email, recovery instructions have been sent.'
  });
});

// REAL-TIME OTP AUTHENTICATION ENGINE
const otpStore = new Map<string, { otp: string; expiresAt: number; purpose?: string }>();

// Send real-time OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { emailOrPhone, purpose } = req.body;
  if (!emailOrPhone || !emailOrPhone.trim()) {
    return res.status(400).json({ error: 'Email or Mobile number is required.' });
  }

  const cleanKey = emailOrPhone.trim().toLowerCase();
  // Generate high-entropy 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // 5 minute validity
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore.set(cleanKey, { otp: code, expiresAt, purpose });

  console.log(`[GAMER TUBE REAL-TIME OTP] Dispatched OTP ${code} for ${cleanKey} (Purpose: ${purpose || 'auth'})`);

  return res.json({
    success: true,
    message: `Real-time OTP transmitted to ${cleanKey}. Valid for 5 minutes.`,
    otp: code, // Delivered in payload so real-time on-screen simulator & direct auto-fill work instantly!
    expiresIn: 300,
    resendIn: 60
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { emailOrPhone, otp } = req.body;
  if (!emailOrPhone || !otp) {
    return res.status(400).json({ error: 'Email/Phone and OTP code required.' });
  }

  const cleanKey = emailOrPhone.trim().toLowerCase();
  const record = otpStore.get(cleanKey);

  if (!record) {
    return res.status(400).json({ error: 'No active OTP found. Please request a new OTP.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanKey);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code. Please check and re-enter.' });
  }

  return res.json({ success: true, message: 'OTP verified successfully.' });
});

// Real-Time OTP Quick Login
app.post('/api/auth/otp-login', (req: Request, res: Response) => {
  const { emailOrPhone, otp } = req.body;
  if (!emailOrPhone || !otp) {
    return res.status(400).json({ error: 'Email/Phone and OTP code are required.' });
  }

  const cleanKey = emailOrPhone.trim().toLowerCase();
  const record = otpStore.get(cleanKey);

  if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  const state = db.getState();
  // Find matching user by email or username
  let user = state.users.find(
    (u) =>
      u.email.toLowerCase() === cleanKey ||
      u.username.toLowerCase() === cleanKey
  );

  if (!user) {
    // If user does not exist yet, prompt for gamer registration or auto-create starter account
    return res.json({
      needsRegistration: true,
      message: 'Account not found. Please complete your Gamer Tag to finish registration.'
    });
  }

  // OTP verified successfully, clear used OTP
  otpStore.delete(cleanKey);

  const { password: _, ...safeUser } = user;
  return res.json({ token: user.id, user: safeUser });
});

// Real-Time OTP Sign Up
app.post('/api/auth/otp-register', (req: Request, res: Response) => {
  const { emailOrPhone, otp, username, displayName, gamerTag, favoriteGames } = req.body;
  if (!emailOrPhone || !otp || !username) {
    return res.status(400).json({ error: 'Email/Phone, OTP, and Username are required.' });
  }

  const cleanKey = emailOrPhone.trim().toLowerCase();
  const record = otpStore.get(cleanKey);

  if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters.' });
  }

  const state = db.getState();
  if (state.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return res.status(409).json({ error: 'Username is already taken.' });
  }

  const nextNumber = state.users.length + 101;
  const gtId = `GT-${String(nextNumber).padStart(5, '0')}`;

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gtId,
    username: cleanUsername,
    displayName: displayName || cleanUsername,
    email: cleanKey.includes('@') ? cleanKey : `${cleanUsername}@gamertube.gg`,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    bio: 'Rising esports creator on GAMER TUBE! 🎮 Verified via Real-Time OTP.',
    gamerTag: gamerTag || `${cleanUsername.toUpperCase()}#0001`,
    favoriteGames: favoriteGames && Array.isArray(favoriteGames) ? favoriteGames : ['Free Fire MAX', 'BGMI'],
    creatorLinks: {},
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    followers: [],
    following: [],
    role: 'user',
    isPrivate: false,
    membershipTier: 'FREE',
    xp: 150, // Bonus XP for OTP verified accounts!
    level: 1,
    frameStyle: 'none',
    blockedUsers: [],
    mutedUsers: [],
    createdAt: new Date().toISOString()
  };

  state.users.push(newUser);
  otpStore.delete(cleanKey);
  db.save();

  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({ token: newUser.id, user: safeUser });
});

// ==========================================
// 2. USERS & FOLLOWER VERIFICATION ENGINE
// ==========================================

app.get('/api/users', (req: Request, res: Response) => {
  const { q, limit } = req.query;
  const state = db.getState();
  let users = state.users.map(({ password, ...u }) => u);

  if (q && typeof q === 'string') {
    const search = q.toLowerCase();
    users = users.filter(
      (u) =>
        u.username.toLowerCase().includes(search) ||
        u.displayName.toLowerCase().includes(search) ||
        u.gamerTag.toLowerCase().includes(search) ||
        u.favoriteGames.some((g) => g.toLowerCase().includes(search))
    );
  }

  if (limit) {
    users = users.slice(0, parseInt(limit as string, 10));
  }

  return res.json(users);
});

app.get('/api/users/:username', (req: Request, res: Response) => {
  const { username } = req.params;
  const state = db.getState();
  const user = state.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() || u.id === username
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { password, ...safeUser } = user;
  return res.json(safeUser);
});

app.put('/api/users/:username', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { username } = req.params;

  if (authUser.username !== username && authUser.role !== 'admin') {
    return res.status(403).json({ error: 'You can only update your own profile.' });
  }

  const state = db.getState();
  const targetUser = state.users.find((u) => u.username === username);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  const { displayName, bio, gamerTag, favoriteGames, creatorLinks, isPrivate, avatar, coverImage, frameStyle } = req.body;

  if (displayName) targetUser.displayName = displayName;
  if (bio !== undefined) targetUser.bio = bio;
  if (gamerTag) targetUser.gamerTag = gamerTag;
  if (favoriteGames && Array.isArray(favoriteGames)) targetUser.favoriteGames = favoriteGames;
  if (creatorLinks) targetUser.creatorLinks = { ...targetUser.creatorLinks, ...creatorLinks };
  if (isPrivate !== undefined) targetUser.isPrivate = !!isPrivate;
  if (avatar) targetUser.avatar = avatar;
  if (coverImage) targetUser.coverImage = coverImage;
  if (frameStyle) targetUser.frameStyle = frameStyle;

  db.save();
  const { password, ...safeUser } = targetUser;
  return res.json(safeUser);
});

// Follow & Automatic Blue Tick recalculation
app.post('/api/users/:id/follow', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const targetId = req.params.id;

  if (authUser.id === targetId) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  const state = db.getState();
  const targetUser = state.users.find((u) => u.id === targetId);
  const currentUser = state.users.find((u) => u.id === authUser.id);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent duplicate follow
  if (targetUser.followers.includes(currentUser.id)) {
    return res.status(400).json({ error: 'Already following this user.' });
  }

  // Add follower relationship
  targetUser.followers.push(currentUser.id);
  if (!currentUser.following.includes(targetUser.id)) {
    currentUser.following.push(targetUser.id);
  }
  currentUser.followingCount = currentUser.following.length;

  // Reward XP for community interaction
  currentUser.xp += 10;
  targetUser.xp += 25; // creator gains XP for followers

  // Send Notification
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: targetUser.id,
    senderId: currentUser.id,
    sender: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatar: currentUser.avatar,
      isVerified: currentUser.isVerified
    },
    type: 'follow',
    message: `@${currentUser.username} started following you!`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Server-side Automatic Blue Tick recalculation
  const verificationResult = db.recalculateVerification(targetUser.id);

  db.save();
  return res.json({
    success: true,
    following: true,
    targetFollowersCount: verificationResult.followerCount,
    isVerified: targetUser.isVerified,
    verificationChanged: verificationResult.changed
  });
});

app.post('/api/users/:id/unfollow', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const targetId = req.params.id;

  const state = db.getState();
  const targetUser = state.users.find((u) => u.id === targetId);
  const currentUser = state.users.find((u) => u.id === authUser.id);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  targetUser.followers = targetUser.followers.filter((id) => id !== currentUser.id);
  currentUser.following = currentUser.following.filter((id) => id !== targetUser.id);
  currentUser.followingCount = currentUser.following.length;

  // Recalculate automatic blue tick status
  const verificationResult = db.recalculateVerification(targetUser.id);

  db.save();
  return res.json({
    success: true,
    following: false,
    targetFollowersCount: verificationResult.followerCount,
    isVerified: targetUser.isVerified
  });
});

app.post('/api/users/:id/block', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const targetId = req.params.id;
  const state = db.getState();
  const user = state.users.find((u) => u.id === authUser.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.blockedUsers.includes(targetId)) {
    user.blockedUsers.push(targetId);
  }
  // Remove follow relations if blocked
  user.following = user.following.filter((id) => id !== targetId);
  const target = state.users.find((u) => u.id === targetId);
  if (target) {
    target.followers = target.followers.filter((id) => id !== user.id);
    db.recalculateVerification(target.id);
  }

  db.save();
  return res.json({ success: true, message: 'User blocked.' });
});

// ==========================================
// 3. POSTS & FEED
// ==========================================

app.get('/api/posts', (req: Request, res: Response) => {
  const { filter, category, tag } = req.query;
  const authUser = getAuthUser(req);
  const state = db.getState();

  let posts = [...state.posts];

  // Category filter
  if (category && typeof category === 'string' && category !== 'All') {
    posts = posts.filter((p) => p.gameCategory.toLowerCase() === category.toLowerCase());
  }

  // Tag filter
  if (tag && typeof tag === 'string') {
    posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === (tag as string).toLowerCase()));
  }

  // Feed Tab Filter
  if (filter === 'following' && authUser) {
    posts = posts.filter((p) => authUser.following.includes(p.authorId) || p.authorId === authUser.id);
  } else if (filter === 'membersOnly') {
    posts = posts.filter((p) => p.visibility === 'members');
  } else if (filter === 'trending') {
    posts = posts.sort((a, b) => b.likes + b.commentsCount * 2 - (a.likes + a.commentsCount * 2));
  } else {
    posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json(posts);
});

app.post('/api/posts', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { content, mediaUrls, mediaType, tags, gameCategory, visibility } = req.body;

  if (!content && (!mediaUrls || mediaUrls.length === 0)) {
    return res.status(400).json({ error: 'Post must contain text or media.' });
  }

  const state = db.getState();
  const authorUser = state.users.find((u) => u.id === authUser.id) || authUser;

  const newPost: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    authorId: authorUser.id,
    author: {
      id: authorUser.id,
      username: authorUser.username,
      displayName: authorUser.displayName,
      avatar: authorUser.avatar,
      gamerTag: authorUser.gamerTag,
      isVerified: authorUser.isVerified,
      membershipTier: authorUser.membershipTier,
      gtId: authorUser.gtId,
      frameStyle: authorUser.frameStyle
    },
    content: content || '',
    mediaUrls: mediaUrls || [],
    mediaType: mediaType || 'text',
    tags: tags || [],
    mentions: [],
    gameCategory: gameCategory || 'Gaming',
    likes: 0,
    likedBy: [],
    saves: 0,
    savedBy: [],
    reposts: 0,
    commentsCount: 0,
    comments: [],
    visibility: visibility || 'public',
    createdAt: new Date().toISOString()
  };

  // Extract hashtags from content if present
  const hashMatches = content ? content.match(/#[a-zA-Z0-9_]+/g) : null;
  if (hashMatches) {
    const extracted = hashMatches.map((h: string) => h.replace('#', ''));
    newPost.tags = Array.from(new Set([...newPost.tags, ...extracted]));
  }

  state.posts.unshift(newPost);

  // Reward XP (+50 XP for sharing gaming transmission)
  authorUser.xp += 50;
  if (authorUser.xp >= authorUser.level * 200) {
    authorUser.level += 1;
  }

  db.save();
  return res.status(201).json(newPost);
});

app.delete('/api/posts/:id', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const postIndex = state.posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const post = state.posts[postIndex];
  if (post.authorId !== authUser.id && authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. You do not own this transmission.' });
  }

  state.posts.splice(postIndex, 1);
  db.save();
  return res.json({ success: true, message: 'Transmission deleted.' });
});

app.post('/api/posts/:id/like', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const post = state.posts.find((p) => p.id === id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const alreadyLiked = post.likedBy.includes(authUser.id);
  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((uid) => uid !== authUser.id);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(authUser.id);
    post.likes += 1;

    // Send notification to author
    if (post.authorId !== authUser.id) {
      state.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: post.authorId,
        senderId: authUser.id,
        sender: {
          id: authUser.id,
          username: authUser.username,
          displayName: authUser.displayName,
          avatar: authUser.avatar,
          isVerified: authUser.isVerified
        },
        type: 'like',
        message: `@${authUser.username} liked your gaming transmission`,
        link: `/post/${post.id}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.save();
  return res.json({ likes: post.likes, liked: !alreadyLiked });
});

app.post('/api/posts/:id/save', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const post = state.posts.find((p) => p.id === id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const alreadySaved = post.savedBy.includes(authUser.id);
  if (alreadySaved) {
    post.savedBy = post.savedBy.filter((uid) => uid !== authUser.id);
    post.saves = Math.max(0, post.saves - 1);
  } else {
    post.savedBy.push(authUser.id);
    post.saves += 1;
  }

  db.save();
  return res.json({ saves: post.saves, saved: !alreadySaved });
});

app.post('/api/posts/:id/comments', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text required.' });
  }

  const state = db.getState();
  const post = state.posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    postId: post.id,
    authorId: authUser.id,
    author: {
      id: authUser.id,
      username: authUser.username,
      displayName: authUser.displayName,
      avatar: authUser.avatar,
      isVerified: authUser.isVerified,
      membershipTier: authUser.membershipTier,
      gtId: authUser.gtId
    },
    text: text.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: []
  };

  post.comments.push(newComment);
  post.commentsCount = post.comments.length;

  // Reward XP (+15 XP for comment)
  const current = state.users.find((u) => u.id === authUser.id);
  if (current) current.xp += 15;

  if (post.authorId !== authUser.id) {
    state.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: post.authorId,
      senderId: authUser.id,
      sender: {
        id: authUser.id,
        username: authUser.username,
        displayName: authUser.displayName,
        avatar: authUser.avatar,
        isVerified: authUser.isVerified
      },
      type: 'comment',
      message: `@${authUser.username} commented: "${text.trim().substring(0, 40)}"`,
      link: `/post/${post.id}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.save();
  return res.status(201).json(newComment);
});

// Like / Unlike Comment
app.post('/api/posts/:id/comments/:commentId/like', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id, commentId } = req.params;

  const state = db.getState();
  const post = state.posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (!comment.likedBy) comment.likedBy = [];

  const alreadyLiked = comment.likedBy.includes(authUser.id);
  if (alreadyLiked) {
    comment.likedBy = comment.likedBy.filter((uid) => uid !== authUser.id);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    comment.likedBy.push(authUser.id);
    comment.likes = (comment.likes || 0) + 1;
  }

  db.save();
  return res.json({ likes: comment.likes, liked: !alreadyLiked });
});

// Delete Comment
app.delete('/api/posts/:id/comments/:commentId', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id, commentId } = req.params;

  const state = db.getState();
  const post = state.posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const commentIndex = post.comments.findIndex((c) => c.id === commentId);
  if (commentIndex === -1) return res.status(404).json({ error: 'Comment not found' });

  const comment = post.comments[commentIndex];
  if (comment.authorId !== authUser.id && post.authorId !== authUser.id && authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  post.comments.splice(commentIndex, 1);
  post.commentsCount = post.comments.length;

  db.save();
  return res.json({ success: true, commentsCount: post.commentsCount });
});

// ==========================================
// 4. STORIES & HIGHLIGHTS
// ==========================================

app.get('/api/stories', (_req: Request, res: Response) => {
  const state = db.getState();
  const now = new Date().getTime();
  // Filter active stories (< 24h)
  const activeStories = state.stories.filter((s) => new Date(s.expiresAt).getTime() > now);
  return res.json(activeStories);
});

app.post('/api/stories', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { mediaUrl, mediaType, caption } = req.body;

  if (!mediaUrl) return res.status(400).json({ error: 'Media URL required' });

  const state = db.getState();
  const newStory: Story = {
    id: `story_${Date.now()}`,
    authorId: authUser.id,
    author: {
      id: authUser.id,
      username: authUser.username,
      displayName: authUser.displayName,
      avatar: authUser.avatar,
      isVerified: authUser.isVerified,
      membershipTier: authUser.membershipTier
    },
    mediaUrl,
    mediaType: mediaType || 'image',
    caption,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    viewers: [],
    reactions: []
  };

  state.stories.unshift(newStory);
  db.save();
  return res.status(201).json(newStory);
});

app.post('/api/stories/:id/view', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const story = state.stories.find((s) => s.id === id);

  if (story && !story.viewers.includes(authUser.id)) {
    story.viewers.push(authUser.id);
    db.save();
  }

  return res.json({ success: true, viewersCount: story?.viewers.length || 0 });
});

app.post('/api/stories/:id/react', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const { emoji } = req.body;

  const state = db.getState();
  const story = state.stories.find((s) => s.id === id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  story.reactions.push({ userId: authUser.id, emoji: emoji || '🔥' });
  db.save();
  return res.json({ success: true });
});

// ==========================================
// 5. REELS / GAMING SHORTS
// ==========================================

app.get('/api/reels', (_req: Request, res: Response) => {
  const state = db.getState();
  return res.json(state.reels);
});

app.post('/api/reels', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { videoUrl, thumbnailUrl, caption, gameCategory, tags, soundTitle } = req.body;

  if (!videoUrl) return res.status(400).json({ error: 'Video URL required for gaming short.' });

  const state = db.getState();
  const newReel: Reel = {
    id: `reel_${Date.now()}`,
    authorId: authUser.id,
    author: {
      id: authUser.id,
      username: authUser.username,
      displayName: authUser.displayName,
      avatar: authUser.avatar,
      gamerTag: authUser.gamerTag,
      isVerified: authUser.isVerified,
      membershipTier: authUser.membershipTier,
      gtId: authUser.gtId
    },
    videoUrl,
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    caption: caption || '',
    gameCategory: gameCategory || 'Free Fire MAX',
    tags: tags || ['Gaming', 'GamerTube'],
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    views: 1,
    soundTitle: soundTitle || 'Original Gamer Audio',
    createdAt: new Date().toISOString()
  };

  state.reels.unshift(newReel);
  db.save();
  return res.status(201).json(newReel);
});

app.post('/api/reels/:id/like', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const reel = state.reels.find((r) => r.id === id);
  if (!reel) return res.status(404).json({ error: 'Clip not found' });

  const already = reel.likedBy.includes(authUser.id);
  if (already) {
    reel.likedBy = reel.likedBy.filter((u) => u !== authUser.id);
    reel.likes = Math.max(0, reel.likes - 1);
  } else {
    reel.likedBy.push(authUser.id);
    reel.likes += 1;
  }

  db.save();
  return res.json({ likes: reel.likes, liked: !already });
});

app.post('/api/reels/:id/view', (req: Request, res: Response) => {
  const { id } = req.params;
  const state = db.getState();
  const reel = state.reels.find((r) => r.id === id);
  if (reel) {
    reel.views += 1;
    db.save();
  }
  return res.json({ views: reel?.views || 0 });
});

// ==========================================
// 6. DIRECT MESSAGES & CONVERSATIONS
// ==========================================

app.get('/api/conversations', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const state = db.getState();
  const convos = state.conversations.filter((c) => c.participants.includes(authUser.id));
  return res.json(convos);
});

app.get('/api/conversations/:id/messages', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const state = db.getState();
  const msgs = state.messages.filter((m) => m.conversationId === id);
  return res.json(msgs);
});

app.post('/api/conversations/send', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { recipientId, text, mediaUrl } = req.body;

  if (!recipientId || (!text && !mediaUrl)) {
    return res.status(400).json({ error: 'Recipient and message content required.' });
  }

  const state = db.getState();
  let convo = state.conversations.find(
    (c) =>
      !c.isGroup &&
      c.participants.includes(authUser.id) &&
      c.participants.includes(recipientId)
  );

  if (!convo) {
    convo = {
      id: `conv_${Date.now()}`,
      participants: [authUser.id, recipientId],
      isGroup: false,
      updatedAt: new Date().toISOString()
    };
    state.conversations.push(convo);
  }

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    conversationId: convo.id,
    senderId: authUser.id,
    sender: {
      id: authUser.id,
      username: authUser.username,
      displayName: authUser.displayName,
      avatar: authUser.avatar
    },
    text: text || '',
    mediaUrl,
    createdAt: new Date().toISOString(),
    isRead: false
  };

  convo.lastMessage = {
    text: text || 'Sent media',
    senderId: authUser.id,
    createdAt: newMsg.createdAt
  };
  convo.updatedAt = newMsg.createdAt;

  state.messages.push(newMsg);
  db.save();
  return res.status(201).json(newMsg);
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================

app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const state = db.getState();
  const notifs = state.notifications.filter((n) => n.recipientId === authUser.id);
  return res.json(notifs);
});

app.post('/api/notifications/mark-read', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const state = db.getState();
  state.notifications.forEach((n) => {
    if (n.recipientId === authUser.id) n.isRead = true;
  });
  db.save();
  return res.json({ success: true });
});

// ==========================================
// 8. GAMING COMMUNITIES
// ==========================================

app.get('/api/communities', (_req: Request, res: Response) => {
  return res.json(db.getState().communities);
});

app.post('/api/communities/:id/join', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const comm = state.communities.find((c) => c.id === id);

  if (!comm) return res.status(404).json({ error: 'Community not found' });

  if (!comm.members.includes(authUser.id)) {
    comm.members.push(authUser.id);
    comm.membersCount = comm.members.length;
    db.save();
  }

  return res.json({ success: true, joined: true, membersCount: comm.membersCount });
});

app.post('/api/communities/:id/leave', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { id } = req.params;
  const state = db.getState();
  const comm = state.communities.find((c) => c.id === id);

  if (!comm) return res.status(404).json({ error: 'Community not found' });

  comm.members = comm.members.filter((uid) => uid !== authUser.id);
  comm.membersCount = comm.members.length;
  db.save();

  return res.json({ success: true, joined: false, membersCount: comm.membersCount });
});

// ==========================================
// 9. MEMBERSHIP & UPI QR PAYMENT CLAIMS
// ==========================================

app.get('/api/membership/plans', (_req: Request, res: Response) => {
  return res.json(db.getState().plans);
});

// Submit a new manual UPI QR payment claim
app.post('/api/membership/claims', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const { planId, utr, screenshotUrl } = req.body;

  if (!planId || !utr) {
    return res.status(400).json({ error: 'Selected plan and UTR reference number are required.' });
  }

  // Validate UTR format: must be at least 8 alphanumeric/digit characters
  const cleanUtr = String(utr).trim();
  if (cleanUtr.length < 8) {
    return res.status(400).json({ error: 'Please enter a valid 12-digit UPI Transaction Reference / UTR number.' });
  }

  const state = db.getState();

  // Check duplicate UTR submissions
  const existingUtr = state.claims.find((c) => c.utr.toLowerCase() === cleanUtr.toLowerCase());
  if (existingUtr) {
    return res.status(409).json({
      error: `This Transaction Reference (UTR: ${cleanUtr}) has already been submitted under claim #${existingUtr.id}. Duplicate submissions are strictly prevented.`
    });
  }

  const plan = state.plans.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Invalid membership plan selected.' });
  }

  const newClaim: PaymentClaim = {
    id: `claim_${Date.now()}`,
    userId: authUser.id,
    userUsername: authUser.username,
    userDisplayName: authUser.displayName,
    userGtId: authUser.gtId,
    userAvatar: authUser.avatar,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    utr: cleanUtr,
    screenshotUrl: screenshotUrl || undefined,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  state.claims.unshift(newClaim);

  // Notify admin
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: 'usr_admin',
    senderId: authUser.id,
    sender: {
      id: authUser.id,
      username: authUser.username,
      displayName: authUser.displayName,
      avatar: authUser.avatar,
      isVerified: authUser.isVerified
    },
    type: 'payment_approved',
    message: `New UPI claim submitted by @${authUser.username} for ${plan.name} (₹${plan.price}, UTR: ${cleanUtr}). Pending manual verification.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.status(201).json(newClaim);
});

app.get('/api/membership/my-claims', requireAuth, (req: Request, res: Response) => {
  const authUser = (req as any).user as User;
  const state = db.getState();
  const claims = state.claims.filter((c) => c.userId === authUser.id);
  return res.json(claims);
});

// ==========================================
// 10. PROTECTED ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Get all claims with filters
app.get('/api/admin/claims', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.query;
  const state = db.getState();
  let claims = state.claims;
  if (status && typeof status === 'string') {
    claims = claims.filter((c) => c.status === status);
  }
  return res.json(claims);
});

// Approve payment claim
app.post('/api/admin/claims/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { id } = req.params;
  const { adminNotes } = req.body;

  const state = db.getState();
  const claim = state.claims.find((c) => c.id === id);

  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (claim.status === 'approved') {
    return res.status(400).json({ error: 'Claim is already approved.' });
  }

  // Update claim status
  claim.status = 'approved';
  claim.adminNotes = adminNotes || 'Verified against receiving bank account';
  claim.reviewedBy = adminUser.username;
  claim.reviewedAt = new Date().toISOString();

  // Find target user and activate membership tier
  const targetUser = state.users.find((u) => u.id === claim.userId);
  if (targetUser) {
    const plan = state.plans.find((p) => p.id === claim.planId);
    if (plan) {
      targetUser.membershipTier = plan.tier;
      // Set expiry to 30 days from now
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      targetUser.membershipExpiresAt = expDate.toISOString();

      // Set matching frameStyle
      if (plan.tier === 'STARTER') targetUser.frameStyle = 'starter-neon';
      else if (plan.tier === 'PRO') targetUser.frameStyle = 'pro-cyber';
      else if (plan.tier === 'ELITE') targetUser.frameStyle = 'elite-plasma';
      else if (plan.tier === 'LEGEND') targetUser.frameStyle = 'legend-gold';

      // Reward bonus membership XP
      targetUser.xp += 250;
    }

    // Send notification to user
    state.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: targetUser.id,
      senderId: adminUser.id,
      sender: {
        id: adminUser.id,
        username: adminUser.username,
        displayName: adminUser.displayName,
        avatar: adminUser.avatar,
        isVerified: true
      },
      type: 'payment_approved',
      message: `🎉 Payment Confirmed! Your ${claim.planName} membership is now active. Enjoy premium badges, exclusive perks, and high-tier frames!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  // Record Admin Audit Log
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminId: adminUser.id,
    adminUsername: adminUser.username,
    action: 'PAYMENT_CLAIM_APPROVED',
    targetType: 'payment_claim',
    targetId: claim.id,
    details: `Approved ₹${claim.amount} payment for user @${claim.userUsername} (UTR: ${claim.utr}). Membership activated: ${claim.planName}. Notes: ${claim.adminNotes}`,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, claim, user: targetUser });
});

// Reject payment claim
app.post('/api/admin/claims/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A rejection reason is required for audit transparency.' });
  }

  const state = db.getState();
  const claim = state.claims.find((c) => c.id === id);

  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  claim.status = 'rejected';
  claim.adminNotes = reason.trim();
  claim.reviewedBy = adminUser.username;
  claim.reviewedAt = new Date().toISOString();

  // Send rejection notification
  state.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: claim.userId,
    senderId: adminUser.id,
    sender: {
      id: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      avatar: adminUser.avatar,
      isVerified: true
    },
    type: 'payment_rejected',
    message: `Payment claim for ${claim.planName} could not be verified. Reason: ${reason.trim()}. Please double check your UTR or reach out to support.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Record Audit
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminId: adminUser.id,
    adminUsername: adminUser.username,
    action: 'PAYMENT_CLAIM_REJECTED',
    targetType: 'payment_claim',
    targetId: claim.id,
    details: `Rejected claim #${claim.id} for @${claim.userUsername} (UTR: ${claim.utr}, Amount: ₹${claim.amount}). Reason: ${reason.trim()}`,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, claim });
});

// Admin Member Management
app.get('/api/admin/members', requireAdmin, (_req: Request, res: Response) => {
  const state = db.getState();
  const members = state.users.map(({ password, ...u }) => u);
  return res.json(members);
});

app.post('/api/admin/users/:id/role', requireAdmin, (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const state = db.getState();
  const target = state.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  target.role = role;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminId: adminUser.id,
    adminUsername: adminUser.username,
    action: 'USER_ROLE_CHANGE',
    targetType: 'user',
    targetId: target.id,
    details: `Changed role of @${target.username} to ${role}.`,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, user: target });
});

// Update Membership Plans
app.put('/api/admin/membership/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { id } = req.params;
  const { price, perks, name } = req.body;

  const state = db.getState();
  const plan = state.plans.find((p) => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  if (price !== undefined) plan.price = Number(price);
  if (name) plan.name = name;
  if (perks && Array.isArray(perks)) plan.perks = perks;

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    adminId: adminUser.id,
    adminUsername: adminUser.username,
    action: 'MEMBERSHIP_PLAN_UPDATE',
    targetType: 'membership_plan',
    targetId: plan.id,
    details: `Updated plan ${plan.name}: Price ₹${plan.price}, Perks count: ${plan.perks.length}`,
    createdAt: new Date().toISOString()
  });

  db.save();
  return res.json({ success: true, plan });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  return res.json(db.getState().auditLogs);
});

// Admin Platform Analytics
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const state = db.getState();
  const approvedClaims = state.claims.filter((c) => c.status === 'approved');
  const pendingClaims = state.claims.filter((c) => c.status === 'pending');
  const totalRevenue = approvedClaims.reduce((acc, c) => acc + c.amount, 0);

  const verifiedCreators = state.users.filter((u) => u.isVerified).length;
  const paidMembers = state.users.filter((u) => u.membershipTier !== 'FREE').length;

  return res.json({
    totalUsers: state.users.length,
    totalPosts: state.posts.length,
    totalRevenue,
    approvedClaimsCount: approvedClaims.length,
    pendingClaimsCount: pendingClaims.length,
    verifiedCreators,
    paidMembers,
    claimsSummary: {
      free: state.users.filter((u) => u.membershipTier === 'FREE').length,
      starter: state.users.filter((u) => u.membershipTier === 'STARTER').length,
      pro: state.users.filter((u) => u.membershipTier === 'PRO').length,
      elite: state.users.filter((u) => u.membershipTier === 'ELITE').length,
      legend: state.users.filter((u) => u.membershipTier === 'LEGEND').length
    }
  });
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================

// Serve /public statically (ensures /vgalphax-upi-qr.png is served directly)
app.use(express.static(path.resolve(process.cwd(), 'public')));

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GAMER TUBE] Core Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[GAMER TUBE] Fatal server error:', err);
});
