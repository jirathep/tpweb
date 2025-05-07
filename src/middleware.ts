import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'th'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Don't localize these paths
  localePrefix: 'always', // Could be 'as-needed' or 'never'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - …if they start with `/api`, `/_next` or `/_vercel`
    // - …the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};