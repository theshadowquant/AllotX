import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, Database, TrendingUp, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'About AllotX — Indian IPO Intelligence & Allotment Engine',
  description: 'Learn about AllotX, our data sourcing methodology, AES-256-GCM security, and official registrar enquiry integrations.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700">ABOUT ALLOTX</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">IPO intelligence, simplified.</h1>
        <p className="text-sm text-gray-600">
          AllotX is a dedicated Indian IPO utility platform created to help ordinary retail investors track Grey Market Premiums (GMP), category bidding statistics, and manage multi-PAN allotment enquiries cleanly.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">What We Do</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We aggregate market statistics, category subscription multipliers (QIB, NII, Retail), and grey market premium data into a clean, ad-free financial utility interface.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Multi-PAN Allotment Verification</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Instead of manually navigating disparate registrar portals repeatedly, AllotX connects to supported official registrar enquiry interfaces (KFintech, Link Intime, Bigshare, Cameo) so family portfolios can be checked in a single click.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Data Sourcing Methodology</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All subscription data is sourced directly from exchange bidding feeds (BSE/NSE). GMP indicators are computed using a multi-source consensus engine to classify confidence levels.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900">PAN Encryption & Privacy</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your PAN number is encrypted at rest on our server using native Node.js AES-256-GCM authenticated encryption. Raw PANs are never logged or exposed in URLs.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl text-center space-y-3">
        <h3 className="font-extrabold text-base text-gray-900">Ready to track your IPO applications?</h3>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Start managing your portfolio allotments cleanly with AllotX.
        </p>
        <Link
          href="/my-ipos"
          className="inline-block px-5 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:bg-purple-800 transition-colors"
        >
          Check IPO Allotments Now
        </Link>
      </div>
    </div>
  );
}
