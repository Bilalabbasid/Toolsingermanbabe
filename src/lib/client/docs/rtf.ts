/**
 * RTF reader (RTF → Block[]) and writer (Block[] → RTF).
 *
 * The reader handles character formatting, alignment, indents, headings
 * (outline levels / heading styles), tables, embedded PNG/JPEG pictures,
 * Unicode escapes and code pages. The writer produces RTF that Word,
 * LibreOffice and WordPad open (also when saved with a .doc extension).
 */
import type { Align, Block, ParagraphBlock, TableCell, TableRow, TextRun } from './model';
import { ConversionError, runsText } from './model';
import { type ImageTranscoder, imagePixelSize, sniffImage } from './images';

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

type Dest = 'normal' | 'skip' | 'fonttbl' | 'stylesheet' | 'pict';

interface GroupState {
  dest: Dest;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  hidden: boolean;
  fs: number; // half-points
  font: number;
  uc: number;
  pictOwner?: boolean;
  styleOwner?: boolean;
}

interface PictState {
  kind: string;
  hex: string[];
  wgoal: number;
  hgoal: number;
  scx: number;
  scy: number;
}

interface ParaProps {
  align?: Align;
  indent: number; // twips
  intbl: boolean;
  heading?: number;
}

const SKIP_DESTS = new Set([
  'colortbl', 'info', 'fldinst', 'nonshppict', 'header', 'headerl', 'headerr', 'headerf', 'footer',
  'footerl', 'footerr', 'footerf', 'footnote', 'annotation', 'atnid', 'atnauthor', 'object',
  'objdata', 'listtable', 'listoverridetable', 'rsidtbl', 'generator', 'themedata',
  'colorschememapping', 'latentstyles', 'datastore', 'xmlnstbl', 'pgdsctbl', 'revtbl', 'mmathPr',
  'pnseclvl', 'pn', 'bkmkstart', 'bkmkend', 'comment', 'xe', 'tc', 'txe', 'docvar', 'userprops',
  'wgrffmtfilter', 'operator', 'author', 'title', 'subject', 'company', 'creatim', 'revtim',
  'printim', 'buptim', 'shpinst', 'ftnsep', 'ftnsepc', 'aftnsep', 'aftnsepc', 'filetbl',
  'protusertbl', 'template', 'keywords', 'doccomm', 'falt', 'panose', 'fname', 'listpicture',
  'blipuid', 'picprop', 'passwordhash', 'xmlopen', 'xmlclose', 'xmlattrname', 'xmlattrvalue',
  'formfield', 'datafield', 'mhtmltag', 'htmltag', 'factoidname', 'oldcprops', 'oldpprops',
  'oldsprops', 'oldtprops', 'shpgrp', 'do', 'ud',
]);

const CHARSET_CODEPAGE: Record<number, number> = {
  0: 1252, 1: 1252, 77: 10000, 128: 932, 129: 949, 134: 936, 136: 950, 161: 1253, 162: 1254,
  163: 1258, 177: 1255, 178: 1256, 186: 1257, 204: 1251, 222: 874, 238: 1250, 254: 437,
};

const SYMBOL_CODEPAGE = -1;
const codepageTables = new Map<number, string[]>();

function codepageTable(cp: number): string[] {
  let t = codepageTables.get(cp);
  if (t) return t;
  const bytes = new Uint8Array(256);
  for (let i = 0; i < 256; i++) bytes[i] = i;
  let decoded: string | null = null;
  const label = cp === 10000 ? 'macintosh' : cp === 437 ? 'ibm866' : `windows-${cp}`;
  try {
    decoded = new TextDecoder(label).decode(bytes);
  } catch {
    decoded = null;
  }
  if (!decoded || decoded.length !== 256) decoded = new TextDecoder('windows-1252').decode(bytes);
  t = [...decoded];
  codepageTables.set(cp, t);
  return t;
}

