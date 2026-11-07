'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  PenTool,
  FileText,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Upload,
  Type,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Move,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import {
  CLIENT_PDF_LIMITS,
  createPagePreviewer,
  outputName,
  pdfBlob,
  readFileBytes,
  type PagePreview,
  type PagePreviewer,
} from '@/lib/client/pdf/common';
import { toGermanErrorMessage } from '@/lib/client/pdf/errors';
import { signPdf, stampLineCount, stampMetrics, type SignatureStamp } from '@/lib/client/pdf/sign';

type SignMode = 'draw' | 'type' | 'upload';

const TOOL_SLUG = 'pdf-signieren';
const PREVIEW_WIDTH = 720;
const DRAW_W = 920;
const DRAW_H = 288;

const INK_COLORS = [
  { id: 'blue', label: 'Blau', value: '#1d3f8f' },
  { id: 'black', label: 'Schwarz', value: '#111827' },
] as const;

interface PreparedSignature {
  url: string;
  png: Uint8Array;
  /** height / width */
  aspect: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Crops transparent margins; optionally makes near-white pixels transparent and recolours ink. */
async function finalizeSignature(
  source: HTMLCanvasElement,
  opts: { removeWhite?: boolean; recolor?: string }
): Promise<PreparedSignature | null> {
  const ctx = source.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = source;
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const ink = opts.recolor ? hexToRgb(opts.recolor) : null;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (opts.removeWhite && d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225) d[i + 3] = 0;
      if (ink && d[i + 3] > 0) {
        d[i] = ink[0];
        d[i + 1] = ink[1];
        d[i + 2] = ink[2];
      }
      if (d[i + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  ctx.putImageData(img, 0, 0);
  const pad = 6;
  const cx = Math.max(0, minX - pad);
  const cy = Math.max(0, minY - pad);
  const cw = Math.min(width, maxX + pad + 1) - cx;
  const ch = Math.min(height, maxY + pad + 1) - cy;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  out.getContext('2d')?.drawImage(source, cx, cy, cw, ch, 0, 0, cw, ch);
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
  if (!blob) return null;
  return { url: out.toDataURL('image/png'), png: new Uint8Array(await blob.arrayBuffer()), aspect: ch / cw };
}

export function PdfSignEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [signMode, setSignMode] = useState<SignMode>('draw');
  const [inkColor, setInkColor] = useState<string>(INK_COLORS[0].value);
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState<ImageBitmap | null>(null);
  const [removeWhite, setRemoveWhite] = useState(true);
  const [drawVersion, setDrawVersion] = useState(0);
  const [signature, setSignature] = useState<PreparedSignature | null>(null);

  const [addStamp, setAddStamp] = useState(true);
  const [signerName, setSignerName] = useState('');
  const [reason, setReason] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [previewer, setPreviewer] = useState<PagePreviewer | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [preview, setPreview] = useState<PagePreview | null>(null);
  const [placement, setPlacement] = useState({ x: 0.6, y: 0.78, width: 0.3 });
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- document preview -----------------------------------------------------
  useEffect(() => {
    if (!file) return;
    let disposed = false;
    let instance: PagePreviewer | null = null;
    readFileBytes(file)
      .then((bytes) => createPagePreviewer(bytes))
      .then((p) => {
        if (disposed) {
          void p.destroy();
          return;
        }
        instance = p;
        setPreviewer(p);
        setPageIndex(p.numPages - 1); // default: last page
      })
      .catch((err) => {
        if (!disposed) {
          setError(toGermanErrorMessage(err));
          setFile(null);
        }
      });
    return () => {
      disposed = true;
      setPreviewer(null);
      setPreview(null);
      if (instance) void instance.destroy();
    };
  }, [file]);

  useEffect(() => {
    if (!previewer) return;
    let cancelled = false;
    previewer
      .render(pageIndex, PREVIEW_WIDTH)
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch(() => {
        if (!cancelled) setError('Die Seitenvorschau konnte nicht erzeugt werden.');
      });
    return () => {
      cancelled = true;
    };
  }, [previewer, pageIndex]);

  // --- signature image --------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const build = async (): Promise<PreparedSignature | null> => {
      if (signMode === 'draw') {
        const c = canvasRef.current;
        if (!c || !hasDrawn) return null;
        const copy = document.createElement('canvas');
        copy.width = c.width;
        copy.height = c.height;
        copy.getContext('2d')?.drawImage(c, 0, 0);
        return finalizeSignature(copy, { recolor: inkColor });
      }
      if (signMode === 'type') {
        const text = typedSignature.trim();
        if (!text) return null;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        if (!ctx) return null;
        const font = 'italic 110px "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Snell Roundhand", cursive';
        ctx.font = font;
        c.width = Math.min(4000, Math.ceil(ctx.measureText(text).width) + 80);
        c.height = 200;
        ctx.font = font; // resizing resets the context state
        ctx.fillStyle = inkColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 40, 100);
        return finalizeSignature(c, {});
      }
      if (!uploadedImage) return null;
      const scale = Math.min(1, 1600 / Math.max(uploadedImage.width, uploadedImage.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(uploadedImage.width * scale));
      c.height = Math.max(1, Math.round(uploadedImage.height * scale));
      c.getContext('2d')?.drawImage(uploadedImage, 0, 0, c.width, c.height);
      return finalizeSignature(c, { removeWhite });
    };
    Promise.resolve()
      .then(build)
      .then((sig) => {
        if (!cancelled) setSignature(sig);
      })
      .catch(() => {
        if (!cancelled) setSignature(null);
      });
    return () => {
      cancelled = true;
    };
  }, [signMode, inkColor, typedSignature, uploadedImage, removeWhite, drawVersion, hasDrawn]);

  // --- drawing pad ----------------------------------------------------------
  const padPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * c.width, y: ((e.clientY - rect.top) / rect.height) * c.height };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const p = padPoint(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = padPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setDrawVersion((v) => v + 1);
  };

  const clearCanvas = () => {
    const c = canvasRef.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
    setDrawVersion((v) => v + 1);
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    try {
      setUploadedImage(await createImageBitmap(imgFile));
      setError(null);
    } catch {
      setError('Das Bild konnte nicht gelesen werden. Bitte verwenden Sie PNG, JPG oder WebP.');
    }
  };

  // --- placement --------------------------------------------------------------
  const stamp: SignatureStamp | null = addStamp ? { signerName, reason } : null;
  const blockHeightFraction = (() => {
    if (!preview) return 0.1;
    const blockWpt = placement.width * preview.widthPt;
    const sigH = blockWpt * (signature?.aspect ?? 0.33);
    const lines = stampLineCount(stamp);
    const stampH = lines ? stampMetrics(blockWpt, lines).height : 0;
    return (sigH + stampH) / preview.heightPt;
  })();

  const clampPlacement = (x: number, y: number, width = placement.width) => ({
    width,
    x: Math.min(Math.max(0, x), Math.max(0, 1 - width)),
    y: Math.min(Math.max(0, y), Math.max(0, 1 - blockHeightFraction)),
  });

  const onBlockPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, x: placement.x, y: placement.y };
  };

  const onBlockPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const overlay = overlayRef.current;
    if (!drag || !overlay) return;
    const rect = overlay.getBoundingClientRect();
    setPlacement(
      clampPlacement(drag.x + (e.clientX - drag.startX) / rect.width, drag.y + (e.clientY - drag.startY) / rect.height)
    );
  };

  const onBlockPointerUp = () => {
    dragRef.current = null;
  };

  const setPreset = (preset: 'br' | 'bl' | 'bc' | 'tr') => {
    const m = 0.06;
    const w = placement.width;
    const h = blockHeightFraction;
    const pos = {
      br: { x: 1 - w - m, y: 1 - h - m },
      bl: { x: m, y: 1 - h - m },
      bc: { x: (1 - w) / 2, y: 1 - h - m },
      tr: { x: 1 - w - m, y: m },
    }[preset];
    setPlacement(clampPlacement(pos.x, pos.y));
  };

  // --- execution --------------------------------------------------------------
  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      trackEvent('upload_completed', { toolSlug: TOOL_SLUG });
    }
  };

  const handleExecute = async () => {
    if (!file) return;
    if (!signature) {
      setError(
        signMode === 'draw'
          ? 'Bitte zeichnen Sie Ihre Unterschrift in das vorgesehene Feld.'
          : signMode === 'type'
            ? 'Bitte geben Sie Ihren Namen für die Unterschrift ein.'
            : 'Bitte laden Sie ein Bild Ihrer Unterschrift hoch.'
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(5);
    setStatusText('Unterschrift wird vorbereitet...');
    trackEvent('conversion_started', { toolSlug: TOOL_SLUG });

    try {
      const input = await readFileBytes(file);
      const bytes = await signPdf(
        input,
        {
          signaturePng: signature.png,
          placement: { pageIndex, ...clampPlacement(placement.x, placement.y) },
          stamp,
        },
        (pct, text) => {
          setProgress(pct);
          if (text) setStatusText(text);
        }
      );
      setProgress(100);
      setResultBlob(pdfBlob(bytes));
      setOutputFilename(outputName(file.name, '_signiert'));
      trackEvent('conversion_completed', { toolSlug: TOOL_SLUG });
    } catch (err: unknown) {
      setError(toGermanErrorMessage(err, 'Fehler beim Signieren des PDFs.'));
      trackEvent('conversion_failed', { toolSlug: TOOL_SLUG });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: TOOL_SLUG });
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setError(null);
    setIsProcessing(false);
    setPageIndex(0);
  };

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        resultSizeBytes={resultBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="Signiertes PDF herunterladen"
      />
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} isBackgroundSafe={false} />;
  }

  const tabClass = (active: boolean) =>
    `flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
    }`;
  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
  const stampLines = stampLineCount(stamp);

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={CLIENT_PDF_LIMITS.maxFileSizeMB}
          onFilesSelected={handleFileSelected}
          isLocal
          title="PDF zum Signieren ablegen"
          subtitle="Unterschrift zeichnen, tippen oder als Bild einfügen – direkt in Ihrem Browser"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: signature creation + details */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Unterschrift erstellen
                </label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                  <button type="button" onClick={() => setSignMode('draw')} className={tabClass(signMode === 'draw')}>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Zeichnen</span>
                  </button>
                  <button type="button" onClick={() => setSignMode('type')} className={tabClass(signMode === 'type')}>
                    <Type className="w-3.5 h-3.5" />
                    <span>Tippen</span>
                  </button>
                  <button type="button" onClick={() => setSignMode('upload')} className={tabClass(signMode === 'upload')}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bild laden</span>
                  </button>
                </div>

                {signMode !== 'upload' && (
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-600">
                    <span>Farbe:</span>
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setInkColor(c.value)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                          inkColor === c.value ? 'border-sky-500 bg-sky-50' : 'border-slate-200'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Draw: canvas stays mounted so switching tabs keeps the drawing */}
                <div className={signMode === 'draw' ? 'space-y-2' : 'hidden'}>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={DRAW_W}
                      height={DRAW_H}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={stopDrawing}
                      onPointerCancel={stopDrawing}
                      className="w-full h-36 touch-none"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                        Hier mit Maus, Stift oder Finger unterschreiben...
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Unterschrift löschen</span>
                    </button>
                  </div>
                </div>

                {signMode === 'type' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Vorname Nachname eingeben..."
                      className={inputClass}
                    />
                  </div>
                )}

                {signMode === 'upload' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleSignatureUpload}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeWhite}
                        onChange={(e) => setRemoveWhite(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded border-slate-300"
                      />
                      Weißen Hintergrund transparent machen
                    </label>
                  </div>
                )}

                {signature && signMode !== 'draw' && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={signature.url} alt="Vorschau der Unterschrift" className="max-h-20 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={addStamp}
                    onChange={(e) => setAddStamp(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300"
                  />
                  <span>
                    Prüfvermerk unter der Unterschrift anzeigen
                    <span className="block text-xs text-slate-500 mt-0.5">
                      Name, Datum, Grund und SHA-256-Hash des Originaldokuments
                    </span>
                  </span>
                </label>
                {addStamp && (
                  <div className="space-y-3 pl-7">
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Name des Unterzeichners (optional)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Grund, z. B. Geprüft und freigegeben (optional)"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Einfache elektronische Signatur</span>
                </div>
                <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                  Die Unterschrift wird als Bild in die gewählte Seite eingefügt – vollständig in Ihrem Browser. Dies ist
                  eine einfache visuelle Signatur, keine qualifizierte elektronische Signatur mit Zertifikat (eIDAS).
                </p>
              </div>
            </div>

            {/* Right: placement */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Seite & Position wählen
              </label>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!previewer || pageIndex === 0}
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  aria-label="Vorherige Seite"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600">
                  {previewer ? `Seite ${pageIndex + 1} von ${previewer.numPages}` : 'Vorschau wird geladen...'}
                </span>
                <button
                  type="button"
                  disabled={!previewer || pageIndex >= previewer.numPages - 1}
                  onClick={() => setPageIndex((i) => (previewer ? Math.min(previewer.numPages - 1, i + 1) : i))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  aria-label="Nächste Seite"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                {preview ? (
                  <div
                    ref={overlayRef}
                    className="relative w-full select-none"
                    style={{ aspectRatio: `1 / ${preview.aspect}` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.url}
                      alt={`Vorschau Seite ${pageIndex + 1}`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      draggable={false}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Unterschrift verschieben"
                      onPointerDown={onBlockPointerDown}
                      onPointerMove={onBlockPointerMove}
                      onPointerUp={onBlockPointerUp}
                      onPointerCancel={onBlockPointerUp}
                      className="absolute border-2 border-dashed border-sky-500 bg-sky-50/30 cursor-move touch-none flex flex-col"
                      style={{
                        left: `${placement.x * 100}%`,
                        top: `${placement.y * 100}%`,
                        width: `${placement.width * 100}%`,
                        height: `${blockHeightFraction * 100}%`,
                      }}
                    >
                      {signature ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={signature.url} alt="" className="w-full pointer-events-none" draggable={false} />
                      ) : (
                        <span className="m-auto text-[10px] text-sky-700 flex items-center gap-1">
                          <Move className="w-3 h-3" /> Unterschrift
                        </span>
                      )}
                      {stampLines > 0 && (
                        <div className="flex-1 border-t border-slate-400/70 bg-white/40 mt-0.5 space-y-[2px] p-[2px]">
                          {Array.from({ length: stampLines }).map((_, i) => (
                            <div key={i} className="h-[2px] bg-slate-400/60 rounded" style={{ width: `${85 - i * 12}%` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Seitenvorschau wird erstellt...
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['bl', 'Unten links'],
                    ['bc', 'Unten Mitte'],
                    ['br', 'Unten rechts'],
                    ['tr', 'Oben rechts'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreset(id)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-sky-400"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="block text-xs text-slate-600">
                Größe der Unterschrift: {Math.round(placement.width * 100)} % der Seitenbreite
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={Math.round(placement.width * 100)}
                  onChange={(e) => {
                    const w = Number(e.target.value) / 100;
                    setPlacement((p) => ({ ...p, width: w, x: Math.min(p.x, 1 - w) }));
                  }}
                  className="w-full mt-1"
                />
              </label>
              <p className="text-[11px] text-slate-500">Ziehen Sie den Rahmen an die gewünschte Stelle.</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Andere Datei wählen
            </button>

            <button
              onClick={handleExecute}
              disabled={!previewer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PDF jetzt signieren</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
