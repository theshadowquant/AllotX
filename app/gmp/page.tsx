import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight } from 'lucide-react';
import { IPOStatusBadge } from '@/components/ipo/IPOStatusBadge';

export const revalidate = 0;

export default async function GMPTrackerPage() {
  const ipos = await db.iPO.findMany({
    include: {
      gmpHistory: {
        orderBy: { recordedAt: 'desc' },
        take: 2,
      },
    },
    orderBy: { openDate: 'desc' },
  });

  const gmpList = ipos.map((ipo) => {
    const latest = ipo.gmpHistory[0] || null;
    const previous = ipo.gmpHistory[1] || null;

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
      status: ipo.status,
      priceHigh: upperPrice,
      gmpVal,
      absChange,
      gmpPercent,
      estimatedListing,
      trend: latest?.trend || 'STABLE',
      confidence: latest?.confidence || 'HIGH',
      updatedAt: latest?.recordedAt.toISOString() || null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Live Grey Market Premium Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Live & Historical GMP Tracker</h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Track unofficial market sentiment, calculated listing percentage gains, absolute price movements, and trend directions.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-gray-300">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white font-bold">Important Notice:</strong> GMP (Grey Market Premium) is unofficial, unregulated market sentiment. It is provided strictly for educational tracking and does not guarantee actual stock exchange listing price or returns.
        </p>
      </div>

      {/* GMP Table Card */}
      <div className="fintech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-card/80 text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">IPO Name</th>
                <th className="py-3.5 px-4 font-bold">IPO Price</th>
                <th className="py-3.5 px-4 font-bold">Latest GMP</th>
                <th className="py-3.5 px-4 font-bold">GMP %</th>
                <th className="py-3.5 px-4 font-bold">Estimated Listing</th>
                <th className="py-3.5 px-4 font-bold">Trend</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-gray-200">
              {gmpList.map((item) => (
                <tr key={item.id} className="hover:bg-card-hover/50 transition-colors">
                  <td className="py-4 px-4">
                    <Link href={`/ipos/${item.slug}`} className="group">
                      <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{item.symbol}</div>
                    </Link>
                  </td>

                  <td className="py-4 px-4 font-semibold text-gray-300">₹{item.priceHigh}</td>

                  <td className="py-4 px-4 font-extrabold text-sm">
                    <span className={item.gmpVal > 0 ? 'text-emerald-400' : 'text-gray-300'}>
                      {item.gmpVal > 0 ? `+₹${item.gmpVal}` : `₹${item.gmpVal}`}
                    </span>
                    {item.absChange !== 0 && (
                      <span className={`text-[10px] ml-1.5 font-bold ${item.absChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({item.absChange > 0 ? `+₹${item.absChange}` : `-₹${Math.abs(item.absChange)}`})
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-bold text-sm">
                    <span className={item.gmpPercent > 0 ? 'text-emerald-400' : 'text-gray-400'}>
                      {item.gmpPercent > 0 ? `+${item.gmpPercent}%` : `${item.gmpPercent}%`}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-extrabold text-sm text-white">
                    ₹{item.estimatedListing}
                  </td>

                  <td className="py-4 px-4">
                    {item.trend === 'RISING' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        <TrendingUp className="w-3 h-3" /> Rising
                      </span>
                    ) : item.trend === 'FALLING' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                        <TrendingDown className="w-3 h-3" /> Falling
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded border border-gray-700">
                        <Minus className="w-3 h-3" /> Stable
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/ipos/${item.slug}`}
                      className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-card rounded-lg inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      Chart <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
