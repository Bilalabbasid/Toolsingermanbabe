'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { formatBytes } from '@/lib/utils';

type RotateMode = 'rotate' | 'flip';

interface ImageRotateFlipEngineProps {
  mode?: RotateMode;
}

export function ImageRotateFlipEngine({ mode = 'rotate' }: ImageRotateFlipEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0); // degrees: 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const rad = (rotation * Math.PI) / 180;
    const sw = rotation === 90 || rotation === 270 ? imgEl.naturalHeight : imgEl.naturalWidth;
    const sh = rotation === 90 || rotation === 270 ? imgEl.naturalWidth : imgEl.naturalHeight;
    const maxSide = 400;
    const scale = Math.min(maxSide / sw, maxSide / sh, 1);
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX * scale, scaleY * scale);
    ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2);
    ctx.restore();
  };

  useEffect(() => { drawPreview(); }, [imgEl, rotation, flipH, flipV]);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.src = url;
    img.onload = () => setImgEl(img);
  };

  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);
  const setRotationDeg = (deg: number) => setRotation(deg);

  const executeProcess = async () => {
    if (!imgEl || !file) return;
    setIsProcessing(true); setProgress(30); setStatusText('Bild wird transformiert...');
    try {
      const rad = (rotation * Math.PI) / 180;
      const sw = rotation === 90 || rotation === 270 ? imgEl.naturalHeight : imgEl.naturalWidth;
      const sh = rotation === 90 || rotation === 270 ? imgEl.naturalWidth : imgEl.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = sw; canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      ctx.save();
      ctx.translate(sw / 2, sh / 2);
      ctx.rotate(rad);
      const scaleX = flipH ? -1 : 1;
      const scaleY = flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);
      ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2);
      ctx.restore();
      setProgress(80); setStatusText('Exportiere...');
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92));
      if (!blob) throw new Error('Export fehler');
      setResultBlob(blob);
      const ext = mime === 'image/png' ? '.png' : '.jpg';
      const base = file.name.replace(/\.[^.]+$/, '');
      const suffix = mode === 'flip' ? 'gespiegelt' : 'gedreht';
      setOutputFilename('coolwave_' + suffix + '_' + base + ext);
      setProgress(100);
    } catch {
      alert('Fehler bei der Verarbeitung.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setImgEl(null); setResultBlob(null); setRotation(0); setFlipH(false); setFlipV(false); setIsProcessing(false); };

  if (resultBlob && file) {
    return (
      <DownloadBox filename={outputFilename} originalSizeBytes={file.size} resultSizeBytes={resultBlob.size}
        onDownload={() => { const url = URL.createObjectURL(resultBlob); const a = document.createElement('a'); a.href = url; a.download = outputFilename; a.click(); }}
        onReset={handleReset} downloadLabel="Bild herunterladen" />
    );
  }
  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  const sw = imgEl ? (rotation === 90 || rotation === 270 ? imgEl.naturalHeight : imgEl.naturalWidth) : 0;
  const sh = imgEl ? (rotation === 90 || rotation === 270 ? imgEl.naturalWidth : imgEl.naturalHeight) : 0;

  return (
    <div className="w-full">
      {!imgEl ? (
        <FileUploader acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']} maxFileSizeMB={50} onFilesSelected={handleFileSelected}
          title={mode === 'flip' ? 'Bild zum Spiegeln ablegen' : 'Bild zum Drehen ablegen'}
          subtitle={mode === 'flip' ? 'Horizontal oder vertikal spiegeln' : 'In 90-Grad-Schritten oder auf einen genauen Winkel drehen'} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col items-center gap-4">
            <canvas ref={canvasRef} className="rounded-xl border border-slate-200 bg-slate-50 max-w-full" style={{ maxHeight: '360px' }} />
            <div className="text-xs text-slate-500">Ausgangsgroesse: {file?.name} &mdash; {formatBytes(file!.size)} | Ergebnis: <strong className="text-slate-800 font-mono">{sw} x {sh} px</strong></div>
          </div>

          {/* Rotate controls */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Drehen</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={rotateLeft} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-sky-400 text-sm font-semibold text-slate-700 transition-colors">
                <RotateCcw className="w-4 h-4" /> 90° links
              </button>
              <button type="button" onClick={rotateRight} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-sky-400 text-sm font-semibold text-slate-700 transition-colors">
                <RotateCw className="w-4 h-4" /> 90° rechts
              </button>
              {[0, 90, 180, 270].map((deg) => (
                <button key={deg} type="button" onClick={() => setRotationDeg(deg)}
                  className={'px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ' + (rotation === deg ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-400')}>
                  {deg}deg
                </button>
              ))}
            </div>
          </div>

          {/* Flip controls */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Spiegeln</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFlipH((v) => !v)}
                className={'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ' + (flipH ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-700 hover:border-sky-400')}>
                <FlipHorizontal className="w-4 h-4" /> Horizontal
              </button>
              <button type="button" onClick={() => setFlipV((v) => !v)}
                className={'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ' + (flipV ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-700 hover:border-sky-400')}>
                <FlipVertical className="w-4 h-4" /> Vertikal
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">Anderes Bild</button>
            <button onClick={executeProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors">
              <RotateCw className="w-4 h-4" />
              {mode === 'flip' ? 'Bild spiegeln' : 'Bild drehen & herunterladen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
