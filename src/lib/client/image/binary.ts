/**
 * Small, dependency-free binary encoders/parsers used by the browser image tools.
 * Kept free of DOM APIs and imports so they can be unit-tested in Node.
 */

/* ------------------------------------------------------------------ */
/* BMP                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Encodes RGBA pixels as an uncompressed 24-bit BMP (BITMAPINFOHEADER, bottom-up).
 * Alpha is ignored – callers must flatten transparency onto a background first.
 */
export function encodeBmp24(rgba: Uint8Array | Uint8ClampedArray, width: number, height: number): Uint8Array {
  if (rgba.length < width * height * 4) throw new Error('BMP: Pixeldaten unvollständig.');
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const headerSize = 14 + 40;
  const fileSize = headerSize + pixelBytes;
  const out = new Uint8Array(fileSize);
  const dv = new DataView(out.buffer);

  // BITMAPFILEHEADER
  out[0] = 0x42; // B
  out[1] = 0x4d; // M
  dv.setUint32(2, fileSize, true);
  dv.setUint32(6, 0, true);
  dv.setUint32(10, headerSize, true);

  // BITMAPINFOHEADER
  dv.setUint32(14, 40, true);
  dv.setInt32(18, width, true);
  dv.setInt32(22, height, true); // positive = bottom-up
  dv.setUint16(26, 1, true); // planes
  dv.setUint16(28, 24, true); // bits per pixel
  dv.setUint32(30, 0, true); // BI_RGB
  dv.setUint32(34, pixelBytes, true);
  dv.setInt32(38, 3780, true); // 96 DPI in px/m
  dv.setInt32(42, 3780, true);
  dv.setUint32(46, 0, true);
  dv.setUint32(50, 0, true);

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    let dst = headerSize + y * rowSize;
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * 4;
      out[dst++] = rgba[s + 2];
      out[dst++] = rgba[s + 1];
      out[dst++] = rgba[s];
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* ICO                                                                 */
/* ------------------------------------------------------------------ */

export interface IcoPngImage {
  width: number;
  height: number;
  /** PNG-encoded image bytes */
  png: Uint8Array;
}

/** Builds a Windows ICO container with PNG-compressed entries (supported since Windows Vista). */
export function encodeIco(images: IcoPngImage[]): Uint8Array {
  if (images.length === 0) throw new Error('ICO: keine Bildgrößen ausgewählt.');
  if (images.length > 0xffff) throw new Error('ICO: zu viele Bilder.');
  const sorted = [...images].sort((a, b) => a.width - b.width);
  const dirSize = 6 + 16 * sorted.length;
  const total = dirSize + sorted.reduce((acc, img) => acc + img.png.length, 0);
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);

  dv.setUint16(0, 0, true); // reserved
  dv.setUint16(2, 1, true); // type 1 = icon
  dv.setUint16(4, sorted.length, true);

  let offset = dirSize;
  sorted.forEach((img, i) => {
    if (img.width < 1 || img.height < 1 || img.width > 256 || img.height > 256) {
      throw new Error('ICO: Bildgröße muss zwischen 1 und 256 Pixeln liegen.');
    }
    const e = 6 + i * 16;
    out[e] = img.width === 256 ? 0 : img.width;
    out[e + 1] = img.height === 256 ? 0 : img.height;
    out[e + 2] = 0; // palette colours
    out[e + 3] = 0; // reserved
    dv.setUint16(e + 4, 1, true); // colour planes
    dv.setUint16(e + 6, 32, true); // bits per pixel
    dv.setUint32(e + 8, img.png.length, true);
    dv.setUint32(e + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.length;
  });
  return out;
}

export interface IcoEntry {
  width: number;
  height: number;
  bitCount: number;
  size: number;
  offset: number;
  isPng: boolean;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function parseIco(bytes: Uint8Array): IcoEntry[] {
  if (bytes.length < 6) throw new Error('ICO-Datei ist zu klein oder beschädigt.');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const type = dv.getUint16(2, true);
  const count = dv.getUint16(4, true);
  if (dv.getUint16(0, true) !== 0 || (type !== 1 && type !== 2) || count === 0) {
    throw new Error('Keine gültige ICO-Datei.');
  }
  const entries: IcoEntry[] = [];
  for (let i = 0; i < count; i++) {
    const e = 6 + i * 16;
    if (e + 16 > bytes.length) break;
    const size = dv.getUint32(e + 8, true);
    const offset = dv.getUint32(e + 12, true);
    if (offset + size > bytes.length || size === 0) continue;
    const isPng = PNG_SIGNATURE.every((b, k) => bytes[offset + k] === b);
    entries.push({
      width: bytes[e] || 256,
      height: bytes[e + 1] || 256,
      bitCount: dv.getUint16(e + 6, true),
      size,
      offset,
      isPng,
    });
  }
  if (entries.length === 0) throw new Error('Die ICO-Datei enthält keine lesbaren Bilder.');
  return entries;
}

/** Picks the largest / highest colour-depth image of an icon. */
export function pickLargestIcoEntry(entries: IcoEntry[]): IcoEntry {
  return [...entries].sort((a, b) => b.width * b.height - a.width * a.height || b.bitCount - a.bitCount)[0];
}

/**
 * Returns a decodable blob payload for one icon entry: either the raw PNG bytes,
 * or a single-entry ICO file (BMP/DIB entries) that browsers decode natively.
 */
export function extractIcoEntry(bytes: Uint8Array, entry: IcoEntry): { mime: string; data: Uint8Array } {
  const payload = bytes.subarray(entry.offset, entry.offset + entry.size);
  if (entry.isPng) return { mime: 'image/png', data: payload.slice() };
  const out = new Uint8Array(6 + 16 + payload.length);
  const dv = new DataView(out.buffer);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, 1, true);
  out[6] = entry.width === 256 ? 0 : entry.width;
  out[7] = entry.height === 256 ? 0 : entry.height;
  dv.setUint16(6 + 4, 1, true);
  dv.setUint16(6 + 6, entry.bitCount, true);
  dv.setUint32(6 + 8, payload.length, true);
  dv.setUint32(6 + 12, 22, true);
  out.set(payload, 22);
  return { mime: 'image/x-icon', data: out };
}

/* ------------------------------------------------------------------ */
/* JPEG EXIF orientation                                               */
/* ------------------------------------------------------------------ */

/** Returns the EXIF orientation (1–8) of a JPEG, or 1 when absent/unreadable. */
export function getJpegOrientation(bytes: Uint8Array): number {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) return 1;
    const marker = bytes[pos + 1];
    if (marker === 0xd9 || marker === 0xda) return 1; // EOI / start of scan
    const segLen = dv.getUint16(pos + 2);
    if (segLen < 2) return 1;
    if (marker === 0xe1 && pos + 10 <= bytes.length) {
      const isExif =
        bytes[pos + 4] === 0x45 && bytes[pos + 5] === 0x78 && bytes[pos + 6] === 0x69 &&
        bytes[pos + 7] === 0x66 && bytes[pos + 8] === 0 && bytes[pos + 9] === 0;
      if (isExif) {
        const tiff = pos + 10;
        if (tiff + 8 > bytes.length) return 1;
        const little = bytes[tiff] === 0x49;
        const ifdOffset = dv.getUint32(tiff + 4, little);
        const ifd = tiff + ifdOffset;
        if (ifd + 2 > bytes.length) return 1;
        const count = dv.getUint16(ifd, little);
        for (let i = 0; i < count; i++) {
          const entry = ifd + 2 + i * 12;
          if (entry + 12 > bytes.length) return 1;
          if (dv.getUint16(entry, little) === 0x0112) {
            const value = dv.getUint16(entry + 8, little);
            return value >= 1 && value <= 8 ? value : 1;
          }
        }
        return 1;
      }
    }
    pos += 2 + segLen;
  }
  return 1;
}

