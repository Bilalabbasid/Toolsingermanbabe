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
    'office_doc_to_docx',
    'office_docx_to_doc',
    'office_odt_to_docx',
    'office_docx_to_odt',
    'office_rtf_to_docx',
    'office_txt_to_docx',
    'office_xls_to_xlsx',
    'office_xlsx_to_xls',
    'office_csv_to_xlsx',
    'office_xlsx_to_csv',
    'office_csv_to_pdf',
    'office_ppt_to_pptx',
    'office_pptx_to_ppt',
    'office_odp_to_pptx',
    'office_epub_to_pdf',
    'office_epub_to_txt',
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
        return await OfficeConversionEngine.pdfToDocx(inputBuffer, inputName, onProgress, options, signal);
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

      // 12. DOC to DOCX
      if (jobType === 'office_doc_to_docx' || (ext === '.doc' && target === 'docx')) {
        return await OfficeConversionEngine.docToDocx(inputBuffer, inputName, onProgress);
      }

      // 13. DOCX to DOC
      if (jobType === 'office_docx_to_doc' || (ext === '.docx' && target === 'doc')) {
        return await OfficeConversionEngine.docxToDoc(inputBuffer, inputName, onProgress);
      }

      // 14. ODT to DOCX
      if (jobType === 'office_odt_to_docx' || (ext === '.odt' && target === 'docx')) {
        return await OfficeConversionEngine.odtToDocx(inputBuffer, inputName, onProgress);
      }

      // 15. DOCX to ODT
      if (jobType === 'office_docx_to_odt' || (ext === '.docx' && target === 'odt')) {
        return await OfficeConversionEngine.docxToOdt(inputBuffer, inputName, onProgress);
      }

      // 16. RTF to DOCX
      if (jobType === 'office_rtf_to_docx' || (ext === '.rtf' && target === 'docx')) {
        return await OfficeConversionEngine.rtfToDocx(inputBuffer, inputName, onProgress);
      }

      // 17. TXT to DOCX
      if (jobType === 'office_txt_to_docx' || (ext === '.txt' && target === 'docx')) {
        return await OfficeConversionEngine.txtToDocx(inputBuffer, inputName, onProgress);
      }

      // 18. XLS to XLSX
      if (jobType === 'office_xls_to_xlsx' || (ext === '.xls' && target === 'xlsx')) {
        return await OfficeConversionEngine.xlsToXlsx(inputBuffer, inputName, onProgress);
      }

      // 19. XLSX to XLS
      if (jobType === 'office_xlsx_to_xls' || (ext === '.xlsx' && target === 'xls')) {
        return await OfficeConversionEngine.xlsxToXls(inputBuffer, inputName, onProgress);
      }

      // 20. CSV to XLSX
      if (jobType === 'office_csv_to_xlsx' || (ext === '.csv' && target === 'xlsx')) {
        return await OfficeConversionEngine.csvToXlsx(inputBuffer, inputName, onProgress);
      }

      // 21. XLSX to CSV
      if (jobType === 'office_xlsx_to_csv' || (ext === '.xlsx' && target === 'csv')) {
        return await OfficeConversionEngine.xlsxToCsv(inputBuffer, inputName, onProgress);
      }

      // 22. CSV to PDF
      if (jobType === 'office_csv_to_pdf' || (ext === '.csv' && target === 'pdf')) {
        return await OfficeConversionEngine.csvToPdf(inputBuffer, inputName, onProgress);
      }

      // 23. PPT to PPTX
      if (jobType === 'office_ppt_to_pptx' || (ext === '.ppt' && target === 'pptx')) {
        return await OfficeConversionEngine.pptToPptx(inputBuffer, inputName, onProgress);
      }

      // 24. PPTX to PPT
      if (jobType === 'office_pptx_to_ppt' || (ext === '.pptx' && target === 'ppt')) {
        return await OfficeConversionEngine.pptxToPpt(inputBuffer, inputName, onProgress);
      }

      // 25. ODP to PPTX
      if (jobType === 'office_odp_to_pptx' || (ext === '.odp' && target === 'pptx')) {
        return await OfficeConversionEngine.odpToPptx(inputBuffer, inputName, onProgress);
      }

      // 26. EPUB to PDF
      if (jobType === 'office_epub_to_pdf' || (ext === '.epub' && target === 'pdf')) {
        return await OfficeConversionEngine.epubToPdf(inputBuffer, inputName, onProgress);
      }

      // 27. EPUB to TXT
      if (jobType === 'office_epub_to_txt' || (ext === '.epub' && target === 'txt')) {
        return await OfficeConversionEngine.epubToTxt(inputBuffer, inputName, onProgress);
      }

      throw new Error(`Nicht unterstützter Konvertierungspfad: ${ext} zu .${target}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Konvertierungsfehler';
      console.error('[OfficeService] Conversion failed.');
      throw new Error(`Fehler bei der Dokument-Konvertierung: ${msg}`);
    }
  }
}
