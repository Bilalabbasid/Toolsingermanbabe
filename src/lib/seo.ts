import type { Metadata } from 'next';
import { ToolDefinition } from '@/types/tool';
import { CategoryInfo } from '@/config/categories.config';
import { DEFAULT_LOCALE, getAlternateUrls } from '@/config/i18n.config';

/**
 * Canonical production origin. Canonical URLs, sitemap, robots, Open Graph
 * and JSON-LD must always point at the production brand domain — even on
 * preview/staging deployments — so this is intentionally not taken from an
 * environment variable (old deployment env files still carry legacy domains).
 */
export const SITE_URL = 'https://datei-tools.de';
export const SITE_NAME = 'Datei Tools';
export const SITE_DESCRIPTION =
  'Kostenlose Datei-Tools für PDF, Bilder, Dokumente, Video und Archive. Alle Werkzeuge laufen lokal im Browser – Ihre Dateien werden nicht hochgeladen.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_ORG_LOGO = `${SITE_URL}/icon-512.png`;
export const SITE_LOCALE = 'de_DE';
export const BLOG_AUTHOR = 'Datei Tools Redaktion';

/** Recommended maximum lengths for SERP snippets. */
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;
const BRAND_SUFFIXES = [' | Datei Tools', ' – Datei Tools', ' - Datei Tools'];

/**
 * Keeps <title> within ~60 chars: if a title is too long and ends with the
 * brand suffix, the suffix is dropped (Google shows the site name separately).
 */
export function fitTitle(title: string, max: number = MAX_TITLE_LENGTH): string {
  const clean = title.trim();
  if (clean.length <= max) return clean;
  for (const suffix of BRAND_SUFFIXES) {
    if (clean.endsWith(suffix)) return clean.slice(0, -suffix.length).trim();
  }
  return clean;
}

/** Appends " | Datei Tools" when it still fits into the title budget. */
export function withBrand(title: string, max: number = MAX_TITLE_LENGTH): string {
  const clean = title.trim();
  if (BRAND_SUFFIXES.some((s) => clean.endsWith(s))) return fitTitle(clean, max);
  const branded = `${clean} | ${SITE_NAME}`;
  return branded.length <= max ? branded : clean;
}

/** Trims descriptions to ≤ 160 chars at a word boundary. */
export function fitDescription(description: string, max: number = MAX_DESCRIPTION_LENGTH): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[,;:–-]+$/, '')}…`;
}

/** Absolute URL for a locale-relative path ("/blog" -> https://datei-tools.de/de/blog). */
export function localeUrl(path: string, locale: string = DEFAULT_LOCALE): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}/${locale}${normalized === '/' ? '' : normalized}`;
}

function toOgLocale(locale: string): string {
  return locale === 'de' ? SITE_LOCALE : `${locale}_${locale.toUpperCase()}`;
}

const INDEX_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

