import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRelatedTools } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import { ToolCard } from '@/components/tools/ToolCard';
import type { ToolCategory } from '@/types/tool';

interface RelatedToolsProps {
  relatedSlugs: string[];
  currentToolName: string;
  /** Category of the current tool – used for the "all tools" link. */
  category?: ToolCategory;
  className?: string;
}

export function RelatedTools({ relatedSlugs, currentToolName, category, className = '' }: RelatedToolsProps) {
  const tools = getRelatedTools(relatedSlugs);

  if (!tools || tools.length === 0) return null;

  const cat = category ? CATEGORIES[category] : undefined;

  return (
    <section aria-labelledby="related-tools-title" className={`my-12 sm:my-16 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">Weiterarbeiten</p>
          <h2 id="related-tools-title" className="mt-2 text-heading text-ink">
            Passende Tools zu {currentToolName}
          </h2>
        </div>
        <Link
          href={cat ? `/de/kategorie/${cat.slug}` : '/de'}
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800 transition self-start sm:self-auto"
        >
          {cat ? `Alle ${cat.name}` : 'Alle Tools'}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="list">
        {tools.slice(0, 8).map((tool) => (
          <li key={tool.id} className="min-w-0">
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}
