/**
 * Single-file image conversion pipeline running entirely in the browser.
 */
import { canEncode, canvasToBlob, canvasToBlobStrict, flattenCanvas, getImageData, nextFrame } from './canvas';
import { encodeBmp24 } from './binary';
import { baseNameOf, decodeImageFile } from './decode';
import { encodeGif, encodeIcoFromCanvas, encodeTiff, imagesToPdf, vectorizeCanvas, type PdfPageSize, type TracePreset } from './encode';

export type ImageTarget = 'PNG' | 'JPG' | 'WebP' | 'GIF' | 'SVG' | 'BMP' | 'TIFF' | 'ICO' | 'AVIF' | 'PDF';

export interface ImageConvertOptions {
  /** 1–100, used for JPG / WebP / AVIF */
  quality: number;
  /** Fill colour for transparent areas in JPG / BMP */
  background: string;
  /** Icon sizes for ICO output */
  icoSizes: number[];
  /** Scale factor when rasterising SVG input */
  svgScale: number;
  /** Tracing preset for SVG output */
  tracePreset: TracePreset;
  /** Page size for PDF output */
  pdfPageSize: PdfPageSize;
}

export interface ConvertResult {
  blob: Blob;
  fileName: string;
  size: number;
}

export type ProgressFn = (percent: number, message?: string) => void;

export const TARGET_EXTENSION: Record<ImageTarget, string> = {
  PNG: 'png', JPG: 'jpg', WebP: 'webp', GIF: 'gif', SVG: 'svg', BMP: 'bmp', TIFF: 'tiff', ICO: 'ico', AVIF: 'avif', PDF: 'pdf',
};

export const TARGET_MIME: Record<ImageTarget, string> = {
  PNG: 'image/png', JPG: 'image/jpeg', WebP: 'image/webp', GIF: 'image/gif', SVG: 'image/svg+xml',
  BMP: 'image/bmp', TIFF: 'image/tiff', ICO: 'image/x-icon', AVIF: 'image/avif', PDF: 'application/pdf',
};

export function outputNameFor(inputName: string, target: ImageTarget): string {
  return `datei_tools_${baseNameOf(inputName)}.${TARGET_EXTENSION[target]}`;
}

/** Returns a German error message when the browser cannot produce the target format, else null. */
export async function checkTargetSupport(target: ImageTarget): Promise<string | null> {
  if (target === 'AVIF' && !(await canEncode('image/avif'))) {
    return 'Ihr Browser kann keine AVIF-Dateien erzeugen. Die AVIF-Kodierung ist direkt im Browser derzeit nur in wenigen Browsern verfügbar – bitte wählen Sie WebP oder JPG als Zielformat.';
  }
  if (target === 'WebP' && !(await canEncode('image/webp'))) {
    return 'Ihr Browser (z. B. Safari) kann keine WebP-Dateien erzeugen. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge oder Firefox.';
  }
  return null;
}

export async function convertImageFile(
  file: File,
  target: ImageTarget,
  options: ImageConvertOptions,
  onProgress?: ProgressFn
): Promise<ConvertResult> {
  const fileName = outputNameFor(file.name, target);
  const done = (blob: Blob): ConvertResult => {
    onProgress?.(100, 'Fertig');
    return { blob, fileName, size: blob.size };
  };

  if (target === 'PDF') {
    onProgress?.(20, 'Bild wird in PDF eingebettet...');
    const bytes = await imagesToPdf([file], { pageSize: options.pdfPageSize, jpegQuality: options.quality / 100 });
    return done(new Blob([bytes as BlobPart], { type: TARGET_MIME.PDF }));
  }

  onProgress?.(10, 'Bild wird gelesen...');
  await nextFrame();
  const { canvas } = await decodeImageFile(file, {
    svgScale: options.svgScale,
    svgMinLongSide: target === 'ICO' ? 256 : undefined,
  });
  onProgress?.(50, 'Bild wird umgewandelt...');
  await nextFrame();

  const q = Math.min(1, Math.max(0.01, options.quality / 100));

  switch (target) {
    case 'PNG':
      return done(await canvasToBlob(canvas, 'image/png'));
    case 'JPG':
      return done(await canvasToBlobStrict(flattenCanvas(canvas, options.background), 'image/jpeg', q));
    case 'WebP':
      return done(await canvasToBlobStrict(canvas, 'image/webp', q));
    case 'AVIF': {
      const unsupported = await checkTargetSupport('AVIF');
      if (unsupported) throw new Error(unsupported);
      return done(await canvasToBlobStrict(canvas, 'image/avif', q));
    }
    case 'BMP': {
      const flat = flattenCanvas(canvas, options.background);
      const data = getImageData(flat);
      const bytes = encodeBmp24(data.data, flat.width, flat.height);
      return done(new Blob([bytes as BlobPart], { type: TARGET_MIME.BMP }));
    }
    case 'TIFF': {
      onProgress?.(70, 'TIFF wird geschrieben...');
      const bytes = await encodeTiff(canvas);
      return done(new Blob([bytes as BlobPart], { type: TARGET_MIME.TIFF }));
    }
    case 'GIF': {
      onProgress?.(65, 'Farbpalette wird berechnet (max. 256 Farben)...');
      await nextFrame();
      const bytes = await encodeGif(canvas);
      return done(new Blob([bytes as BlobPart], { type: TARGET_MIME.GIF }));
    }
    case 'ICO': {
      onProgress?.(70, 'Icon-Größen werden erzeugt...');
      const bytes = await encodeIcoFromCanvas(canvas, options.icoSizes);
      return done(new Blob([bytes as BlobPart], { type: TARGET_MIME.ICO }));
    }
    case 'SVG': {
      onProgress?.(60, 'Konturen werden nachgezeichnet (Vektorisierung)...');
      const svg = await vectorizeCanvas(canvas, options.tracePreset);
      return done(new Blob([svg], { type: TARGET_MIME.SVG }));
    }
    default:
      throw new Error(`Zielformat ${target} wird nicht unterstützt.`);
  }
}
