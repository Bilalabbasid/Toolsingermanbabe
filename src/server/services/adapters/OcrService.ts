import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';
import Tesseract from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import * as napi from '@napi-rs/canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Polyfill Node.js canvas globals for pdfjs-dist rendering
if (typeof global !== 'undefined') {
  const g = global as unknown as Record<string, unknown>;
  if (!g.Path2D) g.Path2D = napi.Path2D;
  if (!g.ImageData) g.ImageData = napi.ImageData;
  if (!g.DOMMatrix) g.DOMMatrix = napi.DOMMatrix;
  if (!g.DOMPoint) g.DOMPoint = napi.DOMPoint;
}

export type SupportedOcrLanguage = 'deu' | 'eng' | 'fra' | 'spa' | 'ita' | 'nld';

export interface OcrConfigLimits {
  maxPages: number;
  maxFileSizeMB: number;
  timeoutMs: number;
}

export class OcrService implements IConversionService {
  name = 'OcrService';
  supportedTypes = [
    'ocr_pdf',
    'ocr_searchable_pdf',
    'ocr_image_to_text',
    'ocr_scan_to_pdf',
    'ocr_scan_to_word',
    'ocr_pdf_to_word',
    'ocr_text',
  ];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('ocr_');
  }

  /**
   * Retrieves configurable limits from environment variables with safe defaults
   */
  getLimits(): OcrConfigLimits {
    return {
      maxPages: parseInt(process.env.OCR_MAX_PAGES || '20', 10),
      maxFileSizeMB: parseInt(process.env.OCR_MAX_FILE_SIZE_MB || '50', 10),
      timeoutMs: parseInt(process.env.OCR_TIMEOUT_MS || '120000', 10),
    };
  }

  /**
   * Preprocess image to enhance OCR readability (denoising, grayscale, contrast normalization, sharpening)
   */
  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .grayscale()
        .normalize() // Stretch contrast
        .sharpen({ sigma: 1.2 }) // Sharpen edges of text glyphs
        .png()
        .toBuffer();
    } catch {
      // Fallback to original buffer if sharp fails on rare format
      return buffer;
    }
  }

  /**
   * Initialize pdfjs-dist with GlobalWorkerOptions in Node.js
   */
  private async getPdfJs() {
    const path = await import('path');
    const { pathToFileURL } = await import('url');
    const fs = await import('fs/promises');

    // Ensure worker exists in chunks directory for Next.js bundle resolution
    try {
      const chunkDir = path.join(process.cwd(), '.next', 'server', 'chunks');
      await fs.mkdir(chunkDir, { recursive: true });
      await fs.copyFile(
        path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
        path.join(chunkDir, 'pdf.worker.mjs')
      );
    } catch {
      // Ignore if already copied
    }

    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const pdfPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.mjs');
    const pdfjs = await dynamicImport(pathToFileURL(pdfPath).href);
    const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    return pdfjs;
  }

  /**
   * Main worker execution method
   */
  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    const limits = this.getLimits();
    const isPro = Boolean(options.apiKey || options.isPro);
    const maxPages = options.maxPages || (isPro ? 100 : limits.maxPages);
    const maxSizeBytes = limits.maxFileSizeMB * 1024 * 1024;

    // 1. File size limit enforcement
    if (inputBuffer.length > maxSizeBytes) {
      throw new Error(
        `Die Datei überschreitet das maximale OCR-Limit von ${limits.maxFileSizeMB} MB.`
      );
    }

    onProgress(5);
    if (signal?.aborted) throw new Error('OCR-Verarbeitung wurde abgebrochen.');

    // 2. Validate Language
    const validLanguages: SupportedOcrLanguage[] = ['deu', 'eng', 'fra', 'spa', 'ita', 'nld'];
    let lang = (options.language as SupportedOcrLanguage) || 'deu';
    if (!validLanguages.includes(lang)) {
      lang = 'deu';
    }

    // Determine requested output type
    const jobType = options.jobType || options.type || 'ocr_pdf';
    let outputType: 'pdf' | 'docx' | 'txt' = options.outputType || 'pdf';
    if (jobType === 'ocr_scan_to_word' || jobType === 'ocr_pdf_to_word') {
      outputType = 'docx';
    } else if (jobType === 'ocr_image_to_text' || jobType === 'ocr_text') {
      outputType = 'txt';
    } else if (jobType === 'ocr_scan_to_pdf' || jobType === 'ocr_searchable_pdf') {
      outputType = 'pdf';
    }

    const baseName = inputName.replace(/\.[^/.]+$/, '');
    const isPdf = inputName.toLowerCase().endsWith('.pdf');

    onProgress(10);
    if (signal?.aborted) throw new Error('OCR-Verarbeitung wurde abgebrochen.');

    // Initialize Tesseract Worker
    const worker = await Tesseract.createWorker(lang);

    try {
      const pageTexts: { pageNumber: number; text: string }[] = [];
      const pagePdfBuffers: Uint8Array[] = [];

      if (isPdf) {
        // --- Multi-page PDF Processing ---
        const pdfDoc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
        const totalPages = pdfDoc.getPageCount();

        if (totalPages > maxPages) {
          throw new Error(
            `Das PDF enthält ${totalPages} Seiten. Das zulässige Limit beträgt maximal ${maxPages} Seiten pro Durchgang.`
          );
        }

        const pdfjs = await this.getPdfJs();
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(inputBuffer),
          useSystemFonts: true,
          standardFontDataUrl: undefined,
        });
        const loadedPdf = await loadingTask.promise;

        for (let p = 1; p <= totalPages; p++) {
          if (signal?.aborted) throw new Error('OCR-Vorgang durch Benutzer oder Timeout abgebrochen.');

          const startPct = 10 + Math.round(((p - 1) / totalPages) * 75);
          onProgress(startPct);

          // Render page to image using canvas
          const page = await loadedPdf.getPage(p);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = napi.createCanvas(Math.round(viewport.width), Math.round(viewport.height));
          const ctx = canvas.getContext('2d');

          await page.render({
            canvasContext: ctx as any,
            viewport,
          }).promise;

          const rawPagePng = canvas.toBuffer('image/png');
          // Optimize contrast & sharpen
          const cleanImage = await this.preprocessImage(rawPagePng);

          // Perform OCR with Tesseract
          const ret = await worker.recognize(cleanImage, {}, { pdf: outputType === 'pdf' });
          const text = ret.data.text || '';
          pageTexts.push({ pageNumber: p, text });

          if (outputType === 'pdf' && ret.data.pdf) {
            pagePdfBuffers.push(new Uint8Array(ret.data.pdf));
          }

          const endPct = 10 + Math.round((p / totalPages) * 75);
          onProgress(endPct);
        }
      } else {
        // --- Single Image Processing (JPG, PNG, WebP, TIFF) ---
        onProgress(25);
        const cleanImage = await this.preprocessImage(inputBuffer);

        onProgress(50);
        if (signal?.aborted) throw new Error('OCR-Verarbeitung abgebrochen.');

        const ret = await worker.recognize(cleanImage, {}, { pdf: outputType === 'pdf' });
        pageTexts.push({ pageNumber: 1, text: ret.data.text || '' });

        if (outputType === 'pdf' && ret.data.pdf) {
          pagePdfBuffers.push(new Uint8Array(ret.data.pdf));
        }
      }

      onProgress(88);
      if (signal?.aborted) throw new Error('OCR-Verarbeitung abgebrochen.');

      // 3. Assemble Output Document
      if (outputType === 'pdf') {
        let finalPdfBytes: Uint8Array;

        if (pagePdfBuffers.length === 1) {
          finalPdfBytes = pagePdfBuffers[0];
        } else if (pagePdfBuffers.length > 1) {
          // Merge multi-page searchable PDFs
          const mergedDoc = await PDFDocument.create();
          for (const pBuffer of pagePdfBuffers) {
            const pageDoc = await PDFDocument.load(pBuffer);
            const [copied] = await mergedDoc.copyPages(pageDoc, [0]);
            mergedDoc.addPage(copied);
          }
          finalPdfBytes = await mergedDoc.save({ useObjectStreams: true });
        } else {
          // Fallback if no PDF buffers generated
          const fallbackDoc = await PDFDocument.create();
          const page = fallbackDoc.addPage([595, 842]);
          page.drawText(pageTexts.map((p) => p.text).join('\n\n'), { x: 50, y: 800, size: 10 });
          finalPdfBytes = await fallbackDoc.save();
        }

        onProgress(100);
        return {
          data: Buffer.from(finalPdfBytes),
          fileName: `${baseName}_durchsuchbar.pdf`,
          mimeType: 'application/pdf',
        };
      } else if (outputType === 'docx') {
        // Assemble Word Document (.docx)
        const docChildren: Paragraph[] = [
          new Paragraph({
            text: `CoolWave OCR Texterkennung – ${inputName}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Erkannt in Sprache: ${lang.toUpperCase()} | Seiten: ${pageTexts.length}`,
                italics: true,
                color: '666666',
              }),
            ],
          }),
          new Paragraph({ text: '' }),
        ];

        for (const item of pageTexts) {
          if (pageTexts.length > 1) {
            docChildren.push(
              new Paragraph({
                text: `--- Seite ${item.pageNumber} ---`,
                heading: HeadingLevel.HEADING_2,
              })
            );
          }

          const paragraphs = item.text.split(/\n\s*\n/);
          for (const paraText of paragraphs) {
            const cleanPara = paraText.trim();
            if (cleanPara) {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun(cleanPara)],
                  spacing: { after: 120 },
                })
              );
            }
          }
        }

        const docxDoc = new Document({
          sections: [{ children: docChildren }],
        });
        const docxBuffer = await Packer.toBuffer(docxDoc);

        onProgress(100);
        return {
          data: docxBuffer,
          fileName: `${baseName}_ocr.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
      } else {
        // Plain text output (.txt)
        let fullText = '';
        if (pageTexts.length === 1) {
          fullText = pageTexts[0].text;
        } else {
          fullText = pageTexts
            .map((p) => `--- Seite ${p.pageNumber} ---\n\n${p.text}\n`)
            .join('\n');
        }

        onProgress(100);
        return {
          data: Buffer.from(fullText, 'utf-8'),
          fileName: `${baseName}_ocr.txt`,
          mimeType: 'text/plain;charset=utf-8',
        };
      }
    } finally {
      await worker.terminate();
    }
  }
}

export const ocrService = new OcrService();
