/**
 * Reconstruction of document structure from positioned PDF text items
 * (as delivered by pdf.js getTextContent). Pure functions – the browser part
 * that talks to pdf.js lives in pdfExtract.ts.
 *
 * Coordinates are top-left based (y grows downwards), y = text baseline.
 */
import type { Block, ListBlock, TextRun } from './model';
import { csvValue } from './textDecode';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  size: number;
  bold?: boolean;
  italic?: boolean;
}

export interface PdfPageText {
  width: number;
  height: number;
  items: PdfTextItem[];
  /** Rendered page image (JPEG/PNG), present for scanned pages or layout mode. */
  image?: Uint8Array;
}

interface Line {
  y: number;
  x0: number;
  x1: number;
  size: number;
  items: PdfTextItem[];
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Groups text items into visual lines (same baseline). */
export function groupLines(items: PdfTextItem[]): Line[] {
  const sorted = items
    .filter((it) => it.str && it.str.trim() && it.size > 0.5)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Line[] = [];
  for (const it of sorted) {
    let target: Line | undefined;
    for (let i = lines.length - 1; i >= 0 && i >= lines.length - 4; i--) {
      const l = lines[i];
      if (Math.abs(l.y - it.y) <= Math.min(l.size, it.size) * 0.45) {
        target = l;
        break;
      }
    }
    if (target) {
      target.items.push(it);
      target.x0 = Math.min(target.x0, it.x);
      target.x1 = Math.max(target.x1, it.x + it.w);
      target.size = Math.max(target.size, it.size);
    } else {
      lines.push({ y: it.y, x0: it.x, x1: it.x + it.w, size: it.size, items: [it] });
    }
  }
  for (const l of lines) l.items.sort((a, b) => a.x - b.x);
  lines.sort((a, b) => a.y - b.y);
  return lines;
}

/** Text runs of a line, inserting spaces/tabs according to horizontal gaps. */
function lineRuns(line: Line): TextRun[] {
  const runs: TextRun[] = [];
  let prev: PdfTextItem | undefined;
  for (const it of line.items) {
    let text = it.str;
    if (prev) {
      const gap = it.x - (prev.x + prev.w);
      const prevEndsSpace = /\s$/.test(prev.str);
      if (gap > it.size * 2.2) text = '\t' + text.trimStart();
      else if (gap > it.size * 0.12 && !prevEndsSpace && !/^\s/.test(text)) text = ' ' + text;
    }
    const last = runs[runs.length - 1];
    if (last && Boolean(last.bold) === Boolean(it.bold) && Boolean(last.italic) === Boolean(it.italic)) last.text += text;
    else runs.push({ text, bold: it.bold || undefined, italic: it.italic || undefined });
    prev = it;
  }
  return runs;
}

function lineText(line: Line): string {
  return lineRuns(line).map((r) => r.text).join('');
}

const BULLET_RE = /^\s*([•●▪■◦‣⁃∙·*–-])\s+/;
const NUMBER_RE = /^\s*(\d{1,3}|[a-z])[.)]\s+/;
const MARKER_ONLY_RE = /^([•●▪■◦‣⁃∙·*–-]|\d{1,3}[.)]|[a-z][.)])$/;
const PAGE_NUMBER_RE =/^(seite|page|s\.)?\s*\d{1,4}(\s*(von|of|\/)\s*\d{1,4})?$/i;

function stripMarker(runs: TextRun[], re: RegExp): TextRun[] {
  const out = runs.map((r) => ({ ...r }));
  if (out.length) out[0].text = out[0].text.replace(re, '');
  return out.filter((r) => r.text.length > 0);
}

function joinRuns(target: TextRun[], next: TextRun[]) {
  const last = target[target.length - 1];
  const first = next[0];
  if (!last || !first) {
    target.push(...next);
    return;
  }
  // Hyphenation at line end: "Silben-" + "trennung" → "Silbentrennung"
  if (/[a-zäöüß]-$/i.test(last.text) && /^[a-zäöüß]/.test(first.text)) {
    last.text = last.text.slice(0, -1);
  } else if (!/\s$/.test(last.text)) {
    last.text += ' ';
  }
  for (const r of next) {
    const l = target[target.length - 1];
    if (l && Boolean(l.bold) === Boolean(r.bold) && Boolean(l.italic) === Boolean(r.italic)) l.text += r.text;
    else target.push({ ...r });
  }
}

interface ParaState {
  runs: TextRun[];
  size: number;
  x0: number;
  lastLine: Line;
  center: boolean;
  kind: 'p' | 'ul' | 'ol';
}

