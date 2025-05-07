'use client';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background border-t border-border py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}
