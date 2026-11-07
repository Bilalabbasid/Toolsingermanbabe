/**
 * GZIP helpers built on the native DecompressionStream API (no WASM needed).
 * Decompression is streamed and aborted as soon as the byte budget is exceeded,
 * so a gzip bomb never fills the browser's memory.
 */
import { ArchiveLimitError, concatChunks, formatMB } from './safety';

export interface GzipHeaderInfo {
  /** Original file name stored in the header (FNAME), if any. */
  name?: string;
  mtime?: Date;
}

export function isGzip(buf: Uint8Array): boolean {
  return buf.length >= 3 && buf[0] === 0x1f && buf[1] === 0x8b && buf[2] === 0x08;
}

/** Reads the optional original file name (ISO-8859-1) from a gzip header. */
export function parseGzipHeader(buf: Uint8Array): GzipHeaderInfo {
  if (!isGzip(buf) || buf.length < 10) return {};
  const flags = buf[3];
  const mtimeSec = buf[4] | (buf[5] << 8) | (buf[6] << 16) | (buf[7] << 24);
  const info: GzipHeaderInfo = {};
  if (mtimeSec > 0) info.mtime = new Date((mtimeSec >>> 0) * 1000);
  let pos = 10;
  if (flags & 0x04) {
    if (pos + 2 > buf.length) return info;
    const xlen = buf[pos] | (buf[pos + 1] << 8);
    pos += 2 + xlen;
  }
  if (flags & 0x08) {
    let name = '';
    while (pos < buf.length && buf[pos] !== 0) {
      name += String.fromCharCode(buf[pos]);
      pos++;
    }
    if (name) info.name = name;
  }
  return info;
}

export function hasDecompressionStream(): boolean {
  return typeof DecompressionStream !== 'undefined';
}

/**
 * Decompresses gzip data with a hard output limit.
 * @throws ArchiveLimitError when more than `maxBytes` would be produced.
 */
export async function gunzipWithLimit(
  input: Blob | Uint8Array,
  maxBytes: number,
  onProgress?: (producedBytes: number) => void
): Promise<Uint8Array> {
  if (!hasDecompressionStream()) {
    throw new Error('Ihr Browser unterstützt keine native GZIP-Dekomprimierung. Bitte verwenden Sie eine aktuelle Version von Chrome, Edge, Firefox oder Safari.');
  }
  const blob = input instanceof Blob ? input : new Blob([input as BlobPart]);
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new ArchiveLimitError(
          `Die entpackten Daten überschreiten ${formatMB(maxBytes)}. Zum Schutz vor Decompression-Bombs wurde der Vorgang abgebrochen.`
        );
      }
      chunks.push(value);
      onProgress?.(total);
    }
  } catch (err) {
    if (err instanceof ArchiveLimitError) throw err;
    throw new Error('Die GZIP-Datei ist beschädigt oder unvollständig und konnte nicht entpackt werden.');
  }
  return concatChunks(chunks, total);
}
