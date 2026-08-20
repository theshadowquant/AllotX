'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, TrendingUp, Calendar, Layers, ShieldCheck, Bookmark } from 'lucide-react';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ipos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'IPOs', href: '/ipos' },
    { label: 'GMP', href: '/gmp' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'My IPOs', href: '/my-ipos' },
    { label: 'Watchlist', href: '/watchlist' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 border-b border-[#1F293D] px-4 py-3 sm:px-6 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block leading-none">AllotX</span>
            <span className="text-[11px] text-gray-400 font-medium hidden sm:block mt-0.5">
              IPO intelligence, simplified.
            </span>
          </div>
        </Link>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm mx-2 sm:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search IPOs..."
              aria-label="Search IPOs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F293D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white bg-indigo-600/20 border border-indigo-500/30 font-bold'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#111827]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
