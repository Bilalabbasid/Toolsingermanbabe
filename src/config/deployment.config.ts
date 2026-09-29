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
  // ─── BROWSER-ONLY (always Vercel-safe) ──────────────────────────────────────
  'dev-utility':         { vercel: true,  azure: true },
  'favicon-create':      { vercel: true,  azure: true },
  'image-bw':            { vercel: true,  azure: true },
  'image-compress':      { vercel: true,  azure: true },
  'image-crop':          { vercel: true,  azure: true },
  'image-crop-circle':   { vercel: true,  azure: true },
  'image-dpi':           { vercel: true,  azure: true },
  'image-effects':       { vercel: true,  azure: true },
  'image-metadata-strip':{ vercel: true,  azure: true },
  'image-resize':        { vercel: true,  azure: true },
  'image-rotate-flip':   { vercel: true,  azure: true },
  'pdf-annotations-remove': { vercel: true, azure: true },
  'pdf-compress':        { vercel: true,  azure: true },
  'pdf-editor':          { vercel: true,  azure: true },
  'pdf-extract':         { vercel: true,  azure: true },
  'pdf-flatten':         { vercel: true,  azure: true },
  'pdf-header-footer':   { vercel: true,  azure: true },
  'pdf-merge':           { vercel: true,  azure: true },
  'pdf-metadata':        { vercel: true,  azure: true },
  'pdf-organize':        { vercel: true,  azure: true },
  'pdf-permissions':     { vercel: true,  azure: true },
  'pdf-protect':         { vercel: true,  azure: true },
  'pdf-redact':          { vercel: true,  azure: true },
  'pdf-repair':          { vercel: true,  azure: true },
  'pdf-rotate':          { vercel: true,  azure: true },
  'pdf-sign':            { vercel: true,  azure: true },
  'pdf-split':           { vercel: true,  azure: true },
  'pdf-to-image':        { vercel: true,  azure: true },
  'pdf-unlock':          { vercel: true,  azure: true },
  'pdf-watermark':       { vercel: true,  azure: true },
  'text-utility':        { vercel: true,  azure: true },
  'pdf-numbering':       { vercel: true,  azure: true },

  // ─── IMAGE CONVERSION ────────────────────────────────────────────────────────
  'image-convert':       { vercel: true,  azure: true },

  // ─── DOCUMENT CONVERSIONS — REQUIRE LIBREOFFICE / NATIVE NODE MODULES ───────
  'doc-convert': {
    vercel: false,
    azure: true,
    disabledReason:
      'Requires LibreOffice/native Node modules (muhammara, @napi-rs/canvas, pdfjs-dist server-side). ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },

  // ─── OCR — REQUIRES TESSERACT.JS (server-side native binding) ──────────────
  'ocr': {
    vercel: false,
    azure: true,
    disabledReason:
      'Current OCR implementation uses Tesseract.js server-side Node worker with traineddata ' +
      'file loading from disk. Not compatible with Vercel ephemeral functions. ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },

  // ─── MEDIA CONVERSION — REQUIRES FFMPEG ─────────────────────────────────────
  'media-convert': {
    vercel: false,
    azure: true,
    disabledReason:
      'Requires FFmpeg binary (@ffmpeg-installer/ffmpeg). ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },

  // ─── ARCHIVE — REQUIRES 7-ZIP BINARY ────────────────────────────────────────
  'archive': {
    vercel: false,
    azure: true,
    disabledReason:
      'Requires 7-Zip native binary (7z-bin / node-7z). ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },
  'archive-tool': {
    vercel: false,
    azure: true,
    disabledReason:
      'Requires 7-Zip native binary (7z-bin / node-7z). ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },

  // ─── PDF EXTENDED IN-BROWSER ENGINES ────────────────────────────────────────
  'pdf-compare':         { vercel: true,  azure: true },
  'pdf-optimize':        { vercel: true,  azure: true },

  // ─── PDF/A & ADVANCED SERVER OPERATIONS ─────────────────────────────────────
  'pdf-pdfa': {
    vercel: false,
    azure: true,
    disabledReason:
      'Requires Ghostscript / veraPDF for PDF/A compliance conversion. ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },

  // ─── DESIGN CONVERSION ───────────────────────────────────────────────────────
  'design-convert': {
    vercel: false,
    azure: true,
    disabledReason:
      'PSD/AI/SKETCH conversion requires ag-psd and @napi-rs/canvas native modules. ' +
      'PRESERVE IMPLEMENTATION — restore when Azure workers are available.',
  },
};

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
