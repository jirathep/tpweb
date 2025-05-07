import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Sarabun } from 'next/font/google';
import '../globals.css';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { BookingProvider } from '@/context/BookingContext';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import {notFound} from 'next/navigation';
import {cn} from '@/lib/utils';

const geistSans = GeistSans({
  variable: '--font-geist-sans',
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
});

const sarabun = Sarabun({
  variable: '--font-sarabun',
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Prompt eTicket',
  description: 'Book event seats for concerts, sports, conferences and more.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

const locales = ['en', 'th'];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  if (!locales.includes(locale)) {
    notFound();
  }
  const messages = useMessages();

  return (
    <html lang={locale} className={cn(
      geistSans.variable, 
      geistMono.variable, 
      sarabun.variable,
      locale === 'th' ? sarabun.className : geistSans.className, // Apply Sarabun for Thai, Geist for others
      'dark', 
      'antialiased'
      )}
      suppressHydrationWarning // Recommended for next-themes / dark mode
      >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BookingProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </BookingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
