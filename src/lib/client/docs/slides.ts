/**
 * Format-neutral slide model + renderers:
 *  - Deck → PDF (pdf-lib, one page per slide, absolute positioning)
 *  - Deck → PPTX (pptxWriter.ts)
 */
import { PDFDocument, type PDFImage, type PDFPage, rgb } from 'pdf-lib';
import type { Align, RGB, TextRun } from './model';
import { checkAbort, yieldToUi } from './model';
import { FontSet, type Line, layoutRuns } from './pdfFlow';
import { type ImageTranscoder, sniffImage } from './images';
import { toWinAnsi } from './winAnsi';

export interface SlidePara {
  runs: TextRun[];
  align?: Align;
  level: number;
  /** Bullet character, 'number' for auto numbering, undefined for none. */
  bullet?: string;
  /** Left margin of the text in pt (overrides level-based indent). */
  marginLeft?: number;
  /** Explicit default size for this paragraph in pt. */
  defaultSize?: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SlideText extends Box {
  kind: 'text';
  paragraphs: SlidePara[];
  anchor?: 'top' | 'middle' | 'bottom';
  fill?: RGB;
  line?: RGB;
  geom?: 'rect' | 'ellipse' | 'roundRect';
  insets?: [number, number, number, number]; // l, t, r, b
  isTitle?: boolean;
  defaultSize?: number;
  defaultColor?: RGB;
  autofit?: boolean;
}

export interface SlideImage extends Box {
  kind: 'image';
  data: Uint8Array;
}

export interface SlideTableCell {
  paragraphs: SlidePara[];
  fill?: RGB;
}

export interface SlideTable extends Box {
  kind: 'table';
  colWidths: number[];
  rows: Array<{ h: number; cells: SlideTableCell[] }>;
}

export type SlideElement = SlideText | SlideImage | SlideTable;

export interface Slide {
  elements: SlideElement[];
  background?: RGB;
  backgroundImage?: Uint8Array;
}

export interface Deck {
  width: number; // pt
  height: number; // pt
  slides: Slide[];
  title?: string;
}

// ---------------------------------------------------------------------------
// PDF rendering
// ---------------------------------------------------------------------------

function drawLine(page: PDFPage, line: Line, x: number, baseline: number, maxWidth: number, align: Align | undefined) {
  let cx = x;
  if (align === 'center') cx = x + Math.max(0, (maxWidth - line.width) / 2);
  else if (align === 'right') cx = x + Math.max(0, maxWidth - line.width);
  for (const p of line.pieces) {
    const color = rgb(p.color[0], p.color[1], p.color[2]);
    if (!p.space && p.text.trim()) page.drawText(p.text, { x: cx, y: baseline, size: p.size, font: p.font, color });
    if (p.underline && !p.space) {
      page.drawLine({ start: { x: cx, y: baseline - p.size * 0.12 }, end: { x: cx + p.width, y: baseline - p.size * 0.12 }, thickness: Math.max(0.4, p.size * 0.05), color });
    }
    cx += p.width;
  }
}

interface LaidPara {
  lines: Line[];
  indent: number;
  bulletText?: string;
  bulletSize: number;
  bulletColor: RGB;
  align?: Align;
  spaceBefore: number;
}

function layoutText(fonts: FontSet, el: { paragraphs: SlidePara[]; defaultSize?: number; defaultColor?: RGB }, width: number, scale: number): { paras: LaidPara[]; height: number } {
  const paras: LaidPara[] = [];
  let height = 0;
  const counters: number[] = [];
  el.paragraphs.forEach((p, i) => {
    const base = (p.defaultSize ?? el.defaultSize ?? 18) * scale;
    const color = el.defaultColor ?? [0, 0, 0];
    let indent = p.marginLeft !== undefined ? p.marginLeft * scale : p.level * 24 * scale;
    let bulletText: string | undefined;
    if (p.bullet) {
      counters[p.level] = (counters[p.level] ?? 0) + 1;
      counters.length = p.level + 1;
      bulletText = p.bullet === 'number' ? `${counters[p.level]}.` : p.bullet;
      if (p.marginLeft === undefined) indent += base * 1.1;
    } else {
      counters.length = p.level;
    }
    indent = Math.min(indent, width * 0.6);
    const runs = p.runs.map((r) => ({ ...r, size: r.size ? r.size * scale : undefined }));
    const lines = layoutRuns(fonts, runs.length ? runs : [{ text: '' }], Math.max(10, width - indent), { size: base, color });
    const spaceBefore = i === 0 ? 0 : base * 0.25;
    height += spaceBefore + lines.reduce((s, l) => s + l.size * 1.18, 0);
    const firstRun = p.runs.find((r) => r.text.trim());
    paras.push({ lines, indent, bulletText, bulletSize: firstRun?.size ? firstRun.size * scale : base, bulletColor: firstRun?.color ?? color, align: p.align, spaceBefore });
  });
  return { paras, height };
}

async function embedImage(doc: PDFDocument, data: Uint8Array, cache: Map<Uint8Array, PDFImage | null>, transcoder?: ImageTranscoder): Promise<PDFImage | null> {
  if (cache.has(data)) return cache.get(data) ?? null;
  let img: PDFImage | null = null;
  try {
    let kind = sniffImage(data);
    let bytes = data;
    if (kind !== 'png' && kind !== 'jpg' && transcoder) {
      const t = await transcoder(data, kind);
      if (t) {
        bytes = t.data;
        kind = t.kind;
      }
    }
    if (kind === 'png') img = await doc.embedPng(bytes);
    else if (kind === 'jpg') img = await doc.embedJpg(bytes);
  } catch {
    img = null;
  }
  cache.set(data, img);
  return img;
}

function drawTextBox(page: PDFPage, fonts: FontSet, el: { paragraphs: SlidePara[]; defaultSize?: number; defaultColor?: RGB; anchor?: SlideText['anchor']; insets?: SlideText['insets']; autofit?: boolean }, box: Box, pageH: number) {
  const [li, ti, ri, bi] = el.insets ?? [7.2, 3.6, 7.2, 3.6];
  const width = Math.max(10, box.w - li - ri);
  const avail = Math.max(10, box.h - ti - bi);
  let scale = 1;
  let laid = layoutText(fonts, el, width, scale);
  // Shrink text that overflows its box (similar to PowerPoint's autofit)
  while (laid.height > avail * 1.02 && scale > 0.45) {
    scale -= 0.07;
    laid = layoutText(fonts, el, width, scale);
  }
  let top = pageH - box.y - ti;
  if (el.anchor === 'middle') top -= Math.max(0, (avail - laid.height) / 2);
  else if (el.anchor === 'bottom') top -= Math.max(0, avail - laid.height);
  const x0 = box.x + li;
  for (const p of laid.paras) {
    top -= p.spaceBefore;
    p.lines.forEach((line, idx) => {
      const lh = line.size * 1.18;
      const baseline = top - line.size * 0.95;
      if (idx === 0 && p.bulletText) {
        const font = fonts.get(false, false, false);
        const text = toWinAnsi(p.bulletText) || '•';
        const bw = font.widthOfTextAtSize(text, p.bulletSize);
        page.drawText(text, {
          x: Math.max(box.x, x0 + p.indent - bw - p.bulletSize * 0.4),
          y: baseline,
          size: p.bulletSize,
          font,
          color: rgb(p.bulletColor[0], p.bulletColor[1], p.bulletColor[2]),
        });
      }
      drawLine(page, line, x0 + p.indent, baseline, width - p.indent, p.align);
      top -= lh;
    });
  }
}

export async function renderDeckToPdf(
  deck: Deck,
  opts: { imageTranscoder?: ImageTranscoder; signal?: AbortSignal; onProgress?: (f: number) => void } = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts = new FontSet(doc, 'sans');
  const cache = new Map<Uint8Array, PDFImage | null>();
  const W = deck.width;
  const H = deck.height;
  for (let s = 0; s < deck.slides.length; s++) {
    checkAbort(opts.signal);
    opts.onProgress?.(s / deck.slides.length);
    const slide = deck.slides[s];
    const page = doc.addPage([W, H]);
    const bg = slide.background ?? [1, 1, 1];
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(bg[0], bg[1], bg[2]) });
    if (slide.backgroundImage) {
      const img = await embedImage(doc, slide.backgroundImage, cache, opts.imageTranscoder);
      if (img) page.drawImage(img, { x: 0, y: 0, width: W, height: H });
    }
    for (const el of slide.elements) {
      // Clamp to page
      if (el.w <= 0 || el.h <= 0) continue;
      const y = H - el.y - el.h;
      if (el.kind === 'image') {
        const img = await embedImage(doc, el.data, cache, opts.imageTranscoder);
        if (img) page.drawImage(img, { x: el.x, y, width: el.w, height: el.h });
      } else if (el.kind === 'text') {
        if (el.fill || el.line) {
          const color = el.fill ? rgb(el.fill[0], el.fill[1], el.fill[2]) : undefined;
          const borderColor = el.line ? rgb(el.line[0], el.line[1], el.line[2]) : undefined;
          if (el.geom === 'ellipse') {
            page.drawEllipse({ x: el.x + el.w / 2, y: y + el.h / 2, xScale: el.w / 2, yScale: el.h / 2, color, borderColor, borderWidth: borderColor ? 1 : 0 });
          } else {
            page.drawRectangle({ x: el.x, y, width: el.w, height: el.h, color, borderColor, borderWidth: borderColor ? 1 : 0 });
          }
        }
        if (el.paragraphs.some((p) => p.runs.some((r) => r.text.trim()))) drawTextBox(page, fonts, el, el, H);
      } else if (el.kind === 'table') {
        let ry = el.y;
        const totalW = el.colWidths.reduce((a, b) => a + b, 0) || el.w;
        const sx = el.w / totalW;
        for (const row of el.rows) {
          let cx = el.x;
          const rh = Math.max(row.h, 14);
          row.cells.forEach((cell, ci) => {
            const cw = (el.colWidths[ci] ?? totalW / row.cells.length) * sx;
            const box = { x: cx, y: ry, w: cw, h: rh };
            page.drawRectangle({
              x: box.x, y: H - box.y - box.h, width: box.w, height: box.h,
              color: cell.fill ? rgb(cell.fill[0], cell.fill[1], cell.fill[2]) : undefined,
              borderColor: rgb(0.6, 0.62, 0.66), borderWidth: 0.6,
            });
            drawTextBox(page, fonts, { paragraphs: cell.paragraphs, defaultSize: 12, anchor: 'top' }, box, H);
            cx += cw;
          });
          ry += rh;
        }
      }
    }
    if (s % 5 === 4) await yieldToUi();
  }
  if (deck.title) doc.setTitle(toWinAnsi(deck.title));
  doc.setCreator('Datei Tools (datei-tools.de)');
  doc.setProducer('Datei Tools – Browser-Konvertierung (pdf-lib)');
  return doc.save();
}

// ---------------------------------------------------------------------------
// PPTX writing
// ---------------------------------------------------------------------------

export async function deckToPptx(deck: Deck, opts: { imageTranscoder?: ImageTranscoder } = {}): Promise<Uint8Array> {
  const { writePptx } = await import('./pptxWriter');
  return writePptx(deck, opts);
}
