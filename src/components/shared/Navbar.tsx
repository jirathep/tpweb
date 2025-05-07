import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TicketIcon, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

export default function Navbar() {
  const t = useTranslations('Navbar');

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-primary">
            <TicketIcon className="h-8 w-8 text-foreground" />
          </Link>
          {/* Dummy Search Input */}
          <div className="relative ml-6 hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="h-9 w-full rounded-md bg-background pl-9 md:w-[200px] lg:w-[300px] border-border focus:ring-primary focus:border-primary"
              aria-label={t('searchPlaceholder')}
            />
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/events">{t('events')}</Link>
          </Button>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/90 hover:bg-primary/10">
            <Link href="/signup">{t('signup')}</Link>
          </Button>
          <Button variant="default" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/login">{t('login')}</Link>
          </Button>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
