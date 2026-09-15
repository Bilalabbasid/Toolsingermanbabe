'use client';

import React, { useState, useRef } from 'react';
import { Shrink, Image as ImageIcon, Sparkles, Layers, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import { getClientSubscription } from '@/lib/monetization/subscription';

export function ImageCompressEngine() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = getClientSubscription().isPro;
  const limits = getBatchLimits(isPro);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      // Single-file workflow
      const f = files[0];
      setSingleFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setIsBatchMode(false);
      trackEvent('upload_completed', { toolSlug: 'bild-komprimieren', size: f.size });
    } else {
      // Batch mode
      const validation = validateBatchFiles(files, isPro);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `batch_img_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { toolSlug: 'bild-komprimieren', count: files.length });
    }
  };

  /**
   * Helper to compress an individual image via HTML5 Canvas
   */
  const compressSingleImage = async (
    file: File,
    qualityLevel: number,
    onProgress?: (pct: number, text?: string) => void
  ): Promise<{ blob: Blob; fileName: string }> => {
    onProgress?.(25, 'Bild wird dekodiert...');

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      onProgress?.(60, 'Optimierung & Kompression...');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D-Kontext nicht verfügbar');

      const isJpg = file.type === 'image/jpeg' || /\.(jpg|jpeg)$/i.test(file.name);
      if (isJpg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      onProgress?.(85, 'Blob wird generiert...');
      let targetMime = 'image/jpeg';
      let ext = '.jpg';
      if (file.type === 'image/png' || /\.png$/i.test(file.name)) {
        targetMime = 'image/png';
        ext = '.png';
        // Genuine PNG optimization: Palette reduction & quantization for DEFLATE compression efficiency
        if (qualityLevel < 95) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const step = Math.max(2, Math.round((100 - qualityLevel) / 3));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.round(data[i] / step) * step);
            data[i + 1] = Math.min(255, Math.round(data[i + 1] / step) * step);
            data[i + 2] = Math.min(255, Math.round(data[i + 2] / step) * step);
            if (data[i + 3] > 15) {
              data[i + 3] = Math.min(255, Math.round(data[i + 3] / step) * step);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      } else if (file.type === 'image/webp' || /\.webp$/i.test(file.name)) {
        targetMime = 'image/webp';
        ext = '.webp';
      }
      const compressionFactor = qualityLevel / 100;
      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      const blob = await new Promise<Blob>((res, rej) => {
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error('Kompression fehlgeschlagen'))),
          targetMime,
          compressionFactor
        );
      });

      onProgress?.(100, 'Fertig');
      return {
        blob,
        fileName: `coolwave_komprimiert_${base}${ext}`,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  // Single-file execution
  const executeSingleCompress = async () => {
    if (!singleFile) return;
    setIsProcessing(true);
    setProgress(30);
    setStatusText('Bilddaten werden komprimiert...');
    trackEvent('conversion_started', { toolSlug: 'bild-komprimieren', quality });

    try {
      const result = await compressSingleImage(singleFile, quality, (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });
      setCompressedBlob(result.blob);
      setOutputFilename(result.fileName);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'bild-komprimieren' });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler bei der Bildkomprimierung.');
      trackEvent('conversion_failed', { toolSlug: 'bild-komprimieren' });
    }
  };

  // Batch execution
  const startBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const tasks = batchItems.map((item) => ({
      id: item.id,
      run: async (signal?: AbortSignal) => {
        if (signal?.aborted) throw new Error('Abgebrochen');
        return await compressSingleImage(item.file, quality, (pct, statusText) => {
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
                  outputSize: result.blob.size,
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
      downloadBlob(zipBlob, `coolwave_bilder_komprimiert_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSingleFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setIsProcessing(false);
  };

  // Single-file completed view
  if (compressedBlob && singleFile) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={singleFile.size}
        resultSizeBytes={compressedBlob.size}
        onDownload={() => downloadBlob(compressedBlob, outputFilename)}
        onReset={handleResetSingle}
        downloadLabel="Komprimiertes Bild herunterladen"
      />
    );
  }

  // Single-file in-progress view
  if (isProcessing && !isBatchMode) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Batch Queue View */}
      {isBatchMode && batchItems.length > 0 ? (
        <div className="space-y-6">
          {/* Quality Slider for Batch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                Kompressionsstufe für alle Bilder
              </label>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {quality}% Qualität
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={quality}
              disabled={isProcessing}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full accent-sky-600 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Maximale Einsparung (10%)</span>
              <span className="font-semibold text-sky-600">Empfohlen: 80%</span>
              <span>Beste visuelle Schärfe (95%)</span>
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
            toolTitle="Bilder-Stapelkomprimierung"
          />
        </div>
      ) : !singleFile ? (
        /* Empty Uploader State */
        <FileUploader
          acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
          maxFileSizeMB={limits.maxFileSizeMB}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="Bilder hier ablegen (Einzel- oder Stapelmodus)"
          subtitle={`Reduzieren Sie JPG, PNG & WebP Dateigrößen • Bis zu ${limits.maxBatchFiles} Bilder gleichzeitig (${isPro ? 'Pro' : 'Kostenlos'})`}
        />
      ) : (
        /* Single File View (Preserved) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            {previewUrl && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                <img src={previewUrl} alt={`Komprimierungsvorschau von ${singleFile.name}`} className="w-full h-full object-contain" />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {singleFile.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aktuelle Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span>
              </p>
            </div>
          </div>

          <div className="py-6 max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Qualitätsstufe
              </label>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                {quality}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full accent-sky-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Kleinste Datei (10%)</span>
              <span className="font-semibold text-sky-600">Empfohlen: 80%</span>
              <span>Beste Qualität (95%)</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetSingle}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Anderes Bild wählen
            </button>

            <button
              onClick={executeSingleCompress}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <Shrink className="w-4 h-4" />
              <span>Bild jetzt verkleinern</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
