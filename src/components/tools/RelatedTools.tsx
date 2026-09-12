import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { getRelatedTools } from '@/config/tools.config';

interface RelatedToolsProps {
  relatedSlugs: string[];
  currentToolName: string;
}

export function RelatedTools({ relatedSlugs, currentToolName }: RelatedToolsProps) {
  const tools = getRelatedTools(relatedSlugs);

  if (!tools || tools.length === 0) return null;

  return (
    <section className="my-16 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Passende Werkzeuge zu {currentToolName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Entdecken Sie weitere nützliche Funktionen für Ihre Dokumente und Bilder.
          </p>
        </div>
        <Link
          href="/de/kategorie/pdf"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
        >
          <span>Alle Tools ansehen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/de/${tool.slug}`}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-700 transition-colors mb-1">
                {tool.nameDe}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {tool.shortDescriptionDe}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-600 font-medium">
              <span>Jetzt öffnen</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
