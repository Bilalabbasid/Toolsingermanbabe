'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { formatBytes } from '@/lib/utils';

type EffectMode = 'sharpen' | 'blur' | 'brightness' | 'grayscale';

interface ImageEffectsEngineProps {
  mode?: EffectMode;
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  const k = amount / 10; // 0-1
  const kernel = [-k, -k, -k, -k, 1 + 8 * k, -k, -k, -k, -k];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4;
          const kv = kernel[(ky + 1) * 3 + (kx + 1)];
          r += src[i] * kv; g += src[i + 1] * kv; b += src[i + 2] * kv;
        }
      }
      out[idx] = Math.min(255, Math.max(0, r));
      out[idx + 1] = Math.min(255, Math.max(0, g));
      out[idx + 2] = Math.min(255, Math.max(0, b));
      out[idx + 3] = src[idx + 3];
    }
  }
  // Copy edges
  for (let x = 0; x < w; x++) { for (let c = 0; c < 4; c++) { out[x * 4 + c] = src[x * 4 + c]; out[((h - 1) * w + x) * 4 + c] = src[((h - 1) * w + x) * 4 + c]; } }
  for (let y = 0; y < h; y++) { for (let c = 0; c < 4; c++) { out[(y * w) * 4 + c] = src[(y * w) * 4 + c]; out[(y * w + w - 1) * 4 + c] = src[(y * w + w - 1) * 4 + c]; } }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}

function applyGaussianBlur(ctx: CanvasRenderingContext2D, w: number, h: number, radius: number) {
  // CSS filter-based blur for speed (accurate enough for preview/export)
  ctx.filter = 'blur(' + Math.max(1, Math.round(radius)) + 'px)';
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = w; tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(tmpCanvas, 0, 0);
}

function applyGrayscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function ImageEffectsEngine({ mode = 'sharpen' }: ImageEffectsEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [amount, setAmount] = useState(mode === 'blur' ? 3 : mode === 'brightness' ? 50 : 5);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const drawPreview = () => {
    const canvas = previewRef.current;
    if (!canvas || !imgEl) return;
    const maxS = 400;
    const scale = Math.min(maxS / imgEl.naturalWidth, maxS / imgEl.naturalHeight, 1);
    canvas.width = Math.round(imgEl.naturalWidth * scale);
    canvas.height = Math.round(imgEl.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    if (mode === 'brightness') {
      ctx.filter = 'brightness(' + brightness + '%) contrast(' + contrast + '%)';
    } else { ctx.filter = 'none'; }
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    if (mode === 'sharpen') applySharpen(ctx, canvas.width, canvas.height, amount);
    else if (mode === 'blur') applyGaussianBlur(ctx, canvas.width, canvas.height, amount * scale);
    else if (mode === 'grayscale') applyGrayscale(ctx, canvas.width, canvas.height);
  };

  useEffect(() => { drawPreview(); }, [imgEl, amount, brightness, contrast]);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0]; setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image(); img.src = url;
    img.onload = () => setImgEl(img);
  };

  const executeProcess = async () => {
    if (!imgEl || !file) return;
    setIsProcessing(true); setProgress(30);
    const labels: Record<string, string> = { sharpen: 'Schaerfe wird angewendet...', blur: 'Weichzeichner wird angewendet...', brightness: 'Helligkeit wird angepasst...', grayscale: 'Schwarzweiss-Filter wird angewendet...' };
    setStatusText(labels[mode] || 'Verarbeitung...');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth; canvas.height = imgEl.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      if (mode === 'brightness') { ctx.filter = 'brightness(' + brightness + '%) contrast(' + contrast + '%)'; }
      ctx.drawImage(imgEl, 0, 0);
      ctx.filter = 'none';
      if (mode === 'sharpen') applySharpen(ctx, canvas.width, canvas.height, amount);
      else if (mode === 'blur') applyGaussianBlur(ctx, canvas.width, canvas.height, amount);
      else if (mode === 'grayscale') applyGrayscale(ctx, canvas.width, canvas.height);
      setProgress(80); setStatusText('Exportiere...');
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Export fehler');
        setResultBlob(blob);
        const ext = mime === 'image/png' ? '.png' : '.jpg';
        const base = file.name.replace(/\.[^.]+$/, '');
        const suffixMap: Record<string, string> = { sharpen: 'schaerfer', blur: 'weich', brightness: 'angepasst', grayscale: 'sw' };
        setOutputFilename('coolwave_' + (suffixMap[mode] || mode) + '_' + base + ext);
        setProgress(100); setIsProcessing(false);
      }, mime, 0.93);
    } catch { setIsProcessing(false); alert('Fehler bei der Verarbeitung.'); }
  };

  const handleReset = () => { setFile(null); setImgEl(null); setResultBlob(null); setIsProcessing(false); };

  const titles: Record<string, string> = { sharpen: 'Bild schaerfen', blur: 'Bild weichzeichnen', brightness: 'Helligkeit & Kontrast', grayscale: 'Schwarzweiss umwandeln' };
  const subtitles: Record<string, string> = { sharpen: 'Kantenschaerfe mit konvolutionsbasiertem Schaerfe-Filter erhoehen', blur: 'Gaussschen Weichzeichner auf ein Bild anwenden', brightness: 'Helligkeit und Kontrast des Bildes anpassen', grayscale: 'Farbbilder in klassische Graustufen umwandeln' };

  if (resultBlob && file) {
    return (
      <DownloadBox filename={outputFilename} originalSizeBytes={file.size} resultSizeBytes={resultBlob.size}
        onDownload={() => { const url = URL.createObjectURL(resultBlob); const a = document.createElement('a'); a.href = url; a.download = outputFilename; a.click(); }}
        onReset={handleReset} downloadLabel="Bearbeitetes Bild herunterladen" />
    );
  }
  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  return (
    <div className="w-full">
      {!imgEl ? (
        <FileUploader acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.bmp']} maxFileSizeMB={50} onFilesSelected={handleFileSelected}
          title={titles[mode] || 'Bild bearbeiten'} subtitle={subtitles[mode] || ''} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center">
            <canvas ref={previewRef} className="rounded-xl border border-slate-200 bg-slate-50 max-w-full" style={{ maxHeight: '360px' }} />
            <p className="text-xs text-slate-400 mt-2">{file?.name} &mdash; {formatBytes(file!.size)}</p>
          </div>

          {mode === 'sharpen' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Schaerfe</label>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{amount}/10</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full accent-sky-600 cursor-pointer" />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1"><span>Weich</span><span>Stark geschaerft</span></div>
            </div>
          )}
          {mode === 'blur' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Weichzeichner-Radius</label>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{amount} px</span>
              </div>
              <input type="range" min="1" max="30" step="1" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full accent-sky-600 cursor-pointer" />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1"><span>Leicht (1px)</span><span>Stark (30px)</span></div>
            </div>
          )}
          {mode === 'brightness' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Helligkeit</label>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{brightness}%</span>
                </div>
                <input type="range" min="10" max="200" step="5" value={brightness} onChange={(e) => setBrightness(+e.target.value)} className="w-full accent-sky-600 cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kontrast</label>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{contrast}%</span>
                </div>
                <input type="range" min="10" max="200" step="5" value={contrast} onChange={(e) => setContrast(+e.target.value)} className="w-full accent-sky-600 cursor-pointer" />
              </div>
            </div>
          )}
          {mode === 'grayscale' && (
            <p className="text-sm text-slate-600">Das Bild wird mit dem Rec.709-Luminanz-Algorithmus in echte Graustufen umgewandelt. Die Vorschau zeigt das Ergebnis in Echtzeit.</p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">Anderes Bild</button>
            <button onClick={executeProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors">
              <Sparkles className="w-4 h-4" />
              {titles[mode] || 'Filter anwenden'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
