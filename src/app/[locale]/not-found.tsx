import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowRight, Home, Compass } from 'lucide-react';
import { getPopularTools } from '@/config/tools.config';

export default function NotFound() {
  const popularTools = getPopularTools().slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6 border border-sky-100 shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
        Fehler 404
      </span>

      <h1 className="mt-2 text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Seite nicht gefunden
      </h1>

      <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
        Das gesuchte Werkzeug oder die aufgerufene Seite existiert leider nicht oder wurde an einen neuen Ort verschoben.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/de"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Zur Startseite</span>
        </Link>
        <Link
          href="/de/kategorie/pdf"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Alle PDF-Tools entdecken</span>
        </Link>
      </div>

      {/* Popular Fallback Tools */}
      <div className="mt-16 pt-12 border-t border-slate-200 text-left">
        <h2 className="text-base font-bold text-slate-900 mb-4 text-center">
          Vielleicht suchten Sie nach einem dieser beliebten Tools:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/de/${tool.slug}`}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
                  {tool.nameDe}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {tool.shortDescriptionDe}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-600 font-medium">
                <span>Jetzt nutzen</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
