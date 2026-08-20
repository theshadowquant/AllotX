'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ApplicantCard, ApplicantCardData } from '@/components/allotment/ApplicantCard';
import { VerificationModal } from '@/components/allotment/VerificationModal';
import { ShieldCheck, Plus, RefreshCw, UserPlus, ExternalLink, Loader2 } from 'lucide-react';

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
    registrarCode?: string;
  }>({ isOpen: false });

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGroups = async (): Promise<ApplicationGroup[]> => {
    try {
      const res = await fetch('/api/ipo-groups');
      const json = await res.json();
      if (json.success) {
        setGroups(json.data);
        return json.data;
      }
    } catch (e) {
      console.error('Failed to fetch application groups:', e);
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchGroups();
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  // Single Applicant Refresh
  const handleRefreshApplicant = async (applicantId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        applicants: g.applicants.map((a) =>
          a.id === applicantId ? { ...a, status: 'CHECKING' } : a
        ),
      }))
    );

    try {
      await fetch(`/api/applicants/${applicantId}/check`, {
        method: 'POST',
      });
      fetchGroups();
    } catch (e) {
      console.error('Single check error:', e);
      fetchGroups();
    }
  };

  // ROBUST STATE-AWARE BATCH POLLING
  const handleRefreshAll = async (groupId: string) => {
    setIsRefreshingAll(true);
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

      const startTime = Date.now();
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

      pollingTimerRef.current = setInterval(async () => {
        const latestGroups = await fetchGroups();
        const targetGroup = latestGroups.find((g) => g.id === groupId);

        if (!targetGroup) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setIsRefreshingAll(false);
          return;
        }

        const stillChecking = targetGroup.applicants.some((a) => a.status === 'CHECKING');
        const elapsed = Date.now() - startTime;

        if (!stillChecking || elapsed >= 15000) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setIsRefreshingAll(false);
        }
      }, 600);
    } catch (e) {
      console.error('Batch refresh error:', e);
      setIsRefreshingAll(false);
      fetchGroups();
    }
  };

  // Add New Applicant with validation
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

  // Dynamic Registrar Resolution for Verification Modal
  const handleOpenVerificationModal = (applicantId: string) => {
    const group = groups.find((g) => g.applicants.some((a) => a.id === applicantId));
    const applicant = group?.applicants.find((a) => a.id === applicantId);

    setVerificationModal({
      isOpen: true,
      applicantId,
      applicantName: applicant?.name,
      registrarName: group?.ipo.registrarName || 'Registrar Portal',
      registrarCode: group?.ipo.registrarCode || 'KFINTECH',
    });
  };

  const handleVerificationSubmitted = async (code: string) => {
    if (!verificationModal.applicantId) return;
    handleRefreshApplicant(verificationModal.applicantId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-purple-700" />
        <span className="text-xs font-semibold">Loading My IPOs portfolio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" /> My IPO Applications
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage multi-PAN applicant portfolios and check official registrar allotment results.
          </p>
        </div>
      </div>

      {/* Application Groups */}
      {groups.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-purple-700 mx-auto opacity-80" />
          <h3 className="font-bold text-base text-gray-900">Track Your IPO Applications</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Add your family or portfolio PANs once and manage your allotment results across KFintech, Link Intime, and Bigshare from one place.
          </p>
        </div>
      ) : (
        groups.map((group) => {
          const allottedCount = group.applicants.filter((a) => a.status === 'ALLOTTED').length;
          const notAllottedCount = group.applicants.filter((a) => a.status === 'NOT_ALLOTTED').length;

          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              {/* Group Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-purple-700">{group.ipo.symbol}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">Registrar: <strong className="text-gray-800">{group.ipo.registrarName}</strong></span>
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900 mt-0.5">{group.ipo.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-700">
                    {allottedCount} Allotted • {notAllottedCount} Non Allotted
                  </span>

                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 text-gray-700 hover:text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-purple-700" /> Add PAN
                  </button>
                </div>
              </div>

              {/* Applicants List */}
              <div className="space-y-2.5">
                {group.applicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onRefresh={handleRefreshApplicant}
                    onOpenVerification={handleOpenVerificationModal}
                  />
                ))}
              </div>

              {/* Group Bottom Refresh All Button */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {group.applicants.length} Applicants in group
                </span>

                <button
                  onClick={() => handleRefreshAll(group.id)}
                  disabled={isRefreshingAll}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                  Refresh All ({group.applicants.length})
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Add Applicant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-700" /> Add Applicant PAN
            </h3>

            {addError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200">
                {addError}
              </p>
            )}

            <form onSubmit={handleAddApplicantSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Applicant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lekhan"
                  value={newApplicantName}
                  onChange={(e) => setNewApplicantName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number (10 Characters)</label>
                <input
                  type="text"
                  placeholder="e.g. CPRPT3173B"
                  value={newApplicantPan}
                  onChange={(e) => setNewApplicantPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 uppercase placeholder-gray-400 focus:outline-none focus:border-purple-600"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  🔒 Encrypted with AES-256-GCM. Displayed as (`CPRPT••••B`).
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-xs font-bold text-white transition-all shadow-sm"
                >
                  Save Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Verification Modal */}
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
