import React from 'react';
import Link from 'next/link';
import { BlogArticle, getArticlesForTool, getRelatedArticles } from '@/config/blog.config';
import { BlogCard } from '@/components/blog/BlogCard';
import { toBlogCardData } from '@/components/blog/cardData';
import { BookOpen, ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  currentSlug?: string;
  toolSlug?: string;
  category?: string;
  /** Pass articles directly (takes precedence over slug-based lookup). */
  articles?: BlogArticle[];
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
  moreHref?: string;
  moreLabel?: string;
}

export function RelatedArticles({
  currentSlug,
  toolSlug,
  category,
  articles: provided,
  title,
  subtitle,
  limit = 3,
  className = '',
  moreHref = '/de/blog',
  moreLabel = 'Alle Ratgeber ansehen',
}: RelatedArticlesProps) {
  let articles: BlogArticle[] = provided ?? [];

  if (!provided) {
    if (toolSlug) {
      articles = getArticlesForTool(toolSlug, category, limit);
    } else if (currentSlug) {
      articles = getRelatedArticles(currentSlug, limit);
    }
  }

  if (articles.length === 0) return null;

  const defaultTitle = toolSlug ? 'Ratgeber & Anleitungen zum Tool' : 'Passende Ratgeber & Tipps';
  const defaultSubtitle = toolSlug
    ? 'Schritt-für-Schritt-Anleitungen und Hintergrundwissen für bessere Ergebnisse.'
    : 'Vertiefende Anleitungen und Lösungen zu verwandten Fragen.';

  return (
    <section className={`my-12 sm:my-16 ${className}`} aria-labelledby="related-articles-title">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Weiterlesen</span>
          </div>
          <h2 id="related-articles-title" className="text-xl font-black tracking-tight text-ink sm:text-2xl">
            {title || defaultTitle}
          </h2>
          <p className="mt-1 text-xs text-ink-subtle sm:text-sm">{subtitle || defaultSubtitle}</p>
        </div>

        <Link href={moreHref} className="group flex shrink-0 items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800">
          <span>{moreLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <div
        className={`grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 ${
          articles.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {articles.map((art) => (
          <BlogCard key={art.slug} article={toBlogCardData(art)} showToolBadge={!toolSlug} />
        ))}
      </div>
    </section>
  );
}
