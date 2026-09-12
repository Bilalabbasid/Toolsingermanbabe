import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
  statusText: string;
}

export function ProcessingStatus({ progress, statusText }: ProcessingStatusProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Wird verarbeitet...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">{statusText}</p>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className="bg-sky-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <span className="text-xs font-semibold text-slate-600 font-mono">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
