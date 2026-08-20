import React from 'react';
import { db } from '@/lib/db';
import { IPOCard } from '@/components/ipo/IPOCard';
import Link from 'next/link';
import { Search, Layers, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

interface DirectoryPageProps {
  searchParams: Promise<{
    status?: string;
    marketType?: string;
    search?: string;
  }>;
}

export default async function IPODirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const activeStatus = params.status || 'ALL';
  const activeMarket = params.marketType || 'ALL';
  const searchQuery = params.search || '';

  const whereClause: any = {};

  if (activeStatus !== 'ALL') {
    whereClause.status = activeStatus;
  }
  if (activeMarket !== 'ALL') {
    whereClause.marketType = activeMarket;
  }
  if (searchQuery.trim()) {
    whereClause.OR = [
      { name: { contains: searchQuery.trim() } },
      { symbol: { contains: searchQuery.trim() } },
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
    console.error('Error fetching directory IPOs:', err);
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
      issueSize: ipo.issueSize,
      openDate: ipo.openDate.toISOString(),
      closeDate: ipo.closeDate.toISOString(),
      gmp: latestGMP
        ? {
            value: latestGMP.gmp,
            estimatedListing: latestGMP.estimatedListing,
            percent: latestGMP.gmpPercent,
            trend: latestGMP.trend,
          }
        : null,
      subscription: latestSub ? { overall: latestSub.overall } : null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 space-y-1">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-700" /> IPO Screener & Directory
        </h1>
        <p className="text-xs text-gray-600">
          Filter and compare open, upcoming, and recently closed Indian IPOs across Mainboard and SME segments.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
        {/* Search */}
        <form action="/ipos" method="GET" className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search by company or symbol..."
              defaultValue={searchQuery}
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600"
            />
          </div>
        </form>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-gray-400 text-[11px] uppercase tracking-wider font-bold shrink-0">Status:</span>
          <Link
            href={`/ipos?status=ALL&marketType=${activeMarket}`}
            className={`px-3 py-1 rounded-lg border transition-colors shrink-0 ${
              activeStatus === 'ALL'
                ? 'bg-purple-700 text-white border-purple-700 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            All
          </Link>
          <Link
            href={`/ipos?status=OPEN&marketType=${activeMarket}`}
            className={`px-3 py-1 rounded-lg border transition-colors shrink-0 ${
              activeStatus === 'OPEN'
                ? 'bg-purple-700 text-white border-purple-700 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Open
          </Link>
          <Link
            href={`/ipos?status=UPCOMING&marketType=${activeMarket}`}
            className={`px-3 py-1 rounded-lg border transition-colors shrink-0 ${
              activeStatus === 'UPCOMING'
                ? 'bg-purple-700 text-white border-purple-700 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </Link>
          <Link
            href={`/ipos?status=CLOSED&marketType=${activeMarket}`}
            className={`px-3 py-1 rounded-lg border transition-colors shrink-0 ${
              activeStatus === 'CLOSED'
                ? 'bg-purple-700 text-white border-purple-700 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Closed
          </Link>
        </div>
      </div>

      {/* Directory Grid */}
      {formatted.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
          No IPOs found matching your search or filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatted.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      )}
    </div>
  );
}
