/**
 * Library-backed encoders (TIFF, GIF, SVG tracing, PDF) for browser-side conversion.
 * Heavy libraries are imported dynamically so they are only loaded when needed.
 */
import {
  canvasToBlob,
  fitIntoSquare,
  flattenCanvas,
  getImageData,
  hasTransparency,
  nextFrame,
  resizeCanvas,
} from './canvas';
import { encodeIco, getJpegOrientation } from './binary';
import { decodeImageFile, detectFormat } from './decode';

/* ------------------------------ TIFF ------------------------------- */

export async function encodeTiff(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const mod = await import('utif2');
  const UTIF = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
  const { width: w, height: h } = canvas;
  const data = getImageData(canvas);
  const withAlpha = hasTransparency(data);
  const spp = withAlpha ? 4 : 3;
  const PIXEL_OFFSET = 1000;

  const ifd: Record<string, unknown> = {
    t256: [w],
    t257: [h],
    t258: withAlpha ? [8, 8, 8, 8] : [8, 8, 8],
    t259: [1], // no compression – maximum compatibility
    t262: [2], // RGB
    t273: [PIXEL_OFFSET],
    t277: [spp],
    t278: [h],
    t279: [w * h * spp],
    t282: [[72, 1]],
    t283: [[72, 1]],
    t284: [1],
    t296: [2],
    t305: ['Datei Tools'],
  };
  if (withAlpha) ifd.t338 = [2]; // unassociated (straight) alpha, as delivered by canvas

  const prefix = new Uint8Array(UTIF.encode([ifd as unknown as Parameters<typeof UTIF.encode>[0][number]]));
  if (prefix.length > PIXEL_OFFSET) throw new Error('TIFF-Header konnte nicht erzeugt werden.');
  const out = new Uint8Array(PIXEL_OFFSET + w * h * spp);
  out.set(prefix, 0);
  const px = data.data;
  if (withAlpha) {
    out.set(px, PIXEL_OFFSET);
  } else {
    let o = PIXEL_OFFSET;
    for (let i = 0; i < px.length; i += 4) {
      out[o++] = px[i];
      out[o++] = px[i + 1];
      out[o++] = px[i + 2];
    }
  }
  return out;
}

/* ------------------------------- GIF ------------------------------- */

export async function encodeGif(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const data = getImageData(canvas);
  const withAlpha = hasTransparency(data);
  const format = withAlpha ? 'rgba4444' : 'rgb565';
  const palette = quantize(data.data, 256, withAlpha ? { format, oneBitAlpha: true } : { format });
  const index = applyPalette(data.data, palette, format);
  const transparentIndex = withAlpha ? palette.findIndex((c) => c[3] === 0) : -1;
  const gif = GIFEncoder();
  gif.writeFrame(index, canvas.width, canvas.height, {
    palette,
    transparent: transparentIndex >= 0,
    transparentIndex: Math.max(0, transparentIndex),
  });
  gif.finish();
  return gif.bytes();
}

/* ------------------------- Vectorise (SVG) ------------------------- */

export type TracePreset = 'logo' | 'detailed' | 'bw';

const TRACE_PRESETS: Record<TracePreset, { maxSide: number; options: Record<string, number | boolean> }> = {
  logo: {
    maxSide: 1200,
    options: { numberofcolors: 8, pathomit: 8, ltres: 1, qtres: 1, colorquantcycles: 3, roundcoords: 1 },
  },
  detailed: {
    maxSide: 1000,
    options: { numberofcolors: 32, pathomit: 2, ltres: 0.5, qtres: 0.5, colorquantcycles: 3, roundcoords: 1 },
  },
  bw: {
    maxSide: 1400,
    options: { numberofcolors: 2, colorsampling: 0, colorquantcycles: 1, pathomit: 8, ltres: 1, qtres: 1, roundcoords: 1 },
  },
};

