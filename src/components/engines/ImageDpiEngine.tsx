'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Eraser } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { formatBytes } from '@/lib/utils';

// DPI is embedded in PNG chunks or JPEG APP0/APP1 segments.
// We set the pixel density in the canvas output via a Blob approach.
// For JPEG we patch the APP0 JFIF or Exif DPI fields.

function writeJfifDpi(jpegBytes: Uint8Array, dpi: number): Uint8Array {
  // Find JFIF APP0 marker (FF E0) and patch Xdensity/Ydensity
  let i = 2;
  while (i < jpegBytes.length - 1) {
    if (jpegBytes[i] === 0xFF) {
      const marker = jpegBytes[i + 1];
      const len = (jpegBytes[i + 2] << 8) | jpegBytes[i + 3];
      if (marker === 0xE0 && len >= 16) {
        // JFIF: units byte at i+11, Xdensity at i+12, Ydensity at i+14
        const seg = jpegBytes.slice(i, i + 2 + len);
        if (seg[4] === 0x4A && seg[5] === 0x46 && seg[6] === 0x49 && seg[7] === 0x46) {
          // units = 1 (DPI)
          jpegBytes[i + 11] = 1;
          jpegBytes[i + 12] = (dpi >> 8) & 0xFF;
          jpegBytes[i + 13] = dpi & 0xFF;
          jpegBytes[i + 14] = (dpi >> 8) & 0xFF;
          jpegBytes[i + 15] = dpi & 0xFF;
          return jpegBytes;
        }
      }
      i += 2 + len;
    } else { i++; }
  }
  return jpegBytes; // Return unchanged if JFIF not found
}

function writePngDpi(pngBytes: Uint8Array, dpi: number): Uint8Array {
  // pHYs chunk: 4 bytes ppuX, 4 bytes ppuY, 1 byte unit (1=meter)
  const ppm = Math.round(dpi / 0.0254); // pixels per meter
  const phys = new Uint8Array(9 + 12);
  const view = new DataView(phys.buffer);
  // chunk length = 9
  view.setUint32(0, 9);
  phys[4] = 0x70; phys[5] = 0x48; phys[6] = 0x59; phys[7] = 0x73; // 'pHYs'
  view.setUint32(8, ppm); view.setUint32(12, ppm);
  phys[16] = 1; // unit meter
  // CRC32
  const crcData = phys.slice(4, 17);
  const crc = crc32(crcData);
  view.setUint32(17, crc);
  // Insert pHYs chunk after PNG signature (8 bytes) and IHDR chunk (4+4+13+4=25 bytes)
  const insertAt = 33; // After signature + IHDR
  const result = new Uint8Array(pngBytes.length + phys.length);
  result.set(pngBytes.slice(0, insertAt), 0);
  result.set(phys, insertAt);
  result.set(pngBytes.slice(insertAt), insertAt + phys.length);
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  const table = makeCrcTable();
  for (let i = 0; i < data.length; i++) { crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF]; }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCrcTable(): Uint32Array {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
    t[n] = c;
  }
  return t;
}

interface ImageDpiEngineProps {
  stripMetadata?: boolean;
}

