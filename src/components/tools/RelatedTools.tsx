'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getRelatedTools } from '@/config/tools.config';
import { ToolCard } from '@/components/tools/ToolCard';

interface RelatedToolsProps {
  relatedSlugs: string[];
  currentToolName: string;
}

export function RelatedTools({ relatedSlugs, currentToolName }: RelatedToolsProps) {
  const tools = getRelatedTools(relatedSlugs);

  if (!tools || tools.length === 0) return null;

  return (
    <section className="my-14 sm:my-20 pt-10 border-t border-slate-200/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Passende Werkzeuge zu {currentToolName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Optimieren Sie Ihren Workflow mit weiteren nützlichen Konvertern und Werkzeugen.
          </p>
        </div>
        <Link
          href="/de/kategorie/pdf"
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 transition self-start sm:self-center"
        >
          <span>Alle Werkzeuge durchsuchen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
