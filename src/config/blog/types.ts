/**
 * Shared blog types. Kept in a separate module so article files under
 * src/config/blog/ can import them without a circular dependency on
 * blog.config.ts (which aggregates all articles).
 */

export type BlogCategory =
  | 'pdf'
  | 'documents'
  | 'images'
  | 'ocr'
  | 'formats'
  | 'productivity'
  | 'security'
  | 'media'
  | 'archives'
  | 'developer';

export interface BlogCategoryInfo {
  slug: BlogCategory;
  /** German URL segment used for /de/blog/kategorie/[urlSlug] */
  urlSlug: string;
  name: string;
  /** Short label for the <title> (kept short so titles stay ≤ 60 chars) */
  metaTitle: string;
  metaDescription: string;
  description: string;
  icon: string;
  /** Tool category hub (/de/kategorie/[toolCategory]) that matches this topic */
  toolCategory?: 'pdf' | 'images' | 'documents' | 'utilities' | 'security' | 'ocr';
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogStep {
  step: number;
  title: string;
  text: string;
}

/**
 * Section content supports a small, safe markup subset:
 * - Paragraphs separated by a blank line ("\n\n")
 * - Bullet lists: consecutive lines starting with "- "
 * - Numbered lists: consecutive lines starting with "1. ", "2. " …
 * - Inline links: [Ankertext](tool:tool-slug), [Ankertext](blog:article-slug)
 *   or [Ankertext](/de/pfad)
 * - Bold: **Text**
 */
export interface BlogSection {
  heading: string;
  content: string;
}

export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  excerpt: string;
  category: BlogCategory;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'transactional' | 'informational' | 'commercial';
  primaryToolSlug: string;
  ctaHeadline: string;
  ctaButtonLabel: string;
  relatedToolSlugs: string[];
  relatedArticleSlugs: string[];
  directAnswer: string;
  steps: BlogStep[];
  sections: BlogSection[];
  faqs: BlogFaq[];
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  author: string;
}
