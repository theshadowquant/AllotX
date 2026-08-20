'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Search, Menu, X, User } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'IPO Screener', href: '/ipos' },
    { label: 'Live IPO GMP', href: '/gmp' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Check IPO Allotments', href: '/my-ipos', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-200 px-4 sm:px-6 backdrop-blur-md h-[68px] flex items-center">
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-purple-700 flex items-center justify-center text-white shadow-sm group-hover:bg-purple-800 transition-colors">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-gray-900 leading-none">AllotX</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 uppercase tracking-wide">
                Hub
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium hidden sm:block mt-0.5">
              IPO intelligence, simplified.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            if (link.highlight) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ml-2 px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-purple-700 bg-purple-50 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Action & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/my-ipos"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5 text-purple-700" /> Account
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[68px] left-0 right-0 bg-white border-b border-gray-200 p-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                pathname === link.href
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