/** Converts pages of positioned text into flowing document blocks (for Word). */
export function pagesToBlocks(pages: PdfPageText[], opts: { pageBreaks?: boolean } = {}): Block[] {
  const blocks: Block[] = [];
  // Global body font size = most common line size
  const allSizes: number[] = [];
  const pageLines = pages.map((p) => groupLines(p.items));
  for (const lines of pageLines) for (const l of lines) for (let k = 0; k < Math.min(50, lineText(l).length); k++) allSizes.push(Math.round(l.size * 2) / 2);
  const counts = new Map<number, number>();
  for (const s of allSizes) counts.set(s, (counts.get(s) ?? 0) + 1);
  const body = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11;
  const headingSizes = [...new Set(allSizes.filter((s) => s >= body * 1.18))].sort((a, b) => b - a).slice(0, 3);

  pages.forEach((page, pi) => {
    const lines = pageLines[pi];
    const textChars = lines.reduce((s, l) => s + lineText(l).trim().length, 0);
    if (pi > 0 && opts.pageBreaks !== false) blocks.push({ type: 'pageBreak' });
    if (page.image && textChars < 20) {
      blocks.push({ type: 'image', data: page.image, widthPt: page.width, heightPt: page.height, align: 'center' });
      return;
    }
    if (!lines.length) return;
    const left = Math.min(...lines.map((l) => l.x0));
    const right = Math.max(...lines.map((l) => l.x1));
    const contentW = Math.max(1, right - left);
    const pageCenter = (left + right) / 2;
    const gaps: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      const g = lines[i].y - lines[i - 1].y;
      if (g > 0 && Math.abs(lines[i].size - lines[i - 1].size) < 0.5) gaps.push(g / lines[i].size);
    }
    const lineFactor = Math.min(2, Math.max(1.0, median(gaps) || 1.2));

    let cur: ParaState | null = null;
    let list: ListBlock | null = null;

    const flush = () => {
      if (!cur) return;
      const text = cur.runs.map((r) => r.text).join('').trim();
      if (!text) {
        cur = null;
        return;
      }
      const level = headingSizes.indexOf(Math.round(cur.size * 2) / 2);
      const allBold = cur.runs.every((r) => r.bold || !r.text.trim());
      const isHeading = cur.kind === 'p' && text.length < 200 && (level >= 0 || (allBold && cur.size >= body * 1.08 && text.length < 120));
      const runs = cur.runs.map((r) => ({ ...r }));
      runs[0].text = runs[0].text.trimStart();
      runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();
      if (isHeading) {
        list = null;
        blocks.push({ type: 'heading', level: level >= 0 ? level + 1 : Math.min(3, headingSizes.length + 1), runs: runs.map((r) => ({ ...r, bold: undefined })), align: cur.center ? 'center' : undefined });
      } else if (cur.kind !== 'p') {
        const ordered = cur.kind === 'ol';
        if (!list || list.ordered !== ordered) {
          list = { type: 'list', ordered, items: [] };
          blocks.push(list);
        }
        list.items.push([{ type: 'paragraph', runs }]);
      } else {
        list = null;
        blocks.push({ type: 'paragraph', runs, align: cur.center ? 'center' : undefined, indent: cur.x0 - left > 30 ? Math.min(120, cur.x0 - left) : undefined });
      }
      cur = null;
    };

    // Lines whose first "cell" is only a list marker (• / 1.) are list items, not table rows
    const cellsOf = lines.map((l) => {
      const cells = lineCells(l);
      return cells.length >= 2 && MARKER_ONLY_RE.test(cells[0].text) ? [] : cells;
    });
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const plain = lineText(line).trim();
      // Running page numbers in the top/bottom margin are dropped
      if (PAGE_NUMBER_RE.test(plain) && (line.y > page.height * 0.9 || line.y < page.height * 0.08)) continue;
      // Runs of lines with column gaps become a table
      if (cellsOf[li].length >= 2) {
        let lj = li + 1;
        while (lj < lines.length && cellsOf[lj].length >= 2 && lines[lj].y - lines[lj - 1].y < lines[lj].size * 2.6) lj++;
        if (lj - li >= 2) {
          flush();
          list = null;
          const tableLines = lines.slice(li, lj);
          const grid = gridFromLines(tableLines);
          const headerBold = tableLines[0].items.every((it) => it.bold);
          blocks.push({
            type: 'table',
            headerRows: headerBold ? 1 : 0,
            rows: grid.map((row) => ({ cells: row.map((v) => ({ blocks: v ? [{ type: 'paragraph' as const, runs: [{ text: v }] }] : [] })) })),
          });
          li = lj - 1;
          continue;
        }
      }
      let runs = lineRuns(line);
      const text = runs.map((r) => r.text).join('');
      let kind: 'p' | 'ul' | 'ol' = 'p';
      if (BULLET_RE.test(text)) {
        kind = 'ul';
        runs = stripMarker(runs, BULLET_RE);
      } else if (NUMBER_RE.test(text) && text.length > 4) {
        kind = 'ol';
        runs = stripMarker(runs, NUMBER_RE);
      }
      const lineCenter = (line.x0 + line.x1) / 2;
      const centered = Math.abs(lineCenter - pageCenter) < contentW * 0.04 && line.x1 - line.x0 < contentW * 0.75 && line.x0 - left > contentW * 0.08;
      if (cur) {
        const c: ParaState = cur;
        const gap = line.y - c.lastLine.y;
        const sizeChange = Math.abs(line.size - c.size) > c.size * 0.12;
        const bigGap = gap > c.size * (lineFactor + 0.55);
        const prevShort = c.lastLine.x1 < right - contentW * 0.12 && /[.!?:;]$/.test(lineText(c.lastLine).trim());
        const indentJump = Math.abs(line.x0 - c.lastLine.x0) > line.size * 1.5 && !(c.kind !== 'p' && line.x0 > c.x0);
        const centerChange = c.center !== centered;
        if (kind !== 'p' || sizeChange || bigGap || prevShort || indentJump || centerChange || gap < 0) {
          flush();
        } else {
          joinRuns(c.runs, runs);
          c.lastLine = line;
          continue;
        }
      }
      cur = { runs, size: line.size, x0: line.x0, lastLine: line, center: centered, kind };
    }
    flush();
  });
  return blocks;
}

