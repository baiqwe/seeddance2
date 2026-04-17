import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale: 'en',
  // Always use locale prefix for Cloudflare Pages compatibility
  localePrefix: 'always',
  // Locale is fully encoded in the URL, so we disable locale cookies/detection
  // to keep public pages cacheable on Vercel CDN.
  localeDetection: false,
  localeCookie: false
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

const localePrefixPattern = new RegExp(`^/(${locales.join('|')})(?=/|$)`);

export function getLocaleFromPathname(pathname?: string | null): Locale {
  const firstSegment = pathname?.split('/')[1];
  return locales.find((locale) => locale === firstSegment) ?? routing.defaultLocale;
}

export function stripLocalePrefix(pathname?: string | null): string {
  if (!pathname) return '/';

  const withoutLocale = pathname.replace(localePrefixPattern, '');
  return withoutLocale || '/';
}
