'use client';

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRef,
  PDFStream,
  concatTransformationMatrix,
  drawObject,
  popGraphicsState,
  pushGraphicsState,
  type PDFPage,
} from 'pdf-lib';
import { PdfToolError, PDF_ERROR_MESSAGES } from './errors';
import { runQpdf } from './qpdf';
import { optimizeArgs, rewriteArgs } from './qpdfArgs';
import { hasPdfHeader, loadPdfLib, rasterizeDocument, type ProgressFn } from './common';

export interface ProcessResult {
  bytes: Uint8Array;
  audit: string;
  /** Optional warning shown in amber. */
  warning?: string;
}

const N = {
  Annots: PDFName.of('Annots'),
  Subtype: PDFName.of('Subtype'),
  Link: PDFName.of('Link'),
  Widget: PDFName.of('Widget'),
  Popup: PDFName.of('Popup'),
  AP: PDFName.of('AP'),
  AS: PDFName.of('AS'),
  NKey: PDFName.of('N'),
  F: PDFName.of('F'),
  Rect: PDFName.of('Rect'),
  BBox: PDFName.of('BBox'),
  Matrix: PDFName.of('Matrix'),
  Type: PDFName.of('Type'),
  XObject: PDFName.of('XObject'),
  Form: PDFName.of('Form'),
  AcroForm: PDFName.of('AcroForm'),
};

function isEncryptedQpdfFailure(messages: string[]): boolean {
  return messages.some((m) => /invalid password/i.test(m));
}

// ---------------------------------------------------------------------------
// Repair
// ---------------------------------------------------------------------------

/**
 * Repair strategy (all local):
 * 1. qpdf rewrite – normalises the structure and writes a fresh xref table.
 * 2. pdf-lib – parses objects sequentially (ignores a broken xref/trailer), then qpdf again.
 * 3. last resort: pdf.js (very tolerant parser) renders the pages into a new image-based PDF.
 */
export async function repairPdf(input: Uint8Array, onProgress?: ProgressFn): Promise<ProcessResult> {
  onProgress?.(10, 'Dateistruktur wird mit qpdf geprüft...');
  const direct = await runQpdf(input, rewriteArgs());
  if (isEncryptedQpdfFailure(direct.messages)) throw new PdfToolError('ENCRYPTED', PDF_ERROR_MESSAGES.encrypted);
  if (direct.output) {
    const warnings = direct.exitCode === 3;
    return {
      bytes: direct.output,
      audit: warnings
        ? 'Strukturfehler gefunden und behoben: Objekte und Querverweistabelle (xref) wurden neu aufgebaut.'
        : 'Die Datei war strukturell intakt. Sie wurde trotzdem sauber neu geschrieben (frische xref-Tabelle, Objektströme).',
    };
  }

  onProgress?.(35, 'Querverweistabelle ist beschädigt – Objekte werden einzeln geborgen...');
  if (hasPdfHeader(input)) {
    try {
      const doc = await PDFDocument.load(input, { throwOnInvalidObject: false, updateMetadata: false });
      const pageCount = doc.getPageCount();
      if (pageCount > 0) {
        const rebuilt = await doc.save({ useObjectStreams: false, addDefaultPage: false });
        onProgress?.(65, 'Geborgene Objekte werden neu serialisiert...');
        const normalised = await runQpdf(rebuilt, rewriteArgs());
        return {
          bytes: normalised.output ?? rebuilt,
          audit: `Beschädigte Querverweistabelle rekonstruiert. ${pageCount} ${pageCount === 1 ? 'Seite' : 'Seiten'} geborgen.`,
        };
      }
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'EncryptedPDFError') {
        throw new PdfToolError('ENCRYPTED', PDF_ERROR_MESSAGES.encrypted);
      }
      // fall through to the rendering fallback
    }
  }

  onProgress?.(70, 'Letzter Versuch: Seiten werden aus der beschädigten Datei gerendert...');
  try {
    const bytes = await rasterizeDocument(input, { dpi: 150, quality: 0.85, onProgress, from: 70, to: 98 });
    return {
      bytes,
      audit: 'Die Seiten konnten nur als Bilder wiederhergestellt werden.',
      warning: 'Die Datei war stark beschädigt. Text ist in der reparierten Version nicht mehr auswählbar.',
    };
  } catch {
    throw new PdfToolError(
      'DAMAGED',
      'Die Datei ist zu stark beschädigt und konnte nicht repariert werden (z. B. unvollständiger Download oder kein PDF).'
    );
  }
}

// ---------------------------------------------------------------------------
// Optimize
// ---------------------------------------------------------------------------

