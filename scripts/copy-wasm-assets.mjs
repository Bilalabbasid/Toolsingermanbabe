#!/usr/bin/env node
/**
 * Copies the WebAssembly runtimes used by the in-browser tools into
 * public/vendor so they are served from our own origin (no third-party CDN,
 * no backend). Runs automatically on postinstall and before every build.
 *
 * public/vendor is git-ignored: the files are regenerated from node_modules.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'vendor');

const assets = [
  // qpdf — PDF encryption, decryption, permissions, repair, linearization
  ['node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm', 'qpdf/qpdf.wasm'],
  // 7-Zip — ZIP/7z/RAR/TAR/GZ extraction
  ['node_modules/7z-wasm/7zz.wasm', '7z/7zz.wasm'],
  ['node_modules/7z-wasm/7zz.umd.js', '7z/7zz.umd.js'],
  // FFmpeg (single-threaded core, no SharedArrayBuffer/COOP needed)
  ['node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js', 'ffmpeg/ffmpeg-core.js'],
  ['node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm', 'ffmpeg/ffmpeg-core.wasm'],
  // Tesseract OCR worker, cores and language models
  ['node_modules/tesseract.js/dist/worker.min.js', 'tesseract/worker.min.js'],
  ...[
    'tesseract-core.wasm.js',
    'tesseract-core-simd.wasm.js',
    'tesseract-core-lstm.wasm.js',
    'tesseract-core-simd-lstm.wasm.js',
    'tesseract-core-relaxedsimd.wasm.js',
    'tesseract-core-relaxedsimd-lstm.wasm.js',
  ].map((f) => [`node_modules/tesseract.js-core/${f}`, `tesseract/core/${f}`]),
  ['eng.traineddata', 'tessdata/eng.traineddata'],
  ['deu.traineddata', 'tessdata/deu.traineddata'],
];

let copied = 0;
for (const [src, dest] of assets) {
  const from = join(root, src);
  const to = join(out, dest);
  if (!existsSync(from)) {
    console.warn(`[copy-wasm-assets] missing ${src} — skipped`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue;
  copyFileSync(from, to);
  copied++;
}
console.log(`[copy-wasm-assets] ${copied} file(s) copied to public/vendor`);
