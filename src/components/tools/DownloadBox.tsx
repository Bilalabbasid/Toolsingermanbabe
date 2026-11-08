'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, RotateCcw, ArrowRight, Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { AdSlot } from '@/components/common/AdSlot';
import { getToolBySlug } from '@/config/tools.config';
import { ToolCard } from '@/components/tools/ToolCard';
import { featureFlags } from '@/config/featureFlags.config';

interface DownloadBoxProps {
  filename: string;
  originalSizeBytes?: number;
  resultSizeBytes?: number;
  onDownload: () => void;
  onReset: () => void;
  downloadLabel?: string;
  showSavings?: boolean;
  currentToolSlug?: string;
}

interface WorkflowSuggestion {
  name: string;
  slug: string;
  hint: string;
  icon: 'pdf' | 'shield' | 'image' | 'file';
}

function getNextWorkflowSuggestions(filename: string): WorkflowSuggestion[] {
  const lower = filename.toLowerCase();

  if (lower.endsWith('.pdf')) {
    return [
      {
        name: 'PDF komprimieren',
        slug: 'pdf-komprimieren',
        hint: 'Dateigröße für E-Mail & Web um bis zu 80% verkleinern',
        icon: 'pdf',
      },
      {
        name: 'PDF mit Passwort schützen',
        slug: 'pdf-schuetzen',
        hint: 'Vertrauliche Daten mit AES-256 verschlüsseln',
        icon: 'shield',
      },
      {
        name: 'PDF in Word umwandeln',
        slug: 'pdf-in-word-umwandeln',
        hint: 'Dokument in bearbeitbares Word (DOCX) konvertieren',
        icon: 'file',
      },
      {
        name: 'PDF zusammenfügen',
        slug: 'pdf-zusammenfuegen',
        hint: 'Mehrere Dokumente zu einer Datei bündeln',
        icon: 'file',
      },
      {
        name: 'PDF-Seiten nummerieren',
        slug: 'pdf-seiten-nummerieren',
        hint: 'Seitenzahlen und Kopfzeilen ergänzen',
        icon: 'pdf',
      },
      {
        name: 'PDF in JPG umwandeln',
        slug: 'pdf-in-jpg-umwandeln',
        hint: 'Seiten als hochauflösende Bilder exportieren',
        icon: 'image',
      },
    ];
  }

  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.heic') ||
    lower.endsWith('.bmp') ||
    lower.endsWith('.tif') ||
    lower.endsWith('.tiff')
  ) {
    return [
      {
        name: 'Bild komprimieren',
        slug: 'bild-komprimieren',
        hint: 'Dateigröße ohne sichtbaren Qualitätsverlust reduzieren',
        icon: 'image',
      },
      {
        name: 'In WebP umwandeln',
        slug: 'png-in-webp-umwandeln',
        hint: 'Modernes Webformat für minimale Ladezeiten',
        icon: 'image',
      },
      {
        name: 'In PDF umwandeln',
        slug: 'jpg-in-pdf-umwandeln',
        hint: 'Bilder in ein druckfertiges PDF zusammenfassen',
        icon: 'pdf',
      },
      {
        name: 'Metadaten entfernen',
        slug: 'bild-metadaten-entfernen',
        hint: 'EXIF- und Standortdaten zum Schutz der Privatsphäre löschen',
        icon: 'shield',
      },
      {
        name: 'Bildgröße ändern',
        slug: 'bildgroesse-aendern',
        hint: 'Pixelmaße für Web und Social Media anpassen',
        icon: 'image',
      },
    ];
  }

  return [
    {
      name: 'PDF komprimieren',
      slug: 'pdf-komprimieren',
      hint: 'Dateigröße für schnellen Versand optimieren',
      icon: 'pdf',
    },
    {
      name: 'PDF zusammenfügen',
      slug: 'pdf-zusammenfuegen',
      hint: 'Mehrere Dokumente zu einer Datei bündeln',
      icon: 'file',
    },
    {
      name: 'PDF-OCR-Texterkennung',
      slug: 'pdf-ocr-texterkennung',
      hint: 'Gescannte Seiten durchsuchbar machen',
      icon: 'file',
    },
    {
      name: 'Word in PDF umwandeln',
      slug: 'word-in-pdf-umwandeln',
      hint: 'DOCX ohne Office direkt in PDF umwandeln',
      icon: 'file',
    },
    {
      name: 'ZIP-Archiv entpacken',
      slug: 'zip-entpacken',
      hint: 'Dateien lokal im Browser extrahieren',
      icon: 'file',
    },
  ];
}

