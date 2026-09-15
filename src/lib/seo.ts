import type { Metadata } from 'next';
import { ToolDefinition } from '@/types/tool';
import { CategoryInfo } from '@/config/categories.config';
import { DEFAULT_LOCALE, getAlternateUrls } from '@/config/i18n.config';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://coolwave.cool').replace(/\/+$/, '');
export const SITE_NAME = 'CoolWave';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_ORG_LOGO = `${SITE_URL}/icon-512.png`;

/**
 * Generate fully-compliant Next.js Metadata for any Tool
 */
export function generateToolMetadata(tool: ToolDefinition, locale: string = DEFAULT_LOCALE): Metadata {
  const pageUrl = `${SITE_URL}/${locale}/${tool.slug}`;
  const alternateLanguages = getAlternateUrls(SITE_URL, `/${tool.slug}`);

  const ogImageUrl = `${SITE_URL}/${locale}/${tool.slug}/opengraph-image`;

  return {
    title: tool.titleDe,
    description: tool.metaDescriptionDe,
    alternates: {
      canonical: pageUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: tool.titleDe,
      description: tool.metaDescriptionDe,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: locale === 'de' ? 'de_DE' : `${locale}_${locale.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.nameDe} – CoolWave Online Tools`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.titleDe,
      description: tool.metaDescriptionDe,
      images: [ogImageUrl],
    },
    robots: {
      index: tool.processingEngine !== 'pdf-pdfa',
      follow: true,
      googleBot: {
        index: tool.processingEngine !== 'pdf-pdfa',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate fully-compliant Next.js Metadata for Category Hub Pages
 */
export function generateCategoryMetadata(catInfo: CategoryInfo, locale: string = DEFAULT_LOCALE): Metadata {
  const pageUrl = `${SITE_URL}/${locale}/kategorie/${catInfo.slug}`;
  const alternateLanguages = getAlternateUrls(SITE_URL, `/kategorie/${catInfo.slug}`);

  return {
    title: catInfo.metaTitle,
    description: catInfo.metaDescription,
    alternates: {
      canonical: pageUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: catInfo.metaTitle,
      description: catInfo.metaDescription,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: locale === 'de' ? 'de_DE' : `${locale}_${locale.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${catInfo.name} – CoolWave Online Tools`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: catInfo.metaTitle,
      description: catInfo.metaDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
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
}: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  noIndex?: boolean;
}): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const pageUrl = `${SITE_URL}/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
  const alternateLanguages = getAlternateUrls(SITE_URL, normalizedPath);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: locale === 'de' ? 'de_DE' : `${locale}_${locale.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${title} | CoolWave`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ==========================================
// SCHEMA.ORG STRUCTURED DATA GENERATORS
// ==========================================

/**
 * Clean, compliant Schema.org WebApplication structured data (No misleading fake ratings)
 */
export function generateWebApplicationSchema(tool: ToolDefinition, locale: string = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.nameDe,
    headline: tool.h1De,
    url: `${SITE_URL}/${locale}/${tool.slug}`,
    description: tool.metaDescriptionDe,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    image: DEFAULT_OG_IMAGE,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Clean Schema.org FAQPage structured data
 */
export function generateFAQSchema(tool: ToolDefinition) {
  if (!tool.faqDe || tool.faqDe.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqDe.map((faq) => ({
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
 * WebSite schema with search action for homepage
 */
export function generateWebsiteSchema(locale: string = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
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
    url: `${SITE_URL}/${locale}/kategorie/${catInfo.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/${locale}`,
    },
  };
}

/**
 * Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_ORG_LOGO,
  };
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
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  locale?: string;
}): Metadata {
  const pageUrl = `${SITE_URL}/${locale}/blog/${slug}`;
  const alternateLanguages = getAlternateUrls(SITE_URL, `/blog/${slug}`);
  const ogImageUrl = `${SITE_URL}/${locale}/blog/${slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: locale === 'de' ? 'de_DE' : `${locale}_${locale.toUpperCase()}`,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: updatedAt || publishedAt,
      authors: ['CoolWave Redaktion'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} | CoolWave Ratgeber`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate Schema.org BlogPosting / Article JSON-LD
 */
export function generateArticleSchema({
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
  author = 'CoolWave Redaktion',
  locale = DEFAULT_LOCALE,
}: {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  locale?: string;
}) {
  const pageUrl = `${SITE_URL}/${locale}/blog/${slug}`;
  const ogImageUrl = `${SITE_URL}/${locale}/blog/${slug}/opengraph-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: title,
    description,
    image: [ogImageUrl],
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Organization',
      name: author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_ORG_LOGO,
      },
    },
    inLanguage: locale === 'de' ? 'de-DE' : locale,
  };
}

