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
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ipo,
      });
    }
    if (ipo.closeDate) {
      events.push({
        date: new Date(ipo.closeDate),
        type: 'IPO Closes',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        ipo,
      });
    }
    if (ipo.allotmentDate) {
      events.push({
        date: new Date(ipo.allotmentDate),
        type: 'Basis of Allotment',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        ipo,
      });
    }
    if (ipo.listingDate) {
      events.push({
        date: new Date(ipo.listingDate),
        type: 'Listing Date',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        ipo,
      });
    }
  });

  // Sort events chronologically
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-purple-700" /> IPO Market Calendar & Timeline
        </h1>
        <p className="text-xs text-gray-500">
          Chronological schedule of IPO openings, closings, allotment result declarations, and stock exchange listings.
        </p>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3">
        {events.map((evt, idx) => (
          <div
            key={`${evt.ipo.id}-${evt.type}-${idx}`}
            className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-purple-300 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-4">
              {/* Date Box */}
              <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-center min-w-[70px]">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  {evt.date.toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <span className="text-xl font-black text-gray-900 block leading-none mt-0.5">
                  {evt.date.getDate()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${evt.badgeColor}`}>
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{evt.ipo.symbol}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{evt.ipo.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Price: <strong className="text-gray-800">₹{evt.ipo.priceLow} – ₹{evt.ipo.priceHigh}</strong> • Lot: <strong className="text-gray-800">{evt.ipo.lotSize} Shares</strong>
                </p>
              </div>
            </div>

            <Link
              href={`/ipos/${evt.ipo.slug}`}
              className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-purple-700 rounded-lg inline-flex items-center gap-1 text-xs font-bold border border-gray-200 transition-colors shrink-0"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
