/**
 * Flow-layout → PDF renderer built on pdf-lib.
 *
 * Lays out the format-neutral `Block[]` model on A4 pages: headings,
 * paragraphs with bold/italic/underline runs, nested lists, tables with
 * wrapping cells (rows split across pages, header rows repeated), images,
 * page breaks and page numbers. Uses the PDF standard fonts with WinAnsi
 * encoding; unsupported characters are transliterated (see winAnsi.ts).
 */
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFName,
  PDFPage,
  PDFString,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { Align, Block, ListBlock, RGB, TableBlock, TableCell, TextRun } from './model';
import { checkAbort, yieldToUi } from './model';
import { toWinAnsi } from './winAnsi';
import { type ImageTranscoder, sniffImage } from './images';

export const A4_PORTRAIT: [number, number] = [595.28, 841.89];
export const A4_LANDSCAPE: [number, number] = [841.89, 595.28];

export interface FlowOptions {
  pageSize?: [number, number];
  /** Page margin in pt (default ≈ 2 cm). */
  margin?: number;
  /** Base font size in pt (default 11). */
  fontSize?: number;
  fontFamily?: 'sans' | 'serif' | 'mono';
  title?: string;
  /** Draw "Seite x von y" when the document has more than one page (default true). */
  pageNumbers?: boolean;
  imageTranscoder?: ImageTranscoder;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

const TEXT_COLOR: RGB = [0.1, 0.11, 0.13];
const LINK_COLOR: RGB = [0.05, 0.33, 0.7];
const BORDER_COLOR = rgb(0.62, 0.65, 0.7);
const HEADER_FILL = rgb(0.92, 0.94, 0.97);
const HEADING_SCALE = [1.9, 1.55, 1.3, 1.15, 1.05, 1.0];
const BULLETS = ['•', '–', '·'];

type Family = 'sans' | 'serif' | 'mono';

const FONT_NAMES: Record<Family, [StandardFonts, StandardFonts, StandardFonts, StandardFonts]> = {
  sans: [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaOblique, StandardFonts.HelveticaBoldOblique],
  serif: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.TimesRomanBoldItalic],
  mono: [StandardFonts.Courier, StandardFonts.CourierBold, StandardFonts.CourierOblique, StandardFonts.CourierBoldOblique],
};

export class FontSet {
  private cache = new Map<string, PDFFont>();
  constructor(private doc: PDFDocument, private family: Family) {}

  get(bold = false, italic = false, mono = false): PDFFont {
    const fam: Family = mono ? 'mono' : this.family;
    const idx = (bold ? 1 : 0) + (italic ? 2 : 0);
    const key = `${fam}${idx}`;
    let font = this.cache.get(key);
    if (!font) {
      font = this.doc.embedStandardFont(FONT_NAMES[fam][idx]);
      this.cache.set(key, font);
    }
    return font;
  }
}

export interface Piece {
  text: string;
  font: PDFFont;
  size: number;
  color: RGB;
  underline: boolean;
  strike: boolean;
  link?: string;
  width: number;
  space: boolean;
  src?: Piece;
}

export interface Line {
  pieces: Piece[];
  width: number;
  size: number;
}

export interface TextDefaults {
  size: number;
  bold?: boolean;
  italic?: boolean;
  mono?: boolean;
  color?: RGB;
}

type Token = { t: 'nl' } | { t: 'sp'; p: Piece } | { t: 'w'; segs: Piece[]; width: number };

function sameStyle(a: Piece, b: Piece): boolean {
  return (
    a.font === b.font &&
    a.size === b.size &&
    a.color === b.color &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.link === b.link
  );
}

