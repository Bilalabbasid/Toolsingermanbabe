'use client';

import React, { useState, useMemo } from 'react';
import { BlogArticle, BLOG_CATEGORIES, BlogCategory } from '@/config/blog.config';
import { BlogCard } from '@/components/blog/BlogCard';
import { Search, X, Sparkles, Filter } from 'lucide-react';

interface BlogSearchFilterProps {
  articles: BlogArticle[];
}

export function BlogSearchFilter({ articles }: BlogSearchFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Category check
      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = art.title.toLowerCase().includes(query);
        const matchesExcerpt = art.excerpt.toLowerCase().includes(query);
        const matchesKeyword = art.primaryKeyword.toLowerCase().includes(query);
        const matchesSecondary = art.secondaryKeywords.some((k) => k.toLowerCase().includes(query));

        return matchesTitle || matchesExcerpt || matchesKeyword || matchesSecondary;
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

  const categories = Object.values(BLOG_CATEGORIES);

  return (
    <div>
      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ratgeber nach Stichwort durchsuchen (z. B. Word, E-Mail, OCR)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                aria-label="Suche zurücksetzen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result Count Indicator */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'Artikel' : 'Artikel'} gefunden
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Alle Themen ({articles.length})
          </button>

          {categories.map((cat) => {
            const count = articles.filter((a) => a.category === cat.slug).length;
            if (count === 0) return null;

            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-sky-700 text-white' : 'bg-slate-200/70 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid or Empty State */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <BlogCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Keine passenden Artikel gefunden
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Versuchen Sie es mit einem anderen Suchbegriff oder wählen Sie &quot;Alle Themen&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
