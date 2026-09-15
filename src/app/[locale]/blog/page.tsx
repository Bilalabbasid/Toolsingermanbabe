import React from 'react';
import type { Metadata } from 'next';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogSearchFilter } from '@/components/blog/BlogSearchFilter';
import { getAllArticles } from '@/config/blog.config';
import { BookOpen, ShieldCheck, Zap, Award } from 'lucide-react';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = generatePageMetadata({
  title: 'Ratgeber, Anleitungen & Datei-Tipps | CoolWave',
  description: 'Praktische Schritt-für-Schritt-Anleitungen rund um PDF-Bearbeitung, Word-Konvertierung, Bildkomprimierung, OCR und Datenschutz im Webbrowser.',
  path: '/blog',
  locale: 'de',
});

export default function BlogPage() {
  const articles = getAllArticles();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CoolWave Ratgeber & Anleitungen',
    description: 'Praktische Schritt-für-Schritt-Anleitungen rund um PDF-Bearbeitung, Word-Konvertierung, Bildkomprimierung und OCR.',
    url: `${SITE_URL}/de/blog`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'CoolWave',
      url: `${SITE_URL}/de`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <BlogBreadcrumbs items={[{ name: 'Ratgeber & Wissen', url: '/de/blog' }]} />

        {/* Hero Header */}
        <div className="my-8 sm:my-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold mb-4 shadow-2xs">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Praxiswissen &amp; Anleitungen</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            CoolWave Ratgeber &amp; Datei-Tipps
          </h1>

          <p className="mt-3.5 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Fundierte Schritt-für-Schritt-Anleitungen, Vergleiche und Lösungswege für die tägliche Arbeit mit PDFs, Word-Dokumenten, Grafiken und Scans – direkt umsetzbar.
          </p>

          {/* Quick Value Indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              Direkte Verknüpfung zu den Tools
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% DSGVO &amp; ohne Uploads
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Von Dokumenten-Experten geprüft
            </span>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <BlogSearchFilter articles={articles} />
      </div>
    </>
  );
}
