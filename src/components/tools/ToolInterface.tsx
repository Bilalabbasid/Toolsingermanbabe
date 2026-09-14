'use client';

import React, { useEffect } from 'react';
import { ToolDefinition } from '@/types/tool';
import { ToolDispatcher } from '@/components/tools/ToolDispatcher';
import { Cpu, ShieldCheck, HardDrive, Layers } from 'lucide-react';
import { recordRecentTool } from '@/lib/search';
import { trackToolView } from '@/lib/analytics';

interface ToolInterfaceProps {
  tool: ToolDefinition;
}

export function ToolInterface({ tool }: ToolInterfaceProps) {
  useEffect(() => {
    recordRecentTool(tool.slug);
    trackToolView(tool.slug, tool.category);
  }, [tool.slug, tool.category]);
  return (
    <div className="w-full">
      {/* Capability & Privacy Header Strip */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 font-medium">
          {tool.browserCapable ? (
            <>
              <span className="flex items-center gap-1.5 text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                Browser-Engine
              </span>
              <span className="hidden sm:inline text-slate-600">
                100% lokal im Browser – kein Upload auf Server
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Server-Engine
              </span>
              <span className="hidden sm:inline text-slate-600">
                Ende-zu-Ende verschlüsselt, Auto-Löschung nach 15 Min.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            Max. {tool.freeLimits.maxFileSizeMB} MB
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Bis zu {tool.freeLimits.maxBatch} {tool.freeLimits.maxBatch === 1 ? 'Datei' : 'Dateien'}
          </span>
        </div>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="w-full">
        <ToolDispatcher tool={tool} />
      </div>
    </div>
  );
}
