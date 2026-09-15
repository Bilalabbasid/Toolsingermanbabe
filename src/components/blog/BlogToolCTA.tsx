import React from 'react';
import Link from 'next/link';
import { getToolBySlug } from '@/config/tools.config';
import { ToolIcon } from '@/components/common/ToolIcon';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface BlogToolCTAProps {
  toolSlug: string;
  headline?: string;
  buttonLabel?: string;
  className?: string;
  variant?: 'primary' | 'compact' | 'inline';
}

export function BlogToolCTA({
  toolSlug,
  headline,
  buttonLabel,
  className = '',
  variant = 'primary',
}: BlogToolCTAProps) {
  const tool = getToolBySlug(toolSlug);

  if (!tool) return null;

  const targetUrl = `/de/${tool.slug}`;
  const title = headline || tool.h1De || `${tool.nameDe} kostenlos online`;
  const btnText = buttonLabel || `${tool.nameDe} starten`;

  if (variant === 'compact') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-white text-sky-600 border border-sky-100 flex items-center justify-center shadow-xs shrink-0">
            <ToolIcon name={tool.icon} category={tool.category} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
            <p className="text-xs text-slate-500">Direkt im Browser • Ohne Installation • Kostenlos</p>
          </div>
        </div>
        <Link
          href={targetUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all shrink-0 active:scale-[0.99]"
        >
          <span>{btnText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className={`my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white border border-slate-800 shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-400/30">
            <Zap className="w-3 h-3 text-sky-400" />
            <span>Passendes Tool</span>
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-slate-300 text-xs font-medium">100% Client-Side &amp; DSGVO-konform</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-sky-400 flex items-center justify-center shrink-0">
                <ToolIcon name={tool.icon} category={tool.category} className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {title}
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-1">
              {tool.shortDescriptionDe}
            </p>

            {/* Micro Trust Points */}
            <div className="mt-4 flex flex-wrap gap-y-1.5 gap-x-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Kostenlos &amp; ohne Anmeldung
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                Dateien verlassen Ihren PC nicht
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <Link
              href={targetUrl}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{btnText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
