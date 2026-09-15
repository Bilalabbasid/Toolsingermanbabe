import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  HeadingLevel,
  Packer,
  ExternalHyperlink,
  AlignmentType
} from 'docx';
import { ImageRun } from 'docx';
import * as napi from '@napi-rs/canvas';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { safeLoadZip } from '@/server/security/safeArchive';
import { getLoadedPdfJs, getPdfJsDocumentOptions } from '@/server/pdf/pdfjsNode';
import { cleanWinAnsiText } from '@/server/pdf/safeWinAnsi';
import { isLibreOfficeAvailable, convertWithLibreOffice } from './officeRunner';
import { parseCsv } from '@/server/utils/csvParser';
import { embedUnicodeFont } from '@/server/pdf/unicodeFont';
import type { ServiceOptions } from '@/types/job';

export interface ConvertedDocument {
  data: Buffer;
  fileName: string;
  mimeType: string;
}

export class OfficeConversionEngine {
  // =========================================================================
  // 1. PDF → DOCX
  // =========================================================================
  static async pdfToDocx(
    pdfBuffer: Buffer, 
    originalName: string,
    onProgress: (p: number) => void,
    options: ServiceOptions = {},
    signal?: AbortSignal
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const pdfjsLib = await getLoadedPdfJs();
    const loadingTask = pdfjsLib.getDocument(getPdfJsDocumentOptions(pdfBuffer));
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const sectionsChildren: (Paragraph | Table)[] = [];
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    let extractedCharacters = 0;

    for (let i = 1; i <= numPages; i++) {
      const pagePct = 15 + Math.round((i / numPages) * 70);
      onProgress(pagePct);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{ str: string; transform: number[]; fontName?: string; width?: number; height?: number }>;
      extractedCharacters += items.reduce((total, item) => total + (item.str?.trim().length || 0), 0);

      if (items.length === 0) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: '', font: 'Calibri' })],
          })
        );
        continue;
      }

      // Group text items by Y coordinate to construct lines & detect table-like structures
      const linesByY = new Map<number, typeof items>();
      for (const item of items) {
        if (!item.str || item.str.trim() === '') continue;
        const y = Math.round(item.transform[5]); // Y coordinate
        // Find close Y bucket within 4 points
        let matchedY = y;
        for (const existingY of linesByY.keys()) {
          if (Math.abs(existingY - y) <= 4) {
            matchedY = existingY;
            break;
          }
        }
        if (!linesByY.has(matchedY)) {
          linesByY.set(matchedY, []);
        }
        linesByY.get(matchedY)!.push(item);
      }

      // Sort Y descending (top of page first)
      const sortedYs = Array.from(linesByY.keys()).sort((a, b) => b - a);

      for (const y of sortedYs) {
        const lineItems = linesByY.get(y)!;
        // Sort items in line by X coordinate ascending
        lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

        // Check if line looks like a multi-column table row (more than 2 items with significant gap)
        const isTableLike = lineItems.length >= 3 && lineItems.some((it, idx) => {
          if (idx === 0) return false;
          const prev = lineItems[idx - 1];
          const gap = it.transform[4] - (prev.transform[4] + (prev.width || 20));
          return gap > 40;
        });

        if (isTableLike) {
          const cells = lineItems.map((it) => 
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: it.str.trim(), font: 'Calibri', size: 20 })],
                }),
              ],
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
            })
          );

          sectionsChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [new TableRow({ children: cells })],
            })
          );
        } else {
          // Regular paragraph with styling
          const textRuns: (TextRun | ExternalHyperlink)[] = [];
          for (const it of lineItems) {
            const isUrl = it.str.startsWith('http://') || it.str.startsWith('https://') || it.str.startsWith('www.');
            if (isUrl) {
              const url = it.str.startsWith('www.') ? `https://${it.str}` : it.str;
              textRuns.push(
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: it.str,
                      style: 'Hyperlink',
                      color: '2563EB',
                      underline: {},
                    }),
                  ],
                  link: url,
                })
              );
            } else {
              const approxFontSize = Math.round(Math.abs(it.transform[0])) || 11;
              const isHeading = approxFontSize >= 14;
              textRuns.push(
                new TextRun({
                  text: it.str + ' ',
                  font: 'Calibri',
                  bold: isHeading,
                  size: approxFontSize * 2, // docx uses half-points
                  color: isHeading ? '0F172A' : '334155',
                })
              );
            }
          }

          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 140, line: 280 },
              children: textRuns,
            })
          );
        }
      }

      // Page break if not last page
      if (i < numPages) {
        sectionsChildren.push(
          new Paragraph({
            children: [new TextRun({ text: '', break: 1 })],
          })
        );
      }
    }

    // A scan is a page image. OCR alone loses columns, typography, and graphics.
    // Preserve the original page by default; offer editable OCR as an explicit mode.
    if (extractedCharacters < 10) {
      const page = await pdf.getPage(1);
      const operators = await page.getOperatorList();
      if (operators.fnArray.length < 3) {
        throw new Error('Dieses PDF enthält keinen lesbaren Text. Bitte prüfen Sie die Datei oder verwenden Sie einen Scan mit sichtbarem Text.');
      }
      if (options.scanMode === 'text') {
        const { OcrService } = await import('./OcrService');
        const ocrResult = await new OcrService().execute(pdfBuffer, originalName, {
          language: options.language || 'deu', outputType: 'docx',
          jobType: 'ocr_pdf_to_word', isPro: options.isPro,
        }, onProgress, signal);
        return { ...ocrResult, data: Buffer.from(ocrResult.data) };
      }
      const canvasGlobals = globalThis as unknown as Record<string, unknown>;
      if (!canvasGlobals.Path2D) canvasGlobals.Path2D = napi.Path2D;
      if (!canvasGlobals.ImageData) canvasGlobals.ImageData = napi.ImageData;
      if (!canvasGlobals.DOMMatrix) canvasGlobals.DOMMatrix = napi.DOMMatrix;
      if (!canvasGlobals.DOMPoint) canvasGlobals.DOMPoint = napi.DOMPoint;
      const scanSections = [];
      for (let i = 1; i <= numPages; i++) {
        if (signal?.aborted) throw new Error('PDF-Verarbeitung wurde abgebrochen.');
        const scanPage = await pdf.getPage(i);
        const pointViewport = scanPage.getViewport({ scale: 1 });
        const renderViewport = scanPage.getViewport({ scale: 2 });
        const canvas = napi.createCanvas(Math.ceil(renderViewport.width), Math.ceil(renderViewport.height));
        await scanPage.render({ canvasContext: canvas.getContext('2d') as never, viewport: renderViewport }).promise;
        const png = canvas.toBuffer('image/png');
        // DOCX dimensions are twips; image dimensions are CSS pixels (96 dpi).
        const pageWidth = Math.round(pointViewport.width * 20);
        const pageHeight = Math.round(pointViewport.height * 20);
        const margin = 120; // 6 pt, avoids Word adding a trailing blank page.
        const fit = Math.min((pointViewport.width - 12) / pointViewport.width, (pointViewport.height - 12) / pointViewport.height);
        const imageWidth = Math.floor(pointViewport.width * fit * 96 / 72);
        const imageHeight = Math.floor(pointViewport.height * fit * 96 / 72);
        scanSections.push({
          properties: { page: { size: { width: pageWidth, height: pageHeight }, margin: { top: margin, bottom: margin, left: margin, right: margin } } },
          children: [new Paragraph({ spacing: { after: 0, before: 0 }, children: [new ImageRun({ data: png, type: 'png', transformation: { width: imageWidth, height: imageHeight } })] })],
        });
        onProgress(15 + Math.round(i / numPages * 75));
      }
      const scanDocx = await Packer.toBuffer(new Document({ sections: scanSections }));
      onProgress(100);
      return { data: scanDocx, fileName: `${baseName}.docx`, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    }

    onProgress(90);
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch (72pt = 1440 dxa)
            },
          },
          children: sectionsChildren,
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    onProgress(100);

    return {
      data: docxBuffer,
      fileName: `${baseName}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  // =========================================================================
  // 2. DOCX → PDF
  // =========================================================================
  static async docxToPdf(
    docxBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    // Require LibreOffice headless for layout, pagination, styles, tables, and images
    if (!(await isLibreOfficeAvailable())) {
      throw new Error('[ENGINE_UNAVAILABLE] LibreOffice ist auf dem Server erforderlich, um Word-Dokumente (DOCX) layoutgetreu mit Bildern und Tabellen in PDF umzuwandeln.');
    }

    try {
      onProgress(35);
      const pdfData = await convertWithLibreOffice(docxBuffer, 'docx', 'pdf');
      onProgress(100);
      return {
        data: pdfData,
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
      };
    } catch (loErr: unknown) {
      console.error('[OfficeConversionEngine] LibreOffice DOCX->PDF failed:', loErr);
      throw new Error('[ENGINE_UNAVAILABLE] Fehler bei der Konvertierung mit LibreOffice.');
    }
  }

  // =========================================================================
  // 3. PDF → XLSX
  // =========================================================================
  static async pdfToXlsx(
    pdfBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const pdfjsLib = await getLoadedPdfJs();
    const loadingTask = pdfjsLib.getDocument(getPdfJsDocumentOptions(pdfBuffer));
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CoolWave Engine';
    workbook.created = new Date();

    let totalExtractedCharacters = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress(20 + Math.round((pageNum / numPages) * 60));
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{ str: string; transform: number[]; width?: number }>;
      totalExtractedCharacters += items.reduce((sum, it) => sum + (it.str?.trim().length || 0), 0);

      const worksheet = workbook.addWorksheet(`Seite ${pageNum}`);

      // Cluster by Y coordinate
      const rowsMap = new Map<number, typeof items>();
      for (const item of items) {
        if (!item.str || item.str.trim() === '') continue;
        const y = Math.round(item.transform[5]);
        let targetY = y;
        for (const existingY of rowsMap.keys()) {
          if (Math.abs(existingY - y) <= 4) {
            targetY = existingY;
            break;
          }
        }
        if (!rowsMap.has(targetY)) rowsMap.set(targetY, []);
        rowsMap.get(targetY)!.push(item);
      }

      const sortedYs = Array.from(rowsMap.keys()).sort((a, b) => b - a);
      let rowIndex = 1;

      for (const y of sortedYs) {
        const rowItems = rowsMap.get(y)!;
        rowItems.sort((a, b) => a.transform[4] - b.transform[4]);

        const values = rowItems.map((it) => {
          const trimmed = it.str.trim();
          const num = Number(trimmed.replace(',', '.'));
          return !isNaN(num) && trimmed !== '' && !trimmed.startsWith('0') ? num : trimmed;
        });

        if (values.length > 0) {
          const row = worksheet.getRow(rowIndex);
          row.values = values;

          // Header styling for first row
          if (rowIndex === 1) {
            row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF1E40AF' },
            };
          }
          rowIndex++;
        }
      }

      // Auto-fit column widths safely
      if (worksheet.columns && Array.isArray(worksheet.columns)) {
        worksheet.columns.forEach((column) => {
          let maxLength = 12;
          if (column && column.eachCell) {
            column.eachCell({ includeEmpty: false }, (cell) => {
              const len = cell.value ? String(cell.value).length : 0;
              if (len > maxLength) maxLength = Math.min(len + 3, 50);
            });
          }
          column.width = maxLength;
        });
      }
    }

    if (totalExtractedCharacters < 10) {
      throw new Error('OCR_REQUIRED: Dieses Dokument enthält keine extrahierbare Tabellenstruktur (gescanntes PDF). Bitte nutzen Sie die OCR-Texterkennung für gescannte Dokumente.');
    }

    onProgress(90);
    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    onProgress(100);

    return {
      data: Buffer.from(xlsxBuffer),
      fileName: `${baseName}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // =========================================================================
  // 4. XLSX → PDF
  // =========================================================================
  static async xlsxToPdf(
    xlsxBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    // 1. Try LibreOffice headless for genuine workbook layout, charts, formulas, formatting
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(35);
        const pdfData = await convertWithLibreOffice(xlsxBuffer, 'xlsx', 'pdf');
        onProgress(100);
        return {
          data: pdfData,
          fileName: `${baseName}.pdf`,
          mimeType: 'application/pdf',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice XLSX->PDF fallback to in-process renderer:', loErr);
    }

    // 2. High-fidelity in-process workbook renderer (no column or cell truncation)
    onProgress(25);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(xlsxBuffer as unknown as ExcelJS.Buffer);

    onProgress(50);
    const pdf = await PDFDocument.create();
    const fontRegular = await embedUnicodeFont(pdf);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    workbook.eachSheet((worksheet) => {
      const colCount = Math.max(worksheet.columnCount || 1, 1);
      // Determine page width based on column count: adapt to A4 Landscape, A3 Landscape, or custom
      const minColWidth = 70;
      const margin = 35;
      const naturalWidth = margin * 2 + colCount * minColWidth;
      const pageWidth = Math.max(PageSizes.A4[1], naturalWidth); // At least A4 landscape
      const pageHeight = Math.max(PageSizes.A4[0], 595.28);
      const availableWidth = pageWidth - margin * 2;
      const colWidth = availableWidth / colCount;
      const rowHeight = 22;

      let currentPage = pdf.addPage([pageWidth, pageHeight]);
      let yPos = pageHeight - margin;

      // Sheet title
      currentPage.drawText(cleanWinAnsiText(`${baseName} — ${worksheet.name}`), {
        x: margin,
        y: yPos,
        size: 15,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25),
      });
      yPos -= 28;

      worksheet.eachRow((row, rowNumber) => {
        if (yPos < margin + 35) {
          currentPage = pdf.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;
        }

        const isHeader = rowNumber === 1;
        const font = isHeader ? fontBold : fontRegular;
        const fontSize = isHeader ? 9.5 : 8.5;

        // Calculate wrapped lines for all cells in this row to avoid character loss
        const cellLinesMap: Map<number, string[]> = new Map();
        let maxLinesInRow = 1;

        for (let colIdx = 1; colIdx <= colCount; colIdx++) {
          const cell = row.getCell(colIdx);
          const rawVal = cell.text || (cell.value !== null && cell.value !== undefined ? String(cell.value) : '');
          if (!rawVal) continue;

          const maxTextWidth = Math.max(colWidth - 8, 20);
          const safeText = cleanWinAnsiText(rawVal);

          const words = safeText.split(' ');
          const lines: string[] = [];
          let curLine = '';

          for (const word of words) {
            const testLine = curLine ? `${curLine} ${word}` : word;
            if (font.widthOfTextAtSize(testLine, fontSize) <= maxTextWidth) {
              curLine = testLine;
            } else {
              if (curLine) {
                lines.push(curLine);
                curLine = '';
              }
              if (font.widthOfTextAtSize(word, fontSize) > maxTextWidth) {
                let chunk = '';
                for (const char of word) {
                  if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxTextWidth) {
                    chunk += char;
                  } else {
                    lines.push(chunk);
                    chunk = char;
                  }
                }
                curLine = chunk;
              } else {
                curLine = word;
              }
            }
          }
          if (curLine) lines.push(curLine);
          cellLinesMap.set(colIdx, lines);
          if (lines.length > maxLinesInRow) {
            maxLinesInRow = lines.length;
          }
        }

        const effectiveRowHeight = Math.max(20, maxLinesInRow * 11 + 6);

        if (yPos - effectiveRowHeight < margin + 20) {
          currentPage = pdf.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;
        }

        if (isHeader) {
          currentPage.drawRectangle({
            x: margin,
            y: yPos - effectiveRowHeight + 5,
            width: availableWidth,
            height: effectiveRowHeight,
            color: rgb(0.92, 0.95, 0.98),
          });
        }

        for (let colIdx = 1; colIdx <= colCount; colIdx++) {
          const lines = cellLinesMap.get(colIdx);
          if (!lines || lines.length === 0) continue;
          const cellX = margin + (colIdx - 1) * colWidth + 4;
          let textY = yPos;
          for (const line of lines) {
            currentPage.drawText(line, {
              x: cellX,
              y: textY,
              size: fontSize,
              font,
              color: isHeader ? rgb(0.05, 0.1, 0.2) : rgb(0.2, 0.25, 0.3),
            });
            textY -= 11;
          }
        }

        currentPage.drawLine({
          start: { x: margin, y: yPos - effectiveRowHeight + 5 },
          end: { x: margin + availableWidth, y: yPos - effectiveRowHeight + 5 },
          thickness: 0.5,
          color: rgb(0.85, 0.88, 0.92),
        });

        yPos -= effectiveRowHeight;
      });
    });

    onProgress(90);
    const pdfBytes = await pdf.save();
    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  // =========================================================================
  // 5. PDF → PPTX
  // =========================================================================
  static async pdfToPptx(
    pdfBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const pdfjsLib = await getLoadedPdfJs();
    const loadingTask = pdfjsLib.getDocument(getPdfJsDocumentOptions(pdfBuffer));
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'CoolWave Presentation Engine';
    pptx.title = baseName;

    const canvasGlobals = globalThis as unknown as Record<string, unknown>;
    if (!canvasGlobals.Path2D) canvasGlobals.Path2D = napi.Path2D;
    if (!canvasGlobals.ImageData) canvasGlobals.ImageData = napi.ImageData;
    if (!canvasGlobals.DOMMatrix) canvasGlobals.DOMMatrix = napi.DOMMatrix;
    if (!canvasGlobals.DOMPoint) canvasGlobals.DOMPoint = napi.DOMPoint;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress(20 + Math.round((pageNum / numPages) * 65));
      const page = await pdf.getPage(pageNum);
      const renderViewport = page.getViewport({ scale: 2.0 });
      const canvas = napi.createCanvas(Math.ceil(renderViewport.width), Math.ceil(renderViewport.height));
      await page.render({ canvasContext: canvas.getContext('2d') as never, viewport: renderViewport }).promise;
      const png = canvas.toBuffer('image/png');

      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };

      // High-fidelity background rendering: full page is preserved with 100% graphics, charts, and layout
      slide.addImage({
        data: `data:image/png;base64,${png.toString('base64')}`,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        sizing: { type: 'contain', w: '100%', h: '100%' },
      });

      // Extract and layer searchable text content
      try {
        const textContent = await page.getTextContent();
        const items = textContent.items as Array<{ str: string }>;
        const pageText = items.map((it) => it.str).filter(Boolean).join(' ');
        if (pageText.trim()) {
          slide.addText(pageText.substring(0, 500), {
            x: 0,
            y: 0,
            w: '100%',
            h: 0.5,
            fontSize: 1,
            color: 'FFFFFF',
            transparency: 100,
          });
        }
      } catch {}
    }

    onProgress(90);
    const pptxBuffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    onProgress(100);

    return {
      data: pptxBuffer,
      fileName: `${baseName}.pptx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
  }

  // =========================================================================
  // 6. PPTX → PDF
  // =========================================================================
  static async pptxToPdf(
    pptxBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    // 1. Try LibreOffice headless for native PowerPoint rendering
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(35);
        const pdfData = await convertWithLibreOffice(pptxBuffer, 'pptx', 'pdf');
        onProgress(100);
        return {
          data: pdfData,
          fileName: `${baseName}.pdf`,
          mimeType: 'application/pdf',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice PPTX->PDF fallback to in-process renderer:', loErr);
    }

    // 2. High-fidelity in-process slide parser & visual renderer
    onProgress(25);
    const zip = await JSZip.loadAsync(pptxBuffer);

    // Read slide dimensions from ppt/presentation.xml (in EMUs: 1 pt = 12700 EMUs)
    let slideWidth = 842;
    let slideHeight = 473.6;
    try {
      const presXml = await zip.files['ppt/presentation.xml']?.async('text');
      if (presXml) {
        const sldSzMatch = presXml.match(/<p:sldSz[^>]+cx="(\d+)"[^>]+cy="(\d+)"/i);
        if (sldSzMatch) {
          const cx = parseInt(sldSzMatch[1], 10);
          const cy = parseInt(sldSzMatch[2], 10);
          if (cx > 0 && cy > 0) {
            slideWidth = Math.round(cx / 12700);
            slideHeight = Math.round(cy / 12700);
          }
        }
      }
    } catch {}

    const pdf = await PDFDocument.create();
    const fontRegular = await embedUnicodeFont(pdf);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const slideFiles = Object.keys(zip.files)
      .filter((name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    if (slideFiles.length === 0) {
      const page = pdf.addPage([slideWidth, slideHeight]);
      page.drawText(cleanWinAnsiText(baseName), { x: 50, y: slideHeight - 80, size: 24, font: fontBold });
    } else {
      for (let s = 0; s < slideFiles.length; s++) {
        const slidePath = slideFiles[s];
        const slideXml = await zip.files[slidePath].async('text');
        const page = pdf.addPage([slideWidth, slideHeight]);

        // Background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: slideWidth,
          height: slideHeight,
          color: rgb(1, 1, 1),
        });

        // 1. Read relationships to find slide images
        const slideDir = slidePath.substring(0, slidePath.lastIndexOf('/'));
        const slideFileBase = slidePath.substring(slidePath.lastIndexOf('/') + 1);
        const relsPath = `${slideDir}/_rels/${slideFileBase}.rels`;

        const relsMap: Record<string, string> = {};
        if (zip.files[relsPath]) {
          try {
            const relsXml = await zip.files[relsPath].async('text');
            const relMatches = relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/gi);
            for (const m of relMatches) {
              let target = m[2];
              if (target.startsWith('../')) target = 'ppt/' + target.substring(3);
              else if (!target.startsWith('ppt/')) target = 'ppt/' + target;
              relsMap[m[1]] = target;
            }
          } catch {}
        }

        // 2. Extract and draw pictures (<p:pic>)
        const picBlocks = slideXml.match(/<p:pic[\s\S]*?<\/p:pic>/gi) || [];
        for (const picXml of picBlocks) {
          try {
            const blipMatch = picXml.match(/<a:blip[^>]+r:embed="([^"]+)"/i);
            if (!blipMatch) continue;
            const rId = blipMatch[1];
            const imgPath = relsMap[rId];
            if (!imgPath || !zip.files[imgPath]) continue;

            const imgBytes = await zip.files[imgPath].async('nodebuffer');
            let embeddedImage: any = null;
            if (imgPath.endsWith('.png')) {
              embeddedImage = await pdf.embedPng(imgBytes);
            } else if (imgPath.endsWith('.jpg') || imgPath.endsWith('.jpeg')) {
              embeddedImage = await pdf.embedJpg(imgBytes);
            } else {
              const sharp = (await import('sharp')).default;
              const pngBuf = await sharp(imgBytes).png().toBuffer();
              embeddedImage = await pdf.embedPng(pngBuf);
            }

            const offMatch = picXml.match(/<a:off[^>]+x="(\d+)"[^>]+y="(\d+)"/i);
            const extMatch = picXml.match(/<a:ext[^>]+cx="(\d+)"[^>]+cy="(\d+)"/i);

            let imgX = 0;
            let imgY = 0;
            let imgW = slideWidth;
            let imgH = slideHeight;

            if (offMatch && extMatch) {
              const offX = parseInt(offMatch[1], 10);
              const offY = parseInt(offMatch[2], 10);
              const extCX = parseInt(extMatch[1], 10);
              const extCY = parseInt(extMatch[2], 10);

              imgX = offX / 12700;
              imgW = extCX / 12700;
              imgH = extCY / 12700;
              imgY = slideHeight - (offY / 12700) - imgH;
            }

            page.drawImage(embeddedImage, {
              x: Math.max(0, imgX),
              y: Math.max(0, imgY),
              width: Math.min(slideWidth, imgW),
              height: Math.min(slideHeight, imgH),
            });
          } catch (picErr) {
            console.warn('[OfficeConversionEngine] Could not embed slide picture:', picErr);
          }
        }

        // 3. Extract and draw text (<a:t>)
        const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
        const slideTexts = textMatches
          .map((m) => m.replace(/<[^>]+>/g, '').trim())
          .filter((t) => t.length > 0);

        if (slideTexts.length > 0 && picBlocks.length === 0) {
          page.drawRectangle({
            x: 0,
            y: 0,
            width: slideWidth,
            height: slideHeight,
            color: rgb(0.97, 0.98, 0.99),
          });

          const title = slideTexts[0] || `${baseName} — Folie ${s + 1}`;
          page.drawText(cleanWinAnsiText(title), {
            x: 50,
            y: slideHeight - 70,
            size: 22,
            font: fontBold,
            color: rgb(0.08, 0.12, 0.2),
          });

          let yPos = slideHeight - 120;
          for (let t = 1; t < slideTexts.length; t++) {
            if (yPos < 50) break;
            const text = slideTexts[t];
            page.drawText(`•  ${cleanWinAnsiText(text)}`, {
              x: 60,
              y: yPos,
              size: 13,
              font: fontRegular,
              color: rgb(0.2, 0.25, 0.35),
            });
            yPos -= 24;
          }
        } else if (slideTexts.length > 0 && picBlocks.length > 0) {
          let yPos = 40;
          for (const text of slideTexts) {
            if (yPos > slideHeight - 40) break;
            page.drawText(cleanWinAnsiText(text), {
              x: 30,
              y: yPos,
              size: 11,
              font: fontRegular,
              color: rgb(0.1, 0.1, 0.1),
            });
            yPos += 18;
          }
        }

        onProgress(30 + Math.round(((s + 1) / slideFiles.length) * 60));
      }
    }

    onProgress(95);
    const pdfBytes = await pdf.save();
    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  // =========================================================================
  // 7. DOC → PDF (Legacy Word format)
  // =========================================================================
  static async docToPdf(
    docBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    // 1. Try LibreOffice headless for genuine DOC->PDF conversion
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(35);
        const pdfData = await convertWithLibreOffice(docBuffer, 'doc', 'pdf');
        onProgress(100);
        return {
          data: pdfData,
          fileName: `${baseName}.pdf`,
          mimeType: 'application/pdf',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice DOC->PDF failed:', loErr);
    }

    // Check if misnamed XML/DOCX
    const isCfbf = docBuffer.length > 8 && 
      docBuffer[0] === 0xd0 && 
      docBuffer[1] === 0xcf && 
      docBuffer[2] === 0x11 && 
      docBuffer[3] === 0xe0;

    if (!isCfbf) {
      const textSample = docBuffer.toString('utf-8', 0, Math.min(docBuffer.length, 500));
      if (textSample.includes('<?xml') || textSample.includes('word/document.xml')) {
        return this.docxToPdf(docBuffer, originalName, onProgress);
      }
    }

    throw new Error('ENGINE_UNAVAILABLE: Die Konvertierung von binären Microsoft Word 97–2003 DOC-Dateien in PDF erfordert das serverseitige Office-System. Eine Extraktion von Klartext-Fragmenten ohne Layout wird aus Qualitätsgründen nicht unterstützt.');
  }

  // =========================================================================
  // 8. ODT → PDF (OpenDocument Text)
  // =========================================================================
  static async odtToPdf(
    odtBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    if (!(await isLibreOfficeAvailable())) {
      throw new Error('[ENGINE_UNAVAILABLE] LibreOffice ist auf dem Server erforderlich, um OpenDocument Text (ODT) layoutgetreu mit Bildern und Tabellen in PDF umzuwandeln.');
    }

    try {
      onProgress(35);
      const pdfData = await convertWithLibreOffice(odtBuffer, 'odt', 'pdf');
      onProgress(100);
      return {
        data: pdfData,
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
      };
    } catch (loErr: unknown) {
      console.error('[OfficeConversionEngine] LibreOffice ODT->PDF failed:', loErr);
      throw new Error('[ENGINE_UNAVAILABLE] Fehler bei der Konvertierung mit LibreOffice.');
    }
  }

  // =========================================================================
  // 9. RTF → PDF (Rich Text Format)
  // =========================================================================
  static async rtfToPdf(
    rtfBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(35);
        const pdfData = await convertWithLibreOffice(rtfBuffer, 'rtf', 'pdf');
        onProgress(100);
        return {
          data: pdfData,
          fileName: `${baseName}.pdf`,
          mimeType: 'application/pdf',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice RTF->PDF failed:', loErr);
    }

    const rtfString = rtfBuffer.toString('utf-8');
    if (!rtfString.startsWith('{\\rtf')) {
      throw new Error('Ungültiges RTF-Dokument: RTF-Signatur fehlt.');
    }

    onProgress(40);
    const cleaned = rtfString
      .replace(/{\\fonttbl[\s\S]*?}/g, '')
      .replace(/{\\colortbl[\s\S]*?}/g, '')
      .replace(/{\\stylesheet[\s\S]*?}/g, '')
      .replace(/{\\info[\s\S]*?}/g, '')
      .replace(/\\par[d]?\s?/g, '\n')
      .replace(/\\line\s?/g, '\n')
      .replace(/\\tab\s?/g, '    ')
      .replace(/\\'[0-9a-fA-F]{2}/g, (match) => {
        const byte = parseInt(match.substring(2), 16);
        return String.fromCharCode(byte);
      })
      .replace(/\\[a-zA-Z]+(-?\d+)?\s?/g, '')
      .replace(/[{}]/g, '')
      .trim();

    const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

    const pdf = await PDFDocument.create();
    const fontRegular = await embedUnicodeFont(pdf);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = PageSizes.A4[0];
    const pageHeight = PageSizes.A4[1];
    const margin = 50;

    let page = pdf.addPage([pageWidth, pageHeight]);
    let yPos = pageHeight - margin;

    page.drawText(cleanWinAnsiText(baseName), {
      x: margin,
      y: yPos,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });
    yPos -= 30;

    for (const line of lines) {
      if (yPos < margin + 30) {
        page = pdf.addPage([pageWidth, pageHeight]);
        yPos = pageHeight - margin;
      }
      const safeLine = line.length > 85 ? line.substring(0, 82) + '...' : line;
      page.drawText(cleanWinAnsiText(safeLine), {
        x: margin,
        y: yPos,
        size: 11,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.25),
      });
      yPos -= 18;
    }

    onProgress(90);
    const pdfBytes = await pdf.save();
    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  // =========================================================================
  // 10. TXT → PDF (Plain Text)
  // =========================================================================
  static async txtToPdf(
    txtBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const cleanText = cleanWinAnsiText(txtBuffer.toString('utf-8'));
    const rawLines = cleanText.split(/\r?\n/);

    const pdf = await PDFDocument.create();
    const fontCourier = await pdf.embedFont(StandardFonts.Courier);

    const pageWidth = PageSizes.A4[0];
    const pageHeight = PageSizes.A4[1];
    const margin = 45;
    const contentWidth = pageWidth - margin * 2;
    const fontSize = 10;
    const lineHeight = 14;

    let page = pdf.addPage([pageWidth, pageHeight]);
    let yPos = pageHeight - margin;
    let pageNum = 1;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Soft wrap long lines
      let remaining = line;
      while (remaining.length > 0) {
        if (yPos < margin + 30) {
          // Footer page number
          page.drawText(`Seite ${pageNum}`, {
            x: pageWidth - margin - 50,
            y: margin - 15,
            size: 9,
            font: fontCourier,
            color: rgb(0.5, 0.5, 0.5),
          });

          page = pdf.addPage([pageWidth, pageHeight]);
          pageNum++;
          yPos = pageHeight - margin;
        }

        // Measure slice that fits in contentWidth
        const sliceLen = Math.floor(contentWidth / 6.0); // Courier ~6pt width at 10pt size
        if (remaining.length <= sliceLen) {
          page.drawText(remaining, {
            x: margin,
            y: yPos,
            size: fontSize,
            font: fontCourier,
            color: rgb(0.15, 0.15, 0.15),
          });
          remaining = '';
        } else {
          page.drawText(remaining.substring(0, sliceLen), {
            x: margin,
            y: yPos,
            size: fontSize,
            font: fontCourier,
            color: rgb(0.15, 0.15, 0.15),
          });
          remaining = remaining.substring(sliceLen);
        }
        yPos -= lineHeight;
      }
    }

    // Last page footer
    page.drawText(`Seite ${pageNum}`, {
      x: pageWidth - margin - 50,
      y: margin - 15,
      size: 9,
      font: fontCourier,
      color: rgb(0.5, 0.5, 0.5),
    });

    onProgress(90);
    const pdfBytes = await pdf.save();
    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  // =========================================================================
  // 11. HTML → PDF (HTML / Web documents)
  // =========================================================================
  static async htmlToPdf(
    htmlBuffer: Buffer, 
    originalName: string, 
    onProgress: (p: number) => void
  ): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const htmlString = htmlBuffer.toString('utf-8');

    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = PageSizes.A4[0];
    const pageHeight = PageSizes.A4[1];
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    let page = pdf.addPage([pageWidth, pageHeight]);
    let yPos = pageHeight - margin;

    // Parse title from <title> tag if present
    const titleMatch = htmlString.match(/<title[^>]*>(.*?)<\/title>/i);
    const documentTitle = titleMatch ? titleMatch[1].trim() : baseName;

    page.drawText(documentTitle, {
      x: margin,
      y: yPos,
      size: 20,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.22),
    });
    yPos -= 30;

    // Extract blocks: h1-h6, p, li, table cells
    const blockRegex = /<(h[1-6]|p|li|td|th)[^>]*>(.*?)<\/\1>/gi;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(htmlString)) !== null) {
      const tag = match[1].toLowerCase();
      const rawInner = match[2];
      const text = rawInner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();

      if (!text) continue;

      const isHeading = tag.startsWith('h');
      const isListItem = tag === 'li';
      const fontSize = isHeading ? 14 : 10.5;
      const font = isHeading ? fontBold : fontRegular;
      const color = isHeading ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.25, 0.3);

      const prefix = isListItem ? '•  ' : '';
      const fullText = prefix + text;

      // Word wrapping
      const words = fullText.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth <= contentWidth) {
          currentLine = testLine;
        } else {
          if (yPos < margin + 40) {
            page = pdf.addPage([pageWidth, pageHeight]);
            yPos = pageHeight - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y: yPos,
            size: fontSize,
            font,
            color,
          });
          yPos -= fontSize + 6;
          currentLine = word;
        }
      }

      if (currentLine) {
        if (yPos < margin + 40) {
          page = pdf.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;
        }
        page.drawText(currentLine, {
          x: margin,
          y: yPos,
          size: fontSize,
          font,
          color,
        });
        yPos -= fontSize + (isHeading ? 14 : 8);
      }
    }

    onProgress(90);
    const pdfBytes = await pdf.save();
    onProgress(100);

    return {
      data: Buffer.from(pdfBytes),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  // =========================================================================
  // 12. DOCX -> ODT
  // =========================================================================
  static async docxToOdt(docxBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const rawResult = await mammoth.extractRawText({ buffer: docxBuffer });
    const text = rawResult.value || "";
    onProgress(50);
    const zip = new JSZip();
    zip.file("mimetype", "application/vnd.oasis.opendocument.text");
    zip.file("META-INF/manifest.xml", `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`);
    const lines = text.split(/\r?\n/);
    const paragraphs = lines.map((l) => `<text:p text:style-name="P1">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text:p>`).join("\n");
    zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3"><office:automatic-styles><style:style style:name="P1" style:family="paragraph"><style:text-properties fo:font-size="11pt"/></style:style></office:automatic-styles><office:body><office:text><text:h text:outline-level="1">${baseName.replace(/&/g,"&amp;")}</text:h>${paragraphs}</office:text></office:body></office:document-content>`);
    onProgress(85);
    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    onProgress(100);
    return { data: buf, fileName: `${baseName}.odt`, mimeType: "application/vnd.oasis.opendocument.text" };
  }

  // =========================================================================
  // 13. ODT -> DOCX
  // =========================================================================
  static async odtToDocx(odtBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const zip = await safeLoadZip(odtBuffer);
    if (!zip.file("content.xml")) throw new Error("Ungueltige ODT-Datei: content.xml nicht gefunden.");
    onProgress(40);
    const xml = await zip.file("content.xml")!.async("text");
    const rawText = xml
      .replace(/<text:p[^>]*>/g, "\n").replace(/<text:h[^>]*>/g, "\n## ")
      .replace(/<[^>]+>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");
    onProgress(60);
    const paragraphs: Paragraph[] = [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: baseName, bold: true, font: "Calibri", size: 32 })] })];
    for (const line of rawText.split(/\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0)) {
      const isH = line.startsWith("## ");
      paragraphs.push(new Paragraph({ heading: isH ? HeadingLevel.HEADING_2 : undefined, spacing: { after: 140 }, children: [new TextRun({ text: isH ? line.slice(3) : line, font: "Calibri", size: isH ? 26 : 22, bold: isH })] }));
    }
    const doc = new Document({ sections: [{ children: paragraphs }] });
    onProgress(90);
    const buf = await Packer.toBuffer(doc);
    onProgress(100);
    return { data: buf, fileName: `${baseName}.docx`, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }

  // =========================================================================
  // 14. RTF -> DOCX
  // =========================================================================
  static async rtfToDocx(rtfBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const rtfText = rtfBuffer.toString("latin1");
    const plain = rtfText
      .replace(/\{\\fonttbl[^}]*\}/g,"").replace(/\{\\colortbl[^}]*\}/g,"").replace(/\\par\b/g,"\n").replace(/\\line\b/g,"\n")
      .replace(/\\tab\b/g,"\t").replace(/\\[a-z]+\d*/g,"").replace(/\{|\}/g,"").replace(/[^\x20-\x7E\n\t]/g,"");
    onProgress(50);
    return this.txtToDocx(Buffer.from(plain, "utf-8"), originalName.replace(".rtf",".txt"), onProgress);
  }

  // =========================================================================
  // 15. TXT -> DOCX
  // =========================================================================
  static async txtToDocx(txtBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(30);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const text = txtBuffer.toString("utf-8");
    const paragraphs: Paragraph[] = [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: baseName, bold: true, font: "Calibri", size: 32 })] })];
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      const isH = t.length > 0 && t.length < 80 && t === t.toUpperCase() && /[A-Z]/.test(t);
      paragraphs.push(new Paragraph({ heading: isH ? HeadingLevel.HEADING_2 : undefined, spacing: { after: isH ? 200 : 120 }, children: [new TextRun({ text: line, font: "Calibri", size: isH ? 26 : 22, bold: isH })] }));
    }
    const doc = new Document({ sections: [{ children: paragraphs }] });
    onProgress(90);
    const buf = await Packer.toBuffer(doc);
    onProgress(100);
    return { data: buf, fileName: `${baseName}.docx`, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }

  // =========================================================================
  // 16. DOC -> DOCX
  // =========================================================================
  static async docToDocx(docBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");

    // 1. Try LibreOffice headless for native DOC -> DOCX conversion
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(40);
        const docxData = await convertWithLibreOffice(docBuffer, 'doc', 'docx');
        onProgress(100);
        return {
          data: docxData,
          fileName: `${baseName}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice DOC->DOCX failed:', loErr);
    }

    // Check if file was already XML/DOCX misnamed as .doc
    try {
      const zip = await JSZip.loadAsync(docBuffer);
      if (zip.file("word/document.xml")) {
        return { data: docBuffer, fileName: `${baseName}.docx`, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
      }
    } catch {}

    throw new Error('ENGINE_UNAVAILABLE: Die Konvertierung von binären Word 97–2003 DOC-Dateien erfordert das serverseitige Office-System. Eine Extraktion von Klartext-Fragmenten ohne Formatierung wird aus Qualitätsgründen nicht unterstützt.');
  }

  // =========================================================================
  // 17. DOCX -> DOC (Word 97-2003 Binary Format)
  // =========================================================================
  static async docxToDoc(docxBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");

    // 1. Try LibreOffice headless for genuine binary Word 97-2003 CFBF DOC
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(40);
        const docData = await convertWithLibreOffice(docxBuffer, 'docx', 'doc', 'MS Word 97');
        onProgress(100);
        return {
          data: docData,
          fileName: `${baseName}.doc`,
          mimeType: 'application/msword',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice DOCX->DOC failed:', loErr);
    }

    throw new Error('ENGINE_UNAVAILABLE: Die Konvertierung in das veraltete binäre Microsoft Word 97–2003 (.doc) Format erfordert das serverseitige Office-System. Um Darstellungs- und Sicherheitsfehler zu vermeiden, wird keine vorgetäuschte RTF-Datei als .doc ausgegeben.');
  }

  // =========================================================================
  // 18. XLS -> XLSX
  // =========================================================================
  static async xlsToXlsx(xlsBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    try {
      const workbook = XLSX.read(xlsBuffer, { type: "buffer" });
      onProgress(70);
      const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      onProgress(100);
      return { data: Buffer.from(buf), fileName: `${baseName}.xlsx`, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
    } catch {
      throw new Error("XLS-Datei konnte nicht gelesen werden. Bitte stellen Sie sicher, dass es sich um eine gültige Excel-Datei (.xls) handelt.");
    }
  }

  // =========================================================================
  // 19. XLSX -> XLS
  // =========================================================================
  static async xlsxToXls(xlsxBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    try {
      const workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
      onProgress(65);
      const buf = XLSX.write(workbook, { type: "buffer", bookType: "biff8" });
      onProgress(100);
      return { data: Buffer.from(buf), fileName: `${baseName}.xls`, mimeType: "application/vnd.ms-excel" };
    } catch (err: any) {
      throw new Error(`XLSX zu XLS Konvertierung fehlgeschlagen: ${err?.message || 'Ungültige Datei'}`);
    }
  }

  // =========================================================================
  // 20. CSV -> XLSX (Standards-compliant RFC 4180 parser)
  // =========================================================================
  static async csvToXlsx(csvBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(15);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const csvText = csvBuffer.toString("utf-8");

    onProgress(30);
    const parsed = parseCsv(csvText);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CoolWave Engine";
    const worksheet = workbook.addWorksheet(baseName.substring(0, 31) || "Sheet1");

    onProgress(50);
    let rowIndex = 1;
    for (const rowCells of parsed.rows) {
      const row = worksheet.getRow(rowIndex);
      const rowValues = rowCells.map((cell) => cell.value);
      row.values = rowValues;

      // Ensure cells with leading zeros or preserved strings are explicitly formatted as text
      rowCells.forEach((cell, colIdx) => {
        if (cell.hasLeadingZero || typeof cell.value === 'string') {
          const currentCell = row.getCell(colIdx + 1);
          currentCell.numFmt = '@'; // Excel text format
        }
      });

      if (rowIndex === 1) {
        row.font = { bold: true, color: { argb: "FFFFFFFF" } };
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
        row.height = 20;
      }
      rowIndex++;
    }

    // Auto-fit column widths
    worksheet.columns.forEach((col: any) => {
      let max = 10;
      if (col && col.eachCell) {
        col.eachCell({ includeEmpty: false }, (cell: any) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = Math.min(len + 3, 50);
        });
      }
      col.width = max;
    });

    onProgress(85);
    const buf = await workbook.xlsx.writeBuffer();
    onProgress(100);
    return { data: Buffer.from(buf), fileName: `${baseName}.xlsx`, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  }

  // =========================================================================
  // 21. XLSX -> CSV
  // =========================================================================
  static async xlsxToCsv(xlsxBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(xlsxBuffer as unknown as ExcelJS.Buffer);
    onProgress(55);
    const ws = workbook.worksheets[0];
    if (!ws) throw new Error("Die XLSX-Datei enthaelt keine Tabellen.");
    const rows: string[] = [];
    ws.eachRow((row: ExcelJS.Row) => {
      const cells = row.values as (string | number | null | undefined)[];
      const csvRow = cells.slice(1).map((v: string | number | null | undefined) => {
        const str = v === null || v === undefined ? "" : String(v);
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g,'""')}"` : str;
      }).join(",");
      rows.push(csvRow);
    });
    onProgress(95);
    return { data: Buffer.from(rows.join("\r\n"), "utf-8"), fileName: `${baseName}.csv`, mimeType: "text/csv" };
  }

  // =========================================================================
  // 22. CSV -> PDF
  // =========================================================================
  static async csvToPdf(csvBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(10);
    const xlsxName = originalName.replace(".csv", ".xlsx");
    const tempXlsx = await this.csvToXlsx(csvBuffer, xlsxName, (p) => onProgress(10 + Math.round(p * 0.4)));
    return this.xlsxToPdf(tempXlsx.data, xlsxName, (p) => onProgress(50 + Math.round(p * 0.5)));
  }

  // =========================================================================
  // 23. PPT -> PPTX
  // =========================================================================
  static async pptToPptx(pptBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");

    // 1. Try LibreOffice headless for genuine PPT -> PPTX conversion
    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(40);
        const pptxData = await convertWithLibreOffice(pptBuffer, 'ppt', 'pptx');
        onProgress(100);
        return {
          data: pptxData,
          fileName: `${baseName}.pptx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice PPT->PPTX failed:', loErr);
    }

    try {
      const zip = await JSZip.loadAsync(pptBuffer);
      if (zip.file("ppt/presentation.xml")) {
        return { data: pptBuffer, fileName: `${baseName}.pptx`, mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
      }
    } catch {}

    throw new Error('ENGINE_UNAVAILABLE: Die Konvertierung von binären PowerPoint 97–2003 PPT-Dateien erfordert das serverseitige Office-System. Eine Extraktion von Klartext-Fragmenten ohne Folien-Layout wird aus Qualitätsgründen nicht unterstützt.');
  }

  // =========================================================================
  // 24. PPTX -> PPT (PowerPoint 97-2003 Binary Format)
  // =========================================================================
  static async pptxToPpt(pptxBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");

    try {
      if (await isLibreOfficeAvailable()) {
        onProgress(40);
        const pptData = await convertWithLibreOffice(pptxBuffer, 'pptx', 'ppt', 'MS PowerPoint 97');
        onProgress(100);
        return {
          data: pptData,
          fileName: `${baseName}.ppt`,
          mimeType: 'application/vnd.ms-powerpoint',
        };
      }
    } catch (loErr) {
      console.warn('[OfficeConversionEngine] LibreOffice PPTX->PPT failed:', loErr);
    }

    throw new Error('ENGINE_UNAVAILABLE: Die Konvertierung in das veraltete binäre Microsoft PowerPoint 97–2003 (.ppt) Format erfordert das serverseitige Office-System.');
  }

  // =========================================================================
  // 25. ODP -> PPTX
  // =========================================================================
  static async odpToPptx(odpBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const zip = await JSZip.loadAsync(odpBuffer);
    if (!zip.file("content.xml")) throw new Error("Ungueltige ODP-Datei: content.xml nicht gefunden.");
    onProgress(35);
    const xml = await zip.file("content.xml")!.async("text");
    const pages = xml.match(/<draw:page[^>]*>([\s\S]*?)<\/draw:page>/g) || [];
    onProgress(55);
    const pptx = new PptxGenJS(); pptx.layout = "LAYOUT_16x9"; pptx.title = baseName;
    if (pages.length === 0) { const s = pptx.addSlide(); s.addText(baseName, { x: 1, y: 2, w: "80%", h: 1, fontSize: 28, bold: true, color: "0F172A" }); }
    for (let i = 0; i < pages.length; i++) {
      onProgress(55 + Math.round((i / pages.length) * 35));
      const px = pages[i];
      const texts = (px.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/g) || [])
        .map((m: string) => m.replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim())
        .filter((t: string) => t.length > 0);
      const slide = pptx.addSlide(); slide.background = { color: "F8FAFC" };
      slide.addText(texts[0] || `Folie ${i+1}`, { x: 0.8, y: 0.5, w: "85%", h: 0.9, fontSize: 22, bold: true, color: "0F172A", fontFace: "Calibri" });
      if (texts.length > 1) slide.addText(texts.slice(1).map((t: string) => ({ text: t, options: { fontSize: 14, color: "334155", bullet: true, breakLine: true } })), { x: 0.8, y: 1.6, w: "85%", h: 4.5, fontFace: "Calibri", valign: "top" });
    }
    onProgress(95);
    const buf = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    onProgress(100);
    return { data: buf, fileName: `${baseName}.pptx`, mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
  }

  // =========================================================================
  // 26. EPUB -> PDF
  // =========================================================================
  static async epubToPdf(epubBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const zip = await safeLoadZip(epubBuffer);
    onProgress(30);
    let opfPath = "";
    const containerFile = zip.file("META-INF/container.xml");
    if (containerFile) {
      const containerXml = await containerFile.async("text");
      const m = containerXml.match(/full-path="([^"]+\.opf)"/i);
      if (m) opfPath = m[1];
    }
    const htmlContents: string[] = [];
    if (opfPath && zip.file(opfPath)) {
      const opfXml = await zip.file(opfPath)!.async("text");
      const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/")+1) : "";
      const spineItems = opfXml.match(/<itemref[^>]+idref="([^"]+)"/g) || [];
      const idRefs = spineItems.map((s: string) => s.match(/idref="([^"]+)"/)?.[1] || "");
      const MAX_EPUB_DOCS = 1000;
      if (idRefs.length > MAX_EPUB_DOCS) {
        throw new Error(`RESOURCE_LIMIT_EXCEEDED: Das EPUB-Buch überschreitet mit über ${MAX_EPUB_DOCS} Kapiteln die maximal zulässige Sicherheitsgrenze.`);
      }
      for (const idref of idRefs) {
        const im = opfXml.match(new RegExp(`id="${idref}"[^>]+href="([^"]+)"`, "i")) || opfXml.match(new RegExp(`href="([^"]+)"[^>]+id="${idref}"`, "i"));
        if (im) {
          const href = opfDir + decodeURIComponent(im[1]);
          const file = zip.file(href);
          if (file) htmlContents.push(await file.async("text"));
        }
      }
    }
    if (htmlContents.length === 0) {
      const hf = Object.keys(zip.files).filter(n => n.endsWith(".html")||n.endsWith(".xhtml")||n.endsWith(".htm")).sort();
      if (hf.length > 1000) {
        throw new Error(`RESOURCE_LIMIT_EXCEEDED: Das EPUB-Buch überschreitet mit über 1000 Dokumenten die maximal zulässige Sicherheitsgrenze.`);
      }
      for (const f of hf) htmlContents.push(await zip.files[f].async("text"));
    }
    onProgress(55);
    const pdf = await PDFDocument.create();
    const fontR = await embedUnicodeFont(pdf);
    const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pw = PageSizes.A4[0]; const ph = PageSizes.A4[1]; const mg = 50;
    const cw = pw - mg * 2;
    let cp = pdf.addPage([pw, ph]); let yp = ph - mg;
    cp.drawText(cleanWinAnsiText(baseName), { x: mg, y: yp, size: 18, font: fontB, color: rgb(0.1,0.15,0.25) }); yp -= 30;
    cp.drawLine({ start: { x: mg, y: yp }, end: { x: pw-mg, y: yp }, thickness: 1, color: rgb(0.8,0.85,0.9) }); yp -= 20;
    const drawW = (text: string, fs: number, font: typeof fontR, clr: ReturnType<typeof rgb>, lg = 6) => {
      const words = text.split(" "); let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(test, fs) <= cw) { line = test; }
        else {
          if (yp < mg + 40) { cp = pdf.addPage([pw,ph]); yp = ph-mg; }
          if (line) { cp.drawText(cleanWinAnsiText(line), { x: mg, y: yp, size: fs, font, color: clr }); yp -= fs+lg; }
          line = word;
        }
      }
      if (line) { if (yp < mg+40) { cp = pdf.addPage([pw,ph]); yp = ph-mg; } cp.drawText(cleanWinAnsiText(line), { x: mg, y: yp, size: fs, font, color: clr }); yp -= fs+lg; }
    };
    for (let ci = 0; ci < htmlContents.length; ci++) {
      onProgress(55 + Math.round((ci/Math.max(htmlContents.length,1))*35));
      const html = htmlContents[ci];
      const br = /<(h[1-6]|p|li|div)[^>]*>([\s\S]*?)<\/\1>/gi; let bm: RegExpExecArray|null;
      while ((bm = br.exec(html)) !== null) {
        const tag = bm[1].toLowerCase(); const inner = bm[2].replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
        if (!inner) continue;
        const isH = tag.startsWith("h"); const fs = isH ? 14 : 10.5; const font = isH ? fontB : fontR; const clr = isH ? rgb(0.1,0.15,0.25) : rgb(0.2,0.25,0.3);
        if (isH) yp -= 6; drawW((tag==="li" ? "  - " : "") + inner, fs, font, clr); if (isH) yp -= 4;
      }
      if (ci < htmlContents.length - 1) { cp = pdf.addPage([pw,ph]); yp = ph-mg; }
    }
    onProgress(95);
    const bytes = await pdf.save(); onProgress(100);
    return { data: Buffer.from(bytes), fileName: `${baseName}.pdf`, mimeType: "application/pdf" };
  }

  // =========================================================================
  // 27. EPUB -> TXT
  // =========================================================================
  static async epubToTxt(epubBuffer: Buffer, originalName: string, onProgress: (p: number) => void): Promise<ConvertedDocument> {
    onProgress(20);
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const zip = await safeLoadZip(epubBuffer);
    onProgress(35);
    const htmlFiles = Object.keys(zip.files).filter(n => n.endsWith(".html")||n.endsWith(".xhtml")||n.endsWith(".htm")).sort();
    if (htmlFiles.length > 1000) {
      throw new Error('RESOURCE_LIMIT_EXCEEDED: Das EPUB-Buch überschreitet mit über 1000 Dokumenten die maximal zulässige Sicherheitsgrenze.');
    }
    const parts: string[] = [`${baseName}\n${"=".repeat(baseName.length)}\n`];
    for (const f of htmlFiles) {
      const html = await zip.files[f].async("text");
      const stripped = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"")
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,(_: string,t: string) => "\n\n## "+t.replace(/<[^>]+>/g,"").trim()+"\n")
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi,(_: string,t: string) => "\n"+t.replace(/<[^>]+>/g,"").trim())
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,(_: string,t: string) => "\n- "+t.replace(/<[^>]+>/g,"").trim())
        .replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g,"")
        .replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
        .replace(/\n{3,}/g,"\n\n").trim();
      if (stripped) parts.push(stripped);
    }
    onProgress(90);
    return { data: Buffer.from(parts.join("\n\n"), "utf-8"), fileName: `${baseName}.txt`, mimeType: "text/plain" };
  }
}
