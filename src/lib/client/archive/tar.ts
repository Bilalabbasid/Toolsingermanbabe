/**
 * Minimal, dependency-free TAR reader (POSIX ustar, GNU long names, PAX
 * extended headers). Works on an in-memory Uint8Array and never writes to disk.
 */
import {
  createUniquePathRegistry,
  sanitizeEntryPath,
  type ExtractedEntry,
  type ExtractionBudget,
} from './safety';

const BLOCK = 512;
const textDecoder = new TextDecoder('utf-8');

function readString(buf: Uint8Array, offset: number, length: number): string {
  let end = offset;
  const max = offset + length;
  while (end < max && buf[end] !== 0) end++;
  return textDecoder.decode(buf.subarray(offset, end));
}

/** Parses an octal (or GNU base-256) numeric header field. */
function readNumber(buf: Uint8Array, offset: number, length: number): number {
  if (buf[offset] & 0x80) {
    // GNU base-256 encoding (used for files > 8 GB).
    let value = buf[offset] & 0x7f;
    for (let i = 1; i < length; i++) value = value * 256 + buf[offset + i];
    return value;
  }
  const str = readString(buf, offset, length).trim();
  if (!str) return 0;
  const value = parseInt(str, 8);
  return Number.isFinite(value) ? value : NaN;
}

function isZeroBlock(buf: Uint8Array, offset: number): boolean {
  for (let i = offset; i < offset + BLOCK; i++) if (buf[i] !== 0) return false;
  return true;
}

function checksumMatches(buf: Uint8Array, offset: number): boolean {
  const stored = readNumber(buf, offset + 148, 8);
  if (!Number.isFinite(stored)) return false;
  let sum = 0;
  for (let i = 0; i < BLOCK; i++) {
    sum += i >= 148 && i < 156 ? 32 : buf[offset + i];
  }
  return sum === stored;
}

/** Quick check whether the buffer starts with a TAR header. */
export function looksLikeTar(buf: Uint8Array): boolean {
  if (buf.length < BLOCK) return false;
  const magic = readString(buf, 257, 6);
  if (magic.startsWith('ustar')) return true;
  return !isZeroBlock(buf, 0) && checksumMatches(buf, 0);
}

function parsePax(data: Uint8Array): Record<string, string> {
  const out: Record<string, string> = {};
  const text = textDecoder.decode(data);
  let pos = 0;
  while (pos < text.length) {
    const space = text.indexOf(' ', pos);
    if (space < 0) break;
    const len = parseInt(text.slice(pos, space), 10);
    if (!Number.isFinite(len) || len <= 0) break;
    const record = text.slice(space + 1, pos + len - 1); // strip trailing "\n"
    const eq = record.indexOf('=');
    if (eq > 0) out[record.slice(0, eq)] = record.slice(eq + 1);
    pos += len;
  }
  return out;
}

export interface TarParseOptions {
  budget?: ExtractionBudget;
  onProgress?: (fraction: number) => void;
}

/**
 * Reads all regular files of a TAR archive. Directories, links and device
 * entries are skipped; paths are sanitised (no zip-slip).
 */
export function parseTar(buf: Uint8Array, options: TarParseOptions = {}): ExtractedEntry[] {
  const entries: ExtractedEntry[] = [];
  const unique = createUniquePathRegistry();
  let offset = 0;
  let longName: string | null = null;
  let pax: Record<string, string> = {};
  let headersSeen = 0;

  while (offset + BLOCK <= buf.length) {
    if (isZeroBlock(buf, offset)) break; // end-of-archive marker
    if (!checksumMatches(buf, offset)) {
      if (headersSeen === 0) {
        throw new Error('Die Datei ist kein gültiges TAR-Archiv.');
      }
      throw new Error('Das TAR-Archiv ist beschädigt (ungültige Prüfsumme).');
    }
    headersSeen++;

    const name = readString(buf, offset, 100);
    const sizeField = readNumber(buf, offset + 124, 12);
    const typeflag = String.fromCharCode(buf[offset + 156] || 48); // '\0' → '0'
    const magic = readString(buf, offset + 257, 6);
    const prefix = magic.startsWith('ustar') ? readString(buf, offset + 345, 155) : '';
    const size = pax.size !== undefined ? Number(pax.size) : sizeField;
    if (!Number.isFinite(size) || size < 0) {
      throw new Error('Das TAR-Archiv ist beschädigt (ungültige Dateigröße).');
    }

    const dataStart = offset + BLOCK;
    const dataEnd = dataStart + size;
    if (dataEnd > buf.length) {
      throw new Error('Das TAR-Archiv ist unvollständig oder abgeschnitten.');
    }
    const data = buf.subarray(dataStart, dataEnd);
    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;

    if (typeflag === 'L') {
      longName = readString(data, 0, data.length);
      continue;
    }
    if (typeflag === 'x') {
      pax = { ...pax, ...parsePax(data) };
      continue;
    }
    if (typeflag === 'g' || typeflag === 'K') continue; // global PAX / GNU long link

    const fullName = pax.path ?? longName ?? (prefix ? `${prefix}/${name}` : name);
    longName = null;
    pax = {};

    // Regular files only ('0', '\0' handled above, '7' = contiguous file).
    if (typeflag !== '0' && typeflag !== '7') continue;

    const safe = sanitizeEntryPath(fullName);
    if (!safe) continue;
    options.budget?.add(size);
    entries.push({ path: unique(safe), size, data });
    options.onProgress?.(Math.min(1, offset / buf.length));
  }

  if (headersSeen === 0) {
    throw new Error('Das TAR-Archiv ist leer.');
  }
  return entries;
}
