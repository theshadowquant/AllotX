import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { IPOStatusBadge } from '@/components/ipo/IPOStatusBadge';
import { GMPChart } from '@/components/ipo/GMPChart';
import { SubscriptionCard } from '@/components/ipo/SubscriptionCard';
import {
  Calendar,
  Building2,
  DollarSign,
  PieChart,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IPODetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const ipo = await db.iPO.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      registrar: true,
      gmpHistory: {
        orderBy: { recordedAt: 'asc' },
      },
      subscription: {
        orderBy: { recordedAt: 'desc' },
      },
    },
  });

  if (!ipo) {
    notFound();
  }

  const latestGMP = ipo.gmpHistory.length > 0 ? ipo.gmpHistory[ipo.gmpHistory.length - 1] : null;
  const latestSub = ipo.subscription.length > 0 ? ipo.subscription[0] : null;

  const gmpVal = latestGMP?.gmp ?? 0;
  const upperPrice = ipo.priceHigh;
  const estimatedListing = Math.round(upperPrice + gmpVal);
  const gmpPercent = parseFloat(((gmpVal / upperPrice) * 100).toFixed(2));

  const gmpChartData = ipo.gmpHistory.map((item) => ({
    date: new Date(item.recordedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    }),
    gmp: item.gmp,
    estimatedListing: item.estimatedListing,
    gmpPercent: item.gmpPercent,
    trend: item.trend,
    confidence: item.confidence,
  }));

  const formatDate = (d?: Date | null) => {
    if (!d) return 'TBA';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fintech-card p-6 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">{ipo.symbol}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-400 font-medium">{ipo.marketType} IPO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{ipo.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <IPOStatusBadge status={ipo.status} marketType={ipo.marketType} />
            <Link
              href={`/my-ipos`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Check Allotment
            </Link>
          </div>
        </div>

        {/* PROMINENT GMP SUMMARY BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Live GMP</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-400">
                {gmpVal > 0 ? `+₹${gmpVal}` : `₹${gmpVal}`}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                (+{gmpPercent}%)
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">Unofficial market premium</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/30">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Estimated Listing Price</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">₹{estimatedListing}</span>
            <span className="text-[10px] text-gray-400 mt-1 block">Upper Price (₹{upperPrice}) + GMP</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-border">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">IPO Price Band</span>
            <span className="text-xl font-bold text-gray-100 mt-1 block">₹{ipo.priceLow} - ₹{ipo.priceHigh}</span>
            <span className="text-[10px] text-gray-400 mt-1 block">Face Value: ₹{ipo.faceValue}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-border">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Min Investment</span>
            <span className="text-xl font-bold text-indigo-300 mt-1 block">₹{ipo.minInvestment.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-400 mt-1 block">1 Lot ({ipo.lotSize} Shares)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: GMP Chart & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GMPChart data={gmpChartData} upperPrice={upperPrice} currentGMP={gmpVal} />

          {/* Important Issue Details */}
          <div className="fintech-card p-5">
            <h4 className="font-bold text-base text-gray-100 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> Issue Details & Structure
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Issue Size</span>
                <span className="font-bold text-gray-100 text-sm">{ipo.issueSize}</span>
              </div>
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Fresh Issue</span>
                <span className="font-bold text-gray-100 text-sm">{ipo.freshIssue || 'N/A'}</span>
              </div>
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Offer for Sale (OFS)</span>
                <span className="font-bold text-gray-100 text-sm">{ipo.ofs || 'N/A'}</span>
              </div>
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Retail Lot Size</span>
                <span className="font-bold text-gray-100 text-sm">{ipo.lotSize} Shares</span>
              </div>
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Face Value</span>
                <span className="font-bold text-gray-100 text-sm">₹{ipo.faceValue} per share</span>
              </div>
              <div className="p-3 bg-card/60 rounded-lg border border-border/40">
                <span className="text-gray-400 block mb-1">Official Registrar</span>
                <span className="font-bold text-indigo-300 text-sm">{ipo.registrar.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Subscriptions & Timetable */}
        <div className="space-y-6">
          <SubscriptionCard data={latestSub} />

          {/* Timetable Card */}
          <div className="fintech-card p-5 space-y-3">
            <h4 className="font-bold text-base text-gray-100 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Important IPO Timeline
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-gray-400">IPO Opens</span>
                <span className="font-bold text-gray-200">{formatDate(ipo.openDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-gray-400">IPO Closes</span>
                <span className="font-bold text-gray-200">{formatDate(ipo.closeDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40 bg-indigo-500/10 px-2 rounded">
                <span className="text-indigo-300 font-semibold">Basis of Allotment</span>
                <span className="font-extrabold text-indigo-300">{formatDate(ipo.allotmentDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-gray-400">Unblocking / Refunds</span>
                <span className="font-semibold text-gray-300">{formatDate(ipo.refundDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-gray-400">Demat Account Credit</span>
                <span className="font-semibold text-gray-300">{formatDate(ipo.dematDate)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Listing Date</span>
                <span className="font-bold text-emerald-400">{formatDate(ipo.listingDate)}</span>
              </div>
            </div>

            {/* Official Registrar External Action */}
            <a
              href={ipo.registrar.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2.5 px-4 rounded-xl border border-border bg-card/80 hover:bg-card text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              Verify on {ipo.registrar.code} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