/** Breaks styled runs into lines that fit `maxWidth`. Always returns ≥ 1 line. */
export function layoutRuns(
  fonts: FontSet,
  runs: TextRun[],
  maxWidth: number,
  d: TextDefaults,
  preserveSpaces = false
): Line[] {
  const tokens: Token[] = [];
  let lastWord: Extract<Token, { t: 'w' }> | null = null;

  for (const run of runs) {
    if (!run.text) continue;
    const font = fonts.get(run.bold ?? d.bold, run.italic ?? d.italic, run.mono ?? d.mono);
    const size = run.size ?? d.size;
    const color = run.color ?? (run.link ? LINK_COLOR : d.color ?? TEXT_COLOR);
    const text = toWinAnsi(run.text.replace(/\r\n?/g, '\n'));
    const parts = text.split(/(\n| +)/);
    for (const part of parts) {
      if (!part) continue;
      if (part === '\n') {
        tokens.push({ t: 'nl' });
        lastWord = null;
        continue;
      }
      const piece: Piece = {
        text: part,
        font,
        size,
        color,
        underline: Boolean(run.underline || run.link),
        strike: Boolean(run.strike),
        link: run.link,
        width: font.widthOfTextAtSize(part, size),
        space: part[0] === ' ',
      };
      if (piece.space) {
        tokens.push({ t: 'sp', p: piece });
        lastWord = null;
      } else if (lastWord) {
        lastWord.segs.push(piece);
        lastWord.width += piece.width;
      } else {
        lastWord = { t: 'w', segs: [piece], width: piece.width };
        tokens.push(lastWord);
      }
    }
  }
  if (tokens.length > 1 && tokens[tokens.length - 1].t === 'nl') tokens.pop();

  const lines: Line[] = [];
  let cur: Line = { pieces: [], width: 0, size: 0 };
  let pending: Piece[] = [];

  const pushLine = () => {
    while (cur.pieces.length && cur.pieces[cur.pieces.length - 1].space) {
      const p = cur.pieces.pop() as Piece;
      cur.width -= p.width;
    }
    cur.size = cur.pieces.reduce((m, p) => Math.max(m, p.size), 0) || d.size;
    lines.push(cur);
    cur = { pieces: [], width: 0, size: 0 };
    pending = [];
  };

  const appendChar = (seg: Piece, ch: string) => {
    const w = seg.font.widthOfTextAtSize(ch, seg.size);
    if (cur.pieces.length > 0 && cur.width + w > maxWidth) pushLine();
    const last = cur.pieces[cur.pieces.length - 1];
    if (last && last.src === seg) {
      last.text += ch;
      last.width += w;
    } else {
      cur.pieces.push({ ...seg, text: ch, width: w, src: seg });
    }
    cur.width += w;
  };

  for (const tok of tokens) {
    if (tok.t === 'nl') {
      pushLine();
    } else if (tok.t === 'sp') {
      if (cur.pieces.length === 0 && !preserveSpaces) continue;
      pending.push(tok.p);
    } else {
      const spaceWidth = pending.reduce((s, p) => s + p.width, 0);
      if (cur.pieces.length > 0 && cur.width + spaceWidth + tok.width > maxWidth) {
        pushLine();
      } else {
        cur.pieces.push(...pending);
        cur.width += spaceWidth;
        pending = [];
      }
      if (tok.width > maxWidth) {
        for (const seg of tok.segs) for (const ch of seg.text) appendChar(seg, ch);
      } else {
        cur.pieces.push(...tok.segs);
        cur.width += tok.width;
      }
    }
  }
  pushLine();
  return lines;
}

/** Min (longest word) and max (unwrapped) widths of runs. */
function measureRuns(fonts: FontSet, runs: TextRun[], d: TextDefaults): { min: number; max: number } {
  let min = 0;
  let max = 0;
  let lineW = 0;
  let wordW = 0;
  for (const run of runs) {
    if (!run.text) continue;
    const font = fonts.get(run.bold ?? d.bold, run.italic ?? d.italic, run.mono ?? d.mono);
    const size = run.size ?? d.size;
    const text = toWinAnsi(run.text);
    for (const part of text.split(/(\n| +)/)) {
      if (!part) continue;
      if (part === '\n') {
        max = Math.max(max, lineW);
        min = Math.max(min, wordW);
        lineW = 0;
        wordW = 0;
        continue;
      }
      const w = font.widthOfTextAtSize(part, size);
      lineW += w;
      if (part[0] === ' ') {
        min = Math.max(min, wordW);
        wordW = 0;
      } else {
        wordW += w;
      }
    }
  }
  max = Math.max(max, lineW);
  min = Math.max(min, wordW);
  return { min, max };
}

