import path from 'path';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  safeFilename: string;
  detectedFormat?: string;
}

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.bat', '.cmd', '.sh', '.bash',
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.py', '.pyc', '.pyo', '.js', '.mjs', '.cjs', '.vbs', '.vbe',
  '.scr', '.msi', '.msp', '.com', '.bin', '.reg', '.wsf', '.wsh',
  '.jar', '.war', '.apk', '.iso', '.dmg',
]);

/**
 * Strips directory traversal sequences, null bytes, and non-printable control characters.
 */
export function sanitizeFilename(originalName: string): string {
  if (!originalName || typeof originalName !== 'string') {
    return `file_${Date.now()}`;
  }

  // Strip null bytes and control chars
  let cleaned = originalName.replace(/[\x00-\x1f\x7f]/g, '');

  // Extract base filename (removes directory paths like ../ or C:\)
  cleaned = path.basename(cleaned);

  // Replace backslashes and forward slashes if any remain
  cleaned = cleaned.replace(/[/\\]/g, '_');

  // Replace suspicious characters while keeping international unicode / german umlauts
  cleaned = cleaned.replace(/[<>:"|?*]/g, '_').trim();

  // If filename begins with dot or dash, sanitize
  cleaned = cleaned.replace(/^[.-]+/, '');

  if (!cleaned) {
    cleaned = `upload_${Date.now()}`;
  }

  // Truncate if excessively long (preserve extension)
  if (cleaned.length > 200) {
    const ext = path.extname(cleaned);
    const base = path.basename(cleaned, ext).slice(0, 190);
    cleaned = `${base}${ext}`;
  }

  return cleaned;
}

/**
 * Inspects raw buffer magic bytes to detect true file format and reject spoofed/malicious uploads.
 */
export function validateUploadedFile(
  buffer: Buffer,
  rawFilename: string,
  declaredMime?: string
): FileValidationResult {
  const safeFilename = sanitizeFilename(rawFilename);
  const ext = path.extname(safeFilename).toLowerCase();

  // 1. Block dangerous executable extensions
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      code: 'DISALLOWED_FILE_TYPE',
      error: `Aus Sicherheitsgründen sind ausführbare Dateien (${ext}) strikt untersagt.`,
      safeFilename,
    };
  }

  // 2. Minimum file size check (empty files cannot be processed)
  if (buffer.length === 0) {
    return {
      valid: false,
      code: 'EMPTY_FILE',
      error: 'Die hochgeladene Datei ist leer (0 Bytes).',
      safeFilename,
    };
  }

  // 3. Inspect binary executable signatures (DOS MZ, ELF, Mach-O)
  if (buffer.length >= 2) {
    // DOS / Windows PE header (MZ)
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return {
        valid: false,
        code: 'MALICIOUS_EXECUTABLE_DETECTED',
        error: 'Ausführbare Binärdateien (Windows PE/MZ) sind aus Sicherheitsgründen untersagt.',
        safeFilename,
      };
    }
  }

  if (buffer.length >= 4) {
    // Linux ELF header (\x7fELF)
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return {
        valid: false,
        code: 'MALICIOUS_EXECUTABLE_DETECTED',
        error: 'Ausführbare Linux-Binärdateien (ELF) sind untersagt.',
        safeFilename,
      };
    }
    // Mach-O header
    if (
      (buffer[0] === 0xfe && buffer[1] === 0xed && buffer[2] === 0xfa && (buffer[3] === 0xce || buffer[3] === 0xcf)) ||
      (buffer[0] === 0xce && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe) ||
      (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe)
    ) {
      return {
        valid: false,
        code: 'MALICIOUS_EXECUTABLE_DETECTED',
        error: 'Ausführbare macOS-Binärdateien (Mach-O) sind untersagt.',
        safeFilename,
      };
    }
  }

  // 4. Magic-byte verification per format family
  let detectedFormat = 'unknown';

  // PDF verification: must contain %PDF- in the header
  if (ext === '.pdf') {
    const headerSlice = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
    if (!headerSlice.includes('%PDF-')) {
      return {
        valid: false,
        code: 'SPOOFED_PDF',
        error: 'Die Datei hat die Endung .pdf, enthält jedoch keine gültige PDF-Signatur (%PDF-).',
        safeFilename,
      };
    }
    detectedFormat = 'pdf';
  }

  // ZIP-based OpenXML and Oasis formats (.docx, .xlsx, .pptx, .odt, .odp, .epub, .zip)
  else if (['.docx', '.xlsx', '.pptx', '.odt', '.odp', '.epub', '.zip'].includes(ext)) {
    const isZip =
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
      (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

    if (!isZip) {
      return {
        valid: false,
        code: 'SPOOFED_ARCHIVE',
        error: `Die Datei (${ext}) weist keine gültige ZIP/OpenXML-Signatur (PK..) auf.`,
        safeFilename,
      };
    }
    detectedFormat = 'zip_archive';
  }

  // Legacy Compound File Binary Format (.doc, .xls, .ppt)
  else if (['.doc', '.xls', '.ppt'].includes(ext)) {
    const isCfbf =
      buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1;

    // Some RTF or XML files are saved as .doc
    const isRtf = buffer.subarray(0, 5).toString('latin1') === '{\\rtf';
    const isXmlOrZip = buffer.subarray(0, 5).toString('latin1').includes('<?xml') || (buffer[0] === 0x50 && buffer[1] === 0x4b);

    if (!isCfbf && !isRtf && !isXmlOrZip) {
      return {
        valid: false,
        code: 'SPOOFED_OFFICE',
        error: `Die Datei (${ext}) ist keine gültige Microsoft Office Binärdatei.`,
        safeFilename,
      };
    }
    detectedFormat = 'legacy_office';
  }

  // PNG verification
  else if (ext === '.png') {
    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    if (!isPng) {
      return {
        valid: false,
        code: 'SPOOFED_PNG',
        error: 'Die Datei hat die Endung .png, enthält jedoch keine gültige PNG-Signatur.',
        safeFilename,
      };
    }
    detectedFormat = 'png';
  }

  // JPEG verification
  else if (['.jpg', '.jpeg'].includes(ext)) {
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (!isJpeg) {
      return {
        valid: false,
        code: 'SPOOFED_JPEG',
        error: 'Die Datei hat die Endung .jpg/.jpeg, enthält jedoch keine gültige JPEG-Signatur.',
        safeFilename,
      };
    }
    detectedFormat = 'jpeg';
  }

  // GIF verification
  else if (ext === '.gif') {
    const gifHeader = buffer.subarray(0, 6).toString('latin1');
    if (gifHeader !== 'GIF87a' && gifHeader !== 'GIF89a') {
      return {
        valid: false,
        code: 'SPOOFED_GIF',
        error: 'Die Datei weist keine gültige GIF-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'gif';
  }

  // WEBP verification (RIFF....WEBP)
  else if (ext === '.webp') {
    const isRiff = buffer.subarray(0, 4).toString('latin1') === 'RIFF';
    const isWebp = buffer.subarray(8, 12).toString('latin1') === 'WEBP';
    if (!isRiff || !isWebp) {
      return {
        valid: false,
        code: 'SPOOFED_WEBP',
        error: 'Die Datei weist keine gültige WebP/RIFF-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'webp';
  }

  // BMP verification (BM)
  else if (ext === '.bmp') {
    if (buffer.length < 2 || buffer[0] !== 0x42 || buffer[1] !== 0x4d) {
      return {
        valid: false,
        code: 'SPOOFED_BMP',
        error: 'Die Datei weist keine gültige BMP-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'bmp';
  }

  // TIFF verification
  else if (['.tif', '.tiff'].includes(ext)) {
    const isLe = buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00;
    const isBe = buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a;
    if (!isLe && !isBe) {
      return {
        valid: false,
        code: 'SPOOFED_TIFF',
        error: 'Die Datei weist keine gültige TIFF-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'tiff';
  }

  // PSD verification (8BPS)
  else if (ext === '.psd') {
    const isPsd = buffer.subarray(0, 4).toString('latin1') === '8BPS';
    if (!isPsd) {
      return {
        valid: false,
        code: 'SPOOFED_PSD',
        error: 'Die Datei weist keine gültige Adobe Photoshop PSD-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'psd';
  }

  // RTF verification
  else if (ext === '.rtf') {
    const isRtf = buffer.subarray(0, 5).toString('latin1') === '{\\rtf';
    if (!isRtf) {
      return {
        valid: false,
        code: 'SPOOFED_RTF',
        error: 'Die Datei weist keine gültige Rich Text Format (RTF) Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'rtf';
  }

  // Plain Text & CSV verification (check for excessive binary null bytes)
  else if (['.txt', '.csv'].includes(ext)) {
    const sample = buffer.subarray(0, Math.min(buffer.length, 2048));
    let nullCount = 0;
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0x00) nullCount++;
    }
    if (nullCount > 2) {
      return {
        valid: false,
        code: 'BINARY_TEXT_MISMATCH',
        error: 'Die Text-/CSV-Datei enthält unzulässige Binärdaten (Null-Bytes).',
        safeFilename,
      };
    }
    detectedFormat = 'text';
  }

  // -------------------------------------------------------------
  // AUDIO MAGIC BYTES (MP3, WAV, FLAC, OGG, M4A)
  // -------------------------------------------------------------
  else if (ext === '.mp3') {
    const hasId3 = buffer.length >= 3 && buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
    const hasSync = buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
    if (!hasId3 && !hasSync) {
      return {
        valid: false,
        code: 'SPOOFED_MP3',
        error: 'Die Datei weist keine gültige MP3-Signatur (ID3 / Sync Frame) auf.',
        safeFilename,
      };
    }
    detectedFormat = 'mp3';
  } else if (ext === '.wav') {
    const isRiff = buffer.length >= 12 && buffer.subarray(0, 4).toString('latin1') === 'RIFF';
    const isWave = buffer.length >= 12 && buffer.subarray(8, 12).toString('latin1') === 'WAVE';
    if (!isRiff || !isWave) {
      return {
        valid: false,
        code: 'SPOOFED_WAV',
        error: 'Die Datei weist keine gültige WAV/RIFF-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'wav';
  } else if (ext === '.flac') {
    const isFlac = buffer.length >= 4 && buffer.subarray(0, 4).toString('latin1') === 'fLaC';
    if (!isFlac) {
      return {
        valid: false,
        code: 'SPOOFED_FLAC',
        error: 'Die Datei weist keine gültige FLAC-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'flac';
  } else if (ext === '.ogg') {
    const isOgg = buffer.length >= 4 && buffer.subarray(0, 4).toString('latin1') === 'OggS';
    if (!isOgg) {
      return {
        valid: false,
        code: 'SPOOFED_OGG',
        error: 'Die Datei weist keine gültige OGG-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'ogg';
  } else if (['.m4a', '.mp4'].includes(ext)) {
    const isFtyp = buffer.length >= 8 && buffer.subarray(4, 8).toString('latin1') === 'ftyp';
    if (!isFtyp) {
      return {
        valid: false,
        code: 'SPOOFED_MP4_M4A',
        error: 'Die Datei weist keine gültige MP4/M4A ftyp-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = ext === '.m4a' ? 'm4a' : 'mp4';
  }

  // -------------------------------------------------------------
  // VIDEO MAGIC BYTES (WebM, MKV, AVI, MOV)
  // -------------------------------------------------------------
  else if (['.webm', '.mkv'].includes(ext)) {
    // EBML header (\x1a\x45\xdf\xa3)
    const isEbml =
      buffer.length >= 4 &&
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3;
    if (!isEbml) {
      return {
        valid: false,
        code: 'SPOOFED_MATROSKA',
        error: 'Die Datei weist keine gültige WebM/MKV EBML-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = ext === '.webm' ? 'webm' : 'mkv';
  } else if (ext === '.avi') {
    const isRiff = buffer.length >= 12 && buffer.subarray(0, 4).toString('latin1') === 'RIFF';
    const isAvi = buffer.length >= 12 && buffer.subarray(8, 12).toString('latin1') === 'AVI ';
    if (!isRiff || !isAvi) {
      return {
        valid: false,
        code: 'SPOOFED_AVI',
        error: 'Die Datei weist keine gültige AVI/RIFF-Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = 'avi';
  }

  // -------------------------------------------------------------
  // ARCHIVES (7Z, GZIP, TAR)
  // -------------------------------------------------------------
  else if (ext === '.7z') {
    // 7z signature: 37 7A BC AF 27 1C
    const is7z =
      buffer.length >= 6 &&
      buffer[0] === 0x37 &&
      buffer[1] === 0x7a &&
      buffer[2] === 0xbc &&
      buffer[3] === 0xaf &&
      buffer[4] === 0x27 &&
      buffer[5] === 0x1c;
    if (!is7z) {
      return {
        valid: false,
        code: 'SPOOFED_7Z',
        error: 'Die Datei weist keine gültige 7-Zip Signatur auf.',
        safeFilename,
      };
    }
    detectedFormat = '7z';
  } else if (ext === '.gz') {
    // GZIP header: 1F 8B
    const isGzip = buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
    if (!isGzip) {
      return {
        valid: false,
        code: 'SPOOFED_GZIP',
        error: 'Die Datei weist keine gültige GZIP-Signatur (1F 8B) auf.',
        safeFilename,
      };
    }
    detectedFormat = 'gzip';
  }

  return {
    valid: true,
    safeFilename,
    detectedFormat,
  };
}
