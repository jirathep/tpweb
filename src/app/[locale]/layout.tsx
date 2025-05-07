
import type { Metadata, Viewport } from 'next';
// Import GeistSans and GeistMono directly as font objects
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// Sarabun is a font loader function from next/font/google
import { Sarabun } from 'next/font/google';
import '../globals.css';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Toaster } from '@/components/ui/toaster';
import { BookingProvider } from '@/context/BookingContext';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import {notFound} from 'next/navigation';
import {cn} from '@/lib/utils';

// Sarabun is a loader function, call it to get the font object
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
      GeistSans.variable, // Use imported GeistSans object directly
      GeistMono.variable, // Use imported GeistMono object directly
      sarabun.variable,   // This is the instance from calling Sarabun(...)
      locale === 'th' ? sarabun.className : GeistSans.className, // Use Sarabun instance or imported GeistSans object
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

