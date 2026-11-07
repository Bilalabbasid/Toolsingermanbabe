/**
 * In-browser archive extraction. The archive type is detected from the file's
 * magic bytes (not just the extension):
 *  - ZIP  → JSZip (fallback: 7-Zip for encrypted / Deflate64 / exotic ZIPs)
 *  - GZIP → native DecompressionStream (+ TAR parsing for .tar.gz / .tgz)
 *  - TAR  → own dependency-free parser
 *  - 7z / RAR / bzip2 / xz / everything else → 7-Zip (WASM, in a Web Worker)
 */
import {
  ArchiveLimitError,
  ARCHIVE_LIMITS,
  createExtractionBudget,
  createUniquePathRegistry,
  decodeZipFileName,
  formatMB,
  sanitizeEntryPath,
  type ExtractedEntry,
} from './safety';
import { parseTar, looksLikeTar } from './tar';
import { gunzipWithLimit, isGzip, parseGzipHeader } from './gzip';
import { extractWithSevenZip } from './sevenZip';

export type DetectedArchiveType = 'zip' | '7z' | 'rar' | 'gzip' | 'tar' | 'bzip2' | 'xz' | 'unknown';

export function detectArchiveType(head: Uint8Array): DetectedArchiveType {
  const b = head;
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) return 'zip';
  if (b.length >= 6 && b[0] === 0x37 && b[1] === 0x7a && b[2] === 0xbc && b[3] === 0xaf && b[4] === 0x27 && b[5] === 0x1c) return '7z';
  if (b.length >= 6 && b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72 && b[3] === 0x21 && b[4] === 0x1a && b[5] === 0x07) return 'rar';
  if (isGzip(b)) return 'gzip';
  if (b.length >= 3 && b[0] === 0x42 && b[1] === 0x5a && b[2] === 0x68) return 'bzip2';
  if (b.length >= 6 && b[0] === 0xfd && b[1] === 0x37 && b[2] === 0x7a && b[3] === 0x58 && b[4] === 0x5a && b[5] === 0x00) return 'xz';
  if (looksLikeTar(b)) return 'tar';
  return 'unknown';
}

export const ARCHIVE_TYPE_LABEL: Record<DetectedArchiveType, string> = {
  zip: 'ZIP',
  '7z': '7z',
  rar: 'RAR',
  gzip: 'GZIP',
  tar: 'TAR',
  bzip2: 'BZIP2',
  xz: 'XZ',
  unknown: 'unbekannt',
};

export interface ExtractOptions {
  onProgress?: (fraction: number) => void;
  onStatus?: (text: string) => void;
  signal?: AbortSignal;
}

export interface ExtractResult {
  type: DetectedArchiveType;
  entries: ExtractedEntry[];
  /** Additional info shown to the user (e.g. nested TAR was unpacked). */
  note?: string;
}

function stripGzipExtension(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.tgz')) return name.slice(0, -4) + '.tar';
  if (lower.endsWith('.gzip')) return name.slice(0, -5);
  if (lower.endsWith('.gz')) return name.slice(0, -3);
  return `${name}.entpackt`;
}

function baseName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

async function extractZipWithJsZip(file: File, opts: ExtractOptions): Promise<ExtractedEntry[]> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file, {
    checkCRC32: true,
    decodeFileName: (bytes: unknown) => decodeZipFileName(bytes as Uint8Array | string | number[]),
  });
  const files = Object.values(zip.files).filter((f) => !f.dir);
  const budget = createExtractionBudget(file.size);
  const declared = files.reduce(
    (sum, f) => sum + ((f as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0),
    0
  );
  budget.checkDeclared(declared, files.length);

  const unique = createUniquePathRegistry();
  const entries: ExtractedEntry[] = [];
  for (let i = 0; i < files.length; i++) {
    if (opts.signal?.aborted) throw new DOMException('Abgebrochen', 'AbortError');
    const f = files[i];
    const safe = sanitizeEntryPath(f.name);
    if (!safe) continue;
    const data = await f.async('uint8array');
    budget.add(data.length);
    entries.push({ path: unique(safe), size: data.length, data });
    opts.onProgress?.((i + 1) / files.length);
  }
  return entries;
}

async function sevenZip(file: File, opts: ExtractOptions): Promise<ExtractedEntry[]> {
  opts.onStatus?.('7-Zip-Modul wird geladen und Archiv geprüft …');
  return extractWithSevenZip(file, {
    maxBytes: createExtractionBudget(file.size).maxBytes,
    maxEntries: ARCHIVE_LIMITS.maxEntries,
    onProgress: opts.onProgress,
    signal: opts.signal,
  });
}

