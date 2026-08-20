'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, RefreshCw, KeyRound } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  applicantName?: string;
  registrarName?: string;
  onClose: () => void;
  onVerifySubmit: (code: string) => void;
}

export function VerificationModal({
  isOpen,
  applicantName,
  registrarName = 'Registrar Portal',
  onClose,
  onVerifySubmit,
}: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onVerifySubmit(code.trim());
      setIsSubmitting(false);
      setCode('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Verification Required</h3>
            <p className="text-xs text-gray-400">
              {registrarName} security enquiry check
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Please complete the registrar verification code to check IPO allotment status for{' '}
          <strong className="text-white font-semibold">{applicantName || 'Applicant'}</strong>.
        </p>

        {/* Simulated Registrar CAPTCHA Box */}
        <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between mb-4">
          <div className="font-mono font-extrabold text-2xl tracking-widest text-indigo-400 bg-indigo-950/60 px-4 py-2 rounded border border-indigo-800/50 select-none">
            7 8 K 9 W
          </div>
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-indigo-300 flex items-center gap-1"
            title="Refresh code"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Enter verification code
            </label>
            <input
              type="text"
              placeholder="Enter text shown above..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-xs font-semibold text-gray-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
