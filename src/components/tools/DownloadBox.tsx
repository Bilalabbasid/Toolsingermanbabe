'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, RotateCcw, ArrowRight, Sparkles, FileCheck } from 'lucide-react';
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
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm animate-fade-in text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
        Erfolgreich verarbeitet!
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 truncate max-w-md mx-auto">
        Ihre fertige Datei steht zum Download bereit: <span className="font-semibold text-slate-700">{filename}</span>
      </p>

      {/* Metrics Banner if compression occurred */}
      {savingsPercent !== null && savingsPercent > 0 && originalSizeBytes && resultSizeBytes && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-around">
          <div>
            <div className="text-xs text-slate-500">Original</div>
            <div className="text-sm font-semibold text-slate-700">{formatBytes(originalSizeBytes)}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-xs text-slate-500">Neue Größe</div>
            <div className="text-sm font-bold text-sky-700">{formatBytes(resultSizeBytes)}</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {savingsPercent}% kleiner (-{formatBytes(savingsBytes!)})
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
        <button
          onClick={onDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-sm transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>{downloadLabel}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Weitere Datei bearbeiten</span>
        </button>
      </div>

      {/* Subtle Pro Upsell Banner (non-intrusive) */}
      <div className="max-w-xl mx-auto p-4 rounded-xl border border-slate-200 bg-slate-50 text-left flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              Noch mehr Dateien gleichzeitig verarbeiten?
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Mit CoolWave Pro erhalten Sie unbegrenzte Batch-Verarbeitung, 500 MB Dateigröße und 100% werbefreies Arbeiten.
            </div>
          </div>
        </div>
        <Link
          href="/de/preise"
          className="shrink-0 text-xs font-bold text-sky-700 hover:text-sky-800 self-center hover:underline whitespace-nowrap"
        >
          Pro ansehen →
        </Link>
      </div>
    </div>
  );
}
