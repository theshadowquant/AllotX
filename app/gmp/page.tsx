import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils/formatters';

export const revalidate = 0;

interface GMPPageProps {
  searchParams: Promise<{
    marketType?: string;
    filter?: string;
  }>;
}

export default async function GMPTrackerPage({ searchParams }: GMPPageProps) {
  const params = await searchParams;
  const activeMarket = params.marketType || 'ALL';
  const activeFilter = params.filter || 'ALL';

  const whereClause: any = {};
  if (activeMarket !== 'ALL') {
    whereClause.marketType = activeMarket;
  }

  let ipos: any[] = [];
  let dataSource: any = null;

  try {
    ipos = await db.iPO.findMany({
      where: whereClause,
      include: {
        gmpHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 2,
        },
      },
      orderBy: { openDate: 'desc' },
    });

    dataSource = await db.dataSource.findUnique({
      where: { code: 'GMP_CONSENSUS_FEED' },
    });
  } catch (err) {
    console.error('Error querying GMP page data:', err);
    ipos = [];
  }

  let gmpList = ipos.map((ipo) => {
    const latest = ipo.gmpHistory?.[0] || null;
    const previous = ipo.gmpHistory?.[1] || null;

    const gmpVal = latest?.gmp ?? 0;
    const prevVal = previous?.gmp ?? gmpVal;
    const absChange = gmpVal - prevVal;
    const upperPrice = ipo.priceHigh;
    const estimatedListing = Math.round(upperPrice + gmpVal);
    const gmpPercent = parseFloat(((gmpVal / upperPrice) * 100).toFixed(2));

    return {
      id: ipo.id,
      name: ipo.name,
      slug: ipo.slug,
      symbol: ipo.symbol,
      marketType: ipo.marketType,
      status: ipo.status,
      priceHigh: upperPrice,
      gmpVal,
      absChange,
      gmpPercent,
      estimatedListing,
      trend: latest?.trend || 'STABLE',
      recordedAt: latest?.recordedAt || null,
    };
  });

  // Apply filters
  if (activeFilter === 'RISING') {
    gmpList = gmpList.filter((i) => i.trend === 'RISING');
  } else if (activeFilter === 'FALLING') {
    gmpList = gmpList.filter((i) => i.trend === 'FALLING');
  } else if (activeFilter === 'HIGHEST_GMP') {
    gmpList.sort((a, b) => b.gmpVal - a.gmpVal);
  } else if (activeFilter === 'HIGHEST_PCT') {
    gmpList.sort((a, b) => b.gmpPercent - a.gmpPercent);
  }

  const lastUpdateStr = dataSource?.lastSuccessfulUpdate
    ? `${Math.max(1, Math.round((Date.now() - new Date(dataSource.lastSuccessfulUpdate).getTime()) / 60000))} minutes ago`
    : 'Recently';

  return (
    <div className="space-y-6">
      {/* Header & Freshness Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-700" /> Live IPO Grey Market Premium (GMP)
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Clock className="w-3 h-3 text-emerald-600" /> Updated {lastUpdateStr}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Track unofficial grey market premium rates, percentage listing gains, and price estimates.
          </p>
        </div>

        {/* Market Type Toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-semibold self-start sm:self-auto">
          <Link
            href={`/gmp?marketType=ALL&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'ALL' ? 'bg-white text-purple-700 font-bold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </Link>
          <Link
            href={`/gmp?marketType=MAINBOARD&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'MAINBOARD' ? 'bg-white text-purple-700 font-bold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mainboard
          </Link>
          <Link
            href={`/gmp?marketType=SME&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'SME' ? 'bg-white text-purple-700 font-bold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SME
          </Link>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-gray-400 font-bold uppercase text-[10px]">Sort:</span>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=ALL`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Trends
        </Link>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=HIGHEST_PCT`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'HIGHEST_PCT'
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Highest GMP %
        </Link>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=RISING`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'RISING'
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Rising Trends
        </Link>
      </div>

      {/* Market Table for Desktop */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">IPO Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Latest GMP</th>
              <th className="py-3 px-4">GMP %</th>
              <th className="py-3 px-4">Estimated Listing</th>
              <th className="py-3 px-4">Trend</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {gmpList.map((item) => (
              <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                <td className="py-3 px-4">
                  <Link href={`/ipos/${item.slug}`} className="group">
                    <div className="font-bold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{item.symbol} • {item.marketType}</div>
                  </Link>
                </td>

                <td className="py-3 px-4 font-semibold text-gray-700">₹{item.priceHigh}</td>

                <td className="py-3 px-4 font-extrabold text-sm text-emerald-600">
                  +₹{item.gmpVal}
                </td>

                <td className="py-3 px-4 font-bold text-sm text-emerald-600">
                  {formatPercent(item.gmpPercent)}
                </td>

                <td className="py-3 px-4 font-extrabold text-sm text-gray-900">
                  {formatINR(item.estimatedListing)}
                </td>

                <td className="py-3 px-4">
                  {item.trend === 'RISING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" /> Rising
                    </span>
                  ) : item.trend === 'FALLING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <TrendingDown className="w-3.5 h-3.5" /> Falling
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                      <Minus className="w-3.5 h-3.5" /> Stable
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/ipos/${item.slug}`}
                    className="p-1.5 text-purple-700 hover:text-purple-900 rounded inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid */}
      <div className="md:hidden space-y-3">
        {gmpList.map((item) => (
          <Link
            key={item.id}
            href={`/ipos/${item.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-4 block space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                <span className="text-[10px] text-gray-500 font-mono">{item.symbol}</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                +₹{item.gmpVal} ({formatPercent(item.gmpPercent)})
              </span>
            </div>

            <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
              <span className="text-gray-500">Estimated Listing: <strong className="text-gray-900">{formatINR(item.estimatedListing)}</strong></span>
              <span className="text-purple-700 font-semibold flex items-center gap-1">Details <ArrowUpRight className="w-3 h-3" /></span>
            </div>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-2.5 text-xs text-gray-500">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-700 font-medium">Disclaimer:</strong> Grey Market Premium (GMP) is unofficial, unregulated market sentiment. It is provided for informational tracking and does not guarantee listing price or returns.
        </p>
      </div>
    </div>
  );
}
