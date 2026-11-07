'use client';

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  Wrench,
  Zap,
  FileCheck,
  Layers,
  MessageSquareOff,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import {
  CLIENT_PDF_LIMITS,
  outputName,
  pdfBlob,
  readFileBytes,
  validateClientBatch,
  type ProgressFn,
} from '@/lib/client/pdf/common';
import { PdfToolError, toGermanErrorMessage } from '@/lib/client/pdf/errors';
import {
  flattenPdf,
  optimizePdf,
  repairPdf,
  stripAnnotationsPdf,
  type ProcessResult,
} from '@/lib/client/pdf/repair';

export type RepairOptimizeMode = 'repair' | 'optimize' | 'pdfa' | 'flatten' | 'strip-annotations';

interface PdfRepairOptimizeEngineProps {
  mode: RepairOptimizeMode;
  toolSlug?: string;
}

interface Outcome {
  blob: Blob;
  fileName: string;
  size: number;
  audit: string;
  warning?: string;
}

const SUFFIX: Record<Exclude<RepairOptimizeMode, 'pdfa'>, string> = {
  repair: '_repariert',
  optimize: '_optimiert',
  flatten: '_abgeflacht',
  'strip-annotations': '_ohne_anmerkungen',
};

function getModeTitle(mode: RepairOptimizeMode): string {
  switch (mode) {
    case 'repair':
      return 'Beschädigte PDF reparieren';
    case 'optimize':
      return 'PDF für das Web optimieren';
    case 'pdfa':
      return 'In PDF/A umwandeln';
    case 'flatten':
      return 'Formulare & Anmerkungen abflachen';
    case 'strip-annotations':
      return 'Anmerkungen & Notizen entfernen';
    default:
      return 'PDF verarbeiten';
  }
}

