'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  EyeOff,
  FileText,
  Plus,
  X,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SquareDashedMousePointer,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import {
  CLIENT_PDF_LIMITS,
  createPagePreviewer,
  outputName,
  pdfBlob,
  readFileBytes,
  type PagePreview,
  type PagePreviewer,
} from '@/lib/client/pdf/common';
import { toGermanErrorMessage } from '@/lib/client/pdf/errors';
import { redactPdf, type RedactionZone, type RedactResult } from '@/lib/client/pdf/redact';

const TOOL_SLUG = 'pdf-schwaerzen';
const PREVIEW_WIDTH = 720;

interface DraftRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function PdfRedactionEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [currentTerm, setCurrentTerm] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [zones, setZones] = useState<RedactionZone[]>([]);
  const [showZoneEditor, setShowZoneEditor] = useState(false);
  const [previewer, setPreviewer] = useState<PagePreviewer | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [preview, setPreview] = useState<PagePreview | null>(null);
  const [draft, setDraft] = useState<DraftRect | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [summary, setSummary] = useState<Omit<RedactResult, 'bytes'> | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Open the document for previews once the zone editor is shown.
  useEffect(() => {
    if (!file || !showZoneEditor) return;
    let disposed = false;
    let instance: PagePreviewer | null = null;
    readFileBytes(file)
      .then((bytes) => createPagePreviewer(bytes))
      .then((p) => {
        if (disposed) {
          void p.destroy();
          return;
        }
        instance = p;
        setPreviewer(p);
      })
      .catch((err) => {
        if (!disposed) {
          setError(toGermanErrorMessage(err));
          setShowZoneEditor(false);
        }
      });
    return () => {
      disposed = true;
      setPreviewer(null);
      setPreview(null);
      if (instance) void instance.destroy();
    };
  }, [file, showZoneEditor]);

  useEffect(() => {
    if (!previewer) return;
    let cancelled = false;
    previewer
      .render(pageIndex, PREVIEW_WIDTH)
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch(() => {
        if (!cancelled) setError('Die Seitenvorschau konnte nicht erzeugt werden.');
      });
    return () => {
      cancelled = true;
    };
  }, [previewer, pageIndex]);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setZones([]);
      setPageIndex(0);
      setError(null);
      trackEvent('upload_completed', { toolSlug: TOOL_SLUG });
    }
  };

  const handleAddTerm = () => {
    const trimmed = currentTerm.trim();
    if (trimmed && !terms.includes(trimmed)) {
      setTerms([...terms, trimmed]);
    }
    setCurrentTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTerm();
    }
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  // --- zone drawing -------------------------------------------------------
  const pointerToFraction = (e: React.PointerEvent) => {
    const el = overlayRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: clamp01((e.clientX - rect.left) / rect.width), y: clamp01((e.clientY - rect.top) / rect.height) };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const p = pointerToFraction(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draft) return;
    const p = pointerToFraction(e);
    if (p) setDraft({ ...draft, x1: p.x, y1: p.y });
  };

  const onPointerUp = () => {
    if (!draft) return;
    const x = Math.min(draft.x0, draft.x1);
    const y = Math.min(draft.y0, draft.y1);
    const width = Math.abs(draft.x1 - draft.x0);
    const height = Math.abs(draft.y1 - draft.y0);
    if (width > 0.005 && height > 0.003) {
      setZones((prev) => [...prev, { pageIndex, x, y, width, height }]);
    }
    setDraft(null);
  };

  const removeZone = (zone: RedactionZone) => setZones((prev) => prev.filter((z) => z !== zone));

  // --- execution ----------------------------------------------------------
  const handleExecute = async () => {
    if (!file) return;
    const finalTerms = [...terms];
    if (currentTerm.trim() && !finalTerms.includes(currentTerm.trim())) {
      finalTerms.push(currentTerm.trim());
    }
    if (finalTerms.length === 0 && zones.length === 0) {
      setError('Bitte geben Sie mindestens einen Begriff ein oder markieren Sie einen Bereich zum Schwärzen.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(2);
    setStatusText('PDF wird im Browser geöffnet...');
    trackEvent('conversion_started', { toolSlug: TOOL_SLUG });

    try {
      const input = await readFileBytes(file);
      const result = await redactPdf(input, { terms: finalTerms, zones }, (pct, text) => {
        setProgress(pct);
        if (text) setStatusText(text);
      });
      setResultBlob(pdfBlob(result.bytes));
      setSummary({
        redactedPages: result.redactedPages,
        matchCount: result.matchCount,
        missingTerms: result.missingTerms,
      });
      setOutputFilename(outputName(file.name, '_geschwaerzt'));
      trackEvent('conversion_completed', { toolSlug: TOOL_SLUG });
    } catch (err: unknown) {
      setError(toGermanErrorMessage(err, 'Fehler beim Schwärzen der PDF-Datei.'));
      trackEvent('conversion_failed', { toolSlug: TOOL_SLUG });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: TOOL_SLUG });
  };

  const handleReset = () => {
    setFile(null);
    setCurrentTerm('');
    setTerms([]);
    setZones([]);
    setShowZoneEditor(false);
    setPageIndex(0);
    setResultBlob(null);
    setSummary(null);
    setError(null);
    setIsProcessing(false);
  };

  if (resultBlob && file && summary) {
    return (
      <div className="w-full space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="text-sm font-semibold">Schwärzung abgeschlossen</p>
            <p className="mt-0.5">
              {summary.matchCount > 0 && `${summary.matchCount} Fundstelle${summary.matchCount === 1 ? '' : 'n'} geschwärzt. `}
              Neu aufgebaute {summary.redactedPages.length === 1 ? 'Seite' : 'Seiten'}: {summary.redactedPages.join(', ')}.
              Auf diesen Seiten ist der ursprüngliche Inhalt vollständig entfernt.
            </p>
          </div>
        </div>
        {summary.missingTerms.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              Nicht im Text gefunden: <strong>{summary.missingTerms.join(', ')}</strong>. Falls diese Angaben als Bild
              (z. B. Scan) im Dokument stehen, markieren Sie sie bitte manuell als Bereich und schwärzen Sie erneut.
            </span>
          </div>
        )}
        <DownloadBox
          filename={outputFilename}
          resultSizeBytes={resultBlob.size}
          onDownload={handleDownload}
          onReset={handleReset}
          downloadLabel="Geschwärztes PDF herunterladen"
        />
      </div>
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} isBackgroundSafe={false} />;
  }

  const pageZones = zones.filter((z) => z.pageIndex === pageIndex);
  const draftRect = draft && {
    left: Math.min(draft.x0, draft.x1),
    top: Math.min(draft.y0, draft.y1),
    width: Math.abs(draft.x1 - draft.x0),
    height: Math.abs(draft.y1 - draft.y0),
  };

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={CLIENT_PDF_LIMITS.maxFileSizeMB}
          onFilesSelected={handleFileSelected}
          isLocal
          title="PDF zum echten Schwärzen ablegen"
          subtitle="Begriffe und Bereiche werden unwiderruflich entfernt – direkt in Ihrem Browser"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="py-6 space-y-5">
            <div className="max-w-lg">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Zu schwärzende Begriffe oder Kennungen hinzufügen
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="z. B. Max Mustermann, DE123456..., Kundennummer"
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hinzufügen</span>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Groß-/Kleinschreibung und Leerzeichen werden bei der Suche ignoriert.
              </p>
            </div>

            {terms.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-2">
                  Bereit zum unwiderruflichen Löschen ({terms.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {terms.map((term, idx) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-medium border border-slate-200"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(idx)}
                        className="text-slate-400 hover:text-rose-600"
                        aria-label={`${term} entfernen`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Manual zones */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowZoneEditor((v) => !v)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-rose-700"
              >
                <SquareDashedMousePointer className="w-4 h-4" />
                <span>{showZoneEditor ? 'Bereichsauswahl ausblenden' : 'Bereiche manuell markieren (z. B. Scans, Bilder, Unterschriften)'}</span>
                {zones.length > 0 && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                    {zones.length}
                  </span>
                )}
              </button>

              {showZoneEditor && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={!previewer || pageIndex === 0}
                      onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" /> Zurück
                    </button>
                    <span className="text-xs text-slate-600">
                      {previewer ? `Seite ${pageIndex + 1} von ${previewer.numPages}` : 'Vorschau wird geladen...'}
                      {pageZones.length > 0 && ` • ${pageZones.length} Bereich${pageZones.length === 1 ? '' : 'e'}`}
                    </span>
                    <button
                      type="button"
                      disabled={!previewer || pageIndex >= previewer.numPages - 1}
                      onClick={() => setPageIndex((i) => (previewer ? Math.min(previewer.numPages - 1, i + 1) : i))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Weiter <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mx-auto max-w-[720px] border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                    {preview ? (
                      <div
                        ref={overlayRef}
                        className="relative w-full select-none touch-none cursor-crosshair"
                        style={{ aspectRatio: `1 / ${preview.aspect}` }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => setDraft(null)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview.url}
                          alt={`Vorschau Seite ${pageIndex + 1}`}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          draggable={false}
                        />
                        {pageZones.map((z, i) => (
                          <div
                            key={`${z.x}-${z.y}-${i}`}
                            className="absolute bg-black/85 ring-1 ring-rose-500"
                            style={{
                              left: `${z.x * 100}%`,
                              top: `${z.y * 100}%`,
                              width: `${z.width * 100}%`,
                              height: `${z.height * 100}%`,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => removeZone(z)}
                              className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow"
                              aria-label="Bereich entfernen"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {draftRect && (
                          <div
                            className="absolute bg-black/60 border border-rose-500"
                            style={{
                              left: `${draftRect.left * 100}%`,
                              top: `${draftRect.top * 100}%`,
                              width: `${draftRect.width * 100}%`,
                              height: `${draftRect.height * 100}%`,
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-500 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Seitenvorschau wird erstellt...
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Ziehen Sie mit Maus oder Finger ein Rechteck über die zu schwärzende Stelle.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950 max-w-2xl">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Echte Schwärzung (True Redaction)</span>
              </div>
              <p className="leading-relaxed text-amber-900/90">
                Jede Seite mit einem Treffer wird als Bild neu aufgebaut und die Stellen werden schwarz eingebrannt. Der
                ursprüngliche Text dieser Seiten ist danach vollständig entfernt und kann weder markiert, kopiert,
                durchsucht noch wiederhergestellt werden. Seiten ohne Treffer bleiben unverändert. Metadaten,
                Lesezeichen, Kommentare und Formularfelder werden entfernt.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verarbeitung 100 % lokal – das Dokument verlässt Ihr Gerät nicht</span>
              </div>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs max-w-2xl">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Andere Datei wählen
            </button>

            <button
              onClick={handleExecute}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span>PDF unwiderruflich schwärzen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
