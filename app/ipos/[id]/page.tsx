import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
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
      <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center space-y-3 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">IPO Record Not Found</h2>
        <p className="text-xs text-gray-500">The requested IPO details could not be loaded.</p>
        <Link href="/ipos" className="inline-block px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">
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
      <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-700 uppercase">{ipo.symbol}</span>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500">{ipo.marketType} IPO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">{ipo.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {ipo.status}
            </span>
            <Link
              href="/my-ipos"
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" /> Check Allotment
            </Link>
          </div>
        </div>

        {/* 2. Prominent GMP Hero Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Live GMP</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-600">
                {gmpVal > 0 ? `+₹${gmpVal}` : `₹${gmpVal}`}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ({formatPercent(gmpPercent)})
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Unofficial market sentiment</span>
          </div>

          <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Estimated Listing</span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">{formatINR(estimatedListing)}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Upper Price (₹{upperPrice}) + GMP</span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Price Band</span>
            <span className="text-base font-bold text-gray-900 mt-0.5 block">₹{ipo.priceLow} – ₹{ipo.priceHigh}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Face Value: ₹{ipo.faceValue}</span>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Min Investment</span>
            <span className="text-base font-bold text-purple-700 mt-0.5 block">{formatINR(ipo.minInvestment)}</span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">1 Lot ({ipo.lotSize} Shares)</span>
          </div>
        </div>
      </div>

      {/* 3. Grid: GMP Chart & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GMPChart data={gmpChartData} upperPrice={upperPrice} currentGMP={gmpVal} />

          {/* Issue Details Grid */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" /> IPO Information & Structure
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Issue Size</span>
                <span className="font-bold text-gray-900">{ipo.issueSize}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Fresh Issue</span>
                <span className="font-bold text-gray-900">{ipo.freshIssue || 'N/A'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Offer for Sale (OFS)</span>
                <span className="font-bold text-gray-900">{ipo.ofs || 'N/A'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Lot Size</span>
                <span className="font-bold text-gray-900">{ipo.lotSize} Shares</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Face Value</span>
                <span className="font-bold text-gray-900">₹{ipo.faceValue}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 block mb-0.5">Official Registrar</span>
                <span className="font-bold text-purple-700">{ipo.registrar.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Subscriptions & Timetable */}
        <div className="space-y-6">
          <SubscriptionCard data={latestSub} />

          {/* Timeline Card */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-700" /> Important Timeline
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">IPO Opens</span>
                <span className="font-semibold text-gray-800">{formatEventDate(ipo.openDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">IPO Closes</span>
                <span className="font-semibold text-gray-800">{formatEventDate(ipo.closeDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 bg-purple-50 px-2 rounded-lg">
                <span className="text-purple-700 font-semibold">Basis of Allotment</span>
                <span className="font-extrabold text-purple-700">{formatEventDate(ipo.allotmentDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Refunds / Unblocking</span>
                <span className="font-semibold text-gray-700">{formatEventDate(ipo.refundDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Demat Credit</span>
                <span className="font-semibold text-gray-700">{formatEventDate(ipo.dematDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Listing Date</span>
                <span className="font-bold text-emerald-600">{formatEventDate(ipo.listingDate)}</span>
              </div>
            </div>

            {/* Official Registrar Action Link */}
            <a
              href={ipo.registrar.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2 px-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-colors"
            >
              Verify on {ipo.registrar.name} <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
