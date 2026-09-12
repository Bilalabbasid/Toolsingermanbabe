export const DEFAULT_LOCALE = 'de';

export const SUPPORTED_LOCALES = ['de'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Architecture-ready configuration for planned multi-language expansion:
// German (de), Spanish (es), Dutch (nl), English (en)
export const PLANNED_LOCALES = ['de', 'es', 'nl', 'en'] as const;
export type PlannedLocale = (typeof PLANNED_LOCALES)[number];

export const LOCALE_LABELS: Record<string, { name: string; nativeName: string; flag: string }> = {
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
};

export function isValidLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function getCleanPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function getAlternateUrls(baseUrl: string, cleanPath: string): Record<string, string> {
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  const suffix = normalizedPath === '/' ? '' : normalizedPath;

  const alternates: Record<string, string> = {};

  for (const loc of SUPPORTED_LOCALES) {
    alternates[loc] = `${baseUrl}/${loc}${suffix}`;
  }

  // x-default points to primary default locale (/de)
  alternates['x-default'] = `${baseUrl}/${DEFAULT_LOCALE}${suffix}`;

  return alternates;
}
