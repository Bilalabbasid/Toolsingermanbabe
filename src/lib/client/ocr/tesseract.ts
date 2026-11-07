/**
 * Self-hosted Tesseract.js (v7) worker management. Worker script, WASM cores
 * and the uncompressed German/English LSTM models are served from /vendor
 * (see scripts/copy-wasm-assets.mjs) – no CDN, no backend.
 */
import type { Worker as TesseractWorker, LoggerMessage, Page } from 'tesseract.js';
import type { OcrLanguage, OcrLine, OcrPageResult, OcrParagraph } from './types';

export const TESSERACT_PATHS = {
  workerPath: '/vendor/tesseract/worker.min.js',
  corePath: '/vendor/tesseract/core',
  langPath: '/vendor/tessdata',
} as const;

export type OcrLogger = (message: LoggerMessage) => void;

let workerPromise: Promise<TesseractWorker> | null = null;
let workerLanguage: OcrLanguage | null = null;
let activeLogger: OcrLogger | null = null;

function absolute(path: string): string {
  return new URL(path, window.location.origin).href;
}

async function createOcrWorker(language: OcrLanguage): Promise<TesseractWorker> {
  const { createWorker, OEM } = await import('tesseract.js');
  return createWorker(language, OEM.LSTM_ONLY, {
    workerPath: absolute(TESSERACT_PATHS.workerPath),
    corePath: absolute(TESSERACT_PATHS.corePath),
    langPath: absolute(TESSERACT_PATHS.langPath),
    gzip: false,
    // Load the worker script directly from our origin (no blob: importScripts wrapper).
    workerBlobURL: false,
    // Models come from our own origin with HTTP caching; avoid stale IndexedDB copies.
    cacheMethod: 'none',
    logger: (m: LoggerMessage) => activeLogger?.(m),
    errorHandler: (err: unknown) => console.error('[tesseract]', err),
  });
}

/** Returns a cached worker initialised for the requested language(s). */
export async function getOcrWorker(language: OcrLanguage, logger?: OcrLogger): Promise<TesseractWorker> {
  activeLogger = logger ?? null;
  if (!workerPromise) {
    workerLanguage = language;
    workerPromise = createOcrWorker(language).catch((err) => {
      workerPromise = null;
      workerLanguage = null;
      console.error('[tesseract] init failed', err);
      throw new Error(
        'Die Texterkennung konnte nicht gestartet werden (Sprachdaten oder OCR-Engine nicht ladbar). Bitte laden Sie die Seite neu.'
      );
    });
    return workerPromise;
  }
  const worker = await workerPromise;
  if (workerLanguage !== language) {
    await worker.reinitialize(language);
    workerLanguage = language;
  }
  return worker;
}

export async function terminateOcrWorker(): Promise<void> {
  const p = workerPromise;
  workerPromise = null;
  workerLanguage = null;
  if (p) {
    try {
      await (await p).terminate();
    } catch {
      /* ignore */
    }
  }
}

/** Converts Tesseract's block tree into our compact page structure. */
export function toOcrStructure(data: Page): Pick<OcrPageResult, 'text' | 'paragraphs' | 'confidence'> {
  const paragraphs: OcrParagraph[] = [];
  for (const block of data.blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      const lines: OcrLine[] = [];
      for (const line of para.lines ?? []) {
        const words = (line.words ?? [])
          .filter((w) => w.text && w.text.trim())
          .map((w) => ({
            text: w.text,
            confidence: w.confidence,
            x0: w.bbox.x0,
            y0: w.bbox.y0,
            x1: w.bbox.x1,
            y1: w.bbox.y1,
          }));
        if (words.length === 0) continue;
        lines.push({
          words,
          x0: line.bbox.x0,
          y0: line.bbox.y0,
          x1: line.bbox.x1,
          y1: line.bbox.y1,
          baseline: line.baseline
            ? { x0: line.baseline.x0, y0: line.baseline.y0, x1: line.baseline.x1, y1: line.baseline.y1 }
            : undefined,
        });
      }
      if (lines.length > 0) paragraphs.push({ lines });
    }
  }
  return { text: data.text ?? '', paragraphs, confidence: data.confidence ?? 0 };
}
