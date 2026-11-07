/**
 * Shared helpers for OpenDocument (ODT/ODP) reading: XML parsing, style
 * resolution and unit conversion.
 */
import type JSZip from 'jszip';
import type { Align } from './model';
import { ConversionError } from './model';

export const NS = {
  office: 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
  style: 'urn:oasis:names:tc:opendocument:xmlns:style:1.0',
  text: 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  table: 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  draw: 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
  fo: 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0',
  xlink: 'http://www.w3.org/1999/xlink',
  svg: 'urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0',
  presentation: 'urn:oasis:names:tc:opendocument:xmlns:presentation:1.0',
};

export function parseXml(xml: string): Document {
  const P = (globalThis as unknown as { DOMParser?: typeof DOMParser }).DOMParser;
  if (!P) throw new Error('DOMParser ist in dieser Umgebung nicht verfügbar.');
  const doc = new P().parseFromString(xml, 'application/xml');
  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
    throw new ConversionError('Die Dokumentstruktur (XML) ist beschädigt und konnte nicht gelesen werden.');
  }
  return doc;
}

export function localName(n: Node): string {
  const el = n as Element;
  const name = el.localName || el.nodeName || '';
  const i = name.indexOf(':');
  return i >= 0 ? name.substring(i + 1) : name;
}

export function elementChildren(el: Element): Element[] {
  const out: Element[] = [];
  const list = el.childNodes;
  for (let i = 0; i < list.length; i++) if (list[i].nodeType === 1) out.push(list[i] as Element);
  return out;
}

export function childNodesOf(el: Node): Node[] {
  const out: Node[] = [];
  const list = el.childNodes;
  if (!list) return out;
  for (let i = 0; i < list.length; i++) out.push(list[i]);
  return out;
}

export function attrNS(el: Element, ns: string, local: string): string | null {
  const v = el.getAttributeNS ? el.getAttributeNS(ns, local) : null;
  if (v) return v;
  // Fallback for parsers without namespace support / unusual prefixes
  for (let i = 0; i < (el.attributes?.length ?? 0); i++) {
    const a = el.attributes[i];
    const name = a.localName || a.name;
    if (name === local || name.endsWith(':' + local)) {
      if (!a.namespaceURI || a.namespaceURI === ns) return a.value || null;
    }
  }
  return null;
}

export function descendants(root: Element | Document, local: string): Element[] {
  const out: Element[] = [];
  const all = root.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) if (localName(all[i]) === local) out.push(all[i]);
  return out;
}

export function firstDescendant(root: Element | Document, local: string): Element | null {
  const all = root.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) if (localName(all[i]) === local) return all[i];
  return null;
}

/** Converts an ODF length ("2.5cm", "10mm", "1in", "12pt", "96px") to pt. */
export function lengthToPt(v: string | null | undefined): number | undefined {
  if (!v) return undefined;
  const m = /^\s*(-?[\d.]+)\s*(cm|mm|in|pt|pc|px)?\s*$/i.exec(v);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return undefined;
  switch ((m[2] || 'pt').toLowerCase()) {
    case 'cm': return (n / 2.54) * 72;
    case 'mm': return (n / 25.4) * 72;
    case 'in': return n * 72;
    case 'pc': return n * 12;
    case 'px': return n * 0.75;
    default: return n;
  }
}

export interface OdfStyle {
  name: string;
  family: string;
  parent?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  mono?: boolean;
  fontSize?: number;
  color?: [number, number, number];
  align?: Align;
  breakBefore?: boolean;
  breakAfter?: boolean;
  marginLeft?: number;
  listStyle?: string;
  fill?: [number, number, number];
}

