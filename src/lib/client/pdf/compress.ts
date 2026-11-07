'use client';

import {
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  decodePDFRawStream,
} from 'pdf-lib';
import { PdfToolError, PDF_ERROR_MESSAGES } from './errors';
import { runQpdf } from './qpdf';
import { compressArgs } from './qpdfArgs';
import { hasPdfHeader, loadPdfLib, rasterizeDocument, yieldToBrowser, type ProgressFn } from './common';

export type CompressionLevel = 'low' | 'medium' | 'high' | 'extreme';

interface ImagePreset {
  /** Longest image edge in pixels after downsampling. */
  maxEdge: number;
  /** JPEG quality for re-encoding (0..1). */
  quality: number;
  /** Also convert large lossless (Flate) photos to JPEG. */
  convertFlate: boolean;
  /** Remove XMP metadata, thumbnails and private application data. */
  stripExtras: boolean;
}

const PRESETS: Record<Exclude<CompressionLevel, 'extreme'>, ImagePreset> = {
  low: { maxEdge: 3000, quality: 0.85, convertFlate: false, stripExtras: false },
  medium: { maxEdge: 2000, quality: 0.72, convertFlate: true, stripExtras: false },
  high: { maxEdge: 1400, quality: 0.55, convertFlate: true, stripExtras: true },
};

export interface CompressResult {
  bytes: Uint8Array;
  /** true when no smaller version could be produced and the original is returned. */
  unchanged: boolean;
  imagesOptimized: number;
}

const N = {
  Subtype: PDFName.of('Subtype'),
  Image: PDFName.of('Image'),
  Filter: PDFName.of('Filter'),
  DecodeParms: PDFName.of('DecodeParms'),
  DCTDecode: PDFName.of('DCTDecode'),
  FlateDecode: PDFName.of('FlateDecode'),
  ColorSpace: PDFName.of('ColorSpace'),
  DeviceRGB: PDFName.of('DeviceRGB'),
  DeviceGray: PDFName.of('DeviceGray'),
  ICCBased: PDFName.of('ICCBased'),
  BitsPerComponent: PDFName.of('BitsPerComponent'),
  Width: PDFName.of('Width'),
  Height: PDFName.of('Height'),
  Decode: PDFName.of('Decode'),
  ImageMask: PDFName.of('ImageMask'),
  Mask: PDFName.of('Mask'),
  N: PDFName.of('N'),
  Predictor: PDFName.of('Predictor'),
  Colors: PDFName.of('Colors'),
  Columns: PDFName.of('Columns'),
  Length: PDFName.of('Length'),
  Metadata: PDFName.of('Metadata'),
  PieceInfo: PDFName.of('PieceInfo'),
  Thumb: PDFName.of('Thumb'),
};

function singleFilter(dict: PDFDict): PDFName | null {
  const f = dict.lookup(N.Filter);
  if (f instanceof PDFName) return f;
  if (f instanceof PDFArray && f.size() === 1) {
    const only = f.lookup(0);
    return only instanceof PDFName ? only : null;
  }
  return null;
}

/** Number of colour components for colour spaces we can safely re-encode as RGB JPEG; 0 = unsupported. */
function componentsOf(dict: PDFDict): { n: number; keepColorSpace: boolean } {
  const cs = dict.lookup(N.ColorSpace);
  if (cs === N.DeviceRGB) return { n: 3, keepColorSpace: true };
  if (cs === N.DeviceGray) return { n: 1, keepColorSpace: false };
  if (cs instanceof PDFArray && cs.size() === 2 && cs.lookup(0) === N.ICCBased) {
    const profile = cs.lookup(1);
    if (profile instanceof PDFStream) {
      const n = profile.dict.lookup(N.N);
      if (n instanceof PDFNumber) {
        if (n.asNumber() === 3) return { n: 3, keepColorSpace: true };
        if (n.asNumber() === 1) return { n: 1, keepColorSpace: false };
      }
    }
  }
  return { n: 0, keepColorSpace: false };
}

function numberOf(dict: PDFDict | undefined, key: PDFName, fallback: number): number {
  const v = dict?.lookup(key);
  return v instanceof PDFNumber ? v.asNumber() : fallback;
}

