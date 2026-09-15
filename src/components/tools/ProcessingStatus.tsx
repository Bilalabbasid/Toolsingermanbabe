'use client';

import React from 'react';
import { Loader2, X, CheckCircle2 } from 'lucide-react';

interface ProcessingStatusProps {
  progress?: number;
  statusText: string;
  onCancel?: () => void;
  stage?: 'uploading' | 'processing' | 'optimizing' | 'completed';
}

export function ProcessingStatus({ progress, statusText, onCancel }: ProcessingStatusProps) {
  const isIndeterminate = progress === undefined || progress < 0;
  const clampedProgress = isIndeterminate ? 0 : Math.min(100, Math.max(0, progress));
  const roundedPercent = Math.round(clampedProgress);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 md:p-12 text-center shadow-xs relative overflow-hidden"
    >
      {/* Top indicator line */}
      <div
        className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out ${
          isIndeterminate ? 'w-full animate-pulse' : ''
        }`}
        style={!isIndeterminate ? { width: `${clampedProgress}%` } : undefined}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-2xs"
          aria-hidden="true"
        >
          <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
        </div>

        <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-1">
          Wird verarbeitet...
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
          {statusText || 'Bitte warten Sie einen kurzen Augenblick...'}
        </p>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={!isIndeterminate ? roundedPercent : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Verarbeitungsfortschritt"
          aria-valuetext={!isIndeterminate ? `${roundedPercent}%: ${statusText}` : statusText}
          className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2 relative"
        >
          {isIndeterminate ? (
            <div className="bg-sky-500 h-full rounded-full w-1/3 animate-[indeterminate_1.5s_infinite_ease-in-out]" />
          ) : (
            <div
              className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          )}
        </div>

        {!isIndeterminate && (
          <div className="flex items-center justify-between w-full px-1 text-xs text-slate-500" aria-hidden="true">
            <span className="text-[11px] sm:text-xs">Verarbeitung läuft</span>
            <span className="font-semibold text-slate-700 font-mono text-xs sm:text-sm">
              {roundedPercent}%
            </span>
          </div>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Verarbeitung abbrechen"
            className="mt-5 min-h-[40px] px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 active:bg-rose-50 rounded-lg transition inline-flex items-center gap-1.5 touch-manipulation cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vorgang abbrechen</span>
          </button>
        )}
      </div>
    </div>
  );
}
