/**
 * PPTX (PresentationML) reader → slide model.
 *
 * Supports slide order, placeholder positions inherited from layouts/masters,
 * text with basic formatting and bullets, theme colours, solid shape fills,
 * pictures, group shapes and tables. Charts, SmartArt, gradients and effects
 * are not rendered (SmartArt/OLE fall back to their preview image if present).
 */
import JSZip from 'jszip';
import type { Align, RGB, TextRun } from './model';
import { ConversionError, checkAbort } from './model';
import { attrNS, elementChildren, localName, parseXml } from './odfCommon';
import type { Deck, Slide, SlideElement, SlidePara, SlideTable, SlideText } from './slides';
import { sniffImage } from './images';

const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const EMU = 12700;

function child(el: Element | null | undefined, ...names: string[]): Element | null {
  let cur: Element | null | undefined = el;
  for (const n of names) {
    if (!cur) return null;
    cur = elementChildren(cur).find((c) => localName(c) === n) ?? null;
  }
  return cur ?? null;
}

function children(el: Element | null | undefined, name: string): Element[] {
  return el ? elementChildren(el).filter((c) => localName(c) === name) : [];
}

function num(el: Element | null, attr: string): number | undefined {
  const v = el?.getAttribute(attr);
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function dirOf(p: string) {
  const i = p.lastIndexOf('/');
  return i >= 0 ? p.substring(0, i + 1) : '';
}

function resolvePath(base: string, target: string): string {
  if (target.startsWith('/')) return target.substring(1);
  const parts = (base + target).split('/');
  const out: string[] = [];
  for (const p of parts) {
    if (p === '..') out.pop();
    else if (p !== '.' && p !== '') out.push(p);
  }
  return out.join('/');
}

async function readRels(zip: JSZip, partPath: string): Promise<Map<string, { target: string; type: string; external: boolean }>> {
  const relsPath = `${dirOf(partPath)}_rels/${partPath.substring(partPath.lastIndexOf('/') + 1)}.rels`;
  const map = new Map<string, { target: string; type: string; external: boolean }>();
  const f = zip.file(relsPath);
  if (!f) return map;
  const doc = parseXml(await f.async('string'));
  const all = doc.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    const r = all[i];
    if (localName(r) !== 'Relationship') continue;
    const id = r.getAttribute('Id');
    const target = r.getAttribute('Target');
    if (!id || !target) continue;
    const external = r.getAttribute('TargetMode') === 'External';
    map.set(id, { target: external ? target : resolvePath(dirOf(partPath), target), type: r.getAttribute('Type') || '', external });
  }
  return map;
}

// --- colours --------------------------------------------------------------

function hexToRgb(h: string): RGB | undefined {
  if (!/^[0-9a-f]{6}$/i.test(h)) return undefined;
  return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
}