function robotsFor(index: boolean, follow: boolean = index): Metadata['robots'] {
  if (index && follow) return INDEX_ROBOTS;
  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

interface BaseMetadataInput {
  title: string;
  description: string;
  url: string;
  cleanPath: string;
  locale: string;
  image: string;
  imageAlt: string;
  type?: 'website' | 'article';
  index?: boolean;
  follow?: boolean;
}

function buildMetadata({
  title,
  description,
  url,
  cleanPath,
  locale,
  image,
  imageAlt,
  type = 'website',
  index = true,
  follow,
}: BaseMetadataInput): Metadata {
  const fittedTitle = withBrand(fitTitle(title));
  const fittedDescription = fitDescription(description);
  return {
    title: fittedTitle,
    description: fittedDescription,
    alternates: {
      canonical: url,
      languages: getAlternateUrls(SITE_URL, cleanPath),
    },
    openGraph: {
      title: fittedTitle,
      description: fittedDescription,
      url,
      siteName: SITE_NAME,
      locale: toOgLocale(locale),
      type,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fittedTitle,
      description: fittedDescription,
      images: [image],
    },
    robots: robotsFor(index, follow ?? index),
  };
}

/**
 * SERP title for a tool page (≤ 60 chars). Long editorial titles like
 * "X umwandeln – lange Erklärung | Datei Tools" fall back to a compact,
 * still unique variant built from the part before the dash.
 */
export function toolTitle(tool: ToolDefinition): string {
  const full = tool.titleDe.trim();
  const unbranded = fitTitle(full, 0);
  const head = unbranded.split(/\s[–-]\s/)[0].trim();
  const candidates = [
    full,
    unbranded,
    `${head} – kostenlos, ohne Upload | ${SITE_NAME}`,
    `${head} – kostenlos & ohne Upload`,
    `${head} online – kostenlos | ${SITE_NAME}`,
    `${head} | ${SITE_NAME}`,
    head,
  ];
  return candidates.find((c) => c.length <= MAX_TITLE_LENGTH) ?? head;
}

/**
 * Generate fully-compliant Next.js Metadata for any Tool
 */
export function generateToolMetadata(tool: ToolDefinition, locale: string = DEFAULT_LOCALE): Metadata {
  const indexable = tool.processingEngine !== 'pdf-pdfa';
  return buildMetadata({
    title: toolTitle(tool),
    description: tool.metaDescriptionDe,
    url: localeUrl(`/${tool.slug}`, locale),
    cleanPath: `/${tool.slug}`,
    locale,
    image: `${SITE_URL}/${locale}/${tool.slug}/opengraph-image`,
    imageAlt: `${tool.nameDe} – kostenlos im Browser | ${SITE_NAME}`,
    index: indexable,
    follow: true,
  });
}

/**
 * Generate fully-compliant Next.js Metadata for Category Hub Pages
 */
export function generateCategoryMetadata(catInfo: CategoryInfo, locale: string = DEFAULT_LOCALE): Metadata {
  return buildMetadata({
    title: catInfo.metaTitle,
    description: catInfo.metaDescription,
    url: localeUrl(`/kategorie/${catInfo.slug}`, locale),
    cleanPath: `/kategorie/${catInfo.slug}`,
    locale,
    image: DEFAULT_OG_IMAGE,
    imageAlt: `${catInfo.name} – ${SITE_NAME}`,
  });
}

/**
 * Generate fully-compliant Next.js Metadata for Standard / Static Pages
 */
export function generatePageMetadata({
  title,
  description,
  path,
  locale = DEFAULT_LOCALE,
  noIndex = false,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return buildMetadata({
    title,
    description,
    url: localeUrl(normalizedPath, locale),
    cleanPath: normalizedPath,
    locale,
    image,
    imageAlt: `${fitTitle(title)} | ${SITE_NAME}`,
    index: !noIndex,
  });
}

/**
 * Generate fully-compliant Next.js Metadata for Blog Articles
 */
export function generateArticleMetadata({
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
  locale = DEFAULT_LOCALE,
  section,
  tags,
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  locale?: string;
  section?: string;
  tags?: string[];
}): Metadata {
  const base = buildMetadata({
    title,
    description,
    url: localeUrl(`/blog/${slug}`, locale),
    cleanPath: `/blog/${slug}`,
    locale,
    image: `${SITE_URL}/${locale}/blog/${slug}/opengraph-image`,
    imageAlt: `${fitTitle(title)} – ${SITE_NAME} Ratgeber`,
    type: 'article',
  });

  return {
    ...base,
    authors: [{ name: BLOG_AUTHOR, url: localeUrl('/blog', locale) }],
    keywords: tags,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: updatedAt || publishedAt,
      authors: [BLOG_AUTHOR],
      section,
      tags,
    },
  };
}

// ==========================================
// SCHEMA.ORG STRUCTURED DATA GENERATORS
// ==========================================

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_ORG_LOGO,
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    email: 'info@datei-tools.de',
  };
}

/**
 * WebSite schema for the homepage. No SearchAction: the site search is a
 * client-side modal without a crawlable result URL, so declaring one would
 * be invalid structured data.
 */