export async function vectorizeCanvas(source: HTMLCanvasElement, preset: TracePreset): Promise<string> {
  const mod = await import('imagetracerjs');
  const ImageTracer = (mod.default ?? (mod as unknown as typeof mod.default)) as typeof mod.default;
  const { maxSide, options } = TRACE_PRESETS[preset];

  const origW = source.width;
  const origH = source.height;
  const factor = Math.min(1, maxSide / Math.max(origW, origH));
  let work = factor < 1 ? resizeCanvas(source, origW * factor, origH * factor) : source;
  if (preset === 'bw') work = flattenCanvas(work, '#ffffff');

  const data = getImageData(work);
  await nextFrame();
  const scale = origW / work.width;
  let svg = ImageTracer.imagedataToSVG(
    { width: data.width, height: data.height, data: data.data },
    { ...options, scale, viewbox: false, desc: false }
  );

  // Normalise the root element: explicit size + viewBox, no non-standard "desc" attribute.
  const w = Math.round(data.width * scale);
  const h = Math.round(data.height * scale);
  svg = svg.replace(
    /^<svg[^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
  );
  // Drop fully transparent layers (background of transparent images).
  svg = svg.replace(/<path [^>]*opacity="0" [^>]*\/>/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Vektorisiert mit Datei Tools (datei-tools.de) -->\n${svg}\n`;
}

/* ------------------------------- PDF ------------------------------- */

export type PdfPageSize = 'image' | 'a4';

const A4: [number, number] = [595.28, 841.89];
const PDF_MAX_SIDE = 14400; // maximum PDF page side in points
const A4_MARGIN = 28;

export interface ImagesToPdfOptions {
  pageSize: PdfPageSize;
  /** JPEG quality (0–1) used when an image must be re-encoded */
  jpegQuality?: number;
  onProgress?: (index: number, total: number) => void;
}

export async function imagesToPdf(files: File[], options: ImagesToPdfOptions): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setProducer('Datei Tools (datei-tools.de)');
  pdf.setCreator('Datei Tools');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    options.onProgress?.(i, files.length);
    const format = await detectFormat(file);
    let image: Awaited<ReturnType<typeof pdf.embedPng>> | null = null;

    try {
      if (format === 'jpeg') {
        const bytes = new Uint8Array(await file.arrayBuffer());
        // Original JPEG data can be embedded losslessly unless it needs EXIF rotation.
        if (getJpegOrientation(bytes) === 1) image = await pdf.embedJpg(bytes);
      } else if (format === 'png') {
        image = await pdf.embedPng(new Uint8Array(await file.arrayBuffer()));
      }
    } catch {
      image = null; // fall back to re-encoding through canvas
    }

    if (!image) {
      const { canvas } = await decodeImageFile(file);
      const alpha = hasTransparency(getImageData(canvas));
      if (alpha) {
        const png = await canvasToBlob(canvas, 'image/png');
        image = await pdf.embedPng(new Uint8Array(await png.arrayBuffer()));
      } else {
        const jpg = await canvasToBlob(canvas, 'image/jpeg', options.jpegQuality ?? 0.92);
        image = await pdf.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
      }
    }

    const imgW = image.width;
    const imgH = image.height;
    if (options.pageSize === 'a4') {
      const landscape = imgW > imgH;
      const [pw, ph] = landscape ? [A4[1], A4[0]] : A4;
      const page = pdf.addPage([pw, ph]);
      const s = Math.min((pw - 2 * A4_MARGIN) / imgW, (ph - 2 * A4_MARGIN) / imgH);
      const dw = imgW * s;
      const dh = imgH * s;
      page.drawImage(image, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    } else {
      // 96 DPI: 1 pixel = 0.75 pt, clamped to the maximum PDF page size
      let s = 0.75;
      const longest = Math.max(imgW, imgH) * s;
      if (longest > PDF_MAX_SIDE) s *= PDF_MAX_SIDE / longest;
      const pw = imgW * s;
      const ph = imgH * s;
      const page = pdf.addPage([pw, ph]);
      page.drawImage(image, { x: 0, y: 0, width: pw, height: ph });
    }
    await nextFrame();
  }
  options.onProgress?.(files.length, files.length);
  return pdf.save();
}

/* ------------------------------- ICO ------------------------------- */

export const ICO_SIZES = [16, 32, 48, 64, 128, 256] as const;

export async function encodeIcoFromCanvas(source: HTMLCanvasElement, sizes: number[]): Promise<Uint8Array> {
  const unique = Array.from(new Set(sizes)).filter((s) => s >= 1 && s <= 256).sort((a, b) => a - b);
  if (unique.length === 0) throw new Error('Bitte mindestens eine Icon-Größe auswählen.');
  const images = [];
  for (const size of unique) {
    const square = fitIntoSquare(source, size);
    const png = await canvasToBlob(square, 'image/png');
    images.push({ width: size, height: size, png: new Uint8Array(await png.arrayBuffer()) });
  }
  return encodeIco(images);
}
