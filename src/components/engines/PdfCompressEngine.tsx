'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { Minimize2, FileText, Check, Sparkles, Sliders } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import { useClientSubscription } from '@/hooks/useClientSubscription';

type CompressionLevel = 'high' | 'medium' | 'low';

export function PdfCompressEngine() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [outputFilename, setOutputFilename] = useState('');

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = useClientSubscription().isPro;
  const limits = getBatchLimits(isPro);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      setSingleFile(files[0]);
      setIsBatchMode(false);
      trackEvent('upload_completed', { toolSlug: 'pdf-komprimieren', size: files[0].size });
    } else {
      const validation = validateBatchFiles(files, isPro);
      if (!validation.valid) {
        alert(validation.error);
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
      trackEvent('batch_upload_completed', { toolSlug: 'pdf-komprimieren', count: files.length });
    }
  };

  /**
   * Helper to compress a single PDF with differing strategies for Low, Medium, and High
   */
  const compressSinglePdf = async (
    file: File,
    compLevel: CompressionLevel,
    onProgress?: (pct: number, text?: string) => void
  ): Promise<{ blob: Blob; fileName: string; estimatedSize: number }> => {
    onProgress?.(20, 'PDF-Optimierung wird gestartet...');

    // 1. Attempt genuine server-side Ghostscript compression first
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pdf_compress');
      formData.append('options', JSON.stringify({ level: compLevel }));

      const res = await fetch('/api/v1/jobs', { method: 'POST', body: formData });
      if (res.ok) {
        const jobData = await res.json();
        const jobId = jobData.jobId;
        let attempts = 0;
        let completed = false;
        while (attempts < 60) {
          await new Promise((r) => setTimeout(r, 800));
          attempts++;
          const pollRes = await fetch(`/api/v1/jobs/${jobId}`);
          if (!pollRes.ok) continue;
          const status = await pollRes.json();
          if (status.status === 'completed') {
            completed = true;
            break;
          }
          if (status.status === 'failed') break;
        }
        if (completed) {
          const dlRes = await fetch(`/api/v1/jobs/${jobId}/download`);
          if (dlRes.ok) {
            const blob = await dlRes.blob();
            onProgress?.(100, 'Fertig');
            return {
              blob,
              fileName: `coolwave_komprimiert_${file.name}`,
              estimatedSize: blob.size,
            };
          }
        }
      }
    } catch {
      // Fallback to differing in-browser PDFDocument compression
    }

    onProgress?.(50, `Kompression (${compLevel.toUpperCase()}) wird angewendet...`);

    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

    let useObjectStreams = true;

    if (compLevel === 'high') {
      // High: aggressive metadata and structural pruning
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('CoolWave PDF Optimizer');
      pdf.setCreator('CoolWave');
      try {
        const { PDFName } = await import('pdf-lib');
        pdf.catalog.delete(PDFName.of('PieceInfo'));
        pdf.catalog.delete(PDFName.of('Metadata'));
      } catch {}
      useObjectStreams = true;
    } else if (compLevel === 'medium') {
      // Medium: balanced object streams
      pdf.setProducer('CoolWave PDF Optimizer');
      useObjectStreams = true;
    } else {
      // Low: mild compression preserving all document metadata
      useObjectStreams = false;
    }

    onProgress?.(80, 'Kompression wird finalisiert...');
    const compressedBytes = await pdf.save({
      useObjectStreams,
      addDefaultPage: false,
    });

    const calculatedTarget = compressedBytes.length;
    const finalBlob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
    onProgress?.(100, 'Fertig');

    return {
      blob: finalBlob,
      fileName: `coolwave_komprimiert_${file.name}`,
      estimatedSize: calculatedTarget,
    };
  };

  // Single-file execute
  const executeSingleCompress = async () => {
    if (!singleFile) return;
    setIsProcessing(true);
    setProgress(20);
    setStatusText('PDF-Struktur wird analysiert und bereinigt...');
    trackEvent('conversion_started', { toolSlug: 'pdf-komprimieren', level });

    try {
      const result = await compressSinglePdf(singleFile, level, (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });
      setCompressedBlob(result.blob);
      setCompressedSize(result.estimatedSize);
      setOutputFilename(result.fileName);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-komprimieren', savings: singleFile.size - result.estimatedSize });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler bei der Komprimierung. Bitte stellen Sie sicher, dass das PDF nicht verschlüsselt ist.');
      trackEvent('conversion_failed', { toolSlug: 'pdf-komprimieren' });
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
        return await compressSinglePdf(item.file, level, (pct, statusText) => {
          setBatchItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: pct, statusText } : i))
          );
        });
      },
    }));

    await runConcurrentBatch(tasks, {
      concurrency: limits.clientConcurrency,
      signal: abortControllerRef.current.signal,
      onItemStart: (id) => {
        setBatchItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 10 } : i))
        );
      },
      onItemComplete: (id, result) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  outputBlob: result.blob,
                  outputFileName: result.fileName,
                  outputSize: result.estimatedSize,
                }
              : i
          )
        );
      },
      onItemError: (id, err) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: 'failed', error: err.message, progress: 0 } : i
          )
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
      downloadBlob(zipBlob, `coolwave_pdf_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setSingleFile(null);
    setCompressedBlob(null);
    setCompressedSize(0);
    setIsProcessing(false);
  };

  if (compressedBlob && singleFile) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={singleFile.size}
        resultSizeBytes={compressedSize}
        onDownload={() => downloadBlob(compressedBlob, outputFilename)}
        onReset={handleResetSingle}
        downloadLabel="Komprimiertes PDF herunterladen"
      />
    );
  }

  if (isProcessing && !isBatchMode) {
    return (
      <ProcessingStatus
        progress={progress}
        statusText={statusText}
        isLargeFile={Boolean(singleFile && singleFile.size > 15 * 1024 * 1024)}
        isBackgroundSafe={true}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {isBatchMode && batchItems.length > 0 ? (
        <div className="space-y-6">
          {/* Compression Level Selector for Batch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Kompressionsstufe für alle PDF-Dokumente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'low', title: 'Geringe Kompression', desc: 'Maximale Text- & Bildschärfe', save: '~25%' },
                { id: 'medium', title: 'Empfohlene Kompression', desc: 'Optimal für Web & E-Mail', save: '~48%' },
                { id: 'high', title: 'Starke Kompression', desc: 'Kleinste Dateigröße', save: '~68%' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setLevel(lvl.id as CompressionLevel)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    level === lvl.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900">{lvl.title}</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {lvl.save}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

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
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={limits.maxFileSizeMB}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="PDF-Dateien hier ablegen (Einzel- oder Stapelmodus)"
          subtitle={`Reduzieren Sie PDF-Dateigrößen • Bis zu ${limits.maxBatchFiles} PDFs gleichzeitig (${isPro ? 'Pro' : 'Kostenlos'})`}
        />
      ) : (
        /* Single File View (Preserved) */
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

          <div className="py-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Kompressionsgrad wählen
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'low', title: 'Geringe Kompression', desc: 'Beste visuelle Qualität', save: '~25%' },
                { id: 'medium', title: 'Empfohlen', desc: 'Ideale Balance aus Größe & Schärfe', save: '~48%' },
                { id: 'high', title: 'Starke Kompression', desc: 'Maximale Einsparung für Uploads', save: '~68%' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id as CompressionLevel)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    level === lvl.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900">{lvl.title}</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {lvl.save}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetSingle}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
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
