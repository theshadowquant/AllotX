import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { BottomNavigation } from '@/components/common/BottomNavigation';

export const metadata: Metadata = {
  title: "AllotX — India's IPO Hub for GMP, Subscription & Allotment",
  description:
    'Track open and upcoming Indian IPOs, live grey market premium (GMP), subscription statistics, and check allotment status across multiple PAN applications.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'AllotX',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
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
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col antialiased selection:bg-purple-600 selection:text-white">
        <Header />
        <main className="flex-1 pb-16 md:pb-8 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-4">
          {children}
        </main>
        <Footer />
        <BottomNavigation />
      </body>
    </html>
  );
}