function cellRuns(cell: TableCell): TextRun[] {
  const runs: TextRun[] = [];
  const add = (blocks: Block[], prefix = '') => {
    let first = true;
    for (const b of blocks) {
      if (b.type === 'paragraph' || b.type === 'heading') {
        if (runs.length) runs.push({ text: '\n' });
        if (prefix && first) runs.push({ text: prefix });
        for (const r of b.runs) {
          runs.push({ ...r, size: undefined, bold: b.type === 'heading' ? true : r.bold });
        }
        first = false;
      } else if (b.type === 'list') {
        b.items.forEach((item, i) => add(item, b.ordered ? `${(b.start ?? 1) + i}. ` : '• '));
      } else if (b.type === 'table') {
        for (const row of b.rows) {
          if (runs.length) runs.push({ text: '\n' });
          runs.push({ text: row.cells.map((c) => cellRuns(c).map((r) => r.text).join('').replace(/\n/g, ' ')).join(' | ') });
        }
      } else if (b.type === 'image') {
        if (b.alt) {
          if (runs.length) runs.push({ text: '\n' });
          runs.push({ text: `[Bild: ${b.alt}]`, italic: true });
        }
      }
    }
  };
  add(cell.blocks);
  // Trim leading/trailing whitespace of the whole cell
  if (runs.length) {
    runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, '') };
    const li = runs.length - 1;
    runs[li] = { ...runs[li], text: runs[li].text.replace(/\s+$/, '') };
  }
  return runs;
}

function cellAlign(cell: TableCell): Align {
  if (cell.align) return cell.align === 'justify' ? 'left' : cell.align;
  const first = cell.blocks[0];
  if (first && (first.type === 'paragraph' || first.type === 'heading') && first.align && first.align !== 'justify') return first.align;
  return 'left';
}

interface GridCell {
  cell: TableCell;
  col: number;
  span: number;
  placeholder?: boolean;
}

function normalizeTable(tb: TableBlock): { rows: GridCell[][]; ncols: number } {
  const rows: GridCell[][] = [];
  const occupied: number[] = []; // remaining rows each column is blocked by a rowspan
  let ncols = 0;
  for (const row of tb.rows) {
    const out: GridCell[] = [];
    let col = 0;
    const take = (c: number) => {
      while (occupied[c] > 0) {
        out.push({ cell: { blocks: [] }, col: c, span: 1, placeholder: true });
        c++;
      }
      return c;
    };
    for (const cell of row.cells) {
      col = take(col);
      const span = Math.max(1, Math.min(cell.colSpan ?? 1, 64));
      out.push({ cell, col, span });
      const rs = Math.max(1, cell.rowSpan ?? 1);
      for (let k = 0; k < span; k++) occupied[col + k] = rs; // includes this row
      col += span;
    }
    col = take(col);
    // Columns still blocked to the right of the last cell
    for (let c = col; c < occupied.length; c++) {
      if (occupied[c] > 0) out.push({ cell: { blocks: [] }, col: c, span: 1, placeholder: true });
    }
    for (let c = 0; c < occupied.length; c++) if (occupied[c] > 0) occupied[c]--;
    ncols = Math.max(ncols, out.reduce((m, g) => Math.max(m, g.col + g.span), 0));
    out.sort((a, b) => a.col - b.col);
    rows.push(out);
  }
  return { rows, ncols };
}

export class FlowRenderer {
  readonly doc: PDFDocument;
  private fonts: FontSet;
  private pageW: number;
  private pageH: number;
  private margin: number;
  private base: number;
  private page!: PDFPage;
  private y = 0;
  private hasContent = false;
  private imageCache = new Map<Uint8Array, PDFImage | null>();
  private repeatHeader: (() => void) | null = null;

  private constructor(doc: PDFDocument, private opts: FlowOptions) {
    this.doc = doc;
    this.fonts = new FontSet(doc, opts.fontFamily ?? 'sans');
    [this.pageW, this.pageH] = opts.pageSize ?? A4_PORTRAIT;
    this.margin = opts.margin ?? 56;
    this.base = opts.fontSize ?? 11;
  }

  static async create(opts: FlowOptions = {}): Promise<FlowRenderer> {
    const doc = await PDFDocument.create();
    const r = new FlowRenderer(doc, opts);
    r.newPage();
    return r;
  }

  private get contentWidth() {
    return this.pageW - 2 * this.margin;
  }

  private get bottom() {
    return this.margin;
  }

