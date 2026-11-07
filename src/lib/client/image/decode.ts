/**
 * Decodes any supported input image into an HTMLCanvasElement – entirely in the browser.
 *
 * - JPG/PNG/GIF/WebP/BMP/AVIF: native browser decoder (EXIF orientation applied)
 * - HEIC/HEIF: heic2any (libheif compiled to JS), native fallback for Safari
 * - TIFF: utif2
 * - ICO: largest contained image
 * - SVG: rasterised via <img> at a chosen scale
 */
import { createCanvas, get2d } from './canvas';
import { extractIcoEntry, parseIco, pickLargestIcoEntry, sniffFormat, type SniffedFormat } from './binary';

export interface DecodeOptions {
  /** Scale factor for SVG rasterisation (1 = intrinsic size). */
  svgScale?: number;
  /** Ensures the longer side of a rasterised SVG is at least this many pixels. */
  svgMinLongSide?: number;
}

export interface DecodedImage {
  canvas: HTMLCanvasElement;
  format: SniffedFormat;
}

const EXT_FORMAT: Record<string, SniffedFormat> = {
  jpg: 'jpeg', jpeg: 'jpeg', jfif: 'jpeg', png: 'png', gif: 'gif', webp: 'webp', bmp: 'bmp',
  ico: 'ico', tif: 'tiff', tiff: 'tiff', heic: 'heic', heif: 'heic', avif: 'avif', svg: 'svg',
  psd: 'psd', pdf: 'pdf', eps: 'eps',
};

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

export function baseNameOf(name: string): string {
  const idx = name.lastIndexOf('.');
  return (idx > 0 ? name.slice(0, idx) : name) || 'bild';
}

/** Detects the real format by magic bytes, falling back to the file extension. */
export async function detectFormat(file: File): Promise<SniffedFormat> {
  const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const sniffed = sniffFormat(head);
  if (sniffed !== 'unknown') return sniffed;
  return EXT_FORMAT[extensionOf(file.name)] || 'unknown';
}

async function drawBitmapToCanvas(bitmap: ImageBitmap): Promise<HTMLCanvasElement> {
  const canvas = createCanvas(bitmap.width, bitmap.height);
  get2d(canvas).drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode-failed'));
    };
    img.src = url;
  });
}

/** Native browser decoding with EXIF orientation applied. */
export async function decodeNative(blob: Blob, formatLabel: string): Promise<HTMLCanvasElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      return await drawBitmapToCanvas(bitmap);
    } catch (err) {
      if (err instanceof Error && /zu groß|Zeichenfläche/.test(err.message)) throw err;
      // fall through to <img> decoding (older Safari, ICO in some engines …)
    }
  }
  try {
    const img = await loadImageElement(blob);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error('decode-failed');
    const canvas = createCanvas(w, h);
    get2d(canvas).drawImage(img, 0, 0);
    return canvas;
  } catch (err) {
    if (err instanceof Error && err.message !== 'decode-failed') throw err;
    throw new Error(
      `Die ${formatLabel}-Datei konnte von Ihrem Browser nicht gelesen werden. Sie ist möglicherweise beschädigt oder verwendet eine nicht unterstützte Variante.`
    );
  }
}

async function decodeHeic(file: File): Promise<HTMLCanvasElement> {
  try {
    const mod = await import('heic2any');
    const heic2any = (mod.default ?? (mod as unknown as typeof mod.default)) as typeof mod.default;
    const result = await heic2any({ blob: file, toType: 'image/png' });
    const png = Array.isArray(result) ? result[0] : result;
    return await decodeNative(png, 'HEIC');
  } catch {
    // Safari (macOS/iOS) can decode HEIC natively
    try {
      return await decodeNative(file, 'HEIC');
    } catch {
      throw new Error(
        'Die HEIC-Datei konnte nicht gelesen werden. Möglicherweise ist sie beschädigt oder nutzt eine nicht unterstützte HEIC-Variante (z. B. 10-Bit-HDR oder Bildsequenz).'
      );
    }
  }
}

async function decodeTiff(file: File): Promise<HTMLCanvasElement> {
  const mod = await import('utif2');
  const UTIF = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
  const buffer = await file.arrayBuffer();
  let ifds;
  try {
    ifds = UTIF.decode(buffer);
  } catch {
    throw new Error('Die TIFF-Datei ist beschädigt oder kein gültiges TIFF.');
  }
  const tag = (ifd: (typeof ifds)[number], name: string) =>
    Number((ifd[name] as number[] | undefined)?.[0] || 0);
  const candidates = ifds.filter((ifd) => tag(ifd, 't256') > 0 && tag(ifd, 't257') > 0);
  if (candidates.length === 0) throw new Error('Die TIFF-Datei enthält kein lesbares Bild.');
  // First full-resolution page (NewSubfileType bit 0 marks reduced-resolution previews).
  const page = candidates.find((ifd) => (tag(ifd, 't254') & 1) === 0) || candidates[0];
  try {
    UTIF.decodeImage(buffer, page);
  } catch {
    throw new Error('Die Kompression dieser TIFF-Datei wird im Browser nicht unterstützt.');
  }
  const rgba = UTIF.toRGBA8(page);
  if (!page.width || !page.height || rgba.length < page.width * page.height * 4) {
    throw new Error('Die TIFF-Datei konnte nicht dekodiert werden (nicht unterstütztes Farbformat).');
  }
  const canvas = createCanvas(page.width, page.height);
  const ctx = get2d(canvas);
  const imageData = ctx.createImageData(page.width, page.height);
  imageData.data.set(rgba.subarray(0, page.width * page.height * 4));
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function decodeIco(file: File): Promise<HTMLCanvasElement> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entry = pickLargestIcoEntry(parseIco(bytes));
  const { mime, data } = extractIcoEntry(bytes, entry);
  return decodeNative(new Blob([data as BlobPart], { type: mime }), 'ICO');
}

