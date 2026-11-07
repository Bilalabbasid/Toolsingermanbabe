import { serializeJsonLd } from '@/lib/json-ld';
import React from 'react';
import type { Metadata } from 'next';
import { HomePage } from '@/components/home/HomePage';
import { HOME_FAQS } from '@/components/home/homeContent';
import {
  generatePageMetadata,
  generateWebsiteSchema,
  generateOrganizationSchema,
} from '@/lib/seo';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return generatePageMetadata({
    title: 'Dateien konvertieren – 100 % im Browser | Datei Tools',
    description:
      'PDF zusammenfügen, komprimieren und bearbeiten, Bilder umwandeln und Dokumente konvertieren – kostenlos und vollständig in Ihrem Browser. Keine Uploads, keine Anmeldung.',
    path: '/',
    locale,
  });
}

export default async function LocalizedHomePage() {
  const websiteSchema = generateWebsiteSchema('de');
  const orgSchema = generateOrganizationSchema();
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      {/* Schema.org structured data: WebSite, Organization, FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />

      <HomePage />
    </>
  );
}
