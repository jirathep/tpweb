import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TicketIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <TicketIcon className="h-8 w-8" />
          <span>Prompt eTicket</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/events">Events</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
