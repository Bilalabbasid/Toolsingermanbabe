import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { OfficeConversionEngine } from '@/server/services/adapters/OfficeConversionEngine';
import { getLoadedPdfJs, getPdfJsDocumentOptions } from '@/server/pdf/pdfjsNode';

describe('PDF to Word output integrity', () => {
  it('preserves searchable text from a simple multi-page PDF', async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText('First page unique sentence alpha beta gamma.', { x: 50, y: 700, font });
    pdf.addPage().drawText('Second page unique sentence delta epsilon zeta.', { x: 50, y: 700, font });
    const source = Buffer.from(await pdf.save());
    const output = await OfficeConversionEngine.pdfToDocx(source, 'source.pdf', () => {});
    const docText = (await mammoth.extractRawText({ buffer: output.data })).value;
    expect(docText).toContain('First page unique sentence');
    expect(docText).toContain('Second page unique sentence');
  });

  it('does not claim success with a filename-only document for an image PDF', async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const source = Buffer.from(await pdf.save());
    await expect(OfficeConversionEngine.pdfToDocx(source, 'empty.pdf', () => {}, { language: 'eng' })).rejects.toThrow(/OCR|Text|Scan|text/i);
  });

  it.skipIf(!process.env.COOLWAVE_REGRESSION_PDF)('preserves the reported scan visually without inserting its filename', async () => {
    const source = readFileSync(process.env.COOLWAVE_REGRESSION_PDF!);
    const pdfjs = await getLoadedPdfJs();
    const pdf = await pdfjs.getDocument(getPdfJsDocumentOptions(source)).promise;
    let pageText = '';
    for (let page = 1; page <= pdf.numPages; page++) {
      const content = await (await pdf.getPage(page)).getTextContent();
      pageText += content.items.map((item: { str?: string }) => item.str ?? '').join(' ');
    }
    expect(pageText.length).toBe(0); // The source is a page image, not selectable PDF text.
    const output = await OfficeConversionEngine.pdfToDocx(source, 'reported.pdf', () => {});
    const zip = await JSZip.loadAsync(output.data);
    expect(Object.keys(zip.files).filter(name => name.startsWith('word/media/') && name.endsWith('.png'))).toHaveLength(1);
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('<w:drawing>');
    expect(xml).not.toContain('reported.pdf');
  });

  it.skipIf(!process.env.COOLWAVE_REGRESSION_PDF)('offers OCR text separately without a filename heading', async () => {
    const source = readFileSync(process.env.COOLWAVE_REGRESSION_PDF!);
    const output = await OfficeConversionEngine.pdfToDocx(source, 'reported.pdf', () => {}, { scanMode: 'text', language: 'eng' });
    const docText = (await mammoth.extractRawText({ buffer: output.data })).value;
    expect(docText.length).toBeGreaterThan(100);
    expect(docText).toContain('SKILLS');
    expect(docText).toContain('WORK HISTORY');
    expect(docText).not.toContain('reported.pdf');
    expect(docText).not.toContain('CoolWave OCR');
    const zip = await JSZip.loadAsync(output.data);
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('<w:t ');
    expect(xml).toContain('<w:ind');
    expect(xml).toContain('<w:color');
    expect(xml).not.toContain('<w:drawing>');
    expect(Object.keys(zip.files).filter(name => name.startsWith('word/media/'))).toHaveLength(0);
  });
});
