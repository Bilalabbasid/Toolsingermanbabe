const fs = require('node:fs');
function edit(p, fn) { fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); }
edit('src/server/services/adapters/PdfSecurityService.ts', s => {
  const start = s.indexOf('    const doc = await PDFDocument.load', s.indexOf('  async trueRedact('));
  const end = s.indexOf('\n  /**', start);
  return "import { rasterRedact } from './rasterRedaction';\n" + s.slice(0, start) + '    return rasterRedact(inputBuffer, terms, zones);\n  }\n' + s.slice(end);
});
edit('src/components/engines/PdfRedactionEngine.tsx', s => s.replace('PDF-Datenströme werden analysiert und dekomprimiert...', 'PDF-Seiten werden geprüft und gerastert...').replace('Vertrauliche Textsegmente werden physisch aus dem Dokument gelöscht...', 'Vertrauliche Bereiche werden entfernt...'));
// Route all temporary files through a configurable root so tests/deployments are isolated.
for (const p of ['src/server/storage/storage.ts','src/server/queue/queue.ts','src/server/services/adapters/AudioService.ts','src/server/services/adapters/VideoService.ts','src/server/services/adapters/ArchiveService.ts','src/server/services/adapters/PdfSecurityService.ts']) {
  edit(p, s => s.replaceAll("path.join(process.cwd(), '.tmp',", "path.join(process.env.COOLWAVE_TEMP_DIR || path.join(process.cwd(), '.tmp'),"));
}
// Never accept unknown formats or active SVG external references via upload validation.
edit('src/server/security/fileValidator.ts', s => {
  const marker = '  // 2. Minimum file size check';
  return s.replace(marker, `  const allowed = new Set('pdf doc docx odt rtf txt html htm xls xlsx csv ppt pptx odp epub png jpg jpeg gif webp svg psd eps heic heif avif bmp tiff tif ico mp3 wav flac ogg m4a mp4 aac mov webm mkv avi zip 7z tar gz gzip tgz'.split(' '));
  if (!allowed.has(ext.slice(1))) return { valid: false, safeFilename, code: 'UNSUPPORTED_EXTENSION', error: 'Nicht unterstuetztes Dateiformat.' };
  if (ext === '.svg') {
    const text = buffer.toString('utf8');
    if (!/<svg\\b/i.test(text) || /<!ENTITY|<!DOCTYPE|<script|<foreignObject|\\bon\\w+\\s*=|(?:href|src)\\s*=\\s*["'](?!#|data:image\\/(?:png|jpeg);base64,)|url\\(\\s*["']?(?!#)/i.test(text)) return { valid: false, safeFilename, code: 'UNSAFE_SVG', error: 'SVG mit aktiven oder externen Inhalten ist nicht erlaubt.' };
  }
${marker}`);
});
console.log('Applied redaction, temporary root and upload-format fixes.');
