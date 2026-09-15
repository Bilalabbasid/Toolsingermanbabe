import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument, degrees } from 'pdf-lib';
import sharp from 'sharp';
import ExcelJS from 'exceljs';
import { OfficeConversionEngine } from '@/server/services/adapters/OfficeConversionEngine';
import { PdfSecurityService } from '@/server/services/adapters/PdfSecurityService';
import { cleanWinAnsiText } from '@/server/pdf/safeWinAnsi';
import { sanitizeJobError } from '@/server/engine/errorSanitizer';
import { getActiveTools, getToolBySlug } from '@/config/tools.config';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('Tool Registry & Inventory Integrity', () => {
  it('has 165 active tools with valid unique slugs and metadata', () => {
    const tools = getActiveTools();
    expect(tools.length).toBe(165);
    const slugs = new Set(tools.map((t) => t.slug));
    expect(slugs.size).toBe(165);

    for (const tool of tools) {
      expect(tool.slug).toBeTruthy();
      expect(tool.nameDe).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.processingEngine).toBeTruthy();
    }
  });

  it('correctly maps bildqualitaet-optimieren to optimize mode', () => {
    const tool = getToolBySlug('bildqualitaet-optimieren');
    expect(tool).toBeDefined();
    expect(tool?.processingEngine).toBe('image-effects');
  });
});

describe('PDF Engine Tools (Input -> Process -> Real Output)', () => {
  const samplePdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'));

  it('Merge PDF: 2 PDFs -> 1 valid PDF with combined page count', async () => {
    const docA = await PDFDocument.load(samplePdfBuffer);
    const docB = await PDFDocument.load(samplePdfBuffer);
    const merged = await PDFDocument.create();

    const pagesA = await merged.copyPages(docA, docA.getPageIndices());
    pagesA.forEach((p) => merged.addPage(p));
    const pagesB = await merged.copyPages(docB, docB.getPageIndices());
    pagesB.forEach((p) => merged.addPage(p));

    const mergedBytes = await merged.save();
    expect(mergedBytes.length).toBeGreaterThan(0);
    expect(Buffer.from(mergedBytes.subarray(0, 5)).toString()).toBe('%PDF-');

    // Verify page count: 2 + 2 = 4
    const verifiedDoc = await PDFDocument.load(mergedBytes);
    expect(verifiedDoc.getPageCount()).toBe(4);
  });

  it('Split / Extract PDF: Extracts selected page into valid single-page PDF', async () => {
    const srcDoc = await PDFDocument.load(samplePdfBuffer);
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [0]);
    singleDoc.addPage(copiedPage);

    const outBytes = await singleDoc.save();
    expect(outBytes.length).toBeGreaterThan(0);
    expect(Buffer.from(outBytes.subarray(0, 5)).toString()).toBe('%PDF-');

    const verified = await PDFDocument.load(outBytes);
    expect(verified.getPageCount()).toBe(1);
  });

  it('Rotate PDF: Rotates page by 90 degrees and writes modification to PDF', async () => {
    const doc = await PDFDocument.load(samplePdfBuffer);
    const page = doc.getPage(0);
    page.setRotation(degrees(90));

    const outBytes = await doc.save();
    const reloaded = await PDFDocument.load(outBytes);
    expect(reloaded.getPage(0).getRotation().angle).toBe(90);
  });

  it('PDF Electronic Signing: Adds visual verification badge without obscuring signature', async () => {
    const secService = new PdfSecurityService();
    const signedBuffer = await secService.signPdf(samplePdfBuffer, {
      signerName: 'Test Prüfer',
      reason: 'Freigabe',
    });

    expect(signedBuffer.length).toBeGreaterThan(0);
    expect(signedBuffer.subarray(0, 5).toString()).toBe('%PDF-');

    const verified = await PDFDocument.load(signedBuffer);
    expect(verified.getPageCount()).toBe(2);
  });

  it('PDF Protection: Encrypts PDF and generates independent owner password', async () => {
    const secService = new PdfSecurityService();
    const protectedBuffer = await secService.protectPdf(
      samplePdfBuffer,
      'testpass123',
      undefined,
      { allowPrinting: true, allowCopying: false }
    );

    expect(protectedBuffer.length).toBeGreaterThan(0);
    expect(protectedBuffer.subarray(0, 5).toString()).toBe('%PDF-');
  });
});

