import React from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Clock, ExternalLink } from 'lucide-react';

export interface ApplicantCardData {
  id: string;
  name: string;
  panMasked: string;
  status: 'PENDING' | 'CHECKING' | 'ALLOTTED' | 'NOT_ALLOTTED' | 'ERROR' | 'CAPTCHA_REQUIRED' | 'TEMPORARILY_UNAVAILABLE' | string;
  sharesAllotted: number;
  lotsAllotted: number;
  verificationSource?: string | null;
  lastCheckedAt?: string | null;
  lastErrorMessage?: string | null;
}

interface ApplicantCardProps {
  applicant: ApplicantCardData;
  onRefresh: (id: string) => void;
  onOpenVerification: (id: string) => void;
}

export function ApplicantCard({ applicant, onRefresh, onOpenVerification }: ApplicantCardProps) {
  const isChecking = applicant.status === 'CHECKING';

  const renderStatusBadge = () => {
    switch (applicant.status) {
      case 'ALLOTTED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{applicant.sharesAllotted} Shares Allotted ({applicant.lotsAllotted} Lot)</span>
          </div>
        );

      case 'NOT_ALLOTTED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Non Allotted</span>
          </div>
        );

      case 'CHECKING':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-700" />
            <span>Checking Registrar...</span>
          </div>
        );

      case 'CAPTCHA_REQUIRED':
        return (
          <button
            onClick={() => onOpenVerification(applicant.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 hover:bg-purple-200 text-xs font-bold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
            <span>Verification Required (Solve)</span>
          </button>
        );

      case 'TEMPORARILY_UNAVAILABLE':
      case 'ERROR':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{applicant.lastErrorMessage || 'Registrar Temporarily Unavailable'}</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Pending Check</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
          {applicant.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-gray-900">{applicant.name}</h4>
            <span className="font-mono text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
              {applicant.panMasked}
            </span>
          </div>
          {applicant.lastCheckedAt && (
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Checked via {applicant.verificationSource || 'Registrar'} • {new Date(applicant.lastCheckedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0">
        {renderStatusBadge()}

        <button
          onClick={() => onRefresh(applicant.id)}
          disabled={isChecking}
          aria-label="Refresh allotment status"
          className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-purple-700 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
