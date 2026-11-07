'use client';

import { PDFDocument } from 'pdf-lib';
import { getClientPdfJs } from '@/lib/pdfjsClient';
import { PdfToolError, PDF_ERROR_MESSAGES, mapLoadError } from './errors';

export type ProgressFn = (percent: number, statusText?: string) => void;

/** Client-side limits (no server, no accounts): bounded by browser memory only. */
export const CLIENT_PDF_LIMITS = {
  maxFileSizeMB: 100,
  maxBatchFiles: 20,
  maxTotalBatchMB: 400,
  concurrency: 2,
} as const;

export function validateClientBatch(files: File[]): string | null {
  if (files.length > CLIENT_PDF_LIMITS.maxBatchFiles) {
    return `Zu viele Dateien ausgewählt (${files.length}). Bitte verarbeiten Sie maximal ${CLIENT_PDF_LIMITS.maxBatchFiles} PDFs pro Durchgang.`;
  }
  let total = 0;
  for (const f of files) {
    if (f.size > CLIENT_PDF_LIMITS.maxFileSizeMB * 1024 * 1024) {
      return `Die Datei „${f.name}“ ist zu groß (${(f.size / 1048576).toFixed(1)} MB). Erlaubt sind max. ${CLIENT_PDF_LIMITS.maxFileSizeMB} MB pro Datei.`;
    }
    total += f.size;
  }
  if (total > CLIENT_PDF_LIMITS.maxTotalBatchMB * 1024 * 1024) {
    return `Der Stapel ist insgesamt ${(total / 1048576).toFixed(1)} MB groß. Bitte bleiben Sie unter ${CLIENT_PDF_LIMITS.maxTotalBatchMB} MB pro Durchgang.`;
  }
  return null;
}

export async function readFileBytes(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

/** "Vertrag.final.pdf" + "_geschuetzt" -> "Vertrag.final_geschuetzt.pdf" */
export function outputName(original: string, suffix: string): string {
  const base = original.replace(/\.pdf$/i, '') || 'dokument';
  return `${base}${suffix}.pdf`;
}

export function hasPdfHeader(bytes: Uint8Array): boolean {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 1024)));
  return head.includes('%PDF-');
}

/** Loads a PDF with pdf-lib, throwing German errors for encrypted / damaged input. */
export async function loadPdfLib(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    throw mapLoadError(err);
  }
}

/** Lets React paint progress updates between heavy synchronous steps. */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// pdf.js helpers
// ---------------------------------------------------------------------------

type PdfJs = Awaited<ReturnType<typeof getClientPdfJs>>;
export type PdfJsDocument = Awaited<ReturnType<PdfJs['getDocument']>['promise']>;
export type PdfJsPage = Awaited<ReturnType<PdfJsDocument['getPage']>>;

export async function openPdfJs(bytes: Uint8Array, password?: string): Promise<PdfJsDocument> {
  const pdfjs = await getClientPdfJs();
  try {
    // pdf.js transfers (detaches) the buffer it receives, so always hand it a copy.
    return await pdfjs.getDocument({ data: bytes.slice(), password, isEvalSupported: false }).promise;
  } catch (err) {
    const name = (err as { name?: string } | null)?.name;
    if (name === 'PasswordException') throw new PdfToolError('ENCRYPTED', PDF_ERROR_MESSAGES.encrypted);
    throw new PdfToolError('DAMAGED', PDF_ERROR_MESSAGES.damaged);
  }
}

/** Largest canvas we create (keeps mobile Safari below its canvas memory limit). */
const MAX_CANVAS_PIXELS = 16_000_000;

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  /** Device pixels per PDF point actually used. */
  scale: number;
  /** pdf.js viewport used for rendering (for coordinate conversion). */
  viewport: ReturnType<PdfJsPage['getViewport']>;
  /** Page size in PDF points, after /Rotate is applied. */
  widthPt: number;
  heightPt: number;
}