// ---------------------------------------------------------------------------
// Tables for Excel
// ---------------------------------------------------------------------------

interface Cell {
  x0: number;
  x1: number;
  text: string;
}

function lineCells(line: Line): Cell[] {
  const cells: Cell[] = [];
  let cur: Cell | null = null;
  let prev: PdfTextItem | null = null;
  for (const it of line.items) {
    const gap = prev ? it.x - (prev.x + prev.w) : 0;
    if (!cur || gap > Math.max(it.size * 0.9, 4)) {
      cur = { x0: it.x, x1: it.x + it.w, text: it.str.trim() };
      cells.push(cur);
    } else {
      const sep = gap > it.size * 0.12 && !/\s$/.test(cur.text) && !/^\s/.test(it.str) ? ' ' : '';
      cur.text = (cur.text + sep + it.str).replace(/\s+/g, ' ').trim();
      cur.x1 = Math.max(cur.x1, it.x + it.w);
    }
    prev = it;
  }
  return cells.filter((c) => c.text);
}

/** Converts a page into a grid of cell values (rows × columns). */
export function pageToGrid(page: PdfPageText): Array<Array<string | number>> {
  return gridFromLines(groupLines(page.items)).map((row) => row.map(toNumber));
}

/** Assigns the cells of the given lines to common columns. */
function gridFromLines(lines: Line[]): string[][] {
  if (!lines.length) return [];
  const rowsCells = lines.map(lineCells);
  const left = Math.min(...lines.map((l) => l.x0));
  const right = Math.max(...lines.map((l) => l.x1));
  const width = Math.max(1, right - left);
  const isWideText = (cells: Cell[]) => cells.length === 1 && cells[0].x1 - cells[0].x0 > width * 0.45;

  // Column anchors: the rows with the most cells define the column structure
  // (robust against long cell texts that overflow into the neighbouring column).
  const counts = rowsCells.filter((c) => !isWideText(c)).map((c) => c.length);
  const maxCount = counts.length ? Math.max(...counts) : 1;
  const templateRows = rowsCells.filter((c) => c.length === maxCount && !isWideText(c));
  const bands: Array<[number, number]> = [];
  if (maxCount > 1 && templateRows.length) {
    for (let i = 0; i < maxCount; i++) {
      bands.push([Math.min(...templateRows.map((r) => r[i].x0)), Math.max(...templateRows.map((r) => r[i].x1))]);
    }
    // Resolve overlaps between neighbouring anchors (inconsistent template rows)
    for (let i = 1; i < bands.length; i++) {
      if (bands[i][0] < bands[i - 1][1]) {
        const mid = (bands[i - 1][1] + bands[i][0]) / 2;
        bands[i - 1][1] = mid;
        bands[i][0] = mid;
      }
    }
  } else {
    bands.push([left, right]);
  }
  const colOf = (c: Cell) => {
    let best = 0;
    let bestScore = -Number.MAX_VALUE;
    const center = (c.x0 + c.x1) / 2;
    bands.forEach(([a, b], i) => {
      const overlap = Math.min(b, c.x1) - Math.max(a, c.x0);
      const dist = center < a ? a - center : center > b ? center - b : 0;
      const score = overlap > 0 ? overlap : -dist;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    return best;
  };
  return rowsCells.map((cells) => {
    const row: string[] = new Array(bands.length).fill('');
    for (const c of cells) {
      const col = isWideText(cells) ? 0 : colOf(c);
      row[col] = row[col] ? `${row[col]} ${c.text}` : c.text;
    }
    return row;
  });
}

function toNumber(v: string): string | number {
  const t = v.trim();
  if (!t) return '';
  const cleaned = t.replace(/^[€$£]\s?|\s?[€$£]$/g, '');
  const num = csvValue(cleaned, false);
  return typeof num === 'number' ? num : v;
}
