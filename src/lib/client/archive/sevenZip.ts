/**
 * Main-thread wrapper around the 7-Zip worker. Every call spawns a fresh
 * worker and terminates it afterwards, so all memory is released.
 */
import type { SevenZipWorkerRequest, SevenZipWorkerResponse } from './sevenZip.worker';
import type { ExtractedEntry } from './safety';

/** Paths of the self-hosted 7-Zip runtime (see scripts/copy-wasm-assets.mjs). */
export const SEVEN_ZIP_SCRIPT_PATH = '/vendor/7z/7zz.umd.js';
export const SEVEN_ZIP_WASM_PATH = '/vendor/7z/7zz.wasm';

export interface SevenZipRunOptions {
  maxBytes: number;
  maxEntries: number;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export function extractWithSevenZip(file: File, options: SevenZipRunOptions): Promise<ExtractedEntry[]> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./sevenZip.worker.ts', import.meta.url));
    } catch {
      reject(new Error('Ihr Browser konnte den Entpack-Worker nicht starten.'));
      return;
    }
    const cleanup = () => {
      worker.terminate();
      options.signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Abgebrochen', 'AbortError'));
    };
    options.signal?.addEventListener('abort', onAbort, { once: true });

    worker.onmessage = (event: MessageEvent<SevenZipWorkerResponse>) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        options.onProgress?.(msg.value);
      } else if (msg.type === 'done') {
        cleanup();
        resolve(msg.entries);
      } else if (msg.type === 'error') {
        cleanup();
        reject(new Error(msg.message));
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      cleanup();
      reject(
        new Error(
          'Der 7-Zip-Worker ist abgestürzt – vermutlich reicht der Arbeitsspeicher des Browsers für dieses Archiv nicht aus.'
        )
      );
    };

    const origin = window.location.origin;
    const request: SevenZipWorkerRequest = {
      type: 'extract',
      file,
      scriptUrl: new URL(SEVEN_ZIP_SCRIPT_PATH, origin).href,
      wasmUrl: new URL(SEVEN_ZIP_WASM_PATH, origin).href,
      maxBytes: options.maxBytes,
      maxEntries: options.maxEntries,
    };
    worker.postMessage(request);
  });
}
