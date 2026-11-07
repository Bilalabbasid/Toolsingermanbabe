import { getActiveTools } from './tools.config';
import type { BlogArticle, BlogCategory } from './blog/types';
import { BLOG_CATEGORIES } from './blog/categories';
import { CORE_ARTICLES } from './blog/articles-core';
import { PDF_SECURITY_ARTICLES } from './blog/articles-pdf-security';
import { DOCS_IMAGES_ARTICLES } from './blog/articles-docs-images';
import { MEDIA_DEV_ARTICLES } from './blog/articles-media-dev';
import { GUIDES_2_ARTICLES } from './blog/articles-guides-2';

export type {
  BlogArticle,
  BlogCategory,
  BlogCategoryInfo,
  BlogFaq,
  BlogStep,
  BlogSection,
} from './blog/types';
export {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_ORDER,
  getBlogCategoryByUrlSlug,
  getBlogCategoryPath,
} from './blog/categories';

export const BLOG_ARTICLES: BlogArticle[] = [
  ...CORE_ARTICLES,
  ...PDF_SECURITY_ARTICLES,
  ...DOCS_IMAGES_ARTICLES,
  ...MEDIA_DEV_ARTICLES,
  ...GUIDES_2_ARTICLES,
];

const ARTICLE_INDEX = new Map(BLOG_ARTICLES.map((a) => [a.slug, a]));

function byNewest(a: BlogArticle, b: BlogArticle): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug);
}

// ==========================================
// Query helpers
// ==========================================

/** All articles, newest first. */
export function getAllArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort(byNewest);
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return ARTICLE_INDEX.get(slug);
}

/** Articles of one blog category, newest first. */
export function getArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.category === category).sort(byNewest);
}

/** Blog categories that currently contain at least one article (display order). */
export function getActiveBlogCategories() {
  return Object.values(BLOG_CATEGORIES).filter((c) =>
    BLOG_ARTICLES.some((a) => a.category === c.slug)
  );
}

/** Latest modification date of the given articles (YYYY-MM-DD). */
export function getLatestBlogUpdate(articles: BlogArticle[] = BLOG_ARTICLES): string {
  return articles.reduce((latest, a) => {
    const d = a.updatedAt || a.publishedAt;
    return d > latest ? d : latest;
  }, '1970-01-01');
}

/**
 * Related articles for an article page:
 * 1. explicitly curated relatedArticleSlugs
 * 2. articles that link back to this one (bidirectional)
 * 3. articles using the same primary tool
 * 4. same category (newest first)
 */
export function getRelatedArticles(currentSlug: string, count: number = 3): BlogArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return getAllArticles().slice(0, count);

  const picked: BlogArticle[] = [];
  const seen = new Set<string>([currentSlug]);
  const add = (a: BlogArticle | undefined) => {
    if (a && !seen.has(a.slug)) {
      seen.add(a.slug);
      picked.push(a);
    }
  };

  current.relatedArticleSlugs.forEach((s) => add(getArticleBySlug(s)));
  BLOG_ARTICLES.filter((a) => a.relatedArticleSlugs.includes(currentSlug)).forEach(add);
  BLOG_ARTICLES.filter((a) => a.primaryToolSlug === current.primaryToolSlug).forEach(add);
  getArticlesByCategory(current.category).forEach(add);

  return picked.slice(0, count);
}

/** Maps tool registry categories to the blog categories that cover them. */
const TOOL_CATEGORY_TO_BLOG: Record<string, BlogCategory[]> = {
  pdf: ['pdf', 'security', 'formats'],
  security: ['security', 'pdf'],
  images: ['images', 'formats'],
  documents: ['documents', 'formats'],
  ocr: ['ocr', 'productivity'],
  utilities: ['developer', 'media', 'archives', 'productivity'],
};

/**
 * Bidirectional Tool -> Blog linking helper.
 * Retrieves top relevant articles for a specific Tool Page.
 * (Signature is used by ToolPage — keep it stable.)
 */
