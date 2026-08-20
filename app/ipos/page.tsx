import React from 'react';
import { db } from '@/lib/db';
import { IPOCard } from '@/components/ipo/IPOCard';
import { Layers } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    marketType?: string;
  }>;
}

export default async function IPOsDirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = params.status || 'ALL';
  const activeMarket = params.marketType || 'ALL';
  const query = params.search || '';

  const whereClause: any = {};
  if (activeStatus !== 'ALL') {
    whereClause.status = activeStatus;
  }
  if (activeMarket !== 'ALL') {
    whereClause.marketType = activeMarket;
  }
  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { symbol: { contains: query } },
    ];
  }

  let ipos: any[] = [];
  try {
    ipos = await db.iPO.findMany({
      where: whereClause,
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
  } catch (err) {
    console.error('Error fetching IPOs directory:', err);
    ipos = [];
  }

  const formatted = ipos.map((ipo) => {
    const latestGMP = ipo.gmpHistory?.[0] || null;
    const latestSub = ipo.subscription?.[0] || null;
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

  const filterTabs = [
    { label: 'All IPOs', status: 'ALL' },
    { label: 'Open Now', status: 'OPEN' },
    { label: 'Upcoming', status: 'UPCOMING' },
    { label: 'Allotment Out', status: 'ALLOTMENT_AVAILABLE' },
    { label: 'Listed', status: 'LISTED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" /> IPO Discovery
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse upcoming, open, closed, and listed IPOs with live GMP estimates.
          </p>
        </div>

        {/* Market Type Toggle */}
        <div className="flex items-center bg-card p-1 rounded-xl border border-border self-start sm:self-auto text-xs font-semibold">
          <Link
            href={`/ipos?status=${activeStatus}&marketType=ALL`}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeMarket === 'ALL' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Markets
          </Link>
          <Link
            href={`/ipos?status=${activeStatus}&marketType=MAINBOARD`}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeMarket === 'MAINBOARD' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mainboard
          </Link>
          <Link
            href={`/ipos?status=${activeStatus}&marketType=SME`}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeMarket === 'SME' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            SME IPOs
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        {filterTabs.map((tab) => (
          <Link
            key={tab.status}
            href={`/ipos?status=${tab.status}&marketType=${activeMarket}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeStatus === tab.status
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-card/60 text-gray-400 hover:text-white hover:bg-card border border-border/40'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards List */}
      {formatted.length === 0 ? (
        <div className="fintech-card p-8 text-center text-gray-400 space-y-2">
          <p className="font-semibold">No IPOs found matching current filters.</p>
          <p className="text-xs text-gray-500">Try adjusting your search query or market filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formatted.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      )}
    </div>
  );
}
