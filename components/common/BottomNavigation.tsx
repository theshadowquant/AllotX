'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, TrendingUp, UserCheck, Settings } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'HOME', href: '/', icon: Home },
    { label: 'IPOs', href: '/ipos', icon: Layers },
    { label: 'GMP', href: '/gmp', icon: TrendingUp },
    { label: 'MY IPOs', href: '/my-ipos', icon: UserCheck },
    { label: 'ADMIN', href: '/admin', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden glass-panel border-t border-border/80 px-2 py-1.5 backdrop-blur-md">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
