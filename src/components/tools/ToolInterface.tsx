'use client';

import React, { useEffect } from 'react';
import { ToolDefinition } from '@/types/tool';
import { ToolDispatcher } from '@/components/tools/ToolDispatcher';
import { ShieldCheck, HardDrive } from 'lucide-react';
import { recordRecentTool } from '@/lib/search';
import { trackToolView } from '@/lib/analytics';
import { getClientFileLimitMB } from '@/config/deployment.config';

interface ToolInterfaceProps {
  tool: ToolDefinition;
}

export function ToolInterface({ tool }: ToolInterfaceProps) {
  const maxFileSizeMB = getClientFileLimitMB(tool.processingEngine);

  useEffect(() => {
    recordRecentTool(tool.slug);
    trackToolView(tool.slug, tool.category);
  }, [tool.slug, tool.category]);

  return (
    <div className="w-full rounded-[1.25rem] sm:rounded-3xl bg-white/70 ring-1 ring-line shadow-raised">
      {/* Workspace header: privacy promise + limits */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-3.5 sm:px-5 py-2.5 border-b border-line text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>
            Lokal verarbeitet<span className="hidden sm:inline font-normal text-ink-subtle"> – Ihre Dateien verlassen Ihr Gerät nicht</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-3 text-ink-subtle">
          <span className="inline-flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            max. {maxFileSizeMB} MB pro Datei
          </span>
        </span>
      </div>

      {/* Engine workspace – reserved min-height keeps layout shift low while the engine hydrates */}
      <div className="p-2.5 sm:p-4 min-h-[280px] sm:min-h-[340px]">
        <ToolDispatcher tool={tool} />
      </div>
    </div>
  );
}
