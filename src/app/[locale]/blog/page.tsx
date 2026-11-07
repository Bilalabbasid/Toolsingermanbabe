import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogSearchFilter } from '@/components/blog/BlogSearchFilter';
import { BlogCategoryNav } from '@/components/blog/BlogCategoryNav';
import { toBlogCardData } from '@/components/blog/cardData';
import { getAllArticles, getActiveBlogCategories, getArticlesByCategory } from '@/config/blog.config';
import { BookOpen, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { generatePageMetadata, generateItemListSchema, localeUrl, SITE_NAME, SITE_URL } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';

const TITLE = 'Ratgeber: PDF, Bilder & Dateien | Datei Tools';
const DESCRIPTION =
  'Anleitungen zu PDF, Word, Bildern, OCR, Video und ZIP: Schritt für Schritt erklärt – mit kostenlosen Tools, die lokal im Browser ohne Upload arbeiten.';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({ title: TITLE, description: DESCRIPTION, path: '/blog', locale });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articles = getAllArticles();
  const categories = getActiveBlogCategories();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_NAME} Ratgeber & Anleitungen`,
    description: DESCRIPTION,
    url: localeUrl('/blog', locale),
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/${locale}` },
    mainEntity: generateItemListSchema(
      articles.slice(0, 30).map((a) => ({ name: a.title, url: `/${locale}/blog/${a.slug}` })),
      'Neueste Ratgeber'
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionSchema) }} />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <BlogBreadcrumbs items={[{ name: 'Ratgeber', url: `/${locale}/blog` }]} />

        <header className="mx-auto my-8 max-w-3xl text-center sm:my-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-700">
            <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>Praxiswissen &amp; Anleitungen</span>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
            Ratgeber für PDF, Bilder &amp; Dateien
          </h1>

          <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {articles.length} Schritt-für-Schritt-Anleitungen, Vergleiche und Lösungen für PDFs, Word-Dokumente, Fotos,
            Scans, Videos und Archive – direkt umsetzbar mit kostenlosen Werkzeugen, die vollständig in Ihrem Browser laufen.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-ink-subtle sm:gap-8">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-sky-600" aria-hidden="true" />
              Mit passendem Tool zu jeder Anleitung
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Lokal im Browser – ohne Upload
            </span>
          </div>
        </header>

        <BlogCategoryNav locale={locale} className="mb-8" />

        <BlogSearchFilter articles={articles.map(toBlogCardData)} />

        {/* Topic hubs: crawlable entry points per category */}
        <section className="mt-16 sm:mt-20" aria-labelledby="themen-titel">
          <h2 id="themen-titel" className="mb-6 text-xl font-black tracking-tight text-ink sm:text-2xl">
            Ratgeber nach Thema
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const catArticles = getArticlesByCategory(cat.slug);
              return (
                <div key={cat.slug} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                  <h3 className="text-base font-extrabold text-ink">
                    <Link href={`/${locale}/blog/kategorie/${cat.urlSlug}`} className="hover:text-sky-700">
                      {cat.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-subtle">{cat.description}</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {catArticles.slice(0, 4).map((a) => (
                      <li key={a.slug}>
                        <Link href={`/${locale}/blog/${a.slug}`} className="text-ink-muted hover:text-sky-700 hover:underline">
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/${locale}/blog/kategorie/${cat.urlSlug}`}
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-sky-700 hover:text-sky-800"
                  >
                    Alle {catArticles.length} Artikel
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
