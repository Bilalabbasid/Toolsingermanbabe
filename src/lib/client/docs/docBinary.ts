/**
 * Reader for binary Word 97–2003 documents (.doc, MS-DOC).
 *
 * Extracts the main document text through the piece table (CLX) and applies
 * paragraph properties (tables, list membership, alignment, heading styles)
 * and character properties (bold, italic, underline, strike, size) from the
 * PAPX/CHPX formatted disk pages. Fields show their result text. Embedded
 * pictures, text boxes, headers/footers and footnotes are not extracted.
 */
import * as XLSX from 'xlsx';
import type { Align, Block, TableCell, TableRow, TextRun } from './model';
import { ConversionError, runsText } from './model';

interface CfbEntry {
  content?: ArrayLike<number>;
}
interface CfbApi {
  read: (data: Uint8Array, opts: { type: string }) => unknown;
  find: (cfb: unknown, path: string) => CfbEntry | null;
}

const CFB = (XLSX as unknown as { CFB: CfbApi }).CFB;

function toU8(content: ArrayLike<number> | undefined): Uint8Array {
  if (!content) return new Uint8Array(0);
  return content instanceof Uint8Array ? content : Uint8Array.from(content as ArrayLike<number>);
}

class Reader {
  readonly dv: DataView;
  constructor(readonly b: Uint8Array) {
    this.dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  u8(o: number) { return o < this.b.length ? this.b[o] : 0; }
  u16(o: number) { return o + 2 <= this.b.length ? this.dv.getUint16(o, true) : 0; }
  i16(o: number) { return o + 2 <= this.b.length ? this.dv.getInt16(o, true) : 0; }
  u32(o: number) { return o + 4 <= this.b.length ? this.dv.getUint32(o, true) : 0; }
}

interface Sprm {
  op: number;
  arg: number; // first operand byte/word value
  off: number;
}

function parseSprms(r: Reader, start: number, end: number): Sprm[] {
  const out: Sprm[] = [];
  let p = start;
  while (p + 2 <= end) {
    const op = r.u16(p);
    p += 2;
    const spra = op >> 13;
    let size: number;
    switch (spra) {
      case 0: case 1: size = 1; break;
      case 2: case 4: case 5: size = 2; break;
      case 3: size = 4; break;
      case 7: size = 3; break;
      default: {
        if (op === 0xd608 || op === 0xd606) {
          size = r.u16(p) + 1; // cb (2 bytes) incl. +1
          break;
        }
        size = r.u8(p) + 1;
        if (op === 0xc615 && r.u8(p) === 255) size = 1; // sprmPChgTabs special case (rare)
      }
    }
    const arg = size >= 2 ? r.u16(p) : r.u8(p);
    out.push({ op, arg, off: p });
    p += size;
  }
  return out;
}

interface ParaProps {
  istd: number;
  inTable: boolean;
  ttp: boolean;
  itap: number;
  ilfo: number;
  ilvl: number;
  align?: Align;
  outline: number; // 9 = body text
}

interface CharProps {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  hidden: boolean;
  size?: number;
}

interface FcRange<T> {
  start: number;
  end: number;
  props: T;
}

const JC: Record<number, Align | undefined> = { 0: undefined, 1: 'center', 2: 'right', 3: 'justify', 4: 'justify', 5: 'center', 7: 'justify', 8: 'justify', 9: 'justify' };

function readPapxRanges(word: Reader, table: Reader, fc: number, lcb: number): FcRange<ParaProps>[] {
  const ranges: FcRange<ParaProps>[] = [];
  if (!lcb || fc + lcb > table.b.length) return ranges;
  const n = (lcb - 4) / 8;
  for (let i = 0; i < n; i++) {
    const pn = table.u32(fc + (n + 1) * 4 + i * 4) & 0x3fffff;
    const base = pn * 512;
    if (base + 512 > word.b.length) continue;
    const crun = word.u8(base + 511);
    for (let k = 0; k < crun; k++) {
      const start = word.u32(base + k * 4);
      const end = word.u32(base + (k + 1) * 4);
      const bOffset = word.u8(base + (crun + 1) * 4 + k * 13);
      const props: ParaProps = { istd: 0, inTable: false, ttp: false, itap: 0, ilfo: 0, ilvl: 0, outline: 9 };
      if (bOffset) {
        const off = base + bOffset * 2;
        let cb = word.u8(off);
        let gp = off + 1;
        let len: number;
        if (cb === 0) {
          cb = word.u8(off + 1);
          gp = off + 2;
          len = cb * 2;
        } else {
          len = cb * 2 - 1;
        }
        props.istd = word.u16(gp);
        for (const s of parseSprms(word, gp + 2, Math.min(gp + len, base + 511))) {
          switch (s.op) {
            case 0x2416: props.inTable = s.arg !== 0; break; // sprmPFInTable
            case 0x2417: props.ttp = s.arg !== 0; break; // sprmPFTtp
            case 0x6649: props.itap = word.u32(s.off); props.inTable = props.itap > 0 || props.inTable; break; // sprmPItap
            case 0x460b: props.ilfo = word.i16(s.off); break; // sprmPIlfo
            case 0x260a: props.ilvl = s.arg; break; // sprmPIlvl
            case 0x2403: case 0x2461: props.align = JC[s.arg]; break; // sprmPJc80 / sprmPJc
            case 0x2640: props.outline = s.arg; break; // sprmPOutLvl
          }
        }
      }
      ranges.push({ start, end, props });
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

function readChpxRanges(word: Reader, table: Reader, fc: number, lcb: number): FcRange<CharProps>[] {
  const ranges: FcRange<CharProps>[] = [];
  if (!lcb || fc + lcb > table.b.length) return ranges;
  const n = (lcb - 4) / 8;
  const toggle = (v: number) => v === 1 || v === 0x81;
  for (let i = 0; i < n; i++) {
    const pn = table.u32(fc + (n + 1) * 4 + i * 4) & 0x3fffff;
    const base = pn * 512;
    if (base + 512 > word.b.length) continue;
    const crun = word.u8(base + 511);
    for (let k = 0; k < crun; k++) {
      const start = word.u32(base + k * 4);
      const end = word.u32(base + (k + 1) * 4);
      const off = word.u8(base + (crun + 1) * 4 + k);
      const props: CharProps = { bold: false, italic: false, underline: false, strike: false, hidden: false };
      if (off) {
        const p = base + off * 2;
        const cb = word.u8(p);
        for (const s of parseSprms(word, p + 1, Math.min(p + 1 + cb, base + 511))) {
          switch (s.op) {
            case 0x0835: props.bold = toggle(s.arg); break;
            case 0x0836: props.italic = toggle(s.arg); break;
            case 0x0837: props.strike = toggle(s.arg); break;
            case 0x083c: props.hidden = toggle(s.arg); break; // sprmCFVanish
            case 0x2a3e: props.underline = s.arg !== 0; break; // sprmCKul
            case 0x4a43: if (s.arg >= 8 && s.arg <= 200) props.size = s.arg / 2; break; // sprmCHps
          }
        }
      }
      ranges.push({ start, end, props });
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

function findRange<T>(ranges: FcRange<T>[], fc: number): T | undefined {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ranges[mid];
    if (fc < r.start) hi = mid - 1;
    else if (fc >= r.end) lo = mid + 1;
    else return r.props;
  }
  return undefined;
}

/** Map of ilfo (1-based) → ordered flag per level, from PlfLst/PlfLfo. */
function readListFormats(table: Reader, fcLst: number, lcbLst: number, fcLfo: number, lcbLfo: number): Map<number, boolean[]> {
  const result = new Map<number, boolean[]>();
  try {
    if (!lcbLst || !lcbLfo) return result;
    const cLst = table.u16(fcLst);
    const lsts: Array<{ lsid: number; simple: boolean }> = [];
    for (let i = 0; i < cLst; i++) {
      const o = fcLst + 2 + i * 28;
      lsts.push({ lsid: table.u32(o), simple: (table.u8(o + 26) & 0x01) === 1 });
    }
    let p = fcLst + 2 + cLst * 28;
    const levelsByLsid = new Map<number, boolean[]>();
    for (const lst of lsts) {
      const count = lst.simple ? 1 : 9;
      const levels: boolean[] = [];
      for (let l = 0; l < count; l++) {
        const nfc = table.u8(p + 4);
        const cbChpx = table.u8(p + 24);
        const cbPapx = table.u8(p + 25);
        p += 28 + cbPapx + cbChpx;
        const cch = table.u16(p);
        p += 2 + cch * 2;
        levels.push(nfc !== 23 && nfc !== 255); // 23 = bullet, 255 = none
      }
      levelsByLsid.set(lst.lsid, levels);
    }
    const lfoMac = table.u32(fcLfo);
    for (let i = 0; i < lfoMac; i++) {
      const lsid = table.u32(fcLfo + 4 + i * 16);
      const levels = levelsByLsid.get(lsid);
      if (levels) result.set(i + 1, levels);
    }
  } catch {
    // fall back to bullets
  }
  return result;
}

export function isCfb(data: Uint8Array): boolean {
  return data.length > 8 && data[0] === 0xd0 && data[1] === 0xcf && data[2] === 0x11 && data[3] === 0xe0;
}

export function cfbHasStream(data: Uint8Array, name: string): boolean {
  try {
    const cfb = CFB.read(data, { type: 'array' });
    return Boolean(CFB.find(cfb, name));
  } catch {
    return false;
  }
}

export function docToBlocks(data: Uint8Array): { blocks: Block[]; warnings: string[] } {
  const warnings: string[] = [];
  let cfb: unknown;
  try {
    cfb = CFB.read(data, { type: 'array' });
  } catch {
    throw new ConversionError('Die DOC-Datei ist beschädigt oder kein Word-97–2003-Dokument.');
  }
  if (CFB.find(cfb, 'EncryptionInfo')) {
    throw new ConversionError('Das Dokument ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz in Word und versuchen Sie es erneut.');
  }
  const wordEntry = CFB.find(cfb, 'WordDocument');
  if (!wordEntry) {
    if (CFB.find(cfb, 'Workbook') || CFB.find(cfb, 'Book')) throw new ConversionError('Die Datei ist eine Excel-Arbeitsmappe, kein Word-Dokument.');
    if (CFB.find(cfb, 'PowerPoint Document')) throw new ConversionError('Die Datei ist eine PowerPoint-Präsentation, kein Word-Dokument.');
    throw new ConversionError('Die Datei enthält kein Word-Dokument.');
  }
  const word = new Reader(toU8(wordEntry.content));
  if (word.u16(0) !== 0xa5ec) throw new ConversionError('Die DOC-Datei hat eine unbekannte Struktur.');
  const nFib = word.u16(2);
  const flags = word.u16(0x0a);
  if (nFib < 0x00c1 && nFib !== 0) {
    throw new ConversionError('Dieses Dokument stammt aus Word 6.0/95 oder älter. Dieses Format wird im Browser nicht unterstützt – bitte in Word als .docx speichern.');
  }
  if (flags & 0x0100) {
    throw new ConversionError('Das Dokument ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz in Word und versuchen Sie es erneut.');
  }
  const tableEntry = CFB.find(cfb, flags & 0x0200 ? '1Table' : '0Table');
  if (!tableEntry) throw new ConversionError('Die DOC-Datei ist unvollständig (Tabellenstrom fehlt).');
  const table = new Reader(toU8(tableEntry.content));

  const csw = word.u16(0x20);
  const offRgLw = 0x22 + csw * 2 + 2;
  const cslw = word.u16(offRgLw - 2);
  const ccpText = word.u32(offRgLw + 3 * 4);
  const offFcLcb = offRgLw + cslw * 4 + 2;
  const fcLcb = (index: number): [number, number] => [word.u32(offFcLcb + index * 8), word.u32(offFcLcb + index * 8 + 4)];

  // --- Piece table ---
  const [fcClx, lcbClx] = fcLcb(33);
  if (!lcbClx || fcClx + lcbClx > table.b.length) throw new ConversionError('Die DOC-Datei ist beschädigt (Textstruktur fehlt).');
  let pos = fcClx;
  while (table.u8(pos) === 0x01) pos += 3 + table.u16(pos + 1);
  if (table.u8(pos) !== 0x02) throw new ConversionError('Die DOC-Datei ist beschädigt (Piece Table ungültig).');
  const lcbPcd = table.u32(pos + 1);
  pos += 5;
  const nPieces = Math.floor((lcbPcd - 4) / 12);
  const pieces: Array<{ cpStart: number; cpEnd: number; fc: number; compressed: boolean }> = [];
  for (let i = 0; i < nPieces; i++) {
    const cpStart = table.u32(pos + i * 4);
    const cpEnd = table.u32(pos + (i + 1) * 4);
    const pcd = pos + (nPieces + 1) * 4 + i * 8;
    const fcRaw = table.u32(pcd + 2);
    const compressed = (fcRaw & 0x40000000) !== 0;
    pieces.push({ cpStart, cpEnd, fc: compressed ? (fcRaw & 0x3fffffff) / 2 : fcRaw, compressed });
  }

  const cp1252 = new TextDecoder('windows-1252');
  const singleByte: string[] = [];
  for (let i = 0; i < 256; i++) singleByte.push(cp1252.decode(new Uint8Array([i])));

  const [fcPapx, lcbPapx] = fcLcb(13);
  const [fcChpx, lcbChpx] = fcLcb(12);
  const papx = readPapxRanges(word, table, fcPapx, lcbPapx);
  const chpx = readChpxRanges(word, table, fcChpx, lcbChpx);
  const [fcLst, lcbLst] = fcLcb(73);
  const [fcLfo, lcbLfo] = fcLcb(74);
  const listFormats = readListFormats(table, fcLst, lcbLst, fcLfo, lcbLfo);

  // --- Walk the main text ---
  const blocks: Block[] = [];
  let runs: TextRun[] = [];
  let cellBlocks: Block[] = [];
  let row: TableCell[] = [];
  let tableRows: TableRow[] | null = null;
  let listStack: Array<{ block: Extract<Block, { type: 'list' }>; ilfo: number; level: number }> = [];
  const fieldStack: boolean[] = []; // true = currently in instruction part
  let sawPicture = false;
  const defaultParaProps: ParaProps = { istd: 0, inTable: false, ttp: false, itap: 0, ilfo: 0, ilvl: 0, outline: 9 };

  const closeList = () => {
    listStack = [];
  };
  const closeTable = () => {
    if (tableRows && tableRows.length) blocks.push({ type: 'table', rows: tableRows });
    tableRows = null;
  };

  const emitChar = (ch: string, cp: CharProps) => {
    if (cp.hidden) return;
    const last = runs[runs.length - 1];
    if (last && last.text !== '\n' && ch !== '\n' && Boolean(last.bold) === cp.bold && Boolean(last.italic) === cp.italic &&
      Boolean(last.underline) === cp.underline && Boolean(last.strike) === cp.strike && last.size === cp.size) {
      last.text += ch;
    } else {
      runs.push({
        text: ch,
        bold: cp.bold || undefined,
        italic: cp.italic || undefined,
        underline: cp.underline || undefined,
        strike: cp.strike || undefined,
        size: cp.size,
      });
    }
  };

  const paragraphBlock = (pp: ParaProps): Block | null => {
    if (!runs.some((r) => r.text.trim())) return null;
    const cleaned = runs.map((r) => ({ ...r }));
    cleaned[0].text = cleaned[0].text.replace(/^ +/, '');
    cleaned[cleaned.length - 1].text = cleaned[cleaned.length - 1].text.replace(/[ \n]+$/, '');
    const headingLevel = pp.istd >= 1 && pp.istd <= 9 ? pp.istd : pp.outline < 9 ? pp.outline + 1 : 0;
    if (headingLevel) {
      return { type: 'heading', level: Math.min(6, headingLevel), runs: cleaned.map((r) => ({ ...r, size: undefined, bold: undefined })), align: pp.align };
    }
    return { type: 'paragraph', runs: cleaned, align: pp.align };
  };

  const addToFlow = (block: Block | null, pp: ParaProps) => {
    if (pp.ilfo > 0 && block && block.type !== 'heading') {
      const level = Math.min(8, pp.ilvl);
      // Find or create list at this level
      while (listStack.length && (listStack[listStack.length - 1].level > level || (listStack[listStack.length - 1].level === level && listStack[listStack.length - 1].ilfo !== pp.ilfo))) {
        listStack.pop();
      }
      const top = listStack[listStack.length - 1];
      if (top && top.level === level) {
        top.block.items.push([block]);
        return;
      }
      const ordered = listFormats.get(pp.ilfo)?.[Math.min(level, (listFormats.get(pp.ilfo)?.length ?? 1) - 1)] ?? false;
      const list: Extract<Block, { type: 'list' }> = { type: 'list', ordered, items: [[block]] };
      if (top) {
        const lastItem = top.block.items[top.block.items.length - 1];
        lastItem.push(list);
      } else {
        blocks.push(list);
      }
      listStack.push({ block: list, ilfo: pp.ilfo, level });
      return;
    }
    closeList();
    if (block) {
      blocks.push(block);
      return;
    }
    const last = blocks[blocks.length - 1];
    const prev = blocks[blocks.length - 2];
    const isEmpty = (b?: Block) => b?.type === 'paragraph' && !runsText(b.runs).trim();
    if (!(isEmpty(last) && isEmpty(prev))) blocks.push({ type: 'paragraph', runs: [{ text: '' }], spaceAfter: 0 });
  };

  const defaultChar: CharProps = { bold: false, italic: false, underline: false, strike: false, hidden: false };
  const textEnd = Math.min(ccpText || Number.MAX_SAFE_INTEGER, pieces.length ? pieces[pieces.length - 1].cpEnd : 0);

  for (const piece of pieces) {
    if (piece.cpStart >= textEnd) break;
    const end = Math.min(piece.cpEnd, textEnd);
    for (let cp = piece.cpStart; cp < end; cp++) {
      const rel = cp - piece.cpStart;
      const fc = piece.compressed ? piece.fc + rel : piece.fc + rel * 2;
      let code: number;
      if (piece.compressed) {
        if (fc >= word.b.length) break;
        code = word.b[fc];
      } else {
        if (fc + 1 >= word.b.length) break;
        code = word.u16(fc);
      }
      // Field handling
      if (code === 0x13) { fieldStack.push(true); continue; }
      if (code === 0x14) { if (fieldStack.length) fieldStack[fieldStack.length - 1] = false; continue; }
      if (code === 0x15) { fieldStack.pop(); continue; }
      if (fieldStack.some((v) => v)) continue;

      if (code === 0x0d || code === 0x07 || code === 0x0c) {
        const pp = findRange(papx, fc) ?? defaultParaProps;
        if (code === 0x07) {
          if (pp.ttp) {
            // Row end
            const block = paragraphBlock(pp);
            runs = [];
            if (block) cellBlocks.push(block);
            if (cellBlocks.length) {
              row.push({ blocks: cellBlocks });
              cellBlocks = [];
            }
            if (row.length) {
              if (!tableRows) tableRows = [];
              tableRows.push({ cells: row });
            }
            row = [];
          } else {
            const block = paragraphBlock(pp);
            runs = [];
            if (block) cellBlocks.push(block);
            row.push({ blocks: cellBlocks });
            cellBlocks = [];
          }
          continue;
        }
        const block = paragraphBlock(pp);
        runs = [];
        if (pp.inTable || pp.itap > 0) {
          if (block) cellBlocks.push(block);
        } else {
          if (tableRows) {
            closeList();
            closeTable();
          }
          addToFlow(block, pp);
          if (code === 0x0c) {
            closeList();
            blocks.push({ type: 'pageBreak' });
          }
        }
        continue;
      }

      const chp = findRange(chpx, fc) ?? defaultChar;
      let ch: string;
      if (code === 0x0b) ch = '\n';
      else if (code === 0x09) ch = '\t';
      else if (code === 0x1e) ch = '-';
      else if (code === 0x1f) continue;
      else if (code === 0x01 || code === 0x08) { sawPicture = true; continue; }
      else if (code < 0x20) continue;
      else ch = piece.compressed ? singleByte[code] : String.fromCharCode(code);
      emitChar(ch, chp);
    }
  }
  if (runs.length) addToFlow(paragraphBlock(defaultParaProps), defaultParaProps);
  closeTable();
  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    if ((last.type === 'paragraph' && !runsText(last.runs).trim()) || last.type === 'pageBreak') blocks.pop();
    else break;
  }
  if (sawPicture) warnings.push('Bilder und Grafiken aus DOC-Dateien können im Browser nicht übernommen werden – nur Text, Tabellen und Grundformatierung.');
  if (!blocks.length) throw new ConversionError('Im DOC-Dokument wurde kein Text gefunden.');
  return { blocks, warnings };
}
