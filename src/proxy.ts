import { ownerId, setOwnerCookie, isAdminRequest } from '@/server/security/request';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/i18n.config';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accountsEnabled = process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true';
  const billingEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true';
  const localizedPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
  if (!accountsEnabled && /^\/(?:login|register|konto)(?:\/|$)/.test(localizedPath)) {
    const url = request.nextUrl.clone();
    url.pathname = '/de';
    url.search = '';
    return NextResponse.redirect(url, 307);
  }
  if (!billingEnabled && /^\/preise(?:\/|$)/.test(localizedPath)) {
    const url = request.nextUrl.clone();
    url.pathname = '/de';
    url.search = '';
    return NextResponse.redirect(url, 307);
  }

  if (/^\/(?:[a-z]{2}\/)?admin(?:\/|$)/.test(pathname) && !(await isAdminRequest(request))) {
    return new NextResponse('Nicht autorisiert.', { status: 401, headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } });
  }
  // 1. Skip static assets, API routes, and standard SEO endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check if the pathname already has a supported locale prefix
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // 3. Permanent 308 redirect to localized route:
    // e.g. /pdf-in-word-umwandeln -> /de/pdf-in-word-umwandeln
    // e.g. / -> /de
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url, 308);
  }

  return setOwnerCookie(request, NextResponse.next(), ownerId(request));
}

export const config = {
  matcher: [
    /*
     * Keep upload APIs out of Proxy entirely. Next.js buffers proxied request
     * bodies and truncates them at 10 MB by default, which corrupts large
     * multipart file uploads before the route-level limits can validate them.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
