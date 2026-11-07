import React from 'react';
import Link from 'next/link';
import { getActiveBlogCategories, getArticlesByCategory } from '@/config/blog.config';
import type { BlogCategory } from '@/config/blog/types';

interface BlogCategoryNavProps {
  current?: BlogCategory;
  locale?: string;
  className?: string;
}

/** Crawlable topic navigation linking every blog hub page. */
export function BlogCategoryNav({ current, locale = 'de', className = '' }: BlogCategoryNavProps) {
  const categories = getActiveBlogCategories();

  return (
    <nav aria-label="Ratgeber-Themen" className={className}>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={`/${locale}/blog`}
            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
              !current
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-line bg-surface text-ink-muted hover:border-sky-300 hover:text-sky-700'
            }`}
            aria-current={!current ? 'page' : undefined}
          >
            Alle Ratgeber
          </Link>
        </li>
        {categories.map((cat) => {
          const isCurrent = cat.slug === current;
          return (
            <li key={cat.slug}>
              <Link
                href={`/${locale}/blog/kategorie/${cat.urlSlug}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-line bg-surface text-ink-muted hover:border-sky-300 hover:text-sky-700'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {cat.name}
                <span className={`text-[10px] ${isCurrent ? 'text-sky-100' : 'text-ink-subtle'}`}>
                  {getArticlesByCategory(cat.slug).length}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
