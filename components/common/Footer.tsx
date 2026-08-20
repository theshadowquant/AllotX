import React from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldCheck, FileText, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8 text-gray-600 text-xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-200">
          {/* Column 1: Brand & Core Links */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900">AllotX</span>
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed">
              India's IPO intelligence hub. Simplifying Grey Market Premiums (GMP), subscription statistics, and multi-PAN allotment checks for ordinary retail investors.
            </p>
            <div className="pt-1 space-y-1 font-medium">
              <Link href="/gmp" className="block text-gray-700 hover:text-purple-700 transition-colors">
                Live IPO GMP
              </Link>
              <Link href="/ipos" className="block text-gray-700 hover:text-purple-700 transition-colors">
                IPO Screener & Directory
              </Link>
              <Link href="/calendar" className="block text-gray-700 hover:text-purple-700 transition-colors">
                IPO Market Calendar
              </Link>
              <Link href="/my-ipos" className="block text-gray-700 hover:text-purple-700 transition-colors">
                Check IPO Allotment Status
              </Link>
            </div>
          </div>

          {/* Column 2: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Legal & Trust</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/about" className="hover:text-purple-700">About AllotX</Link></li>
              <li><span className="text-gray-400">Privacy Policy</span></li>
              <li><span className="text-gray-400">Terms of Use</span></li>
              <li><span className="text-gray-400">Data Sourcing Methodology</span></li>
              <li><span className="text-gray-400">Official Registrar Verification</span></li>
            </ul>
          </div>

          {/* Column 3: IPO Research Guides */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">IPO Research Guides</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/blogs" className="hover:text-purple-700">How IPO Allotment Works</Link></li>
              <li><Link href="/blogs" className="hover:text-purple-700">Understanding Grey Market Premium (GMP)</Link></li>
              <li><Link href="/blogs" className="hover:text-purple-700">QIB, NII & Retail Subscription Rules</Link></li>
              <li><Link href="/blogs" className="hover:text-purple-700">How to Apply for Multiple Family PANs</Link></li>
            </ul>
          </div>

          {/* Column 4: Registrar Notice */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Supported Registrars</h4>
            <p className="text-gray-500 text-xs">
              AllotX connects directly to official Indian registrar inquiry interfaces including KFin Technologies, Link Intime (MUFG), Bigshare Services, and Cameo Corporate Services.
            </p>
            <div className="inline-flex items-center gap-1.5 p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-700" />
              <span>AES-256-GCM Encrypted PAN Storage</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-gray-500 text-[11px]">
          <p>© 2026 AllotX. All rights reserved.</p>
          <p className="max-w-2xl">
            <strong>Disclaimer:</strong> IPO information on AllotX is for educational and informational purposes only. Grey Market Premium (GMP) represents unofficial market sentiment and does not guarantee stock exchange listing performance or returns.
          </p>
        </div>
      </div>
    </footer>
  );
}