function decodeByte(byte: number, cp: number): string {
  if (cp === SYMBOL_CODEPAGE) {
    if (byte < 0x20) return '';
    if (byte < 0x80) return String.fromCharCode(byte);
    return String.fromCharCode(0xf000 + byte); // private-use symbol, mapped by winAnsi/renderers
  }
  return codepageTable(cp)[byte] ?? '?';
}

export function rtfToBlocks(input: string | Uint8Array): Block[] {
  const src = typeof input === 'string' ? input : new TextDecoder('latin1').decode(input);
  if (!/^\s*\{\\rtf/.test(src)) throw new ConversionError('Ungültiges RTF-Dokument: Die RTF-Kennung fehlt.');

  const blocks: Block[] = [];
  let defaultCp = 1252;
  let defaultFont = 0;
  const fontCodepage = new Map<number, number>();
  const headingStyles = new Map<number, number>();
  let curDefFont = 0;
  let styleNum = -1;
  let styleName = '';

  let state: GroupState = {
    dest: 'normal', bold: false, italic: false, underline: false, strike: false, hidden: false,
    fs: 24, font: 0, uc: 1,
  };
  const stack: GroupState[] = [];
  let starPending = false;
  let firstInGroup = false;

  let para: ParaProps = { indent: 0, intbl: false };
  let runs: TextRun[] = [];
  let cellBlocks: Block[] = [];
  let row: TableCell[] = [];
  let tableRows: TableRow[] | null = null;
  let skipChars = 0;
  let pict: PictState | null = null;

  const emit = (text: string) => {
    if (state.hidden || state.dest !== 'normal') return;
    if (!text) return;
    const size = state.fs / 2;
    const last = runs[runs.length - 1];
    if (
      last && last.text !== '\n' && text !== '\n' &&
      Boolean(last.bold) === state.bold && Boolean(last.italic) === state.italic &&
      Boolean(last.underline) === state.underline && Boolean(last.strike) === state.strike && last.size === size
    ) {
      last.text += text;
    } else {
      runs.push({
        text,
        bold: state.bold || undefined,
        italic: state.italic || undefined,
        underline: state.underline || undefined,
        strike: state.strike || undefined,
        size,
      });
    }
  };

  const currentCp = () => fontCodepage.get(state.font) ?? defaultCp;

  const closeTable = () => {
    if (tableRows && tableRows.length) blocks.push({ type: 'table', rows: tableRows });
    tableRows = null;
  };

  const makeBlock = (): Block | null => {
    const hasText = runs.some((r) => r.text.trim());
    if (!hasText) return null;
    // Trim surrounding whitespace
    const cleaned = runs.map((r) => ({ ...r }));
    cleaned[0].text = cleaned[0].text.replace(/^[ ]+/, '');
    cleaned[cleaned.length - 1].text = cleaned[cleaned.length - 1].text.replace(/[ \n]+$/, '');
    if (para.heading) {
      return { type: 'heading', level: para.heading, runs: cleaned.map((r) => ({ ...r, size: undefined, bold: undefined })), align: para.align };
    }
    const p: ParagraphBlock = { type: 'paragraph', runs: cleaned, align: para.align };
    if (para.indent > 0) p.indent = Math.min(200, para.indent / 20);
    return p;
  };

  const endParagraph = (kind: 'par' | 'cell' | 'row' | 'page') => {
    const block = makeBlock();
    runs = [];
    if (kind === 'cell') {
      if (block) cellBlocks.push(block);
      row.push({ blocks: cellBlocks });
      cellBlocks = [];
      return;
    }
    if (kind === 'row') {
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
      return;
    }
    if (para.intbl) {
      if (block) cellBlocks.push(block);
      return;
    }
    closeTable();
    if (block) blocks.push(block);
    else if (kind === 'par') {
      // Empty paragraph = vertical spacing (collapse repeated ones)
      const last = blocks[blocks.length - 1];
      const prev = blocks[blocks.length - 2];
      const isEmpty = (b?: Block) => b?.type === 'paragraph' && !runsText(b.runs).trim();
      if (!(isEmpty(last) && isEmpty(prev))) blocks.push({ type: 'paragraph', runs: [{ text: '' }], spaceAfter: 0 });
    }
    if (kind === 'page') blocks.push({ type: 'pageBreak' });
  };

  const finishPict = () => {
    if (!pict) return;
    const hex = pict.hex.join('').replace(/[^0-9a-fA-F]/g, '');
    if ((pict.kind === 'png' || pict.kind === 'jpg') && hex.length >= 8) {
      const bytes = new Uint8Array(Math.floor(hex.length / 2));
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      const img: Block = {
        type: 'image',
        data: bytes,
        mime: pict.kind === 'png' ? 'image/png' : 'image/jpeg',
        widthPt: pict.wgoal > 0 ? (pict.wgoal / 20) * (pict.scx / 100) : undefined,
        heightPt: pict.hgoal > 0 ? (pict.hgoal / 20) * (pict.scy / 100) : undefined,
        align: para.align,
      };
      // Pictures belong to the current paragraph position
      const pending = makeBlock();
      runs = [];
      const target = para.intbl ? cellBlocks : blocks;
      if (!para.intbl) closeTable();
      if (pending) target.push(pending);
      target.push(img);
    }
    pict = null;
  };

  const handleControl = (word: string, param: number | null, hasParam: boolean) => {
    // Destination selection (first control word of a group)
    if (firstInGroup) {
      firstInGroup = false;
      const star = starPending;
      starPending = false;
      if (word === 'fonttbl') {
        state.dest = 'fonttbl';
        return;
      }
      if (word === 'stylesheet') {
        state.dest = 'stylesheet';
        return;
      }
      if (word === 'pict') {
        if (state.dest === 'normal') {
          state.dest = 'pict';
          state.pictOwner = true;
          pict = { kind: '', hex: [], wgoal: 0, hgoal: 0, scx: 100, scy: 100 };
        } else {
          state.dest = 'skip';
        }
        return;
      }
      if (SKIP_DESTS.has(word)) {
        state.dest = 'skip';
        return;
      }
      if (star && !['shppict', 'fldrslt', 'listtext', 'pntext'].includes(word)) {
        state.dest = 'skip';
        return;
      }
      if (state.dest === 'stylesheet' && !state.styleOwner) {
        state.styleOwner = true;
        styleNum = 0;
        styleName = '';
      }
    }
    if (state.dest === 'skip') {
      if (word === 'bin' && param) skipChars = param;
      return;
    }
    if (state.dest === 'fonttbl') {
      if (word === 'f' && param !== null) curDefFont = param;
      else if (word === 'fcharset' && param !== null) {
        fontCodepage.set(curDefFont, param === 2 ? SYMBOL_CODEPAGE : CHARSET_CODEPAGE[param] ?? defaultCp);
      } else if (word === 'cpg' && param !== null) fontCodepage.set(curDefFont, param);
      return;
    }
    if (state.dest === 'stylesheet') {
      if ((word === 's' || word === 'cs' || word === 'ds' || word === 'ts') && param !== null) styleNum = word === 's' ? param : -1;
      return;
    }
    if (state.dest === 'pict' && pict) {
      switch (word) {
        case 'pngblip': pict.kind = 'png'; break;
        case 'jpegblip': pict.kind = 'jpg'; break;
        case 'emfblip': case 'wmetafile': case 'macpict': case 'dibitmap': case 'wbitmap': pict.kind = 'other'; break;
        case 'picwgoal': pict.wgoal = param ?? 0; break;
        case 'pichgoal': pict.hgoal = param ?? 0; break;
        case 'picscalex': pict.scx = param ?? 100; break;
        case 'picscaley': pict.scy = param ?? 100; break;
        case 'bin': if (param) skipChars = param; break;
      }
      return;
    }

    switch (word) {
      case 'ansicpg': if (param) defaultCp = param; break;
      case 'deff': defaultFont = param ?? 0; state.font = defaultFont; break;
      case 'par': endParagraph('par'); break;
      case 'sect': endParagraph('par'); break;
      case 'page': endParagraph('page'); break;
      case 'line': emit('\n'); break;
      case 'tab': emit('\t'); break;
      case 'cell': case 'nestcell': endParagraph('cell'); break;
      case 'row': case 'nestrow': endParagraph('row'); break;
      case 'pard':
        para = { indent: 0, intbl: false };
        break;
      case 'intbl': para.intbl = true; break;
      case 'itap': para.intbl = (param ?? 0) > 0; break;
      case 'ql': para.align = undefined; break;
      case 'qc': para.align = 'center'; break;
      case 'qr': para.align = 'right'; break;
      case 'qj': para.align = 'justify'; break;
      case 'li': para.indent = param ?? 0; break;
      case 'outlinelevel': if (param !== null && param < 6) para.heading = param + 1; break;
      case 's': if (param !== null && headingStyles.has(param)) para.heading = headingStyles.get(param); break;
      case 'plain':
        state.bold = false; state.italic = false; state.underline = false; state.strike = false;
        state.hidden = false; state.fs = 24; state.font = defaultFont;
        break;
      case 'b': state.bold = !hasParam || param !== 0; break;
      case 'i': state.italic = !hasParam || param !== 0; break;
      case 'ul': case 'uld': case 'uldash': case 'uldb': case 'ulth': case 'ulw': case 'ulwave': case 'uldashd':
        state.underline = !hasParam || param !== 0; break;
      case 'ulnone': state.underline = false; break;
      case 'strike': case 'striked': state.strike = !hasParam || param !== 0; break;
      case 'v': state.hidden = !hasParam || param !== 0; break;
      case 'fs': if (param) state.fs = param; break;
      case 'f': if (param !== null) state.font = param; break;
      case 'uc': state.uc = param ?? 1; break;
      case 'u': {
        if (param === null) break;
        const code = param < 0 ? param + 65536 : param;
        emit(String.fromCharCode(code));
        skipChars = state.uc;
        break;
      }
      case 'emdash': emit('\u2014'); break;
      case 'endash': emit('\u2013'); break;
      case 'bullet': emit('\u2022'); break;
      case 'lquote': emit('\u2018'); break;
      case 'rquote': emit('\u2019'); break;
      case 'ldblquote': emit('\u201c'); break;
      case 'rdblquote': emit('\u201d'); break;
      case 'emspace': case 'enspace': case 'qmspace': emit(' '); break;
      case 'bin': if (param) skipChars = param; break;
    }
  };

  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i];
    if (skipChars > 0 && c !== '{' && c !== '}') {
      // Skip characters following \uN (a \'hh escape counts as one)
      if (c === '\\' && src[i + 1] === "'") i += 4;
      else if (c === '\\') {
        const m = /^\\([a-zA-Z]+)(-?\d+)? ?/.exec(src.substring(i, i + 40));
        i += m ? m[0].length : 2;
      } else if (c === '\r' || c === '\n') {
        i++;
        continue;
      } else i++;
      skipChars--;
      continue;
    }
    if (c === '{') {
      stack.push(state);
      state = { ...state, pictOwner: false, styleOwner: false };
      firstInGroup = true;
      starPending = false;
      i++;
      continue;
    }
    if (c === '}') {
      if (state.pictOwner) finishPict();
      if (state.styleOwner) {
        const m = /(?:heading|berschrift|titre|kop)\s*(\d)/i.exec(styleName);
        if (m && styleNum >= 0) headingStyles.set(styleNum, Math.min(6, Number(m[1])));
      }
      state = stack.pop() ?? state;
      firstInGroup = false;
      skipChars = 0;
      i++;
      continue;
    }
    if (c === '\\') {
      const next = src[i + 1];
      if (next === undefined) break;
      if (/[a-zA-Z]/.test(next)) {
        let j = i + 1;
        while (j < n && /[a-zA-Z]/.test(src[j])) j++;
        const word = src.substring(i + 1, j);
        let k = j;
        if (src[k] === '-' || /\d/.test(src[k] ?? '')) {
          k++;
          while (k < n && /\d/.test(src[k])) k++;
        }
        const hasParam = k > j;
        const param = hasParam ? parseInt(src.substring(j, k), 10) : null;
        if (src[k] === ' ') k++;
        i = k;
        handleControl(word, param, hasParam);
        if (word === 'bin' && param && param > 0) {
          i += param;
          skipChars = 0;
        }
        continue;
      }
      i += 2;
      if (firstInGroup && next !== '*') firstInGroup = false;
      switch (next) {
        case '*':
          starPending = true;
          break;
        case "'": {
          const hex = src.substring(i, i + 2);
          i += 2;
          const byte = parseInt(hex, 16);
          if (Number.isNaN(byte)) break;
          if (state.dest === 'normal') emit(decodeByte(byte, currentCp()));
          else if (state.dest === 'stylesheet') styleName += decodeByte(byte, defaultCp);
          break;
        }
        case '\\': case '{': case '}':
          if (state.dest === 'normal') emit(next);
          else if (state.dest === 'stylesheet') styleName += next;
          break;
        case '~': emit('\u00a0'); break;
        case '_': emit('-'); break;
        case '-': break;
        case '\n': case '\r': if (state.dest === 'normal') endParagraph('par'); break;
        case 'u': break;
        default: break;
      }
      continue;
    }
    if (c === '\r' || c === '\n') {
      i++;
      continue;
    }
    firstInGroup = false;
    const curPict = pict as PictState | null;
    if (state.dest === 'pict' && curPict) {
      curPict.hex.push(c);
    } else if (state.dest === 'stylesheet') {
      if (c === ';') {
        // name complete, recorded on group close
      } else styleName += c;
    } else if (state.dest === 'normal') {
      const code = c.charCodeAt(0);
      emit(code >= 0x80 ? decodeByte(code, currentCp()) : c);
    }
    i++;
  }
  endParagraph('par');
  closeTable();
  // Remove trailing empty paragraphs
  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    if (last.type === 'paragraph' && !runsText(last.runs).trim()) blocks.pop();
    else break;
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

