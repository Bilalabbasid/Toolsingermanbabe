import type { BlogArticle, BlogCategory } from '@/config/blog/types';
import { getToolBySlug } from '@/config/tools.config';

/**
 * Serializable, lightweight article summary for cards. Built on the server so
 * client components (search/filter) don't pull the tool registry or the full
 * article bodies into the browser bundle.
 */
export interface BlogCardData {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  toolSlug?: string;
  toolName?: string;
}

export function toBlogCardData(article: BlogArticle): BlogCardData {
  const tool = getToolBySlug(article.primaryToolSlug);
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    readingTimeMinutes: article.readingTimeMinutes,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    primaryKeyword: article.primaryKeyword,
    secondaryKeywords: article.secondaryKeywords,
    toolSlug: tool?.slug,
    toolName: tool?.nameDe,
  };
}

const DATE_FORMAT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-11-04" -> "04. November 2026" */
export function formatGermanDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? isoDate : DATE_FORMAT.format(d);
}
