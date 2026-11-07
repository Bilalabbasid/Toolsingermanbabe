import React from 'react';
import Link from 'next/link';
import { BLOG_CATEGORIES } from '@/config/blog/categories';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import type { BlogCardData } from '@/components/blog/cardData';

interface BlogCardProps {
  article: BlogCardData;
  showToolBadge?: boolean;
  /** Heading level inside the surrounding section (default h3). */
  headingLevel?: 'h2' | 'h3';
}

export function BlogCard({ article, showToolBadge = true, headingLevel = 'h3' }: BlogCardProps) {
  const cat = BLOG_CATEGORIES[article.category];
  const Heading = headingLevel;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-6 transition-all duration-200 hover:border-sky-300 hover:shadow-lg">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-subtle">
          <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 font-bold text-sky-700">
            {cat ? cat.name : article.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {article.readingTimeMinutes} Min. Lesezeit
          </span>
        </div>

        <Heading className="mb-2.5 text-base font-extrabold leading-snug text-ink transition-colors group-hover:text-sky-700 sm:text-lg">
          <Link href={`/de/blog/${article.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {article.title}
          </Link>
        </Heading>

        <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-ink-muted sm:text-sm">{article.excerpt}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        {showToolBadge && article.toolSlug && article.toolName ? (
          <Link
            href={`/de/${article.toolSlug}`}
            className="relative z-10 flex items-center gap-1.5 text-[11px] font-semibold text-ink-subtle transition-colors hover:text-sky-700"
            title={`Zum Tool: ${article.toolName}`}
          >
            <Sparkles className="h-3 w-3 text-sky-500" aria-hidden="true" />
            <span className="max-w-[140px] truncate sm:max-w-[180px]">{article.toolName}</span>
          </Link>
        ) : (
          <span />
        )}

        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-sky-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
          Lesen
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
