/**
 * Format-neutral document model shared by all client-side document converters.
 *
 * Readers (DOCX, ODT, RTF, DOC, HTML, EPUB, TXT, CSV, PDF text) produce `Block[]`,
 * writers (PDF flow renderer, DOCX, ODT, RTF, plain text) consume it.
 * Everything here is plain data so it works in the browser and in Node tests.
 */

export type RGB = [number, number, number];

export interface TextRun {
  /** Text content. A `\n` inside the text is a hard line break. */
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  mono?: boolean;
  /** Font size in pt (absolute). */
  size?: number;
  color?: RGB;
  link?: string;
}

export type Align = 'left' | 'center' | 'right' | 'justify';

export interface ParagraphBlock {
  type: 'paragraph';
  runs: TextRun[];
  align?: Align;
  /** Additional left indent in pt. */
  indent?: number;
  /** Space after the paragraph in pt (renderer default when undefined). */
  spaceAfter?: number;
  /** Keep spaces / line structure (code, plain text). */
  preformatted?: boolean;
  quote?: boolean;
}

export interface HeadingBlock {
  type: 'heading';
  level: number; // 1..6
  runs: TextRun[];
  align?: Align;
}

export interface ListBlock {
  type: 'list';
  ordered: boolean;
  start?: number;
  items: Block[][];
}

export interface TableCell {
  blocks: Block[];
  /** Horizontal alignment of the cell text (PDF renderer). */
  align?: Align;
  colSpan?: number;
  rowSpan?: number;
  header?: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableBlock {
  type: 'table';
  rows: TableRow[];
  /** Number of leading rows that form the header (repeated on new pages). */
  headerRows?: number;
  /** Font size override for the table in pt. */
  fontSize?: number;
  /** Optional relative column widths. */
  colWidths?: number[];
}

export interface ImageBlock {
  type: 'image';
  data?: Uint8Array;
  mime?: string;
  /** Unresolved reference (e.g. EPUB relative path); resolved before rendering. */
  src?: string;
  widthPt?: number;
  heightPt?: number;
  alt?: string;
  align?: Align;
}

export interface PageBreakBlock {
  type: 'pageBreak';
}

export interface RuleBlock {
  type: 'rule';
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | TableBlock
  | ImageBlock
  | PageBreakBlock
  | RuleBlock;

export interface DocModel {
  title?: string;
  blocks: Block[];
}

/** Result of a client-side conversion. */
export interface ConversionOutput {
  data: Uint8Array | Blob;
  mime: string;
  /** Extension of the produced file without dot. */
  extension: string;
  /** Non-fatal hints to show to the user (German). */
  warnings?: string[];
}

export function runsText(runs: TextRun[]): string {
  return runs.map((r) => r.text).join('');
}

export function para(text: string, extra: Partial<ParagraphBlock> = {}): ParagraphBlock {
  return { type: 'paragraph', runs: [{ text }], ...extra };
}

/** Recursively visit all blocks (including list items and table cells). */
export function walkBlocks(blocks: Block[], fn: (b: Block) => void): void {
  for (const b of blocks) {
    fn(b);
    if (b.type === 'list') b.items.forEach((item) => walkBlocks(item, fn));
    if (b.type === 'table') b.rows.forEach((r) => r.cells.forEach((c) => walkBlocks(c.blocks, fn)));
  }
}

export function hasTextContent(blocks: Block[]): boolean {
  let found = false;
  walkBlocks(blocks, (b) => {
    if (found) return;
    if ((b.type === 'paragraph' || b.type === 'heading') && runsText(b.runs).trim()) found = true;
    if (b.type === 'image' && (b.data || b.src)) found = true;
  });
  return found;
}

/** Plain-text serialisation (used for EPUB → TXT and table cell flattening). */
export function blocksToPlainText(blocks: Block[], listDepth = 0): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading': {
        const t = runsText(b.runs).trim();
        if (t) out.push(t, '');
        break;
      }
      case 'paragraph': {
        const t = b.preformatted ? runsText(b.runs) : runsText(b.runs).trim();
        out.push(t);
        if (!b.preformatted || (b.spaceAfter ?? 1) > 0) out.push('');
        break;
      }
      case 'list': {
        b.items.forEach((item, i) => {
          const marker = b.ordered ? `${(b.start ?? 1) + i}.` : '•';
          const inner = blocksToPlainText(item, listDepth + 1)
            .split('\n')
            .filter((l) => l.trim() !== '');
          const pad = '  '.repeat(listDepth);
          inner.forEach((line, li) => {
            out.push(li === 0 ? `${pad}${marker} ${line.trimStart()}` : `${pad}   ${line}`);
          });
        });
        out.push('');
        break;
      }
      case 'table': {
        for (const row of b.rows) {
          out.push(
            row.cells
              .map((c) => blocksToPlainText(c.blocks).replace(/\s*\n\s*/g, ' ').trim())
              .join('\t')
          );
        }
        out.push('');
        break;
      }
      case 'image':
        if (b.alt) out.push(`[Bild: ${b.alt}]`, '');
        break;
      case 'pageBreak':
        out.push('', '');
        break;
      case 'rule':
        out.push('----------', '');
        break;
    }
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Plain text → paragraphs, one paragraph per line (blank lines kept as spacing). */
export function plainTextToBlocks(text: string, mono = false): Block[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');
    if (line.includes('\f')) {
      const parts = line.split('\f');
      parts.forEach((p, i) => {
        if (i > 0) blocks.push({ type: 'pageBreak' });
        if (p) blocks.push({ type: 'paragraph', runs: [{ text: p, mono }], preformatted: true, spaceAfter: 0 });
      });
      continue;
    }
    blocks.push({ type: 'paragraph', runs: [{ text: line, mono }], preformatted: true, spaceAfter: 0 });
  }
  // Drop trailing empty lines
  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    if (last.type === 'paragraph' && !runsText(last.runs).trim()) blocks.pop();
    else break;
  }
  return blocks;
}

export function baseName(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  return i > 0 ? fileName.substring(0, i) : fileName;
}

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  return i >= 0 ? fileName.substring(i + 1).toLowerCase() : '';
}

/** Error with a user-facing German message. */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

export interface ProgressContext {
  onProgress?: (pct: number, text?: string) => void;
  signal?: AbortSignal;
}

export function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ConversionError('Konvertierung abgebrochen.');
}

/** Yield to the event loop so the UI stays responsive during long loops. */
export function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Strip characters that are illegal in XML 1.0
    .replace(XML_ILLEGAL, '');
}

const XML_ILLEGAL = new RegExp('[\x00-\x08\x0B\x0C\x0E-\x1F' + String.fromCharCode(0xfffe, 0xffff) + ']', 'g');
