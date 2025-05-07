
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Simplified SVG for Thailand Flag
const ThaiFlagIcon = () => (
  <svg width="20" height="14" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rounded-sm">
    <rect width="60" height="40" fill="#F4F5F8"/> {/* White background part */}
    <path d="M0 0H60V6.66H0V0Z" fill="#A51931"/> {/* Top Red */}
    <path d="M0 13.33H60V26.66H0V13.33Z" fill="#2D2A4A"/> {/* Middle Blue */}
    <path d="M0 33.33H60V40H0V33.33Z" fill="#A51931"/> {/* Bottom Red */}
  </svg>
);

// Simplified SVG for USA Flag
const UsaFlagIcon = () => (
 <svg width="20" height="14" viewBox="0 0 38 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rounded-sm">
    <rect width="38" height="20" fill="#fff"/>
    <path d="M0 0H38V2.5H0V0Z" fill="#BF0A30"/>
    <path d="M0 5H38V7.5H0V5Z" fill="#BF0A30"/>
    <path d="M0 10H38V12.5H0V10Z" fill="#BF0A30"/>
    <path d="M0 15H38V17.5H0V15Z" fill="#BF0A30"/>
    <rect width="16" height="10" fill="#002868"/>
  </svg>
);


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
        {locale === 'th' ? <ThaiFlagIcon /> : <UsaFlagIcon />}
        {/* <SelectValue placeholder={t('label')} /> */}
      </SelectTrigger>
      <SelectContent className="min-w-[8rem] bg-popover text-popover-foreground">
        <SelectItem value="en" className="cursor-pointer flex items-center gap-2">
          <UsaFlagIcon /> {t('en')}
        </SelectItem>
        <SelectItem value="th" className="cursor-pointer flex items-center gap-2">
          <ThaiFlagIcon /> {t('th')}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

