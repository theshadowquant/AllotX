import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { runAutomatedDataIngestion } from '@/lib/ingestion/ingestionOrchestrator';
import { IPOCard } from '@/components/ipo/IPOCard';
import {
  TrendingUp,
  Layers,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  BarChart3,
  UserCheck,
  ChevronRight,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { formatINR, formatPercent, formatShortDate } from '@/lib/utils/formatters';

export const revalidate = 0;

interface HomePageProps {
  searchParams: Promise<{
    tab?: string;
    market?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activeTab = params.tab || 'CURRENT';
  const activeMarket = params.market || 'ALL';
  const now = new Date();
  const nowTs = now.getTime();

  let ipos: any[] = [];
  let userGroups: any[] = [];

  try {
    ipos = await db.iPO.findMany({
      include: {
        registrar: true,
        gmpHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 2,
        },
        subscription: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { openDate: 'desc' },
    });

    if (ipos.length === 0) {
      console.log('🌱 Cold-start auto-bootstrap triggered: Ingesting live NSE data...');
      await runAutomatedDataIngestion();

      ipos = await db.iPO.findMany({
        include: {
          registrar: true,
          gmpHistory: {
            orderBy: { recordedAt: 'desc' },
            take: 2,
          },
          subscription: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { openDate: 'desc' },
      });
    }

    userGroups = await db.iPOApplicationGroup.findMany({
      take: 2,
      include: {
        ipo: true,
        applicants: true,
      },
    });
  } catch (error) {
    console.error('Database query error on HomePage:', error);
    ipos = [];
    userGroups = [];
  }

  const formattedIPOs = ipos.map((ipo) => {
    const latestGMP = ipo.gmpHistory?.[0] || null;
    const prevGMP = ipo.gmpHistory?.[1] || null;
    const latestSub = ipo.subscription?.[0] || null;
    const gmpVal = latestGMP?.gmp ?? 0;
    const prevVal = prevGMP?.gmp ?? gmpVal;
    const absChange = gmpVal - prevVal;

    return {
      id: ipo.id,
      name: ipo.name,
      slug: ipo.slug,
      symbol: ipo.symbol,
      marketType: ipo.marketType,
      status: ipo.status,
      priceLow: ipo.priceLow,
      priceHigh: ipo.priceHigh,
      lotSize: ipo.lotSize,
      minInvestment: ipo.minInvestment,
      issueSize: ipo.issueSize,
      openDate: ipo.openDate?.toISOString ? ipo.openDate.toISOString() : new Date().toISOString(),
      closeDate: ipo.closeDate?.toISOString ? ipo.closeDate.toISOString() : new Date().toISOString(),
      allotmentDate: ipo.allotmentDate?.toISOString ? ipo.allotmentDate.toISOString() : null,
      listingDate: ipo.listingDate?.toISOString ? ipo.listingDate.toISOString() : null,
      gmp: latestGMP
        ? {
            value: gmpVal,
            absChange,
            estimatedListing: latestGMP.estimatedListing,
            percent: latestGMP.gmpPercent,
            trend: latestGMP.trend,
            confidence: latestGMP.confidence,
          }
        : null,
      subscription: latestSub ? { overall: latestSub.overall } : null,
    };
  });

  // Strict Date-based Classification Helpers
  const isCurrentOpen = (item: typeof formattedIPOs[0]) => {
    const openTs = new Date(item.openDate).getTime();
    const closeTs = new Date(item.closeDate).getTime();
    const listingTs = item.listingDate ? new Date(item.listingDate).getTime() : null;
    return openTs <= nowTs && nowTs <= closeTs && (!listingTs || nowTs < listingTs);
  };

  const isUpcoming = (item: typeof formattedIPOs[0]) => {
    const openTs = new Date(item.openDate).getTime();
    return openTs > nowTs;
  };

  const isClosed = (item: typeof formattedIPOs[0]) => {
    const closeTs = new Date(item.closeDate).getTime();
    const listingTs = item.listingDate ? new Date(item.listingDate).getTime() : null;
    return closeTs < nowTs && (!listingTs || nowTs < listingTs);
  };

  // Calculate live database counts for "TODAY ON ALLOTX" Hero Card
  const openCount = formattedIPOs.filter(isCurrentOpen).length;
  const upcomingCount = formattedIPOs.filter(isUpcoming).length;
  const allotmentPendingCount = formattedIPOs.filter(
    (i) => i.status === 'ALLOTMENT_PENDING' || i.status === 'ALLOTMENT_AVAILABLE'
  ).length;
  const totalTrackedCount = formattedIPOs.length;

  // Filter IPOs based on status tab and market type
  let filteredIPOs = formattedIPOs;

  if (activeTab === 'CURRENT') {
    filteredIPOs = filteredIPOs.filter(isCurrentOpen);
  } else if (activeTab === 'UPCOMING') {
    filteredIPOs = filteredIPOs.filter(isUpcoming);
  } else if (activeTab === 'CLOSED') {
    filteredIPOs = filteredIPOs.filter(isClosed);
  }

  if (activeMarket !== 'ALL') {
    filteredIPOs = filteredIPOs.filter((i) => i.marketType === activeMarket);
  }

  const openIPOsList = formattedIPOs.filter(isCurrentOpen);
  const closedIPOsList = formattedIPOs.filter(isClosed);

  return (
    <div className="space-y-10 pb-10">
      {/* 1. HERO SECTION */}
      <section className="bg-purple-50/70 border border-purple-100 rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-200 shadow-sm text-xs font-bold text-purple-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>India's Live IPO Intelligence Dashboard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              India's IPO hub for <span className="text-purple-700">GMP</span>, <span className="text-purple-700">subscription</span> & allotment
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
              Track open and upcoming IPOs, live grey market premiums, subscription bidding data, and check allotment results across multiple family PAN applications.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/my-ipos"
                className="px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-700/20 flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Check IPO Allotment
              </Link>
              <Link
                href="/gmp"
                className="px-5 py-3 rounded-xl bg-white hover:bg-purple-50 text-gray-800 font-bold text-sm border border-gray-300 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-purple-700" /> Live IPO GMP
              </Link>
              <Link
                href="/ipos"
                className="px-4 py-3 rounded-xl bg-white hover:bg-purple-50 text-gray-700 font-semibold text-sm border border-gray-200 transition-colors"
              >
                IPO Screener
              </Link>
            </div>

            {/* Trust Labels */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-3 border-t border-purple-100/80">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free for retail investors</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mainboard & SME IPOs</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Official registrar links</span>
            </div>
          </div>

          {/* Right Column: "TODAY ON ALLOTX" Live Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> TODAY ON ALLOTX
                </span>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Live Data
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-800">Open for subscription</span>
                  </div>
                  <span className="font-black text-lg text-emerald-700">{openCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-800">Upcoming IPOs</span>
                  </div>
                  <span className="font-black text-lg text-blue-700">{upcomingCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-gray-800">Awaiting allotment</span>
                  </div>
                  <span className="font-black text-lg text-purple-700">{allotmentPendingCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-800">IPOs tracked</span>
                  </div>
                  <span className="font-black text-lg text-gray-900">{totalTrackedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IPO STATUS NAVIGATION TABS & MARKET FILTER */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start">
            <Link
              href={`/?tab=CURRENT&market=${activeMarket}`}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'CURRENT' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Current ({openCount})
            </Link>
            <Link
              href={`/?tab=UPCOMING&market=${activeMarket}`}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'UPCOMING' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({upcomingCount})
            </Link>
            <Link
              href={`/?tab=CLOSED&market=${activeMarket}`}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'CLOSED' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Closed
            </Link>
          </div>

          {/* Market Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold">Segment:</span>
            <Link
              href={`/?tab=${activeTab}&market=ALL`}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                activeMarket === 'ALL'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 font-bold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </Link>
            <Link
              href={`/?tab=${activeTab}&market=MAINBOARD`}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                activeMarket === 'MAINBOARD'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 font-bold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Mainboard
            </Link>
            <Link
              href={`/?tab=${activeTab}&market=SME`}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                activeMarket === 'SME'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 font-bold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              SME
            </Link>
          </div>
        </div>

        {/* 3. CURRENT IPO CARDS GRID */}
        {filteredIPOs.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="font-bold text-gray-900 text-base">No IPOs match the selected filter</h3>
            <p className="text-xs text-gray-500">Try selecting another tab or resetting the market filter.</p>
            <Link href="/" className="inline-block px-4 py-2 bg-purple-700 text-white font-bold text-xs rounded-lg">
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIPOs.map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </section>

      {/* 4. QUICK FEATURE STRIP */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/gmp"
          className="bg-white border border-gray-200 hover:border-purple-300 p-4 rounded-xl flex items-center gap-3 group transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-700 transition-colors">Live IPO GMP</h4>
            <p className="text-[11px] text-gray-500">Grey market premium today</p>
          </div>
        </Link>

        <Link
          href="/ipos"
          className="bg-white border border-gray-200 hover:border-purple-300 p-4 rounded-xl flex items-center gap-3 group transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-700 transition-colors">Subscription</h4>
            <p className="text-[11px] text-gray-500">QIB, NII & retail bids</p>
          </div>
        </Link>

        <Link
          href="/my-ipos"
          className="bg-white border border-gray-200 hover:border-purple-300 p-4 rounded-xl flex items-center gap-3 group transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-700 transition-colors">Allotment</h4>
            <p className="text-[11px] text-gray-500">Check result by PAN</p>
          </div>
        </Link>

        <Link
          href="/calendar"
          className="bg-white border border-gray-200 hover:border-purple-300 p-4 rounded-xl flex items-center gap-3 group transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-700 transition-colors">IPO Screener</h4>
            <p className="text-[11px] text-gray-500">Full market calendar</p>
          </div>
        </Link>
      </section>

      {/* 5. CURRENT IPOs DATA TABLE */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-gray-900">Current Open IPOs</h2>
            <p className="text-xs text-gray-500">Live prices, grey market estimates, and retail subscription status.</p>
          </div>
          <Link href="/ipos" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">GMP</th>
                <th className="py-3 px-4">Min. Invest</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Est. Profit</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {openIPOsList.map((ipo) => {
                const estProfit = ipo.gmp?.value ? ipo.gmp.value * ipo.lotSize : 0;
                return (
                  <tr key={ipo.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <Link href={`/ipos/${ipo.slug}`} className="hover:text-purple-700">
                        {ipo.name}
                      </Link>
                      <span className="block text-[10px] text-gray-500 font-mono font-normal">{ipo.symbol} • {ipo.marketType}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold">₹{ipo.priceHigh}</td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      +₹{ipo.gmp?.value || 0} ({formatPercent(ipo.gmp?.percent)})
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700">{formatINR(ipo.minInvestment)}</td>

                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {ipo.subscription?.overall ? `${ipo.subscription.overall}x` : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      {estProfit > 0 ? `+${formatINR(estProfit)}` : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/ipos/${ipo.slug}`}
                        className="px-3 py-1.5 bg-purple-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                      >
                        Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. RECENT SUBSCRIPTION & LATEST ALLOTMENT (2-COLUMN) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Subscription */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-700" /> Recent IPO Subscription
            </h3>
            <Link href="/ipos" className="text-xs font-bold text-purple-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {formattedIPOs.slice(0, 4).map((ipo) => (
              <div key={ipo.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">{ipo.name}</h4>
                  <p className="text-[11px] text-gray-500">{formatShortDate(ipo.openDate)} – {formatShortDate(ipo.closeDate)} • {ipo.marketType}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Overall Bid</span>
                  <span className="font-extrabold text-purple-700 text-sm">{ipo.subscription?.overall ? `${ipo.subscription.overall}x` : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Latest IPO Allotment */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" /> Latest IPO Allotment
            </h3>
            <Link href="/my-ipos" className="text-xs font-bold text-purple-700 hover:underline">
              Check All
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {formattedIPOs.slice(0, 4).map((ipo) => (
              <div key={ipo.id} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">{ipo.name}</h4>
                  <p className="text-[11px] text-gray-500">Allotment: <strong className="text-purple-700">{ipo.allotmentDate ? formatShortDate(ipo.allotmentDate) : 'TBD'}</strong></p>
                </div>

                <Link
                  href="/my-ipos"
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-[11px] transition-colors"
                >
                  Check Status
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RECENTLY CLOSED IPOs TABLE */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-gray-900">Recently Closed IPOs</h2>
            <p className="text-xs text-gray-500">Allotment and grey market listing performance tracking.</p>
          </div>
          <Link href="/ipos?status=CLOSED" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">GMP</th>
                <th className="py-3 px-4">Min. Investment</th>
                <th className="py-3 px-4">Allotment Date</th>
                <th className="py-3 px-4">Est. Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {closedIPOsList.map((ipo) => {
                const estProfit = ipo.gmp?.value ? ipo.gmp.value * ipo.lotSize : 0;
                return (
                  <tr key={ipo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <Link href={`/ipos/${ipo.slug}`} className="hover:text-purple-700">
                        {ipo.name}
                      </Link>
                      <span className="block text-[10px] text-gray-500 font-mono font-normal">{ipo.symbol}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">₹{ipo.priceHigh}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">+₹{ipo.gmp?.value || 0}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{formatINR(ipo.minInvestment)}</td>
                    <td className="py-3.5 px-4 font-semibold text-purple-700">{ipo.allotmentDate ? formatShortDate(ipo.allotmentDate) : 'TBD'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">{estProfit > 0 ? `+${formatINR(estProfit)}` : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. FAMILY ALLOTMENT CTA BANNER */}
      <section className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-300">MULTI-PAN ENGINE</span>
          <h3 className="text-xl sm:text-2xl font-black">Track allotments for the whole family</h3>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Create a free account, securely save your PANs with native AES-256-GCM encryption, and check multiple IPO allotment results across Indian registrars in one place.
          </p>
        </div>

        <Link
          href="/my-ipos"
          className="px-6 py-3.5 bg-white text-purple-900 hover:bg-purple-50 font-black rounded-xl text-xs sm:text-sm shrink-0 shadow-md transition-all"
        >
          Start Checking Allotments →
        </Link>
      </section>
    </div>
  );
}
