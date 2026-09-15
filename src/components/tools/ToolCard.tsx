'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Sparkles } from 'lucide-react';
import { ToolDefinition, ToolCategory } from '@/types/tool';
import { ToolIcon } from '@/components/common/ToolIcon';
import { getFormatFlow } from '@/lib/search';

interface ToolCardProps {
  tool: ToolDefinition;
  locale?: string;
  compact?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<
  ToolCategory,
  {
    iconBg: string;
    iconColor: string;
    badgeBorder?: string;
  }
> = {
  pdf: {
    iconBg: 'bg-sky-50 border-sky-100',
    iconColor: 'text-sky-700',
  },
  images: {
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-700',
  },
  documents: {
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-700',
  },
  security: {
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-700',
  },
  ocr: {
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-700',
  },
  utilities: {
    iconBg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-slate-700',
  },
};

export function ToolCard({ tool, locale = 'de', compact = false, className = '' }: ToolCardProps) {
  const catStyle = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.utilities;
  const flow = getFormatFlow(tool);

  if (compact) {
    return (
      <Link
        href={`/${locale}/${tool.slug}`}
        className={`group flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-slate-50/70 active:bg-slate-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg ${catStyle.iconBg} ${catStyle.iconColor} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
          >
            <ToolIcon name={tool.icon} category={tool.category} className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
              {tool.nameDe}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono block truncate">{flow}</span>
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/${tool.slug}`}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xs active:bg-slate-50/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 touch-manipulation h-full ${className}`}
    >
      <div>
        {/* Header: Icon container & Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-10 h-10 rounded-xl ${catStyle.iconBg} ${catStyle.iconColor} border flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-all duration-200 shadow-2xs`}
          >
            <ToolIcon name={tool.icon} category={tool.category} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {tool.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {tool.badge}
              </span>
            )}
            {tool.browserCapable && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-0.5"
                title="100% lokal im Browser ausgeführt"
              >
                <Cpu className="w-2.5 h-2.5 text-emerald-600" />
                <span className="hidden sm:inline">Lokal</span>
              </span>
            )}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600 border border-slate-200">
              {flow}
            </span>
          </div>
        </div>

        {/* Tool Name */}
        <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition-colors mb-1.5 line-clamp-1">
          {tool.nameDe}
        </h2>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {tool.shortDescriptionDe}
        </p>
      </div>

      {/* Footer: Action hint */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-600 font-medium">
        <span>Jetzt nutzen</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
