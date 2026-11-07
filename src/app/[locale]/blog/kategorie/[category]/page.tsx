import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getActiveBlogCategories,
  getArticlesByCategory,
  getBlogCategoryByUrlSlug,
} from '@/config/blog.config';
import { CATEGORIES } from '@/config/categories.config';
import { getActiveTools, getToolBySlug } from '@/config/tools.config';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCategoryNav } from '@/components/blog/BlogCategoryNav';
import { toBlogCardData } from '@/components/blog/cardData';
import { ToolIcon } from '@/components/common/ToolIcon';
import { generateItemListSchema, generatePageMetadata, localeUrl, SITE_NAME, SITE_URL } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

interface BlogCategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getActiveBlogCategories().map((cat) => ({
    locale: 'de',
    category: cat.urlSlug,
  }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = getBlogCategoryByUrlSlug(category);
  if (!cat) {
    return { title: 'Thema nicht gefunden | Datei Tools', robots: { index: false, follow: false } };
  }
  return generatePageMetadata({
    title: `${cat.metaTitle} | ${SITE_NAME}`,
    description: cat.metaDescription,
    path: `/blog/kategorie/${cat.urlSlug}`,
    locale,
  });
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { locale, category } = await params;
  const cat = getBlogCategoryByUrlSlug(category);
  if (!cat) notFound();

  const articles = getArticlesByCategory(cat.slug);
  if (articles.length === 0) notFound();

  // Tools covered by this topic, ordered by how many guides use them.
  const toolCounts = new Map<string, number>();
  for (const a of articles) {
    for (const slug of [a.primaryToolSlug, ...a.relatedToolSlugs]) {
      toolCounts.set(slug, (toolCounts.get(slug) ?? 0) + (slug === a.primaryToolSlug ? 2 : 1));
    }
  }
  const topicTools = [...toolCounts.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([slug]) => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .slice(0, 8);

  const toolCategory = cat.toolCategory ? CATEGORIES[cat.toolCategory] : undefined;
  const hasToolHub =
    !!cat.toolCategory && getActiveTools().some((t) => t.category === cat.toolCategory);
  const pagePath = `/${locale}/blog/kategorie/${cat.urlSlug}`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} – ${SITE_NAME} Ratgeber`,
    description: cat.metaDescription,
    url: localeUrl(`/blog/kategorie/${cat.urlSlug}`, locale),
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/${locale}` },
    mainEntity: generateItemListSchema(
      articles.map((a) => ({ name: a.title, url: `/${locale}/blog/${a.slug}` })),
      `${cat.name}: Anleitungen`
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionSchema) }} />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <BlogBreadcrumbs
          items={[
            { name: 'Ratgeber', url: `/${locale}/blog` },
            { name: cat.name, url: pagePath },
          ]}
        />

        <header className="mx-auto my-8 max-w-3xl text-center sm:my-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-700">
            <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>{articles.length} Anleitungen</span>
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
            {cat.name}: Ratgeber &amp; Anleitungen
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{cat.description}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Alle passenden Tools laufen lokal im Browser – ohne Upload.
          </p>
        </header>

        <BlogCategoryNav current={cat.slug} locale={locale} className="mb-8" />

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <BlogCard key={article.slug} article={toBlogCardData(article)} headingLevel="h2" />
          ))}
        </div>

        {topicTools.length > 0 && (
          <section className="mt-14 rounded-3xl border border-line bg-surface-muted p-6 sm:p-8" aria-labelledby="hub-tools-titel">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 id="hub-tools-titel" className="text-lg font-black text-ink sm:text-xl">
                  Werkzeuge zum Thema {cat.name}
                </h2>
                <p className="mt-1 text-xs text-ink-subtle">Kostenlos, ohne Anmeldung, direkt im Browser.</p>
              </div>
              {hasToolHub && toolCategory && (
                <Link
                  href={`/${locale}/kategorie/${toolCategory.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800"
                >
                  Alle {toolCategory.name}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topicTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${locale}/${tool.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-sky-300"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
                      <ToolIcon name={tool.icon} category={tool.category} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-ink group-hover:text-sky-700">{tool.nameDe}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
