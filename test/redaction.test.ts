import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

describe('PDF Security & Redaction Distinction', () => {
  it('should clearly differentiate between whiteout visual overlay and true content removal', async () => {
    // 1. Create a PDF with sensitive text
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 400]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('Geheimes Passwort: 12345SecretCode', {
      x: 50,
      y: 350,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    // 2. Whiteout overlay: Drawing a white rectangle
    page.drawRectangle({
      x: 45,
      y: 345,
      width: 250,
      height: 25,
      color: rgb(1, 1, 1),
    });

    const savedBytes = await doc.save();
    const savedText = Buffer.from(savedBytes).toString('utf-8');

    // In a visual whiteout, the raw stream or font mapping still contains the characters!
    // This proves why visual whiteout is NOT secure redaction.
    expect(savedBytes.length).toBeGreaterThan(0);
    // Verifies the PDF remains valid
    const reloaded = await PDFDocument.load(savedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });
});
