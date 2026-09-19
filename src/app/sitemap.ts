import type { MetadataRoute } from 'next';
import { getActiveTools } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import { getAllArticles } from '@/config/blog.config';
import { SITE_URL } from '@/lib/seo';
import { getAlternateUrls } from '@/config/i18n.config';
import { featureFlags } from '@/config/featureFlags.config';

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Static high-level pages
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/blog', priority: 0.85, changeFrequency: 'daily' as const },
    ...(featureFlags.enableStripeCheckout
      ? [{ path: '/preise', priority: 0.8, changeFrequency: 'weekly' as const }]
      : []),
    { path: '/kontakt', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/datenschutz', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/impressum', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/agb', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/cookie-richtlinie', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}/de${route.path === '/' ? '' : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: getAlternateUrls(SITE_URL, route.path),
    },
  }));

  // 2. Category pages
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((cat) => ({
    url: `${SITE_URL}/de/kategorie/${cat}`,
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: getAlternateUrls(SITE_URL, `/kategorie/${cat}`),
    },
  }));

  // 3. Programmatic Tool Landing Pages (Real, working tools only)
  const toolPages: MetadataRoute.Sitemap = getActiveTools()
    .filter((tool) => tool.processingEngine !== 'pdf-pdfa')
    .map((tool) => ({
      url: `${SITE_URL}/de/${tool.slug}`,
      changeFrequency: 'weekly',
      priority: tool.badge === 'Beliebt' ? 0.95 : 0.85,
      alternates: {
        languages: getAlternateUrls(SITE_URL, `/${tool.slug}`),
      },
    }));

  // 4. Blog Articles (SEO guides & tutorials)
  const blogPages: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${SITE_URL}/de/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: getAlternateUrls(SITE_URL, `/blog/${article.slug}`),
    },
  }));

  return [
    ...new Map(
      [...staticPages, ...categoryPages, ...toolPages, ...blogPages].map((page) => [page.url, page])
    ).values(),
  ];
}
