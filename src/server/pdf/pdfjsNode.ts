import path from 'node:path';

let cachedPdfJs: any = null;

const standardFontDataUrl = `${path.join(
  process.cwd(),
  'node_modules',
  'pdfjs-dist',
  'standard_fonts',
)}${path.sep}`;

/**
 * Safely loads the legacy Node.js build of pdfjs-dist in Next.js server runtime without requiring external web workers.
 */
export async function getLoadedPdfJs(): Promise<any> {
  if (cachedPdfJs) return cachedPdfJs;

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  cachedPdfJs = pdfjs;
  return pdfjs;
}

export function getPdfJsDocumentOptions(data: Uint8Array | Buffer) {
  // pdfjs-dist v4 specifically rejects Node Buffer instances and requires standard Uint8Array
  // pdfjs transfers its input ArrayBuffer to a worker. Never hand it the
  // caller's storage Buffer or a view that may detach between operations.
  const u8 = new Uint8Array(data);

  return {
    data: u8,
    disableFontFace: true,
    standardFontDataUrl,
  };
}
