export const ERROR_CODES = {
  OCR_REQUIRED: 'OCR_REQUIRED',
  ENGINE_UNAVAILABLE: 'ENGINE_UNAVAILABLE',
  FILE_ENCRYPTED: 'FILE_ENCRYPTED',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  TIMEOUT: 'TIMEOUT',
  RESOURCE_LIMIT: 'RESOURCE_LIMIT',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  UNSUPPORTED_ENCODING: 'UNSUPPORTED_ENCODING',
  GENERIC_FAILURE: 'GENERIC_FAILURE',
} as const;

export class AppError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
    this.name = 'AppError';
  }
}

const KNOWN_SAFE_MESSAGES = new Set([
  'Dieses PDF enthält keine maschinenlesbaren Tabellendaten oder Texte. Bei gescannten Dokumenten nutzen Sie bitte unsere OCR-Texterkennung.',
  'Ghostscript ist auf diesem Server nicht installiert. Echtes PDF/A erfordert die Server-Archivierungskomponente.',
  'Operation abgebrochen.',
  'Operation vom Benutzer oder Zeitüberschreitung abgebrochen.',
  'Es muss mindestens ein Benutzer- oder Besitzerpasswort angegeben werden.',
  'Das angegebene Kennwort ist falsch oder das Dokument ist nicht verschlüsselt.',
]);

/**
 * Translates and strictly sanitizes internal errors into safe, professional German messages.
 * Uses typed error code mapping and never leaks system paths, environment variables, or shell commands.
 */
export function sanitizeJobError(err: unknown): string {
  if (!err) {
    return 'Die Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Format und Inhalt.';
  }

  const raw = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);

  // 1. Check exact known safe user-facing message set
  if (KNOWN_SAFE_MESSAGES.has(raw)) {
    return raw;
  }

  // 2. Typed internal error code handling
  if (raw.includes('OCR_REQUIRED')) {
    return 'Dieses PDF enthält keine maschinenlesbaren Tabellendaten. Bei gescannten Dokumenten nutzen Sie bitte unsere OCR-Texterkennung.';
  }

  if (raw.includes('ENGINE_UNAVAILABLE')) {
    if (raw.includes('LibreOffice') || raw.includes('Office')) {
      return 'Für diese Konvertierung ist die Server-Office-Engine erforderlich, welche im aktuellen Serverumfeld nicht installiert ist.';
    }
    if (raw.includes('Ghostscript') || raw.includes('PDF/A')) {
      return 'Ghostscript ist auf diesem Server nicht installiert. Echtes ISO-konformes PDF/A erfordert die Server-Archivierungskomponente.';
    }
    return 'Die erforderliche Konvertierungs-Engine ist auf diesem System derzeit nicht verfügbar.';
  }

  const lower = raw.toLowerCase();

  // 3. Security / Password / Encryption
  if (lower.includes('password') || lower.includes('encrypt') || lower.includes('passwort') || lower.includes('recrypt')) {
    return 'Die Datei ist passwortgeschützt oder verschlüsselt. Bitte heben Sie den Kennwortschutz auf und versuchen Sie es erneut.';
  }

  // 4. Memory / Resource limits
  if (lower.includes('enomem') || lower.includes('out of memory') || lower.includes('heap')) {
    return 'Die Datei übersteigt die verfügbare Arbeitsspeicherkapazität. Bitte reduzieren Sie die Dateigröße oder Seitenzahl.';
  }

  // 5. Timeouts / Aborts
  if (lower.includes('timeout') || lower.includes('zeitlimit') || lower.includes('aborted') || lower.includes('etimedout')) {
    return 'Die Verarbeitung wurde aufgrund eines Zeitlimits beendet. Bitte versuchen Sie es mit einer kleineren Datei erneut.';
  }

  // 6. Corrupt / Damaged file
  if (lower.includes('corrupt') || lower.includes('invalid format') || lower.includes('bad signature') || lower.includes('damaged') || lower.includes('unexpected end')) {
    return 'Die Datei ist beschädigt oder hat ein unerwartetes Format. Bitte prüfen Sie die Eingabedatei.';
  }

  // 7. Encodings / Fonts
  if (lower.includes('winansi cannot encode')) {
    return 'Das Dokument enthält Sonderzeichen oder Symbole, die im Standard-PDF-Schriftsatz nicht kodiert werden können.';
  }

  // 8. Structure / Missing elements
  if (lower.includes('cannot read properties of null') || lower.includes('cannot read property') || lower.includes('is not a function')) {
    return 'Die Dokumentstruktur konnte nicht interpretiert werden. Bitte stellen Sie sicher, dass die Datei gültig und unbeschädigt ist.';
  }

  // Generic fallback: never expose raw stack traces, file paths, or internal details
  return 'Die Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Format, Inhalt und Gültigkeit der Datei.';
}
