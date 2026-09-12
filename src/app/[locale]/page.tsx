import React from 'react';
import type { Metadata } from 'next';
import { getActiveTools } from '@/config/tools.config';
import { HomePageClient } from '@/components/home/HomePageClient';
import { 
  generatePageMetadata, 
  generateWebsiteSchema, 
  generateOrganizationSchema 
} from '@/lib/seo';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return generatePageMetadata({
    title: 'CoolWave – Kostenlose Online-PDF- und Datei-Tools im Browser',
    description: 'Alle wichtigen Online-Tools für PDF, Bilder und Dokumente. PDFs bearbeiten, zusammenfügen, komprimieren und konvertieren – 100% datenschutzkonform ohne Upload.',
    path: '/',
    locale,
  });
}

export default async function HomePage() {
  const activeTools = getActiveTools();
  const websiteSchema = generateWebsiteSchema('de');
  const orgSchema = generateOrganizationSchema();

  return (
    <>
      {/* Schema.org Structured Data for WebSite & Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <HomePageClient initialTools={activeTools} />
    </>
  );
}