export async function optimizePdf(input: Uint8Array, onProgress?: ProgressFn): Promise<ProcessResult> {
  onProgress?.(20, 'Objektströme werden erzeugt und linearisiert...');
  const result = await runQpdf(input, optimizeArgs());
  if (!result.output) {
    if (isEncryptedQpdfFailure(result.messages)) throw new PdfToolError('ENCRYPTED', PDF_ERROR_MESSAGES.encrypted);
    throw new PdfToolError('DAMAGED', `${PDF_ERROR_MESSAGES.damaged} Versuchen Sie zuerst „PDF reparieren“.`);
  }
  const smaller = result.output.length < input.length;
  return {
    bytes: result.output,
    audit: smaller
      ? 'Für schnelle Webanzeige linearisiert, Objektströme erzeugt und Datenströme verlustfrei neu komprimiert.'
      : 'Für schnelle Webanzeige (Fast Web View) linearisiert. Die Datei war bereits kompakt; die Linearisierung fügt Hinweistabellen hinzu.',
  };
}

// ---------------------------------------------------------------------------
// Flatten
// ---------------------------------------------------------------------------

function annotsOf(page: PDFPage): PDFArray | undefined {
  return page.node.lookupMaybe(N.Annots, PDFArray);
}

function numbers(arr: PDFArray | undefined, count: number): number[] | null {
  if (!arr || arr.size() < count) return null;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const v = arr.lookup(i);
    if (!(v instanceof PDFNumber)) return null;
    out.push(v.asNumber());
  }
  return out;
}

/** Picks the normal appearance stream of an annotation (respecting /AS for state dictionaries). */
function normalAppearance(annot: PDFDict): { ref: PDFRef | null; stream: PDFStream } | null {
  const ap = annot.lookupMaybe(N.AP, PDFDict);
  if (!ap) return null;
  const nRaw = ap.get(N.NKey);
  const n = ap.lookup(N.NKey);
  if (n instanceof PDFStream) return { ref: nRaw instanceof PDFRef ? nRaw : null, stream: n };
  if (n instanceof PDFDict) {
    const as = annot.lookupMaybe(N.AS, PDFName);
    if (!as) return null;
    const stateRaw = n.get(as);
    const state = n.lookup(as);
    if (state instanceof PDFStream) return { ref: stateRaw instanceof PDFRef ? stateRaw : null, stream: state };
  }
  return null;
}

/**
 * Paints each annotation's appearance stream into the page content (PDF 32000-1 §12.5.5)
 * and removes the annotation. Links are kept (no appearance, but still useful).
 */
function flattenAnnotationAppearances(doc: PDFDocument): number {
  let flattened = 0;
  for (const page of doc.getPages()) {
    const annots = annotsOf(page);
    if (!annots) continue;
    const keep: (PDFRef | PDFDict)[] = [];
    for (let i = 0; i < annots.size(); i++) {
      const raw = annots.get(i);
      const annot = annots.lookup(i);
      if (!(annot instanceof PDFDict)) continue;
      const subtype = annot.lookupMaybe(N.Subtype, PDFName);
      if (subtype === N.Link) {
        keep.push(raw as PDFRef | PDFDict);
        continue;
      }
      if (subtype === N.Popup) continue; // popups only display text of their parent

      const flags = annot.lookupMaybe(N.F, PDFNumber)?.asNumber() ?? 0;
      const hidden = (flags & 2) !== 0 || (flags & 32) !== 0;
      const appearance = hidden ? null : normalAppearance(annot);
      const rect = numbers(annot.lookupMaybe(N.Rect, PDFArray), 4);
      if (appearance && rect) {
        const bbox = numbers(appearance.stream.dict.lookupMaybe(N.BBox, PDFArray), 4);
        if (bbox) {
          const m = numbers(appearance.stream.dict.lookupMaybe(N.Matrix, PDFArray), 6) ?? [1, 0, 0, 1, 0, 0];
          // Transform the BBox corners by /Matrix and take the bounding box.
          const pts = [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[1]],
            [bbox[0], bbox[3]],
            [bbox[2], bbox[3]],
          ].map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
          const xs = pts.map((p) => p[0]);
          const ys = pts.map((p) => p[1]);
          const bx0 = Math.min(...xs);
          const by0 = Math.min(...ys);
          const bw = Math.max(...xs) - bx0;
          const bh = Math.max(...ys) - by0;
          const rx0 = Math.min(rect[0], rect[2]);
          const ry0 = Math.min(rect[1], rect[3]);
          const rw = Math.abs(rect[2] - rect[0]);
          const rh = Math.abs(rect[3] - rect[1]);
          if (bw > 0 && bh > 0 && rw > 0 && rh > 0) {
            const sx = rw / bw;
            const sy = rh / bh;
            appearance.stream.dict.set(N.Type, N.XObject);
            appearance.stream.dict.set(N.Subtype, N.Form);
            const ref = appearance.ref ?? doc.context.register(appearance.stream);
            const name = page.node.newXObject('FlatAnnot', ref);
            page.pushOperators(
              pushGraphicsState(),
              concatTransformationMatrix(sx, 0, 0, sy, rx0 - sx * bx0, ry0 - sy * by0),
              drawObject(name),
              popGraphicsState()
            );
            flattened++;
          }
        }
      }
      // Widgets were handled by the form flattener; anything left here is removed.
    }
    if (keep.length) page.node.set(N.Annots, doc.context.obj(keep));
    else page.node.delete(N.Annots);
  }
  return flattened;
}

