import React from 'react';
import Link from 'next/link';
import { Home, ArrowRight, BookOpen } from 'lucide-react';
import { getPopularActiveTools, getNavCategories, CATEGORY_ACCENTS } from '@/components/common/navData';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { ToolGrid } from '@/components/tools/ToolGrid';

export default function NotFound() {
  const popularTools = getPopularActiveTools(4);
  const categories = getNavCategories(0);

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <p className="eyebrow justify-center">Fehler 404</p>
        <h1 className="mt-3 text-title text-ink">Diese Seite gibt es nicht (mehr)</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Das gesuchte Tool oder die Seite wurde verschoben oder existiert nicht. Vielleicht hilft Ihnen einer dieser Wege weiter.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/de"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-brand transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" /> Zur Startseite
          </Link>
          <Link
            href="/de/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white ring-1 ring-line-strong hover:bg-surface-muted text-ink font-semibold text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4 text-sky-600" aria-hidden="true" /> Ratgeber ansehen
          </Link>
        </div>
      </div>

      <nav aria-label="Kategorien" className="mt-12 max-w-4xl mx-auto">
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/de/kategorie/${cat.slug}`}
                className="flex items-center gap-2.5 rounded-xl bg-white ring-1 ring-line p-3 hover:ring-sky-300 transition-colors"
              >
                <span className={`w-8 h-8 rounded-lg ring-1 flex items-center justify-center shrink-0 ${CATEGORY_ACCENTS[cat.slug].tile}`}>
                  <CategoryIcon category={cat.slug} className="w-4 h-4" />
                </span>
                <span className="min-w-0 text-sm font-semibold text-ink truncate">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {popularTools.length > 0 && (
        <section className="mt-14 max-w-6xl mx-auto" aria-labelledby="nf-popular">
          <div className="flex items-end justify-between gap-3 mb-5">
            <h2 id="nf-popular" className="text-heading text-ink">
              Beliebte Tools
            </h2>
            <Link href="/de" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
              Alle Tools <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <ToolGrid tools={popularTools} />
        </section>
      )}
    </div>
  );
}