export function DownloadBox({
  filename,
  originalSizeBytes,
  resultSizeBytes,
  onDownload,
  onReset,
  downloadLabel = 'Datei herunterladen',
  showSavings = true,
  currentToolSlug,
}: DownloadBoxProps) {
  // Small celebration – loaded lazily and skipped for users who prefer reduced motion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0273b4', '#38b0f5', '#10b981', '#a78bfa'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {
        /* decorative only */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rawSavingsPercent =
    originalSizeBytes && resultSizeBytes && originalSizeBytes > resultSizeBytes
      ? Math.round(((originalSizeBytes - resultSizeBytes) / originalSizeBytes) * 100)
      : null;
  const hasSavings = Boolean(
    showSavings !== false &&
      rawSavingsPercent !== null &&
      rawSavingsPercent > 0 &&
      rawSavingsPercent < 100
  );
  const savingsPercent = hasSavings ? rawSavingsPercent : null;
  const savingsBytes = hasSavings && originalSizeBytes && resultSizeBytes ? originalSizeBytes - resultSizeBytes : null;

  const nextTools = getNextWorkflowSuggestions(filename)
    .filter((step) => !currentToolSlug || step.slug !== currentToolSlug)
    .map((step) => getToolBySlug(step.slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .filter((t) => !currentToolSlug || t.slug !== currentToolSlug)
    .slice(0, 3);

  return (
    <>
      <div aria-live="polite" className="w-full card overflow-hidden animate-fade-in">
        {/* Success header */}
        <div className="px-4 pt-8 pb-6 sm:px-10 sm:pt-10 text-center bg-gradient-to-b from-emerald-50/80 to-transparent">
          <span
            className="mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_8px_24px_-8px_rgb(16_185_129/0.7)] animate-pop-in"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-8 h-8" />
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Fertig! Ihre Datei ist bereit.</h3>
          <p className="mt-1.5 text-[13px] sm:text-sm text-ink-subtle max-w-md mx-auto">
            <span className="font-semibold text-ink-muted break-all">{filename}</span>
            {resultSizeBytes ? <span className="tabular-nums"> · {formatBytes(resultSizeBytes)}</span> : null}
          </p>

          {savingsPercent !== null && savingsPercent > 0 && originalSizeBytes && resultSizeBytes && (
            <div className="mt-5 max-w-sm mx-auto rounded-xl bg-white ring-1 ring-line p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-ink-subtle text-left">
                  Vorher <strong className="block text-sm text-ink-muted tabular-nums">{formatBytes(originalSizeBytes)}</strong>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
                <span className="text-ink-subtle text-right">
                  Nachher <strong className="block text-sm text-sky-700 tabular-nums">{formatBytes(resultSizeBytes)}</strong>
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-surface-muted overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${100 - savingsPercent}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                {savingsPercent} % kleiner (−{formatBytes(savingsBytes!)})
              </p>
            </div>
          )}

          {/* Primary actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onDownload}
              className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2 px-7 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-base shadow-brand transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              {downloadLabel}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2 px-5 rounded-xl ring-1 ring-line-strong bg-white hover:bg-surface-muted text-ink font-semibold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-ink-subtle" aria-hidden="true" />
              Weitere Datei bearbeiten
            </button>
          </div>

          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-subtle">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Auf Ihrem Gerät erstellt – nichts wurde hochgeladen.
          </p>
        </div>

        {/* Workflow chaining */}
        {nextTools.length > 0 && (
          <div className="px-4 pb-6 sm:px-10 sm:pb-8">
            <div className="max-w-2xl mx-auto pt-5 border-t border-line text-left">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
                <Layers className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                Direkt weiterbearbeiten
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {nextTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} compact headingLevel="h4" />
                ))}
              </div>
            </div>
          </div>
        )}

        {featureFlags.enableStripeCheckout && (
          <div className="px-4 pb-6 sm:px-10">
            <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-xl ring-1 ring-line bg-surface-muted text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0" aria-hidden="true">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">Mehr Dateien gleichzeitig?</p>
                  <p className="text-xs text-ink-subtle mt-0.5">Mit Datei Tools Pro: größere Stapel, 500 MB pro Datei, werbefrei.</p>
                </div>
              </div>
              <Link href="/de/preise" className="shrink-0 text-xs font-bold text-sky-700 hover:text-sky-800 whitespace-nowrap">
                Pro entdecken →
              </Link>
            </div>
          </div>
        )}

        <div className="px-2 pb-2">
          <AdSlot slotKey="tool_content" format="horizontal" />
        </div>
      </div>

      {/* Sticky mobile download bar (thumb-reachable, safe-area aware) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-line px-4 pt-2.5 pb-2.5 shadow-pop safe-area-bottom animate-slide-up">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-sky-600 active:bg-sky-800 text-white font-bold text-sm shadow-brand cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Herunterladen
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Weitere Datei bearbeiten"
            className="w-12 min-h-[48px] inline-flex items-center justify-center rounded-xl ring-1 ring-line bg-white active:bg-surface-muted text-ink-muted cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
