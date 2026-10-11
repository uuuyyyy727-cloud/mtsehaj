import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentClaim, User, MembershipPlan, AdminAuditLog } from '../types';
import { api } from '../services/api';
import { AvatarWithFrame } from './AvatarWithFrame';
import { BlueTickBadge } from './BlueTickBadge';
import { MembershipBadge } from './MembershipBadge';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Search,
  Eye,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Award
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'claims' | 'members' | 'audit' | 'plans' | 'reports'>('claims');
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Claim Review Modals & Forms
  const [selectedClaim, setSelectedClaim] = useState<PaymentClaim | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimFilter, setClaimFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [memberSearch, setMemberSearch] = useState('');
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [claimFilter]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [fetchedClaims, fetchedMembers, fetchedPlans, fetchedLogs, fetchedStats] = await Promise.all([
        api.getAdminClaims(claimFilter === 'all' ? undefined : claimFilter),
        api.getAdminMembers(),
        api.getMembershipPlans(),
        api.getAdminAuditLogs(),
        api.getAdminStats()
      ]);
      setClaims(fetchedClaims);
      setMembers(fetchedMembers);
      setPlans(fetchedPlans);
      setAuditLogs(fetchedLogs);
      setStats(fetchedStats);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-[#07090e] min-h-[60vh] flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">ACCESS DENIED</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md">
          This area is restricted to GAMER TUBE platform administrators. Please sign in with an authorized administrator account.
        </p>
      </div>
    );
  }

  const handleApprove = async (claimId: string) => {
    setIsProcessing(true);
    try {
      await api.approveClaim(claimId, approvalNote || 'Confirmed against bank account credit statement');
      setSelectedClaim(null);
      setApprovalNote('');
      await loadAdminData();
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Error approving claim');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason for transparency.');
      return;
    }
    setIsProcessing(true);
    try {
      await api.rejectClaim(claimId, rejectionReason.trim());
      setSelectedClaim(null);
      setRejectionReason('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Error rejecting claim');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleToggle = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (confirm(`Change role of @${targetUser.username} to ${newRole}?`)) {
      await api.setUserRole(targetUser.id, newRole);
      await loadAdminData();
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.gtId.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#0d1222] to-amber-950/30 border border-red-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-wide font-heading">
                GAMER TUBE SECURE ADMIN CONSOLE
              </h1>
              <span className="text-[10px] font-mono font-bold bg-red-900/80 text-red-300 border border-red-500/50 px-2 py-0.5 rounded-full">
                ROOT PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Logged in as <strong className="text-cyan-400">@{user.username}</strong> ({user.gtId}). All actions are audited.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Verified Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-heading">
              ₹{stats.totalRevenue}
            </div>
            <span className="text-[10px] text-gray-500">From {stats.approvedClaimsCount} approved claims</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Pending Claims</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-heading">
              {stats.pendingClaimsCount}
            </div>
            <span className="text-[10px] text-gray-500">Awaiting bank check</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Verified Creators</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 font-heading">
              {stats.verifiedCreators}
            </div>
            <span className="text-[10px] text-gray-500">Auto Blue Tick (100+ followers)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d18] border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Paid Members</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-black text-violet-400 font-heading">
              {stats.paidMembers}
            </div>
            <span className="text-[10px] text-gray-500">Starter, Pro, Elite, Legend</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'claims'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>UPI Payment Claims ({claims.filter((c) => c.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members & Blue Tick Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Membership Plans Config</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: PAYMENT CLAIMS WORKFLOW */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setClaimFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    claimFilter === filter
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Showing <span className="font-bold text-white">{claims.length}</span> claims
            </div>
          </div>

          {/* Claims Queue Table */}
          {claims.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-800 rounded-3xl">
              <Clock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No payment claims in this category.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#090d18] border border-gray-800 hover:border-gray-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <AvatarWithFrame
                      avatarUrl={claim.userAvatar}
                      displayName={claim.userDisplayName}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {claim.userDisplayName}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">@{claim.userUsername}</span>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                          {claim.userGtId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {claim.planName} • ₹{claim.amount}
                        </span>
                        <span className="font-mono text-cyan-300">
                          UTR: <strong className="text-white select-all">{claim.utr}</strong>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            claim.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : claim.status === 'rejected'
                              ? 'bg-red-950 text-red-300 border border-red-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 mt-1">
                        Claim ID: #{claim.id} • Submitted: {new Date(claim.createdAt).toLocaleString()}
                        {claim.reviewedBy && (
                          <span className="text-gray-400 ml-2">
                            • Reviewed by @{claim.reviewedBy}
                          </span>
                        )}
                      </div>

                      {claim.adminNotes && (
                        <div className="mt-2 text-xs p-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-300">
                          <strong className="text-gray-400">Audit Note:</strong> {claim.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Proof */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {claim.screenshotUrl && (
                      <button
                        onClick={() => setViewScreenshot(claim.screenshotUrl!)}
                        className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white border border-gray-700 text-xs flex items-center gap-1"
                        title="View Receipt Screenshot"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Receipt</span>
                      </button>
                    )}

                    {claim.status === 'pending' && (
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Review Claim</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBERS & 100-FOLLOWER BLUE TICK AUDIT */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search member by username, name, or GT-ID..."
                className="w-full pl-9 pr-4 py-2 bg-[#090d18] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#090d18]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0e1322] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">GT-ID</th>
                  <th className="p-3">Followers</th>
                  <th className="p-3">Blue Tick Status</th>
                  <th className="p-3">Membership</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-3 flex items-center gap-2">
                      <AvatarWithFrame
                        avatarUrl={m.avatar}
                        displayName={m.displayName}
                        size="xs"
                        frameStyle={m.frameStyle}
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1">
                          <span>{m.displayName}</span>
                          {m.isVerified && <BlueTickBadge size="sm" />}
                        </div>
                        <span className="text-[10px] text-gray-400">@{m.username}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-cyan-400 font-bold">{m.gtId}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{m.followersCount}</div>
                      <div className="text-[10px] text-gray-500">
                        {m.followersCount >= 100 ? 'Eligible (≥100)' : `${m.followersCount}/100`}
                      </div>
                    </td>
                    <td className="p-3">
                      {m.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                          <CheckCircle className="w-3 h-3 text-cyan-400" />
                          <span>Active Blue Tick</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Unverified ({100 - m.followersCount} needed)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <MembershipBadge tier={m.membershipTier} size="sm" showLabel />
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          m.role === 'admin'
                            ? 'bg-red-950 text-red-300 border border-red-500/50'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRoleToggle(m)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] font-semibold text-gray-200"
                      >
                        Toggle {m.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP PLANS CONFIG */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 rounded-2xl bg-[#090d18] border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{plan.badge}</span>
                <span className="font-extrabold text-white text-sm">{plan.name}</span>
              </div>
              <div className="text-xl font-black text-amber-300 font-heading">
                ₹{plan.price} / month
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                {plan.perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 truncate">
                    <span className="text-cyan-400">•</span>
                    <span className="truncate">{p}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  const newPrice = prompt(`Enter new monthly price in ₹ for ${plan.name}:`, String(plan.price));
                  if (newPrice !== null && !isNaN(Number(newPrice))) {
                    await api.updateMembershipPlan(plan.id, { price: Number(newPrice) });
                    await loadAdminData();
                  }
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200"
              >
                Change Price
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 mb-2">
            Immutable system audit trail tracking payment reviews, automatic blue tick events, and security adjustments.
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#090d18] border border-gray-800/80 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{log.action}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-cyan-300">by @{log.adminUsername}</span>
                  </div>
                  <p className="text-gray-300 mt-0.5 font-sans text-xs">{log.details}</p>
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap self-end sm:self-center">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLAIM DECISION MODAL */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0d1222] border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Verify Payment Claim #{selectedClaim.id}</span>
              </h3>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">User:</span>
                <span className="font-bold text-white">
                  @{selectedClaim.userUsername} ({selectedClaim.userGtId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="font-bold text-amber-400">{selectedClaim.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-black text-white">₹{selectedClaim.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction UTR:</span>
                <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 select-all">
                  {selectedClaim.utr}
                </span>
              </div>
            </div>

            {/* Admin Audit Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Internal Audit Note (Optional for approval, mandatory for rejection):
              </label>
              <textarea
                rows={2}
                value={approvalNote || rejectionReason}
                onChange={(e) => {
                  setApprovalNote(e.target.value);
                  setRejectionReason(e.target.value);
                }}
                placeholder="e.g. Verified in AXIS / HDFC bank statement ending in 4022..."
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(selectedClaim.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-950/60 text-red-300 border border-red-500/50 hover:bg-red-900 text-xs font-bold transition-all disabled:opacity-50"
              >
                Reject Claim
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleApprove(selectedClaim.id)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                Approve & Activate Membership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT PREVIEW MODAL */}
      {viewScreenshot && (
        <div
          onClick={() => setViewScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh] bg-[#07090e] border border-gray-700 rounded-2xl overflow-hidden p-2">
            <img src={viewScreenshot} alt="Full Receipt" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="text-center text-xs text-gray-400 mt-2">Click anywhere to close</div>
          </div>
        </div>
      )}
    </div>
  );
};
