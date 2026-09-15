import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

let cachedBinary: string | null | undefined = undefined;

/**
 * Locate soffice / libreoffice binary on system
 */
export async function getLibreOfficeBinary(): Promise<string | null> {
  if (cachedBinary !== undefined) return cachedBinary;

  const candidates: string[] = [];

  if (process.env.LIBREOFFICE_PATH) {
    candidates.push(process.env.LIBREOFFICE_PATH);
  }

  if (process.platform === 'win32') {
    candidates.push(
      'soffice.exe',
      'libreoffice.exe',
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    );
  } else {
    candidates.push(
      'soffice',
      'libreoffice',
      '/usr/bin/soffice',
      '/usr/bin/libreoffice',
      '/usr/local/bin/soffice',
      '/usr/lib/libreoffice/program/soffice'
    );
  }

  for (const bin of candidates) {
    try {
      const res = await execFileAsync(bin, ['--version'], { timeout: 4000 });
      if (res.stdout || res.stderr) {
        cachedBinary = bin;
        return bin;
      }
    } catch {
      // Try next
    }
  }

  cachedBinary = null;
  return null;
}

export async function isLibreOfficeAvailable(): Promise<boolean> {
  const bin = await getLibreOfficeBinary();
  return bin !== null;
}

/**
 * Execute LibreOffice headless conversion
 */
export async function convertWithLibreOffice(
  inputBuffer: Buffer,
  inputExt: string,
  targetFormat: string,
  filterName?: string,
  timeoutMs = 45000
): Promise<Buffer> {
  const bin = await getLibreOfficeBinary();
  if (!bin) {
    throw new Error('LIBREOFFICE_NOT_AVAILABLE');
  }

  const runId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `cw_lo_${runId}`);
  await fs.mkdir(tempDir, { recursive: true });

  const cleanExt = inputExt.startsWith('.') ? inputExt : `.${inputExt}`;
  const inputFileName = `source${cleanExt}`;
  const inputPath = path.join(tempDir, inputFileName);

  await fs.writeFile(inputPath, inputBuffer);

  try {
    const convertParam = filterName ? `${targetFormat}:${filterName}` : targetFormat;
    const args = [
      '--headless',
      '--invisible',
      '--nologo',
      '--nodefault',
      '--nofirststartwizard',
      '--convert-to',
      convertParam,
      '--outdir',
      tempDir,
      inputPath,
    ];

    await execFileAsync(bin, args, {
      timeout: timeoutMs,
      env: {
        ...process.env,
        HOME: tempDir,
      },
    });

    const baseWithoutExt = path.basename(inputFileName, cleanExt);
    const expectedOutPath = path.join(tempDir, `${baseWithoutExt}.${targetFormat}`);

    try {
      const data = await fs.readFile(expectedOutPath);
      return data;
    } catch {
      const files = await fs.readdir(tempDir);
      const matched = files.find(
        (f) => f !== inputFileName && f.toLowerCase().endsWith(`.${targetFormat.toLowerCase()}`)
      );
      if (matched) {
        return await fs.readFile(path.join(tempDir, matched));
      }
      throw new Error(`LibreOffice did not produce the expected ${targetFormat} output.`);
    }
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Non-blocking cleanup
    }
  }
}
