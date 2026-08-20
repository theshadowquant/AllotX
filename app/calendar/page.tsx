import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ArrowUpRight, Flame } from 'lucide-react';
import { formatEventDate, formatShortDate } from '@/lib/utils/formatters';

export const revalidate = 0;

export default async function CalendarPage() {
  let ipos: any[] = [];
  try {
    ipos = await db.iPO.findMany({
      orderBy: { openDate: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching calendar data:', err);
    ipos = [];
  }

  // Create chronological event list
  const events: any[] = [];

  ipos.forEach((ipo) => {
    if (ipo.openDate) {
      events.push({
        date: new Date(ipo.openDate),
        type: 'IPO Opens',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        ipo,
      });
    }
    if (ipo.closeDate) {
      events.push({
        date: new Date(ipo.closeDate),
        type: 'IPO Closes',
        badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        ipo,
      });
    }
    if (ipo.allotmentDate) {
      events.push({
        date: new Date(ipo.allotmentDate),
        type: 'Basis of Allotment',
        badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        ipo,
      });
    }
    if (ipo.listingDate) {
      events.push({
        date: new Date(ipo.listingDate),
        type: 'Listing Date',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        ipo,
      });
    }
  });

  // Sort events chronologically
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#1F293D] pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" /> IPO Market Calendar & Timeline
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Chronological schedule of IPO openings, closings, allotment result declarations, and stock exchange listings.
        </p>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3">
        {events.map((evt, idx) => (
          <div
            key={`${evt.ipo.id}-${evt.type}-${idx}`}
            className="bg-[#111827] border border-[#1F293D] p-4 rounded-xl flex items-center justify-between gap-4 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Date Box */}
              <div className="bg-[#090D16] border border-[#1F293D] p-2.5 rounded-lg text-center min-w-[70px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {evt.date.toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <span className="text-xl font-extrabold text-white block leading-none mt-0.5">
                  {evt.date.getDate()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${evt.badgeColor}`}>
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{evt.ipo.symbol}</span>
                </div>
                <h3 className="font-bold text-sm text-white mt-1">{evt.ipo.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Price: <strong className="text-gray-200">₹{evt.ipo.priceLow} – ₹{evt.ipo.priceHigh}</strong> • Lot: <strong className="text-gray-200">{evt.ipo.lotSize} Shares</strong>
                </p>
              </div>
            </div>

            <Link
              href={`/ipos/${evt.ipo.slug}`}
              className="p-2 text-indigo-400 hover:text-white rounded-lg inline-flex items-center gap-1 text-xs font-semibold shrink-0"
            >
              View <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
