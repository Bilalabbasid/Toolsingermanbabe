/**
 * HTML / XHTML DOM → Block[] conversion. Used for DOCX (via mammoth HTML),
 * HTML files and EPUB chapters. Works with the browser DOM and with
 * @xmldom/xmldom (tests), so only basic DOM APIs are used.
 */
import type { Align, Block, ImageBlock, TableBlock, TableRow, TextRun } from './model';
import { walkBlocks } from './model';
import { parseDataUri } from './images';

interface Style {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  mono?: boolean;
  link?: string;
  pre?: boolean;
  align?: Align;
  quote?: boolean;
  indent?: number;
}

const SKIP = new Set([
  'script', 'style', 'head', 'noscript', 'template', 'svg', 'math', 'iframe', 'object', 'embed',
  'video', 'audio', 'canvas', 'button', 'select', 'input', 'textarea', 'map', 'title', 'meta',
  'link', 'nav-hidden', 'base', 'param', 'source', 'track', 'datalist', 'option', 'dialog',
]);

const BLOCK = new Set([
  'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'nav', 'figure',
  'figcaption', 'address', 'center', 'body', 'html', 'blockquote', 'dd', 'dt', 'dl', 'details',
  'summary', 'form', 'fieldset', 'legend', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'ul', 'ol',
  'table', 'hr', 'li', 'caption', 'hgroup', 'menu', 'dir', 'tbody', 'thead', 'tfoot', 'tr', 'td',
  'th', 'listing', 'xmp', 'plaintext', 'search', 'picture-block',
]);

export function tagOf(el: Element): string {
  const name = (el.localName || el.nodeName || '').toLowerCase();
  const i = name.indexOf(':');
  return i >= 0 ? name.substring(i + 1) : name;
}

function childNodes(node: Node): Node[] {
  const out: Node[] = [];
  const list = node.childNodes;
  if (!list) return out;
  for (let i = 0; i < list.length; i++) out.push(list[i]);
  return out;
}

function attr(el: Element, name: string): string | null {
  return el.getAttribute ? el.getAttribute(name) : null;
}

function styleOf(el: Element): string {
  return (attr(el, 'style') || '').toLowerCase();
}

function isHidden(el: Element): boolean {
  const s = styleOf(el);
  return /display\s*:\s*none/.test(s) || /visibility\s*:\s*hidden/.test(s) || (typeof el.hasAttribute === 'function' && el.hasAttribute('hidden'));
}

function alignOf(el: Element): Align | undefined {
  const s = styleOf(el);
  const m = /text-align\s*:\s*(left|center|right|justify)/.exec(s);
  const cls = /(?:^|\s)align-(center|right|justify)(?:\s|$)/.exec(attr(el, 'class') || '');
  const a = (m?.[1] || attr(el, 'align') || cls?.[1] || '').toLowerCase();
  if (a === 'center' || a === 'right' || a === 'justify' || a === 'left') return a;
  return undefined;
}

function breakBefore(el: Element): boolean {
  return /page-break-before\s*:\s*always|break-before\s*:\s*page/.test(styleOf(el));
}

function breakAfter(el: Element): boolean {
  return /page-break-after\s*:\s*always|break-after\s*:\s*page/.test(styleOf(el));
}

function inlineStyle(el: Element, tag: string, st: Style): Style {
  const s: Style = { ...st };
  switch (tag) {
    case 'b':
    case 'strong':
      s.bold = true;
      break;
    case 'i':
    case 'em':
    case 'cite':
    case 'dfn':
    case 'var':
      s.italic = true;
      break;
    case 'u':
    case 'ins':
      s.underline = true;
      break;
    case 's':
    case 'strike':
    case 'del':
      s.strike = true;
      break;
    case 'code':
    case 'kbd':
    case 'samp':
    case 'tt':
      s.mono = true;
      break;
    case 'a': {
      const href = attr(el, 'href') || attr(el, 'xlink:href');
      if (href && /^(https?:|mailto:)/i.test(href.trim())) s.link = href.trim();
      break;
    }
  }
  const css = styleOf(el);
  if (css) {
    const fw = /font-weight\s*:\s*([a-z0-9]+)/.exec(css)?.[1];
    if (fw) s.bold = fw === 'bold' || fw === 'bolder' || (/^\d+$/.test(fw) && Number(fw) >= 600);
    const fst = /font-style\s*:\s*([a-z]+)/.exec(css)?.[1];
    if (fst) s.italic = fst === 'italic' || fst === 'oblique';
    const td = /text-decoration(?:-line)?\s*:\s*([^;]+)/.exec(css)?.[1];
    if (td) {
      if (td.includes('underline')) s.underline = true;
      if (td.includes('line-through')) s.strike = true;
      if (td.includes('none')) {
        s.underline = false;
        s.strike = false;
      }
    }
    if (/font-family\s*:[^;]*(monospace|courier|consolas)/.test(css)) s.mono = true;
  }
  return s;
}

