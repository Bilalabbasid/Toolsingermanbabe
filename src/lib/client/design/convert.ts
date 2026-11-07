/**
 * Browser-side design conversions: PSD ⇄ raster, SVG → PDF, PDF → SVG.
 */
import { getClientPdfJs } from '@/lib/pdfjsClient';
import { canvasToBlob, canvasToBlobStrict, createCanvas, flattenCanvas, get2d, nextFrame } from '@/lib/client/image/canvas';
import { baseNameOf, decodeImageFile, prepareSvg, rasterizeSvgText } from '@/lib/client/image/decode';
import { canvasToPsd, readPsdComposite } from './psd';

export type ProgressFn = (percent: number, message?: string) => void;

export interface DesignResult {
  blob: Blob;
  fileName: string;
  size: number;
  /** Optional hint shown to the user (e.g. limitations that applied) */
  note?: string;
}

const result = (blob: Blob, fileName: string, note?: string): DesignResult => ({ blob, fileName, size: blob.size, note });

/* ------------------------------ PSD ------------------------------- */

export type RasterTarget = 'png' | 'jpg' | 'webp';

export async function psdToRaster(
  file: File,
  target: RasterTarget,
  quality: number,
  onProgress?: ProgressFn
): Promise<DesignResult> {
  onProgress?.(15, 'PSD-Datei wird gelesen...');
  await nextFrame();
  const { canvas, composedFromLayers } = await readPsdComposite(file);
  onProgress?.(70, 'Bild wird exportiert...');
  const q = Math.min(1, Math.max(0.01, quality / 100));
  let blob: Blob;
  if (target === 'jpg') blob = await canvasToBlobStrict(flattenCanvas(canvas, '#ffffff'), 'image/jpeg', q);
  else if (target === 'webp') blob = await canvasToBlobStrict(canvas, 'image/webp', q);
  else blob = await canvasToBlob(canvas, 'image/png');
  onProgress?.(100, 'Fertig');
  return result(
    blob,
    `datei_tools_${baseNameOf(file.name)}.${target}`,
    composedFromLayers
      ? 'Die PSD enthielt kein Gesamtbild (gespeichert ohne „Kompatibilität maximieren“). Das Ergebnis wurde vereinfacht aus den sichtbaren Ebenen zusammengesetzt – Ebeneneffekte, Masken und Einstellungsebenen fehlen.'
      : undefined
  );
}

export async function rasterToPsd(file: File, onProgress?: ProgressFn): Promise<DesignResult> {
  onProgress?.(15, 'Bild wird gelesen...');
  await nextFrame();
  const { canvas } = await decodeImageFile(file);
  onProgress?.(60, 'PSD-Datei wird geschrieben...');
  await nextFrame();
  const bytes = await canvasToPsd(canvas, baseNameOf(file.name).slice(0, 255) || 'Ebene 1');
  onProgress?.(100, 'Fertig');
  return result(new Blob([bytes as BlobPart], { type: 'image/vnd.adobe.photoshop' }), `datei_tools_${baseNameOf(file.name)}.psd`);
}

/* ---------------------------- SVG → PDF --------------------------- */

const MAX_RENDER_PIXELS = 36_000_000;
const PDF_MAX_SIDE = 14400;

export async function svgToPdf(file: File, dpi: number, onProgress?: ProgressFn): Promise<DesignResult> {
  onProgress?.(10, 'SVG wird analysiert...');
  const text = await file.text();
  const info = prepareSvg(text);
  // Page size: SVG CSS pixels at 96 DPI → points
  let pageW = info.width * 0.75;
  let pageH = info.height * 0.75;
  const longest = Math.max(pageW, pageH);
  if (longest > PDF_MAX_SIDE) {
    pageW *= PDF_MAX_SIDE / longest;
    pageH *= PDF_MAX_SIDE / longest;
  }
  let scale = dpi / 72; // pixels per point
  const px = pageW * scale * pageH * scale;
  if (px > MAX_RENDER_PIXELS) scale *= Math.sqrt(MAX_RENDER_PIXELS / px);
  const svgScale = (pageW * scale) / info.width;

  onProgress?.(30, `SVG wird mit ${Math.round(scale * 72)} DPI gerendert...`);
  await nextFrame();
  const canvas = await rasterizeSvgText(text, { svgScale });
  onProgress?.(65, 'PDF wird erstellt...');
  const png = await canvasToBlob(canvas, 'image/png');
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setProducer('Datei Tools (datei-tools.de)');
  pdf.setTitle(baseNameOf(file.name));
  const image = await pdf.embedPng(new Uint8Array(await png.arrayBuffer()));
  const page = pdf.addPage([pageW, pageH]);
  page.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH });
  const bytes = await pdf.save();
  onProgress?.(100, 'Fertig');
  return result(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `datei_tools_${baseNameOf(file.name)}.pdf`);
}