function adjustLum(c: RGB, mod?: number, off?: number, tint?: number, shade?: number): RGB {
  let [r, g, b] = c;
  if (tint !== undefined) {
    const t = tint / 100000;
    r = r + (1 - r) * (1 - t);
    g = g + (1 - g) * (1 - t);
    b = b + (1 - b) * (1 - t);
  }
  if (shade !== undefined) {
    const s = shade / 100000;
    r *= s;
    g *= s;
    b *= s;
  }
  if (mod === undefined && off === undefined) return [r, g, b];
  // RGB → HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  l = Math.max(0, Math.min(1, l * ((mod ?? 100000) / 100000) + (off ?? 0) / 100000));
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

type Theme = Map<string, RGB>;

function colorFrom(el: Element | null, theme: Theme): RGB | undefined {
  if (!el) return undefined;
  const c = elementChildren(el).find((x) => ['srgbClr', 'schemeClr', 'sysClr', 'prstClr', 'scrgbClr'].includes(localName(x)));
  if (!c) return undefined;
  let base: RGB | undefined;
  const ln = localName(c);
  if (ln === 'srgbClr') base = hexToRgb(c.getAttribute('val') || '');
  else if (ln === 'sysClr') base = hexToRgb(c.getAttribute('lastClr') || '') ?? (c.getAttribute('val') === 'window' ? [1, 1, 1] : [0, 0, 0]);
  else if (ln === 'schemeClr') {
    const v = c.getAttribute('val') || '';
    const mapped = ({ tx1: 'dk1', bg1: 'lt1', tx2: 'dk2', bg2: 'lt2' } as Record<string, string>)[v] ?? v;
    base = theme.get(mapped);
  } else if (ln === 'prstClr') {
    base = ({ black: [0, 0, 0], white: [1, 1, 1], red: [1, 0, 0], blue: [0, 0, 1], green: [0, 0.5, 0] } as Record<string, RGB>)[c.getAttribute('val') || ''];
  }
  if (!base) return undefined;
  const mod = num(child(c, 'lumMod'), 'val');
  const off = num(child(c, 'lumOff'), 'val');
  const tint = num(child(c, 'tint'), 'val');
  const shade = num(child(c, 'shade'), 'val');
  return adjustLum(base, mod, off, tint, shade);
}

function fillFrom(spPr: Element | null, theme: Theme): RGB | null | undefined {
  if (!spPr) return undefined;
  if (child(spPr, 'noFill')) return null;
  const solid = child(spPr, 'solidFill');
  if (solid) return colorFrom(solid, theme);
  const grad = child(spPr, 'gradFill');
  if (grad) {
    const gs = child(grad, 'gsLst');
    const first = gs ? children(gs, 'gs')[0] : null;
    return colorFrom(first, theme);
  }
  return undefined;
}

// --- placeholders & text styles ------------------------------------------

interface PhInfo {
  type: string;
  idx?: string;
}

function phOf(sp: Element): PhInfo | null {
  const nv = elementChildren(sp).find((c) => /^nv.*Pr$/.test(localName(c)));
  const ph = child(nv, 'nvPr', 'ph');
  if (!ph) return null;
  return { type: ph.getAttribute('type') || 'body', idx: ph.getAttribute('idx') || undefined };
}

interface LevelStyle {
  size?: number;
  color?: RGB;
  bold?: boolean;
  bullet?: string | null; // null = explicitly none
  marL?: number;
  align?: Align;
}

type LevelStyles = Array<LevelStyle | undefined>;

const ALGN: Record<string, Align> = { ctr: 'center', r: 'right', just: 'justify', l: 'left', dist: 'justify' };

function parsePPr(pPr: Element | null, theme: Theme): LevelStyle {
  const st: LevelStyle = {};
  if (!pPr) return st;
  const algn = pPr.getAttribute('algn');
  if (algn && ALGN[algn]) st.align = ALGN[algn];
  const marL = num(pPr, 'marL');
  if (marL !== undefined) st.marL = marL / EMU;
  if (child(pPr, 'buNone')) st.bullet = null;
  const bu = child(pPr, 'buChar');
  if (bu) st.bullet = bu.getAttribute('char') || '•';
  if (child(pPr, 'buAutoNum')) st.bullet = 'number';
  const def = child(pPr, 'defRPr');
  if (def) {
    const sz = num(def, 'sz');
    if (sz) st.size = sz / 100;
    const b = def.getAttribute('b');
    if (b) st.bold = b === '1' || b === 'true';
    const c = colorFrom(child(def, 'solidFill'), theme);
    if (c) st.color = c;
  }
  return st;
}

function parseLstStyle(lst: Element | null, theme: Theme): LevelStyles {
  const out: LevelStyles = [];
  if (!lst) return out;
  for (let l = 1; l <= 9; l++) {
    const p = child(lst, `lvl${l}pPr`);
    if (p) out[l - 1] = parsePPr(p, theme);
  }
  return out;
}

function mergeLevel(...styles: Array<LevelStyle | undefined>): LevelStyle {
  const out: LevelStyle = {};
  for (const s of styles) {
    if (!s) continue;
    for (const [k, v] of Object.entries(s)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

interface PhDef {
  xfrm?: { x: number; y: number; w: number; h: number };
  lst: LevelStyles;
  anchor?: SlideText['anchor'];
}

interface LayoutInfo {
  byIdx: Map<string, PhDef>;
  byType: Map<string, PhDef>;
}

function xfrmOf(spPr: Element | null): PhDef['xfrm'] {
  const x = child(spPr, 'xfrm');
  const off = child(x, 'off');
  const ext = child(x, 'ext');
  if (!off || !ext) return undefined;
  return { x: (num(off, 'x') ?? 0) / EMU, y: (num(off, 'y') ?? 0) / EMU, w: (num(ext, 'cx') ?? 0) / EMU, h: (num(ext, 'cy') ?? 0) / EMU };
}

function anchorOf(bodyPr: Element | null): SlideText['anchor'] {
  const a = bodyPr?.getAttribute('anchor');
  return a === 'ctr' ? 'middle' : a === 'b' ? 'bottom' : a === 't' ? 'top' : undefined;
}

function collectPlaceholders(spTree: Element | null, theme: Theme): LayoutInfo {
  const info: LayoutInfo = { byIdx: new Map(), byType: new Map() };
  if (!spTree) return info;
  for (const sp of children(spTree, 'sp')) {
    const ph = phOf(sp);
    if (!ph) continue;
    const def: PhDef = {
      xfrm: xfrmOf(child(sp, 'spPr')),
      lst: parseLstStyle(child(sp, 'txBody', 'lstStyle'), theme),
      anchor: anchorOf(child(sp, 'txBody', 'bodyPr')),
    };
    if (ph.idx) info.byIdx.set(ph.idx, def);
    if (!info.byType.has(ph.type)) info.byType.set(ph.type, def);
  }
  return info;
}

function normalizePhType(t: string): string {
  if (t === 'ctrTitle') return 'title';
  if (t === 'subTitle' || t === 'obj') return 'body';
  return t;
}

function lookupPh(info: LayoutInfo | undefined, ph: PhInfo): PhDef | undefined {
  if (!info) return undefined;
  return (ph.idx ? info.byIdx.get(ph.idx) : undefined) ?? info.byType.get(ph.type) ?? info.byType.get(normalizePhType(ph.type));
}

interface MasterInfo {
  ph: LayoutInfo;
  title: LevelStyles;
  body: LevelStyles;
  other: LevelStyles;
  background?: { color?: RGB; image?: Uint8Array };
  elements: SlideElement[];
}

// --- shape conversion -------------------------------------------------------

interface Ctx {
  zip: JSZip;
  theme: Theme;
  rels: Map<string, { target: string; type: string; external: boolean }>;
  layout?: LayoutInfo;
  master?: MasterInfo;
  images: Map<string, Uint8Array>;
}

interface Transform {
  (x: number, y: number, w: number, h: number): { x: number; y: number; w: number; h: number };
}

const identity: Transform = (x, y, w, h) => ({ x, y, w, h });

async function imageForRel(ctx: Ctx, rId: string | null): Promise<Uint8Array | null> {
  if (!rId) return null;
  const rel = ctx.rels.get(rId);
  if (!rel || rel.external) return null;
  if (ctx.images.has(rel.target)) return ctx.images.get(rel.target) ?? null;
  const f = ctx.zip.file(rel.target);
  if (!f) return null;
  const data = await f.async('uint8array');
  ctx.images.set(rel.target, data);
  return data;
}

function textParagraphs(txBody: Element | null, ctx: Ctx, levels: (lvl: number) => LevelStyle, defaultBold = false): SlidePara[] {
  const paras: SlidePara[] = [];
  if (!txBody) return paras;
  const shapeLst = parseLstStyle(child(txBody, 'lstStyle'), ctx.theme);
  for (const p of children(txBody, 'p')) {
    const pPr = child(p, 'pPr');
    const lvl = Math.min(8, num(pPr, 'lvl') ?? 0);
    const own = parsePPr(pPr, ctx.theme);
    const st = mergeLevel(levels(lvl), shapeLst[lvl], own);
    const runs: TextRun[] = [];
    for (const r of elementChildren(p)) {
      const ln = localName(r);
      if (ln === 'r' || ln === 'fld') {
        const t = child(r, 't')?.textContent ?? '';
        if (!t) continue;
        const rPr = child(r, 'rPr');
        const run: TextRun = { text: t };
        const sz = num(rPr, 'sz');
        if (sz) run.size = sz / 100;
        const b = rPr?.getAttribute('b');
        if (b ? b === '1' || b === 'true' : st.bold || defaultBold) run.bold = true;
        const i = rPr?.getAttribute('i');
        if (i === '1' || i === 'true') run.italic = true;
        const u = rPr?.getAttribute('u');
        if (u && u !== 'none') run.underline = true;
        const strike = rPr?.getAttribute('strike');
        if (strike && strike !== 'noStrike') run.strike = true;
        const col = colorFrom(child(rPr, 'solidFill'), ctx.theme);
        if (col) run.color = col;
        else if (st.color) run.color = st.color;
        const cap = rPr?.getAttribute('cap');
        if (cap === 'all') run.text = run.text.toUpperCase();
        const link = child(rPr, 'hlinkClick');
        if (link) {
          const rel = ctx.rels.get(attrNS(link, R_NS, 'id') || '');
          if (rel?.external && /^(https?:|mailto:)/i.test(rel.target)) run.link = rel.target;
        }
        runs.push(run);
      } else if (ln === 'br') {
        runs.push({ text: '\n' });
      }
    }
    const hasText = runs.some((r) => r.text.trim());
    paras.push({
      runs,
      align: st.align,
      level: lvl,
      bullet: hasText && st.bullet ? st.bullet : undefined,
      marginLeft: st.marL,
      defaultSize: st.size,
    });
  }
  return paras;
}

async function convertShapes(spTree: Element, ctx: Ctx, tf: Transform, out: SlideElement[], isMaster = false): Promise<void> {
  for (const el of elementChildren(spTree)) {
    const ln = localName(el);
    try {
      if (ln === 'sp') {
        const ph = phOf(el);
        if (isMaster && ph) continue; // master placeholders are templates only
        const spPr = child(el, 'spPr');
        let xf = xfrmOf(spPr);
        const layoutDef = ph ? lookupPh(ctx.layout, ph) : undefined;
        const masterDef = ph ? lookupPh(ctx.master?.ph, ph) : undefined;
        if (!xf) xf = layoutDef?.xfrm ?? masterDef?.xfrm;
        if (!xf) continue;
        const box = tf(xf.x, xf.y, xf.w, xf.h);
        const isTitle = ph ? ['title', 'ctrTitle'].includes(ph.type) : false;
        const group = isTitle ? ctx.master?.title : ph && ['body', 'obj', 'subTitle'].includes(ph.type) ? ctx.master?.body : ctx.master?.other;
        const levels = (lvl: number) =>
          mergeLevel(group?.[lvl], masterDef?.lst[lvl], layoutDef?.lst[lvl], ph?.type === 'subTitle' ? { bullet: null } : undefined, !ph ? { bullet: null } : undefined);
        const txBody = child(el, 'txBody');
        const paragraphs = textParagraphs(txBody, ctx, levels);
        let fill = fillFrom(spPr, ctx.theme);
        if (fill === undefined && !ph) {
          // Theme style reference (p:style/a:fillRef)
          const fillRef = child(el, 'style', 'fillRef');
          if (fillRef && (num(fillRef, 'idx') ?? 0) > 0) fill = colorFrom(fillRef, ctx.theme);
        }
        const ln2 = child(spPr, 'ln');
        let line: RGB | undefined;
        if (ln2 && !child(ln2, 'noFill')) line = colorFrom(child(ln2, 'solidFill'), ctx.theme);
        else if (!ln2 && !ph) {
          const lnRef = child(el, 'style', 'lnRef');
          if (lnRef && (num(lnRef, 'idx') ?? 0) > 0) line = colorFrom(lnRef, ctx.theme);
        }
        const prst = child(spPr, 'prstGeom')?.getAttribute('prst') || 'rect';
        const bodyPr = child(txBody, 'bodyPr');
        const ins = (a: string, d: number) => (num(bodyPr, a) ?? d) / EMU;
        let defaultColor: RGB | undefined;
        if (!ph) {
          const fontRef = child(el, 'style', 'fontRef');
          defaultColor = colorFrom(fontRef, ctx.theme);
        }
        const text: SlideText = {
          kind: 'text',
          ...box,
          paragraphs,
          anchor: anchorOf(bodyPr) ?? layoutDef?.anchor ?? masterDef?.anchor ?? (isTitle ? 'middle' : 'top'),
          fill: fill ?? undefined,
          line,
          geom: prst === 'ellipse' ? 'ellipse' : prst.startsWith('round') ? 'roundRect' : 'rect',
          insets: [ins('lIns', 91440), ins('tIns', 45720), ins('rIns', 91440), ins('bIns', 45720)],
          isTitle,
          defaultSize: isTitle ? 32 : 18,
          defaultColor: defaultColor ?? ctx.theme.get('dk1'),
          autofit: Boolean(child(bodyPr, 'normAutofit')),
        };
        if (prst === 'line' || prst.includes('Connector')) continue;
        if (!paragraphs.some((p) => p.runs.some((r) => r.text.trim())) && !text.fill && !text.line) continue;
        out.push(text);
      } else if (ln === 'pic') {
        const blip = child(el, 'blipFill', 'blip');
        const data = await imageForRel(ctx, blip ? attrNS(blip, R_NS, 'embed') : null);
        const xf = xfrmOf(child(el, 'spPr'));
        const ph = phOf(el);
        const pos = xf ?? (ph ? lookupPh(ctx.layout, ph)?.xfrm ?? lookupPh(ctx.master?.ph, ph)?.xfrm : undefined);
        if (!data || !pos || sniffImage(data) === 'unknown') continue;
        out.push({ kind: 'image', data, ...tf(pos.x, pos.y, pos.w, pos.h) });
      } else if (ln === 'grpSp') {
        const x = child(child(el, 'grpSpPr'), 'xfrm');
        const off = child(x, 'off');
        const ext = child(x, 'ext');
        const chOff = child(x, 'chOff');
        const chExt = child(x, 'chExt');
        let inner = tf;
        if (off && ext && chOff && chExt) {
          const ox = (num(off, 'x') ?? 0) / EMU;
          const oy = (num(off, 'y') ?? 0) / EMU;
          const cx = (num(chOff, 'x') ?? 0) / EMU;
          const cy = (num(chOff, 'y') ?? 0) / EMU;
          const sx = (num(ext, 'cx') ?? 1) / Math.max(1, num(chExt, 'cx') ?? 1);
          const sy = (num(ext, 'cy') ?? 1) / Math.max(1, num(chExt, 'cy') ?? 1);
          inner = (gx, gy, gw, gh) => tf(ox + (gx - cx) * sx, oy + (gy - cy) * sy, gw * sx, gh * sy);
        }
        await convertShapes(el, ctx, inner, out, isMaster);
      } else if (ln === 'graphicFrame') {
        const x = child(el, 'xfrm');
        const off = child(x, 'off');
        const ext = child(x, 'ext');
        if (!off || !ext) continue;
        const pos = tf((num(off, 'x') ?? 0) / EMU, (num(off, 'y') ?? 0) / EMU, (num(ext, 'cx') ?? 0) / EMU, (num(ext, 'cy') ?? 0) / EMU);
        const gd = child(el, 'graphic', 'graphicData');
        const tbl = child(gd, 'tbl');
        if (tbl) {
          const colWidths = children(child(tbl, 'tblGrid'), 'gridCol').map((g) => (num(g, 'w') ?? 0) / EMU);
          const rows: SlideTable['rows'] = children(tbl, 'tr').map((tr) => ({
            h: (num(tr, 'h') ?? 0) / EMU,
            cells: children(tr, 'tc')
              .filter((tc) => tc.getAttribute('hMerge') !== '1')
              .map((tc) => ({
                paragraphs: textParagraphs(child(tc, 'txBody'), ctx, () => ({ bullet: null, size: 14 })),
                fill: fillFrom(child(tc, 'tcPr'), ctx.theme) ?? undefined,
              })),
          }));
          out.push({ kind: 'table', ...pos, colWidths, rows });
        } else {
          // Charts / SmartArt / OLE: use a fallback picture if one exists
          const fallbackPic = Array.from(el.getElementsByTagName('*')).find((n) => localName(n) === 'pic');
          const blip = fallbackPic ? Array.from(fallbackPic.getElementsByTagName('*')).find((n) => localName(n) === 'blip') : undefined;
          const data = blip ? await imageForRel(ctx, attrNS(blip, R_NS, 'embed')) : null;
          if (data && ['png', 'jpg', 'gif', 'bmp'].includes(sniffImage(data))) {
            out.push({ kind: 'image', data, ...pos });
          } else {
            out.push({
              kind: 'text', ...pos,
              paragraphs: [{ runs: [{ text: '[Diagramm / Objekt – nicht darstellbar]', italic: true, color: [0.4, 0.42, 0.46] }], level: 0, align: 'center' }],
              anchor: 'middle', line: [0.75, 0.77, 0.8], defaultSize: 12,
            });
          }
        }
      } else if (ln === 'AlternateContent') {
        const fallback = child(el, 'Fallback') ?? child(el, 'Choice');
        if (fallback) await convertShapes(fallback, ctx, tf, out, isMaster);
      }
    } catch {
      // Skip shapes that cannot be interpreted
    }
  }
}

async function backgroundOf(cSld: Element | null, ctx: Ctx): Promise<{ color?: RGB; image?: Uint8Array } | undefined> {
  const bg = child(cSld, 'bg');
  if (!bg) return undefined;
  const bgPr = child(bg, 'bgPr');
  if (bgPr) {
    const blip = child(bgPr, 'blipFill', 'blip');
    if (blip) {
      const data = await imageForRel(ctx, attrNS(blip, R_NS, 'embed'));
      if (data) return { image: data };
    }
    const fill = fillFrom(bgPr, ctx.theme);
    if (fill) return { color: fill };
  }
  const ref = child(bg, 'bgRef');
  if (ref) {
    const c = colorFrom(ref, ctx.theme);
    if (c) return { color: c };
  }
  return undefined;
}

async function loadTheme(zip: JSZip, path: string | undefined): Promise<Theme> {
  const theme: Theme = new Map([
    ['dk1', [0, 0, 0]], ['lt1', [1, 1, 1]], ['dk2', [0.27, 0.33, 0.42]], ['lt2', [0.91, 0.91, 0.91]],
    ['accent1', [0.27, 0.45, 0.77]], ['accent2', [0.93, 0.49, 0.19]], ['accent3', [0.65, 0.65, 0.65]],
    ['accent4', [1, 0.75, 0]], ['accent5', [0.36, 0.61, 0.84]], ['accent6', [0.44, 0.68, 0.28]],
  ]);
  if (!path) return theme;
  const f = zip.file(path);
  if (!f) return theme;
  const doc = parseXml(await f.async('string'));
  const scheme = Array.from(doc.getElementsByTagName('*')).find((n) => localName(n) === 'clrScheme');
  if (scheme) {
    for (const c of elementChildren(scheme)) {
      const col = colorFrom(c, new Map());
      if (col) theme.set(localName(c), col);
    }
  }
  return theme;
}

export async function readPptx(data: Uint8Array | ArrayBuffer, opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<Deck> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new ConversionError('Die Datei ist keine gültige PowerPoint-Präsentation (PPTX) oder beschädigt.');
  }
  const presPath = 'ppt/presentation.xml';
  const presFile = zip.file(presPath);
  if (!presFile) throw new ConversionError('Die PPTX-Datei enthält keine Präsentation (ppt/presentation.xml fehlt).');
  const pres = parseXml(await presFile.async('string'));
  const root = pres.documentElement;
  const sz = child(root, 'sldSz');
  const width = (num(sz, 'cx') ?? 9144000) / EMU;
  const height = (num(sz, 'cy') ?? 5143500) / EMU;
  const presRels = await readRels(zip, presPath);
  const slidePaths = children(child(root, 'sldIdLst'), 'sldId')
    .map((s) => presRels.get(attrNS(s, R_NS, 'id') || '')?.target)
    .filter((p): p is string => Boolean(p && zip.file(p)));
  if (!slidePaths.length) throw new ConversionError('Die Präsentation enthält keine Folien.');

  const images = new Map<string, Uint8Array>();
  const layoutCache = new Map<string, { info: LayoutInfo; bg?: { color?: RGB; image?: Uint8Array }; elements: SlideElement[]; master?: MasterInfo; theme: Theme }>();
  const masterCache = new Map<string, MasterInfo & { theme: Theme }>();

  const loadMaster = async (path: string): Promise<MasterInfo & { theme: Theme }> => {
    const cached = masterCache.get(path);
    if (cached) return cached;
    const rels = await readRels(zip, path);
    const themePath = [...rels.values()].find((r) => r.type.endsWith('/theme'))?.target;
    const theme = await loadTheme(zip, themePath);
    const doc = parseXml(await zip.file(path)!.async('string'));
    const root = doc.documentElement;
    const cSld = child(root, 'cSld');
    const spTree = child(cSld, 'spTree');
    const tx = child(root, 'txStyles');
    const ctx: Ctx = { zip, theme, rels, images };
    const elements: SlideElement[] = [];
    if (spTree) await convertShapes(spTree, ctx, identity, elements, true);
    const info: MasterInfo & { theme: Theme } = {
      ph: collectPlaceholders(spTree, theme),
      title: parseLstStyle(child(tx, 'titleStyle'), theme),
      body: parseLstStyle(child(tx, 'bodyStyle'), theme),
      other: parseLstStyle(child(tx, 'otherStyle'), theme),
      background: await backgroundOf(cSld, ctx),
      elements,
      theme,
    };
    masterCache.set(path, info);
    return info;
  };

  const loadLayout = async (path: string) => {
    const cached = layoutCache.get(path);
    if (cached) return cached;
    const rels = await readRels(zip, path);
    const masterPath = [...rels.values()].find((r) => r.type.endsWith('/slideMaster'))?.target;
    const master = masterPath && zip.file(masterPath) ? await loadMaster(masterPath) : undefined;
    const theme = master?.theme ?? (await loadTheme(zip, undefined));
    const doc = parseXml(await zip.file(path)!.async('string'));
    const cSld = child(doc.documentElement, 'cSld');
    const spTree = child(cSld, 'spTree');
    const ctx: Ctx = { zip, theme, rels, images, master };
    const elements: SlideElement[] = [];
    const showMaster = doc.documentElement.getAttribute('showMasterSp') !== '0';
    if (spTree) await convertShapes(spTree, ctx, identity, elements, true);
    const entry = {
      info: collectPlaceholders(spTree, theme),
      bg: (await backgroundOf(cSld, ctx)) ?? master?.background,
      elements: showMaster && master ? [...master.elements, ...elements] : elements,
      master,
      theme,
    };
    layoutCache.set(path, entry);
    return entry;
  };

  const slides: Slide[] = [];
  for (let i = 0; i < slidePaths.length; i++) {
    checkAbort(opts.signal);
    opts.onProgress?.(i / slidePaths.length);
    const path = slidePaths[i];
    const doc = parseXml(await zip.file(path)!.async('string'));
    const sld = doc.documentElement;
    if (sld.getAttribute('show') === '0') continue; // hidden slide
    const rels = await readRels(zip, path);
    const layoutPath = [...rels.values()].find((r) => r.type.endsWith('/slideLayout'))?.target;
    const layout = layoutPath && zip.file(layoutPath) ? await loadLayout(layoutPath) : undefined;
    const theme = layout?.theme ?? (await loadTheme(zip, undefined));
    const ctx: Ctx = { zip, theme, rels, images, layout: layout?.info, master: layout?.master };
    const cSld = child(sld, 'cSld');
    const elements: SlideElement[] = [];
    const showMaster = sld.getAttribute('showMasterSp') !== '0';
    if (showMaster && layout) elements.push(...layout.elements);
    const spTree = child(cSld, 'spTree');
    if (spTree) await convertShapes(spTree, ctx, identity, elements);
    const bg = (await backgroundOf(cSld, ctx)) ?? layout?.bg;
    slides.push({ elements, background: bg?.color, backgroundImage: bg?.image });
  }
  let title: string | undefined;
  const core = zip.file('docProps/core.xml');
  if (core) {
    const m = /<dc:title>([^<]*)<\/dc:title>/.exec(await core.async('string'));
    if (m?.[1]) title = m[1];
  }
  return { width, height, slides, title };
}
