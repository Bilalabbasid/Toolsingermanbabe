import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/config/categories.config';
import { getToolsByCategory } from '@/config/tools.config';
import { ToolCategory } from '@/types/tool';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { 
  generateCategoryMetadata, 
  generateBreadcrumbSchema,
  generateCollectionPageSchema
} from '@/lib/seo';
import { AdSlot } from '@/components/common/AdSlot';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({
    locale: 'de',
    category: cat,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const catInfo = CATEGORIES[category as ToolCategory];

  if (!catInfo) {
    return {
      title: 'Kategorie nicht gefunden | CoolWave',
      robots: { index: false, follow: false },
    };
  }

  return generateCategoryMetadata(catInfo, locale);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;
  const catInfo = CATEGORIES[category as ToolCategory];

  if (!catInfo) {
    notFound();
  }

  const tools = getToolsByCategory(category);

  const breadcrumbs = [
    { name: catInfo.name, url: `/${locale}/kategorie/${category}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Startseite', url: `/${locale}` },
    ...breadcrumbs,
  ]);
  const collectionSchema = generateCollectionPageSchema(catInfo, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="my-8 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {catInfo.h1}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {catInfo.shortDesc}
          </p>
        </div>

        <AdSlot slotKey="category_top" className="my-6" />

        <div className="my-8">
          <ToolGrid tools={tools} locale={locale} columns={3} />
        </div>
      </div>
    </>
  );
}
