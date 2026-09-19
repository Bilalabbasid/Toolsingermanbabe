'use client';

import React, { useEffect } from 'react';
import { ToolDefinition } from '@/types/tool';
import { ToolDispatcher } from '@/components/tools/ToolDispatcher';
import { Cpu, ShieldCheck, HardDrive, Layers } from 'lucide-react';
import { recordRecentTool } from '@/lib/search';
import { trackToolView } from '@/lib/analytics';
import { featureFlags } from '@/config/featureFlags.config';

interface ToolInterfaceProps {
  tool: ToolDefinition;
}

export function ToolInterface({ tool }: ToolInterfaceProps) {
  const activeLimits = featureFlags.enableStripeCheckout ? tool.freeLimits : tool.proLimits;
  useEffect(() => {
    recordRecentTool(tool.slug);
    trackToolView(tool.slug, tool.category);
  }, [tool.slug, tool.category]);
  return (
    <div className="w-full">
      {/* Capability & Privacy Header Strip */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 font-medium">
          {tool.browserCapable && !tool.serverRequired ? (
            <>
              <span className="flex items-center gap-1 sm:gap-1.5 text-sky-700 bg-sky-100/70 px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[10px] sm:text-xs">
                <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                Browser
              </span>
              <span className="hidden sm:inline text-slate-600">
                100% lokal im Browser – kein Server-Upload
              </span>
              <span className="sm:hidden text-slate-600">
                100% lokal
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 sm:gap-1.5 text-indigo-700 bg-indigo-100/70 px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[10px] sm:text-xs">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                Cloud
              </span>
              <span className="hidden sm:inline text-slate-600">
                Server-Verarbeitung mit temporärer Speicherung
              </span>
              <span className="sm:hidden text-slate-600">
                Server-Verarbeitung
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-slate-500 text-[10px] sm:text-xs ml-auto">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            Max. {activeLimits.maxFileSizeMB} MB
          </span>
          <span className="hidden xs:flex sm:flex items-center gap-1">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            Bis zu {activeLimits.maxBatch} {activeLimits.maxBatch === 1 ? 'Datei' : 'Dateien'}
          </span>
        </div>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="w-full min-h-[260px] sm:min-h-[340px]">
        <ToolDispatcher tool={tool} />
      </div>
    </div>
  );
}
