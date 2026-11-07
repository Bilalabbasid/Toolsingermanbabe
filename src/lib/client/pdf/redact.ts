'use client';

import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRef } from 'pdf-lib';
import { PdfToolError } from './errors';
import {
  canvasToBytes,
  loadPdfLib,
  openPdfJs,
  releaseCanvas,
  renderPageToCanvas,
  yieldToBrowser,
  type PdfJsPage,
  type ProgressFn,
} from './common';

/** A manually drawn area, as fractions (0..1) of the displayed (rotated) page, origin top-left. */
export interface RedactionZone {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactResult {
  bytes: Uint8Array;
  /** 1-based numbers of pages that were rasterised with black boxes. */
  redactedPages: number[];
  matchCount: number;
  /** Terms that were not found in any page's text layer. */
  missingTerms: string[];
}

/** Rendering resolution of redacted pages (≈ 150 dpi). */
const REDACT_SCALE = 150 / 72;

interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
  /** CSS font family reported by pdf.js (used to estimate glyph positions). */
  fontFamily?: string;
}

let measureCtx: CanvasRenderingContext2D | null = null;

/**
 * Fraction of the run's advance width covered by `str.slice(0, index)`.
 * pdf.js only reports the width of a whole text run, so glyph positions are estimated by
 * measuring the string in the same font family (as pdf.js' own text layer does).
 */
function advanceRatio(item: TextItemLike, index: number): number {
  const len = item.str.length;
  if (index <= 0 || len === 0) return 0;
  if (index >= len) return 1;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (measureCtx) {
    measureCtx.font = `100px ${item.fontFamily || 'sans-serif'}`;
    const full = measureCtx.measureText(item.str).width;
    if (full > 0) return measureCtx.measureText(item.str.slice(0, index)).width / full;
  }
  return index / len;
}

type Quad = [number, number][]; // 4 points in PDF user space

function normalise(ch: string): string {
  return ch.toLocaleLowerCase('de-DE');
}

/**
 * Finds all occurrences of the terms in the page text and returns their outlines in user space.
 * Matching ignores case and whitespace, so terms split across text runs ("Max" + "Mustermann")
 * or with odd spacing are still found. Over-matching only ever blacks out more, never less.
 */
function findTermQuads(items: TextItemLike[], terms: string[], found: Set<string>): Quad[] {
  const chars: string[] = [];
  const owner: { item: number; offset: number }[] = [];
  items.forEach((item, idx) => {
    for (let o = 0; o < item.str.length; o++) {
      const c = item.str[o];
      if (/\s/.test(c)) continue;
      for (const n of normalise(c)) {
        chars.push(n);
        owner.push({ item: idx, offset: o });
      }
    }
  });
  const haystack = chars.join('');

  // item index -> list of [start, end) character ranges to cover
  const ranges = new Map<number, [number, number][]>();
  for (const term of terms) {
    const needle = Array.from(term)
      .filter((c) => !/\s/.test(c))
      .map(normalise)
      .join('');
    if (!needle) continue;
    let pos = 0;
    while ((pos = haystack.indexOf(needle, pos)) !== -1) {
      found.add(term);
      const perItem = new Map<number, [number, number]>();
      for (let k = pos; k < pos + needle.length; k++) {
        const { item, offset } = owner[k];
        const r = perItem.get(item);
        if (r) {
          r[0] = Math.min(r[0], offset);
          r[1] = Math.max(r[1], offset + 1);
        } else perItem.set(item, [offset, offset + 1]);
      }
      for (const [item, r] of perItem) {
        const list = ranges.get(item) ?? [];
        list.push(r);
        ranges.set(item, list);
      }
      pos += needle.length;
    }
  }

  const quads: Quad[] = [];
  for (const [idx, list] of ranges) {
    const item = items[idx];
    const [a, b, c, d, e, f] = item.transform;
    const along = Math.hypot(a, b) || 1;
    const ux = a / along;
    const uy = b / along;
    let vx = c;
    let vy = d;
    const vLen = Math.hypot(vx, vy);
    if (vLen > 0) {
      vx /= vLen;
      vy /= vLen;
    } else {
      vx = -uy;
      vy = ux;
    }
    const height = Math.max(item.height || 0, vLen, 1);
    const len = Math.max(item.str.length, 1);
    const total = item.width > 0 ? item.width : along * len * 0.6;
    // Pad by about half a glyph: estimated glyph positions are never exact, and covering a
    // neighbouring character is acceptable while leaking part of a redacted one is not.
    const pad = Math.max(1.5, height * 0.22);
    for (const [start, end] of list) {
      const s0 = start === 0 ? -2 : advanceRatio(item, start) * total - pad;
      const s1 = end >= item.str.length ? total + 2 : advanceRatio(item, end) * total + pad;
      const t0 = -0.35 * height;
      const t1 = 1.15 * height;
      const pt = (s: number, t: number): [number, number] => [e + ux * s + vx * t, f + uy * s + vy * t];
      quads.push([pt(s0, t0), pt(s1, t0), pt(s1, t1), pt(s0, t1)]);
    }
  }
  return quads;
}

async function pageTextItems(page: PdfJsPage): Promise<TextItemLike[]> {
  const content = await page.getTextContent();
  const styles = (content.styles ?? {}) as Record<string, { fontFamily?: string }>;
  return (content.items as unknown[])
    .filter(
      (it): it is TextItemLike =>
        typeof (it as TextItemLike).str === 'string' && Array.isArray((it as TextItemLike).transform)
    )
    .map((it) => ({ ...it, fontFamily: it.fontName ? styles[it.fontName]?.fontFamily : undefined }));
}