const cp1252Encoder = (() => {
  const map = new Map<string, number>();
  const table = codepageTable(1252);
  for (let b = 0x80; b < 256; b++) {
    const ch = table[b];
    if (ch && ch !== '\ufffd') map.set(ch, b);
  }
  return map;
})();

function rtfEscape(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (ch === '\\' || ch === '{' || ch === '}') out += '\\' + ch;
    else if (ch === '\n') out += '\\line ';
    else if (ch === '\t') out += '\\tab ';
    else if (code < 0x20) continue;
    else if (code < 0x80) out += ch;
    else {
      const b = cp1252Encoder.get(ch);
      if (b !== undefined) out += `\\'${b.toString(16).padStart(2, '0')}`;
      else if (code > 0xffff) {
        const s = String.fromCodePoint(code);
        for (let k = 0; k < s.length; k++) {
          const u = s.charCodeAt(k);
          out += `\\u${u > 32767 ? u - 65536 : u}?`;
        }
      } else out += `\\u${code > 32767 ? code - 65536 : code}?`;
    }
  }
  return out;
}

function runsToRtf(runs: TextRun[], forceBold = false): string {
  return runs
    .map((r) => {
      const fmt: string[] = [];
      if (r.bold || forceBold) fmt.push('\\b');
      if (r.italic) fmt.push('\\i');
      if (r.underline || r.link) fmt.push('\\ul');
      if (r.strike) fmt.push('\\strike');
      if (r.mono) fmt.push('\\f1');
      if (r.size) fmt.push(`\\fs${Math.round(r.size * 2)}`);
      if (r.link) fmt.push('\\cf1');
      const body = rtfEscape(r.text);
      if (!fmt.length) return body;
      return `{${fmt.join('')} ${body}}`;
    })
    .join('');
}

