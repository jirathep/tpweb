'use client';

import type { ComponentProps } from 'react';
// Removed useState and useEffect as isClient is no longer needed for trigger content
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Simplified SVG for Thailand Flag
const ThaiFlagIcon = (props: ComponentProps<'svg'>) => (
  <svg width="20" height="14" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-3.5 w-5 rounded-sm", props.className)} {...props}>
    <rect width="60" height="40" fill="#F4F5F8"/> {/* White background part */}
    <path d="M0 0H60V6.66H0V0Z" fill="#A51931"/> {/* Top Red */}
    <path d="M0 13.33H60V26.66H0V13.33Z" fill="#2D2A4A"/> {/* Middle Blue */}
    <path d="M0 33.33H60V40H0V33.33Z" fill="#A51931"/> {/* Bottom Red */}
  </svg>
);

// Simplified SVG for UK (Union Jack) Flag
const UkFlagIcon = (props: ComponentProps<'svg'>) => (
  <svg width="20" height="14" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className={cn("h-3.5 w-5 rounded-sm", props.className)} {...props}>
    <rect width="60" height="30" fill="#012169"/> {/* Blue background */}
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6"/> {/* St Andrew's Cross (white) */}
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/> {/* St Patrick's Cross (red, narrower) */}
    <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10"/> {/* St George's Cross (white) */}
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/> {/* St George's Cross (red, narrower) */}
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
      <SelectTrigger
        className="w-auto bg-transparent border-none focus:ring-0 focus:ring-offset-0 text-foreground hover:bg-accent/10 px-2 py-1.5 h-auto flex items-center gap-1.5"
        aria-label={t('label')}
      >
        {/* Always render the content based on current locale.
            useLocale() is available on both server and client.
            This ensures server and client initial renders match. */}
        <>
          {locale === 'th' ? <ThaiFlagIcon /> : <UkFlagIcon />}
          <span className="text-xs font-medium">{locale.toUpperCase()}</span>
        </>
      </SelectTrigger>
      <SelectContent className="min-w-[8rem] bg-popover text-popover-foreground">
        <SelectItem value="en" className="cursor-pointer flex items-center gap-2 py-1.5">
          <UkFlagIcon /> <span className="text-xs">{t('en')}</span>
        </SelectItem>
        <SelectItem value="th" className="cursor-pointer flex items-center gap-2 py-1.5">
          <ThaiFlagIcon /> <span className="text-xs">{t('th')}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
