/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { PDFDocument, rgb } = require('pdf-lib');
const ExcelJS = require('exceljs');
const { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell } = require('docx');
const PptxGenJS = require('pptxgenjs');

// Helper to create a test PDF
async function createTestPdf() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('CoolWave Document Test');

  // Page 1: Headings and Paragraphs
  const p1 = pdfDoc.addPage([595.28, 841.89]);
  p1.drawText('CoolWave Document Conversion Test', { x: 50, y: 790, size: 20, color: rgb(0.1, 0.2, 0.4) });
  p1.drawText('Dies ist ein strukturierter Absatz mit Textfluss und Formatierung.', { x: 50, y: 750, size: 12 });
  p1.drawText('https://coolwave.cool - Offizielle Dokument-Plattform', { x: 50, y: 720, size: 11, color: rgb(0.1, 0.4, 0.8) });

  // Page 2: Table-like data
  const p2 = pdfDoc.addPage([595.28, 841.89]);
  p2.drawText('Monatsbericht 2026 - Finanzdaten', { x: 50, y: 790, size: 16, color: rgb(0.1, 0.2, 0.4) });
  p2.drawText('Monat       Umsatz      Gewinn      Kunden', { x: 50, y: 740, size: 12 });
  p2.drawText('Januar      125000      45000       1200', { x: 50, y: 715, size: 12 });
  p2.drawText('Februar     142000      52000       1380', { x: 50, y: 690, size: 12 });
  p2.drawText('Maerz       168000      64000       1590', { x: 50, y: 665, size: 12 });

  return Buffer.from(await pdfDoc.save());
}

