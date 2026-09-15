/**
 * Client-side loader for pdfjs-dist.
 * Ensures the worker is loaded from the local application origin (/pdf.worker.min.mjs)
 * compliant with Content-Security-Policy and without external CDN dependencies.
 */
export async function getClientPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjsLib;
}
