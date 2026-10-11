import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GamerTubeLogo } from './GamerTubeLogo';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  Smartphone,
  KeyRound,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Gamepad2,
  Dice5,
  Zap,
  Radio
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithOtp, registerWithOtp, sendOtp, switchUser } = useAuth();
  const { t } = useLanguage();

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'request_otp' | 'verify_otp' | 'complete_profile'>('request_otp');

  // OTP State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [liveOtpNotification, setLiveOtpNotification] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Profile completion state for new OTP users
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newGamerTag, setNewGamerTag] = useState('');
  const [newFavoriteGame, setNewFavoriteGame] = useState('Free Fire MAX');

  // Password State
  const [passwordMode, setPasswordMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // AI Gamer Tag Generator
  const generateAiGamerTag = () => {
    const prefixes = ['Vortex', 'Shadow', 'Clutch', 'Neon', 'Titan', 'Ghost', 'Cyber', 'Apex'];
    const suffixes = ['Slayer', 'Sniper', 'King', 'Reaper', 'God', 'Hunter', 'Ace', 'Phantom'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const tagNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${randomPrefix}${randomSuffix}#${tagNum}`;
    setNewGamerTag(generated);
    if (!newUsername) {
      setNewUsername(`${randomPrefix.toLowerCase()}_${randomSuffix.toLowerCase()}`);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await sendOtp(emailOrPhone.trim());
      setSuccessMessage(res.message);
      setLiveOtpNotification(res.otp);
      setCountdown(res.resendIn || 60);
      setStep('verify_otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch real-time OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit numeric OTP code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginWithOtp(emailOrPhone.trim(), otpCode.trim());
      if (res.needsRegistration) {
        // New user needs Gamer Tag setup
        generateAiGamerTag();
        setStep('complete_profile');
      } else {
        // Successfully logged in
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setErrorMessage('Username is required.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await registerWithOtp({
        emailOrPhone: emailOrPhone.trim(),
        otp: otpCode.trim(),
        username: newUsername.trim(),
        displayName: newDisplayName.trim() || newUsername.trim(),
        gamerTag: newGamerTag.trim() || `${newUsername.toUpperCase()}#0001`,
        favoriteGames: [newFavoriteGame]
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (passwordMode === 'login') {
        await login(identifier, password);
      } else {
        await register({
          username: identifier.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          displayName: identifier,
          email: `${identifier.toLowerCase()}@gamertube.gg`,
          password,
          gamerTag: `${identifier.toUpperCase()}#0001`
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#060912] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-4 my-auto relative overflow-hidden">
        {/* Esports Glowing Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-fuchsia-500 animate-pulse" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <GamerTubeLogo size="sm" />
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50 flex items-center gap-1 font-bold">
              <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" />
              <span>REAL-TIME OTP ENGINE</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Received OTP Simulation Banner */}
        {liveOtpNotification && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Simulated SMS/Email: Your OTP code is <strong className="font-mono text-white text-sm tracking-wider">{liveOtpNotification}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(liveOtpNotification)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-extrabold text-[11px] hover:bg-emerald-400 transition-all flex-shrink-0 shadow"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Method Switcher Tabs (Real-Time OTP vs Classic Password) */}
        <div className="flex items-center bg-[#030509] border border-gray-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setStep('request_otp');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'otp'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Real-Time OTP (Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'password'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Gamer Password</span>
          </button>
        </div>

        {/* Error / Feedback alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && !errorMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs font-medium">
            {successMessage}
          </div>
        )}

        {/* ======================================================== */}
        {/* FLOW 1: REAL-TIME OTP AUTHENTICATION */}
        {/* ======================================================== */}
        {authMethod === 'otp' && (
          <div>
            {/* STEP 1: Enter Email / Mobile */}
            {step === 'request_otp' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="e.g. gamer@gmail.com or +91 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-[#030509] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    A real-time 6-digit cryptographic security code will be generated.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-black font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Transmitting Real-Time OTP...</span>
                  ) : (
                    <>
                      <span>Transmit Instant OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter & Verify 6-digit OTP */}
            {step === 'verify_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Transmitted to: <strong className="text-white font-mono">{emailOrPhone}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setStep('request_otp'); setLiveOtpNotification(null); }}
                    className="text-cyan-400 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">
                    Enter 6-Digit Verification PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full pl-11 pr-4 py-3 bg-[#030509] border border-cyan-500/50 rounded-xl text-center text-lg tracking-[0.5em] font-mono text-cyan-300 placeholder-gray-700 focus:outline-none focus:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Resend code in: <strong className="font-mono text-cyan-300">{countdown}s</strong>
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendOtp}
                    className="text-cyan-400 hover:underline disabled:opacity-40 disabled:hover:no-underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isLoading ? 'Verifying Security Token...' : 'Verify OTP & Authorize Session'}
                </button>
              </form>
            )}

            {/* STEP 3: First-Time User Profile Completion */}
            {step === 'complete_profile' && (
              <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/40 text-xs text-violet-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span>OTP Verified! Complete your unique Gamer Identity to join the network.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-300">Gamer Tag</label>
                    <button
                      type="button"
                      onClick={generateAiGamerTag}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Dice5 className="w-3.5 h-3.5" />
                      <span>AI Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newGamerTag}
                    onChange={(e) => setNewGamerTag(e.target.value)}
                    placeholder="e.g. VORTEX#1337"
                    className="w-full px-3 py-2 bg-[#030509] border border-gray-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. clutch_master"
                    className="w-full px-3 py-2 bg-[#030509] border border-gray-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full px-3 py-2 bg-[#030509] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Primary Game</label>
                  <select
                    value={newFavoriteGame}
                    onChange={(e) => setNewFavoriteGame(e.target.value)}
                    className="w-full px-3 py-2 bg-[#030509] border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Free Fire MAX">Free Fire MAX</option>
                    <option value="BGMI">BGMI</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="GTA V">GTA V</option>
                    <option value="Valorant">Valorant</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {isLoading ? 'Creating Gamer Profile...' : 'Complete Account (+150 Bonus XP)'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FLOW 2: STANDARD PASSWORD LOGIN */}
        {/* ======================================================== */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-xs">
              <span className="text-gray-400">
                {passwordMode === 'login' ? 'Sign In with Credentials' : 'Create Account with Password'}
              </span>
              <button
                type="button"
                onClick={() => setPasswordMode(passwordMode === 'login' ? 'register' : 'login')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Switch to {passwordMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. shadow_sniper or admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#030509] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#030509] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {isLoading ? 'Authenticating...' : passwordMode === 'login' ? 'Sign In Transmission' : 'Register Account'}
            </button>
          </form>
        )}

        {/* Demo Fast Login Switcher */}
        <div className="pt-3 border-t border-gray-800/80">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between font-bold">
            <span>Instant Demo Switchers:</span>
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { switchUser('admin'); onClose(); }}
              className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-900/60 transition-colors flex items-center gap-1.5"
            >
              <span>👑</span>
              <span>Alex Vortex (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => { switchUser('shadow_sniper'); onClose(); }}
              className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
            >
              <span>🎯</span>
              <span>Rohan (104 Verified)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
