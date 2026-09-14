import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import { execFile } from 'child_process';
import JSZip from 'jszip';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

const gunzipAsync = promisify(zlib.gunzip);

import fsSync from 'fs';

let cached7zPath: string | null = null;
function get7zPath(): string {
  if (cached7zPath) return cached7zPath;
  if (process.env.SEVEN_ZIP_PATH && fsSync.existsSync(process.env.SEVEN_ZIP_PATH)) {
    cached7zPath = process.env.SEVEN_ZIP_PATH;
    return cached7zPath;
  }
  const winBinary = path.join(process.cwd(), 'node_modules', '7z-bin', 'bin', 'win', 'x64', '7z.exe');
  if (fsSync.existsSync(winBinary)) {
    cached7zPath = winBinary;
    return cached7zPath;
  }
  const linuxBinary = path.join(process.cwd(), 'node_modules', '7z-bin', 'bin', 'linux', 'x64', '7za');
  if (fsSync.existsSync(linuxBinary)) {
    cached7zPath = linuxBinary;
    return cached7zPath;
  }
  cached7zPath = '7z';
  return cached7zPath;
}

const MAX_UNCOMPRESSED_BYTES = 150 * 1024 * 1024; // 150 MB max uncompressed limit
const MAX_ENTRIES_COUNT = 500; // 500 files max per archive

export class ArchiveService implements IConversionService {
  name = 'ArchiveService';
  supportedTypes = [
    'archive_zip_create',
    'archive_zip_extract',
    'archive_7z_extract',
    'archive_tar_extract',
    'archive_gzip_extract',
    'zip-erstellen',
    'zip-entpacken',
    '7z-entpacken',
    'tar-entpacken',
    'gzip-entpacken',
  ];

  canHandle(type: string): boolean {
    return (
      this.supportedTypes.includes(type) ||
      type.startsWith('archive_') ||
      type.endsWith('-entpacken') ||
      type === 'zip-erstellen'
    );
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error('Operation abgebrochen');

    const jobType = options.type || 'archive_zip_extract';
    const baseName = path.basename(inputName, path.extname(inputName));
    const inputExt = path.extname(inputName).toLowerCase();

    // -------------------------------------------------------------
    // 1. GZIP EXTRACTION (Native Node.js zlib)
    // -------------------------------------------------------------
    if (jobType === 'archive_gzip_extract' || jobType === 'gzip-entpacken' || inputExt === '.gz') {
      onProgress(30);
      try {
        const decompressed = await gunzipAsync(inputBuffer);
        if (decompressed.length > MAX_UNCOMPRESSED_BYTES) {
          throw new Error('Sicherheitswarnung: Archiv überschreitet das Entpackungslimit (Decompression Bomb Verdacht).');
        }
        onProgress(100);

        // Remove .gz extension to reveal underlying file name (e.g. file.tar or file.txt)
        const uncompressedName = inputName.replace(/\.gz$/i, '') || `${baseName}.out`;
        const ext = path.extname(uncompressedName).toLowerCase();

        return {
          data: decompressed,
          fileName: uncompressedName,
          mimeType: ext === '.tar' ? 'application/x-tar' : 'application/octet-stream',
        };
      } catch (err: any) {
        throw new Error(`GZIP-Entpackung fehlgeschlagen: ${err?.message || err}`);
      }
    }

    // -------------------------------------------------------------
    // 2. ZIP CREATION (JSZip)
    // -------------------------------------------------------------
    if (jobType === 'archive_zip_create' || jobType === 'zip-erstellen') {
      onProgress(30);
      const zip = new JSZip();

      // If options.files passed, pack them; otherwise wrap inputBuffer
      if (Array.isArray(options.files) && options.files.length > 0) {
        for (const file of options.files) {
          const safeName = path.basename(file.name || 'file.bin');
          zip.file(safeName, file.data);
        }
      } else {
        const safeName = path.basename(inputName || 'datei.bin');
        zip.file(safeName, inputBuffer);
      }

      onProgress(70);
      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      onProgress(100);
      return {
        data: zipBuffer,
        fileName: `${baseName}.zip`,
        mimeType: 'application/zip',
      };
    }

    // -------------------------------------------------------------
    // 3. ZIP EXTRACTION (JSZip with security checks)
    // -------------------------------------------------------------
    if (
      (jobType === 'archive_zip_extract' || jobType === 'zip-entpacken' || inputExt === '.zip') &&
      jobType !== '7z-entpacken' &&
      jobType !== 'tar-entpacken'
    ) {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(inputBuffer);
      onProgress(40);

      let totalBytes = 0;
      let fileCount = 0;
      const outputZip = new JSZip();
      const files = Object.keys(loadedZip.files);

      if (files.length > MAX_ENTRIES_COUNT) {
        throw new Error(`Sicherheitswarnung: Archiv enthält über ${MAX_ENTRIES_COUNT} Dateien.`);
      }

      for (const filename of files) {
        if (signal?.aborted) throw new Error('Operation abgebrochen');

        const zipEntry = loadedZip.files[filename];
        // Path Traversal check
        const normalized = path.normalize(filename).replace(/^[a-zA-Z]:/, '').replace(/^(\.\.[\/\\])+/, '');
        if (normalized.includes('..') || path.isAbsolute(normalized)) {
          throw new Error('Sicherheitswarnung: Unzulässige Pfadstruktur im Archiv entdeckt (Path Traversal).');
        }

        if (!zipEntry.dir) {
          const content = await zipEntry.async('nodebuffer');
          totalBytes += content.length;
          fileCount++;

          if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
            throw new Error('Sicherheitswarnung: Archiv überschreitet das Entpackungslimit von 150 MB (Decompression Bomb).');
          }

          outputZip.file(normalized, content);
        }
      }

      onProgress(80);
      const repackedZip = await outputZip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      onProgress(100);
      return {
        data: repackedZip,
        fileName: `${baseName}_entpackt.zip`,
        mimeType: 'application/zip',
      };
    }

