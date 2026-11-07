/**
 * User-facing (German) error type for the in-browser PDF tools.
 * Engines show `message` directly, so every message must be a complete German sentence.
 */
export type PdfToolErrorCode =
  | 'WRONG_PASSWORD'
  | 'PASSWORD_REQUIRED'
  | 'ENCRYPTED'
  | 'NOT_ENCRYPTED'
  | 'ALREADY_ENCRYPTED'
  | 'DAMAGED'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'UNSUPPORTED'
  | 'RUNTIME';

export class PdfToolError extends Error {
  readonly code: PdfToolErrorCode;

  constructor(code: PdfToolErrorCode, message: string) {
    super(message);
    this.name = 'PdfToolError';
    this.code = code;
  }
}

export const PDF_ERROR_MESSAGES = {
  wrongPassword: 'Das eingegebene Kennwort ist falsch. Bitte prüfen Sie Groß- und Kleinschreibung.',
  passwordRequired:
    'Dieses PDF ist mit einem Öffnen-Kennwort geschützt. Bitte geben Sie das Kennwort ein.',
  encrypted:
    'Dieses PDF ist verschlüsselt bzw. passwortgeschützt. Bitte entsperren Sie es zuerst mit dem Werkzeug „PDF entsperren“.',
  notEncrypted: 'Dieses PDF ist nicht passwortgeschützt – es gibt nichts zu entsperren.',
  alreadyEncrypted:
    'Dieses PDF ist bereits verschlüsselt. Bitte entsperren Sie es zuerst mit „PDF entsperren“ und schützen Sie es danach neu.',
  damaged:
    'Die Datei ist beschädigt oder kein gültiges PDF-Dokument und konnte nicht gelesen werden.',
  runtime:
    'Die PDF-Verarbeitung im Browser konnte nicht gestartet werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
  generic: 'Bei der Verarbeitung des PDFs ist ein Fehler aufgetreten.',
} as const;

function isEncryptedPdfLibError(err: unknown): boolean {
  const e = err as { name?: string; message?: string } | null;
  if (!e) return false;
  return e.name === 'EncryptedPDFError' || /is encrypted/i.test(e.message ?? '');
}

/**
 * Normalises any thrown value into a German message suitable for the UI.
 */
export function toGermanErrorMessage(err: unknown, fallback: string = PDF_ERROR_MESSAGES.generic): string {
  if (err instanceof PdfToolError) return err.message;
  if (isEncryptedPdfLibError(err)) return PDF_ERROR_MESSAGES.encrypted;
  const e = err as { name?: string; message?: string } | null;
  const name = e?.name ?? '';
  const msg = e?.message ?? '';
  if (name === 'PasswordException') return PDF_ERROR_MESSAGES.encrypted;
  if (name === 'InvalidPDFException' || /Failed to parse PDF|Invalid PDF structure|No PDF header/i.test(msg)) {
    return PDF_ERROR_MESSAGES.damaged;
  }
  if (name === 'AbortError' || msg === 'Abgebrochen') return 'Der Vorgang wurde abgebrochen.';
  return fallback;
}

/** Converts an error thrown by pdf-lib's PDFDocument.load into a PdfToolError. */
export function mapLoadError(err: unknown): PdfToolError {
  if (err instanceof PdfToolError) return err;
  if (isEncryptedPdfLibError(err)) return new PdfToolError('ENCRYPTED', PDF_ERROR_MESSAGES.encrypted);
  return new PdfToolError('DAMAGED', PDF_ERROR_MESSAGES.damaged);
}