/* ---------------------------- PDF → SVG --------------------------- */

const MAX_PDF_PAGES = 100;
const MAX_PAGE_PIXELS = 25_000_000;

function escapeXml(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Bilddaten konnten nicht gelesen werden.'));
    reader.readAsDataURL(blob);
  });
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Converts every PDF page to an SVG: the page is rendered as a high-resolution
 * raster image, and the text is overlaid as invisible, selectable/searchable SVG text.
 * Multiple pages are returned as a ZIP archive.
 */
export async function pdfToSvg(file: File, renderScale: number, onProgress?: ProgressFn): Promise<DesignResult> {
  onProgress?.(5, 'PDF wird geöffnet...');
  const pdfjs = await getClientPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === 'PasswordException') {
      throw new Error('Das PDF ist passwortgeschützt. Bitte entfernen Sie zuerst den Passwortschutz.');
    }
    throw new Error('Die PDF-Datei konnte nicht geöffnet werden. Sie ist möglicherweise beschädigt.');
  }

  try {
    const pageCount = doc.numPages;
    if (pageCount > MAX_PDF_PAGES) {
      throw new Error(`Das PDF hat ${pageCount} Seiten. Im Browser können maximal ${MAX_PDF_PAGES} Seiten auf einmal umgewandelt werden.`);
    }
    const base = baseNameOf(file.name);
    const svgs: { name: string; content: string }[] = [];

    for (let p = 1; p <= pageCount; p++) {
      onProgress?.(5 + Math.round(((p - 1) / pageCount) * 85), `Seite ${p} von ${pageCount} wird umgewandelt...`);
      const page = await doc.getPage(p);
      const vp1 = page.getViewport({ scale: 1 });
      let scale = renderScale;
      const px = vp1.width * vp1.height * scale * scale;
      if (px > MAX_PAGE_PIXELS) scale *= Math.sqrt(MAX_PAGE_PIXELS / px);
      const vp = page.getViewport({ scale });

      const canvas = createCanvas(vp.width, vp.height);
      const ctx = get2d(canvas);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp, intent: 'print' }).promise;
      const jpg = await canvasToBlob(canvas, 'image/jpeg', 0.9);
      const href = await blobToDataUrl(jpg);
      canvas.width = 0;
      canvas.height = 0;

      const W = r2(vp1.width);
      const H = r2(vp1.height);
      const textContent = await page.getTextContent();
      const texts: string[] = [];
      for (const item of textContent.items) {
        if (!('str' in item) || !item.str || !item.str.trim()) continue;
        const tx = pdfjs.Util.transform(vp1.transform, item.transform) as number[];
        const fontSize = Math.hypot(tx[2], tx[3]);
        if (!fontSize || !Number.isFinite(fontSize)) continue;
        const angle = (Math.atan2(tx[1], tx[0]) * 180) / Math.PI;
        const width = item.width * vp1.scale;
        const transform = `translate(${r2(tx[4])} ${r2(tx[5])})${Math.abs(angle) > 0.01 ? ` rotate(${r2(angle)})` : ''}`;
        const lengthAttr = width > 0 ? ` textLength="${r2(width)}" lengthAdjust="spacingAndGlyphs"` : '';
        texts.push(
          `<text transform="${transform}" font-size="${r2(fontSize)}"${lengthAttr}>${escapeXml(item.str)}</text>`
        );
      }
      page.cleanup();

      const svg =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<!-- Erstellt mit Datei Tools (datei-tools.de): Seitenbild als Rastergrafik, Text als unsichtbare, auswählbare Ebene -->\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${W}pt" height="${H}pt" viewBox="0 0 ${W} ${H}">\n` +
        `<title>${escapeXml(base)} – Seite ${p}</title>\n` +
        `<image x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" xlink:href="${href}" href="${href}"/>\n` +
        `<g fill="#000000" fill-opacity="0" font-family="Helvetica, Arial, sans-serif" xml:space="preserve">\n${texts.join('\n')}\n</g>\n` +
        `</svg>\n`;
      svgs.push({ name: pageCount === 1 ? `datei_tools_${base}.svg` : `datei_tools_${base}_seite_${String(p).padStart(3, '0')}.svg`, content: svg });
      await nextFrame();
    }

    if (svgs.length === 1) {
      onProgress?.(100, 'Fertig');
      return result(new Blob([svgs[0].content], { type: 'image/svg+xml' }), svgs[0].name);
    }
    onProgress?.(92, 'ZIP-Archiv wird erstellt...');
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const s of svgs) zip.file(s.name, s.content);
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    onProgress?.(100, 'Fertig');
    return result(blob, `datei_tools_${base}_svg_seiten.zip`, `${svgs.length} Seiten wurden als einzelne SVG-Dateien in ein ZIP-Archiv gepackt.`);
  } finally {
    await doc.destroy();
  }
}
