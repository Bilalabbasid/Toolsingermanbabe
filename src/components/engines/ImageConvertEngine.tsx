'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  Sliders,
  CheckCircle,
  Download,
  AlertCircle,
  Layers
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';

export type ImageTargetFormat =
  | 'PNG'
  | 'JPG'
  | 'WebP'
  | 'GIF'
  | 'SVG'
  | 'BMP'
  | 'TIFF'
  | 'ICO'
  | 'AVIF'
  | 'PDF';

interface ImageConvertEngineProps {
  targetFormat: ImageTargetFormat;
  sourceExtensions: string[];
}

export function ImageConvertEngine({ targetFormat, sourceExtensions }: ImageConvertEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultDownloadUrl, setResultDownloadUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [quality, setQuality] = useState<number>(90);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = typeof window !== 'undefined' && localStorage.getItem('coolwave_pro_active') === 'true';
  const limits = getBatchLimits(isPro);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setErrorMsg(null);

    if (targetFormat === 'PDF') {
      const combined = [...files, ...newFiles];
      setFiles(combined);
      const urls = combined.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
      trackEvent('upload_completed', { targetFormat, count: newFiles.length });
      return;
    }

    if (newFiles.length === 1 && files.length === 0 && batchItems.length === 0) {
      // Single file workflow
      setFiles([newFiles[0]]);
      setPreviewUrls([URL.createObjectURL(newFiles[0])]);
      setBatchItems([]);
      trackEvent('upload_completed', { targetFormat, count: 1 });
    } else {
      // Batch workflow
      const combined = [...files, ...newFiles];
      const validation = validateBatchFiles(combined, isPro);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setFiles(combined);
      const newItems: BatchItem[] = combined.map((f, idx) => ({
        id: `img_batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { targetFormat, count: combined.length });
    }
  };

  const moveFile = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updatedFiles = [...files];
    const tempFile = updatedFiles[index];
    updatedFiles[index] = updatedFiles[targetIdx];
    updatedFiles[targetIdx] = tempFile;

    const updatedUrls = [...previewUrls];
    const tempUrl = updatedUrls[index];
    updatedUrls[index] = updatedUrls[targetIdx];
    updatedUrls[targetIdx] = tempUrl;

    setFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
  };

  const canProcessInBrowser = (file: File, target: ImageTargetFormat): boolean => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'heic' || ext === 'heif' || ext === 'tiff' || ext === 'tif') return false;
    if (target === 'SVG' || target === 'ICO' || target === 'BMP' || target === 'TIFF' || target === 'GIF') return false;
    if (target === 'PDF') return true;
    return target === 'PNG' || target === 'JPG' || target === 'WebP';
  };

  /**
   * Universal single-file processor (Client Canvas OR Server Worker)
   */
  const convertSingleFile = async (
    file: File,
    onProgress?: (pct: number, msg?: string) => void
  ): Promise<{ blob: Blob; fileName: string; size: number }> => {
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const ext = targetFormat.toLowerCase();
    const outName = `coolwave_${baseName}.${ext}`;

    if (canProcessInBrowser(file, targetFormat)) {
      onProgress?.(30, 'Bild wird im Browser transformiert...');
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.src = objectUrl;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D nicht verfügbar');

        if (targetFormat === 'JPG') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const mimeMap: Record<string, string> = {
          PNG: 'image/png',
          JPG: 'image/jpeg',
          WebP: 'image/webp',
        };
        const targetMime = mimeMap[targetFormat] || 'image/png';
        const q = targetFormat === 'PNG' ? undefined : quality / 100;

        onProgress?.(70, 'Blob wird erzeugt...');
        const blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error('Konnte Bild nicht konvertieren'))),
            targetMime,
            q
          );
        });

        onProgress?.(100, 'Fertig');
        return { blob, fileName: outName, size: blob.size };
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } else {
      // Server-side worker processing
      onProgress?.(20, 'Übertragung an Worker...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image_convert');
      formData.append('targetFormat', targetFormat.toLowerCase());
      formData.append(
        'options',
        JSON.stringify({
          targetFormat: targetFormat.toLowerCase(),
          quality,
          backgroundColor,
        })
      );

      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server-Fehler: ${res.statusText}`);
      }

      const jobData = await res.json();
      const jobId = jobData.jobId;

      let pollCount = 0;
      while (pollCount < 60) {
        await new Promise((r) => setTimeout(r, 1200));
        pollCount++;

        const checkRes = await fetch(`/api/v1/jobs/${jobId}`);
        if (!checkRes.ok) continue;

        const pollData = await checkRes.json();
        if (pollData.progress) {
          onProgress?.(Math.max(30, pollData.progress), 'Server verarbeitet...');
        }

        if (pollData.status === 'completed' && pollData.output?.downloadUrl) {
          const downloadRes = await fetch(pollData.output.downloadUrl);
          const blob = await downloadRes.blob();
          onProgress?.(100, 'Fertig');
          return { blob, fileName: pollData.output.fileName || outName, size: blob.size };
        }

        if (pollData.status === 'failed') {
          throw new Error(pollData.error || 'Server-Konvertierung fehlgeschlagen');
        }
      }

      throw new Error('Zeitüberschreitung bei der Serververarbeitung');
    }
  };

  // Single-file execute
  const executeSingleConversion = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(15);
    setErrorMsg(null);
    setStatusText('Initialisierung...');

    try {
      if (targetFormat === 'PDF') {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          const pct = 15 + Math.round(((i + 1) / files.length) * 70);
          setProgress(pct);
          setStatusText(`Bild ${i + 1} von ${files.length} wird eingebettet...`);

          const arrayBuffer = await currentFile.arrayBuffer();
          let embeddedImage;
          if (currentFile.type === 'image/png' || currentFile.name.toLowerCase().endsWith('.png')) {
            embeddedImage = await pdf.embedPng(arrayBuffer);
          } else {
            embeddedImage = await pdf.embedJpg(arrayBuffer);
          }

          const { width, height } = embeddedImage.scale(1);
          const page = pdf.addPage([width, height]);
          page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
        }

        setProgress(90);
        setStatusText('PDF wird finalisiert...');
        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        setResultBlob(blob);

        const base = files[0].name.substring(0, files[0].name.lastIndexOf('.')) || 'bilder';
        setOutputFilename(files.length === 1 ? `coolwave_${base}.pdf` : `coolwave_${base}_kombiniert.pdf`);
        setProgress(100);
        setIsProcessing(false);
        trackEvent('conversion_completed', { targetFormat });
        return;
      }

      const result = await convertSingleFile(files[0], (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });

      setResultBlob(result.blob);
      setOutputFilename(result.fileName);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { targetFormat, mode: 'browser' });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Fehler bei der Konvertierung.');
      trackEvent('conversion_failed', { targetFormat, error: err.message });
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
        return await convertSingleFile(item.file, (pct, statusText) => {
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
                  outputSize: result.size,
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
    setFiles([]);
    setPreviewUrls([]);
    setBatchItems([]);
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
      downloadBlob(zipBlob, `coolwave_${targetFormat.toLowerCase()}_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setFiles([]);
    setPreviewUrls([]);
    setResultBlob(null);
    setResultDownloadUrl(null);
    setProgress(0);
    setIsProcessing(false);
    setErrorMsg(null);
  };

  const isBatchView = batchItems.length > 1 && targetFormat !== 'PDF';

  return (
    <div className="w-full space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Batch Mode View */}
      {isBatchView ? (
        <div className="space-y-6">
          {/* Format Settings for Batch */}
          {(targetFormat === 'JPG' || targetFormat === 'WebP' || targetFormat === 'AVIF') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  Qualitätsstufe für alle Bilder:
                </span>
                <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                disabled={isProcessing}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer disabled:opacity-50"
              />
            </div>
          )}

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
            toolTitle={`Bilder nach ${targetFormat} umwandeln (Stapel)`}
          />
        </div>
      ) : files.length === 0 ? (
        /* Empty Uploader State */
        <FileUploader
          onFilesSelected={handleFilesSelected}
          allowMultiple={true}
          maxFileSizeMB={limits.maxFileSizeMB}
          acceptedExtensions={sourceExtensions}
          title={targetFormat === 'PDF' ? 'Bilder hier ablegen (Mehrfachauswahl möglich)' : 'Bilder hier ablegen (Einzel- oder Stapelverarbeitung)'}
          subtitle={`Unterstützt: ${sourceExtensions.join(', ').toUpperCase()} • Bis zu ${limits.maxBatchFiles} Dateien (${isPro ? 'Pro' : 'Kostenlos'})`}
        />
      ) : resultBlob ? (
        /* Single File Completed State */
        <DownloadBox
          filename={outputFilename}
          originalSizeBytes={files[0].size}
          resultSizeBytes={resultBlob.size}
          onDownload={() => downloadBlob(resultBlob, outputFilename)}
          onReset={handleResetSingle}
          downloadLabel={`Konvertiertes ${targetFormat} herunterladen`}
        />
      ) : isProcessing ? (
        /* Single File Processing State */
        <ProcessingStatus progress={progress} statusText={statusText} />
      ) : (
        /* Single File Options & Preview State (Preserved) */
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {files.length === 1 ? files[0].name : `${files.length} Bilder ausgewählt`}
                </h3>
                <p className="text-xs text-slate-500">
                  Größe: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))} • Zielformat: <span className="font-semibold text-sky-600">{targetFormat}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleResetSingle}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer"
            >
              Neu starten
            </button>
          </div>

          {/* Single image preview & options */}
          {files.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center">
                <img
                  src={previewUrls[0]}
                  alt={`Vorschau von ${files[0].name}`}
                  className="max-h-48 max-w-full object-contain rounded shadow-xs"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                {(targetFormat === 'JPG' || targetFormat === 'WebP' || targetFormat === 'AVIF') && (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-sky-600" />
                        Bildqualität / Kompression:
                      </span>
                      <span className="text-sky-600 font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                )}

                {(targetFormat === 'JPG' || targetFormat === 'BMP') && (
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Hintergrundfarbe (für transparente Bereiche):
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setBackgroundColor('#ffffff')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                          backgroundColor === '#ffffff'
                            ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                        Weiß
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackgroundColor('#000000')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                          backgroundColor === '#000000'
                            ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-black border border-slate-700" />
                        Schwarz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-image to PDF preview gallery */}
          {targetFormat === 'PDF' && files.length > 1 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Seitenreihenfolge im PDF (Bilder neu anordnen):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center">
                    <span className="absolute top-1 left-1 bg-slate-800 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                      {idx + 1}
                    </span>
                    <img src={previewUrls[idx]} alt={`Miniaturansicht Seite ${idx + 1}: ${file.name}`} className="w-full h-20 object-contain rounded mb-2" />
                    <span className="text-[10px] text-slate-600 truncate w-full text-center">{file.name}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <button type="button" onClick={() => moveFile(idx, 'left')} disabled={idx === 0} className="p-1 rounded bg-white shadow-xs hover:bg-slate-100 disabled:opacity-30">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => moveFile(idx, 'right')} disabled={idx === files.length - 1} className="p-1 rounded bg-white shadow-xs hover:bg-slate-100 disabled:opacity-30">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded bg-white text-red-500 shadow-xs hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={executeSingleConversion}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{targetFormat === 'PDF' ? 'PDF jetzt zusammenfügen' : 'Jetzt umwandeln'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
