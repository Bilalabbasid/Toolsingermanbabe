import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/config/categories.config';
import { getToolsByCategory } from '@/config/tools.config';
import { ToolCategory } from '@/types/tool';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FileText, ArrowRight } from 'lucide-react';
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 my-10">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${locale}/${tool.slug}`}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h2 className="font-bold text-slate-900 text-lg group-hover:text-sky-700 transition-colors mb-2">
                  {tool.nameDe}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {tool.shortDescriptionDe}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-600 font-semibold">
                <span>Tool starten</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
