import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface IStorageProvider {
  saveInput(data: ArrayBuffer | Buffer, originalName: string): Promise<{ storagePath: string; sizeBytes: number }>;
  saveOutput(data: ArrayBuffer | Buffer | Uint8Array, filename: string): Promise<{ storagePath: string; sizeBytes: number }>;
  read(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
  cleanupExpired(maxAgeMinutes: number): Promise<number>;
}

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;
  private uploadsDir: string;
  private outputsDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.join(process.cwd(), '.tmp', 'storage');
    this.uploadsDir = path.join(this.baseDir, 'uploads');
    this.outputsDir = path.join(this.baseDir, 'outputs');
  }

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.mkdir(this.outputsDir, { recursive: true });
  }

  async saveInput(data: ArrayBuffer | Buffer, originalName: string): Promise<{ storagePath: string; sizeBytes: number }> {
    await this.ensureDirs();
    const safeExt = path.extname(originalName) || '';
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}${safeExt}`;
    const storagePath = path.join(this.uploadsDir, filename);

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    await fs.writeFile(storagePath, buffer);

    return {
      storagePath,
      sizeBytes: buffer.length,
    };
  }

  async saveOutput(data: ArrayBuffer | Buffer | Uint8Array, filename: string): Promise<{ storagePath: string; sizeBytes: number }> {
    await this.ensureDirs();
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}_${path.basename(filename)}`;
    const storagePath = path.join(this.outputsDir, safeFilename);

    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    } else {
      buffer = Buffer.from(data);
    }

    await fs.writeFile(storagePath, buffer);

    return {
      storagePath,
      sizeBytes: buffer.length,
    };
  }

  async read(storagePath: string): Promise<Buffer> {
    return await fs.readFile(storagePath);
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await fs.unlink(storagePath);
    } catch {
      // Ignore if file is already deleted
    }
  }

  async cleanupExpired(maxAgeMinutes: number): Promise<number> {
    await this.ensureDirs();
    let cleanedCount = 0;
    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;

    const dirsToClean = [this.uploadsDir, this.outputsDir];

    for (const dir of dirsToClean) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stat = await fs.stat(filePath);
            if (now - stat.mtimeMs > maxAgeMs) {
              await fs.unlink(filePath);
              cleanedCount++;
            }
          } catch {
            // File might have been removed concurrently
          }
        }
      } catch {
        // Directory read error
      }
    }

    return cleanedCount;
  }
}

// Singleton storage provider instance
export const storageProvider: IStorageProvider = new LocalStorageProvider();
