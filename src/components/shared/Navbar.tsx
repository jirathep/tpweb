import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { TicketIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function Navbar() {
  const t = useTranslations('Navbar');

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <TicketIcon className="h-8 w-8 text-foreground" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/events">{t('events')}</Link>
          </Button>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/90">
            <Link href="/signup">{t('signup')}</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
