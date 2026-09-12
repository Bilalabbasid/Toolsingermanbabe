import { PDFDocument } from 'pdf-lib';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

export class PdfService implements IConversionService {
  name = 'PdfService';
  supportedTypes = ['pdf_compress', 'pdf_flatten', 'pdf_metadata_strip', 'pdf_repair'];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('pdf_');
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error('Operation aborted by timeout or user cancellation');

    const pdf = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
    onProgress(40);

    // Advanced PDF cleanup & stream optimization
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('CoolWave Server Engine');
    pdf.setCreator('CoolWave');

    onProgress(70);
    if (signal?.aborted) throw new Error('Operation aborted');

    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    onProgress(100);

    const baseName = inputName.replace(/\.[^/.]+$/, '');
    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}_optimized.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