/** Reverses PNG row filters (Predictor >= 10) for 8-bit samples. */
function pngUnpredict(data: Uint8Array, colors: number, columns: number): Uint8Array | null {
  const bpp = colors;
  const rowLen = colors * columns;
  const rows = Math.floor(data.length / (rowLen + 1));
  const out = new Uint8Array(rows * rowLen);
  for (let r = 0; r < rows; r++) {
    const filter = data[r * (rowLen + 1)];
    const src = r * (rowLen + 1) + 1;
    const dst = r * rowLen;
    const prev = dst - rowLen;
    for (let i = 0; i < rowLen; i++) {
      const raw = data[src + i];
      const left = i >= bpp ? out[dst + i - bpp] : 0;
      const up = r > 0 ? out[prev + i] : 0;
      const upLeft = r > 0 && i >= bpp ? out[prev + i - bpp] : 0;
      let v: number;
      switch (filter) {
        case 0: v = raw; break;
        case 1: v = raw + left; break;
        case 2: v = raw + up; break;
        case 3: v = raw + ((left + up) >> 1); break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          v = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
          break;
        }
        default:
          return null;
      }
      out[dst + i] = v & 0xff;
    }
  }
  return out;
}

function canvasJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(null);
        blob.arrayBuffer().then((b) => resolve(new Uint8Array(b)), () => resolve(null));
      },
      'image/jpeg',
      quality
    );
  });
}

function targetSize(w: number, h: number, maxEdge: number): { w: number; h: number } {
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

async function drawToJpeg(
  source: CanvasImageSource,
  w: number,
  h: number,
  preset: ImagePreset
): Promise<{ bytes: Uint8Array; w: number; h: number } | null> {
  const t = targetSize(w, h, preset.maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = t.w;
  canvas.height = t.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, t.w, t.h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, t.w, t.h);
  const bytes = await canvasJpeg(canvas, preset.quality);
  canvas.width = 0;
  canvas.height = 0;
  return bytes ? { bytes, w: t.w, h: t.h } : null;
}

async function reencodeJpeg(stream: PDFRawStream, preset: ImagePreset, w: number, h: number) {
  const blob = new Blob([stream.contents as unknown as BlobPart], { type: 'image/jpeg' });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }
  try {
    // Trust the decoded size over /Width /Height (they must agree for a valid file).
    if (bitmap.width !== w || bitmap.height !== h) return null;
    return await drawToJpeg(bitmap, w, h, preset);
  } finally {
    bitmap.close();
  }
}

async function reencodeFlate(stream: PDFRawStream, preset: ImagePreset, w: number, h: number, n: number) {
  const parms = stream.dict.lookup(N.DecodeParms);
  const parmsDict = parms instanceof PDFDict ? parms : parms instanceof PDFArray ? parms.lookupMaybe(0, PDFDict) : undefined;
  const predictor = numberOf(parmsDict, N.Predictor, 1);
  if (predictor !== 1 && predictor < 10) return null; // TIFF predictor: leave untouched

  let samples: Uint8Array;
  try {
    // Decode without DecodeParms (pdf-lib ignores predictors), then undo PNG prediction ourselves.
    samples = decodePDFRawStream(stream).decode();
  } catch {
    return null;
  }
  if (predictor >= 10) {
    const colors = numberOf(parmsDict, N.Colors, 1);
    const columns = numberOf(parmsDict, N.Columns, 1);
    if (colors !== n || columns !== w) return null;
    const unpredicted = pngUnpredict(samples, colors, columns);
    if (!unpredicted) return null;
    samples = unpredicted;
  }
  if (samples.length < w * h * n) return null;

  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, p = 0; i < w * h; i++, p += n) {
    const o = i * 4;
    if (n === 3) {
      rgba[o] = samples[p];
      rgba[o + 1] = samples[p + 1];
      rgba[o + 2] = samples[p + 2];
    } else {
      rgba[o] = rgba[o + 1] = rgba[o + 2] = samples[p];
    }
    rgba[o + 3] = 255;
  }
  const full = document.createElement('canvas');
  full.width = w;
  full.height = h;
  const ctx = full.getContext('2d');
  if (!ctx) return null;
  ctx.putImageData(new ImageData(rgba, w, h), 0, 0);
  try {
    return await drawToJpeg(full, w, h, preset);
  } finally {
    full.width = 0;
    full.height = 0;
  }
}

/**
 * Re-encodes / downsamples raster images in place. Returns the number of replaced images.
 * Only images whose new encoding is clearly smaller are replaced.
 */
