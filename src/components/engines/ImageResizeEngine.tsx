'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, Lock, Unlock, Palette } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface ImageResizeEngineProps {
  isGrayscaleMode?: boolean;
}

export function ImageResizeEngine({ isGrayscaleMode = false }: ImageResizeEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigWidth(img.naturalWidth || img.width);
      setOrigHeight(img.naturalHeight || img.height);
      setTargetWidth(img.naturalWidth || img.width);
      setTargetHeight(img.naturalHeight || img.height);
    };
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockRatio && origWidth > 0) {
      const ratio = origHeight / origWidth;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockRatio && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const setScalePreset = (percent: number) => {
    if (origWidth === 0) return;
    const factor = percent / 100;
    setTargetWidth(Math.round(origWidth * factor));
    setTargetHeight(Math.round(origHeight * factor));
  };

  const executeProcess = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);
    setProgress(30);
    setStatusText(isGrayscaleMode ? 'In Graustufen umwandeln...' : 'Bildmaße werden neu berechnet...');

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      const w = isGrayscaleMode ? img.naturalWidth : targetWidth;
      const h = isGrayscaleMode ? img.naturalHeight : targetHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context nicht verfügbar');

      ctx.drawImage(img, 0, 0, w, h);

      // If grayscale mode, convert pixels using Rec. 709 luminance
      if (isGrayscaleMode) {
        setProgress(60);
        setStatusText('Luminanz-Filter wird berechnet...');
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Luminance formula
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setProgress(85);
      setStatusText('Bild wird exportiert...');

      let mimeType = 'image/jpeg';
      let ext = '.jpg';
      if (file.type === 'image/png' || /\.png$/i.test(file.name)) {
        mimeType = 'image/png';
        ext = '.png';
      } else if (file.type === 'image/webp' || /\.webp$/i.test(file.name)) {
        mimeType = 'image/webp';
        ext = '.webp';
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Export fehlgeschlagen'))),
          mimeType,
          0.92
        );
      });

      setResultBlob(blob);
      const prefix = isGrayscaleMode ? 'graustufen_' : 'skaliert_';
      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setOutputFilename(`coolwave_${prefix}${base}${ext}`);
      setProgress(100);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler bei der Bildverarbeitung.');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultBlob(null);
    setIsProcessing(false);
  };

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={resultBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel={isGrayscaleMode ? 'Schwarzweiß-Bild herunterladen' : 'Skaliertes Bild herunterladen'}
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
          maxFileSizeMB={500}
          onFilesSelected={handleFileSelected}
          title={isGrayscaleMode ? 'Bild für Schwarzweiß ablegen' : 'Bild zum Skalieren ablegen'}
          subtitle={
            isGrayscaleMode
              ? 'Wandeln Sie Farbbilder sofort in stilvolle Graustufen-Grafiken um (bis 500 MB, lokal im Browser)'
              : 'Passen Sie Breite und Höhe in Pixeln an oder skalieren Sie prozentual (bis 500 MB, lokal im Browser)'
          }
          isLocal={true}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            {previewUrl && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={previewUrl}
                  alt={`Bildvorschau von ${file.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatBytes(file.size)} • Originalmaße: {origWidth} × {origHeight} px
              </p>
            </div>
          </div>

          {!isGrayscaleMode && (
            <div className="py-6 space-y-4 max-w-lg">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Schnell-Skalierung
                </label>
                <div className="flex flex-wrap gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setScalePreset(pct)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-sky-500 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact pixel inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Breite (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Höhe (px)
                  </label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Aspect Ratio Lock */}
              <button
                type="button"
                onClick={() => setLockRatio(!lockRatio)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  lockRatio
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                {lockRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Seitenverhältnis sperren</span>
              </button>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Anderes Bild wählen
            </button>

            <button
              onClick={executeProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              {isGrayscaleMode ? <Palette className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isGrayscaleMode ? 'In Schwarzweiß umwandeln' : 'Bildgröße anpassen'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
