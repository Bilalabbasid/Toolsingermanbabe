/**
 * Canvas helpers for browser-side image conversion.
 */

/** Rough upper bound most desktop browsers accept for a single canvas. */
const MAX_CANVAS_PIXELS = 16384 * 16384;
const MAX_CANVAS_SIDE = 32767;

export function assertCanvasSize(width: number, height: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error('Das Bild hat ungültige Abmessungen.');
  }
  if (width > MAX_CANVAS_SIDE || height > MAX_CANVAS_SIDE || width * height > MAX_CANVAS_PIXELS) {
    throw new Error(
      `Das Bild ist mit ${width} × ${height} Pixeln zu groß für die Verarbeitung im Browser.`
    );
  }
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  assertCanvasSize(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

export function get2d(canvas: HTMLCanvasElement, willReadFrequently = false): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { willReadFrequently });
  if (!ctx) {
    throw new Error(
      `Ihr Browser konnte keine Zeichenfläche mit ${canvas.width} × ${canvas.height} Pixeln anlegen (zu wenig Speicher). Bitte ein kleineres Bild verwenden.`
    );
  }
  return ctx;
}

export function getImageData(canvas: HTMLCanvasElement): ImageData {
  return get2d(canvas, true).getImageData(0, 0, canvas.width, canvas.height);
}

export function hasTransparency(data: ImageData): boolean {
  const px = data.data;
  for (let i = 3; i < px.length; i += 4) {
    if (px[i] < 255) return true;
  }
  return false;
}

/** Returns a copy of the canvas with transparent areas filled with the given colour. */
export function flattenCanvas(source: HTMLCanvasElement, background: string): HTMLCanvasElement {
  const out = createCanvas(source.width, source.height);
  const ctx = get2d(out);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, 0, 0);
  return out;
}

/**
 * High-quality resize. Large downscales are done in halving steps, which avoids
 * the aliasing of a single drawImage call.
 */
export function resizeCanvas(source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  const targetW = Math.max(1, Math.round(width));
  const targetH = Math.max(1, Math.round(height));
  let current = source;
  while (current.width / 2 >= targetW && current.height / 2 >= targetH) {
    const step = createCanvas(Math.round(current.width / 2), Math.round(current.height / 2));
    const sctx = get2d(step);
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(current, 0, 0, step.width, step.height);
    current = step;
  }
  const out = createCanvas(targetW, targetH);
  const ctx = get2d(out);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(current, 0, 0, targetW, targetH);
  return out;
}

/** Fits the canvas into a square of `size` pixels (centred, transparent padding). */
export function fitIntoSquare(source: HTMLCanvasElement, size: number): HTMLCanvasElement {
  const scale = Math.min(size / source.width, size / source.height);
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const resized = w === source.width && h === source.height ? source : resizeCanvas(source, w, h);
  if (w === size && h === size) return resized;
  const out = createCanvas(size, size);
  get2d(out).drawImage(resized, Math.floor((size - w) / 2), Math.floor((size - h) / 2));
  return out;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error('Der Browser konnte das Bild nicht erzeugen (evtl. zu groß oder zu wenig Arbeitsspeicher).')
          );
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

const MIME_LABEL: Record<string, string> = {
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
};

/**
 * Like canvasToBlob, but verifies the browser really produced the requested type.
 * (Browsers silently fall back to PNG for encoders they do not implement.)
 */
export async function canvasToBlobStrict(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  const blob = await canvasToBlob(canvas, mime, quality);
  if (blob.type !== mime) {
    const label = MIME_LABEL[mime] || mime;
    throw new Error(
      `Ihr Browser kann keine ${label}-Dateien erzeugen. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge oder Firefox.`
    );
  }
  return blob;
}

const encoderSupportCache = new Map<string, boolean>();

/** Feature-detects whether canvas.toBlob can encode the given MIME type. */
export async function canEncode(mime: string): Promise<boolean> {
  const cached = encoderSupportCache.get(mime);
  if (cached !== undefined) return cached;
  let supported = false;
  try {
    const c = document.createElement('canvas');
    c.width = 2;
    c.height = 2;
    const blob = await canvasToBlob(c, mime, 0.8);
    supported = blob.type === mime;
  } catch {
    supported = false;
  }
  encoderSupportCache.set(mime, supported);
  return supported;
}

export async function blobToUint8(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/** Lets React paint progress updates before a long synchronous step. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 16));
}
