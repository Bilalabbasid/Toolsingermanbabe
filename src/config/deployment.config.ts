/**
 * Datei Tools — Centralized Deployment Capability System
 *
 * This is the SINGLE SOURCE OF TRUTH for which engines are available
 * per deployment target.  DO NOT scatter per-tool if/else checks across
 * components – add the engine here and query isEngineAvailable().
 *
 * Deployment targets:
 *   vercel   – Current public deployment (datei-tools.de)
 *              Browser-only + pure-Node serverless only.
 *              No native binaries, no persistent workers, no long-running jobs.
 *   azure    – Future full deployment with Docker workers + LibreOffice/FFmpeg.
 *
 * Adding a new engine:
 *   1. Add an entry below with both vercel and azure values.
 *   2. Mark vercel: false if the engine requires native binaries, persistent
 *      filesystem, FFmpeg, LibreOffice, Ghostscript, Tesseract-native, etc.
 *   3. Tools whose processingEngine maps to a vercel:false entry will be
 *      automatically hidden from all discovery surfaces and return HTTP 404.
 */

import type { EngineType } from '@/types/tool';

export type DeploymentTarget = 'vercel' | 'azure';

export interface EngineCapability {
  /** Whether this engine works on the Vercel serverless deployment */
  vercel: boolean;
  /** Whether this engine works on the full Azure deployment */
  azure: boolean;
  /** Human-readable reason why vercel is false (used in dev logs) */
  disabledReason?: string;
}

/**
 * Per-engine capability matrix.
 * Keep sorted alphabetically within each section for readability.
 */
export const ENGINE_CAPABILITIES: Record<EngineType, EngineCapability> = {
  // Every engine now runs 100 % in the browser (pdf-lib, pdf.js, qpdf/7-Zip/FFmpeg/Tesseract
  // WebAssembly served from /vendor). No native binaries or backend workers are needed.
  'dev-utility':             { vercel: true, azure: true },
  'favicon-create':          { vercel: true, azure: true },
  'image-bw':                { vercel: true, azure: true },
  'image-compress':          { vercel: true, azure: true },
  'image-crop':              { vercel: true, azure: true },
  'image-crop-circle':       { vercel: true, azure: true },
  'image-dpi':               { vercel: true, azure: true },
  'image-effects':           { vercel: true, azure: true },
  'image-metadata-strip':    { vercel: true, azure: true },
  'image-resize':            { vercel: true, azure: true },
  'image-rotate-flip':       { vercel: true, azure: true },
  'image-convert':           { vercel: true, azure: true },
  'design-convert':          { vercel: true, azure: true },
  'pdf-annotations-remove':  { vercel: true, azure: true },
  'pdf-compare':             { vercel: true, azure: true },
  'pdf-compress':            { vercel: true, azure: true },
  'pdf-editor':              { vercel: true, azure: true },
  'pdf-extract':             { vercel: true, azure: true },
  'pdf-flatten':             { vercel: true, azure: true },
  'pdf-header-footer':       { vercel: true, azure: true },
  'pdf-merge':               { vercel: true, azure: true },
  'pdf-metadata':            { vercel: true, azure: true },
  'pdf-numbering':           { vercel: true, azure: true },
  'pdf-optimize':            { vercel: true, azure: true },
  'pdf-organize':            { vercel: true, azure: true },
  'pdf-pdfa':                { vercel: true, azure: true },
  'pdf-permissions':         { vercel: true, azure: true },
  'pdf-protect':             { vercel: true, azure: true },
  'pdf-redact':              { vercel: true, azure: true },
  'pdf-repair':              { vercel: true, azure: true },
  'pdf-rotate':              { vercel: true, azure: true },
  'pdf-sign':                { vercel: true, azure: true },
  'pdf-split':               { vercel: true, azure: true },
  'pdf-to-image':            { vercel: true, azure: true },
  'pdf-unlock':              { vercel: true, azure: true },
  'pdf-watermark':           { vercel: true, azure: true },
  'doc-convert':             { vercel: true, azure: true },
  'ocr':                     { vercel: true, azure: true },
  'media-convert':           { vercel: true, azure: true },
  'archive':                 { vercel: true, azure: true },
  'archive-tool':            { vercel: true, azure: true },
  'text-utility':            { vercel: true, azure: true },
};

/**
 * Individual tools that cannot be done faithfully in a browser (e.g. writing legacy
 * binary formats or ISO-certified PDF/A). They stay hidden from every discovery
 * surface and return 404 until a real implementation exists.
 */
export const CLIENT_UNSUPPORTED_SLUGS: ReadonlySet<string> = new Set<string>([
  // EPS needs a PostScript interpreter; embedded previews are low-res rasters only
  'eps-in-svg-umwandeln',
  'eps-in-pdf-umwandeln',
  // ISO 19005 PDF/A conformance can't be guaranteed without Ghostscript/veraPDF
  'pdfa-umwandeln',
  // Writing the legacy binary PowerPoint 97-2003 format isn't feasible client-side
  'pptx-in-ppt-umwandeln',
]);

/**
 * Resolve the current deployment target from environment.
 * Defaults to 'vercel' unless NEXT_PUBLIC_DEPLOYMENT_TARGET='azure'.
 */
export function getDeploymentTarget(): DeploymentTarget {
  const val = (process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || '').toLowerCase();
  if (val === 'azure') return 'azure';
  return 'vercel';
}

/**
 * Check whether a given processing engine is available on the current deployment.
 */
export function isEngineAvailable(engine: EngineType): boolean {
  const cap = ENGINE_CAPABILITIES[engine];
  if (!cap) return false;
  const target = getDeploymentTarget();
  return cap[target] === true;
}

/**
 * Log (dev only) why an engine is disabled.
 */
export function getEngineDisabledReason(engine: EngineType): string | undefined {
  const cap = ENGINE_CAPABILITIES[engine];
  return cap?.disabledReason;
}

/**
 * Per-file size limit (MB) enforced by each in-browser engine. Shown on tool pages so the
 * advertised limit always matches what the engine actually accepts.
 */
const ENGINE_FILE_LIMIT_MB: Partial<Record<EngineType, number>> = {
  'ocr': 50,
  'pdf-to-image': 50,
  'favicon-create': 10,
  'pdf-compress': 100,
  'pdf-protect': 100,
  'pdf-unlock': 100,
  'pdf-permissions': 100,
  'pdf-redact': 100,
  'pdf-sign': 100,
  'pdf-repair': 100,
  'pdf-optimize': 100,
  'pdf-flatten': 100,
  'pdf-annotations-remove': 100,
  'image-convert': 300,
  'design-convert': 300,
  'doc-convert': 300,
  'image-compress': 300,
};

export function getClientFileLimitMB(engine: EngineType): number {
  return ENGINE_FILE_LIMIT_MB[engine] ?? 500;
}
