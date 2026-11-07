/**
 * ODP (OpenDocument Presentation) reader → slide model.
 */
import JSZip from 'jszip';
import type { RGB, TextRun } from './model';
import { ConversionError, checkAbort } from './model';
import {
  NS,
  OdfStyles,
  type OdfStyle,
  assertNotEncrypted,
  attrNS,
  childNodesOf,
  descendants,
  elementChildren,
  lengthToPt,
  localName,
  parseXml,
  readZipText,
} from './odfCommon';
import type { Deck, Slide, SlideElement, SlidePara, SlideTable } from './slides';
import { sniffImage } from './images';

interface Ctx {
  zip: JSZip;
  styles: OdfStyles;
  images: Map<string, Uint8Array>;
}

type RunStyle = Pick<TextRun, 'bold' | 'italic' | 'underline' | 'strike' | 'size' | 'color'>;

function apply(base: RunStyle, st?: OdfStyle): RunStyle {
  if (!st) return base;
  return {
    bold: st.bold ?? base.bold,
    italic: st.italic ?? base.italic,
    underline: st.underline ?? base.underline,
    strike: st.strike ?? base.strike,
    size: st.fontSize ?? base.size,
    color: st.color ?? base.color,
  };
}

function inline(el: Element, base: RunStyle, ctx: Ctx, runs: TextRun[]) {
  for (const n of childNodesOf(el)) {
    if (n.nodeType === 3) {
      const t = (n.nodeValue || '').replace(/\s+/g, ' ');
      if (t) runs.push({ ...base, text: t });
      continue;
    }
    if (n.nodeType !== 1) continue;
    const c = n as Element;
    switch (localName(c)) {
      case 'span':
        inline(c, apply(base, ctx.styles.resolve(attrNS(c, NS.text, 'style-name'), 'text')), ctx, runs);
        break;
      case 's':
        runs.push({ ...base, text: ' '.repeat(Math.max(1, parseInt(attrNS(c, NS.text, 'c') || '1', 10))) });
        break;
      case 'tab':
        runs.push({ ...base, text: '\t' });
        break;
      case 'line-break':
        runs.push({ text: '\n' });
        break;
      default:
        inline(c, base, ctx, runs);
    }
  }
}

function paraFrom(el: Element, ctx: Ctx, base: RunStyle, level: number, bullet: string | undefined, out: SlidePara[]) {
  const st = ctx.styles.resolve(attrNS(el, NS.text, 'style-name'), 'paragraph');
  const runs: TextRun[] = [];
  inline(el, apply(base, st), ctx, runs);
  if (runs.length) {
    runs[0] = { ...runs[0], text: runs[0].text.replace(/^ +/, '') };
    const li = runs.length - 1;
    runs[li] = { ...runs[li], text: runs[li].text.replace(/ +$/, '') };
  }
  const hasText = runs.some((r) => r.text.trim());
  out.push({ runs, level, align: st?.align, bullet: hasText ? bullet : undefined });
}

function listItems(list: Element, ctx: Ctx, base: RunStyle, level: number, out: SlidePara[], inheritedStyle?: string) {
  const styleName = attrNS(list, NS.text, 'style-name') || inheritedStyle;
  const ordered = ctx.styles.isOrdered(styleName, level);
  for (const item of elementChildren(list)) {
    const il = localName(item);
    if (il !== 'list-item' && il !== 'list-header') continue;
    for (const c of elementChildren(item)) {
      const cl = localName(c);
      if (cl === 'p' || cl === 'h') paraFrom(c, ctx, base, level, il === 'list-header' ? undefined : ordered ? 'number' : '•', out);
      else if (cl === 'list') listItems(c, ctx, base, level + 1, out, styleName);
    }
  }
}

function paragraphsOf(container: Element, ctx: Ctx, base: RunStyle): SlidePara[] {
  const out: SlidePara[] = [];
  for (const el of elementChildren(container)) {
    const ln = localName(el);
    if (ln === 'p' || ln === 'h') paraFrom(el, ctx, base, 0, undefined, out);
    else if (ln === 'list') listItems(el, ctx, base, 0, out);
  }
  return out;
}

