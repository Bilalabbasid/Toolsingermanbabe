/**
 * Web Worker that runs 7-Zip (7z-wasm) off the main thread.
 *
 * The 7z-wasm JS glue is loaded at runtime from /vendor (classic script via
 * importScripts) instead of being bundled: its ES build contains a Node-only
 * `import("module")` that webpack cannot resolve for the browser.
 */
import { sevenZipExtract, SevenZipError, type SevenZipFactoryLike } from './sevenZipCore';

export interface SevenZipWorkerRequest {
  type: 'extract';
  file: File;
  scriptUrl: string;
  wasmUrl: string;
  maxBytes: number;
  maxEntries: number;
}

export type SevenZipWorkerResponse =
  | { type: 'progress'; value: number }
  | { type: 'done'; entries: { path: string; size: number; data: Uint8Array }[] }
  | { type: 'error'; message: string; code?: string };

interface WorkerScope {
  onmessage: ((event: MessageEvent<SevenZipWorkerRequest>) => void) | null;
  postMessage(message: SevenZipWorkerResponse, transfer?: Transferable[]): void;
  importScripts(...urls: string[]): void;
  SevenZip?: SevenZipFactoryLike;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = async (event: MessageEvent<SevenZipWorkerRequest>) => {
  const req = event.data;
  if (!req || req.type !== 'extract') return;
  try {
    if (!ctx.SevenZip) {
      try {
        ctx.importScripts(req.scriptUrl);
      } catch {
        throw new SevenZipError(
          'Das 7-Zip-Modul konnte nicht geladen werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
          'unsupported'
        );
      }
    }
    const factory = ctx.SevenZip;
    if (typeof factory !== 'function') {
      throw new SevenZipError('Das 7-Zip-Modul konnte nicht initialisiert werden.', 'unsupported');
    }
    let lastReported = -1;
    const entries = await sevenZipExtract({
      factory,
      moduleOptions: {
        locateFile: (path: string) => (path.endsWith('.wasm') ? req.wasmUrl : path),
      },
      input: { name: req.file.name, file: req.file },
      maxBytes: req.maxBytes,
      maxEntries: req.maxEntries,
      onProgress: (value) => {
        const pct = Math.round(value * 100);
        if (pct !== lastReported) {
          lastReported = pct;
          ctx.postMessage({ type: 'progress', value } satisfies SevenZipWorkerResponse);
        }
      },
    });
    const transfer = Array.from(new Set(entries.map((e) => e.data.buffer as ArrayBuffer)));
    ctx.postMessage({ type: 'done', entries } satisfies SevenZipWorkerResponse, transfer);
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : 'Beim Entpacken mit 7-Zip ist ein unerwarteter Fehler aufgetreten (möglicherweise zu wenig Arbeitsspeicher).';
    ctx.postMessage({
      type: 'error',
      message,
      code: err instanceof SevenZipError ? err.code : undefined,
    } satisfies SevenZipWorkerResponse);
  }
};
