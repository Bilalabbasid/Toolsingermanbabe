import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveTools, getToolBySlug } from '@/config/tools.config';
import { ToolPage } from '@/components/tools/ToolPage';
import { generateHowToSchema, generateToolMetadata, localeUrl } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Only active tools are prerendered; unknown or hidden slugs return 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getActiveTools().map((tool) => ({
    locale: 'de',
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool nicht gefunden | Datei Tools',
      robots: { index: false, follow: false },
    };
  }

  return generateToolMetadata(tool, locale);
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // SoftwareApplication, FAQPage and BreadcrumbList are emitted by ToolPage;
  // the HowTo for the "So funktioniert's" steps is added here.
  const howToSchema = generateHowToSchema({
    name: tool.h1De || tool.nameDe,
    description: tool.metaDescriptionDe,
    url: localeUrl(`/${tool.slug}`, locale),
    steps: tool.howItWorksDe,
    toolName: `${tool.nameDe} (Datei Tools, im Browser)`,
  });

  return (
    <>
      {howToSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToSchema) }} />
      )}
      <ToolPage tool={tool} locale={locale} />
    </>
  );
}