function runFrom(text: string, st: Style): TextRun {
  const r: TextRun = { text };
  if (st.bold) r.bold = true;
  if (st.italic) r.italic = true;
  if (st.underline) r.underline = true;
  if (st.strike) r.strike = true;
  if (st.mono) r.mono = true;
  if (st.link) r.link = st.link;
  return r;
}

/** Collapses whitespace across run boundaries and trims line starts/ends. */
export function cleanRuns(runs: TextRun[], pre = false): TextRun[] {
  if (pre) {
    const out = runs.filter((r) => r.text.length > 0);
    if (out.length && out[0].text.startsWith('\n')) out[0] = { ...out[0], text: out[0].text.substring(1) };
    while (out.length && /^\s*$/.test(out[out.length - 1].text) && out[out.length - 1].text.includes('\n')) out.pop();
    return out.some((r) => r.text.trim()) ? out : [];
  }
  const out: TextRun[] = [];
  let atLineStart = true;
  let prevSpace = false;
  const trimTrailing = () => {
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i].text === '\n') break;
      const t = out[i].text.replace(/ +$/, '');
      if (t) {
        out[i] = { ...out[i], text: t };
        break;
      }
      out.splice(i, 1);
    }
  };
  for (const r of runs) {
    if (r.text === '\n') {
      trimTrailing();
      out.push(r);
      atLineStart = true;
      prevSpace = false;
      continue;
    }
    let t = r.text;
    if (atLineStart || prevSpace) t = t.replace(/^ +/, '');
    if (!t) continue;
    out.push({ ...r, text: t });
    atLineStart = false;
    prevSpace = t.endsWith(' ');
  }
  trimTrailing();
  while (out.length && out[out.length - 1].text === '\n') out.pop();
  while (out.length && out[0].text === '\n') out.shift();
  return out.some((r) => r.text.trim()) ? out : [];
}

function imageFrom(el: Element): ImageBlock | null {
  const src = attr(el, 'src') || attr(el, 'xlink:href') || attr(el, 'href') || '';
  if (!src) return null;
  const img: ImageBlock = { type: 'image', alt: attr(el, 'alt') || undefined };
  const w = parseFloat(attr(el, 'width') || '');
  const h = parseFloat(attr(el, 'height') || '');
  if (w > 0 && !(attr(el, 'width') || '').includes('%')) img.widthPt = w * 0.75;
  if (h > 0 && !(attr(el, 'height') || '').includes('%')) img.heightPt = h * 0.75;
  if (src.startsWith('data:')) {
    const parsed = parseDataUri(src);
    if (!parsed) return null;
    img.data = parsed.data;
    img.mime = parsed.mime;
  } else {
    img.src = src;
  }
  return img;
}