  private get pageContentHeight() {
    return this.pageH - 2 * this.margin;
  }

  newPage() {
    this.page = this.doc.addPage([this.pageW, this.pageH]);
    this.y = this.pageH - this.margin;
    this.hasContent = false;
    if (this.repeatHeader) this.repeatHeader();
  }

  /** Starts a new page if `h` does not fit (unless the page is still empty). */
  private ensure(h: number) {
    if (this.y - h < this.bottom && this.hasContent) this.newPage();
  }

  private addLink(x1: number, y1: number, x2: number, y2: number, url: string) {
    if (!/^(https?:|mailto:)/i.test(url)) return;
    const annot = this.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x1, y1, x2, y2],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    });
    const ref = this.doc.context.register(annot);
    const existing = this.page.node.lookup(PDFName.of('Annots'));
    if (existing && 'push' in existing) {
      (existing as unknown as { push: (r: unknown) => void }).push(ref);
    } else {
      this.page.node.set(PDFName.of('Annots'), this.doc.context.obj([ref]));
    }
  }

  private drawLine(line: Line, x: number, baseline: number, maxWidth: number, align: Align | undefined, justify: boolean) {
    let cx = x;
    let extraPerSpace = 0;
    if (align === 'center') cx = x + Math.max(0, (maxWidth - line.width) / 2);
    else if (align === 'right') cx = x + Math.max(0, maxWidth - line.width);
    else if (align === 'justify' && justify) {
      const spaces = line.pieces.filter((p) => p.space).length;
      if (spaces > 0) extraPerSpace = Math.max(0, (maxWidth - line.width) / spaces);
      if (extraPerSpace > (line.pieces[0]?.size ?? this.base) * 1.5) extraPerSpace = 0;
    }
    // Merge adjacent pieces with identical style for compact output
    const merged: Piece[] = [];
    for (const p of line.pieces) {
      const last = merged[merged.length - 1];
      if (last && extraPerSpace === 0 && sameStyle(last, p)) {
        last.text += p.text;
        last.width += p.width;
        last.space = last.space && p.space;
      } else {
        merged.push({ ...p });
      }
    }
    for (const p of merged) {
      const w = p.space ? p.width + extraPerSpace : p.width;
      const color = rgb(p.color[0], p.color[1], p.color[2]);
      if (!p.space || p.underline) {
        if (p.text.trim()) {
          this.page.drawText(p.text, { x: cx, y: baseline, size: p.size, font: p.font, color });
        }
        if (p.underline) {
          this.page.drawLine({
            start: { x: cx, y: baseline - p.size * 0.12 },
            end: { x: cx + w, y: baseline - p.size * 0.12 },
            thickness: Math.max(0.4, p.size * 0.05),
            color,
          });
        }
        if (p.strike) {
          this.page.drawLine({
            start: { x: cx, y: baseline + p.size * 0.28 },
            end: { x: cx + w, y: baseline + p.size * 0.28 },
            thickness: Math.max(0.4, p.size * 0.05),
            color,
          });
        }
        if (p.link) this.addLink(cx, baseline - p.size * 0.25, cx + w, baseline + p.size * 0.85, p.link);
      }
      cx += w;
    }
  }

  private paragraph(
    runs: TextRun[],
    o: {
      indent?: number;
      align?: Align;
      spaceBefore?: number;
      spaceAfter?: number;
      defaults?: Partial<TextDefaults>;
      preserve?: boolean;
      marker?: string;
      quote?: boolean;
      keepWithNext?: number;
      lineFactor?: number;
    } = {}
  ) {
    const indent = o.indent ?? 0;
    const defaults: TextDefaults = { size: this.base, ...o.defaults };
    const width = Math.max(40, this.contentWidth - indent);
    const lines = layoutRuns(this.fonts, runs, width, defaults, o.preserve);
    const factor = o.lineFactor ?? 1.3;
    if (o.spaceBefore && this.hasContent) {
      if (this.y - o.spaceBefore < this.bottom) this.newPage();
      else this.y -= o.spaceBefore;
    }
    if (o.keepWithNext) this.ensure(lines[0].size * factor + o.keepWithNext);
    const x = this.margin + indent;
    lines.forEach((line, i) => {
      const lh = line.size * factor;
      this.ensure(lh);
      const baseline = this.y - line.size;
      if (i === 0 && o.marker) {
        const mf = this.fonts.get(false, false, false);
        const ms = defaults.size;
        const marker = toWinAnsi(o.marker);
        const mw = mf.widthOfTextAtSize(marker, ms);
        this.page.drawText(marker, {
          x: Math.max(this.margin, x - mw - 5),
          y: baseline,
          size: ms,
          font: mf,
          color: rgb(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]),
        });
      }
      if (o.quote) {
        this.page.drawRectangle({ x: x - 9, y: this.y - lh, width: 2.5, height: lh, color: rgb(0.78, 0.81, 0.86) });
      }
      this.drawLine(line, x, baseline, width, o.align, i < lines.length - 1);
      this.y -= lh;
      this.hasContent = true;
    });
    if (o.spaceAfter) this.y -= o.spaceAfter;
  }

  private async image(b: Extract<Block, { type: 'image' }>, indent: number) {
    const img = b.data ? await this.embedImage(b.data) : null;
    if (!img) {
      if (b.alt) this.paragraph([{ text: `[Bild: ${b.alt}]`, italic: true }], { indent, spaceAfter: this.base * 0.5 });
      return;
    }
    let w = b.widthPt ?? img.width * 0.75;
    let h = b.heightPt ?? img.height * 0.75;
    if (b.widthPt && !b.heightPt) h = (img.height / img.width) * w;
    if (b.heightPt && !b.widthPt) w = (img.width / img.height) * h;
    const maxW = this.contentWidth - indent;
    const maxH = this.pageContentHeight * 0.92;
    const scale = Math.min(1, maxW / w, maxH / h);
    w *= scale;
    h *= scale;
    this.ensure(h);
    let x = this.margin + indent;
    if (b.align === 'center') x += (maxW - w) / 2;
    else if (b.align === 'right') x += maxW - w;
    this.page.drawImage(img, { x, y: this.y - h, width: w, height: h });
    this.y -= h + this.base * 0.5;
    this.hasContent = true;
  }

  async embedImage(data: Uint8Array): Promise<PDFImage | null> {
    if (this.imageCache.has(data)) return this.imageCache.get(data) ?? null;
    let result: PDFImage | null = null;
    try {
      let kind = sniffImage(data);
      let bytes = data;
      if (kind !== 'png' && kind !== 'jpg' && this.opts.imageTranscoder) {
        const t = await this.opts.imageTranscoder(data, kind);
        if (t) {
          bytes = t.data;
          kind = t.kind;
        }
      }
      if (kind === 'png') result = await this.doc.embedPng(bytes);
      else if (kind === 'jpg') result = await this.doc.embedJpg(bytes);
    } catch {
      result = null;
    }
    this.imageCache.set(data, result);
    return result;
  }

  private async table(tb: TableBlock, indent: number) {
    const { rows, ncols } = normalizeTable(tb);
    if (!ncols || !rows.length) return;
    const fs = tb.fontSize ?? Math.max(6, this.base * 0.9);
    const pad = Math.max(2, fs * 0.35);
    const lineH = fs * 1.25;
    const avail = this.contentWidth - indent;
    const headerRows = Math.min(tb.headerRows ?? 0, rows.length);

    const runsOf = rows.map((r, ri) => r.map((g) => {
      const runs = cellRuns(g.cell);
      return g.cell.header || ri < headerRows ? runs.map((x) => ({ ...x, bold: true })) : runs;
    }));

    // Column widths
    let widths: number[];
    if (tb.colWidths && tb.colWidths.length === ncols) {
      const sum = tb.colWidths.reduce((s, v) => s + Math.max(v, 0.01), 0);
      widths = tb.colWidths.map((v) => (Math.max(v, 0.01) / sum) * avail);
    } else {
      const minW = new Array<number>(ncols).fill(14);
      const maxW = new Array<number>(ncols).fill(14);
      rows.forEach((r, ri) => r.forEach((g, ci) => {
        if (g.placeholder || !runsOf[ri][ci].length) return;
        const m = measureRuns(this.fonts, runsOf[ri][ci], { size: fs });
        // Spanning cells contribute an equal share to each spanned column
        const span = Math.min(g.span, ncols - g.col);
        for (let k = 0; k < span; k++) {
          const c = g.col + k;
          minW[c] = Math.max(minW[c], Math.min((m.min + 2 * pad + 1) / span, avail * 0.3));
          maxW[c] = Math.max(maxW[c], Math.min(m.max + 2 * pad + 1, avail * 0.45) / span);
        }
      }));
      for (let c = 0; c < ncols; c++) maxW[c] = Math.max(maxW[c], minW[c]);
      const totalMax = maxW.reduce((s, v) => s + v, 0);
      const totalMin = minW.reduce((s, v) => s + v, 0);
      if (totalMax <= avail) {
        const stretch = totalMax < avail * 0.55 ? 1 : avail / totalMax;
        widths = maxW.map((w) => w * stretch);
      } else if (totalMin >= avail) {
        widths = minW.map((w) => (w / totalMin) * avail);
      } else {
        const extra = avail - totalMin;
        const flex = maxW.reduce((s, v, i) => s + (v - minW[i]), 0) || 1;
        widths = minW.map((w, i) => w + (extra * (maxW[i] - minW[i])) / flex);
      }
    }
    const colX: number[] = [0];
    for (let c = 0; c < ncols; c++) colX.push(colX[c] + widths[c]);

    // Lay out cell lines
    const laid = rows.map((r, ri) => r.map((g, ci) => {
      const w = colX[Math.min(ncols, g.col + g.span)] - colX[g.col];
      if (!runsOf[ri][ci].length) return [] as Line[];
      return layoutRuns(this.fonts, runsOf[ri][ci], Math.max(4, w - 2 * pad), { size: fs });
    }));
    const rowLines = laid.map((r) => Math.max(1, ...r.map((ls) => ls.length)));

    const left = this.margin + indent;
    const drawSegment = (ri: number, from: number, to: number) => {
      const h = (to - from) * lineH + 2 * pad;
      const isHeader = ri < headerRows;
      rows[ri].forEach((g, ci) => {
        const x = left + colX[g.col];
        const w = colX[Math.min(ncols, g.col + g.span)] - colX[g.col];
        if (isHeader || g.cell.header) {
          this.page.drawRectangle({ x, y: this.y - h, width: w, height: h, color: HEADER_FILL });
        }
        this.page.drawRectangle({ x, y: this.y - h, width: w, height: h, borderColor: BORDER_COLOR, borderWidth: 0.5 });
        const lines = laid[ri][ci];
        for (let li = from; li < Math.min(to, lines.length); li++) {
          const baseline = this.y - pad - (li - from) * lineH - fs;
          this.drawLine(lines[li], x + pad, baseline, w - 2 * pad, cellAlign(g.cell), false);
        }
      });
      this.y -= h;
      this.hasContent = true;
    };

    const headerHeight = rows.slice(0, headerRows).reduce((s, _r, i) => s + rowLines[i] * lineH + 2 * pad, 0);
    const canRepeat = headerRows > 0 && headerHeight < this.pageContentHeight * 0.3;
    const prevRepeat = this.repeatHeader;

    for (let ri = 0; ri < rows.length; ri++) {
      if (ri === headerRows && canRepeat) {
        this.repeatHeader = () => {
          for (let h = 0; h < headerRows; h++) drawSegment(h, 0, rowLines[h]);
        };
      }
      const total = rowLines[ri];
      let offset = 0;
      while (offset < total) {
        const remaining = total - offset;
        const needed = remaining * lineH + 2 * pad;
        if (this.y - needed >= this.bottom - 0.5) {
          drawSegment(ri, offset, total);
          break;
        }
        const fullPage = this.pageContentHeight - (canRepeat && ri >= headerRows ? headerHeight : 0) - 1;
        const fitLines = Math.floor((this.y - this.bottom - 2 * pad) / lineH);
        if (!this.hasContent && fitLines < 1) {
          // Not even one line fits on an empty page: draw anyway to avoid endless loop
          drawSegment(ri, offset, Math.min(total, offset + 1));
          offset += 1;
          continue;
        }
        if ((needed <= fullPage && this.hasContent) || fitLines < 1) {
          this.newPage();
          continue;
        }
        drawSegment(ri, offset, offset + fitLines);
        offset += fitLines;
        this.newPage();
      }
      if (ri % 200 === 199) {
        checkAbort(this.opts.signal);
        await yieldToUi();
      }
    }
    this.repeatHeader = prevRepeat;
    this.y -= this.base * 0.7;
  }

  private async list(b: ListBlock, indent: number, depth: number) {
    const step = this.base * 1.6;
    for (let i = 0; i < b.items.length; i++) {
      const marker = b.ordered ? `${(b.start ?? 1) + i}.` : BULLETS[depth % BULLETS.length];
      await this.blocks(b.items[i], indent + step, depth + 1, marker, true);
    }
    if (depth === 0) this.y -= this.base * 0.4;
  }

  async blocks(blocks: Block[], indent = 0, depth = 0, marker?: string, inList = false): Promise<void> {
    let pendingMarker = marker;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const m = pendingMarker;
      pendingMarker = undefined;
      switch (b.type) {
        case 'heading': {
          const level = Math.min(6, Math.max(1, b.level));
          const size = this.base * HEADING_SCALE[level - 1];
          this.paragraph(b.runs, {
            indent,
            align: b.align,
            defaults: { size, bold: true, color: [0.06, 0.09, 0.16] },
            spaceBefore: size * 0.8,
            spaceAfter: size * 0.35,
            keepWithNext: this.base * 2.6,
            marker: m,
            lineFactor: 1.22,
          });
          break;
        }
        case 'paragraph': {
          const empty = !b.runs.some((r) => r.text.trim());
          this.paragraph(b.runs, {
            indent: indent + (b.indent ?? 0) + (b.quote ? 14 : 0),
            align: b.align,
            preserve: b.preformatted,
            spaceAfter: b.spaceAfter ?? (inList ? this.base * 0.2 : empty ? 0 : this.base * 0.55),
            marker: m,
            quote: b.quote,
            defaults: b.quote ? { size: this.base, italic: true } : undefined,
          });
          break;
        }
        case 'list':
          if (m) this.paragraph([{ text: '' }], { indent, marker: m, spaceAfter: 0 });
          await this.list(b, indent, depth);
          break;
        case 'table':
          if (m) this.paragraph([{ text: '' }], { indent, marker: m, spaceAfter: 0 });
          await this.table(b, indent);
          break;
        case 'image':
          if (m) this.paragraph([{ text: '' }], { indent, marker: m, spaceAfter: 0 });
          await this.image(b, indent);
          break;
        case 'pageBreak':
          if (this.hasContent) this.newPage();
          break;
        case 'rule':
          this.ensure(this.base);
          this.page.drawLine({
            start: { x: this.margin + indent, y: this.y - this.base * 0.5 },
            end: { x: this.pageW - this.margin, y: this.y - this.base * 0.5 },
            thickness: 0.6,
            color: BORDER_COLOR,
          });
          this.y -= this.base;
          this.hasContent = true;
          break;
      }
      if (depth === 0 && i % 40 === 39) {
        checkAbort(this.opts.signal);
        this.opts.onProgress?.(i / blocks.length);
        await yieldToUi();
      }
    }
  }

  async finish(): Promise<Uint8Array> {
    const pages = this.doc.getPages();
    if (this.opts.pageNumbers !== false && pages.length > 1) {
      const font = this.fonts.get(false, false, false);
      pages.forEach((p, i) => {
        const label = `Seite ${i + 1} von ${pages.length}`;
        const size = 8;
        const w = font.widthOfTextAtSize(label, size);
        const { width } = p.getSize();
        p.drawText(label, { x: (width - w) / 2, y: Math.max(14, this.margin / 2 - 4), size, font, color: rgb(0.45, 0.48, 0.53) });
      });
    }
    if (this.opts.title) this.doc.setTitle(toWinAnsi(this.opts.title));
    this.doc.setCreator('Datei Tools (datei-tools.de)');
    this.doc.setProducer('Datei Tools – Browser-Konvertierung (pdf-lib)');
    this.doc.setLanguage('de-DE');
    return this.doc.save();
  }
}

/** Renders blocks to a PDF and returns the file bytes. */
export async function renderBlocksToPdf(blocks: Block[], opts: FlowOptions = {}): Promise<Uint8Array> {
  const r = await FlowRenderer.create(opts);
  await r.blocks(blocks);
  opts.onProgress?.(1);
  return r.finish();
}
