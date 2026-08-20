import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> GMP Market Screen
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Unofficial market premium movement and listing gain percentages.
          </p>
        </div>

        {/* Market Type Toggle */}
        <div className="flex items-center bg-[#111827] p-1 rounded-lg border border-[#1F293D] text-xs font-semibold self-start sm:self-auto">
          <Link
            href={`/gmp?marketType=ALL&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </Link>
          <Link
            href={`/gmp?marketType=MAINBOARD&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'MAINBOARD' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mainboard
          </Link>
          <Link
            href={`/gmp?marketType=SME&filter=${activeFilter}`}
            className={`px-3 py-1 rounded transition-colors ${
              activeMarket === 'SME' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            SME
          </Link>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-gray-500 font-semibold uppercase text-[10px]">Filter:</span>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=ALL`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-[#111827] text-gray-400 border border-[#1F293D] hover:text-white'
          }`}
        >
          All Trends
        </Link>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=HIGHEST_PCT`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'HIGHEST_PCT'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-[#111827] text-gray-400 border border-[#1F293D] hover:text-white'
          }`}
        >
          Highest GMP %
        </Link>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=RISING`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'RISING'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-[#111827] text-gray-400 border border-[#1F293D] hover:text-white'
          }`}
        >
          Rising Trends
        </Link>
        <Link
          href={`/gmp?marketType=${activeMarket}&filter=FALLING`}
          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
            activeFilter === 'FALLING'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-[#111827] text-gray-400 border border-[#1F293D] hover:text-white'
          }`}
        >
          Falling Trends
        </Link>
      </div>

      {/* Market Table for Desktop */}
      <div className="hidden md:block bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1F293D] bg-[#090D16]/60 text-gray-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">IPO Name</th>
              <th className="py-3 px-4">IPO Price</th>
              <th className="py-3 px-4">Latest GMP</th>
              <th className="py-3 px-4">GMP %</th>
              <th className="py-3 px-4">Estimated Listing</th>
              <th className="py-3 px-4">Trend</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F293D]/60 text-gray-200">
            {gmpList.map((item) => (
              <tr key={item.id} className="hover:bg-[#1F293D]/30 transition-colors">
                <td className="py-3 px-4">
                  <Link href={`/ipos/${item.slug}`} className="group">
                    <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.symbol} • {item.marketType}</div>
                  </Link>
                </td>

                <td className="py-3 px-4 font-semibold text-gray-300">₹{item.priceHigh}</td>

                <td className="py-3 px-4 font-extrabold text-sm">
                  <span className={item.gmpVal > 0 ? 'text-emerald-400' : 'text-gray-300'}>
                    {item.gmpVal > 0 ? `+₹${item.gmpVal}` : `₹${item.gmpVal}`}
                  </span>
                </td>

                <td className="py-3 px-4 font-bold text-sm">
                  <span className={item.gmpPercent > 0 ? 'text-emerald-400' : 'text-gray-400'}>
                    {formatPercent(item.gmpPercent)}
                  </span>
                </td>

                <td className="py-3 px-4 font-extrabold text-sm text-white">
                  {formatINR(item.estimatedListing)}
                </td>

                <td className="py-3 px-4">
                  {item.trend === 'RISING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" /> Rising
                    </span>
                  ) : item.trend === 'FALLING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                      <TrendingDown className="w-3.5 h-3.5" /> Falling
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                      <Minus className="w-3.5 h-3.5" /> Stable
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/ipos/${item.slug}`}
                    className="p-1.5 text-indigo-400 hover:text-white rounded inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    Chart <ArrowUpRight className="w-3.5 h-3.5" />
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
            className="bg-[#111827] border border-[#1F293D] rounded-xl p-4 block space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <span className="text-[10px] text-gray-400 font-mono">{item.symbol}</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                +₹{item.gmpVal} ({formatPercent(item.gmpPercent)})
              </span>
            </div>

            <div className="flex justify-between text-xs pt-1 border-t border-[#1F293D]">
              <span className="text-gray-400">Estimated Listing: <strong className="text-white">{formatINR(item.estimatedListing)}</strong></span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1">Details <ArrowUpRight className="w-3 h-3" /></span>
            </div>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1F293D] flex items-start gap-2.5 text-xs text-gray-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-300 font-medium">Disclaimer:</strong> GMP (Grey Market Premium) is unofficial, unregulated market sentiment. It is provided for informational tracking and does not guarantee listing price or returns.
        </p>
      </div>
    </div>
  );
}
