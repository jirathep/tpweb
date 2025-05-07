import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'th'] as const;
export const localePrefix = 'always'; // Default

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, use the usual
  // path transform. You can also specify an object
  // with paths specific to each locale.
  '/': '/',
  '/events': '/events',
  '/events/[eventId]': '/events/[eventId]',
  '/events/[eventId]/select-seats': '/events/[eventId]/select-seats',
  '/events/[eventId]/summary': '/events/[eventId]/summary',
  '/events/[eventId]/ticket': '/events/[eventId]/ticket',
  '/login': '/login',
  '/signup': '/signup',

  // Example with locale-specific pathnames
  // If you need to translate paths, you can
  // specify them here, e.g. `/de/ueber-uns`
  // '/about': {
  //   en: '/about',
  //   th: '/เกี่ยวกับเรา' // example
  // }
} satisfies Record<string, string | Record<typeof locales[number], string>>;

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});
