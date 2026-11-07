/**
 * Lazily loads ffmpeg.wasm (single-thread core, self-hosted under
 * /vendor/ffmpeg) and caches the instance for the lifetime of the page.
 *
 * The ~31 MB core is only downloaded when the user actually starts a
 * conversion; download progress is reported so the UI can show it.
 */
import type { FFmpeg } from '@ffmpeg/ffmpeg';

export const FFMPEG_CORE_JS_PATH = '/vendor/ffmpeg/ffmpeg-core.js';
export const FFMPEG_CORE_WASM_PATH = '/vendor/ffmpeg/ffmpeg-core.wasm';
/** Used as progress denominator when the server sends no Content-Length (compressed transfer). */
const APPROX_WASM_BYTES = 32_200_000;

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;
const downloadListeners = new Set<(fraction: number) => void>();

async function fetchWithProgress(url: string, onProgress: (fraction: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const encoded = res.headers.get('content-encoding');
  const lengthHeader = Number(res.headers.get('content-length') || 0);
  // With gzip/br, Content-Length is the compressed size → use our estimate instead.
  const total = lengthHeader > 0 && (!encoded || encoded === 'identity') ? lengthHeader : APPROX_WASM_BYTES;
  if (!res.body) {
    const buf = await res.arrayBuffer();
    onProgress(1);
    return buf;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(0.99, received / total));
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  onProgress(1);
  return out.buffer;
}

export function isFFmpegLoaded(): boolean {
  return instance !== null;
}

/**
 * Returns the shared FFmpeg instance, loading it on first use.
 * @param onDownloadProgress 0..1 while the WASM core is downloaded.
 */
export function getFFmpeg(onDownloadProgress?: (fraction: number) => void): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance);
  if (onDownloadProgress) downloadListeners.add(onDownloadProgress);
  if (loading) return loading;

  loading = (async () => {
    if (typeof WebAssembly !== 'object') {
      throw new Error('Ihr Browser unterstützt kein WebAssembly. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge, Firefox oder Safari.');
    }
    const { FFmpeg: FFmpegClass } = await import('@ffmpeg/ffmpeg');
    const origin = window.location.origin;
    const coreURL = new URL(FFMPEG_CORE_JS_PATH, origin).href;
    let wasmBuffer: ArrayBuffer;
    try {
      wasmBuffer = await fetchWithProgress(new URL(FFMPEG_CORE_WASM_PATH, origin).href, (f) =>
        downloadListeners.forEach((cb) => cb(f))
      );
    } catch {
      throw new Error('Die Konvertierungs-Engine (FFmpeg) konnte nicht geladen werden. Bitte prüfen Sie Ihre Internetverbindung und laden Sie die Seite neu.');
    }
    const wasmURL = URL.createObjectURL(new Blob([wasmBuffer], { type: 'application/wasm' }));
    const ffmpeg = new FFmpegClass();
    try {
      await ffmpeg.load({ coreURL, wasmURL });
    } catch (err) {
      ffmpeg.terminate();
      console.error('[ffmpeg] load failed', err);
      throw new Error('Die Konvertierungs-Engine (FFmpeg) konnte im Browser nicht gestartet werden. Bitte verwenden Sie eine aktuelle Browser-Version.');
    } finally {
      URL.revokeObjectURL(wasmURL);
    }
    instance = ffmpeg;
    return ffmpeg;
  })();

  loading
    .catch(() => undefined)
    .finally(() => {
      loading = null;
      downloadListeners.clear();
    });
  return loading;
}

/** Terminates the worker (used for "Abbrechen" and after crashes); the next call reloads it. */
export function resetFFmpeg(): void {
  if (instance) {
    try {
      instance.terminate();
    } catch {
      /* ignore */
    }
  }
  instance = null;
}
