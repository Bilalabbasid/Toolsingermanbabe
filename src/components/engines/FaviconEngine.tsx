'use client';

import React, { useState } from 'react';
import { Star, Download } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { formatBytes } from '@/lib/utils';

const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];

interface SizedBlob {
  size: number;
  blob: Blob;
  filename: string;
}

export function FaviconEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 180, 192]);
  const [outputFormat, setOutputFormat] = useState<'png' | 'ico'>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState<SizedBlob[]>([]);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0]; setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image(); img.src = url;
    img.onload = () => setImgEl(img);
  };

  const toggleSize = (s: number) => {
    setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].sort((a, b) => a - b));
  };

  const renderAtSize = (img: HTMLImageElement, px: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = px; canvas.height = px;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, px, px);
      // Square crop from center
      const minSide = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - minSide) / 2;
      const sy = (img.naturalHeight - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, px, px);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Failed')), 'image/png', 1.0);
    });
  };

  const executeProcess = async () => {
    if (!imgEl || !file || selectedSizes.length === 0) return;
    setIsProcessing(true); setResults([]);
    const sizedBlobs: SizedBlob[] = [];
    for (let i = 0; i < selectedSizes.length; i++) {
      const px = selectedSizes[i];
      setProgress(Math.round((i / selectedSizes.length) * 90));
      setStatusText('Erstelle ' + px + 'x' + px + 'px Favicon...');
      try {
        const blob = await renderAtSize(imgEl, px);
        sizedBlobs.push({ size: px, blob, filename: 'favicon_' + px + 'x' + px + '.png' });
      } catch { console.error('Failed to render size', px); }
    }
    setProgress(100);
    setResults(sizedBlobs);
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    if (results.length === 0) return;
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.filename, r.blob));
    // Add manifest snippet
    const manifest = {
      icons: results.map((r) => ({ src: '/' + r.filename, sizes: r.size + 'x' + r.size, type: 'image/png' }))
    };
    zip.file('manifest_icons.json', JSON.stringify(manifest, null, 2));
    zip.file('README.txt', 'Favicon-Paket erstellt mit CoolWave\n\nDateien:\n' + results.map((r) => r.filename).join('\n') + '\n\nFuer Ihre HTML-Datei:\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon_32x32.png">\n<link rel="apple-touch-icon" href="/favicon_180x180.png">');
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = 'coolwave_favicons.zip'; a.click();
  };

  const downloadSingle = (r: SizedBlob) => {
    const url = URL.createObjectURL(r.blob);
    const a = document.createElement('a'); a.href = url; a.download = r.filename; a.click();
  };

  const handleReset = () => { setFile(null); setImgEl(null); setResults([]); setIsProcessing(false); };

  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  if (results.length > 0 && file) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Favicons erfolgreich erstellt!</h3>
            <p className="text-xs text-slate-500">{results.length} Groessen generiert</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {results.map((r) => (
            <div key={r.size} className="border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-sky-300 transition-colors">
              <img src={URL.createObjectURL(r.blob)} alt={`Favicon Vorschau ${r.size}x${r.size} Pixel`} className="w-12 h-12 object-contain rounded bg-slate-50 border border-slate-100" />
              <div className="text-center">
                <div className="text-xs font-bold text-slate-800">{r.size}x{r.size}</div>
                <div className="text-[10px] text-slate-400">{formatBytes(r.blob.size)}</div>
              </div>
              <button onClick={() => downloadSingle(r)} className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-0.5">
                <Download className="w-3 h-3" /> PNG
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-700 mb-2">HTML-Einbindung</h4>
          <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-mono overflow-x-auto">{`<link rel="icon" type="image/png" sizes="32x32" href="/favicon_32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon_16x16.png">
<link rel="apple-touch-icon" href="/favicon_180x180.png">
<link rel="manifest" href="/manifest.json">`}</pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">Neues Bild</button>
          <button onClick={downloadAll} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Alle als ZIP herunterladen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!imgEl ? (
        <FileUploader acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']} maxFileSizeMB={10} onFilesSelected={handleFileSelected}
          title="Favicon erstellen" subtitle="Logo oder Bild hochladen – CoolWave generiert alle Favicon-Groessen fuer Browser, PWA und Apple-Geraete" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              <img src={imgEl.src} alt={file ? `Favicon-Quellbild ${file.name}` : "Favicon-Quellbild Vorschau"} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm truncate max-w-xs">{file?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file!.size)} &mdash; {imgEl.naturalWidth} x {imgEl.naturalHeight} px</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Groessen auswaehlen</label>
            <div className="flex flex-wrap gap-2">
              {FAVICON_SIZES.map((s) => (
                <button key={s} type="button" onClick={() => toggleSize(s)}
                  className={'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ' + (selectedSizes.includes(s) ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-400')}>
                  {s}x{s}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">16/32/48 = Browser-Tab &bull; 180 = Apple Touch Icon &bull; 192/512 = PWA Manifest</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Ausgabeformat</label>
            <div className="flex gap-2">
              {(['png', 'ico'] as const).map((fmt) => (
                <button key={fmt} type="button" onClick={() => setOutputFormat(fmt)}
                  className={'px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ' + (outputFormat === fmt ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-400')}>
                  .{fmt.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">PNG wird als ZIP-Bundle geliefert; ICO fasst alle Groessen in einer Datei zusammen (Browser-Standard)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">Anderes Bild</button>
            <button onClick={executeProcess} disabled={selectedSizes.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors">
              <Star className="w-4 h-4" /> Favicons generieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
