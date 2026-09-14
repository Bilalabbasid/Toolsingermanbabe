import React from 'react';
import { Loader2, X } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
  statusText: string;
  onCancel?: () => void;
}

export function ProcessingStatus({ progress, statusText, onCancel }: ProcessingStatusProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const roundedPercent = Math.round(clampedProgress);

  return (
    <div 
      aria-live="polite"
      className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-10 md:p-12 text-center shadow-sm relative overflow-hidden"
    >
      {/* Subtle top indicator line on mobile */}
      <div 
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out sm:hidden"
        style={{ width: `${clampedProgress}%` }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div 
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-3 sm:mb-4 border border-sky-100 animate-spin"
          aria-hidden="true"
        >
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          Wird verarbeitet...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-xs sm:max-w-none truncate sm:whitespace-normal">
          {statusText}
        </p>

        {/* Semantic Progress bar */}
        <div 
          role="progressbar"
          aria-valuenow={roundedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Verarbeitungsfortschritt"
          aria-valuetext={`${roundedPercent}%: ${statusText}`}
          className="w-full bg-slate-100 rounded-full h-3 sm:h-2.5 overflow-hidden mb-2 relative"
        >
          <div
            className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full px-1 text-xs text-slate-500" aria-hidden="true">
          <span className="text-[11px] sm:text-xs">Verarbeitung läuft</span>
          <span className="font-semibold text-slate-700 font-mono text-xs sm:text-sm">
            {roundedPercent}%
          </span>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Verarbeitung abbrechen"
            className="mt-5 min-h-[44px] px-4 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 active:bg-rose-50 rounded-lg transition inline-flex items-center gap-1.5 touch-manipulation cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vorgang abbrechen</span>
          </button>
        )}
      </div>
    </div>
  );
}
