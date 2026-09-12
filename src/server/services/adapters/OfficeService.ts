import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';
import { OfficeConversionEngine } from './OfficeConversionEngine';

export class OfficeService implements IConversionService {
  name = 'OfficeService';
  supportedTypes = [
    'office_pdf_to_docx',
    'office_docx_to_pdf',
    'office_pdf_to_xlsx',
    'office_xlsx_to_pdf',
    'office_pdf_to_pptx',
    'office_pptx_to_pdf',
    'office_doc_to_pdf',
    'office_odt_to_pdf',
    'office_rtf_to_pdf',
    'office_txt_to_pdf',
    'office_html_to_pdf',
    'office_convert',
  ];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('office_');
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error('Konvertierung vom Benutzer abgebrochen.');

    const ext = inputName.substring(inputName.lastIndexOf('.')).toLowerCase();
    const target = (options.targetFormat || 'pdf').toLowerCase().replace('.', '');
    const jobType = options.jobType || `office_${ext.replace('.', '')}_to_${target}`;

    try {
      // 1. PDF to DOCX
      if (jobType === 'office_pdf_to_docx' || (ext === '.pdf' && target === 'docx')) {
        return await OfficeConversionEngine.pdfToDocx(inputBuffer, inputName, onProgress);
      }

      // 2. DOCX to PDF
      if (jobType === 'office_docx_to_pdf' || (ext === '.docx' && target === 'pdf')) {
        return await OfficeConversionEngine.docxToPdf(inputBuffer, inputName, onProgress);
      }

      // 3. PDF to XLSX
      if (jobType === 'office_pdf_to_xlsx' || (ext === '.pdf' && target === 'xlsx')) {
        return await OfficeConversionEngine.pdfToXlsx(inputBuffer, inputName, onProgress);
      }

      // 4. XLSX to PDF
      if (jobType === 'office_xlsx_to_pdf' || (ext === '.xlsx' && target === 'pdf')) {
        return await OfficeConversionEngine.xlsxToPdf(inputBuffer, inputName, onProgress);
      }

      // 5. PDF to PPTX
      if (jobType === 'office_pdf_to_pptx' || (ext === '.pdf' && target === 'pptx')) {
        return await OfficeConversionEngine.pdfToPptx(inputBuffer, inputName, onProgress);
      }

      // 6. PPTX to PDF
      if (jobType === 'office_pptx_to_pdf' || (ext === '.pptx' && target === 'pdf')) {
        return await OfficeConversionEngine.pptxToPdf(inputBuffer, inputName, onProgress);
      }

      // 7. DOC to PDF
      if (jobType === 'office_doc_to_pdf' || (ext === '.doc' && target === 'pdf')) {
        return await OfficeConversionEngine.docToPdf(inputBuffer, inputName, onProgress);
      }

      // 8. ODT to PDF
      if (jobType === 'office_odt_to_pdf' || (ext === '.odt' && target === 'pdf')) {
        return await OfficeConversionEngine.odtToPdf(inputBuffer, inputName, onProgress);
      }

      // 9. RTF to PDF
      if (jobType === 'office_rtf_to_pdf' || (ext === '.rtf' && target === 'pdf')) {
        return await OfficeConversionEngine.rtfToPdf(inputBuffer, inputName, onProgress);
      }

      // 10. TXT to PDF
      if (jobType === 'office_txt_to_pdf' || (ext === '.txt' && target === 'pdf')) {
        return await OfficeConversionEngine.txtToPdf(inputBuffer, inputName, onProgress);
      }

      // 11. HTML to PDF
      if (jobType === 'office_html_to_pdf' || ((ext === '.html' || ext === '.htm') && target === 'pdf')) {
        return await OfficeConversionEngine.htmlToPdf(inputBuffer, inputName, onProgress);
      }

      throw new Error(`Nicht unterstützter Konvertierungspfad: ${ext} zu .${target}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Konvertierungsfehler';
      console.error(`[OfficeService Error] Failed to convert ${inputName}:`, msg);
      throw new Error(`Fehler bei der Dokument-Konvertierung: ${msg}`);
    }
  }
}