async function imageData(ctx: Ctx, href: string | null): Promise<Uint8Array | null> {
  if (!href || /^[a-z]+:/i.test(href)) return null;
  const path = href.replace(/^\.\//, '');
  if (ctx.images.has(path)) return ctx.images.get(path) ?? null;
  const f = ctx.zip.file(path);
  if (!f) return null;
  const data = await f.async('uint8array');
  ctx.images.set(path, data);
  return data;
}

function box(el: Element) {
  return {
    x: lengthToPt(attrNS(el, NS.svg, 'x')) ?? 0,
    y: lengthToPt(attrNS(el, NS.svg, 'y')) ?? 0,
    w: lengthToPt(attrNS(el, NS.svg, 'width')) ?? 0,
    h: lengthToPt(attrNS(el, NS.svg, 'height')) ?? 0,
  };
}

async function convertElements(parent: Element, ctx: Ctx, out: SlideElement[], skipPlaceholders: boolean): Promise<void> {
  for (const el of elementChildren(parent)) {
    const ln = localName(el);
    try {
      if (ln === 'frame') {
        if (skipPlaceholders && attrNS(el, NS.presentation, 'placeholder') === 'true') continue;
        const pos = box(el);
        const cls = attrNS(el, NS.presentation, 'class') || '';
        const pStyle = ctx.styles.resolve(attrNS(el, NS.presentation, 'style-name'), 'presentation') ??
          ctx.styles.resolve(attrNS(el, NS.draw, 'style-name'), 'graphic');
        const base: RunStyle = { size: pStyle?.fontSize, color: pStyle?.color, bold: pStyle?.bold, italic: pStyle?.italic };
        const tb = elementChildren(el).find((c) => localName(c) === 'text-box');
        const img = elementChildren(el).find((c) => localName(c) === 'image');
        const tbl = elementChildren(el).find((c) => localName(c) === 'table');
        if (tb) {
          const paragraphs = paragraphsOf(tb, ctx, base);
          if (paragraphs.some((p) => p.runs.some((r) => r.text.trim())) || pStyle?.fill) {
            out.push({
              kind: 'text', ...pos, paragraphs,
              isTitle: cls === 'title',
              defaultSize: cls === 'title' ? 36 : cls === 'subtitle' ? 24 : 20,
              anchor: cls === 'title' || cls === 'subtitle' ? 'middle' : 'top',
              fill: pStyle?.fill,
              autofit: true,
            });
          }
        } else if (tbl) {
          const rows: SlideTable['rows'] = [];
          let ncols = 0;
          for (const r of descendants(tbl, 'table-row')) {
            const cells = elementChildren(r)
              .filter((c) => localName(c) === 'table-cell')
              .map((c) => ({ paragraphs: paragraphsOf(c, ctx, { size: 14 }) }));
            ncols = Math.max(ncols, cells.length);
            rows.push({ h: 0, cells });
          }
          if (rows.length) {
            rows.forEach((r) => (r.h = pos.h / rows.length));
            out.push({ kind: 'table', ...pos, colWidths: new Array(ncols).fill(pos.w / Math.max(1, ncols)), rows });
          }
        } else if (img) {
          const data = await imageData(ctx, attrNS(img, NS.xlink, 'href'));
          if (data && sniffImage(data) !== 'unknown') out.push({ kind: 'image', data, ...pos });
        }
      } else if (ln === 'custom-shape' || ln === 'rect' || ln === 'ellipse' || ln === 'circle') {
        const pos = box(el);
        const gStyle = ctx.styles.resolve(attrNS(el, NS.draw, 'style-name'), 'graphic');
        const paragraphs = paragraphsOf(el, ctx, { size: gStyle?.fontSize, color: gStyle?.color });
        const geom = elementChildren(el).find((c) => localName(c) === 'enhanced-geometry');
        const type = geom ? attrNS(geom, NS.draw, 'type') : null;
        if (!gStyle?.fill && !paragraphs.some((p) => p.runs.some((r) => r.text.trim()))) continue;
        out.push({
          kind: 'text', ...pos, paragraphs, anchor: 'middle',
          fill: gStyle?.fill,
          geom: ln === 'ellipse' || ln === 'circle' || type === 'ellipse' ? 'ellipse' : 'rect',
          defaultSize: 18,
        });
      } else if (ln === 'g') {
        await convertElements(el, ctx, out, skipPlaceholders);
      }
    } catch {
      // ignore broken shapes
    }
  }
}

export async function readOdp(data: Uint8Array | ArrayBuffer, opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<Deck> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new ConversionError('Die Datei ist keine gültige OpenDocument-Präsentation (ODP) oder beschädigt.');
  }
  await assertNotEncrypted(zip);
  const contentXml = await readZipText(zip, 'content.xml');
  if (!contentXml) throw new ConversionError('Die ODP-Datei enthält keinen Inhalt (content.xml fehlt).');
  const styles = new OdfStyles();
  const stylesXml = await readZipText(zip, 'styles.xml');
  const stylesDoc = stylesXml ? parseXml(stylesXml) : null;
  styles.addFrom(stylesDoc);
  const content = parseXml(contentXml);
  styles.addFrom(content);
  const ctx: Ctx = { zip, styles, images: new Map() };

  // Page size & master pages
  let width = 793.7; // 28 cm (LibreOffice 16:9 default)
  let height = 446.5;
  const masters = new Map<string, { elements: SlideElement[]; fill?: RGB }>();
  if (stylesDoc) {
    const layouts = new Map<string, { w?: number; h?: number }>();
    for (const pl of descendants(stylesDoc, 'page-layout')) {
      const props = elementChildren(pl).find((c) => localName(c) === 'page-layout-properties');
      if (props) layouts.set(attrNS(pl, NS.style, 'name') || '', { w: lengthToPt(attrNS(props, NS.fo, 'page-width')), h: lengthToPt(attrNS(props, NS.fo, 'page-height')) });
    }
    for (const mp of descendants(stylesDoc, 'master-page')) {
      const name = attrNS(mp, NS.style, 'name') || '';
      const layout = layouts.get(attrNS(mp, NS.style, 'page-layout-name') || '');
      if (layout?.w && layout?.h && masters.size === 0) {
        width = layout.w;
        height = layout.h;
      }
      const elements: SlideElement[] = [];
      await convertElements(mp, ctx, elements, true);
      const fill = styles.resolve(attrNS(mp, NS.draw, 'style-name'), 'drawing-page')?.fill;
      masters.set(name, { elements, fill });
    }
  }

  const pages = descendants(content, 'page').filter((p) => localName(p.parentNode as Element) === 'presentation');
  if (!pages.length) throw new ConversionError('Die Präsentation enthält keine Folien.');
  const slides: Slide[] = [];
  for (let i = 0; i < pages.length; i++) {
    checkAbort(opts.signal);
    opts.onProgress?.(i / pages.length);
    const page = pages[i];
    const master = masters.get(attrNS(page, NS.draw, 'master-page-name') || '');
    const elements: SlideElement[] = master ? [...master.elements] : [];
    await convertElements(page, ctx, elements, false);
    const fill = styles.resolve(attrNS(page, NS.draw, 'style-name'), 'drawing-page')?.fill ?? master?.fill;
    slides.push({ elements, background: fill });
  }
  return { width, height, slides };
}
