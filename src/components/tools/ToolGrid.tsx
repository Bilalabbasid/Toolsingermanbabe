'use client';

import React from 'react';
import { ToolDefinition } from '@/types/tool';
import { ToolCard } from './ToolCard';
import { SearchX } from 'lucide-react';

interface ToolGridProps {
  tools: ToolDefinition[];
  columns?: 2 | 3 | 4;
  locale?: string;
  emptyMessage?: string;
  className?: string;
}

export function ToolGrid({
  tools,
  columns = 4,
  locale = 'de',
  emptyMessage = 'Keine Werkzeuge gefunden.',
  className = '',
}: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-800">{emptyMessage}</p>
        <p className="text-xs text-slate-400 mt-1">
          Überprüfen Sie die Rechtschreibung oder wählen Sie eine andere Kategorie aus.
        </p>
      </div>
    );
  }

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-3.5 sm:gap-4.5 ${className}`}>
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} locale={locale} />
      ))}
    </div>
  );
}
