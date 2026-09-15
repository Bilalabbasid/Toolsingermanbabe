import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

let cachedCairoBinary: string | null | undefined = undefined;

export async function getPdfToCairoBinary(): Promise<string | null> {
  if (cachedCairoBinary !== undefined) return cachedCairoBinary;

  const candidates: string[] = [];
  if (process.env.PDFTOCAIRO_PATH) candidates.push(process.env.PDFTOCAIRO_PATH);

  if (process.platform === 'win32') {
    candidates.push('pdftocairo.exe', 'pdftocairo');
  } else {
    candidates.push('pdftocairo', '/usr/bin/pdftocairo', '/usr/local/bin/pdftocairo');
  }

  for (const bin of candidates) {
    try {
      const res = await execFileAsync(bin, ['-v'], { timeout: 3000 });
      if (res.stdout || res.stderr) {
        cachedCairoBinary = bin;
        return bin;
      }
    } catch {
      // Continue
    }
  }

  cachedCairoBinary = null;
  return null;
}

export async function isPdfToCairoAvailable(): Promise<boolean> {
  const bin = await getPdfToCairoBinary();
  return bin !== null;
}

export async function convertPdfToSvgWithPoppler(
  pdfBuffer: Buffer,
  page = 1,
  timeoutMs = 30000
): Promise<Buffer> {
  const bin = await getPdfToCairoBinary();
  if (!bin) {
    throw new Error('PDFTOCAIRO_NOT_AVAILABLE');
  }

  const runId = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `cw_cairo_${runId}`);
  await fs.mkdir(tempDir, { recursive: true });

  const inputPdfPath = path.join(tempDir, 'input.pdf');
  const outputSvgPath = path.join(tempDir, 'output.svg');

  await fs.writeFile(inputPdfPath, pdfBuffer);

  try {
    const args = ['-svg', '-f', String(page), '-l', String(page), inputPdfPath, outputSvgPath];
    await execFileAsync(bin, args, { timeout: timeoutMs });

    return await fs.readFile(outputSvgPath);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  }
}
