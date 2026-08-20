import Link from 'next/link';
import { db } from '@/lib/db';
import { IPOCard } from '@/components/ipo/IPOCard';
import { TrendingUp, Flame, ShieldCheck, ArrowRight, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const revalidate = 0; // Dynamic SSR

export default async function HomePage() {
  const ipos = await db.iPO.findMany({
    include: {
      registrar: true,
      gmpHistory: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
      subscription: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { openDate: 'desc' },
  });

  const formatted = ipos.map((ipo) => {
    const latestGMP = ipo.gmpHistory[0] || null;
    const latestSub = ipo.subscription[0] || null;
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
      openDate: ipo.openDate.toISOString(),
      closeDate: ipo.closeDate.toISOString(),
      gmp: latestGMP
        ? {
            value: latestGMP.gmp,
            estimatedListing: latestGMP.estimatedListing,
            percent: latestGMP.gmpPercent,
            trend: latestGMP.trend,
            confidence: latestGMP.confidence,
          }
        : null,
      subscription: latestSub ? { overall: latestSub.overall } : null,
    };
  });

  const openIPOs = formatted.filter((i) => i.status === 'OPEN');
  const allotmentOutIPOs = formatted.filter((i) => i.status === 'ALLOTMENT_AVAILABLE');
  const upcomingIPOs = formatted.filter((i) => i.status === 'UPCOMING');
  const listedIPOs = formatted.filter((i) => i.status === 'LISTED');

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-emerald-950/40 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>IPO Intelligence, Simplified</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Indian IPO Intelligence <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              & Allotment Tracker
            </span>
          </h1>
          <p className="text-gray-300 text-sm mt-3 leading-relaxed">
            Real-time GMP, calculated listing gain percentages, subscription statistics, and instant multi-PAN allotment checks across KFintech, Link Intime, and Bigshare.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/my-ipos"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Check Allotment Status
            </Link>
            <Link
              href="/gmp"
              className="px-5 py-2.5 rounded-xl bg-card hover:bg-card-hover border border-border text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" /> View Live GMP Tracker
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1: Allotment Status Out Alert */}
      {allotmentOutIPOs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Allotment Out Now
              </h2>
            </div>
            <Link href="/my-ipos" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
              Check Multiple PANs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allotmentOutIPOs.map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Open Now IPOs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" /> Open Now for Bidding
          </h2>
          <Link href="/ipos?status=OPEN" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
            View All Open ({openIPOs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {openIPOs.length === 0 ? (
          <div className="fintech-card p-6 text-center text-gray-400 text-sm">
            No mainboard IPOs open right now. Check upcoming IPOs below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openIPOs.map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Upcoming IPOs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Upcoming IPOs
          </h2>
          <Link href="/ipos?status=UPCOMING" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
            View All Upcoming <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingIPOs.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      </section>
    </div>
  );
}