/* ---------------------------- SVG ---------------------------------- */

const UNIT_TO_PX: Record<string, number> = {
  '': 1, px: 1, pt: 96 / 72, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96, q: 96 / 101.6,
};

function parseSvgLength(value: string | null): number | null {
  if (!value) return null;
  const m = value.trim().match(/^([0-9]*\.?[0-9]+(?:e[-+]?\d+)?)\s*([a-z%]*)$/i);
  if (!m) return null;
  const unit = m[2].toLowerCase();
  if (unit === '%' || unit === 'em' || unit === 'ex' || !(unit in UNIT_TO_PX)) return null;
  const n = parseFloat(m[1]) * UNIT_TO_PX[unit];
  return n > 0 && Number.isFinite(n) ? n : null;
}

export interface PreparedSvg {
  /** Intrinsic size in CSS pixels */
  width: number;
  height: number;
  /** Serialises the SVG with explicit pixel dimensions */
  serialize: (pixelWidth: number, pixelHeight: number) => string;
}

export function prepareSvg(text: string): PreparedSvg {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Die SVG-Datei ist ungültig oder beschädigt (XML-Fehler).');
  }
  const viewBox = (root.getAttribute('viewBox') || '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const hasViewBox = viewBox.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0;
  let width = parseSvgLength(root.getAttribute('width'));
  let height = parseSvgLength(root.getAttribute('height'));

  if (hasViewBox) {
    const ratio = viewBox[2] / viewBox[3];
    if (width && !height) height = width / ratio;
    else if (height && !width) width = height * ratio;
    else if (!width && !height) {
      width = viewBox[2];
      height = viewBox[3];
    }
  }
  if (!width || !height) {
    width = width || 300;
    height = height || 150;
  }
  if (!hasViewBox) root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const intrinsicW = width;
  const intrinsicH = height;
  return {
    width: intrinsicW,
    height: intrinsicH,
    serialize: (pw, ph) => {
      root.setAttribute('width', String(pw));
      root.setAttribute('height', String(ph));
      return new XMLSerializer().serializeToString(doc);
    },
  };
}

export async function rasterizeSvgText(text: string, options: DecodeOptions = {}): Promise<HTMLCanvasElement> {
  const svg = prepareSvg(text);
  let scale = options.svgScale && options.svgScale > 0 ? options.svgScale : 1;
  if (options.svgMinLongSide) {
    const longSide = Math.max(svg.width, svg.height) * scale;
    if (longSide < options.svgMinLongSide) scale *= options.svgMinLongSide / longSide;
  }
  const pw = Math.max(1, Math.round(svg.width * scale));
  const ph = Math.max(1, Math.round(svg.height * scale));
  const canvas = createCanvas(pw, ph);
  const blob = new Blob([svg.serialize(pw, ph)], { type: 'image/svg+xml' });
  let img: HTMLImageElement;
  try {
    img = await loadImageElement(blob);
  } catch {
    throw new Error('Die SVG-Datei konnte nicht gerendert werden. Bitte prüfen Sie, ob sie gültig ist.');
  }
  const ctx = get2d(canvas);
  ctx.drawImage(img, 0, 0, pw, ph);
  try {
    ctx.getImageData(0, 0, 1, 1); // throws if the browser marked the canvas as tainted
  } catch {
    throw new Error(
      'Die SVG-Datei enthält Inhalte (z. B. foreignObject oder externe Verweise), die Ihr Browser aus Sicherheitsgründen nicht in ein Bild umwandeln darf.'
    );
  }
  return canvas;
}

/* --------------------------- dispatcher ---------------------------- */

const FORMAT_LABEL: Partial<Record<SniffedFormat, string>> = {
  jpeg: 'JPG', png: 'PNG', gif: 'GIF', webp: 'WebP', bmp: 'BMP', avif: 'AVIF',
};

export async function decodeImageFile(file: File, options: DecodeOptions = {}): Promise<DecodedImage> {
  const format = await detectFormat(file);
  switch (format) {
    case 'heic':
      return { canvas: await decodeHeic(file), format };
    case 'tiff':
      return { canvas: await decodeTiff(file), format };
    case 'ico':
      return { canvas: await decodeIco(file), format };
    case 'svg':
      return { canvas: await rasterizeSvgText(await file.text(), options), format };
    case 'psd':
      throw new Error('PSD-Dateien bitte mit dem Werkzeug „PSD umwandeln“ konvertieren.');
    case 'pdf':
      throw new Error('Dies ist eine PDF-Datei und kein Bild.');
    case 'eps':
      throw new Error('EPS-Dateien können im Browser nicht gelesen werden.');
    case 'avif': {
      try {
        return { canvas: await decodeNative(file, 'AVIF'), format };
      } catch {
        throw new Error(
          'Ihr Browser kann AVIF-Bilder nicht dekodieren. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge, Firefox oder Safari (ab 16.4).'
        );
      }
    }
    default:
      return { canvas: await decodeNative(file, FORMAT_LABEL[format] || 'Bild'), format };
  }
}
