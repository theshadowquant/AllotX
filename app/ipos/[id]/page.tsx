import React from 'react';
import { notFound } from 'not-found' in 'next/navigation' ? require('next/navigation') : { notFound: () => {} };
import { db } from '@/lib/db';
import { IPOStatusBadge } from '@/components/ipo/IPOStatusBadge';
import { GMPChart } from '@/components/ipo/GMPChart';
import { SubscriptionCard } from '@/components/ipo/SubscriptionCard';
import { Calendar, Building2, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';
import { formatINR, formatPercent, formatShortDate, formatEventDate } from '@/lib/utils/formatters';

export const revalidate = 0;

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IPODetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  let ipo: any = null;
  try {
    ipo = await db.iPO.findFirst({
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
  } catch (e) {
    console.error('Error fetching IPO detail:', e);
  }

  if (!ipo) {
    return (
      <div className="bg-[#111827] border border-[#1F293D] p-8 rounded-xl text-center space-y-3">
        <h2 className="text-xl font-bold text-white">IPO Record Not Found</h2>
        <p className="text-xs text-gray-400">The requested IPO details could not be loaded.</p>
        <Link href="/ipos" className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">
          Back to IPO Directory
        </Link>
      </div>
    );
  }

  const latestGMP = ipo.gmpHistory.length > 0 ? ipo.gmpHistory[ipo.gmpHistory.length - 1] : null;
  const latestSub = ipo.subscription.length > 0 ? ipo.subscription[0] : null;

  const gmpVal = latestGMP?.gmp ?? 0;
  const upperPrice = ipo.priceHigh;
  const estimatedListing = Math.round(upperPrice + gmpVal);
  const gmpPercent = parseFloat(((gmpVal / upperPrice) * 100).toFixed(2));

  const gmpChartData = ipo.gmpHistory.map((item: any) => ({
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

  return (
    <div className="space-y-6">
      {/* 1. IPO Header */}
      <div className="bg-[#111827] border border-[#1F293D] p-5 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">{ipo.symbol}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-400">{ipo.marketType} IPO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{ipo.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <IPOStatusBadge status={ipo.status} marketType={ipo.marketType} />
            <Link
              href="/my-ipos"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Check Allotment
            </Link>
          </div>
        </div>

        {/* 2. Prominent GMP Hero Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#090D16] p-3.5 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Live GMP</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-400">
                {gmpVal > 0 ? `+₹${gmpVal}` : `₹${gmpVal}`}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                ({formatPercent(gmpPercent)})
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Unofficial market sentiment</span>
          </div>

          <div className="bg-[#090D16] p-3.5 rounded-lg border border-indigo-500/30">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Estimated Listing</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{formatINR(estimatedListing)}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Upper Price (₹{upperPrice}) + GMP</span>
          </div>

          <div className="bg-[#090D16] p-3.5 rounded-lg border border-[#1F293D]">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Price Band</span>
            <span className="text-base font-bold text-gray-200 mt-0.5 block">₹{ipo.priceLow} – ₹{ipo.priceHigh}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Face Value: ₹{ipo.faceValue}</span>
          </div>

          <div className="bg-[#090D16] p-3.5 rounded-lg border border-[#1F293D]">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Min Investment</span>
            <span className="text-base font-bold text-indigo-300 mt-0.5 block">{formatINR(ipo.minInvestment)}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">1 Lot ({ipo.lotSize} Shares)</span>
          </div>
        </div>
      </div>

      {/* 3. Grid: GMP Chart & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GMPChart data={gmpChartData} upperPrice={upperPrice} currentGMP={gmpVal} />

          {/* Issue Details Grid */}
          <div className="bg-[#111827] border border-[#1F293D] p-4 rounded-xl">
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> IPO Information & Structure
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Issue Size</span>
                <span className="font-bold text-gray-100">{ipo.issueSize}</span>
              </div>
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Fresh Issue</span>
                <span className="font-bold text-gray-100">{ipo.freshIssue || 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Offer for Sale (OFS)</span>
                <span className="font-bold text-gray-100">{ipo.ofs || 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Lot Size</span>
                <span className="font-bold text-gray-100">{ipo.lotSize} Shares</span>
              </div>
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Face Value</span>
                <span className="font-bold text-gray-100">₹{ipo.faceValue}</span>
              </div>
              <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F293D]">
                <span className="text-gray-400 block mb-0.5">Official Registrar</span>
                <span className="font-bold text-indigo-300">{ipo.registrar.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Subscriptions & Timetable */}
        <div className="space-y-6">
          <SubscriptionCard data={latestSub} />

          {/* Timeline Card */}
          <div className="bg-[#111827] border border-[#1F293D] p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-indigo-400" /> Important Timeline
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1F293D]">
                <span className="text-gray-400">IPO Opens</span>
                <span className="font-semibold text-gray-200">{formatEventDate(ipo.openDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F293D]">
                <span className="text-gray-400">IPO Closes</span>
                <span className="font-semibold text-gray-200">{formatEventDate(ipo.closeDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F293D] bg-indigo-500/10 px-2 rounded">
                <span className="text-indigo-300 font-semibold">Basis of Allotment</span>
                <span className="font-bold text-indigo-300">{formatEventDate(ipo.allotmentDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F293D]">
                <span className="text-gray-400">Refunds / Unblocking</span>
                <span className="font-semibold text-gray-300">{formatEventDate(ipo.refundDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F293D]">
                <span className="text-gray-400">Demat Credit</span>
                <span className="font-semibold text-gray-300">{formatEventDate(ipo.dematDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Listing Date</span>
                <span className="font-bold text-emerald-400">{formatEventDate(ipo.listingDate)}</span>
              </div>
            </div>

            {/* Official Registrar Action Link */}
            <a
              href={ipo.registrar.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2 px-3 rounded-lg border border-[#1F293D] bg-[#090D16] hover:bg-[#1F293D] text-xs font-semibold text-gray-200 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              Verify on {ipo.registrar.name} <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