export function generateWebsiteSchema(locale: string = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: 'datei-tools.de',
    url: `${SITE_URL}/${locale}`,
    description: SITE_DESCRIPTION,
    inLanguage: locale === 'de' ? 'de-DE' : locale,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * SoftwareApplication structured data for a tool page (no fake ratings).
 * Kept under the historical name because ToolPage imports it.
 */
export function generateWebApplicationSchema(tool: ToolDefinition, locale: string = DEFAULT_LOCALE) {
  const url = localeUrl(`/${tool.slug}`, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#app`,
    name: tool.nameDe,
    headline: tool.h1De,
    url,
    description: fitDescription(tool.metaDescriptionDe, 300),
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: tool.supportedFormats,
    operatingSystem: 'Windows, macOS, Linux, iOS, Android (aktueller Webbrowser)',
    browserRequirements: 'Benötigt JavaScript und WebAssembly in einem aktuellen Browser.',
    isAccessibleForFree: true,
    inLanguage: locale === 'de' ? 'de-DE' : locale,
    image: `${SITE_URL}/${locale}/${tool.slug}/opengraph-image`,
    ...(tool.features && tool.features.length > 0 ? { featureList: tool.features } : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    publisher: { '@id': ORGANIZATION_ID },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** Alias with the semantically correct name. */
export const generateSoftwareApplicationSchema = generateWebApplicationSchema;

/**
 * Generic FAQPage structured data.
 */
export function generateFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * FAQPage structured data for a tool
 */
export function generateFAQSchema(tool: ToolDefinition) {
  return generateFAQPageSchema(tool.faqDe);
}

/**
 * HowTo structured data (tool "So funktioniert's" steps or article steps).
 */
export function generateHowToSchema({
  name,
  description,
  url,
  steps,
  toolName,
  totalTime,
  stepAnchors = false,
}: {
  name: string;
  description: string;
  url: string;
  steps: Array<{ step: number; title: string; text: string }>;
  toolName?: string;
  totalTime?: string;
  /** Steps are rendered with id="schritt-N" anchors on the page. */
  stepAnchors?: boolean;
}) {
  if (!steps || steps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    url,
    description: fitDescription(description, 300),
    inLanguage: 'de-DE',
    ...(totalTime ? { totalTime } : {}),
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
    ...(toolName ? { tool: [{ '@type': 'HowToTool', name: toolName }] } : {}),
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.step,
      name: s.title,
      text: s.text,
      ...(stepAnchors ? { url: `${url}#schritt-${s.step}` } : {}),
    })),
  };
}

/**
 * Clean Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * CollectionPage schema for category hub pages
 */
export function generateCollectionPageSchema(catInfo: CategoryInfo, locale: string = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: catInfo.name,
    headline: catInfo.h1,
    description: catInfo.metaDescription,
    url: localeUrl(`/kategorie/${catInfo.slug}`, locale),
    inLanguage: locale === 'de' ? 'de-DE' : locale,
    isPartOf: { '@id': WEBSITE_ID, '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/${locale}` },
  };
}

/**
 * ItemList schema for listing pages (blog index, blog hubs, tool hubs).
 */
export function generateItemListSchema(items: Array<{ name: string; url: string }>, name?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Schema.org BlogPosting JSON-LD
 */
export function generateArticleSchema({
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
  author = BLOG_AUTHOR,
  locale = DEFAULT_LOCALE,
  section,
  keywords,
  wordCount,
  aboutTool,
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  locale?: string;
  section?: string;
  keywords?: string[];
  wordCount?: number;
  aboutTool?: { name: string; url: string };
}) {
  const pageUrl = localeUrl(`/blog/${slug}`, locale);
  const ogImageUrl = `${SITE_URL}/${locale}/blog/${slug}/opengraph-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: title.length > 110 ? `${title.slice(0, 107)}…` : title,
    description,
    image: [ogImageUrl],
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Organization',
      name: author,
      url: localeUrl('/blog', locale),
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_ORG_LOGO,
      },
    },
    isPartOf: {
      '@type': 'Blog',
      name: `${SITE_NAME} Ratgeber`,
      url: localeUrl('/blog', locale),
    },
    ...(section ? { articleSection: section } : {}),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    ...(wordCount ? { wordCount } : {}),
    ...(aboutTool ? { mentions: { '@type': 'SoftwareApplication', name: aboutTool.name, url: aboutTool.url } } : {}),
    inLanguage: locale === 'de' ? 'de-DE' : locale,
  };
}

/** Serialize data without allowing HTML to terminate the surrounding script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
