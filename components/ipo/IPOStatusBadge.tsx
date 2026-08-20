import React from 'react';

interface IPOStatusBadgeProps {
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTMENT_PENDING' | 'ALLOTMENT_AVAILABLE' | 'LISTED' | string;
  marketType?: 'MAINBOARD' | 'SME' | string;
}

export function IPOStatusBadge({ status, marketType }: IPOStatusBadgeProps) {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'OPEN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold';
      case 'ALLOTMENT_AVAILABLE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-bold';
      case 'ALLOTMENT_PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UPCOMING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'LISTED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CLOSED':
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getLabel = (st: string) => {
    switch (st.toUpperCase()) {
      case 'ALLOTMENT_AVAILABLE':
        return 'Allotment Out 🟢';
      case 'ALLOTMENT_PENDING':
        return 'Allotment Pending';
      case 'OPEN':
        return 'OPEN NOW 🟢';
      case 'UPCOMING':
        return 'Upcoming';
      case 'LISTED':
        return 'Listed';
      case 'CLOSED':
        return 'Closed';
      default:
        return st;
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {marketType && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
          {marketType}
        </span>
      )}
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getBadgeStyle(status)}`}>
        {getLabel(status)}
      </span>
    </div>
  );
}
