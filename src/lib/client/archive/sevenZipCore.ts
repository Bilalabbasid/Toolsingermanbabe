/**
 * 7-Zip (7z-wasm) extraction logic, independent of how the module is loaded.
 * Runs inside a Web Worker in the browser (see sevenZip.worker.ts) and can be
 * exercised directly under Node for testing.
 *
 * Flow: list (-slt) → validate limits / encryption → extract into MEMFS →
 * collect regular files with sanitised paths.
 */
import {
  createUniquePathRegistry,
  formatMB,
  sanitizeEntryPath,
  type ExtractedEntry,
} from './safety';

export interface SevenZipFsLike {
  mkdir(path: string): unknown;
  writeFile(path: string, data: Uint8Array): void;
  readFile(path: string): Uint8Array;
  readdir(path: string): string[];
  lstat(path: string): { mode: number; size: number };
  isDir(mode: number): boolean;
  isFile(mode: number): boolean;
  unlink(path: string): void;
  mount(type: unknown, opts: unknown, mountpoint: string): unknown;
  chdir(path: string): void;
}

export interface SevenZipModuleLike {
  FS: SevenZipFsLike;
  WORKERFS?: unknown;
  callMain(args: string[]): unknown;
}

export type SevenZipFactoryLike = (opts?: Record<string, unknown>) => Promise<SevenZipModuleLike>;

export interface SevenZipExtractInput {
  name: string;
  /** Browser: mounted read-only via WORKERFS (no copy into memory). */
  file?: File | Blob;
  /** Fallback / Node: raw archive bytes. */
  bytes?: Uint8Array;
}

export interface SevenZipExtractOptions {
  factory: SevenZipFactoryLike;
  moduleOptions?: Record<string, unknown>;
  input: SevenZipExtractInput;
  maxBytes: number;
  maxEntries: number;
  onProgress?: (fraction: number) => void;
}

export class SevenZipError extends Error {
  constructor(
    message: string,
    public readonly code: 'encrypted' | 'limit' | 'corrupt' | 'unsupported' | 'empty'
  ) {
    super(message);
    this.name = 'SevenZipError';
  }
}

interface ListedItem {
  path: string;
  size: number;
  isDir: boolean;
  encrypted: boolean;
}

/** Parses the technical listing produced by `7zz l -slt`. */
export function parseSltListing(lines: string[]): { type?: string; items: ListedItem[] } {
  const sep = lines.findIndex((l) => l.trim() === '----------');
  let type: string | undefined;
  for (const l of sep >= 0 ? lines.slice(0, sep) : lines) {
    const m = /^Type = (.*)$/.exec(l);
    if (m) type = m[1].trim();
  }
  const items: ListedItem[] = [];
  if (sep < 0) return { type, items };
  let current: Record<string, string> = {};
  const flush = () => {
    if (current.Path !== undefined) {
      const attrs = current.Attributes || '';
      items.push({
        path: current.Path,
        size: Number(current.Size || 0) || 0,
        isDir: current.Folder === '+' || attrs.startsWith('D'),
        encrypted: current.Encrypted === '+',
      });
    }
    current = {};
  };
  for (const line of lines.slice(sep + 1)) {
    if (line.trim() === '') {
      flush();
      continue;
    }
    const idx = line.indexOf(' = ');
    if (idx > 0) current[line.slice(0, idx)] = line.slice(idx + 3);
    else if (line.endsWith(' =')) current[line.slice(0, -2)] = '';
  }
  flush();
  return { type, items };
}

// A password must always be supplied, otherwise 7-Zip would try to prompt on stdin.
const NO_PASSWORD = '-p__datei_tools_kein_passwort__';

