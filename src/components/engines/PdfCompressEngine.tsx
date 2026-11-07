'use client';

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Minimize2, FileText, Sliders, AlertTriangle, Info } from 'lucide-react';
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
} from '@/lib/client/pdf/common';
import { compressPdf, type CompressionLevel } from '@/lib/client/pdf/compress';
import { PdfToolError, toGermanErrorMessage } from '@/lib/client/pdf/errors';

const TOOL_SLUG = 'pdf-komprimieren';

const LEVELS: { id: CompressionLevel; title: string; desc: string; tag: string; warn?: boolean }[] = [
  { id: 'low', title: 'Geringe Kompression', desc: 'Beste visuelle Qualität, Bilder bis 3000 px', tag: 'Qualität' },
  { id: 'medium', title: 'Empfohlen', desc: 'Ideale Balance für Web & E-Mail, Bilder bis 2000 px', tag: 'Balance' },
  { id: 'high', title: 'Starke Kompression', desc: 'Kleinere Bilder (bis 1400 px) & ohne Metadaten', tag: 'Klein' },
  {
    id: 'extreme',
    title: 'Maximal (Seiten als Bild)',
    desc: 'Jede Seite wird zu einem Bild – Text ist danach NICHT mehr auswählbar oder durchsuchbar',
    tag: 'Achtung',
    warn: true,
  },
];

const UNCHANGED_NOTE =
  'Diese PDF ist bereits optimal komprimiert – eine kleinere Version war nicht möglich. Sie erhalten Ihre Originaldatei unverändert.';

interface CompressOutcome {
  blob: Blob;
  fileName: string;
  size: number;
  unchanged: boolean;
  imagesOptimized: number;
}

async function compressFile(
  file: File,
  level: CompressionLevel,
  onProgress?: (pct: number, text?: string) => void
): Promise<CompressOutcome> {
  const input = await readFileBytes(file);
  const result = await compressPdf(input, level, onProgress);
  return {
    blob: pdfBlob(result.bytes),
    fileName: result.unchanged ? file.name : outputName(file.name, '_komprimiert'),
    size: result.bytes.length,
    unchanged: result.unchanged,
    imagesOptimized: result.imagesOptimized,
  };
}

export function PdfCompressEngine() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [outcome, setOutcome] = useState<CompressOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      trackEvent('upload_completed', { toolSlug: TOOL_SLUG, size: files[0].size });
    } else {
      const validationError = validateClientBatch(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `batch_pdf_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { toolSlug: TOOL_SLUG, count: files.length });
    }
  };

  // Single-file execute
  const executeSingleCompress = async () => {
    if (!singleFile) return;
    setIsProcessing(true);
    setError(null);
    setProgress(2);
    setStatusText('PDF-Werkzeuge werden im Browser geladen...');
    trackEvent('conversion_started', { toolSlug: TOOL_SLUG, level });

    try {
      const result = await compressFile(singleFile, level, (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });
      setOutcome(result);
      trackEvent('conversion_completed', {
        toolSlug: TOOL_SLUG,
        level,
        savings: singleFile.size - result.size,
        unchanged: result.unchanged,
      });
    } catch (err) {
      setError(toGermanErrorMessage(err, 'Fehler bei der Komprimierung. Bitte versuchen Sie es mit einer anderen Stufe erneut.'));
      trackEvent('conversion_failed', { toolSlug: TOOL_SLUG });
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
          return await compressFile(item.file, level, (pct, text) => {
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
      onItemComplete: (id, result: CompressOutcome) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  statusText: result.unchanged ? 'Bereits optimal – Original beibehalten' : undefined,
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
      downloadBlob(zipBlob, `datei_tools_pdf_stapel_${Date.now()}.zip`);
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

  const levelSelector = (compact: boolean) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-3' : 'gap-4'}`}>
      {LEVELS.map((lvl) => (
        <button
          key={lvl.id}
          type="button"
          disabled={isProcessing}
          onClick={() => setLevel(lvl.id)}
          className={`p-4 rounded-xl border text-left transition-all ${
            level === lvl.id
              ? lvl.warn
                ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-2 ring-amber-500/20'
                : 'border-sky-500 bg-sky-50/50 shadow-sm ring-2 ring-sky-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="font-semibold text-sm text-slate-900">{lvl.title}</span>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                lvl.warn ? 'text-amber-700 bg-amber-100' : 'text-emerald-600 bg-emerald-50'
              }`}
            >
              {lvl.tag}
            </span>
          </div>
          <p className={`text-xs ${lvl.warn ? 'text-amber-800' : 'text-slate-500'}`}>{lvl.desc}</p>
        </button>
      ))}
    </div>
  );

  const errorBox = error && (
    <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
      {error}
    </div>
  );

  if (outcome && singleFile) {
    return (
      <div className="w-full space-y-4">
        {outcome.unchanged ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>{UNCHANGED_NOTE}</span>
          </div>
        ) : (
          level === 'extreme' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>Die Seiten wurden in Bilder umgewandelt. Text ist in dieser Datei nicht mehr auswählbar.</span>
            </div>
          )
        )}
        <DownloadBox
          filename={outcome.fileName}
          originalSizeBytes={singleFile.size}
          resultSizeBytes={outcome.size}
          onDownload={() => {
            downloadBlob(outcome.blob, outcome.fileName);
            trackEvent('download_completed', { toolSlug: TOOL_SLUG });
          }}
          onReset={handleResetSingle}
          downloadLabel={outcome.unchanged ? 'Originaldatei herunterladen' : 'Komprimiertes PDF herunterladen'}
        />
      </div>
    );
  }

  if (isProcessing && !isBatchMode) {
    return (
      <ProcessingStatus
        progress={progress}
        statusText={statusText}
        isLargeFile={Boolean(singleFile && singleFile.size > 15 * 1024 * 1024)}
        isBackgroundSafe={false}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {isBatchMode && batchItems.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Kompressionsstufe für alle PDF-Dokumente
            </h3>
            {levelSelector(true)}
          </div>
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
            toolTitle="PDF-Stapelkomprimierung"
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
            subtitle={`PDF-Dateigröße direkt im Browser reduzieren • Bis zu ${CLIENT_PDF_LIMITS.maxBatchFiles} PDFs gleichzeitig`}
          />
          {errorBox}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{singleFile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Originalgröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span>
              </p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kompressionsgrad wählen
            </label>
            {levelSelector(false)}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Die Komprimierung läuft vollständig in Ihrem Browser: Bilder werden neu kodiert und verkleinert, die
              PDF-Struktur wird verlustfrei optimiert. Ist das Ergebnis nicht kleiner, erhalten Sie die Originaldatei.
            </p>
            {errorBox}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleResetSingle} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Anderes Dokument wählen
            </button>

            <button
              onClick={executeSingleCompress}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>PDF jetzt verkleinern</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
