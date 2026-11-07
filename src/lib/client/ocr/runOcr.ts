/**
 * Orchestrates the browser OCR: page rasterisation → Tesseract → output file.
 */
import { buildDocx, buildSearchablePdf, buildTxt, pageToPlainText } from './outputs';
import { canvasToJpeg, openPageSource, releaseCanvas, OCR_MAX_PAGES } from './pages';
import { getOcrWorker, toOcrStructure } from './tesseract';
import type { OcrLanguage, OcrOutputType, OcrPageResult } from './types';

export interface OcrProgress {
  /** 0..1 over the whole job. */
  fraction: number;
  text: string;
}

export interface OcrRunOptions {
  language: OcrLanguage;
  outputType: OcrOutputType;
  onProgress?: (p: OcrProgress) => void;
  isCancelled?: () => boolean;
}

export interface OcrRunResult {
  blob: Blob;
  fileName: string;
  /** Recognised plain text (for preview / copy). */
  text: string;
  pageCount: number;
  /** Pages that were skipped because of the page limit. */
  skippedPages: number;
  meanConfidence: number;
}

export class OcrCancelledError extends Error {
  constructor() {
    super('Die Texterkennung wurde abgebrochen.');
    this.name = 'OcrCancelledError';
  }
}

function baseName(name: string): string {
  return (name.replace(/\.[^.]+$/, '') || 'dokument').replace(/[\\/:*?"<>|]+/g, '_');
}

const STATUS_DE: Record<string, string> = {
  'loading tesseract core': 'OCR-Engine wird geladen',
  'initializing tesseract': 'OCR-Engine wird initialisiert',
  'initialized tesseract': 'OCR-Engine bereit',
  'loading language traineddata': 'Sprachdaten werden geladen',
  'loaded language traineddata': 'Sprachdaten geladen',
  'initializing api': 'Texterkennung wird vorbereitet',
  'initialized api': 'Texterkennung bereit',
  'recognizing text': 'Text wird erkannt',
};

export async function runOcr(file: File, options: OcrRunOptions): Promise<OcrRunResult> {
  const report = options.onProgress ?? (() => undefined);
  const checkCancel = () => {
    if (options.isCancelled?.()) throw new OcrCancelledError();
  };

  report({ fraction: 0.01, text: 'Datei wird gelesen …' });
  const source = await openPageSource(file);
  try {
    const total = Math.min(source.pageCount, OCR_MAX_PAGES);
    const skipped = source.pageCount - total;
    if (total === 0) throw new Error('Das Dokument enthält keine Seiten.');

    // Progress budget: 5 % engine start, 88 % pages, 7 % export.
    let pageIndex = 0;
    let stage = 'loading';
    const pageShare = 0.88 / total;
    const worker = await getOcrWorker(options.language, (m) => {
      const label = STATUS_DE[m.status] ?? 'Texterkennung läuft';
      if (stage === 'loading') {
        report({ fraction: 0.01 + 0.04 * (m.progress || 0), text: `${label} …` });
      } else if (m.status === 'recognizing text') {
        const pct = Math.round((m.progress || 0) * 100);
        report({
          fraction: 0.05 + pageShare * (pageIndex + 0.3 + 0.7 * (m.progress || 0)),
          text: total > 1 ? `Seite ${pageIndex + 1} von ${total}: Text wird erkannt … ${pct} %` : `Text wird erkannt … ${pct} %`,
        });
      }
    });
    checkCancel();
    stage = 'pages';
    await worker.setParameters({ preserve_interword_spaces: '1' });

    const results: OcrPageResult[] = [];
    for (pageIndex = 0; pageIndex < total; pageIndex++) {
      checkCancel();
      report({
        fraction: 0.05 + pageShare * pageIndex,
        text: total > 1 ? `Seite ${pageIndex + 1} von ${total} wird vorbereitet …` : 'Seite wird vorbereitet …',
      });
      const page = await source.render(pageIndex);
      try {
        const { data } = await worker.recognize(page.canvas, {}, { text: true, blocks: true });
        checkCancel();
        const structure = toOcrStructure(data);
        const jpeg = options.outputType === 'pdf' ? await canvasToJpeg(page.canvas) : undefined;
        results.push({
          index: pageIndex,
          widthPx: page.canvas.width,
          heightPx: page.canvas.height,
          pageWidthPt: page.pageWidthPt,
          pageHeightPt: page.pageHeightPt,
          jpeg,
          ...structure,
        });
      } finally {
        releaseCanvas(page.canvas);
      }
    }

    checkCancel();
    report({ fraction: 0.94, text: 'Ausgabedatei wird erstellt …' });
    const name = baseName(file.name);
    const plain = results.length === 1 ? pageToPlainText(results[0]) : buildTxt(results);
    let blob: Blob;
    let fileName: string;
    if (options.outputType === 'pdf') {
      const bytes = await buildSearchablePdf(results, { title: name });
      blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      fileName = `${name}_durchsuchbar.pdf`;
    } else if (options.outputType === 'docx') {
      blob = await buildDocx(results, { title: name });
      fileName = `${name}_ocr.docx`;
    } else {
      blob = new Blob([buildTxt(results)], { type: 'text/plain;charset=utf-8' });
      fileName = `${name}_ocr.txt`;
    }
    report({ fraction: 1, text: 'Fertig' });

    const confidences = results.filter((r) => r.paragraphs.length > 0).map((r) => r.confidence);
    return {
      blob,
      fileName,
      text: plain,
      pageCount: results.length,
      skippedPages: skipped,
      meanConfidence: confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0,
    };
  } finally {
    source.close();
  }
}
