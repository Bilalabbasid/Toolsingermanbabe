/**
 * Reader for binary PowerPoint 97–2003 presentations (.ppt, MS-PPT) → slide model.
 *
 * Follows the persist directory (UserEditAtom chain) to the slides, reads
 * positioned shapes (text boxes, placeholders, pictures) from the slide
 * drawings, text from SlideListWithText / client text boxes with basic
 * paragraph (indent level, alignment) and character formatting (bold, italic,
 * underline, size, RGB colour), and pictures (PNG/JPEG/DIB) from the
 * "Pictures" stream. Masters, backgrounds, charts, WordArt and metafile
 * graphics (EMF/WMF) are not reproduced.
 */
import * as XLSX from 'xlsx';
import type { Align, RGB, TextRun } from './model';
import { ConversionError } from './model';
import type { Deck, Slide, SlideElement, SlidePara } from './slides';

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
  return content instanceof Uint8Array ? content : Uint8Array.from(content);
}

class Buf {
  readonly dv: DataView;
  constructor(readonly b: Uint8Array) {
    this.dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  ok(o: number, n: number) { return o >= 0 && o + n <= this.b.length; }
  u8(o: number) { return this.ok(o, 1) ? this.b[o] : 0; }
  u16(o: number) { return this.ok(o, 2) ? this.dv.getUint16(o, true) : 0; }
  i16(o: number) { return this.ok(o, 2) ? this.dv.getInt16(o, true) : 0; }
  u32(o: number) { return this.ok(o, 4) ? this.dv.getUint32(o, true) : 0; }
  i32(o: number) { return this.ok(o, 4) ? this.dv.getInt32(o, true) : 0; }
}

interface Rec {
  type: number;
  inst: number;
  ver: number;
  len: number;
  off: number; // offset of header
  data: number; // offset of data
}

function header(b: Buf, off: number): Rec | null {
  if (!b.ok(off, 8)) return null;
  const vi = b.u16(off);
  const len = b.u32(off + 4);
  if (off + 8 + len > b.b.length + 8) return null;
  return { ver: vi & 0x0f, inst: vi >> 4, type: b.u16(off + 2), len, off, data: off + 8 };
}

function childrenOf(b: Buf, rec: Rec): Rec[] {
  const out: Rec[] = [];
  let p = rec.data;
  const end = Math.min(rec.data + rec.len, b.b.length);
  let guard = 0;
  while (p + 8 <= end && guard++ < 100000) {
    const h = header(b, p);
    if (!h) break;
    out.push(h);
    p = h.data + h.len;
  }
  return out;
}

const T = {
  Document: 0x03e8,
  DocumentAtom: 0x03e9,
  Slide: 0x03ee,
  SlidePersistAtom: 0x03f3,
  SlideListWithText: 0x0ff0,
  UserEditAtom: 0x0ff5,
  PersistDirectoryAtom: 0x1772,
  TextHeaderAtom: 0x0f9f,
  TextCharsAtom: 0x0fa0,
  TextBytesAtom: 0x0fa8,
  StyleTextPropAtom: 0x0fa1,
  OutlineTextRefAtom: 0x0f9e,
  Drawing: 0x040c,
  DrawingGroup: 0x040b,
  DggContainer: 0xf000,
  BStoreContainer: 0xf001,
  FBSE: 0xf007,
  DgContainer: 0xf002,
  SpgrContainer: 0xf003,
  SpContainer: 0xf004,
  FSPGR: 0xf009,
  FSP: 0xf00a,
  FOPT: 0xf00b,
  ClientTextbox: 0xf00d,
  ChildAnchor: 0xf00f,
  ClientAnchor: 0xf010,
  ClientData: 0xf011,
  PlaceholderAtom: 0x0bc3,
};

interface TextBlock {
  type: number; // TextHeaderAtom textType
  text: string;
  style?: { b: Buf; rec: Rec };
}

function readText(b: Buf, recs: Rec[], startIndex: number): { text: string; style?: { b: Buf; rec: Rec } } | null {
  const r = recs[startIndex];
  let text: string | null = null;
  if (r.type === T.TextCharsAtom) {
    let s = '';
    for (let i = 0; i + 1 < r.len; i += 2) s += String.fromCharCode(b.u16(r.data + i));
    text = s;
  } else if (r.type === T.TextBytesAtom) {
    let s = '';
    for (let i = 0; i < r.len; i++) s += String.fromCharCode(b.u8(r.data + i));
    text = s;
  }
  if (text === null) return null;
  const next = recs[startIndex + 1];
  return { text, style: next && next.type === T.StyleTextPropAtom ? { b, rec: next } : undefined };
}

interface ParaFmt {
  count: number;
  level: number;
  align?: Align;
  bullet?: boolean;
}

interface CharFmt {
  count: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number;
  color?: RGB;
}

/** Parses a StyleTextPropAtom into paragraph and character runs. */
function parseStyle(style: { b: Buf; rec: Rec }, textLength: number): { paras: ParaFmt[]; chars: CharFmt[] } {
  const { b, rec } = style;
  const paras: ParaFmt[] = [];
  const chars: CharFmt[] = [];
  let p = rec.data;
  const end = rec.data + rec.len;
  let covered = 0;
  while (covered < textLength + 1 && p + 6 <= end) {
    const count = b.u32(p);
    const level = b.u16(p + 4);
    const mask = b.u32(p + 6);
    p += 10;
    let bullet: boolean | undefined;
    if (mask & 0x0f) {
      if (mask & 0x01) bullet = (b.u16(p) & 0x01) !== 0;
      p += 2; // bulletFlags
    }
    if (mask & 0x80) p += 2; // bulletChar
    if (mask & 0x10) p += 2; // bulletFontRef
    if (mask & 0x40) p += 2; // bulletSize
    if (mask & 0x20) p += 4; // bulletColor
    let align: Align | undefined;
    if (mask & 0x800) {
      const a = b.u16(p);
      align = a === 1 ? 'center' : a === 2 ? 'right' : a === 3 ? 'justify' : undefined;
      p += 2;
    }
    if (mask & 0x1000) p += 2; // lineSpacing
    if (mask & 0x2000) p += 2; // spaceBefore
    if (mask & 0x4000) p += 2; // spaceAfter
    if (mask & 0x100) p += 2; // leftMargin
    if (mask & 0x400) p += 2; // indent
    if (mask & 0x8000) p += 2; // defaultTabSize
    if (mask & 0x100000) {
      const n = b.u16(p);
      p += 2 + n * 4; // tabStops
    }
    if (mask & 0x10000) p += 2; // fontAlign
    if (mask & 0xe0000) p += 2; // wrapFlags
    if (mask & 0x200000) p += 2; // textDirection
    if (count === 0) break;
    paras.push({ count, level: Math.min(4, level), align, bullet });
    covered += count;
  }
  covered = 0;
  while (covered < textLength + 1 && p + 8 <= end) {
    const count = b.u32(p);
    const mask = b.u32(p + 4);
    p += 8;
    const fmt: CharFmt = { count };
    if (mask & 0x3eb7) {
      const style = b.u16(p);
      if (mask & 0x01) fmt.bold = (style & 0x01) !== 0;
      if (mask & 0x02) fmt.italic = (style & 0x02) !== 0;
      if (mask & 0x04) fmt.underline = (style & 0x04) !== 0;
      p += 2;
    }
    if (mask & 0x10000) p += 2; // fontRef
    if (mask & 0x200000) p += 2; // oldEAFontRef
    if (mask & 0x400000) p += 2; // ansiFontRef
    if (mask & 0x800000) p += 2; // symbolFontRef
    if (mask & 0x20000) {
      fmt.size = b.u16(p);
      p += 2;
    }
    if (mask & 0x40000) {
      const idx = b.u8(p + 3);
      if (idx === 0xfe) fmt.color = [b.u8(p) / 255, b.u8(p + 1) / 255, b.u8(p + 2) / 255];
      p += 4;
    }
    if (mask & 0x80000) p += 2; // position
    if (mask & 0x100000) p += 4; // pp10ext
    if (mask & 0x1000000) p += 2; // newEAFontRef
    if (mask & 0x2000000) p += 2; // csFontRef
    if (mask & 0x4000000) p += 4; // pp11ext
    if (count === 0) break;
    chars.push(fmt);
    covered += count;
  }
  return { paras, chars };
}

const TITLE_TYPES = new Set([0, 6]);
const BODY_TYPES = new Set([1, 5, 7, 8]);
const BULLET_TYPES = new Set([1, 7, 8]);

function buildParagraphs(tb: TextBlock): SlidePara[] {
  const text = tb.text;
  let fmt: { paras: ParaFmt[]; chars: CharFmt[] } = { paras: [], chars: [] };
  try {
    if (tb.style) fmt = parseStyle(tb.style, text.length);
  } catch {
    fmt = { paras: [], chars: [] };
  }
  const paras: SlidePara[] = [];
  let pIdx = 0;
  let pLeft = fmt.paras[0]?.count ?? Number.MAX_SAFE_INTEGER;
  let cIdx = 0;
  let cLeft = fmt.chars[0]?.count ?? Number.MAX_SAFE_INTEGER;
  const isBody = BULLET_TYPES.has(tb.type);
  const pieces = text.split('\r');
  for (const piece of pieces) {
    const pf = fmt.paras[pIdx];
    const runs: TextRun[] = [];
    for (const ch of piece) {
      const cf = fmt.chars[cIdx];
      const c = ch === '\u000b' ? '\n' : ch;
      const last = runs[runs.length - 1];
      const same = last && Boolean(last.bold) === Boolean(cf?.bold) && Boolean(last.italic) === Boolean(cf?.italic) &&
        Boolean(last.underline) === Boolean(cf?.underline) && last.size === cf?.size && last.color === cf?.color;
      if (same) last.text += c;
      else runs.push({ text: c, bold: cf?.bold || undefined, italic: cf?.italic || undefined, underline: cf?.underline || undefined, size: cf?.size, color: cf?.color });
      if (--cLeft <= 0 && cIdx < fmt.chars.length - 1) cLeft = fmt.chars[++cIdx].count;
      if (--pLeft <= 0 && pIdx < fmt.paras.length - 1) pLeft = fmt.paras[++pIdx].count;
    }
    // account for the paragraph mark
    if (--cLeft <= 0 && cIdx < fmt.chars.length - 1) cLeft = fmt.chars[++cIdx].count;
    const level = pf?.level ?? 0;
    if (--pLeft <= 0 && pIdx < fmt.paras.length - 1) pLeft = fmt.paras[++pIdx].count;
    const hasText = runs.some((r) => r.text.trim());
    paras.push({ runs, level, align: pf?.align, bullet: hasText && (pf?.bullet ?? isBody) ? '•' : undefined });
  }
  return paras;
}

function blipData(pictures: Buf, offset: number): Uint8Array | null {
  const h = header(pictures, offset);
  if (!h) return null;
  const uidBytes = 16 * (1 + (h.inst & 1));
  const start = h.data + uidBytes + 1;
  const end = h.data + h.len;
  if (end > pictures.b.length || start >= end) return null;
  if (h.type === 0xf01d || h.type === 0xf02a || h.type === 0xf01e) return pictures.b.slice(start, end);
  if (h.type === 0xf01f) {
    // DIB → BMP: prepend BITMAPFILEHEADER
    const dib = pictures.b.subarray(start, end);
    const dv = new DataView(dib.buffer, dib.byteOffset, dib.byteLength);
    const hdrSize = dv.getUint32(0, true);
    const bitCount = dv.getUint16(14, true);
    const clrUsed = hdrSize >= 36 ? dv.getUint32(32, true) : 0;
    const palette = (clrUsed || (bitCount <= 8 ? 1 << bitCount : 0)) * 4;
    const out = new Uint8Array(14 + dib.length);
    const odv = new DataView(out.buffer);
    out[0] = 0x42;
    out[1] = 0x4d;
    odv.setUint32(2, out.length, true);
    odv.setUint32(10, 14 + hdrSize + palette, true);
    out.set(dib, 14);
    return out;
  }
  return null; // EMF/WMF/PICT/TIFF not supported
}

export function readPpt(data: Uint8Array): { deck: Deck; warnings: string[] } {
  let cfb: unknown;
  try {
    cfb = CFB.read(data, { type: 'array' });
  } catch {
    throw new ConversionError('Die PPT-Datei ist beschädigt oder keine PowerPoint-97–2003-Präsentation.');
  }
  const docEntry = CFB.find(cfb, 'PowerPoint Document');
  if (!docEntry) throw new ConversionError('Die Datei enthält keine PowerPoint-Präsentation.');
  if (CFB.find(cfb, 'EncryptedSummary')) throw new ConversionError('Die Präsentation ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz in PowerPoint.');
  const b = new Buf(toU8(docEntry.content));
  const cu = new Buf(toU8(CFB.find(cfb, 'Current User')?.content));
  const pictures = new Buf(toU8(CFB.find(cfb, 'Pictures')?.content));
  const warnings: string[] = [];

  // --- Persist directory ---
  const persist = new Map<number, number>();
  let docPersistId = 0;
  let editOffset = cu.b.length >= 20 ? cu.u32(16) : -1;
  if (cu.b.length >= 16 && cu.u32(12) === 0xf3d1c4df) {
    throw new ConversionError('Die Präsentation ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz in PowerPoint.');
  }
  const edits: number[] = [];
  const seen = new Set<number>();
  while (editOffset >= 0 && !seen.has(editOffset) && edits.length < 1000) {
    const h = header(b, editOffset);
    if (!h || h.type !== T.UserEditAtom) break;
    seen.add(editOffset);
    edits.push(editOffset);
    if (edits.length === 1) docPersistId = b.u32(h.data + 16);
    const last = b.u32(h.data + 8);
    if (!last) break;
    editOffset = last;
  }
  if (!edits.length) {
    // Fallback: scan for the last UserEditAtom
    throw new ConversionError('Die PPT-Datei hat eine unbekannte Struktur und kann im Browser nicht gelesen werden.');
  }
  for (const eo of edits.reverse()) {
    const h = header(b, eo) as Rec;
    const dirOff = b.u32(h.data + 12);
    const dir = header(b, dirOff);
    if (!dir || dir.type !== T.PersistDirectoryAtom) continue;
    let p = dir.data;
    const end = dir.data + dir.len;
    while (p + 4 <= end) {
      const v = b.u32(p);
      const id = v & 0xfffff;
      const n = v >>> 20;
      p += 4;
      for (let k = 0; k < n && p + 4 <= end; k++, p += 4) persist.set(id + k, b.u32(p));
    }
  }

  const docOff = persist.get(docPersistId);
  const doc = docOff !== undefined ? header(b, docOff) : null;
  if (!doc || doc.type !== T.Document) throw new ConversionError('Die PPT-Datei ist beschädigt (Dokumentstruktur nicht gefunden).');

  let width = 720;
  let height = 540;
  const slideRefs: Array<{ persistId: number; texts: TextBlock[] }> = [];
  const bstore: number[] = [];
  for (const c of childrenOf(b, doc)) {
    if (c.type === T.DocumentAtom) {
      width = b.i32(c.data) / 8 || width;
      height = b.i32(c.data + 4) / 8 || height;
    } else if (c.type === T.SlideListWithText && c.inst === 0) {
      const recs = childrenOf(b, c);
      let cur: { persistId: number; texts: TextBlock[] } | null = null;
      let textType = 4;
      recs.forEach((r, i) => {
        if (r.type === T.SlidePersistAtom) {
          cur = { persistId: b.u32(r.data), texts: [] };
          slideRefs.push(cur);
        } else if (r.type === T.TextHeaderAtom) {
          textType = b.u32(r.data);
        } else if ((r.type === T.TextCharsAtom || r.type === T.TextBytesAtom) && cur) {
          const t = readText(b, recs, i);
          if (t) (cur as { texts: TextBlock[] }).texts.push({ type: textType, ...t });
        }
      });
    } else if (c.type === T.DrawingGroup) {
      const dgg = childrenOf(b, c).find((x) => x.type === T.DggContainer);
      const store = dgg ? childrenOf(b, dgg).find((x) => x.type === T.BStoreContainer) : undefined;
      if (store) for (const f of childrenOf(b, store)) bstore.push(f.type === T.FBSE ? b.u32(f.data + 28) : -1);
    }
  }
  if (!slideRefs.length) throw new ConversionError('Die Präsentation enthält keine Folien.');

  const slides: Slide[] = [];
  let skippedGraphics = false;
  for (const ref of slideRefs) {
    const off = persist.get(ref.persistId);
    const slideRec = off !== undefined ? header(b, off) : null;
    if (!slideRec || slideRec.type !== T.Slide) continue;
    const elements: SlideElement[] = [];
    const usedTextIdx = new Set<number>();
    const drawing = childrenOf(b, slideRec).find((r) => r.type === T.Drawing);
    const dg = drawing ? childrenOf(b, drawing).find((r) => r.type === T.DgContainer) : undefined;
    const root = dg ? childrenOf(b, dg).find((r) => r.type === T.SpgrContainer) : undefined;

    type Tf = (l: number, t: number, r: number, btm: number) => { x: number; y: number; w: number; h: number };
    const baseTf: Tf = (l, t, r, btm) => ({ x: l / 8, y: t / 8, w: (r - l) / 8, h: (btm - t) / 8 });

    const handleShape = (sp: Rec, tf: Tf, inGroup: boolean) => {
      const kids = childrenOf(b, sp);
      const fsp = kids.find((k) => k.type === T.FSP);
      if (fsp && b.u32(fsp.data + 4) & 0x0005) return; // group or patriarch shape descriptor
      let rect: { x: number; y: number; w: number; h: number } | null = null;
      const ca = kids.find((k) => k.type === T.ClientAnchor);
      const ch = kids.find((k) => k.type === T.ChildAnchor);
      if (inGroup && ch) rect = tf(b.i32(ch.data), b.i32(ch.data + 4), b.i32(ch.data + 8), b.i32(ch.data + 12));
      else if (ca) {
        rect = ca.len >= 16
          ? baseTf(b.i32(ca.data + 4), b.i32(ca.data), b.i32(ca.data + 8), b.i32(ca.data + 12))
          : baseTf(b.i16(ca.data + 2), b.i16(ca.data), b.i16(ca.data + 4), b.i16(ca.data + 6));
      }
      if (!rect || rect.w <= 0 || rect.h <= 0) return;
      // Picture?
      const fopt = kids.find((k) => k.type === T.FOPT);
      let pib = 0;
      let fill: RGB | undefined;
      let filled = false;
      if (fopt) {
        for (let i = 0; i < fopt.inst; i++) {
          const o = fopt.data + i * 6;
          const pid = b.u16(o) & 0x3fff;
          const val = b.u32(o + 2);
          if (pid === 0x0104) pib = val;
          else if (pid === 0x0181 && !(b.u8(o + 5) & 0x08)) fill = [b.u8(o + 2) / 255, b.u8(o + 3) / 255, b.u8(o + 4) / 255];
          else if (pid === 0x01bf) filled = (val & 0x00100010) === 0x00100010;
        }
      }
      if (pib > 0) {
        const fo = bstore[pib - 1];
        const img = fo !== undefined && fo >= 0 ? blipData(pictures, fo) : null;
        if (img) elements.push({ kind: 'image', data: img, ...rect });
        else skippedGraphics = true;
      }
      // Text
      const ctb = kids.find((k) => k.type === T.ClientTextbox);
      let tb: TextBlock | undefined;
      if (ctb) {
        const recs = childrenOf(b, ctb);
        let type = 4;
        recs.forEach((r, i) => {
          if (r.type === T.TextHeaderAtom) type = b.u32(r.data);
          else if (r.type === T.OutlineTextRefAtom) {
            const idx = b.u32(r.data);
            const t = ref.texts[idx];
            if (t) {
              tb = t;
              usedTextIdx.add(idx);
            }
          } else if (r.type === T.TextCharsAtom || r.type === T.TextBytesAtom) {
            const t = readText(b, recs, i);
            if (t) tb = { type, ...t };
          }
        });
      }
      if (tb && tb.text.trim()) {
        const isTitle = TITLE_TYPES.has(tb.type);
        elements.push({
          kind: 'text', ...rect,
          paragraphs: buildParagraphs(tb),
          isTitle,
          defaultSize: isTitle ? 36 : BODY_TYPES.has(tb.type) ? 22 : 18,
          anchor: isTitle ? 'middle' : 'top',
          fill: filled ? fill : undefined,
          autofit: true,
        });
      } else if (filled && fill && !pib) {
        elements.push({ kind: 'text', ...rect, paragraphs: [], fill });
      }
    };

    const walk = (grp: Rec, tf: Tf, inGroup: boolean) => {
      const kids = childrenOf(b, grp);
      // First SpContainer of a group carries the group coordinate system
      let childTf = tf;
      const first = kids.find((k) => k.type === T.SpContainer);
      if (first && inGroup) {
        const fk = childrenOf(b, first);
        const fspgr = fk.find((k) => k.type === T.FSPGR);
        const anchor = fk.find((k) => k.type === T.ClientAnchor || k.type === T.ChildAnchor);
        if (fspgr && anchor) {
          const gl = b.i32(fspgr.data), gt = b.i32(fspgr.data + 4), gr = b.i32(fspgr.data + 8), gb = b.i32(fspgr.data + 12);
          const outer = anchor.type === T.ChildAnchor
            ? tf(b.i32(anchor.data), b.i32(anchor.data + 4), b.i32(anchor.data + 8), b.i32(anchor.data + 12))
            : anchor.len >= 16
              ? baseTf(b.i32(anchor.data + 4), b.i32(anchor.data), b.i32(anchor.data + 8), b.i32(anchor.data + 12))
              : baseTf(b.i16(anchor.data + 2), b.i16(anchor.data), b.i16(anchor.data + 4), b.i16(anchor.data + 6));
          const sx = outer.w / Math.max(1, gr - gl);
          const sy = outer.h / Math.max(1, gb - gt);
          childTf = (l, t, r, btm) => ({ x: outer.x + (l - gl) * sx, y: outer.y + (t - gt) * sy, w: (r - l) * sx, h: (btm - t) * sy });
        }
      }
      for (const k of kids) {
        if (k.type === T.SpContainer) handleShape(k, inGroup ? childTf : tf, inGroup);
        else if (k.type === T.SpgrContainer) walk(k, inGroup ? childTf : tf, true);
      }
    };
    if (root) walk(root, baseTf, false);

    // Placeholder texts that were not referenced by a shape (fallback layout)
    const unused = ref.texts.filter((_, i) => !usedTextIdx.has(i) && ref.texts[i].text.trim());
    if (unused.length && !elements.some((e) => e.kind === 'text')) {
      let y = height * 0.08;
      for (const t of unused) {
        const isTitle = TITLE_TYPES.has(t.type);
        const h = isTitle ? height * 0.18 : height * 0.6;
        elements.push({ kind: 'text', x: width * 0.07, y, w: width * 0.86, h, paragraphs: buildParagraphs(t), isTitle, defaultSize: isTitle ? 36 : 22, autofit: true, anchor: isTitle ? 'middle' : 'top' });
        y += h + height * 0.03;
      }
    }
    slides.push({ elements });
  }
  if (!slides.length) throw new ConversionError('Die Folien der Präsentation konnten nicht gelesen werden.');
  if (skippedGraphics) warnings.push('Einige Grafiken (z. B. EMF/WMF-Vektorgrafiken) konnten nicht übernommen werden.');
  return { deck: { width, height, slides }, warnings };
}