async function optimizeImages(doc: PDFDocument, preset: ImagePreset, onProgress?: (done: number, total: number) => void) {
  const candidates: [PDFRef, PDFRawStream][] = [];
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream && obj.dict.lookup(N.Subtype) === N.Image) candidates.push([ref, obj]);
  }

  let replaced = 0;
  for (let idx = 0; idx < candidates.length; idx++) {
    const [ref, stream] = candidates[idx];
    onProgress?.(idx, candidates.length);
    const dict = stream.dict;
    const filter = singleFilter(dict);
    const w = numberOf(dict, N.Width, 0);
    const h = numberOf(dict, N.Height, 0);
    const bpc = numberOf(dict, N.BitsPerComponent, 8);
    const { n, keepColorSpace } = componentsOf(dict);
    const isImageMask = dict.lookup(N.ImageMask) === PDFBool.True;
    const colorKeyMask = dict.lookup(N.Mask) instanceof PDFArray;
    const original = stream.contents.length;

    if (!filter || !n || bpc !== 8 || w < 16 || h < 16 || isImageMask || colorKeyMask || dict.has(N.Decode)) continue;
    if (original < 16 * 1024) continue; // not worth it

    let encoded: { bytes: Uint8Array; w: number; h: number } | null = null;
    let threshold = 0.9;
    if (filter === N.DCTDecode) {
      encoded = await reencodeJpeg(stream, preset, w, h);
    } else if (filter === N.FlateDecode && preset.convertFlate && w * h >= 250_000) {
      // Lossless → lossy only pays off for photos; require a large win so line art stays crisp.
      threshold = 0.5;
      encoded = await reencodeFlate(stream, preset, w, h, n);
    }
    await yieldToBrowser();
    if (!encoded || encoded.bytes.length >= original * threshold) continue;

    const newDict = dict.clone(doc.context);
    newDict.set(N.Filter, N.DCTDecode);
    newDict.delete(N.DecodeParms);
    newDict.delete(N.Length);
    newDict.set(N.Width, PDFNumber.of(encoded.w));
    newDict.set(N.Height, PDFNumber.of(encoded.h));
    newDict.set(N.BitsPerComponent, PDFNumber.of(8));
    // Canvas always produces 3-component JPEGs.
    if (!keepColorSpace) newDict.set(N.ColorSpace, N.DeviceRGB);
    doc.context.assign(ref, PDFRawStream.of(newDict, encoded.bytes));
    replaced++;
  }
  return replaced;
}

function stripExtras(doc: PDFDocument) {
  doc.catalog.delete(N.Metadata);
  doc.catalog.delete(N.PieceInfo);
  for (const page of doc.getPages()) {
    page.node.delete(N.Thumb);
    page.node.delete(N.PieceInfo);
    page.node.delete(N.Metadata);
  }
}

/**
 * Compresses a PDF entirely in the browser.
 * low/medium/high: image re-encoding (canvas) + lossless qpdf restructuring; text stays selectable.
 * extreme: every page is rasterised (text is no longer selectable).
 * Never returns a file larger than the input.
 */
export async function compressPdf(input: Uint8Array, level: CompressionLevel, onProgress?: ProgressFn): Promise<CompressResult> {
  if (!hasPdfHeader(input)) throw new PdfToolError('DAMAGED', PDF_ERROR_MESSAGES.damaged);
  onProgress?.(5, 'PDF wird analysiert...');

  let candidate: Uint8Array;
  let imagesOptimized = 0;

  if (level === 'extreme') {
    // Fail early with a clear message for encrypted files.
    await loadPdfLib(input);
    candidate = await rasterizeDocument(input, { dpi: 110, quality: 0.6, onProgress, from: 10, to: 80 });
  } else {
    const preset = PRESETS[level];
    const doc = await loadPdfLib(input);
    onProgress?.(10, 'Bilder werden neu kodiert und verkleinert...');
    imagesOptimized = await optimizeImages(doc, preset, (done, total) => {
      onProgress?.(10 + (60 * done) / Math.max(1, total), `Bild ${Math.min(done + 1, total)} von ${total} wird optimiert...`);
    });
    if (preset.stripExtras) stripExtras(doc);
    onProgress?.(72, 'Dokument wird neu aufgebaut...');
    candidate = await doc.save({ useObjectStreams: false, addDefaultPage: false });
  }

  onProgress?.(82, 'Datenströme werden verlustfrei komprimiert (qpdf)...');
  const qpdfResult = await runQpdf(candidate, compressArgs());
  if (qpdfResult.output && qpdfResult.output.length < candidate.length) candidate = qpdfResult.output;

  // Images untouched and pdf-lib re-serialisation not helpful? Try qpdf on the original as well.
  if (level !== 'extreme' && candidate.length >= input.length) {
    const direct = await runQpdf(input, compressArgs());
    if (direct.output && direct.output.length < candidate.length) candidate = direct.output;
  }

  onProgress?.(100, 'Fertig');
  if (candidate.length >= input.length) {
    return { bytes: input, unchanged: true, imagesOptimized: 0 };
  }
  return { bytes: candidate, unchanged: false, imagesOptimized };
}
