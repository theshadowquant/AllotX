'use client';

import React, { useState, useEffect } from 'react';
import { ApplicantCard, ApplicantCardData } from '@/components/allotment/ApplicantCard';
import { VerificationModal } from '@/components/allotment/VerificationModal';
import { ShieldCheck, Plus, RefreshCw, UserPlus, Trash2, ExternalLink, Loader2, Sparkles, Building2 } from 'lucide-react';

interface ApplicationGroup {
  id: string;
  name: string;
  ipo: {
    id: string;
    name: string;
    symbol: string;
    registrarCode: string;
    registrarName: string;
    officialUrl: string;
  };
  applicants: ApplicantCardData[];
}

export default function MyIPOsPage() {
  const [groups, setGroups] = useState<ApplicationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Add applicant modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantPan, setNewApplicantPan] = useState('');
  const [addError, setAddError] = useState('');

  // Verification CAPTCHA modal state
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    applicantId?: string;
    applicantName?: string;
    registrarName?: string;
  }>({ isOpen: false });

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/ipo-groups');
      const json = await res.json();
      if (json.success) {
        setGroups(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch application groups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Single Applicant Refresh
  const handleRefreshApplicant = async (applicantId: string) => {
    // Optimistically set status to CHECKING
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        applicants: g.applicants.map((a) =>
          a.id === applicantId ? { ...a, status: 'CHECKING' } : a
        ),
      }))
    );

    try {
      const res = await fetch(`/api/applicants/${applicantId}/check`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        fetchGroups();
      } else {
        fetchGroups();
      }
    } catch (e) {
      console.error('Single check error:', e);
      fetchGroups();
    }
  };

  // Refresh All Applicants in Group
  const handleRefreshAll = async (groupId: string) => {
    setIsRefreshingAll(true);
    // Optimistically set status to CHECKING for all
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              applicants: g.applicants.map((a) => ({ ...a, status: 'CHECKING' })),
            }
          : g
      )
    );

    try {
      await fetch(`/api/ipo-groups/${groupId}/check-all`, {
        method: 'POST',
      });

      // Poll every 800ms for 4 iterations to update UI as queue resolves
      let count = 0;
      const interval = setInterval(() => {
        fetchGroups();
        count++;
        if (count >= 4) {
          clearInterval(interval);
          setIsRefreshingAll(false);
        }
      }, 800);
    } catch (e) {
      console.error('Batch refresh error:', e);
      setIsRefreshingAll(false);
      fetchGroups();
    }
  };

  // Add New Applicant
  const handleAddApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!selectedGroupId || !newApplicantName || !newApplicantPan) {
      setAddError('All fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          name: newApplicantName.trim(),
          pan: newApplicantPan.trim().toUpperCase(),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setAddError(json.error || 'Failed to add applicant.');
        return;
      }

      setNewApplicantName('');
      setNewApplicantPan('');
      setShowAddModal(false);
      fetchGroups();
    } catch (e: any) {
      setAddError(e.message || 'Error creating applicant.');
    }
  };

  const handleOpenVerificationModal = (applicantId: string) => {
    const applicant = groups.flatMap((g) => g.applicants).find((a) => a.id === applicantId);
    setVerificationModal({
      isOpen: true,
      applicantId,
      applicantName: applicant?.name,
      registrarName: 'KFintech',
    });
  };

  const handleVerificationSubmitted = async (code: string) => {
    if (!verificationModal.applicantId) return;
    handleRefreshApplicant(verificationModal.applicantId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold">Loading allotment tracking groups...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Multi-PAN Legitimate Registrar Enquiry Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My IPO Allotments</h1>
          <p className="text-xs text-gray-400 mt-1">
            Check allotment status for multiple PANs across KFintech, Link Intime, and Bigshare.
          </p>
        </div>
      </div>

      {/* Application Groups List */}
      {groups.length === 0 ? (
        <div className="fintech-card p-8 text-center text-gray-400 space-y-4">
          <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
          <div>
            <h3 className="font-bold text-lg text-white">No Application Groups Created</h3>
            <p className="text-xs text-gray-400 mt-1">
              Add your family or portfolio PANs to check allotment status instantly when results are declared.
            </p>
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="space-y-4">
            {/* Group Header Card */}
            <div className="fintech-card p-5 border-indigo-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{group.ipo.symbol}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400">Registrar: <strong className="text-gray-300 font-semibold">{group.ipo.registrarName}</strong></span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{group.ipo.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowAddModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-card hover:bg-card-hover border border-border text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-400" /> Add Applicant
                  </button>

                  <a
                    href={group.ipo.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white hover:bg-card rounded-lg transition-colors"
                    title="Verify on official registrar portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Applicants List */}
              <div className="space-y-3 pt-4">
                {group.applicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onRefresh={handleRefreshApplicant}
                    onOpenVerification={handleOpenVerificationModal}
                  />
                ))}
              </div>

              {/* Sticky / Group Action Footer */}
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Total Applicants: <strong className="text-white font-semibold">{group.applicants.length}</strong>
                </span>

                <button
                  onClick={() => handleRefreshAll(group.id)}
                  disabled={isRefreshingAll}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                  Refresh All ({group.applicants.length})
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add Applicant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Add Applicant to Group
            </h3>

            {addError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {addError}
              </p>
            )}

            <form onSubmit={handleAddApplicantSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Applicant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lekhan"
                  value={newApplicantName}
                  onChange={(e) => setNewApplicantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">PAN Number (10 Characters)</label>
                <input
                  type="text"
                  placeholder="e.g. CPRPT3173B"
                  value={newApplicantPan}
                  onChange={(e) => setNewApplicantPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white uppercase placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  🔒 PAN is encrypted with AES-256-GCM and masked in UI displays (`CPRPT••••B`).
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-xs font-semibold text-gray-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        applicantName={verificationModal.applicantName}
        registrarName={verificationModal.registrarName}
        onClose={() => setVerificationModal({ isOpen: false })}
        onVerifySubmit={handleVerificationSubmitted}
      />
    </div>
  );
}
