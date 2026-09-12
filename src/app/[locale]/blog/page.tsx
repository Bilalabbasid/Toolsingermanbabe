import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { BookOpen, ArrowRight, Clock, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Ratgeber & PDF-Tipps | CoolWave',
  description: 'Praktische Anleitungen und Fachartikel rund um PDF-Bearbeitung, Bildoptimierung, Dateikonvertierung und Datenschutz.',
};

const ARTICLES = [
  {
    slug: 'wie-kann-man-eine-pdf-in-word-umwandeln',
    title: 'Wie kann man eine PDF in Word umwandeln? – Anleitung & Tipps',
    excerpt: 'Erfahren Sie, wie Sie uneditierbare PDF-Dateien kostenlos und ohne Datenverlust in bearbeitbare Word-Dokumente (DOCX) umwandeln.',
    date: '12. September 2026',
    readTime: '4 Min. Lesezeit',
    category: 'PDF Anleitungen',
    relatedTool: 'pdf-in-word-umwandeln',
  },
  {
    slug: 'wie-kann-man-eine-pdf-verkleinern',
    title: 'PDF verkleinern für den E-Mail-Versand: So sparen Sie bis zu 80% Speicherplatz',
    excerpt: 'Große PDF-Anhänge werden oft vom Mailserver blockiert. Wir zeigen Ihnen die wirksamsten Methoden zur Komprimierung ohne sichtbare Unschärfe.',
    date: '10. September 2026',
    readTime: '3 Min. Lesezeit',
    category: 'Optimierung',
    relatedTool: 'pdf-komprimieren',
  },
  {
    slug: 'jpg-oder-png-welches-format-ist-besser',
    title: 'JPG vs. PNG vs. WebP: Welches Bildformat eignet sich für welchen Zweck?',
    excerpt: 'Verlustbehaftet vs. verlustfrei: Wann Sie auf PNG mit Transparenz setzen sollten und wann modernes WebP bis zu 35% Ladezeit spart.',
    date: '08. September 2026',
    readTime: '5 Min. Lesezeit',
    category: 'Bildformate',
    relatedTool: 'jpg-in-png-umwandeln',
  },
];

export default function BlogPage() {
  const breadcrumbs = [
    { name: 'Ratgeber & Blog', url: '/de/blog' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="my-8 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Wissen & Praxis</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          CoolWave Ratgeber & Anleitungen
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
          Schritt-für-Schritt-Anleitungen, Vergleiche und Experten-Tipps für die tägliche Arbeit mit Dokumenten und Medien.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        {ARTICLES.map((art) => (
          <div
            key={art.slug}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {art.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.readTime}
                </span>
              </div>

              <h2 className="font-bold text-slate-900 text-lg hover:text-sky-700 transition-colors mb-2.5 leading-snug">
                {art.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/de/${art.relatedTool}`}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Direkt zum Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
