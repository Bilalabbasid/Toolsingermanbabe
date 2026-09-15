import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

let cachedGsBinary: string | null | undefined = undefined;

/**
 * Discovers the Ghostscript executable path in the environment.
 * Checks GS_PATH env var, system PATH, and standard Linux/Windows install locations.
 */
export async function getGhostscriptBinary(): Promise<string | null> {
  if (cachedGsBinary !== undefined) {
    return cachedGsBinary;
  }

  if (process.env.GS_PATH) {
    try {
      await fs.access(process.env.GS_PATH);
      cachedGsBinary = process.env.GS_PATH;
      return cachedGsBinary;
    } catch {
      // invalid GS_PATH
    }
  }

  const candidates =
    process.platform === 'win32'
      ? ['gswin64c.exe', 'gswin32c.exe', 'gs.exe', 'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe']
      : ['gs', '/usr/bin/gs', '/usr/local/bin/gs'];

  for (const candidate of candidates) {
    try {
      const { stdout } = await execFileAsync(candidate, ['--version'], { timeout: 3000 });
      if (stdout && stdout.trim().length > 0) {
        cachedGsBinary = candidate;
        return candidate;
      }
    } catch {
      // not found
    }
  }

  cachedGsBinary = null;
  return null;
}

export interface PdfAOptions {
  conformance?: '1b' | '2b' | '3b';
  signal?: AbortSignal;
}

/**
 * Converts a standard PDF into an authentic, ISO 19005-compliant PDF/A document using Ghostscript.
 * If Ghostscript is unavailable, throws ENGINE_UNAVAILABLE instead of returning pseudo-compliant PDFs.
 */
export async function convertPdfToPdfA(
  inputBuffer: Buffer,
  options: PdfAOptions = {}
): Promise<Buffer> {
  const gsBin = await getGhostscriptBinary();
  if (!gsBin) {
    throw new Error('ENGINE_UNAVAILABLE: Ghostscript ist auf diesem Server nicht installiert. Echtes PDF/A erfordert die Server-Archivierungskomponente.');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coolwave-pdfa-'));
  const inputPath = path.join(tempDir, `input_${crypto.randomBytes(6).toString('hex')}.pdf`);
  const outputPath = path.join(tempDir, `output_${crypto.randomBytes(6).toString('hex')}.pdf`);

  try {
    await fs.writeFile(inputPath, inputBuffer);

    const conformancePart = options.conformance === '2b' ? 2 : options.conformance === '3b' ? 3 : 1;

    // ISO 19005 Ghostscript parameters
    const args = [
      '-dPDFA=' + conformancePart,
      '-dBATCH',
      '-dNOPAUSE',
      '-dNOOUTERSAVE',
      '-dUseCIEColor',
      '-sProcessColorModel=DeviceRGB',
      '-sColorConversionStrategy=UseDeviceIndependentColor',
      '-sDEVICE=pdfwrite',
      '-dPDFACompatibilityPolicy=1',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    await execFileAsync(gsBin, args, {
      timeout: 60000,
      signal: options.signal,
    });

    const result = await fs.readFile(outputPath);
    return result;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Compresses a PDF file using Ghostscript's specialized pdfwrite settings for
 * Low, Medium, and High compression ratios.
 */
export async function compressPdfGhostscript(
  inputBuffer: Buffer,
  level: 'low' | 'medium' | 'high' = 'medium',
  signal?: AbortSignal
): Promise<Buffer> {
  const gsBin = await getGhostscriptBinary();
  if (!gsBin) {
    throw new Error('ENGINE_UNAVAILABLE: Ghostscript nicht verfügbar');
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'coolwave-pdfcomp-'));
  const inputPath = path.join(tempDir, `in_${crypto.randomBytes(6).toString('hex')}.pdf`);
  const outputPath = path.join(tempDir, `out_${crypto.randomBytes(6).toString('hex')}.pdf`);

  try {
    await fs.writeFile(inputPath, inputBuffer);

    // /screen = lowest size (72 dpi, high compression)
    // /ebook = medium size (150 dpi, balanced)
    // /printer = high quality (300 dpi, mild compression)
    let pdfSetting = '/ebook';
    if (level === 'high') {
      pdfSetting = '/screen';
    } else if (level === 'low') {
      pdfSetting = '/printer';
    }

    const args = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${pdfSetting}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    await execFileAsync(gsBin, args, {
      timeout: 60000,
      signal,
    });

    const result = await fs.readFile(outputPath);
    return result;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