function alignCtl(a?: Align): string {
  return a === 'center' ? '\\qc' : a === 'right' ? '\\qr' : a === 'justify' ? '\\qj' : '\\ql';
}

const HEADING_SIZES = [32, 26, 24, 22, 22, 22];

export interface RtfWriteOptions {
  imageTranscoder?: ImageTranscoder;
  title?: string;
}

async function blocksToRtfBody(blocks: Block[], opts: RtfWriteOptions, ctx: { intbl: boolean; listLevel: number }): Promise<string> {
  const parts: string[] = [];
  const tbl = ctx.intbl ? '\\intbl' : '';
  const listIndent = ctx.listLevel >= 0 ? `\\li${720 * (ctx.listLevel + 1)}` : '';
  for (const b of blocks) {
    switch (b.type) {
      case 'heading': {
        const lvl = Math.min(6, Math.max(1, b.level));
        parts.push(`\\pard\\plain${tbl}\\s${lvl}\\outlinelevel${lvl - 1}\\keepn\\sb240\\sa80${alignCtl(b.align)}\\b\\fs${HEADING_SIZES[lvl - 1]} ${runsToRtf(b.runs.map((r) => ({ ...r, size: undefined })))}\\par\n`);
        break;
      }
      case 'paragraph': {
        const indent = b.indent || b.quote ? `\\li${Math.round(((b.indent ?? 0) + (b.quote ? 20 : 0)) * 20)}` : listIndent;
        const spacing = b.preformatted || b.spaceAfter === 0 ? '\\sa0' : '\\sa120';
        parts.push(`\\pard\\plain${tbl}${indent}${spacing}${alignCtl(b.align)}\\fs22 ${runsToRtf(b.runs)}\\par\n`);
        break;
      }
      case 'list': {
        const lvl = ctx.listLevel + 1;
        const left = 720 * (lvl + 1);
        for (let idx = 0; idx < b.items.length; idx++) {
          const item = b.items[idx];
          const marker = b.ordered ? `${(b.start ?? 1) + idx}.` : "\\f2\\'b7";
          const pn = b.ordered
            ? `{\\*\\pn\\pnlvlbody\\pndec\\pnstart${(b.start ?? 1) + idx}\\pnindent360{\\pntxta .}}`
            : `{\\*\\pn\\pnlvlblt\\pnf2\\pnindent360{\\pntxtb\\'b7}}`;
          const [first, ...rest] = item;
          const head = `\\pard\\plain${tbl}{\\pntext ${marker}\\tab}${pn}\\fi-360\\li${left}\\sa60\\fs22 `;
          if (first && (first.type === 'paragraph' || first.type === 'heading')) {
            parts.push(`${head}${runsToRtf(first.runs)}\\par\n`);
          } else {
            parts.push(`${head}\\par\n`);
            if (first) rest.unshift(first);
          }
          if (rest.length) parts.push(await blocksToRtfBody(rest, opts, { intbl: ctx.intbl, listLevel: lvl }));
        }
        break;
      }
      case 'table': {
        if (ctx.intbl) {
          // Nested tables are flattened to text rows
          for (const row of b.rows) {
            const txt = row.cells.map((c) => c.blocks.map((cb) => (cb.type === 'paragraph' || cb.type === 'heading' ? runsText(cb.runs) : '')).join(' ')).join(' | ');
            parts.push(`\\pard\\plain\\intbl\\fs20 ${rtfEscape(txt)}\\par\n`);
          }
          break;
        }
        const ncols = Math.max(1, ...b.rows.map((r) => r.cells.reduce((s, c) => s + (c.colSpan ?? 1), 0)));
        const colW = Math.floor(9638 / ncols);
        for (let ri = 0; ri < b.rows.length; ri++) {
          const r = b.rows[ri];
          const header = ri < (b.headerRows ?? 0);
          let def = `\\trowd\\trgaph108\\trleft0${header ? '\\trhdr' : ''}`;
          let x = 0;
          for (const c of r.cells) {
            x += colW * (c.colSpan ?? 1);
            def += `\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10${header || c.header ? '\\clcbpat2' : ''}\\cellx${x}`;
          }
          parts.push(def + '\n');
          for (const c of r.cells) {
            const inner = await blocksToRtfBody(c.blocks, opts, { intbl: true, listLevel: -1 });
            // The last \par inside a cell is replaced by \cell
            let body = inner.trim();
            if (header || c.header) body = body.replace(/\\fs22 /g, '\\fs22\\b ');
            if (body.endsWith('\\par')) body = body.substring(0, body.length - 4);
            if (!body) body = '\\pard\\plain\\intbl ';
            parts.push(`${body}\\cell\n`);
          }
          parts.push(`${def}\\row\n`);
        }
        parts.push('\\pard\\plain\\sa120\\par\n');
        break;
      }
      case 'image': {
        if (!b.data) break;
        let data = b.data;
        let kind = sniffImage(data);
        if (kind !== 'png' && kind !== 'jpg') {
          const t = opts.imageTranscoder ? await opts.imageTranscoder(data, kind) : null;
          if (!t) break;
          data = t.data;
          kind = t.kind;
        }
        const px = imagePixelSize(data) ?? { width: 400, height: 300 };
        let wPt = b.widthPt ?? px.width * 0.75;
        let hPt = b.heightPt ?? px.height * 0.75;
        if (b.widthPt && !b.heightPt) hPt = (px.height / px.width) * wPt;
        if (b.heightPt && !b.widthPt) wPt = (px.width / px.height) * hPt;
        const scale = Math.min(1, 480 / wPt, 680 / hPt);
        let hex = '';
        for (let k = 0; k < data.length; k++) {
          hex += data[k].toString(16).padStart(2, '0');
          if (k % 64 === 63) hex += '\n';
        }
        parts.push(
          `\\pard\\plain${tbl}${alignCtl(b.align)}{\\pict${kind === 'png' ? '\\pngblip' : '\\jpegblip'}\\picw${px.width}\\pich${px.height}\\picwgoal${Math.round(wPt * scale * 20)}\\pichgoal${Math.round(hPt * scale * 20)}\n${hex}}\\par\n`
        );
        break;
      }
      case 'pageBreak':
        parts.push('\\page\n');
        break;
      case 'rule':
        parts.push(`\\pard\\plain${tbl}\\brdrb\\brdrs\\brdrw10\\brsp20\\sa120\\par\n`);
        break;
    }
  }
  return parts.join('');
}

