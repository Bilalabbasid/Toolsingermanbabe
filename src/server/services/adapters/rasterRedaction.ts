import { PDFDocument } from 'pdf-lib';
import * as canvas from '@napi-rs/canvas';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RedactionZone } from './PdfSecurityService';

// Rebuild from pixels. No source streams, attachments, metadata or hidden text survive.
export async function rasterRedact(input: Buffer, terms: string[], zones: RedactionZone[]): Promise<Buffer> {
  if (!Array.isArray(terms) || !Array.isArray(zones) || terms.length > 100 || zones.length > 1000) throw new Error('Invalid redaction request.');
  if (terms.some(t => typeof t !== 'string' || t.length > 200)) throw new Error('Invalid terms.');
  const normalized = terms.map(t => t.trim()).filter(Boolean);
  if (!normalized.length && !zones.length) throw new Error('No redactions specified.');
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.DOMMatrix ||= canvas.DOMMatrix;
  globals.Path2D ||= canvas.Path2D;
  globals.ImageData ||= canvas.ImageData;
  const importModule = new Function('p', 'return import(p)');
  const pdfjs = await importModule(pathToFileURL(path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')).href;
  const source = await pdfjs.getDocument({ data: new Uint8Array(input), isEvalSupported: false }).promise;
  try {
    if (source.numPages > 20) throw new Error('Redaction page limit exceeded.');
    for (const zone of zones) {
      if (!zone || !Number.isInteger(zone.pageIndex) || zone.pageIndex < 0 || zone.pageIndex >= source.numPages ||
          ![zone.x, zone.y, zone.width, zone.height].every(Number.isFinite) || zone.width <= 0 || zone.height <= 0) throw new Error('Invalid redaction zone.');
    }
    const output = await PDFDocument.create();
    const found = new Set<string>();
    for (let i = 1; i <= source.numPages; i++) {
      const page = await source.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      if (viewport.width * viewport.height > 24000000) throw new Error('Page too large.');
      const surface = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = surface.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      ctx.fillStyle = '#000000';
      const items = (await page.getTextContent()).items.filter((item: { str?: string }) => typeof item.str === 'string');
      // Join text runs so split PDF strings and font encodings cannot bypass removal.
      const joined = items.map((item: { str: string }) => item.str).join('');
      const selected = new Set<number>();
      for (const term of normalized) {
        let offset = 0;
        while ((offset = joined.indexOf(term, offset)) !== -1) {
          found.add(term);
          let cursor = 0;
          items.forEach((item: { str: string }, index: number) => {
            const end = cursor + item.str.length;
            if (end > offset && cursor < offset + term.length) selected.add(index);
            cursor = end;
          });
          offset += term.length;
        }
      }
      for (const index of selected) {
        const item = items[index];
        const [a, b, , , x, y] = item.transform;
        // Reject rotated/skewed text rather than silently masking the wrong coordinates.
        if (Math.abs(b) > 0.001 || a <= 0) throw new Error('Rotated text requires explicit redaction zones.');
        const height = Math.max(item.height, Math.abs(item.transform[3]));
        const rect = viewport.convertToViewportRectangle([x - 3, y - height * 0.35, x + item.width + 3, y + height * 1.15]);
        ctx.fillRect(Math.min(rect[0], rect[2]), Math.min(rect[1], rect[3]), Math.abs(rect[2] - rect[0]), Math.abs(rect[3] - rect[1]));
      }
      for (const zone of zones.filter(z => z.pageIndex === i - 1)) {
        const rect = viewport.convertToViewportRectangle([zone.x, zone.y, zone.x + zone.width, zone.y + zone.height]);
        ctx.fillRect(Math.min(rect[0], rect[2]), Math.min(rect[1], rect[3]), Math.abs(rect[2] - rect[0]), Math.abs(rect[3] - rect[1]));
      }
      const png = await output.embedPng(surface.toBuffer('image/png'));
      output.addPage([viewport.width / 2, viewport.height / 2]).drawImage(png, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
      page.cleanup();
    }
    if (normalized.some(term => !found.has(term))) throw new Error('Not every term was found. Scanned text needs explicit zones.');
    return Buffer.from(await output.save());
  } finally { await source.destroy(); }
}
