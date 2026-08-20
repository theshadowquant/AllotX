'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { formatINR, formatPercent } from '@/lib/utils/formatters';

interface GMPChartProps {
  data: Array<{
    date: string;
    gmp: number;
    estimatedListing: number;
    gmpPercent: number;
    trend: string;
  }>;
  upperPrice: number;
  currentGMP: number;
}

export function GMPChart({ data, upperPrice, currentGMP }: GMPChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center space-y-2 shadow-sm">
        <Info className="w-6 h-6 text-purple-700 mx-auto" />
        <h4 className="font-bold text-sm text-gray-900">Historical GMP Chart</h4>
        <p className="text-xs text-gray-500">Historical trend data is currently being collected for this issue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-700" /> Historical GMP Trend Line
          </h3>
          <p className="text-xs text-gray-500">Daily grey market premium movement tracking.</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-gray-400 uppercase block">Latest Premium</span>
          <span className="font-extrabold text-sm text-emerald-600">+₹{currentGMP}</span>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gmpGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '11px',
              }}
              formatter={(val: any) => [`+₹${val}`, 'GMP']}
            />
            <Area
              type="monotone"
              dataKey="gmp"
              stroke="#7C3AED"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gmpGradientLight)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
