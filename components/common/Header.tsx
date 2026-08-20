'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, ShieldCheck, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ipos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-border/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-white">AllotX</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium -mt-0.5 hidden sm:block">
              IPO intelligence, simplified.
            </p>
          </div>
        </Link>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by IPO name, symbol, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/90 border border-border/90 rounded-full pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </form>

        {/* Action Links & Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/my-ipos"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/25 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            My Allotments
          </Link>

          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-white hover:bg-card/80 rounded-lg transition-colors"
            title="Admin & Registrar Health"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
