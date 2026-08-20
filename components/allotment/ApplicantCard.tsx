'use client';

import React from 'react';
import { RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface ApplicantCardData {
  id: string;
  name: string;
  panMasked: string;
  status: 'PENDING' | 'CHECKING' | 'ALLOTTED' | 'NOT_ALLOTTED' | 'ERROR' | 'CAPTCHA_REQUIRED' | 'TEMPORARILY_UNAVAILABLE' | string;
  sharesAllotted: number;
  lotsAllotted: number;
  applicationNumber?: string | null;
  verificationSource?: string | null;
  lastCheckedAt?: string | null;
  lastErrorMessage?: string | null;
  officialUrl?: string | null;
}

interface ApplicantCardProps {
  applicant: ApplicantCardData;
  onRefresh: (applicantId: string) => void;
  onOpenVerification?: (applicantId: string) => void;
}

export function ApplicantCard({ applicant, onRefresh, onOpenVerification }: ApplicantCardProps) {
  const isChecking = applicant.status === 'CHECKING';
  const isAllotted = applicant.status === 'ALLOTTED';
  const isNotAllotted = applicant.status === 'NOT_ALLOTTED';
  const isError = applicant.status === 'ERROR' || applicant.status === 'TEMPORARILY_UNAVAILABLE';
  const isCaptcha = applicant.status === 'CAPTCHA_REQUIRED';

  const formatLastChecked = (isoStr?: string | null) => {
    if (!isoStr) return 'Not checked yet';
    try {
      const d = new Date(isoStr);
      return `Last checked: ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Recently checked';
    }
  };

  const renderStatusBadge = () => {
    if (isChecking) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
        </span>
      );
    }

    if (isAllotted) {
      return (
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {applicant.sharesAllotted} Shares Allotted
          </span>
          {applicant.applicationNumber && (
            <p className="text-[10px] text-emerald-500/80 font-mono mt-0.5">
              App #{applicant.applicationNumber}
            </p>
          )}
        </div>
      );
    }

    if (isNotAllotted) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" /> Non Allotted
        </span>
      );
    }

    if (isCaptcha) {
      return (
        <button
          onClick={() => onOpenVerification && onOpenVerification(applicant.id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Verification Required
        </button>
      );
    }

    if (isError) {
      return (
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Unable to Verify
          </span>
          <p className="text-[10px] text-amber-400/80 mt-0.5">
            {applicant.lastErrorMessage || 'Registrar temporarily unavailable'}
          </p>
        </div>
      );
    }

    return (
      <span className="text-xs font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
        Pending Check
      </span>
    );
  };

  return (
    <div className="fintech-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-indigo-500">
      {/* Left Details */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-base text-gray-100">{applicant.name}</h4>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-card/90 text-gray-400 border border-border/80">
            {applicant.panMasked}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{formatLastChecked(applicant.lastCheckedAt)}</span>
          {applicant.verificationSource && (
            <span className="text-gray-500 border-l border-gray-800 pl-3 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-gray-400" /> Checked via{' '}
              <strong className="text-gray-300 font-semibold">{applicant.verificationSource}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Right Status & Refresh Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        {renderStatusBadge()}

        <div className="flex items-center gap-1.5">
          {applicant.officialUrl && (
            <a
              href={applicant.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-card rounded-lg transition-colors"
              title="Verify on official registrar portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onRefresh(applicant.id)}
            disabled={isChecking}
            className={`p-2 rounded-lg text-gray-300 hover:text-white hover:bg-card border border-border/60 transition-colors ${
              isChecking ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/50'
            }`}
            title="Refresh single applicant status"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