export async function flattenPdf(input: Uint8Array, onProgress?: ProgressFn): Promise<ProcessResult> {
  onProgress?.(15, 'PDF wird geladen...');
  const doc = await loadPdfLib(input);

  onProgress?.(35, 'Formularfelder werden dauerhaft eingebrannt...');
  let fieldCount = 0;
  let formWarning: string | undefined;
  try {
    // getForm() would create an empty AcroForm, so only touch documents that have one.
    if (doc.catalog.has(N.AcroForm)) {
      const form = doc.getForm();
      fieldCount = form.getFields().length;
      try {
        form.deleteXFA();
      } catch {
        // no XFA
      }
      form.flatten({ updateFieldAppearances: true });
    }
  } catch {
    formWarning =
      'Einige Formularfelder hatten kein gültiges Erscheinungsbild und wurden ohne Inhalt entfernt. Bitte prüfen Sie das Ergebnis.';
  }

  onProgress?.(60, 'Kommentare und Stempel werden in die Seiten übernommen...');
  const annotCount = flattenAnnotationAppearances(doc);

  onProgress?.(75, 'PDF wird gespeichert...');
  const saved = await doc.save({ useObjectStreams: false, addDefaultPage: false });
  // qpdf only writes reachable objects, so the removed annotation/field objects disappear.
  onProgress?.(85, 'Nicht mehr benötigte Objekte werden entfernt...');
  const cleaned = await runQpdf(saved, rewriteArgs());

  return {
    bytes: cleaned.output ?? saved,
    audit: `${fieldCount} Formularfeld${fieldCount === 1 ? '' : 'er'} und ${annotCount} Anmerkung${
      annotCount === 1 ? '' : 'en'
    } dauerhaft in die Seiten eingebrannt. Links bleiben erhalten.`,
    warning: formWarning,
  };
}

// ---------------------------------------------------------------------------
// Strip annotations
// ---------------------------------------------------------------------------

export async function stripAnnotationsPdf(
  input: Uint8Array,
  opts: { includeLinksAndForms: boolean },
  onProgress?: ProgressFn
): Promise<ProcessResult> {
  onProgress?.(15, 'PDF wird geladen...');
  const doc = await loadPdfLib(input);

  onProgress?.(45, 'Kommentare, Markierungen und Notizen werden entfernt...');
  let removed = 0;
  for (const page of doc.getPages()) {
    const annots = annotsOf(page);
    if (!annots) continue;
    const keep: (PDFRef | PDFDict)[] = [];
    for (let i = 0; i < annots.size(); i++) {
      const raw = annots.get(i);
      const annot = annots.lookup(i);
      const subtype = annot instanceof PDFDict ? annot.lookupMaybe(N.Subtype, PDFName) : undefined;
      if (!opts.includeLinksAndForms && (subtype === N.Link || subtype === N.Widget)) {
        keep.push(raw as PDFRef | PDFDict);
      } else {
        removed++;
      }
    }
    if (keep.length) page.node.set(N.Annots, doc.context.obj(keep));
    else page.node.delete(N.Annots);
  }
  if (opts.includeLinksAndForms) doc.catalog.delete(N.AcroForm);

  onProgress?.(70, 'PDF wird gespeichert...');
  const saved = await doc.save({ useObjectStreams: false, addDefaultPage: false });
  // Rewrite with qpdf so the removed annotation objects are really gone from the file.
  onProgress?.(85, 'Entfernte Objekte werden aus der Datei gelöscht...');
  const cleaned = await runQpdf(saved, rewriteArgs());

  return {
    bytes: cleaned.output ?? saved,
    audit: `${removed} Anmerkung${removed === 1 ? '' : 'en'} rückstandslos entfernt${
      opts.includeLinksAndForms ? ' (inklusive Links und Formularfelder).' : '. Links und Formularfelder bleiben erhalten.'
    }`,
  };
}