function stripAnnotationsExceptLinks(doc: PDFDocument) {
  const Annots = PDFName.of('Annots');
  const Subtype = PDFName.of('Subtype');
  const Link = PDFName.of('Link');
  for (const page of doc.getPages()) {
    const annots = page.node.lookupMaybe(Annots, PDFArray);
    if (!annots) continue;
    const keep: (PDFRef | PDFDict)[] = [];
    for (let i = 0; i < annots.size(); i++) {
      const annot = annots.lookup(i);
      if (annot instanceof PDFDict && annot.lookupMaybe(Subtype, PDFName) === Link) {
        keep.push(annots.get(i) as PDFRef | PDFDict);
      }
    }
    if (keep.length) page.node.set(Annots, doc.context.obj(keep));
    else page.node.delete(Annots);
  }
}

/**
 * True redaction in the browser: every page that contains a hit (or a manual zone) is rendered
 * to pixels, the areas are painted black and the page is replaced by that image – the original
 * text, vector content and hidden layers of those pages are gone. Untouched pages are copied
 * unchanged (text stays selectable). Document-level data (metadata, bookmarks, attachments,
 * form fields, comments) is not carried over.
 */
export async function redactPdf(
  input: Uint8Array,
  opts: { terms: string[]; zones: RedactionZone[] },
  onProgress?: ProgressFn
): Promise<RedactResult> {
  const terms = Array.from(new Set(opts.terms.map((t) => t.trim()).filter(Boolean)));
  if (!terms.length && !opts.zones.length) {
    throw new PdfToolError('INVALID_INPUT', 'Bitte geben Sie mindestens einen Begriff ein oder markieren Sie einen Bereich.');
  }

  onProgress?.(5, 'PDF wird geladen...');
  const srcLib = await loadPdfLib(input); // throws German errors for encrypted / damaged files
  const src = await openPdfJs(input);

  try {
    const found = new Set<string>();
    const perPage: Quad[][] = [];
    let matchCount = 0;
    for (let i = 1; i <= src.numPages; i++) {
      onProgress?.(5 + (25 * i) / src.numPages, `Text auf Seite ${i} von ${src.numPages} wird durchsucht...`);
      const page = await src.getPage(i);
      const quads = terms.length ? findTermQuads(await pageTextItems(page), terms, found) : [];
      matchCount += quads.length;
      perPage.push(quads);
      page.cleanup();
    }

    const affected = new Set<number>();
    perPage.forEach((q, idx) => q.length && affected.add(idx));
    opts.zones.forEach((z) => z.pageIndex >= 0 && z.pageIndex < src.numPages && affected.add(z.pageIndex));
    const missingTerms = terms.filter((t) => !found.has(t));

    if (affected.size === 0) {
      throw new PdfToolError(
        'NOT_FOUND',
        'Keiner der Begriffe wurde im Text des PDFs gefunden. Bei gescannten Dokumenten (Bild ohne Textebene) markieren Sie die Stellen bitte manuell als Bereich.'
      );
    }

    const out = await PDFDocument.create();
    const copied = await out.copyPages(
      srcLib,
      srcLib.getPageIndices().filter((i) => !affected.has(i))
    );
    let copiedIdx = 0;
    const affectedList = Array.from(affected).sort((x, y) => x - y);
    let done = 0;

    for (let i = 0; i < src.numPages; i++) {
      if (!affected.has(i)) {
        out.addPage(copied[copiedIdx++]);
        continue;
      }
      done++;
      onProgress?.(
        30 + (60 * done) / affectedList.length,
        `Seite ${i + 1} wird geschwärzt und neu aufgebaut (${done} von ${affectedList.length})...`
      );
      const page = await src.getPage(i + 1);
      const rendered = await renderPageToCanvas(page, REDACT_SCALE);
      const ctx = rendered.canvas.getContext('2d');
      if (!ctx) throw new PdfToolError('RUNTIME', 'Die Seite konnte nicht gerendert werden.');
      ctx.fillStyle = '#000000';
      for (const quad of perPage[i]) {
        ctx.beginPath();
        quad.forEach(([x, y], k) => {
          const [px, py] = rendered.viewport.convertToViewportPoint(x, y);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
      }
      for (const z of opts.zones.filter((zone) => zone.pageIndex === i)) {
        ctx.fillRect(
          Math.floor(z.x * rendered.canvas.width),
          Math.floor(z.y * rendered.canvas.height),
          Math.ceil(z.width * rendered.canvas.width),
          Math.ceil(z.height * rendered.canvas.height)
        );
      }
      const jpg = await out.embedJpg(await canvasToBytes(rendered.canvas, 'image/jpeg', 0.9));
      releaseCanvas(rendered.canvas);
      page.cleanup();
      const newPage = out.addPage([rendered.widthPt, rendered.heightPt]);
      newPage.drawImage(jpg, { x: 0, y: 0, width: rendered.widthPt, height: rendered.heightPt });
      await yieldToBrowser();
    }

    // Comments / form widgets on the untouched pages may quote the redacted text: drop them.
    stripAnnotationsExceptLinks(out);
    out.setProducer('Datei Tools');
    out.setCreator('Datei Tools');

    onProgress?.(95, 'Geschwärztes PDF wird gespeichert...');
    const bytes = await out.save({ useObjectStreams: true });
    return {
      bytes,
      redactedPages: affectedList.map((i) => i + 1),
      matchCount,
      missingTerms,
    };
  } finally {
    await src.destroy();
  }
}
