import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { IPOCard } from '@/components/ipo/IPOCard';
import { TrendingUp, TrendingDown, Layers, Calendar, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatINR, formatPercent, formatShortDate } from '@/lib/utils/formatters';

export const revalidate = 0;

export default async function HomePage() {
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

    userGroups = await db.iPOApplicationGroup.findMany({
      where: { userId: 'default-user' },
      include: {
        ipo: true,
        applicants: true,
      },
      take: 2,
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
      openDate: ipo.openDate?.toISOString ? ipo.openDate.toISOString() : new Date().toISOString(),
      closeDate: ipo.closeDate?.toISOString ? ipo.closeDate.toISOString() : new Date().toISOString(),
      allotmentDate: ipo.allotmentDate?.toISOString ? ipo.allotmentDate.toISOString() : new Date().toISOString(),
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

  const openIPOs = formattedIPOs.filter((i) => i.status === 'OPEN');
  const upcomingIPOs = formattedIPOs.filter((i) => i.status === 'UPCOMING');
  const allotmentOutIPOs = formattedIPOs.filter((i) => i.status === 'ALLOTMENT_AVAILABLE');

  // Top GMP movers sorted by highest GMP % gain
  const gmpMovers = [...formattedIPOs]
    .filter((i) => i.gmp && i.gmp.value !== 0)
    .sort((a, b) => (b.gmp?.percent || 0) - (a.gmp?.percent || 0))
    .slice(0, 4);

  // Next important event calculation
  const nextEventIPO = formattedIPOs.find(
    (i) => i.status === 'OPEN' || i.status === 'ALLOTMENT_PENDING' || i.status === 'UPCOMING'
  );

  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Date Snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">IPO Market Snapshot</h1>
          <p className="text-xs text-gray-400 mt-0.5">{todayDateStr} • Live Grey Market & Allotments</p>
        </div>

        <Link
          href="/my-ipos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-600/30 transition-colors self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Track My Applications
        </Link>
      </div>

      {/* 2. Three Compact Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-[#1F293D] p-3.5 rounded-xl">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">OPEN NOW</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 block">
            {openIPOs.length} <span className="text-xs font-normal text-gray-400">IPOs</span>
          </span>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] p-3.5 rounded-xl">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">UPCOMING</span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-400 mt-1 block">
            {upcomingIPOs.length} <span className="text-xs font-normal text-gray-400">IPOs</span>
          </span>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] p-3.5 rounded-xl">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">ALLOTMENTS TODAY</span>
          <span className="text-xl sm:text-2xl font-extrabold text-indigo-400 mt-1 block">
            {allotmentOutIPOs.length} <span className="text-xs font-normal text-gray-400">Declared</span>
          </span>
        </div>
      </div>

      {/* 3. Main 2-Column Section: GMP Movers + My IPOs & Next Event */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): GMP Movers & Open IPOs */}
        <div className="lg:col-span-2 space-y-6">
          {/* GMP MOVERS SECTION */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#1F293D] pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Top GMP Movers
              </h2>
              <Link href="/gmp" className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                View all GMP →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gmpMovers.map((item) => (
                <Link
                  key={item.id}
                  href={`/ipos/${item.slug}`}
                  className="bg-[#090D16] p-3 rounded-lg border border-[#1F293D] hover:border-gray-600 transition-colors block"
                >
                  <span className="font-bold text-xs text-white block truncate">{item.name}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-extrabold text-emerald-400">
                      +₹{item.gmp?.value}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      ({formatPercent(item.gmp?.percent)})
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    {item.gmp?.trend === 'RISING' ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> Rising
                      </span>
                    ) : (
                      <span className="text-gray-400">Est. ₹{item.gmp?.estimatedListing}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* OPEN IPOs SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Open Now for Bidding
              </h2>
              <Link href="/ipos?status=OPEN" className="text-xs text-indigo-400 hover:underline font-semibold">
                View All Open ({openIPOs.length})
              </Link>
            </div>

            {/* CONTEXTUAL EMPTY STATE FOR OPEN IPOS */}
            {openIPOs.length === 0 ? (
              <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 text-gray-300 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" /> No Mainboard IPOs Open Right Now
                </div>

                {upcomingIPOs.length > 0 && (
                  <div className="bg-[#090D16] p-4 rounded-lg border border-[#1F293D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 uppercase font-semibold block">Next Upcoming IPO</span>
                      <h4 className="font-bold text-base text-white mt-0.5">{upcomingIPOs[0].name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Opens: <strong className="text-gray-200">{formatShortDate(upcomingIPOs[0].openDate)}</strong> • GMP: <strong className="text-emerald-400">+₹{upcomingIPOs[0].gmp?.value || 0}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/ipos/${upcomingIPOs[0].slug}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold text-center transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {openIPOs.map((ipo) => (
                  <IPOCard key={ipo.id} ipo={ipo} />
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING IPOs SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Upcoming IPOs
              </h2>
              <Link href="/ipos?status=UPCOMING" className="text-xs text-indigo-400 hover:underline font-semibold">
                View All Upcoming ({upcomingIPOs.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingIPOs.map((ipo) => (
                <IPOCard key={ipo.id} ipo={ipo} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): My Applications & Next Event Widget */}
        <div className="space-y-6">
          {/* MY IPO APPLICATIONS SUMMARY */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> My IPO Applications
            </h3>

            {userGroups.length > 0 ? (
              userGroups.map((group: any) => {
                const allotted = group.applicants.filter((a: any) => a.status === 'ALLOTTED').length;
                const notAllotted = group.applicants.filter((a: any) => a.status === 'NOT_ALLOTTED').length;

                return (
                  <div key={group.id} className="bg-[#090D16] p-3 rounded-lg border border-[#1F293D] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-white">{group.ipo.name}</h4>
                        <span className="text-[10px] text-gray-400">{group.applicants.length} Applications</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {allotted} Allotted • {notAllotted} Non-Allotted
                      </span>
                    </div>

                    <Link
                      href="/my-ipos"
                      className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1 pt-1 border-t border-[#1F293D]/60"
                    >
                      View Result Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-gray-400 space-y-3 pt-1">
                <p>Add your family or portfolio PANs once to check allotment status across registrars.</p>
                <Link
                  href="/my-ipos"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center block transition-colors"
                >
                  Start Tracking Applications
                </Link>
              </div>
            )}
          </div>

          {/* NEXT IMPORTANT EVENT WIDGET */}
          {nextEventIPO && (
            <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">NEXT MARKET EVENT</span>
              <h4 className="font-bold text-sm text-white">{nextEventIPO.name}</h4>
              <p className="text-xs text-gray-300">
                Basis of Allotment: <strong className="text-emerald-400">{formatShortDate(nextEventIPO.allotmentDate)}</strong>
              </p>
              <Link
                href={`/ipos/${nextEventIPO.slug}`}
                className="text-xs font-semibold text-indigo-400 hover:underline inline-flex items-center gap-1 pt-2"
              >
                View Timeline Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
