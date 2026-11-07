'use client';

import React, { useMemo, useState } from 'react';
import { BLOG_CATEGORIES } from '@/config/blog/categories';
import type { BlogCategory } from '@/config/blog/types';
import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogCardData } from '@/components/blog/cardData';
import { Search, X, Sparkles, Filter, ChevronDown } from 'lucide-react';

interface BlogSearchFilterProps {
  articles: BlogCardData[];
  /** Number of cards rendered initially (rest via "Weitere Artikel"). */
  pageSize?: number;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss');
}

export function BlogSearchFilter({ articles, pageSize = 24 }: BlogSearchFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visible, setVisible] = useState<number>(pageSize);

  const filteredArticles = useMemo(() => {
    const terms = normalize(searchQuery.trim()).split(/\s+/).filter(Boolean);
    return articles.filter((art) => {
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(
        [art.title, art.excerpt, art.primaryKeyword, ...art.secondaryKeywords, art.toolName ?? ''].join(' ')
      );
      return terms.every((t) => haystack.includes(t));
    });
  }, [articles, selectedCategory, searchQuery]);

  const isFiltering = selectedCategory !== 'all' || searchQuery.trim().length > 0;
  const shown = isFiltering ? filteredArticles : filteredArticles.slice(0, visible);
  const categories = Object.values(BLOG_CATEGORIES).filter((cat) => articles.some((a) => a.category === cat.slug));

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:mb-10 sm:p-6">
        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          <div className="relative max-w-md flex-1">
            <label htmlFor="blog-search" className="sr-only">
              Ratgeber durchsuchen
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              id="blog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ratgeber durchsuchen (z. B. HEIC, ZIP, Word, OCR) …"
              className="w-full rounded-xl border border-line bg-surface-muted py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-ink-subtle transition-all focus:border-sky-500 focus:bg-surface focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-subtle hover:text-ink"
                aria-label="Suche zurücksetzen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 text-xs text-ink-subtle" aria-live="polite">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              <strong>{filteredArticles.length}</strong> Artikel gefunden
            </span>
          </div>
        </div>

        <div
          className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto border-t border-line pt-4"
          role="group"
          aria-label="Nach Thema filtern"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-surface-muted text-ink-muted hover:bg-surface-sunken'
            }`}
          >
            Alle Themen ({articles.length})
          </button>

          {categories.map((cat) => {
            const count = articles.filter((a) => a.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                aria-pressed={isSelected}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected ? 'bg-sky-600 text-white' : 'bg-surface-muted text-ink-muted hover:bg-surface-sunken'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] ${isSelected ? 'bg-sky-700 text-white' : 'bg-surface-sunken text-ink-subtle'}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {shown.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {shown.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
          {!isFiltering && filteredArticles.length > visible && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + pageSize)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink hover:border-sky-300 hover:text-sky-700"
              >
                Weitere Artikel anzeigen ({filteredArticles.length - visible})
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface px-4 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mb-1 text-base font-bold text-ink">Keine passenden Artikel gefunden</h3>
          <p className="mb-4 text-xs text-ink-subtle">
            Versuchen Sie einen anderen Suchbegriff oder wählen Sie &quot;Alle Themen&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
