/**
 * Translates and sanitizes raw system/library exceptions into user-friendly,
 * professional German error messages for job status reporting.
 * Prevents stack traces, paths, and raw library errors from leaking to users.
 */
export function sanitizeJobError(err: unknown): string {
  if (!err) {
    return 'Die Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Format und Inhalt.';
  }

  const raw = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);

  // If the error message is already an intentional, user-facing German sentence:
  if (
    raw.startsWith('Dieses PDF enthält') ||
    raw.startsWith('Die Datei konnte nicht') ||
    raw.startsWith('Verarbeitung abgebrochen') ||
    raw.startsWith('Kein Konvertierungs-Service') ||
    raw.startsWith('Ungültiges') ||
    raw.startsWith('Das Dokument') ||
    raw.startsWith('Bitte')
  ) {
    return raw;
  }

  const lower = raw.toLowerCase();

  if (lower.includes('winansi cannot encode')) {
    return 'Das Dokument enthält Sonderzeichen oder Symbole, die im Standard-PDF-Schriftsatz nicht kodiert werden können.';
  }

  if (lower.includes('cannot read properties of null') || lower.includes('foreach')) {
    return 'Die Tabellen- oder Seitenstruktur konnte nicht verarbeitet werden. Bei gescannten Dokumenten nutzen Sie bitte unsere OCR-Texterkennung.';
  }

  if (lower.includes('password') || lower.includes('encrypt') || lower.includes('passwort')) {
    return 'Die Datei ist passwortgeschützt oder verschlüsselt. Bitte heben Sie den Kennwortschutz auf und versuchen Sie es erneut.';
  }

  if (lower.includes('timeout') || lower.includes('zeitlimit') || lower.includes('aborted')) {
    return 'Die Verarbeitung wurde aufgrund eines Zeitlimits oder Abbruchs beendet. Bitte versuchen Sie es mit einer kleineren Datei erneut.';
  }

  if (lower.includes('corrupt') || lower.includes('invalid format') || lower.includes('bad signature') || lower.includes('damaged')) {
    return 'Die Datei ist beschädigt oder hat ein unerwartetes Format. Bitte prüfen Sie die Eingabedatei.';
  }

  if (lower.includes('enomem') || lower.includes('out of memory')) {
    return 'Die Datei übersteigt die verfügbare Arbeitsspeicherkapazität. Bitte reduzieren Sie die Dateigröße oder Seitenzahl.';
  }

  return 'Die Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Format, Inhalt und Passwort.';
}
