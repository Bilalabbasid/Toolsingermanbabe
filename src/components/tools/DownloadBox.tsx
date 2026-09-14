'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '@/lib/utils';

interface DownloadBoxProps {
  filename: string;
  originalSizeBytes?: number;
  resultSizeBytes?: number;
  onDownload: () => void;
  onReset: () => void;
  downloadLabel?: string;
}

export function DownloadBox({
  filename,
  originalSizeBytes,
  resultSizeBytes,
  onDownload,
  onReset,
  downloadLabel = 'Datei herunterladen',
}: DownloadBoxProps) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#10b981', '#6366f1'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const savingsPercent =
    originalSizeBytes && resultSizeBytes && originalSizeBytes > resultSizeBytes
      ? Math.round(((originalSizeBytes - resultSizeBytes) / originalSizeBytes) * 100)
      : null;

  const savingsBytes =
    originalSizeBytes && resultSizeBytes && originalSizeBytes > resultSizeBytes
      ? originalSizeBytes - resultSizeBytes
      : null;

  return (
    <>
      <div 
        aria-live="polite"
        className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 md:p-10 shadow-sm animate-fade-in text-center"
      >
        {/* Success Badge */}
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-emerald-100"
          aria-hidden="true"
        >
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1">
          Erfolgreich verarbeitet!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-md mx-auto break-all sm:break-normal sm:truncate px-2">
          Ihre fertige Datei steht zum Download bereit:{' '}
          <span className="font-semibold text-slate-700">{filename}</span>
        </p>

        {/* Metrics Banner if compression occurred */}
        {savingsPercent !== null && savingsPercent > 0 && originalSizeBytes && resultSizeBytes && (
          <div className="max-w-md mx-auto mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex flex-wrap items-center justify-around gap-2 text-center">
            <div className="min-w-[70px]">
              <div className="text-[11px] sm:text-xs text-slate-500">Original</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">{formatBytes(originalSizeBytes)}</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" aria-hidden="true" />
            <div className="min-w-[70px]">
              <div className="text-[11px] sm:text-xs text-slate-500">Neu</div>
              <div className="text-xs sm:text-sm font-bold text-sky-700">{formatBytes(resultSizeBytes)}</div>
            </div>
            <div className="w-full sm:w-auto px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold">
              {savingsPercent}% kleiner (-{formatBytes(savingsBytes!)})
            </div>
          </div>
        )}

        {/* Primary Action Buttons (Desktop & in-page) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 mb-6 sm:mb-8">
          <button
            onClick={onDownload}
            aria-label={downloadLabel}
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-sm sm:text-base shadow-sm transition-colors touch-manipulation active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            <span>{downloadLabel}</span>
          </button>

          <button
            onClick={onReset}
            aria-label="Weitere Datei bearbeiten"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors touch-manipulation cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Weitere Datei bearbeiten</span>
          </button>
        </div>

        {/* Subtle Pro Upsell Banner (non-intrusive) */}
        <div className="max-w-xl mx-auto p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5" aria-hidden="true">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                Noch mehr Dateien gleichzeitig verarbeiten?
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                Mit CoolWave Pro erhalten Sie unbegrenzte Batch-Verarbeitung, 500 MB Dateigröße und werbefreies Arbeiten.
              </div>
            </div>
          </div>
          <Link
            href="/de/preise"
            className="shrink-0 text-xs font-bold text-sky-700 hover:text-sky-800 self-end sm:self-center hover:underline whitespace-nowrap min-h-[36px] flex items-center"
          >
            Pro ansehen →
          </Link>
        </div>
      </div>

      {/* Sticky Mobile Download Bar (safe-area aware, one-handed reachable) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg safe-area-bottom">
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            aria-label="Datei herunterladen"
            className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-sm shadow-sm transition-colors active:scale-[0.98] touch-manipulation cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Herunterladen</span>
          </button>
          <button
            onClick={onReset}
            aria-label="Weitere Datei bearbeiten"
            className="w-12 min-h-[48px] inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition-colors touch-manipulation cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