export function ImageDpiEngine({ stripMetadata = false }: ImageDpiEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [dpi, setDpi] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0]; setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image(); img.src = url;
    img.onload = () => setImgEl(img);
  };

  const executeProcess = async () => {
    if (!imgEl || !file) return;
    setIsProcessing(true); setProgress(20);
    setStatusText(stripMetadata ? 'Metadaten werden entfernt...' : 'DPI wird gesetzt...');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth; canvas.height = imgEl.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgEl, 0, 0);
      setProgress(60); setStatusText('Exportiere...');
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const mime = isPng ? 'image/png' : 'image/jpeg';
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Export fehler');
        if (stripMetadata) {
          // Canvas re-draw already strips Exif. Done.
          setResultBlob(blob);
          const ext = isPng ? '.png' : '.jpg';
          setOutputFilename('coolwave_no_meta_' + file.name.replace(/\.[^.]+$/, '') + ext);
          setProgress(100); setIsProcessing(false);
          return;
        }
        // Patch DPI into the raw bytes
        const buf = await blob.arrayBuffer();
        let bytes: Uint8Array = new Uint8Array(buf);
        if (isPng) { bytes = writePngDpi(bytes, dpi) as Uint8Array; }
        else { bytes = writeJfifDpi(bytes, dpi) as Uint8Array; }
        const cleanBuf: ArrayBuffer = new Uint8Array(bytes).buffer;
        const finalBlob = new Blob([cleanBuf], { type: mime });
        setResultBlob(finalBlob);
        const ext = isPng ? '.png' : '.jpg';
        setOutputFilename('coolwave_' + dpi + 'dpi_' + file.name.replace(/\.[^.]+$/, '') + ext);
        setProgress(100); setIsProcessing(false);
      }, mime, 0.96);
    } catch { setIsProcessing(false); alert('Fehler bei der Verarbeitung.'); }
  };

  const handleReset = () => { setFile(null); setImgEl(null); setResultBlob(null); setIsProcessing(false); };

  const DPI_PRESETS = [72, 96, 150, 300, 600];

  if (resultBlob && file) {
    return (
      <DownloadBox filename={outputFilename} originalSizeBytes={file.size} resultSizeBytes={resultBlob.size}
        onDownload={() => { const url = URL.createObjectURL(resultBlob); const a = document.createElement('a'); a.href = url; a.download = outputFilename; a.click(); }}
        onReset={handleReset} downloadLabel={stripMetadata ? 'Bereinigtes Bild herunterladen' : 'Bild mit neuem DPI herunterladen'} />
    );
  }
  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  return (
    <div className="w-full">
      {!imgEl ? (
        <FileUploader acceptedExtensions={['.jpg', '.jpeg', '.png']} maxFileSizeMB={50} onFilesSelected={handleFileSelected}
          title={stripMetadata ? 'Bild zum Bereinigen ablegen' : 'Bild fuer DPI-Aenderung ablegen'}
          subtitle={stripMetadata ? 'Entfernt EXIF, IPTC, XMP und alle Metadaten aus JPEG/PNG-Dateien' : 'DPI-Wert fuer Druck und Veroeffentlichung festlegen'} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              <img src={imgEl.src} alt={file ? `Bildvorschau von ${file.name}` : "Bildvorschau"} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm truncate max-w-xs">{file?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file!.size)} &mdash; {imgEl.naturalWidth} x {imgEl.naturalHeight} px</p>
            </div>
          </div>

          {!stripMetadata && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">DPI-Schnellauswahl</label>
                <div className="flex flex-wrap gap-2">
                  {DPI_PRESETS.map((d) => (
                    <button key={d} type="button" onClick={() => setDpi(d)}
                      className={'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ' + (dpi === d ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-400')}>
                      {d} DPI
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">72 DPI = Bildschirm &bull; 150 DPI = Qualitätsdruck &bull; 300 DPI = Profidruck &bull; 600 DPI = Hochauflösender Druck</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Benutzerdefiniert</label>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{dpi} DPI</span>
                </div>
                <input type="range" min="72" max="1200" step="6" value={dpi} onChange={(e) => setDpi(+e.target.value)} className="w-full accent-sky-600 cursor-pointer" />
              </div>
            </div>
          )}

          {stripMetadata && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-amber-800 mb-1">Was wird entfernt?</h4>
              <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                <li>EXIF-Daten (GPS-Koordinaten, Kameramodell, Aufnahmedatum)</li>
                <li>IPTC-Metadaten (Urheberrecht, Beschriftungen)</li>
                <li>XMP-Metadaten (Adobe-Informationen)</li>
                <li>Eingebettete Kommentare und Thumbnails</li>
              </ul>
              <p className="text-xs text-amber-600 mt-2">Die Bilddimensionen und -qualitaet bleiben vollstaendig erhalten.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">Anderes Bild</button>
            <button onClick={executeProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors">
              {stripMetadata ? <Eraser className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
              {stripMetadata ? 'Metadaten entfernen' : 'DPI aendern & herunterladen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
