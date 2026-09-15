const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');
const ExcelJS = require('exceljs');
const PptxGenJS = require('pptxgenjs');
const sharp = require('sharp');

async function main() {
  const dir = path.join(__dirname);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. sample.txt
  fs.writeFileSync(path.join(dir, 'sample.txt'), 'CoolWave Testdokument\nDies ist ein sicheres Testdokument für die Werkzeug-Verifikation.\nZeile 3 mit deutschem Text: ÄÖÜäöüß.\n');

  // 2. sample.csv
  fs.writeFileSync(path.join(dir, 'sample.csv'), 'ID,Name,Kategorie,Preis,Status\n1,PDF Werkzeug,PDF,0.00,Aktiv\n2,Bild Konverter,Bild,0.00,Aktiv\n3,Dokument Wandler,Office,0.00,Aktiv\n');

  // 3. sample.json
  fs.writeFileSync(path.join(dir, 'sample.json'), JSON.stringify({
    title: 'CoolWave JSON Fixture',
    version: '1.0.0',
    items: [
      { id: 1, name: 'PDF Split', active: true },
      { id: 2, name: 'PDF Merge', active: true }
    ]
  }, null, 2));

  // 4. sample.svg
  fs.writeFileSync(path.join(dir, 'sample.svg'), '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#0284c7"/><circle cx="100" cy="100" r="50" fill="#ffffff"/><text x="100" y="105" font-family="Arial" font-size="14" fill="#0284c7" text-anchor="middle">CoolWave</text></svg>');

  // 5. sample.png (200x200 RGBA)
  await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: { r: 2, g: 132, b: 199, alpha: 1 }
    }
  }).png().toFile(path.join(dir, 'sample.png'));

  // 6. sample.jpg (200x200 RGB)
  await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: { r: 2, g: 132, b: 199 }
    }
  }).jpeg({ quality: 90 }).toFile(path.join(dir, 'sample.jpg'));

  // 7. sample.webp (200x200)
  await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: { r: 2, g: 132, b: 199, alpha: 1 }
    }
  }).webp().toFile(path.join(dir, 'sample.webp'));

  // 8. sample.pdf (2 pages with text, headings)
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Page 1
  const page1 = pdfDoc.addPage([595, 842]);
  page1.drawText('CoolWave PDF Testdokument - Seite 1', { x: 50, y: 780, size: 18, font, color: rgb(0.01, 0.52, 0.78) });
  page1.drawText('Dies ist die erste Seite des Testdokuments für automatisierte Verifikation.', { x: 50, y: 740, size: 12, font: regularFont });
  page1.drawText('Testabsatz: Vertrauliche Information 12345 zum Schwärzen.', { x: 50, y: 710, size: 12, font: regularFont });

  // Page 2
  const page2 = pdfDoc.addPage([595, 842]);
  page2.drawText('CoolWave PDF Testdokument - Seite 2', { x: 50, y: 780, size: 18, font, color: rgb(0.01, 0.52, 0.78) });
  page2.drawText('Dies ist die zweite Seite zum Testen von Reorder, Split und Extraktion.', { x: 50, y: 740, size: 12, font: regularFont });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(dir, 'sample.pdf'), Buffer.from(pdfBytes));

  // 9. sample.docx
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'CoolWave DOCX Testdokument',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Dies ist ein ' }),
            new TextRun({ text: 'formatierter Absatz mit fetter Schrift', bold: true }),
            new TextRun({ text: ' und einer Tabelle.' }),
          ],
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('Spalte A')] }),
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('Spalte B')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('Wert 1')] }),
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('Wert 2')] }),
              ],
            }),
          ],
        }),
      ],
    }],
  });
  const docxBuffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(dir, 'sample.docx'), docxBuffer);

  // 10. sample.xlsx
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('CoolWave Daten');
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Werkzeug', key: 'tool', width: 30 },
    { header: 'Format', key: 'format', width: 15 },
    { header: 'Kosten', key: 'cost', width: 10 },
  ];
  worksheet.addRow({ id: 1, tool: 'PDF zu Word', format: 'DOCX', cost: 0 });
  worksheet.addRow({ id: 2, tool: 'Excel zu PDF', format: 'PDF', cost: 0 });
  worksheet.addRow({ id: 3, tool: 'Bild zu PDF', format: 'PDF', cost: 0 });
  const xlsxBuffer = await workbook.xlsx.writeBuffer();
  fs.writeFileSync(path.join(dir, 'sample.xlsx'), Buffer.from(xlsxBuffer));

  // 11. sample.pptx
  const pptx = new PptxGenJS();
  const slide1 = pptx.addSlide();
  slide1.addText('CoolWave PPTX Präsentation', { x: 1, y: 1, fontSize: 24, bold: true, color: '0284c7' });
  slide1.addText('Folie 1: Automatische Konvertierungs-Verifikation', { x: 1, y: 2, fontSize: 14, color: '333333' });
  const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(path.join(dir, 'sample.pptx'), pptxBuffer);

  console.log('Successfully generated all fixtures in:', dir);
}

main().catch(err => {
  console.error('Failed to generate fixtures:', err);
  process.exit(1);
});