function ModeIcon({ mode }: { mode: RepairOptimizeMode }) {
  switch (mode) {
    case 'repair':
      return <Wrench className="w-5 h-5" />;
    case 'optimize':
      return <Zap className="w-5 h-5" />;
    case 'pdfa':
      return <FileCheck className="w-5 h-5" />;
    case 'flatten':
      return <Layers className="w-5 h-5" />;
    case 'strip-annotations':
      return <MessageSquareOff className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

function getModeDescription(mode: RepairOptimizeMode): string {
  switch (mode) {
    case 'repair':
      return 'Baut die Querverweistabelle (xref) und die Objektstruktur neu auf. Funktioniert bei Fehlern wie „Datei beschädigt“ oder abgebrochenen Downloads, sofern die Seiteninhalte noch vorhanden sind.';
    case 'optimize':
      return 'Linearisiert das PDF (Fast Web View), damit die erste Seite im Browser sofort erscheint, und komprimiert die Struktur verlustfrei.';
    case 'flatten':
      return 'Formularfelder, Kommentare und Stempel werden dauerhaft in die Seite eingebrannt und sind danach nicht mehr bearbeitbar.';
    case 'strip-annotations':
      return 'Entfernt Kommentare, Textmarkierungen, Notizen und Stempel vollständig aus der Datei – auch aus dem Dateiinhalt, nicht nur aus der Anzeige.';
    default:
      return '';
  }
}

export function PdfRepairOptimizeEngine({ mode, toolSlug = 'pdf-optimieren' }: PdfRepairOptimizeEngineProps) {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeLinksAndForms, setIncludeLinksAndForms] = useState(false);

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setError(null);

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      setSingleFile(files[0]);
      setIsBatchMode(false);
      trackEvent('upload_completed', { toolSlug, mode });
    } else {
      const validationError = validateClientBatch(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `pdf_repair_batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { toolSlug, mode, count: files.length });
    }
  };

  const processFile = async (file: File, onProgress?: ProgressFn): Promise<Outcome> => {
    if (mode === 'pdfa') throw new PdfToolError('UNSUPPORTED', 'PDF/A-Umwandlung ist im Browser nicht verfügbar.');
    onProgress?.(5, 'PDF-Werkzeuge werden im Browser geladen...');
    const input = await readFileBytes(file);
    let result: ProcessResult;
    switch (mode) {
      case 'repair':
        result = await repairPdf(input, onProgress);
        break;
      case 'optimize':
        result = await optimizePdf(input, onProgress);
        break;
      case 'flatten':
        result = await flattenPdf(input, onProgress);
        break;
      case 'strip-annotations':
      default:
        result = await stripAnnotationsPdf(input, { includeLinksAndForms }, onProgress);
        break;
    }
    onProgress?.(100, 'Fertig');
    return {
      blob: pdfBlob(result.bytes),
      fileName: outputName(file.name, SUFFIX[mode]),
      size: result.bytes.length,
      audit: result.audit,
      warning: result.warning,
    };
  };

  // Single file execute
  const executeSingleProcessing = async () => {
    if (!singleFile) return;
    setIsProcessing(true);
    setError(null);
    setProgress(2);
    setStatusText('PDF-Dokument wird analysiert...');
    trackEvent('conversion_started', { toolSlug, mode });

    try {
      const result = await processFile(singleFile, (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });
      setOutcome(result);
      trackEvent('conversion_completed', { toolSlug, mode });
    } catch (err: unknown) {
      setError(toGermanErrorMessage(err));
      trackEvent('conversion_failed', { toolSlug, mode });
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch execute
  const startBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const tasks = batchItems.map((item) => ({
      id: item.id,
      run: async (signal?: AbortSignal) => {
        if (signal?.aborted) throw new Error('Abgebrochen');
        try {
          return await processFile(item.file, (pct, text) => {
            setBatchItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress: pct, statusText: text ?? i.statusText } : i))
            );
          });
        } catch (err) {
          throw new PdfToolError('RUNTIME', toGermanErrorMessage(err));
        }
      },
    }));

    await runConcurrentBatch(tasks, {
      concurrency: CLIENT_PDF_LIMITS.concurrency,
      signal: abortControllerRef.current.signal,
      onItemStart: (id) => {
        setBatchItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 5 } : i)));
      },
      onItemComplete: (id, result: Outcome) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  statusText: result.warning ?? result.audit,
                  outputBlob: result.blob,
                  outputFileName: result.fileName,
                  outputSize: result.size,
                }
              : i
          )
        );
      },
      onItemError: (id, err) => {
        setBatchItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'failed', error: err.message, progress: 0 } : i))
        );
      },
    });

    setIsProcessing(false);
  };

  const cancelBatch = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setBatchItems((prev) =>
      prev.map((i) => (i.status === 'processing' || i.status === 'queued' ? { ...i, status: 'cancelled' } : i))
    );
  };

  const clearQueue = () => {
    setBatchItems([]);
    setIsBatchMode(false);
  };

  const removeItem = (id: string) => {
    setBatchItems((prev) => prev.filter((i) => i.id !== id));
  };

  const downloadItem = (item: BatchItem) => {
    if (item.outputBlob && item.outputFileName) {
      downloadBlob(item.outputBlob, item.outputFileName);
    }
  };

  const downloadAllZip = async () => {
    const completedItems = batchItems.filter((i) => i.status === 'completed' && i.outputBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      completedItems.forEach((item) => {
        if (item.outputBlob && item.outputFileName) {
          zip.file(item.outputFileName, item.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `datei_tools_${mode}_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      setError('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setSingleFile(null);
    setOutcome(null);
    setError(null);
    setIsProcessing(false);
  };

  // PDF/A: an ISO 19005-conformant conversion (font embedding, ICC output intents, XMP, validation)
  // cannot be done reliably in the browser. Do not pretend otherwise.
  if (mode === 'pdfa') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">PDF/A-Umwandlung derzeit nicht verfügbar</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Datei Tools verarbeitet alle Dateien ausschließlich in Ihrem Browser. Eine normgerechte PDF/A-Umwandlung
              (ISO 19005: Einbettung aller Schriften, Farbprofile, XMP-Metadaten und anschließende Validierung) ist
              dort nicht zuverlässig möglich. Statt eine Konformität nur vorzutäuschen, bieten wir diese Funktion
              deshalb aktuell nicht an.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tipp: Viele Office-Programme (z. B. LibreOffice oder Microsoft Word) können beim Export direkt ein PDF/A
              erzeugen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (outcome && singleFile) {
    return (
      <div className="space-y-6 w-full">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Erfolgreich verarbeitet</p>
            <p className="text-xs text-emerald-700 mt-0.5">{outcome.audit}</p>
          </div>
        </div>
        {outcome.warning && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>{outcome.warning}</span>
          </div>
        )}

        <DownloadBox
          filename={outcome.fileName}
          originalSizeBytes={singleFile.size}
          resultSizeBytes={outcome.size}
          onDownload={() => {
            downloadBlob(outcome.blob, outcome.fileName);
            trackEvent('download_completed', { toolSlug, mode });
          }}
          onReset={handleResetSingle}
          downloadLabel="Verarbeitetes PDF herunterladen"
        />
      </div>
    );
  }

  if (isProcessing && !isBatchMode) {
    return <ProcessingStatus progress={progress} statusText={statusText} isBackgroundSafe={false} />;
  }

  const errorBox = error && (
    <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
      {error}
    </div>
  );

  const stripOption = mode === 'strip-annotations' && (
    <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <input
        type="checkbox"
        checked={includeLinksAndForms}
        onChange={(e) => setIncludeLinksAndForms(e.target.checked)}
        disabled={isProcessing}
        className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
      />
      <span>
        Auch Links und Formularfelder entfernen
        <span className="block text-xs text-slate-500 mt-0.5">
          Standardmäßig werden nur Kommentare, Markierungen, Notizen und Stempel gelöscht.
        </span>
      </span>
    </label>
  );

  return (
    <div className="w-full space-y-6">
      {isBatchMode && batchItems.length > 0 ? (
        <div className="space-y-4">
          {stripOption}
          {errorBox}
          <BatchProcessingQueue
            items={batchItems}
            isProcessing={isProcessing}
            onStartBatch={startBatch}
            onCancelBatch={cancelBatch}
            onClearQueue={clearQueue}
            onRemoveItem={removeItem}
            onDownloadItem={downloadItem}
            onDownloadAllZip={downloadAllZip}
            isZipping={isZipping}
            toolTitle={`${getModeTitle(mode)} (Stapelverarbeitung)`}
          />
        </div>
      ) : !singleFile ? (
        <div className="space-y-4">
          <FileUploader
            acceptedExtensions={['.pdf']}
            maxFileSizeMB={CLIENT_PDF_LIMITS.maxFileSizeMB}
            allowMultiple={true}
            isLocal
            onFilesSelected={handleFilesSelected}
            title="PDF-Dateien hier ablegen (Einzel- oder Stapelmodus)"
            subtitle={`Bis zu ${CLIENT_PDF_LIMITS.maxBatchFiles} PDFs gleichzeitig – verarbeitet direkt in Ihrem Browser`}
          />
          {errorBox}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <ModeIcon mode={mode} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{singleFile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span>
              </p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
              <span>{getModeDescription(mode)}</span>
            </div>
            {stripOption}
            {errorBox}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleResetSingle} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Anderes Dokument wählen
            </button>

            <button
              onClick={executeSingleProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <ModeIcon mode={mode} />
              <span>{getModeTitle(mode)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
