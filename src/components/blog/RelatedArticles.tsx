import React from 'react';
import Link from 'next/link';
import { BlogArticle, getArticlesForTool, getRelatedArticles } from '@/config/blog.config';
import { BlogCard } from '@/components/blog/BlogCard';
import { BookOpen, ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  currentSlug?: string;
  toolSlug?: string;
  category?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export function RelatedArticles({
  currentSlug,
  toolSlug,
  category,
  title,
  subtitle,
  limit = 3,
  className = '',
}: RelatedArticlesProps) {
  let articles: BlogArticle[] = [];

  if (toolSlug) {
    // Tool -> Blog bidirectional linking mode
    articles = getArticlesForTool(toolSlug, category, limit);
  } else if (currentSlug) {
    // Blog -> Blog related mode
    articles = getRelatedArticles(currentSlug, limit);
  }

  if (articles.length === 0) return null;

  const defaultTitle = toolSlug ? 'Ratgeber & Anleitungen zum Tool' : 'Passende Ratgeber & Tipps';
  const defaultSubtitle = toolSlug
    ? 'Schritt-für-Schritt-Anleitungen und Fachwissen für optimale Ergebnisse.'
    : 'Vertiefende Fachartikel und Problemlösungen für Ihre Dokumente.';

  return (
    <section className={`my-12 sm:my-16 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wissen &amp; Praxis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title || defaultTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        <Link
          href="/de/blog"
          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 shrink-0 group"
        >
          <span>Alle Ratgeber ansehen</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {articles.map((art) => (
          <BlogCard key={art.slug} article={art} showToolBadge={!toolSlug} />
        ))}
      </div>
    </section>
  );
}
