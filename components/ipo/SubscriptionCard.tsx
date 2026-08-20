import React from 'react';
import { Users } from 'lucide-react';

interface SubscriptionData {
  overall: number;
  retail: number;
  nii: number;
  qib: number;
  employee?: number | null;
  shareholder?: number | null;
  snapshotDay?: string | null;
  snapshotTime?: string | null;
}

export function SubscriptionCard({ data }: { data?: SubscriptionData | null }) {
  if (!data) {
    return (
      <div className="fintech-card p-5">
        <h4 className="font-bold text-base text-gray-100 flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-indigo-400" /> Subscription Data
        </h4>
        <p className="text-sm text-gray-400">Subscription data pending or not published yet.</p>
      </div>
    );
  }

  const categories = [
    { label: 'Retail', value: data.retail, color: 'bg-emerald-500' },
    { label: 'NII (HNI)', value: data.nii, color: 'bg-indigo-500' },
    { label: 'QIB', value: data.qib, color: 'bg-blue-500' },
    ...(data.employee !== undefined && data.employee !== null
      ? [{ label: 'Employee', value: data.employee, color: 'bg-purple-500' }]
      : []),
    ...(data.shareholder !== undefined && data.shareholder !== null
      ? [{ label: 'Shareholder', value: data.shareholder, color: 'bg-amber-500' }]
      : []),
  ];

  return (
    <div className="fintech-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="font-bold text-base text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Subscription Statistics
          </h4>
          {data.snapshotDay && (
            <p className="text-xs text-gray-400 mt-0.5">
              Snapshot: <strong className="text-gray-300 font-medium">{data.snapshotDay}</strong> ({data.snapshotTime || 'Latest'})
            </p>
          )}
        </div>

        <div className="text-right bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          <span className="text-[10px] font-medium text-indigo-300 uppercase tracking-wider block">Overall</span>
          <span className="text-lg font-extrabold text-indigo-400">
            {data.overall}×
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">{cat.label}</span>
              <span className="text-gray-100 font-bold">{cat.value}×</span>
            </div>

            <div className="h-2 w-full bg-card/90 rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full ${cat.color} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, (cat.value / Math.max(data.overall, 1)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
