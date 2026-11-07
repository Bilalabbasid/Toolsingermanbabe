/**
 * Turns the uploaded file (PDF, JPG/PNG/WebP/BMP/GIF or TIFF) into page
 * canvases for OCR. Browser-only.
 */
import { getClientPdfJs } from '@/lib/pdfjsClient';

/** OCR works best around 300 DPI; we cap the raster size to protect memory. */
const TARGET_DPI = 300;
const MAX_PAGE_PIXELS = 9_000_000; // ≈ A4 at 300 DPI (2480 × 3508 = 8.7 MP)
const MAX_IMAGE_PIXELS = 25_000_000;
/** Long side of an image page in the output PDF (A4 = 842 pt). */
const IMAGE_PAGE_LONG_SIDE_PT = 842;

export const OCR_MAX_PAGES = 50;

export interface RasterPage {
  index: number;
  canvas: HTMLCanvasElement;
  pageWidthPt: number;
  pageHeightPt: number;
}

export interface PageSource {
  pageCount: number;
  /** Renders page `index` (0-based). The caller releases the canvas afterwards. */
  render(index: number): Promise<RasterPage>;
  close(): void;
}

function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Ihr Browser stellt keinen Canvas-Kontext bereit.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

function imagePageSize(widthPx: number, heightPx: number) {
  const scale = IMAGE_PAGE_LONG_SIDE_PT / Math.max(widthPx, heightPx);
  return { pageWidthPt: widthPx * scale, pageHeightPt: heightPx * scale };
}

function extension(name: string): string {
  return (/\.([a-z0-9]+)$/i.exec(name)?.[1] ?? '').toLowerCase();
}

async function pdfSource(file: File): Promise<PageSource> {
  const pdfjs = await getClientPdfJs();
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch (err) {
    if ((err as { name?: string })?.name === 'PasswordException') {
      throw new Error('Das PDF ist passwortgeschützt. Bitte entfernen Sie zuerst den Passwortschutz.');
    }
    throw new Error('Das PDF konnte nicht gelesen werden. Die Datei ist möglicherweise beschädigt.');
  }
  return {
    pageCount: doc.numPages,
    async render(index) {
      const page = await doc.getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(TARGET_DPI / 72, Math.sqrt(MAX_PAGE_PIXELS / (base.width * base.height)));
      const viewport = page.getViewport({ scale });
      const { canvas, ctx } = createCanvas(viewport.width, viewport.height);
      await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;
      page.cleanup();
      return { index, canvas, pageWidthPt: base.width, pageHeightPt: base.height };
    },
    close() {
      void doc.destroy();
    },
  };
}

async function bitmapToCanvas(source: CanvasImageSource, width: number, height: number): Promise<HTMLCanvasElement> {
  const scale = Math.min(1, Math.sqrt(MAX_IMAGE_PIXELS / (width * height)));
  const { canvas, ctx } = createCanvas(width * scale, height * scale);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function imageSource(file: File): Promise<PageSource> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Das Bild konnte nicht gelesen werden. Bitte verwenden Sie JPG, PNG, WebP, BMP oder TIFF.');
  }
  return {
    pageCount: 1,
    async render(index) {
      const canvas = await bitmapToCanvas(bitmap, bitmap.width, bitmap.height);
      return { index, canvas, ...imagePageSize(canvas.width, canvas.height) };
    },
    close() {
      bitmap.close();
    },
  };
}

async function tiffSource(file: File): Promise<PageSource> {
  const mod = await import('utif2');
  const UTIF = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
  const buffer = await file.arrayBuffer();
  let ifds: ReturnType<typeof UTIF.decode>;
  try {
    ifds = UTIF.decode(buffer);
  } catch {
    throw new Error('Die TIFF-Datei ist beschädigt oder kein gültiges TIFF.');
  }
  const tag = (ifd: (typeof ifds)[number], name: string) => Number((ifd[name] as number[] | undefined)?.[0] || 0);
  // Full-resolution pages only (NewSubfileType bit 0 marks thumbnails).
  const pages = ifds.filter((ifd) => tag(ifd, 't256') > 0 && tag(ifd, 't257') > 0 && (tag(ifd, 't254') & 1) === 0);
  if (pages.length === 0) throw new Error('Die TIFF-Datei enthält kein lesbares Bild.');
  return {
    pageCount: pages.length,
    async render(index) {
      const ifd = pages[index];
      try {
        UTIF.decodeImage(buffer, ifd);
      } catch {
        throw new Error('Die Kompression dieser TIFF-Datei wird im Browser nicht unterstützt.');
      }
      const rgba = UTIF.toRGBA8(ifd);
      const { canvas: full, ctx } = createCanvas(ifd.width, ifd.height);
      ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer as ArrayBuffer, rgba.byteOffset, rgba.byteLength), ifd.width, ifd.height), 0, 0);
      (ifd as { data?: unknown }).data = undefined; // free decoded pixels
      let canvas = full;
      if (ifd.width * ifd.height > MAX_IMAGE_PIXELS) {
        canvas = await bitmapToCanvas(full, ifd.width, ifd.height);
        releaseCanvas(full);
      }
      return { index, canvas, ...imagePageSize(canvas.width, canvas.height) };
    },
    close() {},
  };
}

export async function openPageSource(file: File): Promise<PageSource> {
  const ext = extension(file.name);
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
  if (isPdf || ext === 'pdf') return pdfSource(file);
  if (ext === 'tif' || ext === 'tiff' || (head[0] === 0x49 && head[1] === 0x49 && head[2] === 0x2a) || (head[0] === 0x4d && head[1] === 0x4d && head[3] === 0x2a)) {
    return tiffSource(file);
  }
  return imageSource(file);
}

export function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.82): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Die Seite konnte nicht als Bild gespeichert werden (zu wenig Arbeitsspeicher?).'));
          return;
        }
        blob.arrayBuffer().then((b) => resolve(new Uint8Array(b)), reject);
      },
      'image/jpeg',
      quality
    );
  });
}
