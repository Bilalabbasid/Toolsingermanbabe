import type { MetadataRoute } from 'next';
import { getActiveTools } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import { SITE_URL } from '@/lib/seo';
import { getAlternateUrls } from '@/config/i18n.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // 1. Static high-level pages
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/preise', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/kontakt', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/datenschutz', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/impressum', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/agb', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/cookie-richtlinie', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}/de${route.path === '/' ? '' : route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: getAlternateUrls(SITE_URL, route.path),
    },
  }));

  // 2. Category pages
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((cat) => ({
    url: `${SITE_URL}/de/kategorie/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: getAlternateUrls(SITE_URL, `/kategorie/${cat}`),
    },
  }));

  // 3. Programmatic Tool Landing Pages (Real, working tools only)
  const toolPages: MetadataRoute.Sitemap = getActiveTools().map((tool) => ({
    url: `${SITE_URL}/de/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: tool.badge === 'Beliebt' ? 0.95 : 0.85,
    alternates: {
      languages: getAlternateUrls(SITE_URL, `/${tool.slug}`),
    },
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
