/**
 * Browser-only: reads PDF pages with pdf.js (text items with positions and
 * font styles) and renders page images on a canvas.
 */
import { getClientPdfJs } from '@/lib/pdfjsClient';
import { ConversionError, checkAbort, yieldToUi } from './model';
import type { PdfPageText, PdfTextItem } from './pdfText';

type PdfJs = Awaited<ReturnType<typeof getClientPdfJs>>;
type PdfDoc = Awaited<ReturnType<PdfJs['getDocument']>['promise']>;
type PdfPage = Awaited<ReturnType<PdfDoc['getPage']>>;

export interface ExtractOptions {
  /** 'none' = text only, 'scanned' = render pages without text, 'all' = render every page. */
  images: 'none' | 'scanned' | 'all';
  /** Target width of rendered page images in px. */
  imageWidth?: number;
  imageFormat?: 'image/jpeg' | 'image/png';
  withFonts?: boolean;
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export async function openPdf(data: Uint8Array): Promise<{ pdfjs: PdfJs; doc: PdfDoc }> {
  const pdfjs = await getClientPdfJs();
  try {
    const doc = await pdfjs.getDocument({ data: data.slice(), isEvalSupported: false }).promise;
    return { pdfjs, doc };
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === 'PasswordException') {
      throw new ConversionError('Die PDF ist passwortgeschützt. Bitte entsperren Sie sie zuerst (Tool „PDF entsperren“).');
    }
    throw new ConversionError('Die PDF-Datei konnte nicht gelesen werden. Sie ist möglicherweise beschädigt.');
  }
}

export async function renderPageImage(page: PdfPage, width: number, format: 'image/jpeg' | 'image/png' = 'image/jpeg'): Promise<Uint8Array | undefined> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(4, Math.max(0.5, width / base.width));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, 0.85));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return undefined;
  return new Uint8Array(await blob.arrayBuffer());
}

export async function extractPdfPages(data: Uint8Array, opts: ExtractOptions): Promise<PdfPageText[]> {
  const { pdfjs, doc } = await openPdf(data);
  const pages: PdfPageText[] = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      checkAbort(opts.signal);
      opts.onProgress?.((i - 1) / doc.numPages);
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const fontStyle = new Map<string, { bold: boolean; italic: boolean }>();
      if (opts.withFonts !== false) {
        try {
          await page.getOperatorList();
          for (const it of tc.items) {
            if (!('fontName' in it) || fontStyle.has(it.fontName)) continue;
            let name = '';
            try {
              const font = page.commonObjs.get(it.fontName) as { name?: string; bold?: boolean; italic?: boolean } | undefined;
              name = font?.name ?? '';
              fontStyle.set(it.fontName, {
                bold: Boolean(font?.bold) || /bold|black|heavy|semibold|demi/i.test(name),
                italic: Boolean(font?.italic) || /italic|oblique/i.test(name),
              });
            } catch {
              fontStyle.set(it.fontName, { bold: false, italic: false });
            }
          }
        } catch {
          // font info is optional
        }
      }
      const items: PdfTextItem[] = [];
      for (const it of tc.items) {
        if (!('str' in it) || !it.str) continue;
        const tx = pdfjs.Util.transform(viewport.transform, it.transform);
        const size = Math.hypot(tx[2], tx[3]);
        // Skip vertical / rotated text runs (watermarks, margins)
        if (Math.abs(tx[1]) > Math.abs(tx[0]) * 0.2 && Math.abs(tx[0]) > 0) continue;
        const style = fontStyle.get(it.fontName);
        items.push({
          str: it.str,
          x: tx[4],
          y: tx[5],
          w: it.width * viewport.scale,
          size,
          bold: style?.bold,
          italic: style?.italic,
        });
      }
      const chars = items.reduce((s, it) => s + it.str.trim().length, 0);
      let image: Uint8Array | undefined;
      if (opts.images === 'all' || (opts.images === 'scanned' && chars < 20)) {
        image = await renderPageImage(page, opts.imageWidth ?? 1400, opts.imageFormat);
      }
      pages.push({ width: viewport.width, height: viewport.height, items, image });
      page.cleanup();
      if (i % 3 === 0) await yieldToUi();
    }
  } finally {
    await doc.destroy();
  }
  return pages;
}
