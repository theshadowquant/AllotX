'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, TrendingUp, UserCheck, Menu } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'IPOs', href: '/ipos', icon: Layers },
    { label: 'GMP', href: '/gmp', icon: TrendingUp },
    { label: 'My IPOs', href: '/my-ipos', icon: UserCheck },
    { label: 'More', href: '/calendar', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#090D16]/95 border-t border-[#1F293D] px-2 py-1 backdrop-blur-md">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
