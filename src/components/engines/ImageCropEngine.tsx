'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Crop, RotateCcw } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PRESETS: { label: string; ratio: number | null }[] = [
  { label: 'Frei', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '9:16', ratio: 9 / 16 },
];

interface ImageCropEngineProps {
  circleMode?: boolean;
}

export function ImageCropEngine({ circleMode = false }: ImageCropEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [selectedPreset, setSelectedPreset] = useState<string>(circleMode ? '1:1' : 'Frei');
  const [lockedRatio, setLockedRatio] = useState<number | null>(circleMode ? 1 : null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'create' | 'move' | 'resize-br'>('create');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropSnap: { x: 0, y: 0, w: 0, h: 0 } });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const container = containerRef.current;
    if (!container) return;
    const maxW = container.clientWidth;
    const maxH = Math.min(480, window.innerHeight * 0.55);
    const scale = Math.min(maxW / imgEl.naturalWidth, maxH / imgEl.naturalHeight, 1);
    const dW = Math.round(imgEl.naturalWidth * scale);
    const dH = Math.round(imgEl.naturalHeight * scale);
    canvas.width = dW;
    canvas.height = dH;
    const ctx = canvas.getContext('2d')!;
    const cs = 12;
    for (let cy = 0; cy < dH; cy += cs) {
      for (let cx = 0; cx < dW; cx += cs) {
        ctx.fillStyle = (Math.floor(cx / cs) + Math.floor(cy / cs)) % 2 === 0 ? '#e2e8f0' : '#f8fafc';
        ctx.fillRect(cx, cy, cs, cs);
      }
    }
    ctx.drawImage(imgEl, 0, 0, dW, dH);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    const rx = crop.x * dW, ry = crop.y * dH, rw = crop.w * dW, rh = crop.h * dH;
    ctx.fillRect(0, 0, dW, ry);
    ctx.fillRect(0, ry + rh, dW, dH - ry - rh);
    ctx.fillRect(0, ry, rx, rh);
    ctx.fillRect(rx + rw, ry, dW - rx - rw, rh);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    if (circleMode) {
      ctx.beginPath();
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.5;
      [1, 2].forEach((n) => {
        ctx.beginPath(); ctx.moveTo(rx + (rw * n) / 3, ry); ctx.lineTo(rx + (rw * n) / 3, ry + rh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, ry + (rh * n) / 3); ctx.lineTo(rx + rw, ry + (rh * n) / 3); ctx.stroke();
      });
    }
    const hSize = 8;
    ctx.fillStyle = '#38bdf8';
    [[rx, ry], [rx + rw - hSize, ry], [rx, ry + rh - hSize], [rx + rw - hSize, ry + rh - hSize]].forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, hSize, hSize);
    });
  }, [imgEl, crop, circleMode]);

  useEffect(() => { drawPreview(); }, [drawPreview]);

  const getRelPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { rx: (e.clientX - rect.left) / canvas.width, ry: (e.clientY - rect.top) / canvas.height };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgEl) return;
    const { rx, ry } = getRelPos(e);
    const { x, y, w, h } = crop;
    const near = 0.03;
    if (Math.abs(rx - (x + w)) < near && Math.abs(ry - (y + h)) < near) {
      setDragMode('resize-br');
    } else if (rx >= x && rx <= x + w && ry >= y && ry <= y + h) {
      setDragMode('move');
    } else {
      setDragMode('create');
    }
    setDragStart({ x: rx, y: ry, cropSnap: { ...crop } });
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const { rx, ry } = getRelPos(e);
    const dx = rx - dragStart.x, dy = ry - dragStart.y;
    if (dragMode === 'create') {
      const nx = Math.min(dragStart.x, rx), ny = Math.min(dragStart.y, ry);
      let nw = Math.abs(rx - dragStart.x), nh = Math.abs(ry - dragStart.y);
      if (lockedRatio) { if (nw / nh > lockedRatio) { nh = nw / lockedRatio; } else { nw = nh * lockedRatio; } }
      nw = Math.min(nw, 1 - nx); nh = Math.min(nh, 1 - ny);
      setCrop({ x: Math.max(0, nx), y: Math.max(0, ny), w: Math.max(0.01, nw), h: Math.max(0.01, nh) });
    } else if (dragMode === 'move') {
      const nx = Math.max(0, Math.min(dragStart.cropSnap.x + dx, 1 - dragStart.cropSnap.w));
      const ny = Math.max(0, Math.min(dragStart.cropSnap.y + dy, 1 - dragStart.cropSnap.h));
      setCrop({ ...dragStart.cropSnap, x: nx, y: ny });
    } else if (dragMode === 'resize-br') {
      const nw = dragStart.cropSnap.w + dx;
      let nh = dragStart.cropSnap.h + dy;
      if (lockedRatio) { nh = nw / lockedRatio; }
      setCrop({ ...dragStart.cropSnap, w: Math.max(0.02, Math.min(nw, 1 - dragStart.cropSnap.x)), h: Math.max(0.02, Math.min(nh, 1 - dragStart.cropSnap.y)) });
    }
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setNaturalW(img.naturalWidth); setNaturalH(img.naturalHeight); setImgEl(img);
      if (circleMode) {
        const minSide = Math.min(img.naturalWidth, img.naturalHeight);
        setCrop({ x: (img.naturalWidth - minSide) / 2 / img.naturalWidth, y: (img.naturalHeight - minSide) / 2 / img.naturalHeight, w: minSide / img.naturalWidth, h: minSide / img.naturalHeight });
      } else { setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }); }
    };
  };

  const applyPreset = (preset: { label: string; ratio: number | null }) => {
    setSelectedPreset(preset.label); setLockedRatio(preset.ratio);
    if (preset.ratio && naturalW && naturalH) {
      let nw = 0.8, nh = nw / preset.ratio;
      if (nh > 0.8) { nh = 0.8; nw = nh * preset.ratio; }
      setCrop({ x: 0.5 - nw / 2, y: 0.5 - nh / 2, w: nw, h: nh });
    }
  };

  const executeCrop = async () => {
    if (!imgEl || !file) return;
    setIsProcessing(true); setProgress(30); setStatusText('Bild wird zugeschnitten...');
    try {
      const canvas = document.createElement('canvas');
      const cX = Math.round(crop.x * naturalW), cY = Math.round(crop.y * naturalH);
      const cW = Math.round(crop.w * naturalW), cH = Math.round(crop.h * naturalH);
      canvas.width = cW; canvas.height = cH;
      const ctx = canvas.getContext('2d')!;
      if (circleMode) { ctx.beginPath(); ctx.ellipse(cW / 2, cH / 2, cW / 2, cH / 2, 0, 0, 2 * Math.PI); ctx.clip(); }
      ctx.drawImage(imgEl, cX, cY, cW, cH, 0, 0, cW, cH);
      setProgress(80); setStatusText('Exportiere...');
      const mime = (circleMode || file.type === 'image/png') ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92));
      if (!blob) throw new Error('Export fehler');
      setResultBlob(blob);
      const ext = mime === 'image/png' ? '.png' : '.jpg';
      const base = file.name.replace(/\.[^.]+$/, '');
      setOutputFilename('coolwave_' + (circleMode ? 'kreis_' : 'zugeschnitten_') + base + ext);
      setProgress(100);
    } catch {
      alert('Fehler beim Zuschneiden.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setImgEl(null); setResultBlob(null); setIsProcessing(false); };
  const cropPxW = Math.round(crop.w * naturalW);
  const cropPxH = Math.round(crop.h * naturalH);

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename} originalSizeBytes={file.size} resultSizeBytes={resultBlob.size}
        onDownload={() => { const url = URL.createObjectURL(resultBlob); const a = document.createElement('a'); a.href = url; a.download = outputFilename; a.click(); }}
        onReset={handleReset} downloadLabel={circleMode ? 'Kreis-Bild herunterladen' : 'Zugeschnittenes Bild herunterladen'}
      />
    );
  }
  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  return (
    <div className="w-full">
      {!imgEl ? (
        <FileUploader acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']} maxFileSizeMB={500} onFilesSelected={handleFileSelected}
          title={circleMode ? 'Bild fuer kreisfoermigen Zuschnitt ablegen' : 'Bild zum Zuschneiden ablegen'}
          subtitle={circleMode ? 'Fuer Profilbilder: Bild auf einen Kreis zuschneiden (bis 500 MB, lokal im Browser)' : 'Definieren Sie den Ausschnitt per Drag-and-Drop (bis 500 MB, lokal im Browser)'}
          isLocal={true} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          {!circleMode && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Seitenverhaeltnis</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)}
                    className={'px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ' + (selectedPreset === p.label ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-400')}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <canvas ref={canvasRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
              className="block w-full cursor-crosshair touch-none" style={{ maxHeight: '480px', objectFit: 'contain' }} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Original: <strong className="text-slate-800 font-mono">{naturalW} x {naturalH} px</strong></span>
            <span>Ausschnitt: <strong className="text-sky-700 font-mono">{cropPxW} x {cropPxH} px</strong></span>
            <span className="text-[11px]">({formatBytes(file!.size)})</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Anderes Bild
            </button>
            <button onClick={executeCrop} disabled={cropPxW < 2 || cropPxH < 2}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors">
              <Crop className="w-4 h-4" />
              {circleMode ? 'Kreisfoermig zuschneiden' : 'Bild zuschneiden'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
