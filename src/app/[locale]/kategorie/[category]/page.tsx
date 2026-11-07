import { serializeJsonLd } from '@/lib/json-ld';
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/config/categories.config';
import { getToolsByCategory } from '@/config/tools.config';
import { getArticlesForToolCategory, BLOG_CATEGORIES } from '@/config/blog.config';
import { ToolCategory } from '@/types/tool';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import {
  generateCategoryMetadata,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
} from '@/lib/seo';
import { AdSlot } from '@/components/common/AdSlot';
import { ShieldCheck } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(CATEGORIES)
    .filter((cat) => getToolsByCategory(cat).length > 0)
    .map((cat) => ({
      locale: 'de',
      category: cat,
    }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const catInfo = CATEGORIES[category as ToolCategory];
  const tools = getToolsByCategory(category);

  if (!catInfo || tools.length === 0) {
    return {
      title: 'Kategorie nicht gefunden | Datei Tools',
      robots: { index: false, follow: false },
    };
  }

  return generateCategoryMetadata(catInfo, locale);
}

/** Blog hub that best matches a tool category (for the "Alle Ratgeber" link). */
function blogHubFor(category: string) {
  const matches = Object.values(BLOG_CATEGORIES).filter((c) => c.toolCategory === category);
  // Mixed categories (e.g. utilities: video, archives, developer) link to the blog index instead.
  return matches.length === 1 ? matches[0] : undefined;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;
  const catInfo = CATEGORIES[category as ToolCategory];
  const tools = getToolsByCategory(category);

  if (!catInfo || tools.length === 0) {
    notFound();
  }

  const breadcrumbs = [{ name: catInfo.name, url: `/${locale}/kategorie/${category}` }];

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: 'Startseite', url: `/${locale}` }, ...breadcrumbs]);
  const collectionSchema = {
    ...generateCollectionPageSchema(catInfo, locale),
    mainEntity: generateItemListSchema(
      tools.map((t) => ({ name: t.nameDe, url: `/${locale}/${t.slug}` })),
      catInfo.name
    ),
  };

  const guides = getArticlesForToolCategory(category, 6);
  const blogHub = blogHubFor(category);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionSchema) }} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mx-auto my-8 max-w-3xl text-center">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{catInfo.h1}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{catInfo.shortDesc}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {tools.length} kostenlose Werkzeuge · Verarbeitung lokal im Browser, ohne Upload
          </p>
        </div>

        <AdSlot slotKey="category_top" className="my-6" />

        <div className="my-8">
          <ToolGrid tools={tools} locale={locale} columns={3} />
        </div>

        {guides.length > 0 && (
          <RelatedArticles
            articles={guides}
            title={`Anleitungen zu ${catInfo.name}`}
            subtitle="Schritt-für-Schritt-Ratgeber, Vergleiche und Tipps zu den Werkzeugen dieser Kategorie."
            moreHref={blogHub ? `/${locale}/blog/kategorie/${blogHub.urlSlug}` : `/${locale}/blog`}
            moreLabel={blogHub ? `Alle Ratgeber: ${blogHub.name}` : 'Alle Ratgeber ansehen'}
          />
        )}

        <nav aria-label="Weitere Kategorien" className="mt-12 border-t border-line pt-8">
          <h2 className="mb-4 text-base font-black text-ink">Weitere Werkzeug-Kategorien</h2>
          <ul className="flex flex-wrap gap-2">
            {Object.values(CATEGORIES)
              .filter((c) => c.slug !== category && getToolsByCategory(c.slug).length > 0)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${locale}/kategorie/${c.slug}`}
                    className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-ink-muted hover:border-sky-300 hover:text-sky-700"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
