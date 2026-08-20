import React from 'react';
import { BarChart3, Info } from 'lucide-react';

interface SubscriptionData {
  retail?: number | null;
  nii?: number | null;
  qib?: number | null;
  employee?: number | null;
  shareholder?: number | null;
  overall: number;
  snapshotDay?: string | null;
  snapshotTime?: string | null;
}

export function SubscriptionCard({ data }: { data?: SubscriptionData | null }) {
  if (!data) {
    return (
      <div className="bg-white border border-gray-200 p-5 rounded-2xl text-center space-y-2 shadow-sm">
        <Info className="w-5 h-5 text-purple-700 mx-auto" />
        <h4 className="font-bold text-sm text-gray-900">Live Category Subscription</h4>
        <p className="text-xs text-gray-500">Subscription bidding figures have not yet been published for this issue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-700" /> Bidding Subscription
          </h3>
          {data.snapshotDay && (
            <span className="text-[10px] font-semibold text-purple-700 block mt-0.5">
              {data.snapshotDay} {data.snapshotTime ? `(${data.snapshotTime})` : ''}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-gray-400 uppercase block">Total Demand</span>
          <span className="font-black text-lg text-purple-700">{data.overall}x</span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-gray-600">Retail Individual (RII)</span>
            <span className="font-bold text-gray-900">{data.retail ? `${data.retail}x` : 'N/A'}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((data.retail || 0) * 5, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-gray-600">Non-Institutional (NII / HNI)</span>
            <span className="font-bold text-gray-900">{data.nii ? `${data.nii}x` : 'N/A'}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((data.nii || 0) * 5, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold mb-1">
            <span className="text-gray-600">Qualified Institutional (QIB)</span>
            <span className="font-bold text-gray-900">{data.qib ? `${data.qib}x` : 'N/A'}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((data.qib || 0) * 5, 100)}%` }}
            ></div>
          </div>
        </div>

        {data.employee !== undefined && data.employee !== null && (
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-gray-600">Employee Reservation</span>
              <span className="font-bold text-gray-900">{data.employee}x</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