// Helper to create a test DOCX
async function createTestDocx() {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Vertragsentwurf 2026', bold: true, size: 32 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Dies ist ein vollständiger Test-Absatz für DOCX zu PDF Konvertierung.' })],
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Spalte 1')] }),
                  new TableCell({ children: [new Paragraph('Spalte 2')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Wert A')] }),
                  new TableCell({ children: [new Paragraph('Wert B')] }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// Helper to create a test XLSX
async function createTestXlsx() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Finanzen 2026');
  ws.columns = [
    { header: 'Kategorie', key: 'kat', width: 20 },
    { header: 'Betrag (EUR)', key: 'betrag', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ];
  ws.addRow({ kat: 'Softwarelizenzen', betrag: 4500, status: 'Genehmigt' });
  ws.addRow({ kat: 'Serverinfrastruktur', betrag: 1200, status: 'Bezahlt' });
  ws.addRow({ kat: 'Marketingkampagne', betrag: 3400, status: 'In Bearbeitung' });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// Helper to create a test PPTX
async function createTestPptx() {
  const pptx = new PptxGenJS();
  const slide1 = pptx.addSlide();
  slide1.addText('Unternehmensstrategie 2026', { x: 1, y: 1, fontSize: 24, bold: true });
  slide1.addText('CoolWave Cloud Services', { x: 1, y: 2, fontSize: 16 });

  const slide2 = pptx.addSlide();
  slide2.addText('Wachstumsziele Q1-Q4', { x: 1, y: 1, fontSize: 20, bold: true });
  slide2.addText('Marktanteil +35% • Kundenzufriedenheit 99.4% • 100% DSGVO-konform', { x: 1, y: 2, fontSize: 14 });

  return await pptx.write({ outputType: 'nodebuffer' });
}

// Helper to create a test ODT (Zip containing content.xml)
async function createTestOdt() {
  const zip = new JSZip();
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text');
  zip.file(
    'content.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
    <office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
      <office:body>
        <office:text>
          <text:h text:outline-level="1">OpenDocument Testdokument</text:h>
          <text:p>Erstellt mit LibreOffice Writer fuer CoolWave Konvertierungstests.</text:p>
          <text:p>Absatz 2 mit weiteren vertraulichen Projektinformationen.</text:p>
        </office:text>
      </office:body>
    </office:document-content>`
  );
  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function runDocSuiteTests() {
  console.log('===========================================================');
  console.log('COOLWAVE DOCUMENT CONVERSION ECOSYSTEM: 11 CONVERSION TESTS');
  console.log('===========================================================\n');

  const { OfficeConversionEngine } = require('../src/server/services/adapters/OfficeConversionEngine.ts');
  const results = [];

  function record(num, name, passed, details) {
    results.push({ num, name, passed, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${num}/11] ${status} - ${name}`);
    console.log(`       Details: ${details}\n`);
  }

  // 1. PDF → DOCX
  try {
    const pdfBuf = await createTestPdf();
    const res = await OfficeConversionEngine.pdfToDocx(pdfBuf, 'test_sample.pdf', () => {});
    const zip = await JSZip.loadAsync(res.data);
    const hasDocXml = zip.file('word/document.xml') !== null;
    record(1, 'PDF → DOCX (pdf-in-word-umwandeln)', hasDocXml && res.fileName.endsWith('.docx'), `Output: ${res.fileName} (${res.data.length} bytes), Word XML verified: ${hasDocXml}`);
  } catch (err) {
    record(1, 'PDF → DOCX', false, err.message);
  }

  // 2. DOCX → PDF
  try {
    const docxBuf = await createTestDocx();
    const res = await OfficeConversionEngine.docxToPdf(docxBuf, 'vertrag.docx', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(2, 'DOCX → PDF (word-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Pages: ${pdf.getPageCount()}`);
  } catch (err) {
    record(2, 'DOCX → PDF', false, err.message);
  }

  // 3. PDF → XLSX
  try {
    const pdfBuf = await createTestPdf();
    const res = await OfficeConversionEngine.pdfToXlsx(pdfBuf, 'finanzbericht.pdf', () => {});
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.data);
    const sheetCount = wb.worksheets.length;
    record(3, 'PDF → XLSX (pdf-in-excel-umwandeln)', sheetCount >= 1 && res.fileName.endsWith('.xlsx'), `Output: ${res.fileName} (${res.data.length} bytes), Worksheets: ${sheetCount}`);
  } catch (err) {
    record(3, 'PDF → XLSX', false, err.message);
  }

  // 4. XLSX → PDF
  try {
    const xlsxBuf = await createTestXlsx();
    const res = await OfficeConversionEngine.xlsxToPdf(xlsxBuf, 'tabelle.xlsx', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(4, 'XLSX → PDF (excel-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Landscape Pages: ${pdf.getPageCount()}`);
  } catch (err) {
    record(4, 'XLSX → PDF', false, err.message);
  }

  // 5. PDF → PPTX
  try {
    const pdfBuf = await createTestPdf();
    const res = await OfficeConversionEngine.pdfToPptx(pdfBuf, 'presentation.pdf', () => {});
    const zip = await JSZip.loadAsync(res.data);
    const hasPptXml = zip.file('ppt/presentation.xml') !== null;
    record(5, 'PDF → PPTX (pdf-in-powerpoint-umwandeln)', hasPptXml && res.fileName.endsWith('.pptx'), `Output: ${res.fileName} (${res.data.length} bytes), Presentation XML verified: ${hasPptXml}`);
  } catch (err) {
    record(5, 'PDF → PPTX', false, err.message);
  }

  // 6. PPTX → PDF
  try {
    const pptxBuf = await createTestPptx();
    const res = await OfficeConversionEngine.pptxToPdf(pptxBuf, 'slides.pptx', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(6, 'PPTX → PDF (powerpoint-in-pdf-umwandeln)', pdf.getPageCount() === 2 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Slide Pages: ${pdf.getPageCount()}`);
  } catch (err) {
    record(6, 'PPTX → PDF', false, err.message);
  }

  // 7. DOC → PDF (Legacy Word)
  try {
    // Binary DOC CFBF structure
    const cfbfHeader = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
    const bodyText = Buffer.from('Historischer Vertrag 2002. Alle Paragrafen sind verbindlich unterzeichnet. CoolWave Archiv.', 'latin1');
    const docBuf = Buffer.concat([cfbfHeader, bodyText]);

    const res = await OfficeConversionEngine.docToPdf(docBuf, 'altes_dokument.doc', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(7, 'DOC → PDF (doc-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Text extracted from CFBF stream`);
  } catch (err) {
    record(7, 'DOC → PDF', false, err.message);
  }

  // 8. ODT → PDF (OpenDocument)
  try {
    const odtBuf = await createTestOdt();
    const res = await OfficeConversionEngine.odtToPdf(odtBuf, 'writer_dok.odt', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(8, 'ODT → PDF (odt-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), OpenOffice XML parsed to PDF`);
  } catch (err) {
    record(8, 'ODT → PDF', false, err.message);
  }

  // 9. RTF → PDF
  try {
    const rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Calibri;}} \\f0\\fs24 \\b Rich Text Dokument\\b0\\par Dies ist ein formatierter \\i RTF-Testabsatz\\i0 mit Aufzaehlungen.\\par}';
    const rtfBuf = Buffer.from(rtfContent, 'utf-8');
    const res = await OfficeConversionEngine.rtfToPdf(rtfBuf, 'notizen.rtf', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(9, 'RTF → PDF (rtf-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), RTF control words styled in PDF`);
  } catch (err) {
    record(9, 'RTF → PDF', false, err.message);
  }

  // 10. TXT → PDF
  try {
    const txtContent = 'CoolWave Logdatei & Protokoll 2026\n\nZeile 1: Systemstart erfolgreich.\nZeile 2: Konvertierungs-Worker aktiv.\nZeile 3: 100% DSGVO-konforme Datenbereinigung abgeschlossen.\n';
    const txtBuf = Buffer.from(txtContent, 'utf-8');
    const res = await OfficeConversionEngine.txtToPdf(txtBuf, 'system_log.txt', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(10, 'TXT → PDF (txt-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Monospace paginated PDF`);
  } catch (err) {
    record(10, 'TXT → PDF', false, err.message);
  }

  // 11. HTML → PDF
  try {
    const htmlContent = `<!DOCTYPE html>
    <html>
      <head><title>Rechnung CoolWave Pro</title></head>
      <body>
        <h1>Rechnung #2026-0912</h1>
        <p>Vielen Dank fuer Ihre Nutzung von CoolWave Enterprise.</p>
        <ul>
          <li>PDF Suite unbegrenzt</li>
          <li>Office Konvertierungen priorisiert</li>
          <li>Dedizierte Queue</li>
        </ul>
      </body>
    </html>`;
    const htmlBuf = Buffer.from(htmlContent, 'utf-8');
    const res = await OfficeConversionEngine.htmlToPdf(htmlBuf, 'rechnung.html', () => {});
    const pdf = await PDFDocument.load(res.data);
    record(11, 'HTML → PDF (html-in-pdf-umwandeln)', pdf.getPageCount() >= 1 && res.fileName.endsWith('.pdf'), `Output: ${res.fileName} (${res.data.length} bytes), Semantic HTML parsed to PDF`);
  } catch (err) {
    record(11, 'HTML → PDF', false, err.message);
  }

  console.log('-----------------------------------------------------------');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TOTAL RESULT: ${passedCount} / 11 CONVERSION TESTS PASSED`);
  console.log(passedCount === 11 ? '>>> ALL 11 DOCUMENT CONVERSIONS OPERATIONAL! <<<' : '>>> SOME TESTS FAILED! <<<');
  console.log('-----------------------------------------------------------\n');

  process.exit(passedCount === 11 ? 0 : 1);
}

runDocSuiteTests();
