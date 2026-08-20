import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { IPOStatusBadge } from './IPOStatusBadge';
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
  const estimatedListing = ipo.gmp?.estimatedListing ?? ipo.priceHigh;
  const trend = ipo.gmp?.trend ?? 'STABLE';
  const isPositive = gmpVal > 0;

  const renderTrendBadge = () => {
    if (trend === 'RISING') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" /> GMP Rising
        </span>
      );
    }
    if (trend === 'FALLING') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
          <TrendingDown className="w-3.5 h-3.5" /> GMP Falling
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
        <Minus className="w-3.5 h-3.5" /> Stable
      </span>
    );
  };

  return (
    <Link
      href={`/ipos/${ipo.slug}`}
      className="bg-[#111827] border border-[#1F293D] rounded-xl p-4 block hover:border-gray-600 transition-colors group"
    >
      {/* Top Row: Title, Market Tag, Status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {ipo.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <span className="text-[11px] text-gray-400 font-mono">{ipo.symbol}</span>
        </div>
        <IPOStatusBadge status={ipo.status} marketType={ipo.marketType} />
      </div>

      {/* Main Dominant Metrics Box */}
      <div className="grid grid-cols-2 gap-2 bg-[#090D16]/80 p-3 rounded-lg border border-[#1F293D] mb-3">
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">GMP</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`font-extrabold text-base ${isPositive ? 'text-emerald-400' : 'text-gray-200'}`}>
              {gmpVal > 0 ? `+₹${gmpVal}` : `₹${gmpVal}`}
            </span>
            {gmpPct !== 0 && (
              <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({formatPercent(gmpPct)})
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Estimated Listing</span>
          <span className="font-extrabold text-base text-white mt-0.5 block">
            {formatINR(estimatedListing)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Price Band</span>
          <span className="font-semibold text-xs text-gray-300 mt-0.5 block">
            ₹{ipo.priceLow} – ₹{ipo.priceHigh}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Subscription</span>
          <span className="font-bold text-xs text-indigo-300 mt-0.5 block">
            {ipo.subscription?.overall ? `${ipo.subscription.overall}×` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Footer: Dates & Trend */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#1F293D]/60">
        <div>
          <span>{formatShortDate(ipo.openDate)} – {formatShortDate(ipo.closeDate)}</span>
        </div>

        {renderTrendBadge()}
      </div>
    </Link>
  );
}
