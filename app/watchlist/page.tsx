import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Bookmark, ArrowUpRight, TrendingUp, Layers } from 'lucide-react';
import { IPOStatusBadge } from '@/components/ipo/IPOStatusBadge';
import { formatINR, formatPercent, formatShortDate } from '@/lib/utils/formatters';

export const revalidate = 0;

export default async function WatchlistPage() {
  let watchlistItems: any[] = [];
  try {
    const records = await db.watchlist.findMany({
      where: { userId: 'default-user' },
      include: {
        ipo: {
          include: {
            gmpHistory: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    watchlistItems = records.map((w) => {
      const latestGMP = w.ipo.gmpHistory?.[0] || null;
      return {
        id: w.id,
        ipoId: w.ipo.id,
        name: w.ipo.name,
        slug: w.ipo.slug,
        symbol: w.ipo.symbol,
        marketType: w.ipo.marketType,
        status: w.ipo.status,
        openDate: w.ipo.openDate.toISOString(),
        closeDate: w.ipo.closeDate.toISOString(),
        allotmentDate: w.ipo.allotmentDate.toISOString(),
        gmp: latestGMP
          ? {
              value: latestGMP.gmp,
              percent: latestGMP.gmpPercent,
              estimatedListing: latestGMP.estimatedListing,
              trend: latestGMP.trend,
            }
          : null,
      };
    });
  } catch (err) {
    console.error('Error fetching watchlist data:', err);
    watchlistItems = [];
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#1F293D] pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-400" /> Watchlist & Saved IPOs
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Monitor your tracked IPOs, live grey market premiums, and upcoming timeline milestones.
        </p>
      </div>

      {watchlistItems.length === 0 ? (
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-8 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-indigo-400 mx-auto opacity-60" />
          <h3 className="font-bold text-base text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Browse open and upcoming IPOs in the directory to save them to your watchlist.
          </p>
          <Link href="/ipos" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg">
            Explore IPO Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-[#1F293D] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">{item.name}</h3>
                  <IPOStatusBadge status={item.status} marketType={item.marketType} />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Symbol: <span className="font-mono text-gray-300">{item.symbol}</span> • Opens: <strong className="text-gray-200">{formatShortDate(item.openDate)}</strong> • Allotment: <strong className="text-gray-200">{formatShortDate(item.allotmentDate)}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1F293D]">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">GMP</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    +₹{item.gmp?.value || 0} ({formatPercent(item.gmp?.percent)})
                  </span>
                </div>

                <Link
                  href={`/ipos/${item.slug}`}
                  className="px-3 py-1.5 bg-[#090D16] hover:bg-[#1F293D] text-indigo-400 hover:text-white rounded-lg border border-[#1F293D] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  View <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
