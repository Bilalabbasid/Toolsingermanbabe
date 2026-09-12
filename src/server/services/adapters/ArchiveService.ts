import JSZip from 'jszip';
import path from 'path';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

export class ArchiveService implements IConversionService {
  name = 'ArchiveService';
  supportedTypes = ['archive_zip_create', 'archive_zip_extract'];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('archive_');
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(15);
    if (signal?.aborted) throw new Error('Operation aborted');

    const isExtract = options.targetFormat === 'EXTRACT';
    const baseName = inputName.replace(/\.[^/.]+$/, '');

    if (isExtract) {
      // Safe extraction with Zip-Bomb and Path Traversal protection
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(inputBuffer);
      onProgress(40);

      const maxTotalUncompressedBytes = 100 * 1024 * 1024; // 100 MB max uncompressed limit
      let currentUncompressedBytes = 0;

      const outputZip = new JSZip();
      const files = Object.keys(loadedZip.files);

      for (let i = 0; i < files.length; i++) {
        if (signal?.aborted) throw new Error('Operation aborted');

        const filename = files[i];
        const zipEntry = loadedZip.files[filename];

        // 1. Path Traversal Protection: reject relative paths like ../ or absolute /
        const normalized = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
        if (normalized.includes('..') || path.isAbsolute(normalized)) {
          throw new Error('Sicherheitswarnung: Verdächtige Pfadstruktur im Archiv entdeckt (Path Traversal Versuch).');
        }

        if (!zipEntry.dir) {
          const content = await zipEntry.async('nodebuffer');
          currentUncompressedBytes += content.length;

          // 2. Decompression Bomb Protection
          if (currentUncompressedBytes > maxTotalUncompressedBytes) {
            throw new Error('Sicherheitswarnung: Archiv überschreitet das Entpackungslimit (mögliche Decompression Bomb).');
          }

          outputZip.file(normalized, content);
        }

        onProgress(40 + Math.round(((i + 1) / files.length) * 45));
      }

      const generated = await outputZip.generateAsync({ type: 'nodebuffer' });
      onProgress(100);

      return {
        data: generated,
        fileName: `${baseName}_extracted.zip`,
        mimeType: 'application/zip',
      };
    } else {
      // Safe ZIP creation
      const zip = new JSZip();
      zip.file(inputName, inputBuffer);
      onProgress(60);

      const generated = await zip.generateAsync({ type: 'nodebuffer' });
      onProgress(100);

      return {
        data: generated,
        fileName: `${baseName}.zip`,
        mimeType: 'application/zip',
      };
    }
  }
}