export async function renderPageToCanvas(page: PdfJsPage, desiredScale: number): Promise<RenderedPage> {
  const base = page.getViewport({ scale: 1 });
  let scale = desiredScale;
  const pixels = base.width * base.height * scale * scale;
  if (pixels > MAX_CANVAS_PIXELS) scale = Math.sqrt(MAX_CANVAS_PIXELS / (base.width * base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PdfToolError('RUNTIME', PDF_ERROR_MESSAGES.runtime);
  // White background: JPEG has no alpha and transparent areas would turn black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // "print" intent renders without requestAnimationFrame, so processing keeps running
  // when the tab is in the background (display intent would pause until it is visible).
  await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;
  return { canvas, scale, viewport, widthPt: base.width, heightPt: base.height };
}

export function canvasToBytes(canvas: HTMLCanvasElement, type: 'image/jpeg' | 'image/png', quality?: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new PdfToolError('RUNTIME', 'Das Seitenbild konnte nicht erzeugt werden (zu wenig Arbeitsspeicher?).'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject);
      },
      type,
      quality
    );
  });
}

export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Builds a new PDF in which each page is a JPEG of the rendered original page.
 * Text becomes non-selectable; used for "extreme" compression and as a last-resort repair.
 */
export async function rasterizeDocument(
  bytes: Uint8Array,
  opts: { dpi: number; quality: number; onProgress?: ProgressFn; from?: number; to?: number }
): Promise<Uint8Array> {
  const src = await openPdfJs(bytes);
  try {
    const out = await PDFDocument.create();
    const from = opts.from ?? 0;
    const to = opts.to ?? 100;
    for (let i = 1; i <= src.numPages; i++) {
      opts.onProgress?.(from + ((to - from) * (i - 1)) / src.numPages, `Seite ${i} von ${src.numPages} wird gerendert...`);
      const page = await src.getPage(i);
      const rendered = await renderPageToCanvas(page, opts.dpi / 72);
      const jpg = await out.embedJpg(await canvasToBytes(rendered.canvas, 'image/jpeg', opts.quality));
      releaseCanvas(rendered.canvas);
      const pdfPage = out.addPage([rendered.widthPt, rendered.heightPt]);
      pdfPage.drawImage(jpg, { x: 0, y: 0, width: rendered.widthPt, height: rendered.heightPt });
      page.cleanup();
      await yieldToBrowser();
    }
    return await out.save({ useObjectStreams: true });
  } finally {
    await src.destroy();
  }
}

// ---------------------------------------------------------------------------
// Page previews (zone editor / signature placement)
// ---------------------------------------------------------------------------

export interface PagePreview {
  url: string;
  /** height / width of the displayed (rotated) page */
  aspect: number;
  widthPt: number;
  heightPt: number;
}

export interface PagePreviewer {
  numPages: number;
  render: (pageIndex: number, targetWidthPx: number) => Promise<PagePreview>;
  destroy: () => Promise<void>;
}

/** Opens a PDF once and renders individual pages on demand as JPEG object URLs. */
export async function createPagePreviewer(bytes: Uint8Array): Promise<PagePreviewer> {
  const src = await openPdfJs(bytes);
  const cache = new Map<string, PagePreview>();
  return {
    numPages: src.numPages,
    async render(pageIndex, targetWidthPx) {
      const key = `${pageIndex}:${targetWidthPx}`;
      const hit = cache.get(key);
      if (hit) return hit;
      const page = await src.getPage(pageIndex + 1);
      const base = page.getViewport({ scale: 1 });
      const rendered = await renderPageToCanvas(page, targetWidthPx / base.width);
      const jpg = await canvasToBytes(rendered.canvas, 'image/jpeg', 0.85);
      const preview: PagePreview = {
        url: URL.createObjectURL(new Blob([jpg as unknown as BlobPart], { type: 'image/jpeg' })),
        aspect: rendered.canvas.height / rendered.canvas.width,
        widthPt: rendered.widthPt,
        heightPt: rendered.heightPt,
      };
      releaseCanvas(rendered.canvas);
      page.cleanup();
      cache.set(key, preview);
      return preview;
    },
    async destroy() {
      cache.forEach((p) => URL.revokeObjectURL(p.url));
      cache.clear();
      await src.destroy();
    },
  };
}