export function getArticlesForTool(toolSlug: string, category?: string, count: number = 3): BlogArticle[] {
  // 1. Exact primary tool match
  const primaryMatches = BLOG_ARTICLES.filter((a) => a.primaryToolSlug === toolSlug).sort(byNewest);

  // 2. Secondary/related tool match or in-content link to the tool
  const relatedMatches = BLOG_ARTICLES.filter(
    (a) =>
      !primaryMatches.includes(a) &&
      (a.relatedToolSlugs.includes(toolSlug) ||
        a.sections.some((s) => s.content.includes(`(tool:${toolSlug})`)))
  ).sort(byNewest);

  // 3. Category match fallback (accepts tool or blog categories)
  const blogCats: string[] = category ? TOOL_CATEGORY_TO_BLOG[category] ?? [category] : [];
  const categoryMatches = BLOG_ARTICLES.filter(
    (a) => blogCats.includes(a.category) && !primaryMatches.includes(a) && !relatedMatches.includes(a)
  ).sort(byNewest);

  return [...primaryMatches, ...relatedMatches, ...categoryMatches].slice(0, count);
}

/** Guides for a tool category hub page (/de/kategorie/[category]). */
export function getArticlesForToolCategory(toolCategory: string, count: number = 6): BlogArticle[] {
  const toolSlugs = new Set(
    getActiveTools()
      .filter((t) => t.category === toolCategory)
      .map((t) => t.slug)
  );
  const blogCats = TOOL_CATEGORY_TO_BLOG[toolCategory] ?? [];
  const direct = BLOG_ARTICLES.filter((a) => toolSlugs.has(a.primaryToolSlug)).sort(byNewest);
  const rest = BLOG_ARTICLES.filter((a) => !direct.includes(a) && blogCats.includes(a.category)).sort(byNewest);
  return [...direct, ...rest].slice(0, count);
}

// ==========================================
// In-content link syntax
// ==========================================

export interface ContentLink {
  text: string;
  target: string;
}

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Extracts all [text](target) links from a section string. */
export function extractContentLinks(content: string): ContentLink[] {
  const links: ContentLink[] = [];
  for (const match of content.matchAll(LINK_PATTERN)) {
    links.push({ text: match[1], target: match[2] });
  }
  return links;
}

/**
 * Resolves a content link target to an internal href.
 * tool:slug -> /de/slug, blog:slug -> /de/blog/slug, /de/... stays as is.
 */
export function resolveContentHref(target: string, locale: string = 'de'): string {
  if (target.startsWith('tool:')) return `/${locale}/${target.slice(5)}`;
  if (target.startsWith('blog:')) return `/${locale}/blog/${target.slice(5)}`;
  return target;
}

// ==========================================
// Validation
// ==========================================

/**
 * Validates every internal link of the blog:
 * - primary / related tool slugs exist among active tools
 * - related article slugs exist
 * - in-content tool:/blog:/internal links resolve
 * - article slugs are unique
 */
export function validateBlogInternalLinks(): { valid: boolean; brokenSlugs: string[] } {
  const activeSlugs = new Set(getActiveTools().map((t) => t.slug));
  const brokenSlugs: string[] = [];
  const seenSlugs = new Set<string>();

  for (const article of BLOG_ARTICLES) {
    if (seenSlugs.has(article.slug)) brokenSlugs.push(`${article.slug} -> duplicate article slug`);
    seenSlugs.add(article.slug);

    if (!activeSlugs.has(article.primaryToolSlug)) {
      brokenSlugs.push(`${article.slug} -> primaryTool: ${article.primaryToolSlug}`);
    }
    for (const rel of article.relatedToolSlugs) {
      if (!activeSlugs.has(rel)) {
        brokenSlugs.push(`${article.slug} -> relatedTool: ${rel}`);
      }
    }
    for (const rel of article.relatedArticleSlugs) {
      if (!ARTICLE_INDEX.has(rel) || rel === article.slug) {
        brokenSlugs.push(`${article.slug} -> relatedArticle: ${rel}`);
      }
    }
    for (const section of article.sections) {
      for (const link of extractContentLinks(section.content)) {
        const t = link.target;
        if (t.startsWith('tool:')) {
          if (!activeSlugs.has(t.slice(5))) brokenSlugs.push(`${article.slug} -> contentTool: ${t}`);
        } else if (t.startsWith('blog:')) {
          if (!ARTICLE_INDEX.has(t.slice(5))) brokenSlugs.push(`${article.slug} -> contentArticle: ${t}`);
        } else if (t.startsWith('/de/blog/')) {
          if (!ARTICLE_INDEX.has(t.slice('/de/blog/'.length))) {
            brokenSlugs.push(`${article.slug} -> contentPath: ${t}`);
          }
        } else if (!t.startsWith('/de')) {
          brokenSlugs.push(`${article.slug} -> unsupported link target: ${t}`);
        }
      }
    }
  }

  return {
    valid: brokenSlugs.length === 0,
    brokenSlugs,
  };
}
