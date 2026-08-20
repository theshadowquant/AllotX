import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';

export const metadata: Metadata = {
  title: 'AllotX — Indian IPO Intelligence Platform',
  description:
    'IPO intelligence, simplified. Track live & historical GMP, subscription statistics, IPO dates, and manage multi-PAN allotment status across Indian registrars.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'AllotX',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#090D16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#090D16] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
        <Header />
        <main className="flex-1 pb-16 md:pb-8 max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-5">
          {children}
        </main>
        <footer className="hidden md:block border-t border-[#1F293D] py-4 text-center text-xs text-gray-500 max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AllotX © 2026 — IPO intelligence, simplified.</span>
            <span className="text-[11px] text-gray-600">
              IPO information is for informational purposes only. GMP is unofficial market sentiment and does not guarantee listing performance.
            </span>
          </div>
        </footer>
        <BottomNavigation />
      </body>
    </html>
  );
}
