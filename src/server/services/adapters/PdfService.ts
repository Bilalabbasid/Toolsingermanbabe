import { PDFDocument, PDFName, PDFArray } from 'pdf-lib';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';
import { convertPdfToPdfA, compressPdfGhostscript } from './ghostscriptRunner';

export class PdfService implements IConversionService {
  name = 'PdfService';
  supportedTypes = [
    'pdf_compress',
    'pdf_optimize',
    'pdf_flatten',
    'pdf_metadata_strip',
    'pdf_repair',
    'pdf_pdfa',
    'pdf_annotations_remove',
  ];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type);
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error('Operation vom Benutzer oder Zeitüberschreitung abgebrochen.');

    const jobType = options.jobType || 'pdf_optimize';
    const baseName = inputName.replace(/\.[^/.]+$/, '');

    // 1. Genuine PDF/A pipeline via Ghostscript
    if (jobType === 'pdf_pdfa') {
      onProgress(30);
      try {
        const pdfaBuffer = await convertPdfToPdfA(inputBuffer, { signal });
        onProgress(100);
        return {
          data: pdfaBuffer,
          fileName: `${baseName}_pdfa.pdf`,
          mimeType: 'application/pdf',
        };
      } catch (err: unknown) {
        const msg = (err as Error)?.message || '';
        if (msg.includes('ENGINE_UNAVAILABLE')) {
          throw new Error('ENGINE_UNAVAILABLE: Ghostscript ist auf diesem Server nicht installiert. Echtes PDF/A erfordert die Server-Archivierungskomponente.');
        }
        throw err;
      }
    }

    // 2. Genuine Tiered PDF Compression
    if (jobType === 'pdf_compress') {
      const compLevel = (options.level as 'low' | 'medium' | 'high') || 'medium';
      try {
        const compressed = await compressPdfGhostscript(inputBuffer, compLevel, signal);
        onProgress(100);
        return {
          data: compressed,
          fileName: `${baseName}_komprimiert.pdf`,
          mimeType: 'application/pdf',
        };
      } catch {
        // Fallback to in-process stream and structural compression if Ghostscript is unavailable
      }
    }

    const pdf = await PDFDocument.load(inputBuffer, { throwOnInvalidObject: true });
    if (pdf.getPageCount() === 0) throw new Error('PDF has no readable pages.');
    onProgress(40);

    let outputSuffix = '_optimiert.pdf';

    if (jobType === 'pdf_repair') {
      outputSuffix = '_repariert.pdf';
      // Re-saving through PDFDocument rebuilds the cross-reference table and fixes object structure
      onProgress(70);
    } else if (jobType === 'pdf_flatten') {
      outputSuffix = '_abgeflacht.pdf';
      try {
        const form = pdf.getForm();
        form.flatten();
      } catch {}
      onProgress(70);
    } else if (jobType === 'pdf_annotations_remove') {
      outputSuffix = '_ohne_anmerkungen.pdf';
      const pages = pdf.getPages();
      pages.forEach((p) => {
        p.node.delete(PDFName.of('Annots'));
      });
      onProgress(70);
    } else if (jobType === 'pdf_metadata_strip') {
      outputSuffix = '_anonymisiert.pdf';
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('CoolWave Privacy Engine');
      pdf.setCreator('CoolWave');
      onProgress(70);
    } else {
      // pdf_compress or pdf_optimize fallback
      outputSuffix = '_optimiert.pdf';
      pdf.setProducer('CoolWave High-Efficiency Engine');
      onProgress(70);
    }

    if (signal?.aborted) throw new Error('Operation abgebrochen.');

    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}${outputSuffix}`,
      mimeType: 'application/pdf',
    };
  }
}
