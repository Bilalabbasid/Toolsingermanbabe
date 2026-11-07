'use client';

import { PdfToolError, PDF_ERROR_MESSAGES } from './errors';
import {
  IN_PATH,
  OUT_PATH,
  decryptArgs,
  encryptArgs,
  parseShowEncryption,
  showEncryptionArgs,
  type EncryptionState,
  type PdfPermissionFlags,
} from './qpdfArgs';

/** Self-hosted wasm binary (copied from node_modules by scripts/copy-wasm-assets.mjs). */
const QPDF_WASM_URL = '/vendor/qpdf/qpdf.wasm';

interface QpdfFs {
  mkdir: (path: string) => void;
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
}

interface QpdfInstance {
  callMain: (args: string[]) => number;
  FS: QpdfFs;
}

type QpdfFactory = (opts: { locateFile: () => string; noInitialRun?: boolean }) => Promise<QpdfInstance>;

let factoryPromise: Promise<QpdfFactory> | null = null;

function loadFactory(): Promise<QpdfFactory> {
  if (!factoryPromise) {
    factoryPromise = import('@neslinesli93/qpdf-wasm')
      .then((mod) => {
        const m = mod as unknown as { default?: unknown };
        const factory = (typeof m.default === 'function' ? m.default : mod) as unknown;
        if (typeof factory !== 'function') throw new Error('qpdf factory not found');
        return factory as QpdfFactory;
      })
      .catch((err) => {
        factoryPromise = null;
        throw err;
      });
  }
  return factoryPromise;
}

export interface QpdfResult {
  /** 0 = success, 3 = success with warnings, 2 = error. */
  exitCode: number;
  output: Uint8Array | null;
  /** Everything qpdf wrote to stdout / stderr. */
  messages: string[];
}

/**
 * Runs one qpdf command against `input` in a fresh, isolated module instance
 * (callMain is not guaranteed to be re-entrant, and a fresh heap keeps memory bounded).
 */
export async function runQpdf(input: Uint8Array, args: string[]): Promise<QpdfResult> {
  if (typeof window === 'undefined') throw new PdfToolError('RUNTIME', PDF_ERROR_MESSAGES.runtime);

  let factory: QpdfFactory;
  try {
    factory = await loadFactory();
  } catch {
    throw new PdfToolError('RUNTIME', PDF_ERROR_MESSAGES.runtime);
  }

  // The Emscripten glue binds console.log / console.error once, synchronously, while the
  // factory runs. Swapping them for that moment routes qpdf's stdout/stderr into `messages`
  // without leaking passwords or noise into the browser console.
  const messages: string[] = [];
  const capture = (...parts: unknown[]) => {
    messages.push(parts.map(String).join(' '));
  };
  const originalLog = console.log;
  const originalError = console.error;
  let pending: Promise<QpdfInstance>;
  console.log = capture;
  console.error = capture;
  try {
    pending = factory({ locateFile: () => QPDF_WASM_URL, noInitialRun: true });
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  let qpdf: QpdfInstance;
  try {
    qpdf = await pending;
  } catch {
    throw new PdfToolError('RUNTIME', PDF_ERROR_MESSAGES.runtime);
  }

  try {
    qpdf.FS.mkdir('/work');
  } catch {
    // already exists
  }
  qpdf.FS.writeFile(IN_PATH, input);

  let exitCode: number;
  try {
    exitCode = qpdf.callMain(args);
  } catch (err) {
    const status = (err as { status?: number } | null)?.status;
    exitCode = typeof status === 'number' ? status : 2;
    if (typeof status !== 'number') messages.push(String((err as Error)?.message ?? err));
  }

  let output: Uint8Array | null = null;
  if (exitCode === 0 || exitCode === 3) {
    try {
      // Copy out of the wasm heap so the instance can be garbage-collected.
      output = qpdf.FS.readFile(OUT_PATH).slice();
    } catch {
      output = null;
    }
  }
  return { exitCode, output, messages };
}

function hasInvalidPassword(messages: string[]): boolean {
  return messages.some((m) => /invalid password/i.test(m));
}

/** Throws a German PdfToolError for a failed qpdf run. */
export function throwForQpdfFailure(result: QpdfResult, passwordSupplied: boolean): never {
  if (hasInvalidPassword(result.messages)) {
    throw passwordSupplied
      ? new PdfToolError('WRONG_PASSWORD', PDF_ERROR_MESSAGES.wrongPassword)
      : new PdfToolError('PASSWORD_REQUIRED', PDF_ERROR_MESSAGES.passwordRequired);
  }
  throw new PdfToolError('DAMAGED', PDF_ERROR_MESSAGES.damaged);
}

/** Runs qpdf and returns the output file, or throws a German error. */
export async function runQpdfForOutput(input: Uint8Array, args: string[], passwordSupplied = false): Promise<Uint8Array> {
  const result = await runQpdf(input, args);
  if (!result.output) throwForQpdfFailure(result, passwordSupplied);
  return result.output;
}

/** Determines whether a PDF is encrypted and whether `password` opens it. */
export async function inspectEncryption(input: Uint8Array, password?: string): Promise<EncryptionState> {
  const result = await runQpdf(input, showEncryptionArgs(password));
  const state = parseShowEncryption(result.exitCode, result.messages);
  if (!state) throw new PdfToolError('DAMAGED', PDF_ERROR_MESSAGES.damaged);
  return state;
}

/** Returns a random 32-hex-char owner password (used when the user does not choose one). */
export function randomOwnerPassword(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function qpdfEncrypt(
  input: Uint8Array,
  userPassword: string,
  ownerPassword: string,
  perms: PdfPermissionFlags,
  currentPassword?: string
): Promise<Uint8Array> {
  return runQpdfForOutput(input, encryptArgs(userPassword, ownerPassword, perms, currentPassword), Boolean(currentPassword));
}

export async function qpdfDecrypt(input: Uint8Array, password?: string): Promise<Uint8Array> {
  return runQpdfForOutput(input, decryptArgs(password), Boolean(password));
}