    // -------------------------------------------------------------
    // 4. 7Z & TAR EXTRACTION (via 7z.exe with strict isolation)
    // -------------------------------------------------------------
    const workDir = path.join(process.cwd(), '.tmp', 'workdir', `arch_${crypto.randomUUID()}`);
    await fs.mkdir(workDir, { recursive: true });

    const archiveInputPath = path.join(workDir, `archive${inputExt || '.7z'}`);
    const extractOutDir = path.join(workDir, 'extracted');
    await fs.mkdir(extractOutDir, { recursive: true });
    await fs.writeFile(archiveInputPath, inputBuffer);

    onProgress(35);

    try {
      const sevenBin = get7zPath();
      // Execute 7z extraction with hard 30s timeout
      await new Promise<void>((resolve, reject) => {
        const child = execFile(
          /*turbopackIgnore: true*/ sevenBin,
          ['x', archiveInputPath, `-o${extractOutDir}`, '-y', '-r'],
          { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
          (err, _stdout, stderr) => {
            if (err) {
              if (err.killed) {
                return reject(new Error('Archiv-Entpackung wegen Zeitüberschreitung (Timeout 30s) abgebrochen.'));
              }
              return reject(new Error(`7-Zip Entpackungsfehler: ${err.message}. ${stderr || ''}`));
            }
            resolve();
          }
        );

        if (signal) {
          signal.addEventListener('abort', () => {
            try {
              child.kill('SIGTERM');
            } catch {}
            reject(new Error('Operation abgebrochen'));
          });
        }
      });

      onProgress(65);
      if (signal?.aborted) throw new Error('Operation abgebrochen');

      // Scan extracted directory recursively, verify sizes and repack into clean zip
      const outputZip = new JSZip();
      let totalUncompressedBytes = 0;
      let totalFiles = 0;

      async function scanDir(dir: string, relPath: string = '') {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name;

          // Path traversal security check
          const normalized = path.normalize(entryRel).replace(/^[a-zA-Z]:/, '').replace(/^(\.\.[\/\\])+/, '');
          if (normalized.includes('..') || path.isAbsolute(normalized)) {
            throw new Error('Sicherheitswarnung: Verdächtige Dateinamen im extrahierten Archiv entdeckt.');
          }

          if (entry.isDirectory()) {
            await scanDir(fullPath, entryRel);
          } else if (entry.isFile()) {
            totalFiles++;
            if (totalFiles > MAX_ENTRIES_COUNT) {
              throw new Error(`Sicherheitswarnung: Archiv überschreitet maximal zulässige Dateianzahl von ${MAX_ENTRIES_COUNT}.`);
            }
            const fileData = await fs.readFile(fullPath);
            totalUncompressedBytes += fileData.length;
            if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
              throw new Error('Sicherheitswarnung: Entpacktes Archiv überschreitet das Sicherheitslimit von 150 MB.');
            }
            outputZip.file(normalized, fileData);
          }
        }
      }

      await scanDir(extractOutDir);
      onProgress(85);

      const repackedZip = await outputZip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      onProgress(100);
      return {
        data: repackedZip,
        fileName: `${baseName}_entpackt.zip`,
        mimeType: 'application/zip',
      };
    } finally {
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (err) {
        console.error('[ArchiveService Cleanup Error]:', err);
      }
    }
  }
}
