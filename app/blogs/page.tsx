import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'IPO Educational Guides & Blogs — AllotX',
  description: 'Learn how IPO allotment works, how to read Grey Market Premiums (GMP), and bidding strategies for retail investors.',
};

export default function BlogsPage() {
  const blogs = [
    {
      title: 'How IPO Allotment Works in India: Complete Guide for Retail Investors',
      category: 'Allotment Guide',
      date: '18 Aug 2026',
      summary:
        'Understand how BSE and NSE process retail applications in oversubscribed IPOs. Learn about the lottery mechanism, UPI mandate unblocking, and Demat share credit timelines.',
    },
    {
      title: 'What is Grey Market Premium (GMP) and How is it Calculated?',
      category: 'GMP Research',
      date: '15 Aug 2026',
      summary:
        'An in-depth explanation of OTC grey market trading in Indian IPOs. Learn how buyers and sellers trade unofficial application rates and listing price estimates.',
    },
    {
      title: 'Understanding QIB, NII, and Retail Subscription Categories',
      category: 'Subscription Rules',
      date: '10 Aug 2026',
      summary:
        'What do 100x QIB bids and 50x NII bids mean for retail allotment probability? Learn how institutional demand influences listing day price trends.',
    },
    {
      title: 'How to Apply Across Multiple Family PAN Numbers Legally',
      category: 'Strategy',
      date: '05 Aug 2026',
      summary:
        'Maximizing retail allotment odds by filing one application per unique family PAN number using distinct ASBA bank accounts or UPI IDs.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-gray-200 pb-4 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700">IPO RESEARCH & GUIDES</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Retail Investor Knowledge Base</h1>
        <p className="text-sm text-gray-600">
          Practical educational guides on Indian IPO processes, subscription bidding, allotment calculations, and grey market mechanics.
        </p>
      </div>

      <div className="space-y-4">
        {blogs.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
                {item.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{item.date}</span>
            </div>

            <h2 className="font-extrabold text-base text-gray-900 hover:text-purple-700 transition-colors">
              {item.title}
            </h2>

            <p className="text-xs text-gray-600 leading-relaxed">{item.summary}</p>

            <div className="pt-2">
              <span className="text-xs font-bold text-purple-700 inline-flex items-center gap-1">
                Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
