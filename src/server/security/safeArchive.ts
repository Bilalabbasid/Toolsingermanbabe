import JSZip from 'jszip';

export interface ArchiveSafetyLimits {
  /** Maximum allowable uncompressed size in bytes (default 250 MB) */
  maxUncompressedBytes?: number;
  /** Maximum compression ratio before triggering bomb alert (default 100:1) */
  maxCompressionRatio?: number;
  /** Maximum number of file entries allowed inside archive (default 5,000) */
  maxEntries?: number;
}

export class ZipBombError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipBombError';
  }
}

/**
 * Safely loads and validates a ZIP archive against decompression bombs,
 * infinite expansion ratios, and archive path traversal attacks.
 */
export async function safeLoadZip(
  buffer: Buffer,
  limits: ArchiveSafetyLimits = {}
): Promise<JSZip> {
  const maxBytes = limits.maxUncompressedBytes || 250 * 1024 * 1024; // 250 MB
  const maxRatio = limits.maxCompressionRatio || 100;
  const maxEntries = limits.maxEntries || 5000;

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch (err: any) {
    throw new Error(`Archiv konnte nicht gelesen werden: ${err?.message || 'Ungültiges Format'}`);
  }

  const entries = Object.keys(zip.files);

  // 1. Entry count check
  if (entries.length > maxEntries) {
    throw new ZipBombError(
      `Sicherheitswarnung: Archiv enthält zu viele Einträge (${entries.length} > ${maxEntries}).`
    );
  }

  let totalUncompressedSize = 0;
  const compressedSize = buffer.length;

  for (const filename of entries) {
    // 2. Path traversal attack check in ZIP entry names
    if (
      filename.includes('../') ||
      filename.includes('..\\') ||
      filename.startsWith('/') ||
      filename.startsWith('\\') ||
      /^[a-zA-Z]:/.test(filename)
    ) {
      throw new ZipBombError(
        `Sicherheitswarnung: Unzulässige Pfad-Traversal-Sequenz in Archiv-Eintrag ("${filename}").`
      );
    }

    const entry = zip.files[filename];
    // In JSZip internal metadata
    const uncompressedSize = (entry as any)._data?.uncompressedSize || 0;
    totalUncompressedSize += uncompressedSize;

    // 3. Absolute size check
    if (totalUncompressedSize > maxBytes) {
      throw new ZipBombError(
        `Sicherheitswarnung: Dekomprimierte Dateigröße überschreitet das Sicherheitslimit von ${Math.round(
          maxBytes / (1024 * 1024)
        )} MB.`
      );
    }
  }

  // 4. Compression ratio check (only if archive expands beyond 10 MB)
  if (totalUncompressedSize > 10 * 1024 * 1024 && compressedSize > 0) {
    const ratio = totalUncompressedSize / compressedSize;
    if (ratio > maxRatio) {
      throw new ZipBombError(
        `Sicherheitswarnung: Verdacht auf Decompression-Bomb (Kompressionsverhältnis ${Math.round(
          ratio
        )}:1 überschreitet Limit von ${maxRatio}:1).`
      );
    }
  }

  return zip;
}
