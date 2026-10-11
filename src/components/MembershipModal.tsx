import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MembershipPlan, PaymentClaim } from '../types';
import { api } from '../services/api';
import {
  X,
  CheckCircle,
  Copy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Crown,
  Sparkles,
  ArrowRight,
  QrCode,
  Smartphone
} from 'lucide-react';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { language, t } = useLanguage();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [myClaims, setMyClaims] = useState<PaymentClaim[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'claims'>('plans');

  const UPI_ID = 'vgalphax@axl';
  const QR_IMAGE_PATH = '/vgalphax-upi-qr.png';

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [fetchedPlans, fetchedClaims] = await Promise.all([
        api.getMembershipPlans(),
        user ? api.getMyClaims() : Promise.resolve([])
      ]);
      setPlans(fetchedPlans);
      setMyClaims(fetchedClaims);
      // Default select STARTER or PRO plan
      if (fetchedPlans.length > 1 && !selectedPlan) {
        setSelectedPlan(fetchedPlans.find((p) => p.tier === 'PRO') || fetchedPlans[1]);
      }
    } catch (e) {
      console.error('Failed to load membership plans:', e);
    }
  };

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setErrorMessage('Please enter a valid 12-digit UPI Transaction Reference / UTR Number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitPaymentClaim({
        planId: selectedPlan.id,
        utr: cleanUtr,
        screenshotUrl: screenshotData || undefined
      });
      setSubmitSuccess(true);
      setUtrNumber('');
      setScreenshotData(null);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit payment claim. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#0a0d18] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.2)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gradient-to-r from-violet-950/40 via-[#0a0d18] to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>GAMER TUBE MEMBERSHIPS</span>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  UPI QR SYSTEM
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Unlock exclusive badges, animated cyber frames, members-only posts & scrim perks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-[#07090e] border border-gray-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => { setActiveTab('plans'); setSubmitSuccess(false); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'plans' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'claims' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>My Claims</span>
                {myClaims.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[10px] font-bold flex items-center justify-center">
                    {myClaims.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'claims' ? (
            /* My Claims View */
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Your Payment Claims & Verification Status</span>
              </h3>

              {myClaims.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl p-6">
                  <Clock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No payment claims submitted yet.</p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs rounded-xl"
                  >
                    View Membership Plans
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 rounded-2xl bg-[#07090e] border border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">{claim.planName}</span>
                          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                            ₹{claim.amount}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              claim.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                : claim.status === 'rejected'
                                ? 'bg-red-950 text-red-300 border border-red-500/50'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                            }`}
                          >
                            {claim.status === 'approved'
                              ? 'Active Membership'
                              : claim.status === 'rejected'
                              ? 'Rejected'
                              : 'Pending Verification'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">
                          UTR / Ref: <span className="text-gray-200 font-semibold">{claim.utr}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Submitted on {new Date(claim.createdAt).toLocaleString()}
                        </div>
                        {claim.adminNotes && (
                          <div className="mt-2 text-xs p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
                            <span className="font-bold text-gray-400">Admin Audit Note:</span>{' '}
                            {claim.adminNotes}
                          </div>
                        )}
                      </div>

                      {claim.screenshotUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={claim.screenshotUrl}
                            alt="Payment Proof"
                            className="w-16 h-16 rounded-xl object-cover border border-gray-800"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Plans & Checkout View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Plan Selection */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>1. Choose Plan</span>
                  <span className="text-cyan-400 text-[11px]">Monthly Pass</span>
                </div>

                <div className="space-y-2.5">
                  {plans
                    .filter((p) => p.tier !== 'FREE')
                    .map((plan) => {
                      const isSelected = selectedPlan?.id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => { setSelectedPlan(plan); setSubmitSuccess(false); }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.01]'
                              : 'bg-[#07090e] border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{plan.badge}</span>
                              <div>
                                <h4 className="font-extrabold text-white text-sm tracking-wide">
                                  {plan.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 uppercase tracking-tight">
                                  {plan.tier} PASS
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-amber-300 font-heading">
                                ₹{plan.price}
                              </div>
                              <div className="text-[10px] text-gray-500 leading-none">per month</div>
                            </div>
                          </div>

                          <ul className="mt-2.5 pt-2 border-t border-gray-800/80 space-y-1 text-[11px] text-gray-300">
                            {plan.perks.map((perk, i) => (
                              <li key={i} className="flex items-center gap-1.5 truncate">
                                <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                <span className="truncate">{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: UPI QR Code & Claim Form */}
              <div className="lg:col-span-7 bg-[#07090e] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-5">
                {submitSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Payment Claim Submitted!</h3>
                    <p className="text-xs text-amber-300 max-w-md mx-auto leading-relaxed font-medium bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
                      "Apna selected membership plan choose karein, QR scan karke payment karein aur transaction reference submit karein. Aapki payment admin verification ke baad confirm hogi. Verification complete hone tak membership status Pending Verification rahega."
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('claims')}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
                      >
                        View Verification Status in My Claims
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mandatory Disclaimer Message */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-violet-950/20 to-cyan-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>IMPORTANT PAYMENT INSTRUCTION</span>
                      </div>
                      <p className="italic">
                        "{t.paymentInstructions}"
                      </p>
                    </div>

                    {/* QR Code and UPI ID Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#090d18] border border-gray-800">
                      {/* Actual Uploaded QR Code */}
                      <div className="relative group p-2 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] flex-shrink-0">
                        <img
                          src={QR_IMAGE_PATH}
                          alt="Gamer Tube Official UPI QR Code"
                          className="w-36 h-36 object-contain rounded-lg"
                        />
                        <div className="text-[9px] text-gray-700 font-mono text-center font-bold mt-1">
                          SCAN IN ANY UPI APP
                        </div>
                      </div>

                      {/* Instructions & UPI ID */}
                      <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
                        <div>
                          <div className="text-xs text-gray-400">Selected Plan:</div>
                          <div className="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                            <span>{selectedPlan?.name}</span>
                            <span className="text-amber-400 text-lg">₹{selectedPlan?.price}</span>
                          </div>
                        </div>

                        {/* UPI ID Box with Copy */}
                        <div>
                          <div className="text-[11px] text-gray-400 mb-1">Official Receiver UPI ID:</div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl bg-gray-950 border border-cyan-500/40 font-mono text-cyan-300 font-bold text-xs select-all">
                              {UPI_ID}
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copied ? t.copied : t.copyUpi}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-gray-400 pt-1">
                          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Supports GPay, PhonePe, Paytm, BHIM, Cred, Cred UPI</span>
                        </div>
                      </div>
                    </div>

                    {/* Claim Submission Form */}
                    <form onSubmit={handleSubmitClaim} className="space-y-4">
                      {errorMessage && (
                        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-medium">
                          {errorMessage}
                        </div>
                      )}

                      {/* UTR Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          {t.utrLabel} <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          placeholder={t.utrPlaceholder}
                          className="w-full px-4 py-2.5 bg-[#090d18] border border-gray-800 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          Found in your UPI app payment receipt (e.g., UTR / UPI Ref ID / Transaction ID).
                        </span>
                      </div>

                      {/* Optional Screenshot Upload */}
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          {t.screenshotOptional}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#090d18] border border-dashed border-gray-700 hover:border-cyan-400/60 rounded-xl cursor-pointer text-xs text-gray-400 hover:text-white transition-colors">
                            <Upload className="w-4 h-4 text-cyan-400" />
                            <span>{screenshotData ? 'Change Screenshot' : 'Upload Payment Receipt'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>

                          {screenshotData && (
                            <div className="relative group w-12 h-12 rounded-xl overflow-hidden border border-cyan-400/50">
                              <img
                                src={screenshotData}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setScreenshotData(null)}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Security Verification Notice */}
                      <div className="text-[11px] text-gray-400 flex items-start gap-2 bg-[#090d18] p-3 rounded-xl border border-gray-800/80">
                        <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p>{t.adminReviewNotice}</p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedPlan}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-600 text-white font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Claim to Admin...</span>
                          </>
                        ) : (
                          <>
                            <span>{t.submitClaim}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
