import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ToolDefinition } from '@/types/tool';
import { ToolIcon } from '@/components/common/ToolIcon';
import { CATEGORY_ACCENTS } from '@/components/common/navMeta';
import { getFormatFlow } from '@/lib/search';

interface ToolCardProps {
  tool: ToolDefinition;
  locale?: string;
  compact?: boolean;
  className?: string;
  /** Heading element for the tool name (defaults to h3). */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function ToolCard({ tool, locale = 'de', compact = false, className = '', headingLevel = 'h3' }: ToolCardProps) {
  const accent = CATEGORY_ACCENTS[tool.category] || CATEGORY_ACCENTS.utilities;
  const flow = getFormatFlow(tool);
  const Heading = headingLevel;

  if (compact) {
    return (
      <Link
        href={`/${locale}/${tool.slug}`}
        className={`group flex items-center gap-3 p-3 rounded-xl bg-white border border-line hover:border-sky-300 hover:shadow-card transition-[border-color,box-shadow] ${className}`}
      >
        <span className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center shrink-0 ${accent.tile}`}>
          <ToolIcon name={tool.icon} category={tool.category} className="w-4.5 h-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <Heading className="text-sm font-semibold text-ink group-hover:text-sky-700 transition-colors truncate">
            {tool.nameDe}
          </Heading>
          <span className="block text-[11px] text-ink-subtle truncate">{flow}</span>
        </span>
        <ArrowRight
          className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0"
          aria-hidden="true"
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/${tool.slug}`}
      className={`group relative flex flex-col h-full p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-card hover:border-sky-300 hover:shadow-raised hover:-translate-y-0.5 transition-[border-color,box-shadow,transform] duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`w-10 h-10 rounded-xl ring-1 flex items-center justify-center shrink-0 ${accent.tile}`}>
          <ToolIcon name={tool.icon} category={tool.category} className="w-5 h-5" />
        </span>
        {tool.badge ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200/70">
            {tool.badge}
          </span>
        ) : (
          <ArrowUpRight
            className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors"
            aria-hidden="true"
          />
        )}
      </div>

      <Heading className="mt-3.5 text-[15px] font-semibold text-ink group-hover:text-sky-700 transition-colors line-clamp-1 tracking-tight">
        {tool.nameDe}
      </Heading>
      <p className="mt-1 text-[13px] text-ink-subtle line-clamp-2 leading-relaxed">{tool.shortDescriptionDe}</p>

      <span className="mt-auto pt-3.5">
        <span className="inline-block text-[11px] font-medium text-ink-muted bg-surface-muted px-2 py-0.5 rounded-md">
          {flow}
        </span>
      </span>
    </Link>
  );
}
