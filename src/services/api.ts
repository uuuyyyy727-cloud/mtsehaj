import {
  User,
  Post,
  Story,
  Reel,
  Conversation,
  Message,
  NotificationItem,
  PaymentClaim,
  MembershipPlan,
  Community,
  AdminAuditLog
} from '../types';

class ApiService {
  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('gamertube_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Auth
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  }

  async register(payload: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Not logged in');
    return data;
  }

  // Real-Time OTP Methods
  async sendOtp(emailOrPhone: string, purpose?: string): Promise<{ success: boolean; message: string; otp: string; expiresIn: number; resendIn: number }> {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, purpose })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  }

  async verifyOtp(emailOrPhone: string, otp: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');
    return data;
  }

  async otpLogin(emailOrPhone: string, otp: string): Promise<{ token?: string; user?: User; needsRegistration?: boolean; message?: string }> {
    const res = await fetch('/api/auth/otp-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login with OTP');
    return data;
  }

  async otpRegister(payload: {
    emailOrPhone: string;
    otp: string;
    username: string;
    displayName?: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/otp-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register with OTP');
    return data;
  }

  // Users
  async getUsers(q?: string, limit?: number): Promise<User[]> {
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (limit) query.set('limit', limit.toString());
    const res = await fetch(`/api/users?${query.toString()}`);
    return res.json();
  }

  async getUser(username: string): Promise<User> {
    const res = await fetch(`/api/users/${username}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'User not found');
    return data;
  }

  async updateProfile(username: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${username}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  }

  async followUser(userId: string): Promise<{
    success: boolean;
    following: boolean;
    targetFollowersCount: number;
    isVerified: boolean;
    verificationChanged: boolean;
  }> {
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to follow user');
    return data;
  }

  async unfollowUser(userId: string): Promise<{
    success: boolean;
    following: boolean;
    targetFollowersCount: number;
    isVerified: boolean;
  }> {
    const res = await fetch(`/api/users/${userId}/unfollow`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unfollow user');
    return data;
  }

  async blockUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/users/${userId}/block`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Posts
  async getPosts(filter?: string, category?: string, tag?: string): Promise<Post[]> {
    const query = new URLSearchParams();
    if (filter) query.set('filter', filter);
    if (category) query.set('category', category);
    if (tag) query.set('tag', tag);
    const res = await fetch(`/api/posts?${query.toString()}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async createPost(post: {
    content: string;
    mediaUrls?: string[];
    mediaType?: 'text' | 'image' | 'video' | 'carousel';
    tags?: string[];
    gameCategory?: string;
    visibility?: 'public' | 'followers' | 'members';
  }): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(post)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data;
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async likePost(id: string): Promise<{ likes: number; liked: boolean }> {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async savePost(id: string): Promise<{ saves: number; saved: boolean }> {
    const res = await fetch(`/api/posts/${id}/save`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async addComment(id: string, text: string): Promise<any> {
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to comment');
    return data;
  }

  async likeComment(id: string, commentId: string): Promise<{ likes: number; liked: boolean }> {
    const res = await fetch(`/api/posts/${id}/comments/${commentId}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async deleteComment(id: string, commentId: string): Promise<{ success: boolean; commentsCount: number }> {
    const res = await fetch(`/api/posts/${id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Stories
  async getStories(): Promise<Story[]> {
    const res = await fetch('/api/stories');
    return res.json();
  }

  async createStory(payload: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
  }): Promise<Story> {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  async viewStory(id: string): Promise<{ success: boolean; viewersCount: number }> {
    const res = await fetch(`/api/stories/${id}/view`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async reactStory(id: string, emoji: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/stories/${id}/react`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ emoji })
    });
    return res.json();
  }

  // Reels
  async getReels(): Promise<Reel[]> {
    const res = await fetch('/api/reels');
    return res.json();
  }

  async createReel(payload: Partial<Reel>): Promise<Reel> {
    const res = await fetch('/api/reels', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload clip');
    return data;
  }

  async likeReel(id: string): Promise<{ likes: number; liked: boolean }> {
    const res = await fetch(`/api/reels/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async viewReel(id: string): Promise<{ views: number }> {
    const res = await fetch(`/api/reels/${id}/view`, {
      method: 'POST'
    });
    return res.json();
  }

  // Messages
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async sendMessage(payload: {
    recipientId: string;
    text: string;
    mediaUrl?: string;
  }): Promise<Message> {
    const res = await fetch('/api/conversations/send', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async markNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Communities
  async getCommunities(): Promise<Community[]> {
    const res = await fetch('/api/communities');
    return res.json();
  }

  async joinCommunity(id: string): Promise<{ success: boolean; joined: boolean; membersCount: number }> {
    const res = await fetch(`/api/communities/${id}/join`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async leaveCommunity(id: string): Promise<{ success: boolean; joined: boolean; membersCount: number }> {
    const res = await fetch(`/api/communities/${id}/leave`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Membership & UPI QR Claims
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const res = await fetch('/api/membership/plans');
    return res.json();
  }

  async submitPaymentClaim(payload: {
    planId: string;
    utr: string;
    screenshotUrl?: string;
  }): Promise<PaymentClaim> {
    const res = await fetch('/api/membership/claims', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit payment claim');
    return data;
  }

  async getMyClaims(): Promise<PaymentClaim[]> {
    const res = await fetch('/api/membership/my-claims', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Admin Dashboard
  async getAdminClaims(status?: string): Promise<PaymentClaim[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`/api/admin/claims${query}`, {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin claims');
    return data;
  }

  async approveClaim(id: string, adminNotes?: string): Promise<{ success: boolean; claim: PaymentClaim; user: User }> {
    const res = await fetch(`/api/admin/claims/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ adminNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve claim');
    return data;
  }

  async rejectClaim(id: string, reason: string): Promise<{ success: boolean; claim: PaymentClaim }> {
    const res = await fetch(`/api/admin/claims/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject claim');
    return data;
  }

  async getAdminMembers(): Promise<User[]> {
    const res = await fetch('/api/admin/members', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async setUserRole(userId: string, role: 'user' | 'admin'): Promise<any> {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role })
    });
    return res.json();
  }

  async updateMembershipPlan(id: string, updates: { price?: number; name?: string; perks?: string[] }): Promise<any> {
    const res = await fetch(`/api/admin/membership/plans/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  }

  async getAdminAuditLogs(): Promise<AdminAuditLog[]> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/admin/stats', {
      headers: this.getHeaders()
    });
    return res.json();
  }
}

export const api = new ApiService();
