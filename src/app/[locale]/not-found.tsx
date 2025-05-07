'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation'; // Updated import
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <AlertTriangle className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-3">{t('title')}</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        {t('description')}
      </p>
      <Button asChild size="lg">
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  );
}

// Add to messages/en.json
/*
{
  "NotFoundPage": {
    "title": "Page Not Found",
    "description": "Oops! The page you are looking for does not exist. It might have been moved or deleted.",
    "goHome": "Go to Homepage"
  }
}
*/

// Add to messages/th.json
/*
{
  "NotFoundPage": {
    "title": "ไม่พบหน้า",
    "description": "ขออภัย! ไม่พบหน้าที่คุณกำลังมองหา อาจถูกย้ายหรือลบไปแล้ว",
    "goHome": "ไปที่หน้าแรก"
  }
}
*/

