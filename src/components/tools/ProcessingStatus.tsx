'use client';

import React from 'react';
import { Loader2, X, Cpu, ShieldCheck, Info } from 'lucide-react';

interface ProcessingStatusProps {
  progress?: number;
  statusText: string;
  onCancel?: () => void;
  stage?: 'uploading' | 'processing' | 'optimizing' | 'completed';
  isLargeFile?: boolean;
  /**
   * @deprecated Processing runs in this browser tab, so it is never "background safe".
   * Kept for backwards compatibility; has no effect.
   */
  isBackgroundSafe?: boolean;
  autoDownload?: boolean;
  onAutoDownloadChange?: (auto: boolean) => void;
}

const STAGE_LABELS: Record<NonNullable<ProcessingStatusProps['stage']>, string> = {
  uploading: 'Datei wird eingelesen …',
  processing: 'Wird verarbeitet …',
  optimizing: 'Wird optimiert …',
  completed: 'Fast fertig …',
};

export function ProcessingStatus({
  progress,
  statusText,
  onCancel,
  stage,
  isLargeFile,
  autoDownload,
  onAutoDownloadChange,
}: ProcessingStatusProps) {
  const [timerElapsed, setTimerElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setTimerElapsed(true), 4000);
    return () => clearTimeout(timer);
  }, []);
  const showLongRunningHint = Boolean(isLargeFile) || timerElapsed;

  const isIndeterminate = progress === undefined || progress < 0;
  const clampedProgress = isIndeterminate ? 0 : Math.min(100, Math.max(0, progress));
  const roundedPercent = Math.round(clampedProgress);
  const heading = stage ? STAGE_LABELS[stage] : 'Wird verarbeitet …';

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full card px-5 py-8 sm:p-10 md:p-12 text-center relative overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <span className="relative w-14 h-14 sm:w-16 sm:h-16 mb-5" aria-hidden="true">
          <span className="absolute inset-0 rounded-2xl bg-sky-100 motion-safe:animate-ping opacity-40" />
          <span className="relative w-full h-full rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-brand">
            <Loader2 className="w-7 h-7 animate-spin" />
          </span>
        </span>

        <h3 className="text-lg sm:text-xl font-bold text-ink tracking-tight">{heading}</h3>
        <p className="mt-1.5 text-[13px] sm:text-sm text-ink-subtle max-w-sm leading-relaxed">
          {statusText || 'Einen Moment bitte …'}
        </p>

        {/* Progress bar */}
        <div className="w-full mt-6">
          <div
            role="progressbar"
            aria-valuenow={!isIndeterminate ? roundedPercent : undefined}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Verarbeitungsfortschritt"
            aria-valuetext={!isIndeterminate ? `${roundedPercent} %: ${statusText}` : statusText}
            className="w-full h-2.5 rounded-full bg-surface-muted overflow-hidden ring-1 ring-inset ring-line"
          >
            {isIndeterminate ? (
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 animate-indeterminate" />
            ) : (
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-600 transition-[width] duration-300 ease-out"
                style={{ width: `${clampedProgress}%` }}
              />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-subtle" aria-hidden="true">
            <span className="inline-flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Auf Ihrem Gerät
            </span>
            {!isIndeterminate && <span className="font-semibold text-ink tabular-nums">{roundedPercent} %</span>}
          </div>
        </div>

        {showLongRunningHint && (
          <div className="mt-6 w-full p-3.5 rounded-xl bg-surface-muted ring-1 ring-line text-left flex items-start gap-3 animate-fade-in">
            <Info className="w-4.5 h-4.5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="text-xs text-ink-muted leading-relaxed space-y-1">
              <p className="font-semibold text-ink">Das kann einen Moment dauern</p>
              <p>
                Die Berechnung läuft lokal mit der Leistung Ihres Geräts. Bitte lassen Sie diesen Tab geöffnet, bis das
                Ergebnis bereitsteht – beim Schließen wird der Vorgang abgebrochen.
              </p>
              <p className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Es werden keine Daten übertragen.
              </p>
            </div>
          </div>
        )}

        {onAutoDownloadChange && (
          <label className="mt-4 inline-flex items-center gap-2.5 text-xs text-ink-muted bg-white hover:bg-surface-muted py-2 px-3.5 rounded-xl ring-1 ring-line transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(autoDownload)}
              onChange={(e) => onAutoDownloadChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-sky-600 cursor-pointer"
            />
            <span className="font-medium">Nach Fertigstellung automatisch herunterladen</span>
          </label>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-ink-subtle hover:text-rose-600 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}
