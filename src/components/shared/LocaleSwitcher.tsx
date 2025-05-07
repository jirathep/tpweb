'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next-intl/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-auto bg-transparent border-none focus:ring-0 focus:ring-offset-0 text-foreground hover:bg-accent/10 px-2 py-1.5 h-auto" aria-label={t('label')}>
         <Globe className="h-5 w-5" />
        {/* <SelectValue placeholder={t('label')} /> */}
      </SelectTrigger>
      <SelectContent className="min-w-[8rem] bg-popover text-popover-foreground">
        <SelectItem value="en" className="cursor-pointer">{t('en')}</SelectItem>
        <SelectItem value="th" className="cursor-pointer">{t('th')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