export async function sevenZipExtract(opts: SevenZipExtractOptions): Promise<ExtractedEntry[]> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let outLine = '';
  let errLine = '';
  const report = opts.onProgress;

  const mod = await opts.factory({
    ...opts.moduleOptions,
    stdin: () => null,
    stdout: (code: number) => {
      if (code === 10) {
        stdout.push(outLine);
        outLine = '';
        return;
      }
      const ch = String.fromCharCode(code);
      outLine += ch;
      if (ch === '%' && report) {
        const m = /(\d{1,3})%$/.exec(outLine);
        if (m) report(Math.min(1, Number(m[1]) / 100));
      }
    },
    stderr: (code: number) => {
      if (code === 10) {
        stderr.push(errLine);
        errLine = '';
      } else {
        errLine += String.fromCharCode(code);
      }
    },
  });

  const decodeUtf8Lines = (arr: string[]) =>
    arr.map((l) => {
      // stdout chars arrive as raw UTF-8 bytes; re-decode them.
      try {
        return new TextDecoder('utf-8').decode(Uint8Array.from(l, (c) => c.charCodeAt(0) & 0xff));
      } catch {
        return l;
      }
    });

  const run = (args: string[]): boolean => {
    stdout.length = 0;
    stderr.length = 0;
    outLine = '';
    errLine = '';
    try {
      const ret = mod.callMain(args);
      if (outLine) stdout.push(outLine);
      if (errLine) stderr.push(errLine);
      return ret === undefined || ret === 0;
    } catch {
      if (outLine) stdout.push(outLine);
      if (errLine) stderr.push(errLine);
      return false;
    }
  };

  const FS = mod.FS;
  const safeName = (opts.input.name || 'archiv').replace(/[^\w.\-]+/g, '_') || 'archiv';
  let archivePath: string;
  const file = opts.input.file;
  if (file && mod.WORKERFS && typeof File !== 'undefined') {
    FS.mkdir('/in');
    const named = file instanceof File ? file : new File([file], safeName);
    FS.mount(mod.WORKERFS, { files: [named] }, '/in');
    archivePath = `/in/${named.name}`;
  } else {
    const bytes = opts.input.bytes ?? (file ? new Uint8Array(await file.arrayBuffer()) : null);
    if (!bytes) throw new Error('Keine Archivdaten übergeben.');
    FS.mkdir('/in');
    archivePath = `/in/${safeName}`;
    FS.writeFile(archivePath, bytes);
  }

  // 1) List contents and validate before extracting anything.
  const listOk = run(['l', '-slt', '-sccUTF-8', NO_PASSWORD, archivePath]);
  const listOut = decodeUtf8Lines(stdout);
  const listErr = decodeUtf8Lines(stderr).join('\n');
  const { items } = parseSltListing(listOut);
  // 7-Zip exits with code 1 for mere warnings, so only hard errors abort here.
  if (/ERROR/i.test(listErr) || (!listOk && items.length === 0)) {
    if (/password|encrypted/i.test(listErr)) {
      throw new SevenZipError(
        'Das Archiv ist passwortgeschützt (verschlüsselte Dateinamen). Passwortgeschützte Archive werden derzeit nicht unterstützt.',
        'encrypted'
      );
    }
    if (/Can ?not open|is not archive|Unsupported/i.test(listErr)) {
      throw new SevenZipError(
        'Die Datei konnte nicht als Archiv geöffnet werden. Sie ist beschädigt oder hat ein nicht unterstütztes Format.',
        'unsupported'
      );
    }
    if (!listErr.trim() && listOut.some((l) => l.startsWith('Listing archive:')) && !listOut.some((l) => l.startsWith('Type = '))) {
      // 7-Zip aborts silently when the headers are encrypted (-mhe) and the password is wrong.
      throw new SevenZipError(
        'Das Archiv konnte nicht geöffnet werden: Es ist passwortgeschützt (verschlüsselte Dateinamen) oder beschädigt. Passwortgeschützte Archive werden derzeit nicht unterstützt.',
        'encrypted'
      );
    }
    throw new SevenZipError('Das Archiv ist beschädigt und konnte nicht gelesen werden.', 'corrupt');
  }
  const files = items.filter((i) => !i.isDir);
  if (files.some((i) => i.encrypted)) {
    throw new SevenZipError(
      'Das Archiv ist passwortgeschützt. Passwortgeschützte Archive werden derzeit nicht unterstützt.',
      'encrypted'
    );
  }
  if (files.length > opts.maxEntries) {
    throw new SevenZipError(
      `Das Archiv enthält ${files.length.toLocaleString('de-DE')} Dateien. Im Browser können maximal ${opts.maxEntries.toLocaleString('de-DE')} Dateien entpackt werden.`,
      'limit'
    );
  }
  const declared = files.reduce((s, i) => s + i.size, 0);
  if (declared > opts.maxBytes) {
    throw new SevenZipError(
      `Das entpackte Archiv wäre ${formatMB(declared)} groß (erlaubt: ${formatMB(opts.maxBytes)}). Zum Schutz vor Decompression-Bombs wurde der Vorgang abgebrochen.`,
      'limit'
    );
  }

  // 2) Extract into an in-memory directory (7-Zip itself strips "../" and absolute paths).
  FS.mkdir('/out');
  report?.(0);
  const extractOk = run(['x', archivePath, '-o/out', '-y', '-bsp1', '-sccUTF-8', NO_PASSWORD]);
  const extractErr = decodeUtf8Lines(stderr).join('\n');
  if (/ERROR/i.test(extractErr) || (!extractOk && !/Everything is Ok/.test(stdout.join('\n')))) {
    if (/Wrong password|encrypted/i.test(extractErr)) {
      throw new SevenZipError(
        'Das Archiv ist passwortgeschützt. Passwortgeschützte Archive werden derzeit nicht unterstützt.',
        'encrypted'
      );
    }
    throw new SevenZipError(
      'Beim Entpacken ist ein Fehler aufgetreten. Das Archiv ist möglicherweise beschädigt oder unvollständig.',
      'corrupt'
    );
  }

  // 3) Collect regular files (symlinks / devices are ignored).
  const entries: ExtractedEntry[] = [];
  const unique = createUniquePathRegistry();
  let total = 0;
  const walk = (dir: string, rel: string) => {
    for (const name of FS.readdir(dir)) {
      if (name === '.' || name === '..') continue;
      const full = `${dir}/${name}`;
      const relPath = rel ? `${rel}/${name}` : name;
      const st = FS.lstat(full);
      if (FS.isDir(st.mode)) {
        walk(full, relPath);
      } else if (FS.isFile(st.mode)) {
        const safe = sanitizeEntryPath(relPath);
        if (!safe) continue;
        total += st.size;
        if (total > opts.maxBytes) {
          throw new SevenZipError(
            `Die entpackten Daten überschreiten ${formatMB(opts.maxBytes)}. Zum Schutz vor Decompression-Bombs wurde der Vorgang abgebrochen.`,
            'limit'
          );
        }
        if (entries.length >= opts.maxEntries) {
          throw new SevenZipError(
            `Das Archiv enthält mehr als ${opts.maxEntries.toLocaleString('de-DE')} Dateien.`,
            'limit'
          );
        }
        const data = FS.readFile(full);
        FS.unlink(full); // free memory early
        entries.push({ path: unique(safe), size: data.length, data });
      }
    }
  };
  walk('/out', '');
  report?.(1);
  if (entries.length === 0) {
    throw new SevenZipError('Das Archiv enthält keine Dateien.', 'empty');
  }
  return entries;
}
