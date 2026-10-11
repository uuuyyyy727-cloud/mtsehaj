import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }) => Promise<void>;
  loginWithOtp: (emailOrPhone: string, otp: string) => Promise<{ needsRegistration?: boolean }>;
  registerWithOtp: (payload: {
    emailOrPhone: string;
    otp: string;
    username: string;
    displayName?: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }) => Promise<void>;
  sendOtp: (emailOrPhone: string, purpose?: string) => Promise<{ success: boolean; message: string; otp: string; expiresIn: number; resendIn: number }>;
  logout: () => void;
  switchUser: (username: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  followUser: (targetId: string) => Promise<void>;
  unfollowUser: (targetId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('gamertube_token');
      if (!token) {
        // Automatically default to demo user "shadow_sniper" or "admin" if no session
        const users = await api.getUsers();
        if (users.length > 0) {
          const defaultUser = users.find((u) => u.username === 'shadow_sniper') || users[0];
          localStorage.setItem('gamertube_token', defaultUser.id);
          setUser(defaultUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
    } catch (e) {
      console.warn('Auth check failed:', e);
      // Fallback: load shadow_sniper
      try {
        const users = await api.getUsers();
        const defaultUser = users.find((u) => u.username === 'shadow_sniper') || users[0];
        if (defaultUser) {
          localStorage.setItem('gamertube_token', defaultUser.id);
          setUser(defaultUser);
        }
      } catch (err) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const data = await api.login(identifier, password);
    localStorage.setItem('gamertube_token', data.token);
    setUser(data.user);
  };

  const register = async (payload: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }) => {
    const data = await api.register(payload);
    localStorage.setItem('gamertube_token', data.token);
    setUser(data.user);
  };

  const sendOtp = async (emailOrPhone: string, purpose?: string) => {
    return await api.sendOtp(emailOrPhone, purpose);
  };

  const loginWithOtp = async (emailOrPhone: string, otp: string) => {
    const data = await api.otpLogin(emailOrPhone, otp);
    if (data.token && data.user) {
      localStorage.setItem('gamertube_token', data.token);
      setUser(data.user);
      return { needsRegistration: false };
    }
    return { needsRegistration: true };
  };

  const registerWithOtp = async (payload: {
    emailOrPhone: string;
    otp: string;
    username: string;
    displayName?: string;
    gamerTag?: string;
    favoriteGames?: string[];
  }) => {
    const data = await api.otpRegister(payload);
    localStorage.setItem('gamertube_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('gamertube_token');
    setUser(null);
  };

  const switchUser = async (username: string) => {
    setIsLoading(true);
    try {
      const targetUser = await api.getUser(username);
      localStorage.setItem('gamertube_token', targetUser.id);
      setUser(targetUser);
    } catch (e) {
      console.error('Failed to switch user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (targetId: string) => {
    if (!user) return;
    try {
      await api.followUser(targetId);
      await refreshUser();
    } catch (e) {
      console.error('Failed to follow:', e);
    }
  };

  const unfollowUser = async (targetId: string) => {
    if (!user) return;
    try {
      await api.unfollowUser(targetId);
      await refreshUser();
    } catch (e) {
      console.error('Failed to unfollow:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithOtp,
        registerWithOtp,
        sendOtp,
        logout,
        switchUser,
        refreshUser,
        followUser,
        unfollowUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
