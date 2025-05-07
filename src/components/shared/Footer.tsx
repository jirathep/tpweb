
'use client';
import type { ComponentProps } from 'react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Facebook, Instagram, Twitter } from 'lucide-react'; 

// Placeholder for Line icon as it's not in Lucide. 
// A more accurate SVG or component would be used in a real scenario.
const LineIcon = (props: ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" {...props}>
    <path d="M16.29,10.68a.75.75,0,0,0-.75-.75H14V8.75a.75.75,0,0,0-1.5,0V10H11.26a.75.75,0,0,0,0,1.5h1.22V13a.75.75,0,0,0,1.5,0V11.47h1.53A.75.75,0,0,0,16.29,10.68ZM9.81,13V8.75a.75.75,0,0,0-1.5,0V13a.75.75,0,0,0,1.5,0ZM6,10.68a.75.75,0,0,0-.75-.75H4V8.75a.75.75,0,0,0-1.5,0V10H1.25a.75.75,0,0,0,0,1.5h1.23V13a.75.75,0,0,0,1.5,0V11.47H5.2A.75.75,0,0,0,6,10.68Zm14.57-5.12A7.35,7.35,0,0,0,12,2,7.34,7.34,0,0,0,5,4.71V4a.75.75,0,0,0-1.5,0V5.88A7.32,7.32,0,0,0,2,12a7.32,7.32,0,0,0,1.5,4.12V18a.75.75,0,0,0,1.5,0V16.71a7.35,7.35,0,0,0,8.55,2.73,1,1,0,0,0,.55.55,7.31,7.31,0,0,0,6.45-3.87H21.3a.75.75,0,0,0,0-1.5H19.54A7.26,7.26,0,0,0,22,12,7.3,7.3,0,0,0,20.55,5.56Zm-1.5,9.3A5.82,5.82,0,0,1,12,17.7a5.82,5.82,0,0,1-7.07-2.84H5.87a.75.75,0,0,0,0-1.5H4.93A5.82,5.82,0,0,1,3.5,12a5.82,5.82,0,0,1,1.43-3.86h.94a.75.75,0,0,0,0-1.5H3.5A5.81,5.81,0,0,1,12,3.5a5.82,5.82,0,0,1,7.07,2.84h-.94a.75.75,0,0,0,0,1.5h.94A5.82,5.82,0,0,1,20.5,12,5.81,5.81,0,0,1,19.05,14.86Z" />
  </svg>
);


export default function Footer() {
  const t = useTranslations('Footer');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after the component mounts
    // This ensures that operations depending on browser-specific APIs or
    // values that might differ from SSR run only on the client post-hydration.
    setMounted(true);
    // If we needed to update the year based on client's date, we could do it here,
    // but new Date().getFullYear() is generally safe for SSR too.
    // setCurrentYear(new Date().getFullYear()); 
  }, []);

  const footerLinks = [
    {
      title: t('companyTitle'),
      links: [
        { label: t('aboutUs'), href: '#' },
        { label: t('privacyPolicy'), href: '#' },
        { label: t('termsOfService'), href: '#' },
        { label: t('contactAdvertise'), href: '#' },
        { label: t('careers'), href: '#' },
      ],
    },
    {
      title: t('servicesTitle'),
      links: [
        { label: t('allEvents'), href: '/events' },
        { label: t('news'), href: '#' }, 
        { label: t('application'), href: '#' },
      ],
    },
    {
      title: t('helpTitle'),
      links: [
        { label: t('contactUs'), href: '#' },
        { label: t('faq'), href: '#' },
        { label: t('paymentMethods'), href: '#' },
        { label: t('howToBuyTickets'), href: '#' },
        { label: t('needHelp'), href: '#' },
      ],
    },
    {
      title: t('forOrganizersTitle'),
      links: [
        { label: t('ourServices'), href: '#' },
        { label: t('contactEventHosting'), href: '#' },
      ],
    },
  ];

  // companyFullNameDisplay should now be consistent between server and client initial render.
  const companyFullNameDisplay = t('companyFullName'); 
  
  // copyrightText will use the year from SSR initially, and then update if needed (though unlikely for just year).
  // The `mounted` check here is more for values that *must* come from the client, like Math.random().
  // For `new Date().getFullYear()`, it's usually fine.
  const copyrightText = t('copyright', { year: currentYear });


  return (
    <footer className="bg-background border-t border-border py-10 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Company Info & Social */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-foreground">{companyFullNameDisplay}</span>
            </div>
            <p className="text-muted-foreground mb-1">{t('addressLine1')}</p>
            <p className="text-muted-foreground mb-1">{t('addressLine2')}</p>
            <p className="text-muted-foreground mb-3">{t('addressLine3')}</p>
            <p className="text-muted-foreground mb-1">{t('phoneLabel')}: {t('phoneNumber')}</p>
            <p className="text-muted-foreground mb-4">{t('emailLabel')}: {t('emailAddress')}</p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook /></a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter /></a>
              <a href="#" aria-label="Line" className="text-muted-foreground hover:text-primary"><LineIcon /></a>
            </div>
          </div>

          {/* Columns 2-5: Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

