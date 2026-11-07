/**
 * Safety helpers for in-browser archive extraction: path sanitising (zip-slip),
 * decompression-bomb budgets and entry-count limits.
 *
 * Pure module (no DOM access) so it can be unit-tested under Node.
 */

export const ARCHIVE_LIMITS = {
  /** Largest archive we accept as input (browser memory). */
  maxInputBytes: 500 * 1024 * 1024,
  /** Hard cap on the total uncompressed size we keep in memory. */
  maxTotalBytes: 1024 * 1024 * 1024,
  /** Maximum number of extracted files. */
  maxEntries: 10_000,
  /** Maximum compression ratio (uncompressed / compressed) … */
  maxRatio: 1000,
  /** … that is only enforced once the output exceeds this size. */
  ratioFloorBytes: 100 * 1024 * 1024,
} as const;

export class ArchiveLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchiveLimitError';
  }
}

export interface ExtractedEntry {
  /** Sanitised, relative path inside the archive (always uses "/"). */
  path: string;
  size: number;
  data: Uint8Array;
}

/**
 * Normalises an archive entry path and removes anything that could escape the
 * extraction root: absolute paths, drive letters, "." / ".." segments and
 * control characters. Returns null when nothing usable is left.
 */
export function sanitizeEntryPath(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\\/g, '/');
  const segments: string[] = [];
  for (const part of cleaned.split('/')) {
    const seg = part.trim();
    if (!seg || seg === '.' || seg === '..') continue;
    // Strip Windows drive prefixes such as "C:".
    const noDrive = segments.length === 0 ? seg.replace(/^[a-zA-Z]:$/, '') : seg;
    if (!noDrive) continue;
    segments.push(noDrive.replace(/[<>:"|?*]/g, '_'));
  }
  if (segments.length === 0) return null;
  return segments.join('/');
}

/** Makes paths unique ("a.txt", "a (2).txt", …) so a later entry never silently replaces an earlier one. */
export function createUniquePathRegistry() {
  const used = new Set<string>();
  return (path: string): string => {
    if (!used.has(path.toLowerCase())) {
      used.add(path.toLowerCase());
      return path;
    }
    const slash = path.lastIndexOf('/');
    const dir = slash >= 0 ? path.slice(0, slash + 1) : '';
    const file = slash >= 0 ? path.slice(slash + 1) : path;
    const dot = file.lastIndexOf('.');
    const stem = dot > 0 ? file.slice(0, dot) : file;
    const ext = dot > 0 ? file.slice(dot) : '';
    for (let i = 2; ; i++) {
      const candidate = `${dir}${stem} (${i})${ext}`;
      if (!used.has(candidate.toLowerCase())) {
        used.add(candidate.toLowerCase());
        return candidate;
      }
    }
  };
}

/** Allowed total uncompressed bytes for an archive of the given size. */
export function allowedOutputBytes(inputBytes: number): number {
  return Math.min(
    ARCHIVE_LIMITS.maxTotalBytes,
    Math.max(ARCHIVE_LIMITS.ratioFloorBytes, inputBytes * ARCHIVE_LIMITS.maxRatio)
  );
}

export function formatMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Tracks extracted bytes / entries and throws a German error once limits are exceeded. */
export function createExtractionBudget(inputBytes: number) {
  const maxBytes = allowedOutputBytes(inputBytes);
  let total = 0;
  let entries = 0;
  return {
    maxBytes,
    get totalBytes() {
      return total;
    },
    /** Checks a declared size before decompression (fail fast). */
    checkDeclared(declaredTotal: number, declaredEntries: number) {
      if (declaredEntries > ARCHIVE_LIMITS.maxEntries) {
        throw new ArchiveLimitError(
          `Das Archiv enthält ${declaredEntries.toLocaleString('de-DE')} Dateien. Im Browser können maximal ${ARCHIVE_LIMITS.maxEntries.toLocaleString('de-DE')} Dateien entpackt werden.`
        );
      }
      if (declaredTotal > maxBytes) {
        throw new ArchiveLimitError(
          `Das entpackte Archiv wäre ${formatMB(declaredTotal)} groß (erlaubt: ${formatMB(maxBytes)}). Zum Schutz vor Decompression-Bombs und zur Schonung des Arbeitsspeichers wurde der Vorgang abgebrochen.`
        );
      }
    },
    /** Accounts for bytes that were actually decompressed. */
    add(bytes: number) {
      total += bytes;
      entries += 1;
      if (entries > ARCHIVE_LIMITS.maxEntries) {
        throw new ArchiveLimitError(
          `Das Archiv enthält mehr als ${ARCHIVE_LIMITS.maxEntries.toLocaleString('de-DE')} Dateien und kann im Browser nicht entpackt werden.`
        );
      }
      if (total > maxBytes) {
        throw new ArchiveLimitError(
          `Die entpackten Daten überschreiten ${formatMB(maxBytes)}. Zum Schutz vor Decompression-Bombs wurde der Vorgang abgebrochen.`
        );
      }
    },
  };
}

export type ExtractionBudget = ReturnType<typeof createExtractionBudget>;

/** Concatenates Uint8Array chunks. */
export function concatChunks(chunks: Uint8Array[], total?: number): Uint8Array {
  const size = total ?? chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

const CP437_HIGH =
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';

/**
 * Decodes ZIP file names: UTF-8 when the bytes are valid UTF-8, otherwise
 * CP437 (the legacy default of Windows' built-in ZIP tool, incl. ä/ö/ü/ß).
 */
export function decodeZipFileName(bytes: Uint8Array | string | number[]): string {
  const arr =
    typeof bytes === 'string'
      ? Uint8Array.from(bytes, (c) => c.charCodeAt(0) & 0xff)
      : bytes instanceof Uint8Array
      ? bytes
      : Uint8Array.from(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(arr);
  } catch {
    let s = '';
    for (const b of arr) s += b < 0x80 ? String.fromCharCode(b) : CP437_HIGH[b - 0x80];
    return s;
  }
}
