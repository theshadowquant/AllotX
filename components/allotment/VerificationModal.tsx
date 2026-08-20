import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  applicantName?: string;
  registrarName?: string;
  onClose: () => void;
  onVerifySubmit: (captchaCode: string) => void;
}

export function VerificationModal({
  isOpen,
  applicantName,
  registrarName = 'KFintech',
  onClose,
  onVerifySubmit,
}: VerificationModalProps) {
  const [captchaInput, setCaptchaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaInput.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onVerifySubmit(captchaInput.trim());
      setIsSubmitting(false);
      setCaptchaInput('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-700" />
            <h3 className="font-bold text-base text-gray-900">Verification Required</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          The official registrar portal (<strong className="text-purple-700">{registrarName}</strong>) requires user verification to return allotment details for <strong className="text-gray-900">{applicantName}</strong>.
        </p>

        {/* Mock CAPTCHA Challenge UI */}
        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Registrar Verification Challenge</span>

          <div className="bg-white p-3 rounded-lg border border-purple-200 flex items-center justify-between">
            <span className="font-mono font-black text-xl tracking-widest text-purple-900 select-none">
              8 7 B K 2
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              {registrarName} Security
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <input
              type="text"
              placeholder="Enter 5-character security code..."
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600"
              required
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Submit & Check Allotment'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-[10px] text-gray-500">
          🔒 Verification codes are submitted directly to the registrar's enquiry session. AllotX never circumvents registrar security.
        </p>
      </div>
    </div>
  );
}
