'use client';

import React, { useState, useEffect } from 'react';
import { Shrink, Image as ImageIcon, Sparkles } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function ImageCompressEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    trackEvent('upload_completed', { toolSlug: 'bild-komprimieren', size: f.size });
  };

  const executeCompress = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);
    setProgress(30);
    setStatusText('Bilddaten werden komprimiert...');
    trackEvent('conversion_started', { toolSlug: 'bild-komprimieren', quality });

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas nicht verfügbar');

      // Preserve white background for transparent PNG if compressing to JPG
      if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      setProgress(75);
      setStatusText('Optimiertes Bild wird erzeugt...');

      const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const compressionFactor = quality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Komprimierung fehlgeschlagen');
          setCompressedBlob(blob);
          setOutputFilename(`coolwave_komprimiert_${file.name}`);
          setProgress(100);
          setIsProcessing(false);
          trackEvent('conversion_completed', { toolSlug: 'bild-komprimieren' });
        },
        targetMime,
        compressionFactor
      );
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler bei der Bildkomprimierung.');
      trackEvent('conversion_failed', { toolSlug: 'bild-komprimieren' });
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    downloadBlob(compressedBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'bild-komprimieren' });
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setIsProcessing(false);
  };

  if (compressedBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={compressedBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="Komprimiertes Bild herunterladen"
      />
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
          maxFileSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Bild zum Komprimieren ablegen"
          subtitle="Reduzieren Sie die Dateigröße von JPG, PNG und WebP ohne sichtbaren Qualitätsverlust"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            {previewUrl && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={previewUrl}
                  alt="Vorschau"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aktuelle Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(file.size)}</span>
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
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Anderes Bild wählen
            </button>

            <button
              onClick={executeCompress}
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
