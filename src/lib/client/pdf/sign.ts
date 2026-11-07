'use client';

import { StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { PdfToolError } from './errors';
import { loadPdfLib, sha256Hex, type ProgressFn } from './common';

/**
 * Position of the signature block, as fractions of the page as it is displayed
 * (i.e. after /Rotate), origin top-left. `width` is relative to the displayed page width.
 */
export interface SignaturePlacement {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
}

export interface SignatureStamp {
  signerName: string;
  reason: string;
}

export interface SignOptions {
  /** Transparent PNG of the signature (drawn, typed or uploaded). */
  signaturePng: Uint8Array;
  placement: SignaturePlacement;
  /** Optional visible audit line block below the signature. */
  stamp: SignatureStamp | null;
}

/** Layout of the stamp below the signature, relative to the block width (shared with the UI preview). */
export function stampMetrics(blockWidthPt: number, lineCount: number) {
  const fontSize = Math.min(9, Math.max(5, blockWidthPt / 30));
  const lineHeight = fontSize * 1.3;
  return { fontSize, lineHeight, height: lineCount * lineHeight + fontSize * 0.8 };
}

export function stampLineCount(stamp: SignatureStamp | null): number {
  if (!stamp) return 0;
  return 2 + (stamp.signerName.trim() ? 1 : 0) + (stamp.reason.trim() ? 1 : 0);
}

/** Replaces characters the standard (WinAnsi) font cannot encode, then truncates to `maxWidth`. */
function fitText(font: PDFFont, text: string, size: number, maxWidth: number): string {
  let safe = '';
  for (const ch of text) {
    try {
      font.encodeText(ch);
      safe += ch;
    } catch {
      safe += '?';
    }
  }
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  while (safe.length > 1 && font.widthOfTextAtSize(`${safe}…`, size) > maxWidth) safe = safe.slice(0, -1);
  return `${safe}…`;
}

/** Maps a point in displayed-page coordinates (pt, origin top-left) to PDF user space. */
function displayToUser(page: PDFPage) {
  const cb = page.getCropBox();
  const rot = (((page.getRotation().angle % 360) + 360) % 360) as 0 | 90 | 180 | 270;
  const displayW = rot === 90 || rot === 270 ? cb.height : cb.width;
  const displayH = rot === 90 || rot === 270 ? cb.width : cb.height;
  const map = (dx: number, dy: number): { x: number; y: number } => {
    switch (rot) {
      case 90:
        return { x: cb.x + dy, y: cb.y + dx };
      case 180:
        return { x: cb.x + cb.width - dx, y: cb.y + dy };
      case 270:
        return { x: cb.x + cb.width - dy, y: cb.y + cb.height - dx };
      default:
        return { x: cb.x + dx, y: cb.y + cb.height - dy };
    }
  };
  return { map, rotate: degrees(rot), displayW, displayH };
}

export async function signPdf(input: Uint8Array, opts: SignOptions, onProgress?: ProgressFn): Promise<Uint8Array> {
  onProgress?.(10, 'PDF wird geladen...');
  const doc = await loadPdfLib(input);
  const pageCount = doc.getPageCount();
  if (opts.placement.pageIndex < 0 || opts.placement.pageIndex >= pageCount) {
    throw new PdfToolError('INVALID_INPUT', 'Die gewählte Seite existiert in diesem Dokument nicht.');
  }

  onProgress?.(35, 'Unterschrift wird eingebettet...');
  let image;
  try {
    image = await doc.embedPng(opts.signaturePng);
  } catch {
    throw new PdfToolError('INVALID_INPUT', 'Das Unterschriftsbild konnte nicht verarbeitet werden. Bitte verwenden Sie PNG oder JPG.');
  }

  const page = doc.getPage(opts.placement.pageIndex);
  const { map, rotate, displayW, displayH } = displayToUser(page);

  const blockW = opts.placement.width * displayW;
  const sigH = blockW * (image.height / image.width);
  const left = opts.placement.x * displayW;
  const top = opts.placement.y * displayH;

  // Image anchor = its displayed bottom-left corner; pdf-lib rotates around that anchor.
  const anchor = map(left, top + sigH);
  page.drawImage(image, { x: anchor.x, y: anchor.y, width: blockW, height: sigH, rotate });

  if (opts.stamp) {
    onProgress?.(60, 'Prüfvermerk wird erstellt...');
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const hash = (await sha256Hex(input)).slice(0, 16).toUpperCase();
    const date = new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const lines: { text: string; bold?: boolean; color: [number, number, number] }[] = [];
    if (opts.stamp.signerName.trim()) {
      lines.push({ text: `Unterzeichnet von: ${opts.stamp.signerName.trim()}`, bold: true, color: [0.12, 0.16, 0.22] });
    }
    lines.push({ text: `Datum: ${date} Uhr`, color: [0.3, 0.33, 0.38] });
    if (opts.stamp.reason.trim()) lines.push({ text: `Grund: ${opts.stamp.reason.trim()}`, color: [0.3, 0.33, 0.38] });
    lines.push({ text: `Original-Hash (SHA-256): ${hash}`, color: [0.15, 0.45, 0.25] });

    const m = stampMetrics(blockW, lines.length);
    // Separator line directly under the signature.
    const lineStart = map(left, top + sigH + m.fontSize * 0.3);
    const lineEnd = map(left + blockW, top + sigH + m.fontSize * 0.3);
    page.drawLine({ start: lineStart, end: lineEnd, thickness: 0.5, color: rgb(0.55, 0.6, 0.68) });

    lines.forEach((line, i) => {
      const f = line.bold ? bold : font;
      const baseline = top + sigH + m.fontSize * 0.3 + (i + 1) * m.lineHeight;
      const p = map(left, baseline);
      page.drawText(fitText(f, line.text, m.fontSize, blockW), {
        x: p.x,
        y: p.y,
        size: m.fontSize,
        font: f,
        color: rgb(...line.color),
        rotate,
      });
    });
  }

  onProgress?.(85, 'Signiertes PDF wird gespeichert...');
  return doc.save({ useObjectStreams: true });
}
