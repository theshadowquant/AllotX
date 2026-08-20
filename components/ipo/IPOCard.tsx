import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { IPOStatusBadge } from './IPOStatusBadge';

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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const renderTrendBadge = () => {
    if (trend === 'RISING') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" /> Positive GMP Trend
        </span>
      );
    }
    if (trend === 'FALLING') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" /> Declining GMP Trend
        </span>
      );
    }
    if (trend === 'VOLATILE') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Volatile Sentiment
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded border border-gray-700/50">
        <Minus className="w-3.5 h-3.5" /> Stable GMP
      </span>
    );
  };

  return (
    <Link
      href={`/ipos/${ipo.slug}`}
      className="fintech-card p-5 block group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
    >
      {/* Top Bar: Title & Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {ipo.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{ipo.symbol}</p>
        </div>
        <IPOStatusBadge status={ipo.status} marketType={ipo.marketType} />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 bg-card/60 p-3 rounded-xl border border-border/60 mb-4">
        <div>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">GMP</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`font-extrabold text-lg ${isPositive ? 'text-emerald-400' : 'text-gray-300'}`}>
              {gmpVal > 0 ? `+₹${gmpVal}` : gmpVal === 0 ? '₹0' : `-₹${Math.abs(gmpVal)}`}
            </span>
            {gmpPct !== 0 && (
              <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({gmpPct > 0 ? `+${gmpPct}%` : `${gmpPct}%`})
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">Estimated Listing</span>
          <span className="font-extrabold text-lg text-gray-100 mt-0.5 block">
            ₹{estimatedListing}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">IPO Price Band</span>
          <span className="font-semibold text-sm text-gray-200 mt-0.5 block">
            ₹{ipo.priceLow} - ₹{ipo.priceHigh}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">Subscription</span>
          <span className="font-extrabold text-sm text-indigo-300 mt-0.5 block">
            {ipo.subscription?.overall ? `${ipo.subscription.overall}×` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Footer: Dates & Trend */}
      <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
        <div className="text-gray-400">
          <span className="mr-3">Opens: <strong className="text-gray-200 font-semibold">{formatDate(ipo.openDate)}</strong></span>
          <span>Closes: <strong className="text-gray-200 font-semibold">{formatDate(ipo.closeDate)}</strong></span>
        </div>

        {renderTrendBadge()}
      </div>
    </Link>
  );
}
