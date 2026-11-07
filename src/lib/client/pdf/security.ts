'use client';

import { PdfToolError, PDF_ERROR_MESSAGES } from './errors';
import { inspectEncryption, qpdfDecrypt, qpdfEncrypt, randomOwnerPassword } from './qpdf';
import type { PdfPermissionFlags } from './qpdfArgs';
import type { ProgressFn } from './common';

export type { PdfPermissionFlags };

export interface SecurityResult {
  bytes: Uint8Array;
  /** Optional German note shown next to the download. */
  note?: string;
}

/** Encrypts an unencrypted PDF with AES-256 (open password + permissions). */
export async function protectPdf(
  input: Uint8Array,
  opts: { userPassword: string; ownerPassword?: string; permissions: PdfPermissionFlags },
  onProgress?: ProgressFn
): Promise<SecurityResult> {
  onProgress?.(20, 'Dokument wird geprüft...');
  const state = await inspectEncryption(input);
  if (state.kind !== 'none') throw new PdfToolError('ALREADY_ENCRYPTED', PDF_ERROR_MESSAGES.alreadyEncrypted);

  const owner = opts.ownerPassword || randomOwnerPassword();
  if (owner === opts.userPassword) {
    throw new PdfToolError(
      'INVALID_INPUT',
      'Das Besitzer-Kennwort muss sich vom Öffnen-Kennwort unterscheiden, sonst greifen die Berechtigungen nicht.'
    );
  }
  onProgress?.(55, 'Dokument wird mit AES-256 verschlüsselt...');
  const bytes = await qpdfEncrypt(input, opts.userPassword, owner, opts.permissions);
  return {
    bytes,
    note: opts.ownerPassword
      ? undefined
      : 'Es wurde ein zufälliges Besitzer-Kennwort gesetzt – die Berechtigungen lassen sich nur durch Entsperren und erneutes Schützen ändern.',
  };
}

/** Removes the encryption (open password and/or permission restrictions). */
export async function unlockPdf(input: Uint8Array, password: string, onProgress?: ProgressFn): Promise<SecurityResult> {
  onProgress?.(20, 'Verschlüsselung wird geprüft...');
  const state = await inspectEncryption(input);
  if (state.kind === 'none') throw new PdfToolError('NOT_ENCRYPTED', PDF_ERROR_MESSAGES.notEncrypted);

  onProgress?.(55, 'Schutz wird entfernt...');
  if (state.kind === 'encrypted') {
    // Only permission restrictions (no open password): no password needed.
    const bytes = await qpdfDecrypt(input);
    return {
      bytes,
      note: 'Das Dokument hatte kein Öffnen-Kennwort. Die Einschränkungen (Drucken, Kopieren, Bearbeiten) wurden entfernt.',
    };
  }
  if (!password) throw new PdfToolError('PASSWORD_REQUIRED', PDF_ERROR_MESSAGES.passwordRequired);
  const bytes = await qpdfDecrypt(input, password);
  return { bytes };
}

/**
 * Sets new permission flags. Keeps an existing open password (when the user supplied it),
 * otherwise the document stays openable without a password.
 */
export async function changePermissions(
  input: Uint8Array,
  opts: { currentPassword: string; newOwnerPassword?: string; permissions: PdfPermissionFlags },
  onProgress?: ProgressFn
): Promise<SecurityResult> {
  onProgress?.(20, 'Bestehende Verschlüsselung wird geprüft...');
  const initial = await inspectEncryption(input);

  let userPassword = '';
  let currentOwner: string | undefined;
  let decryptWith: string | undefined;

  if (initial.kind === 'needs-password') {
    if (!opts.currentPassword) throw new PdfToolError('PASSWORD_REQUIRED', PDF_ERROR_MESSAGES.passwordRequired);
    const withPw = await inspectEncryption(input, opts.currentPassword);
    if (withPw.kind !== 'encrypted') throw new PdfToolError('WRONG_PASSWORD', PDF_ERROR_MESSAGES.wrongPassword);
    decryptWith = opts.currentPassword;
    if (withPw.suppliedIsOwner) {
      currentOwner = opts.currentPassword;
      userPassword = withPw.userPassword;
      if (!userPassword) {
        throw new PdfToolError(
          'INVALID_INPUT',
          'Sie haben das Besitzer-Kennwort eingegeben. Bei AES-256 lässt sich das Öffnen-Kennwort daraus nicht ermitteln – bitte geben Sie das Öffnen-Kennwort ein, damit es erhalten bleibt.'
        );
      }
    } else {
      userPassword = opts.currentPassword;
    }
  } else if (initial.kind === 'encrypted' && opts.currentPassword) {
    const withPw = await inspectEncryption(input, opts.currentPassword);
    if (withPw.kind === 'encrypted' && withPw.suppliedIsOwner) currentOwner = opts.currentPassword;
  }

  const owner = opts.newOwnerPassword || currentOwner || randomOwnerPassword();
  if (owner === userPassword) {
    throw new PdfToolError(
      'INVALID_INPUT',
      'Das Besitzer-Kennwort muss sich vom Öffnen-Kennwort unterscheiden, sonst greifen die Berechtigungen nicht.'
    );
  }

  onProgress?.(60, 'Berechtigungen werden gesetzt (AES-256)...');
  const bytes = await qpdfEncrypt(input, userPassword, owner, opts.permissions, decryptWith);
  const notes: string[] = [];
  if (userPassword) notes.push('Das bestehende Öffnen-Kennwort bleibt erhalten.');
  if (!opts.newOwnerPassword && !currentOwner) {
    notes.push('Es wurde ein zufälliges Besitzer-Kennwort gesetzt.');
  }
  notes.push(
    'Hinweis: PDF-Berechtigungen werden von gängigen Programmen respektiert, sind aber kein Schutz gegen gezielte Umgehung.'
  );
  return { bytes, note: notes.join(' ') };
}