function convertNodes(nodes: Node[], style: Style): Block[] {
  const out: Block[] = [];
  let runs: TextRun[] = [];
  const flush = () => {
    const cleaned = cleanRuns(runs, style.pre);
    if (cleaned.length) {
      out.push({
        type: 'paragraph',
        runs: cleaned,
        align: style.align,
        quote: style.quote || undefined,
        indent: style.indent || undefined,
        preformatted: style.pre || undefined,
      });
    }
    runs = [];
  };
  const visit = (node: Node, st: Style) => {
    if (node.nodeType === 3 || node.nodeType === 4) {
      let t = node.nodeValue ?? '';
      if (!st.pre) t = t.replace(/[ \t\n\r\f]+/g, ' ');
      if (t) runs.push(runFrom(t, st));
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = tagOf(el);
    if (tag === 'svg') {
      // SVG wrappers (e.g. EPUB covers) – keep embedded raster images
      const imgs = el.getElementsByTagName('*');
      for (let i = 0; i < imgs.length; i++) {
        if (tagOf(imgs[i]) !== 'image') continue;
        flush();
        const img = imageFrom(imgs[i]);
        if (img) out.push(img);
      }
      return;
    }
    if (SKIP.has(tag) || isHidden(el)) return;
    if (tag === 'br') {
      runs.push({ text: '\n' });
      return;
    }
    if (tag === 'img' || tag === 'image') {
      flush();
      const img = imageFrom(el);
      if (img) {
        img.align = st.align;
        out.push(img);
      }
      return;
    }
    if (tag === 'wbr') return;
    if (BLOCK.has(tag)) {
      flush();
      if (breakBefore(el)) out.push({ type: 'pageBreak' });
      out.push(...blockFromElement(el, tag, st));
      if (breakAfter(el)) out.push({ type: 'pageBreak' });
      return;
    }
    const s2 = inlineStyle(el, tag, st);
    for (const c of childNodes(el)) visit(c, s2);
  };
  for (const n of nodes) visit(n, style);
  flush();
  return out;
}

function inlineOnly(st: Style): Style {
  return { bold: st.bold, italic: st.italic, underline: st.underline, strike: st.strike, mono: st.mono, link: st.link };
}

function tableFrom(el: Element, st: Style): Block[] {
  const rows: TableRow[] = [];
  const headerFlags: boolean[] = [];
  const blocks: Block[] = [];
  const cellStyle = inlineOnly(st);
  const visitRows = (parent: Element, inHead: boolean) => {
    for (const child of childNodes(parent)) {
      if (child.nodeType !== 1) continue;
      const c = child as Element;
      const tag = tagOf(c);
      if (tag === 'thead') visitRows(c, true);
      else if (tag === 'tbody' || tag === 'tfoot') visitRows(c, false);
      else if (tag === 'caption') {
        const cap = convertNodes(childNodes(c), { ...cellStyle, bold: true, align: 'center' });
        blocks.push(...cap);
      } else if (tag === 'tr') {
        const row: TableRow = { cells: [] };
        let allTh = true;
        for (const cn of childNodes(c)) {
          if (cn.nodeType !== 1) continue;
          const ce = cn as Element;
          const ct = tagOf(ce);
          if (ct !== 'td' && ct !== 'th') continue;
          if (ct === 'td') allTh = false;
          const colSpan = parseInt(attr(ce, 'colspan') || '1', 10);
          const rowSpan = parseInt(attr(ce, 'rowspan') || '1', 10);
          row.cells.push({
            blocks: convertNodes(childNodes(ce), { ...cellStyle, align: alignOf(ce) }),
            colSpan: colSpan > 1 ? colSpan : undefined,
            rowSpan: rowSpan > 1 ? rowSpan : undefined,
            header: ct === 'th' || undefined,
          });
        }
        if (row.cells.length) {
          rows.push(row);
          headerFlags.push(inHead || (allTh && row.cells.length > 0));
        }
      }
    }
  };
  visitRows(el, false);
  if (!rows.length) return blocks;
  let headerRows = 0;
  while (headerRows < headerFlags.length && headerFlags[headerRows] && headerRows < rows.length - 1) headerRows++;
  const table: TableBlock = { type: 'table', rows, headerRows };
  blocks.push(table);
  return blocks;
}

function blockFromElement(el: Element, tag: string, st: Style): Block[] {
  const align = alignOf(el) ?? st.align;
  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const inner = convertNodes(childNodes(el), { ...inlineOnly(st), align });
      const runs: TextRun[] = [];
      const extra: Block[] = [];
      for (const b of inner) {
        if (b.type === 'paragraph') {
          if (runs.length) runs.push({ text: '\n' });
          runs.push(...b.runs);
        } else extra.push(b);
      }
      const out: Block[] = [];
      if (runs.length) out.push({ type: 'heading', level: Number(tag[1]), runs, align });
      return [...out, ...extra];
    }
    case 'pre':
    case 'listing':
    case 'xmp':
    case 'plaintext':
      return convertNodes(childNodes(el), { ...st, pre: true, mono: true, align: undefined });
    case 'ul':
    case 'ol':
    case 'menu':
    case 'dir': {
      const items: Block[][] = [];
      const itemStyle: Style = { ...inlineOnly(st) };
      for (const c of childNodes(el)) {
        if (c.nodeType === 1 && tagOf(c as Element) === 'li') {
          const blocks = convertNodes(childNodes(c), itemStyle);
          items.push(blocks.length ? blocks : [{ type: 'paragraph', runs: [{ text: '' }] }]);
        } else if (c.nodeType === 1 && ['ul', 'ol'].includes(tagOf(c as Element))) {
          // Nested list directly inside a list (invalid but common): attach to previous item
          const nested = blockFromElement(c as Element, tagOf(c as Element), itemStyle);
          if (items.length) items[items.length - 1].push(...nested);
          else items.push(nested);
        } else if (c.nodeType === 3 && (c.nodeValue || '').trim()) {
          items.push([{ type: 'paragraph', runs: [{ text: (c.nodeValue || '').trim() }] }]);
        }
      }
      if (!items.length) return [];
      const start = parseInt(attr(el, 'start') || '1', 10);
      return [{ type: 'list', ordered: tag === 'ol', start: Number.isFinite(start) ? start : 1, items }];
    }
    case 'li':
      return [{ type: 'list', ordered: false, items: [convertNodes(childNodes(el), inlineOnly(st))] }];
    case 'table':
      return tableFrom(el, st);
    case 'hr': {
      const cls = (attr(el, 'class') || '').toLowerCase();
      if (cls.includes('page-break') || cls.includes('pagebreak') || breakBefore(el) || breakAfter(el)) return [{ type: 'pageBreak' }];
      return [{ type: 'rule' }];
    }
    case 'blockquote':
      return convertNodes(childNodes(el), { ...st, quote: true, align });
    case 'dt':
      return convertNodes(childNodes(el), { ...st, bold: true, align });
    case 'dd':
      return convertNodes(childNodes(el), { ...st, indent: (st.indent ?? 0) + 20, align });
    case 'center':
      return convertNodes(childNodes(el), { ...st, align: 'center' });
    case 'caption':
    case 'figcaption':
      return convertNodes(childNodes(el), { ...st, italic: true, align: align ?? 'center' });
    default:
      return convertNodes(childNodes(el), { ...st, align });
  }
}

