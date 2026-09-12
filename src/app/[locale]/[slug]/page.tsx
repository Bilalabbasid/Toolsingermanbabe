import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveTools, getToolBySlug } from '@/config/tools.config';
import { ToolPage } from '@/components/tools/ToolPage';
import { generateToolMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const activeTools = getActiveTools();
  return activeTools.map((tool) => ({
    locale: 'de',
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool nicht gefunden | CoolWave',
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

  return <ToolPage tool={tool} locale={locale} />;
}