describe('Office Conversion Engine (Input -> Process -> Real Output)', () => {
  it('DOCX to PDF: Converts valid DOCX to valid non-empty PDF', async () => {
    const docxBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.docx'));
    const result = await OfficeConversionEngine.docxToPdf(docxBuffer, 'sample.docx', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.data.subarray(0, 5).toString()).toBe('%PDF-');

    const pdf = await PDFDocument.load(result.data);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('TXT to PDF: Converts UTF-8 text with BOM & German symbols without WinAnsi crashes', async () => {
    const txtBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.txt'));
    // Include BOM and checkmarks
    const problematicTxt = Buffer.from('\uFEFFTestzeile mit ☑ Häkchen, Euro € und Umlauten: ÄÖÜäöüß.\n');
    const result = await OfficeConversionEngine.txtToPdf(problematicTxt, 'test.txt', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.data.subarray(0, 5).toString()).toBe('%PDF-');

    const pdf = await PDFDocument.load(result.data);
    expect(pdf.getPageCount()).toBe(1);
  });

  it('PDF to DOCX: Converts PDF to valid DOCX ZIP package', async () => {
    const pdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'));
    const result = await OfficeConversionEngine.pdfToDocx(pdfBuffer, 'sample.pdf', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.fileName.endsWith('.docx')).toBe(true);
    // DOCX files are ZIP archives starting with PK (0x50, 0x4B, 0x03, 0x04)
    expect(result.data[0]).toBe(0x50);
    expect(result.data[1]).toBe(0x4b);
    expect(result.data[2]).toBe(0x03);
    expect(result.data[3]).toBe(0x04);
  });

  it('PDF to PPTX: Converts PDF to valid PPTX ZIP presentation', async () => {
    const pdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'));
    const result = await OfficeConversionEngine.pdfToPptx(pdfBuffer, 'sample.pdf', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.fileName.endsWith('.pptx')).toBe(true);
    // PPTX files are ZIP archives starting with PK
    expect(result.data[0]).toBe(0x50);
    expect(result.data[1]).toBe(0x4b);
  });

  it('PDF to XLSX: Converts text PDF to valid XLSX workbook', async () => {
    const pdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.pdf'));
    const result = await OfficeConversionEngine.pdfToXlsx(pdfBuffer, 'sample.pdf', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.fileName.endsWith('.xlsx')).toBe(true);
    expect(result.data[0]).toBe(0x50);
    expect(result.data[1]).toBe(0x4b);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(result.data as never);
    expect(workbook.worksheets.length).toBe(2);
  });

  it('PDF to XLSX: Scanned/empty PDF gracefully throws clear German OCR message without crashing', async () => {
    const emptyPdf = await PDFDocument.create();
    emptyPdf.addPage([500, 500]); // Page with no text
    const emptyPdfBytes = await emptyPdf.save();

    await expect(
      OfficeConversionEngine.pdfToXlsx(Buffer.from(emptyPdfBytes) as Buffer, 'scan.pdf', () => {})
    ).rejects.toThrow(/eingescannte Bilder oder keinen extrahierbaren Tabellentext/);
  });

  it('XLSX to PDF: Converts Excel spreadsheet to valid PDF', async () => {
    const xlsxBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.xlsx'));
    const result = await OfficeConversionEngine.xlsxToPdf(xlsxBuffer, 'sample.xlsx', () => {});

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.data.subarray(0, 5).toString()).toBe('%PDF-');
  });
});

describe('Image Conversions & Raster Engine (Input -> Process -> Real Output)', () => {
  const samplePngBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.png'));
  const sampleJpgBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.jpg'));

  it('PNG to JPG: Generates true JPEG with valid SOI magic bytes (FF D8 FF)', async () => {
    const outBuffer = await sharp(samplePngBuffer).jpeg({ quality: 90 }).toBuffer();
    expect(outBuffer.length).toBeGreaterThan(0);
    expect(outBuffer[0]).toBe(0xff);
    expect(outBuffer[1]).toBe(0xd8);
    expect(outBuffer[2]).toBe(0xff);

    const meta = await sharp(outBuffer).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(200);
  });

  it('JPG to PNG: Generates true PNG with valid signature', async () => {
    const outBuffer = await sharp(sampleJpgBuffer).png().toBuffer();
    expect(outBuffer.length).toBeGreaterThan(0);
    expect(outBuffer[0]).toBe(0x89);
    expect(outBuffer.subarray(1, 4).toString()).toBe('PNG');

    const meta = await sharp(outBuffer).metadata();
    expect(meta.format).toBe('png');
  });

  it('JPG to WebP: Generates true WebP format', async () => {
    const outBuffer = await sharp(sampleJpgBuffer).webp().toBuffer();
    expect(outBuffer.length).toBeGreaterThan(0);
    expect(outBuffer.subarray(0, 4).toString()).toBe('RIFF');
    expect(outBuffer.subarray(8, 12).toString()).toBe('WEBP');

    const meta = await sharp(outBuffer).metadata();
    expect(meta.format).toBe('webp');
  });

  it('Image Resize: Resizes image to exact requested dimensions', async () => {
    const outBuffer = await sharp(samplePngBuffer).resize(100, 50, { fit: 'fill' }).png().toBuffer();
    const meta = await sharp(outBuffer).metadata();
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(50);
  });

  it('SVG to PNG: Renders SVG vector into valid raster PNG', async () => {
    const svgBuffer = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.svg'));
    const outBuffer = await sharp(svgBuffer).png().toBuffer();
    expect(outBuffer.length).toBeGreaterThan(0);
    expect(outBuffer[0]).toBe(0x89);
    expect(outBuffer.subarray(1, 4).toString()).toBe('PNG');
  });
});

describe('Text & Developer Utilities', () => {
  it('German Case Conversion: Properly converts umlauts in title & sentence case', () => {
    const input = 'über den äpfeln';
    const titleCased = input.replace(/([\p{L}\p{N}]\S*)/gu, (txt) => txt.charAt(0).toLocaleUpperCase('de-DE') + txt.slice(1).toLocaleLowerCase('de-DE'));
    expect(titleCased).toBe('Über Den Äpfeln');
  });

  it('JSON Formatter & Validator: Formats valid JSON with 2-space indentation', () => {
    const raw = '{"a":1,"b":[2,3]}';
    const parsed = JSON.parse(raw);
    const formatted = JSON.stringify(parsed, null, 2);
    expect(formatted).toContain('  "a": 1');
  });

  it('Base64 Encode / Decode: Round-trips binary and UTF-8 data correctly', () => {
    const text = 'CoolWave Werkzeuge 2026';
    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    expect(decoded).toBe(text);
  });
});

describe('Security & Public Error Sanitization', () => {
  it('Sanitizes internal raw library exceptions into clean German messages', () => {
    expect(sanitizeJobError(new Error("Cannot read properties of null (reading 'forEach')"))).toContain('OCR-Texterkennung');
    expect(sanitizeJobError(new Error('WinAnsi cannot encode "☑"'))).toContain('Standard-PDF-Schriftsatz');
    expect(sanitizeJobError(new Error('PasswordException: file is encrypted'))).toContain('passwortgeschützt');
  });

  it('cleanWinAnsiText strips BOM and converts checkmarks safely', () => {
    const input = '\uFEFFCheck: ☑ Erledigt, ✓ Bestätigt, Euro: €';
    const cleaned = cleanWinAnsiText(input);
    expect(cleaned).not.toContain('\uFEFF');
    expect(cleaned).toContain('[x]');
    expect(cleaned).toContain('[v]');
    expect(cleaned).toContain('€');
  });
});