/** Converts the children of a DOM node (e.g. `<body>`) into blocks. */
export function domToBlocks(root: Node): Block[] {
  return convertNodes(childNodes(root), {});
}

function getDomParser(): DOMParser {
  const P = (globalThis as unknown as { DOMParser?: typeof DOMParser }).DOMParser;
  if (!P) throw new Error('DOMParser ist in dieser Umgebung nicht verfügbar.');
  return new P();
}

function firstByTag(doc: Document | Element, name: string): Element | null {
  const list = doc.getElementsByTagName(name);
  if (list && list.length) return list[0];
  const ns = (doc as Document).getElementsByTagNameNS?.('http://www.w3.org/1999/xhtml', name);
  return ns && ns.length ? ns[0] : null;
}

export interface ParsedHtml {
  title?: string;
  blocks: Block[];
}

/** Parses an HTML or XHTML string into blocks. */
export function htmlStringToBlocks(html: string, xhtml = false): ParsedHtml {
  const parser = getDomParser();
  let doc: Document | null = null;
  if (xhtml) {
    try {
      doc = parser.parseFromString(html, 'application/xhtml+xml');
      if (!doc || doc.getElementsByTagName('parsererror').length) doc = null;
    } catch {
      doc = null;
    }
  }
  if (!doc) doc = parser.parseFromString(html, 'text/html');
  const titleEl = firstByTag(doc, 'title');
  const body = firstByTag(doc, 'body') || doc.documentElement;
  const title = titleEl?.textContent?.trim() || undefined;
  return { title, blocks: body ? domToBlocks(body) : [] };
}

/** Resolves `src` references of image blocks (e.g. EPUB-internal paths). */
export async function resolveImages(
  blocks: Block[],
  resolver: (src: string) => Promise<{ data: Uint8Array; mime?: string } | null>
): Promise<void> {
  const pending: ImageBlock[] = [];
  walkBlocks(blocks, (b) => {
    if (b.type === 'image' && !b.data && b.src) pending.push(b);
  });
  for (const img of pending) {
    try {
      const r = await resolver(img.src as string);
      if (r) {
        img.data = r.data;
        img.mime = r.mime;
      }
    } catch {
      // ignore unresolved images
    }
  }
}
