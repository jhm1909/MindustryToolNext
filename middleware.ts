import { defaultLocale, Locale, locales } from '@/i18n/config';
import { NextRequest, NextResponse, userAgent } from 'next/server';

export function middleware(request: NextRequest) {
  const { isBot } = userAgent(request);

  let locale = request.cookies.get('Locale')?.value?.toLowerCase() as string | undefined;

  if (!locale) {
    const headers = request.headers;
    const acceptedLanguages = headers
      .get('Accept-Language')
      ?.split(/[;\-,]/)
      .filter((lang) => lang) //
      .map((lang) => lang.toLowerCase().trim()) //
      .filter((lang) => locales.includes(lang as Locale));

    locale = acceptedLanguages //
      ? acceptedLanguages[0]
      : defaultLocale;
  }

  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  const currentLocale = pathname.slice(1, 3).toLowerCase();

  if (pathnameHasLocale) {
    if (isBot) {
      return;
    }
  } else {
    locale = 'en';
  }

  if (pathnameHasLocale && currentLocale === locale) {
    return;
  }
  request.nextUrl.pathname = pathnameHasLocale ? `/${locale}/${pathname.slice(4)}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(request.nextUrl);

  response.cookies.set('Locale', locale, { path: '/' });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|assets|_next/image|favicon.ico|robots.txt|.*sitemap|ads).*)'],
};
