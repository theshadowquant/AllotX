import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';

export const metadata: Metadata = {
  title: 'AllotX — Indian IPO Intelligence & Allotment Platform',
  description:
    'IPO intelligence, simplified. Track live & historical GMP, subscription statistics, IPO dates, and check multi-PAN allotment status across Indian registrars.',
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
      <body className="bg-background text-gray-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Header />
        <main className="flex-1 pb-20 sm:pb-12 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
          {children}
        </main>
        <footer className="hidden sm:block border-t border-border/80 py-6 text-center text-xs text-gray-500 max-w-7xl mx-auto px-6">
          <p>AllotX © 2026 — IPO intelligence, simplified.</p>
          <p className="mt-1 text-[11px] text-gray-600">
            IPO information provided for informational purposes only. GMP is unofficial sentiment and does not guarantee listing performance.
          </p>
        </footer>
        <BottomNavigation />
      </body>
    </html>
  );
}
