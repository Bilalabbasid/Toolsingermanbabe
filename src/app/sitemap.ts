import type { MetadataRoute } from 'next';
import { getActiveTools, getToolsByCategory } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import {
  getAllArticles,
  getActiveBlogCategories,
  getArticlesByCategory,
  getLatestBlogUpdate,
} from '@/config/blog.config';
import { SITE_URL } from '@/lib/seo';
import { getAlternateUrls } from '@/config/i18n.config';
import { featureFlags } from '@/config/featureFlags.config';

/**
 * Date of the last substantial content/tool release. Bump when tool pages or
 * static pages change materially so crawlers re-fetch them.
 */
const SITE_CONTENT_UPDATED = '2026-11-07';
const LEGAL_PAGES_UPDATED = '2026-11-07';

function entry(
  path: string,
  lastModified: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/de${path === '/' ? '' : path}`,
    lastModified: new Date(`${lastModified}T00:00:00.000Z`),
    changeFrequency,
    priority,
    alternates: {
      languages: getAlternateUrls(SITE_URL, path),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const latestBlogUpdate = getLatestBlogUpdate(articles);

  // 1. Home + static pages
  const staticPages: MetadataRoute.Sitemap = [
    entry('/', SITE_CONTENT_UPDATED, 'daily', 1.0),
    entry('/blog', latestBlogUpdate, 'daily', 0.85),
    ...(featureFlags.enableStripeCheckout ? [entry('/preise', SITE_CONTENT_UPDATED, 'weekly', 0.6)] : []),
    entry('/kontakt', LEGAL_PAGES_UPDATED, 'yearly', 0.4),
    entry('/datenschutz', LEGAL_PAGES_UPDATED, 'yearly', 0.3),
    entry('/impressum', LEGAL_PAGES_UPDATED, 'yearly', 0.3),
    entry('/agb', LEGAL_PAGES_UPDATED, 'yearly', 0.3),
    entry('/cookie-richtlinie', LEGAL_PAGES_UPDATED, 'yearly', 0.3),
  ];

  // 2. Tool category hubs (only categories with active tools)
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES)
    .filter((cat) => getToolsByCategory(cat).length > 0)
    .map((cat) => entry(`/kategorie/${cat}`, SITE_CONTENT_UPDATED, 'weekly', 0.8));

  // 3. Tool landing pages (active tools only; PDF/A stays noindex)
  const toolPages: MetadataRoute.Sitemap = getActiveTools()
    .filter((tool) => tool.processingEngine !== 'pdf-pdfa')
    .map((tool) =>
      entry(`/${tool.slug}`, SITE_CONTENT_UPDATED, 'weekly', tool.badge === 'Beliebt' ? 0.95 : 0.85)
    );

  // 4. Blog topic hubs
  const blogCategoryPages: MetadataRoute.Sitemap = getActiveBlogCategories().map((cat) =>
    entry(
      `/blog/kategorie/${cat.urlSlug}`,
      getLatestBlogUpdate(getArticlesByCategory(cat.slug)),
      'weekly',
      0.7
    )
  );

  // 5. Blog articles
  const blogPages: MetadataRoute.Sitemap = articles.map((article) =>
    entry(`/blog/${article.slug}`, article.updatedAt || article.publishedAt, 'monthly', 0.75)
  );

  return [
    ...new Map(
      [...staticPages, ...categoryPages, ...toolPages, ...blogCategoryPages, ...blogPages].map((page) => [
        page.url,
        page,
      ])
    ).values(),
  ];
}