/** If the only extracted file is itself a TAR (e.g. .tar.bz2, .tar.xz), unpack it too. */
function unpackNestedTar(entries: ExtractedEntry[], inputSize: number): { entries: ExtractedEntry[]; nested: boolean } {
  if (entries.length !== 1 || !looksLikeTar(entries[0].data)) return { entries, nested: false };
  const budget = createExtractionBudget(inputSize);
  const inner = parseTar(entries[0].data, { budget });
  return { entries: inner, nested: true };
}

export async function extractArchive(file: File, opts: ExtractOptions = {}): Promise<ExtractResult> {
  if (file.size > ARCHIVE_LIMITS.maxInputBytes) {
    throw new ArchiveLimitError(
      `Das Archiv ist ${formatMB(file.size)} groß. Im Browser können Archive bis ${formatMB(ARCHIVE_LIMITS.maxInputBytes)} verarbeitet werden.`
    );
  }
  if (file.size === 0) throw new Error('Die Datei ist leer.');

  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const type = detectArchiveType(head);

  if (type === 'zip') {
    opts.onStatus?.('ZIP-Archiv wird im Browser entpackt …');
    try {
      return { type, entries: await extractZipWithJsZip(file, opts) };
    } catch (zipErr) {
      if (zipErr instanceof ArchiveLimitError || (zipErr as Error)?.name === 'AbortError') throw zipErr;
      // Encrypted ZIPs, Deflate64 etc. – let 7-Zip try (gives precise error messages).
      try {
        return { type, entries: await sevenZip(file, opts) };
      } catch (szErr) {
        const msg = (szErr as Error)?.message || '';
        if (/7-Zip-Modul|Worker/.test(msg)) {
          throw new Error('Das ZIP-Archiv ist beschädigt, verschlüsselt oder nutzt ein nicht unterstütztes Kompressionsverfahren.');
        }
        throw szErr;
      }
    }
  }

  if (type === 'gzip') {
    opts.onStatus?.('GZIP-Datei wird dekomprimiert …');
    const budget = createExtractionBudget(file.size);
    const header = parseGzipHeader(head);
    let lastMb = -1;
    const data = await gunzipWithLimit(file, budget.maxBytes, (produced) => {
      const mb = Math.floor(produced / (1024 * 1024));
      if (mb !== lastMb) {
        lastMb = mb;
        opts.onStatus?.(`GZIP-Datei wird dekomprimiert … ${mb} MB entpackt`);
      }
    });
    if (looksLikeTar(data)) {
      opts.onStatus?.('Enthaltenes TAR-Archiv wird entpackt …');
      const entries = parseTar(data, { budget });
      return { type, entries, note: 'Die GZIP-Datei enthielt ein TAR-Archiv – dessen Dateien wurden direkt entpackt.' };
    }
    budget.add(data.length);
    const rawName = header.name ? baseName(header.name) : stripGzipExtension(file.name);
    const name = sanitizeEntryPath(rawName) || 'entpackt';
    return { type, entries: [{ path: name, size: data.length, data }] };
  }

  if (type === 'tar') {
    opts.onStatus?.('TAR-Archiv wird gelesen …');
    const budget = createExtractionBudget(file.size);
    const buf = new Uint8Array(await file.arrayBuffer());
    return { type, entries: parseTar(buf, { budget, onProgress: opts.onProgress }) };
  }

  // 7z, RAR, bzip2, xz and unknown formats → 7-Zip.
  const raw = await sevenZip(file, opts);
  const { entries, nested } = unpackNestedTar(raw, file.size);
  return {
    type,
    entries,
    note: nested ? 'Das Archiv enthielt ein TAR-Archiv – dessen Dateien wurden direkt entpackt.' : undefined,
  };
}

// ---------------------------------------------------------------------------
// ZIP creation
// ---------------------------------------------------------------------------

const ALREADY_COMPRESSED = /\.(zip|7z|rar|gz|tgz|bz2|xz|jpe?g|png|gif|webp|avif|heic|mp3|m4a|aac|ogg|opus|flac|mp4|m4v|mov|mkv|webm|avi|pdf|docx|xlsx|pptx|odt|ods|odp|epub|woff2?)$/i;

export interface ZipInputFile {
  /** Path inside the ZIP (sanitised again). */
  path: string;
  data: Blob | Uint8Array;
  date?: Date;
}

export async function createZipBlob(
  files: ZipInputFile[],
  onProgress?: (fraction: number) => void
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const unique = createUniquePathRegistry();
  for (const f of files) {
    const path = unique(sanitizeEntryPath(f.path) || 'datei');
    zip.file(path, f.data, {
      binary: true,
      date: f.date,
      compression: ALREADY_COMPRESSED.test(path) ? 'STORE' : 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }
  return zip.generateAsync(
    { type: 'blob', mimeType: 'application/zip', streamFiles: true },
    (meta) => onProgress?.(meta.percent / 100)
  );
}
