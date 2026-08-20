import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { formatINR, formatPercent, formatShortDate } from '@/lib/utils/formatters';

export interface IPOCardData {
  id: string;
  name: string;
  slug: string;
  symbol: string;
  marketType: 'MAINBOARD' | 'SME' | string;
  status: string;
  priceLow: number;
  priceHigh: number;
  lotSize: number;
  minInvestment: number;
  issueSize?: string;
  openDate: string;
  closeDate: string;
  gmp?: {
    value: number;
    estimatedListing: number;
    percent: number;
    trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'NO_DATA' | string;
    confidence?: string;
  } | null;
  subscription?: {
    overall: number;
    retail?: number;
  } | null;
}

export function IPOCard({ ipo }: { ipo: IPOCardData }) {
  const gmpVal = ipo.gmp?.value ?? 0;
  const gmpPct = ipo.gmp?.percent ?? 0;
  const isPositive = gmpVal > 0;

  // Generate clean initial avatar for company logo fallback
  const companyInitial = ipo.name ? ipo.name.charAt(0).toUpperCase() : 'I';

  const getStatusBadge = () => {
    switch (ipo.status) {
      case 'OPEN':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Open</span>;
      case 'UPCOMING':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Upcoming</span>;
      case 'ALLOTMENT_AVAILABLE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">Allotment Out</span>;
      case 'LISTED':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Listed</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Closed</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
      {/* Top Row: Company Avatar + Title + Status */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center font-extrabold text-purple-700 text-sm shrink-0">
              {companyInitial}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-1 hover:text-purple-700 transition-colors">
                <Link href={`/ipos/${ipo.slug}`}>{ipo.name}</Link>
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">{ipo.marketType}</span>
                <span>•</span>
                <span>{formatShortDate(ipo.openDate)} – {formatShortDate(ipo.closeDate)}</span>
              </div>
            </div>
          </div>

          {getStatusBadge()}
        </div>

        {/* 2x3 Compact Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Price Band</span>
            <span className="font-bold text-gray-900 mt-0.5 block truncate">
              ₹{ipo.priceLow}–₹{ipo.priceHigh}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Issue Size</span>
            <span className="font-bold text-gray-800 mt-0.5 block truncate">
              {ipo.issueSize || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">GMP</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-extrabold ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
                {gmpVal > 0 ? `+₹${gmpVal}` : `₹${gmpVal}`}
              </span>
              {gmpPct !== 0 && (
                <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({formatPercent(gmpPct)})
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Subscription</span>
            <span className="font-bold text-purple-700 mt-0.5 block">
              {ipo.subscription?.overall ? `${ipo.subscription.overall}x` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Lot Size</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">
              {ipo.lotSize} Shares
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase block">Type</span>
            <span className="font-medium text-gray-700 mt-0.5 block truncate">
              {ipo.marketType}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-gray-100 text-center">
        <Link
          href={`/gmp?search=${encodeURIComponent(ipo.name)}`}
          className="py-1.5 px-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-md text-[11px] font-semibold border border-gray-200 transition-colors"
        >
          Live GMP
        </Link>
        <Link
          href={`/ipos/${ipo.slug}`}
          className="py-1.5 px-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-md text-[11px] font-semibold border border-gray-200 transition-colors"
        >
          Subscription
        </Link>
        <Link
          href={`/ipos/${ipo.slug}`}
          className="py-1.5 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-bold transition-colors flex items-center justify-center gap-0.5"
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