export function parseColor(v: string | null): [number, number, number] | undefined {
  if (!v || !/^#[0-9a-f]{6}$/i.test(v)) return undefined;
  return [parseInt(v.substr(1, 2), 16) / 255, parseInt(v.substr(3, 2), 16) / 255, parseInt(v.substr(5, 2), 16) / 255];
}

function alignFrom(v: string | null): Align | undefined {
  switch (v) {
    case 'center': return 'center';
    case 'end':
    case 'right': return 'right';
    case 'justify': return 'justify';
    case 'start':
    case 'left': return 'left';
    default: return undefined;
  }
}

export class OdfStyles {
  private styles = new Map<string, OdfStyle>();
  /** list style name → ordered flag per level (index 0 = level 1) */
  readonly listStyles = new Map<string, boolean[]>();

  addFrom(root: Element | Document | null) {
    if (!root) return;
    for (const container of [...descendants(root, 'styles'), ...descendants(root, 'automatic-styles')]) {
      for (const el of elementChildren(container)) {
        const ln = localName(el);
        if (ln === 'style' || ln === 'default-style') {
          const name = attrNS(el, NS.style, 'name') || (ln === 'default-style' ? `__default_${attrNS(el, NS.style, 'family')}` : '');
          if (!name) continue;
          const st: OdfStyle = {
            name,
            family: attrNS(el, NS.style, 'family') || '',
            parent: attrNS(el, NS.style, 'parent-style-name') || undefined,
            listStyle: attrNS(el, NS.style, 'list-style-name') || undefined,
          };
          for (const p of elementChildren(el)) {
            const pl = localName(p);
            if (pl === 'text-properties') {
              const fw = attrNS(p, NS.fo, 'font-weight');
              if (fw) st.bold = fw === 'bold' || (/^\d+$/.test(fw) && Number(fw) >= 600);
              const fs = attrNS(p, NS.fo, 'font-style');
              if (fs) st.italic = fs === 'italic' || fs === 'oblique';
              const ul = attrNS(p, NS.style, 'text-underline-style');
              if (ul) st.underline = ul !== 'none';
              const lt = attrNS(p, NS.style, 'text-line-through-style');
              if (lt) st.strike = lt !== 'none';
              const font = attrNS(p, NS.style, 'font-name') || attrNS(p, NS.fo, 'font-family') || '';
              if (/courier|mono|consolas/i.test(font)) st.mono = true;
              const size = attrNS(p, NS.fo, 'font-size');
              if (size && /pt$/.test(size)) st.fontSize = parseFloat(size);
              const color = parseColor(attrNS(p, NS.fo, 'color'));
              if (color) st.color = color;
            } else if (pl === 'paragraph-properties') {
              const a = alignFrom(attrNS(p, NS.fo, 'text-align'));
              if (a) st.align = a;
              if (attrNS(p, NS.fo, 'break-before') === 'page') st.breakBefore = true;
              if (attrNS(p, NS.fo, 'break-after') === 'page') st.breakAfter = true;
              const ml = lengthToPt(attrNS(p, NS.fo, 'margin-left'));
              if (ml !== undefined) st.marginLeft = ml;
            } else if (pl === 'graphic-properties' || pl === 'drawing-page-properties') {
              if (attrNS(p, NS.draw, 'fill') === 'solid') {
                const c = parseColor(attrNS(p, NS.draw, 'fill-color'));
                if (c) st.fill = c;
              }
            }
          }
          this.styles.set(`${st.family}:${name}`, st);
          if (!this.styles.has(`any:${name}`)) this.styles.set(`any:${name}`, st);
        } else if (ln === 'list-style') {
          const name = attrNS(el, NS.style, 'name');
          if (!name) continue;
          const levels: boolean[] = [];
          for (const lvl of elementChildren(el)) {
            const level = parseInt(attrNS(lvl, NS.text, 'level') || '1', 10);
            levels[level - 1] = localName(lvl) === 'list-level-style-number';
          }
          this.listStyles.set(name, levels);
        }
      }
    }
  }

  /** Resolves a style including its parent chain (family-specific first). */
  resolve(name: string | null | undefined, family: string): OdfStyle | undefined {
    if (!name) return undefined;
    const chain: OdfStyle[] = [];
    let cur = this.styles.get(`${family}:${name}`) ?? this.styles.get(`any:${name}`);
    let guard = 0;
    while (cur && guard++ < 20) {
      chain.unshift(cur);
      cur = cur.parent ? this.styles.get(`${family}:${cur.parent}`) ?? this.styles.get(`any:${cur.parent}`) : undefined;
    }
    if (!chain.length) return undefined;
    const merged: OdfStyle = { name, family };
    for (const s of chain) {
      for (const [k, v] of Object.entries(s)) {
        if (v !== undefined && k !== 'name' && k !== 'parent' && k !== 'family') (merged as unknown as Record<string, unknown>)[k] = v;
      }
    }
    // Break properties are not inherited from parents in practice
    merged.breakBefore = chain[chain.length - 1].breakBefore;
    merged.breakAfter = chain[chain.length - 1].breakAfter;
    return merged;
  }

  isOrdered(listStyle: string | undefined, level: number): boolean {
    if (!listStyle) return false;
    const levels = this.listStyles.get(listStyle);
    return Boolean(levels?.[Math.min(level, (levels?.length ?? 1) - 1)]);
  }
}

export async function readZipText(zip: JSZip, path: string): Promise<string | null> {
  const f = zip.file(path);
  return f ? f.async('string') : null;
}

export async function assertNotEncrypted(zip: JSZip): Promise<void> {
  const manifest = await readZipText(zip, 'META-INF/manifest.xml');
  if (manifest && /encryption-data/.test(manifest)) {
    throw new ConversionError('Das Dokument ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz und versuchen Sie es erneut.');
  }
}
