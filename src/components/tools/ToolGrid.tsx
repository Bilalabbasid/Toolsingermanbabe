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

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function ToolGrid({
  tools,
  columns = 4,
  locale = 'de',
  emptyMessage = 'Keine Werkzeuge gefunden.',
  className = '',
}: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-surface-muted text-ink-subtle flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-sm sm:text-base font-semibold text-ink">{emptyMessage}</p>
        <p className="text-xs text-ink-subtle mt-1">
          Überprüfen Sie die Rechtschreibung oder wählen Sie eine andere Kategorie aus.
        </p>
      </div>
    );
  }

  return (
    <ul className={`grid ${columnClasses[columns]} gap-3 sm:gap-4 ${className}`} role="list">
      {tools.map((tool) => (
        <li key={tool.id} className="min-w-0">
          <ToolCard tool={tool} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
