/**
 * Image helpers: format sniffing, pixel-size detection and (browser only)
 * transcoding of formats that pdf-lib / docx cannot embed directly.
 */

export type ImageKind = 'png' | 'jpg' | 'gif' | 'bmp' | 'webp' | 'tiff' | 'svg' | 'emf' | 'wmf' | 'unknown';

export function sniffImage(data: Uint8Array): ImageKind {
  if (data.length < 4) return 'unknown';
  const b = data;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
  if (b[0] === 0x42 && b[1] === 0x4d) return 'bmp';
  if (
    b.length > 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return 'webp';
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a) || (b[0] === 0x4d && b[1] === 0x4d && b[3] === 0x2a)) return 'tiff';
  if (b.length > 44 && b[0] === 0x01 && b[1] === 0 && b[2] === 0 && b[3] === 0 && b[40] === 0x20 && b[41] === 0x45 && b[42] === 0x4d && b[43] === 0x46) return 'emf';
  if ((b[0] === 0xd7 && b[1] === 0xcd && b[2] === 0xc6 && b[3] === 0x9a) || (b[0] === 0x01 && b[1] === 0x00 && b[2] === 0x09 && b[3] === 0x00)) return 'wmf';
  const head = new TextDecoder('utf-8', { fatal: false }).decode(b.subarray(0, Math.min(512, b.length)));
  if (/<svg[\s>]/i.test(head) || (/^\s*<\?xml/.test(head) && /<svg/i.test(head))) return 'svg';
  return 'unknown';
}

export function mimeForKind(kind: ImageKind): string {
  switch (kind) {
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'bmp': return 'image/bmp';
    case 'webp': return 'image/webp';
    case 'tiff': return 'image/tiff';
    case 'svg': return 'image/svg+xml';
    case 'emf': return 'image/emf';
    case 'wmf': return 'image/wmf';
    default: return 'application/octet-stream';
  }
}

/** Pixel dimensions for PNG, JPEG, GIF and BMP (null if unknown). */
export function imagePixelSize(data: Uint8Array): { width: number; height: number } | null {
  const kind = sniffImage(data);
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  try {
    if (kind === 'png' && data.length >= 24) {
      return { width: dv.getUint32(16), height: dv.getUint32(20) };
    }
    if (kind === 'gif' && data.length >= 10) {
      return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
    }
    if (kind === 'bmp' && data.length >= 26) {
      return { width: Math.abs(dv.getInt32(18, true)), height: Math.abs(dv.getInt32(22, true)) };
    }
    if (kind === 'jpg') {
      let off = 2;
      while (off + 9 < data.length) {
        if (data[off] !== 0xff) {
          off++;
          continue;
        }
        const marker = data[off + 1];
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          off += 2;
          continue;
        }
        const len = dv.getUint16(off + 2);
        if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
          return { height: dv.getUint16(off + 5), width: dv.getUint16(off + 7) };
        }
        off += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Converts an image to PNG/JPEG bytes. Returns null when the format cannot be
 * converted (e.g. EMF/WMF vector graphics).
 */
export type ImageTranscoder = (
  data: Uint8Array,
  kind: ImageKind
) => Promise<{ data: Uint8Array; kind: 'png' | 'jpg' } | null>;

/** Browser implementation using createImageBitmap / <img> + canvas. */
export const browserImageTranscoder: ImageTranscoder = async (data, kind) => {
  if (typeof document === 'undefined') return null;
  if (kind === 'emf' || kind === 'wmf' || kind === 'unknown') return null;
  const blob = new Blob([data as BlobPart], { type: mimeForKind(kind) });
  let width = 0;
  let height = 0;
  let source: CanvasImageSource | null = null;
  try {
    if (kind !== 'svg' && typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(blob);
      source = bmp;
      width = bmp.width;
      height = bmp.height;
    }
  } catch {
    source = null;
  }
  if (!source) {
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('image decode failed'));
        el.src = url;
      });
      source = img;
      width = img.naturalWidth || 800;
      height = img.naturalHeight || 600;
    } catch {
      return null;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (!width || !height) return null;
  // Limit huge images to keep the output small
  const scale = Math.min(1, 2400 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!out) return null;
  return { data: new Uint8Array(await out.arrayBuffer()), kind: 'png' };
};

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/=_-]/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') {
    const bin = atob(clean);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(clean, 'base64'));
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/** Parses `data:` URIs. Returns null for anything else. */
export function parseDataUri(uri: string): { data: Uint8Array; mime: string } | null {
  const m = /^data:([^;,]*)((?:;[^;,]*)*?)(;base64)?,([\s\S]*)$/i.exec(uri.trim());
  if (!m) return null;
  const mime = m[1] || 'application/octet-stream';
  try {
    if (m[3]) return { data: base64ToBytes(m[4]), mime };
    return { data: new TextEncoder().encode(decodeURIComponent(m[4])), mime };
  } catch {
    return null;
  }
}
