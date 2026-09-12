'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  Sliders,
  CheckCircle,
  Download,
  AlertCircle
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

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

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setErrorMsg(null);
    if (targetFormat === 'PDF') {
      const combined = [...files, ...newFiles];
      setFiles(combined);
      const urls = combined.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
    } else {
      setFiles([newFiles[0]]);
      setPreviewUrls([URL.createObjectURL(newFiles[0])]);
    }
    trackEvent('upload_completed', { targetFormat, count: newFiles.length });
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

  /**
   * Determine whether the given operation can be handled 100% locally in browser canvas
   */
  const canProcessInBrowser = (file: File, target: ImageTargetFormat): boolean => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    
    // Formats requiring server-side specialized decoders or encoders
    if (ext === 'heic' || ext === 'heif' || ext === 'tiff' || ext === 'tif') return false;
    if (target === 'SVG' || target === 'ICO' || target === 'BMP' || target === 'TIFF' || target === 'GIF') return false;
    
    // Multi-image to PDF is supported in browser via pdf-lib
    if (target === 'PDF') return true;

    // Standard raster targets supported natively in modern HTML5 Canvas
    return target === 'PNG' || target === 'JPG' || target === 'WebP';
  };

  /**
   * Server-side conversion via worker queue (/api/v1/jobs)
   */
  const executeServerConversion = async (file: File) => {
    setStatusText('Bild wird an den Konvertierungs-Worker übergeben...');
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image_convert');
    formData.append('targetFormat', targetFormat.toLowerCase());
    formData.append(
      'options',
      JSON.stringify({
        targetFormat: targetFormat.toLowerCase(),
        quality: quality,
        backgroundColor: backgroundColor,
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
    setStatusText('Bild wird transformiert...');
    setProgress(40);

    // Poll worker status
    let pollCount = 0;
    while (pollCount < 60) {
      await new Promise((r) => setTimeout(r, 1200));
      pollCount++;

      const checkRes = await fetch(`/api/v1/jobs/${jobId}`);
      if (!checkRes.ok) continue;

      const pollData = await checkRes.json();
      if (pollData.progress) {
        setProgress(Math.max(40, pollData.progress));
      }

      if (pollData.status === 'completed' && pollData.output?.downloadUrl) {
        setStatusText('Download wird vorbereitet...');
        setProgress(100);

        // Fetch result blob for preview / download
        const fileRes = await fetch(pollData.output.downloadUrl);
        const blob = await fileRes.blob();
        setResultBlob(blob);
        setResultDownloadUrl(pollData.output.downloadUrl);
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setOutputFilename(`coolwave_${baseName}.${targetFormat.toLowerCase()}`);
        setIsProcessing(false);
        trackEvent('conversion_completed', { targetFormat, mode: 'server' });
        return;
      }

      if (pollData.status === 'failed') {
        throw new Error(pollData.error || 'Server-Konvertierung fehlgeschlagen.');
      }
    }

    throw new Error('Zeitüberschreitung bei der Server-Konvertierung.');
  };

  /**
   * Browser-side Canvas conversion
   */
  const executeBrowserConversion = async (file: File) => {
    setStatusText('Bild wird im Browser geladen...');
    setProgress(30);

    const img = new Image();
    const objectUrl = previewUrls[0] || URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Konnte Bild nicht im Browser dekodieren.'));
    });

    setStatusText('Bildformat wird transformiert...');
    setProgress(65);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D-Kontext nicht verfügbar');

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

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Konnte Bild-Blob nicht aus Canvas generieren.');
        }
        setResultBlob(blob);
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const ext = targetFormat.toLowerCase();
        setOutputFilename(`coolwave_${baseName}.${ext}`);
        setProgress(100);
        setIsProcessing(false);
        trackEvent('conversion_completed', { targetFormat, mode: 'browser' });
      },
      targetMime,
      q
    );
  };

  /**
   * Main conversion trigger
   */
  const executeConversion = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    setErrorMsg(null);
    setStatusText('Initialisierung...');
    trackEvent('conversion_started', { targetFormat, count: files.length });

    try {
      if (targetFormat === 'PDF') {
        // Multi-image to PDF conversion via pdf-lib
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
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }

        setProgress(90);
        setStatusText('PDF wird fertiggestellt...');

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

      const currentFile = files[0];

      // Check if browser-side processing is feasible
      if (canProcessInBrowser(currentFile, targetFormat)) {
        try {
          await executeBrowserConversion(currentFile);
          return;
        } catch (browserErr) {
          console.warn('Browser-Konvertierung fehlgeschlagen, wechsle zu Server-Worker:', browserErr);
          // Seamless fallback to server worker
          await executeServerConversion(currentFile);
        }
      } else {
        // Run directly in isolated server worker
        await executeServerConversion(currentFile);
      }
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Fehler bei der Konvertierung. Bitte überprüfen Sie die Datei.');
      trackEvent('conversion_failed', { targetFormat, error: err.message });
    }
  };

  const handleDownload = () => {
    if (resultDownloadUrl) {
      const a = document.createElement('a');
      a.href = resultDownloadUrl;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      trackEvent('download_completed', { targetFormat });
    } else if (resultBlob) {
      downloadBlob(resultBlob, outputFilename);
      trackEvent('download_completed', { targetFormat });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviewUrls([]);
    setResultBlob(null);
    setResultDownloadUrl(null);
    setProgress(0);
    setIsProcessing(false);
    setErrorMsg(null);
  };

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {files.length === 0 && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          allowMultiple={targetFormat === 'PDF'}
          maxFileSizeMB={50}
          acceptedExtensions={sourceExtensions}
          title={targetFormat === 'PDF' ? 'Bilder hier ablegen (Mehrfachauswahl möglich)' : 'Bild hier ablegen'}
          subtitle={`Unterstützt: ${sourceExtensions.join(', ').toUpperCase()}`}
        />
      )}

      {files.length > 0 && !resultBlob && !isProcessing && (
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
              onClick={handleReset}
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
                  alt="Vorschau"
                  className="max-h-48 max-w-full object-contain rounded shadow-xs"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                {/* Quality Slider for lossy formats */}
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
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Kleinere Datei (40%)</span>
                      <span>Beste Qualität (100%)</span>
                    </div>
                  </div>
                )}

                {/* Background color toggle for formats that don't support alpha transparency (JPG, BMP) */}
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
                        <span className="w-3 h-3 rounded-full bg-black" />
                        Schwarz
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    {canProcessInBrowser(files[0], targetFormat)
                      ? '100% datenschutzkonform direkt in Ihrem Browser transformiert.'
                      : 'High-Performance Konvertierung über die sichere CoolWave Engine.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Multi-image preview grid for PDF compilation */}
          {targetFormat === 'PDF' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Reihenfolge der PDF-Seiten:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                {files.map((f, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="relative aspect-square mb-2 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                      <img src={previewUrls[idx]} alt={f.name} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-800 truncate block mb-2">{f.name}</span>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveFile(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-600"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveFile(idx, 'right')}
                          disabled={idx === files.length - 1}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-600"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={executeConversion}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              In {targetFormat} umwandeln
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-6">
          <ProcessingStatus
            progress={progress}
            statusText={statusText}
          />
        </div>
      )}

      {resultBlob && (
        <div className="mt-6">
          <DownloadBox
            filename={outputFilename}
            resultSizeBytes={resultBlob.size}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