export async function blocksToRtf(blocks: Block[], opts: RtfWriteOptions = {}): Promise<string> {
  const body = await blocksToRtfBody(blocks, opts, { intbl: false, listLevel: -1 });
  const styles = [
    '{\\s0\\fs22 Normal;}',
    ...HEADING_SIZES.map((sz, idx) => `{\\s${idx + 1}\\outlinelevel${idx}\\keepn\\sb240\\sa80\\b\\fs${sz}\\sbasedon0\\snext0 heading ${idx + 1};}`),
  ].join('');
  const info = opts.title ? `{\\info{\\title ${rtfEscape(opts.title)}}}` : '';
  return (
    '{\\rtf1\\ansi\\ansicpg1252\\deff0\\uc1' +
    '{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}{\\f1\\fmodern\\fcharset0 Courier New;}{\\f2\\fnil\\fcharset2 Symbol;}}' +
    '{\\colortbl;\\red5\\green99\\blue193;\\red232\\green236\\blue242;}' +
    `{\\stylesheet${styles}}` +
    info +
    '{\\*\\generator Datei Tools;}' +
    '\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1134\\margb1134\\viewkind4\n' +
    body +
    '}'
  );
}

/** RTF strings are pure 7-bit ASCII after escaping. */
export function rtfToBytes(rtf: string): Uint8Array {
  const out = new Uint8Array(rtf.length);
  for (let i = 0; i < rtf.length; i++) out[i] = rtf.charCodeAt(i) & 0x7f;
  return out;
}
