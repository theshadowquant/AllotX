'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Info, TrendingUp, ShieldAlert } from 'lucide-react';

interface GMPHistoryPoint {
  date: string;
  gmp: number;
  estimatedListing: number;
  gmpPercent: number;
  trend?: string;
  confidence?: string;
}

interface GMPChartProps {
  data: GMPHistoryPoint[];
  upperPrice: number;
  currentGMP: number;
}

export function GMPChart({ data, upperPrice, currentGMP }: GMPChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border text-center text-gray-400">
        <p>No historical GMP chart data recorded yet.</p>
      </div>
    );
  }

  const isPositive = currentGMP >= 0;

  return (
    <div className="fintech-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="font-bold text-base text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> GMP Historical Trend
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Unofficial market premium movement prior to listing
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">Latest GMP</span>
          <span className={`text-base font-extrabold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currentGMP >= 0 ? `+₹${currentGMP}` : `-₹${Math.abs(currentGMP)}`}
          </span>
        </div>
      </div>

      {/* Recharts Line Visualization */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#1F293D' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as GMPHistoryPoint;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-bold text-gray-200 border-b border-slate-800 pb-1">{label}</p>
                      <p className="text-emerald-400 font-semibold">
                        GMP: +₹{item.gmp} ({item.gmpPercent}%)
                      </p>
                      <p className="text-gray-300">
                        Est. Listing: ₹{item.estimatedListing}
                      </p>
                      {item.confidence && (
                        <p className="text-[10px] text-gray-400 uppercase">
                          Confidence: {item.confidence}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#4B5563" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="gmp"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#090D16' }}
              activeDot={{ r: 6, fill: '#34D399', stroke: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mandatory Regulatory & Risk Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-300 font-medium">Disclaimer:</strong> GMP (Grey Market Premium) is unofficial market sentiment and does not guarantee actual listing price or returns.
        </p>
      </div>
    </div>
  );
}
