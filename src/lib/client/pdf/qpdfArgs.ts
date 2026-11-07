/**
 * Pure builders for qpdf command lines (qpdf 12.x, as shipped in @neslinesli93/qpdf-wasm 0.3.0).
 * Kept free of browser APIs so the argument lists can be sanity-checked under Node.
 */

export interface PdfPermissionFlags {
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifying: boolean;
}

export const IN_PATH = '/work/input.pdf';
export const OUT_PATH = '/work/output.pdf';

/** Lossless structural compression used by "Komprimieren" and the optimise/repair passes. */
export const COMPRESSION_ARGS = [
  '--object-streams=generate',
  '--compress-streams=y',
  '--recompress-flate',
  '--compression-level=9',
] as const;

export function permissionArgs(perms: PdfPermissionFlags): string[] {
  return [
    `--print=${perms.allowPrinting ? 'full' : 'none'}`,
    `--extract=${perms.allowCopying ? 'y' : 'n'}`,
    // Assembly, form filling and annotating follow the general "modify" switch.
    `--modify=${perms.allowModifying ? 'all' : 'none'}`,
  ];
}

/** AES-256 (PDF 2.0 / R6) encryption. An empty user password means "opens without password". */
export function encryptArgs(
  userPassword: string,
  ownerPassword: string,
  perms: PdfPermissionFlags,
  password?: string
): string[] {
  return [
    ...(password ? [`--password=${password}`] : []),
    IN_PATH,
    '--encrypt',
    `--user-password=${userPassword}`,
    `--owner-password=${ownerPassword}`,
    '--bits=256',
    ...permissionArgs(perms),
    '--',
    OUT_PATH,
  ];
}

export function decryptArgs(password?: string): string[] {
  return [...(password ? [`--password=${password}`] : []), '--decrypt', IN_PATH, OUT_PATH];
}

export function showEncryptionArgs(password?: string): string[] {
  return [...(password ? [`--password=${password}`] : []), '--show-encryption', IN_PATH];
}

/** Plain rewrite: qpdf re-serialises every reachable object and writes a fresh xref table. */
export function rewriteArgs(): string[] {
  return [IN_PATH, ...COMPRESSION_ARGS, OUT_PATH];
}

export function compressArgs(): string[] {
  return [IN_PATH, ...COMPRESSION_ARGS, OUT_PATH];
}

/** Linearised ("Fast Web View") output plus object streams. */
export function optimizeArgs(): string[] {
  return [IN_PATH, '--linearize', ...COMPRESSION_ARGS, OUT_PATH];
}

export type EncryptionState =
  | { kind: 'none' }
  | { kind: 'needs-password' }
  | {
      kind: 'encrypted';
      /** The supplied (or empty) password was accepted as the owner password. */
      suppliedIsOwner: boolean;
      /** User password as reported by qpdf (only known when it was supplied or is empty). */
      userPassword: string;
    };

/** Interprets the output of `qpdf --show-encryption`. */
export function parseShowEncryption(exitCode: number, messages: string[]): EncryptionState | null {
  const text = messages.join('\n');
  if (/invalid password/i.test(text)) return { kind: 'needs-password' };
  if (exitCode !== 0 && exitCode !== 3) return null;
  if (/File is not encrypted/i.test(text)) return { kind: 'none' };
  const userLine = messages.find((m) => m.startsWith('User password = '));
  return {
    kind: 'encrypted',
    suppliedIsOwner: /Supplied password is owner password/i.test(text),
    userPassword: userLine ? userLine.slice('User password = '.length) : '',
  };
}
