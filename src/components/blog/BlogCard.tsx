import React from 'react';
import Link from 'next/link';
import { BlogArticle, BLOG_CATEGORIES } from '@/config/blog.config';
import { Clock, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { getToolBySlug } from '@/config/tools.config';

interface BlogCardProps {
  article: BlogArticle;
  showToolBadge?: boolean;
}

export function BlogCard({ article, showToolBadge = true }: BlogCardProps) {
  const cat = BLOG_CATEGORIES[article.category];
  const primaryTool = getToolBySlug(article.primaryToolSlug);

  return (
    <article className="group p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 via-transparent to-indigo-50/0 group-hover:from-sky-50/40 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 gap-2 flex-wrap">
          <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100/80 text-[11px]">
            {cat ? cat.name : article.category}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTimeMinutes} Min.
            </span>
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-sky-600 transition-colors leading-snug mb-2.5">
          <Link href={`/de/blog/${article.slug}`} className="focus:outline-hidden">
            {article.title}
          </Link>
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        {showToolBadge && primaryTool ? (
          <Link
            href={`/de/${primaryTool.slug}`}
            className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            title={`Zum Tool: ${primaryTool.nameDe}`}
          >
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span className="truncate max-w-[140px] sm:max-w-[180px]">{primaryTool.nameDe}</span>
          </Link>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {article.publishedAt}
          </span>
        )}

        <Link
          href={`/de/blog/${article.slug}`}
          className="text-xs font-bold text-sky-600 group-hover:text-sky-700 flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Lesen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
