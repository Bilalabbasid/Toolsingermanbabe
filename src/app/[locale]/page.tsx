import { serializeJsonLd } from '@/lib/json-ld';
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
    description: 'PDF zusammenfügen, teilen und bearbeiten, Bilder umwandeln und Dokumente konvertieren. Finden Sie das passende Online-Tool mit Anleitung und Dateilimits.',
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgSchema) }}
      />

      <HomePageClient initialTools={activeTools} />
    </>
  );
}