/* ------------------------------------------------------------------ */
/* Format sniffing                                                     */
/* ------------------------------------------------------------------ */

export type SniffedFormat =
  | 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'ico' | 'tiff' | 'heic' | 'avif'
  | 'psd' | 'pdf' | 'svg' | 'eps' | 'unknown';

/** Detects a file format from its leading bytes (first 64 bytes are plenty). */
export function sniffFormat(head: Uint8Array): SniffedFormat {
  const b = head;
  const ascii = (start: number, len: number) =>
    String.fromCharCode(...Array.from(b.subarray(start, start + len)));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && PNG_SIGNATURE.every((v, i) => b[i] === v)) return 'png';
  if (ascii(0, 4) === 'GIF8') return 'gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'webp';
  if (ascii(0, 2) === 'BM') return 'bmp';
  if (b.length >= 4 && b[0] === 0 && b[1] === 0 && (b[2] === 1 || b[2] === 2) && b[3] === 0) return 'ico';
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0 && b[3] === 0x2a)) return 'tiff';
  if (ascii(0, 4) === '8BPS') return 'psd';
  if (ascii(0, 5) === '%PDF-') return 'pdf';
  if (ascii(0, 4) === '%!PS' || (b[0] === 0xc5 && b[1] === 0xd0 && b[2] === 0xd3 && b[3] === 0xc6)) return 'eps';
  if (ascii(4, 4) === 'ftyp') {
    const brand = ascii(8, 4);
    if (brand === 'avif' || brand === 'avis') return 'avif';
    if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'].includes(brand)) {
      // mif1 can also be AVIF – look for an avif compatible brand
      return ascii(8, 32).includes('avif') ? 'avif' : 'heic';
    }
  }
  const text = ascii(0, Math.min(b.length, 64)).replace(/^﻿/, '').trimStart();
  if (text.startsWith('<?xml') || text.startsWith('<svg') || text.startsWith('<!--') || text.startsWith('<!DOCTYPE svg')) return 'svg';
  return 'unknown';
}
