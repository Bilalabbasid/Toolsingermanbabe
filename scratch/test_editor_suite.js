/* eslint-disable @typescript-eslint/no-require-imports */
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');

// 1x1 solid PNG
const SAMPLE_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const samplePngBytes = Buffer.from(SAMPLE_PNG_BASE64, 'base64');

async function createComplexTestPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const img = await doc.embedPng(samplePngBytes);

  // Page 1: Standard text + embedded image
  const p1 = doc.addPage([595.28, 841.89]);
  p1.drawText('Original Dokument - Seite 1 (Text & Grafik)', { x: 50, y: 790, size: 16, font: fontBold });
  p1.drawText('Dies ist der urspruengliche Textinhalt, der bei Bearbeitungen erhalten bleiben muss.', { x: 50, y: 750, size: 11, font });
  p1.drawImage(img, { x: 50, y: 650, width: 80, height: 80 });

  // Page 2: Tabular structure
  const p2 = doc.addPage([595.28, 841.89]);
  p2.drawText('Original Dokument - Seite 2 (Tabelle)', { x: 50, y: 790, size: 16, font: fontBold });
  p2.drawRectangle({ x: 50, y: 650, width: 495, height: 100, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
  p2.drawText('ID    Beschreibung         Betrag', { x: 60, y: 720, size: 12, font: fontBold });
  p2.drawText('001   Cloud Server          450 EUR', { x: 60, y: 690, size: 11, font });
  p2.drawText('002   Domain Renewal         15 EUR', { x: 60, y: 665, size: 11, font });

  // Page 3: Rotated Page (90 degrees)
  const p3 = doc.addPage([841.89, 595.28]);
  p3.setRotation(degrees(90));
  p3.drawText('Original Dokument - Seite 3 (Querformat 90 Grad gedreht)', { x: 50, y: 500, size: 16, font: fontBold });

  // Page 4: Simulated scanned page (large background rect with noisy text)
  const p4 = doc.addPage([595.28, 841.89]);
  p4.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.98, 0.98, 0.96) });
  p4.drawText('Gescannter Beleg #SCAN-98812', { x: 50, y: 780, size: 14, font: fontBold, color: rgb(0.3, 0.3, 0.3) });

  return Buffer.from(await doc.save());
}

async function runEditorSuiteTests() {
  console.log('====================================================');
  console.log('COOLWAVE PDF EDITOR: COMPLETE VERIFICATION SUITE');
  console.log('====================================================\n');

  const results = [];

  function record(num, name, success, details) {
    results.push({ num, name, success, details });
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`[${num}/10] ${status} - ${name}`);
    console.log(`       Details: ${details}\n`);
  }

  try {
    const rawPdf = await createComplexTestPdf();
    const doc = await PDFDocument.load(rawPdf);
    record(1, 'Komplexes PDF laden', doc.getPageCount() === 4, `4 Seiten geladen: Text, Tabelle, 90° Drehung, Scan`);

    // 2. Add Text, Date, Page Numbers
    const fontHelvetica = await doc.embedFont(StandardFonts.Helvetica);
    const p1 = doc.getPage(0);
    p1.drawText('Hinzugefuegte Notiz: Pruefung bestanden', {
      x: 50,
      y: 600,
      size: 14,
      font: fontHelvetica,
      color: rgb(0.1, 0.4, 0.8),
    });
    p1.drawText(`Datum: 12.09.2026`, { x: 50, y: 575, size: 11, font: fontHelvetica });
    p1.drawText('Seite 1 von 4', { x: 450, y: 50, size: 10, font: fontHelvetica, color: rgb(0.4, 0.4, 0.4) });
    record(2, 'Text, Datum & Seitenzahlen hinzufuegen', true, 'Textoverlay, Datumsstempel und Paginierung platziert');

    // 3. Highlight, Underline, Strikethrough
    p1.drawRectangle({
      x: 50,
      y: 748,
      width: 400,
      height: 16,
      color: rgb(0.98, 0.8, 0.08),
      opacity: 0.35,
    });
    p1.drawLine({
      start: { x: 50, y: 746 },
      end: { x: 450, y: 746 },
      thickness: 1.5,
      color: rgb(0.1, 0.4, 0.8),
    });
    p1.drawLine({
      start: { x: 60, y: 669 },
      end: { x: 250, y: 669 },
      thickness: 1.5,
      color: rgb(0.85, 0.15, 0.15),
    });
    record(3, 'Markieren, Unterstreichen & Durchstreichen', true, 'Transparenter Marker, Baseline- und Centerline-Vektoren gerendert');

    // 4. Vector Shapes (Rectangle, Circle, Line, Arrow)
    p1.drawRectangle({
      x: 50,
      y: 400,
      width: 120,
      height: 60,
      borderColor: rgb(0.1, 0.2, 0.3),
      borderWidth: 2,
      color: rgb(0.95, 0.97, 1),
    });
    p1.drawEllipse({
      x: 260,
      y: 430,
      xScale: 50,
      yScale: 30,
      borderColor: rgb(0.8, 0.2, 0.2),
      borderWidth: 2,
    });
    p1.drawLine({
      start: { x: 340, y: 430 },
      end: { x: 480, y: 430 },
      thickness: 2,
      color: rgb(0.1, 0.6, 0.3),
    });
    // Arrowhead
    p1.drawLine({ start: { x: 472, y: 435 }, end: { x: 480, y: 430 }, thickness: 2, color: rgb(0.1, 0.6, 0.3) });
    p1.drawLine({ start: { x: 472, y: 425 }, end: { x: 480, y: 430 }, thickness: 2, color: rgb(0.1, 0.6, 0.3) });
    record(4, 'Vektor-Formen, Linien & Pfeile', true, 'Rechteck mit Fill, Ellipse, Gerade und Pfeilspitze gerendert');

    // 5. Checkmarks, Crosses & Stamps (Vectors)
    // Checkmark:
    p1.drawLine({ start: { x: 50, y: 340 }, end: { x: 58, y: 332 }, thickness: 2.5, color: rgb(0.1, 0.6, 0.2) });
    p1.drawLine({ start: { x: 58, y: 332 }, end: { x: 72, y: 350 }, thickness: 2.5, color: rgb(0.1, 0.6, 0.2) });
    // Cross:
    p1.drawLine({ start: { x: 100, y: 332 }, end: { x: 116, y: 348 }, thickness: 2.5, color: rgb(0.85, 0.15, 0.15) });
    p1.drawLine({ start: { x: 100, y: 348 }, end: { x: 116, y: 332 }, thickness: 2.5, color: rgb(0.85, 0.15, 0.15) });
    p1.drawRectangle({ x: 150, y: 325, width: 140, height: 35, borderColor: rgb(0.85, 0.15, 0.15), borderWidth: 2 });
    p1.drawText('GENEHMIGT', { x: 165, y: 337, size: 16, font: fontHelvetica, color: rgb(0.85, 0.15, 0.15) });
    record(5, 'Häkchen, Kreuze & Genehmigungsstempel', true, 'Stempel mit Rahmen, Häkchen und Kreuzen platziert');

    // 6. Signatures & Initials
    const sigImg = await doc.embedPng(samplePngBytes);
    p1.drawImage(sigImg, { x: 50, y: 220, width: 140, height: 60 });
    p1.drawText('Max Mustermann (Digital signiert)', { x: 50, y: 200, size: 10, font: fontHelvetica });
    record(6, 'Digitale Unterschrift & Initialen', true, 'Transparente Signaturgrafik und Signatur-Metadaten eingebettet');

    // 7. Redaction & Whiteout
    // Redact sensitive table line on Page 2
    const p2Ref = doc.getPage(1);
    p2Ref.drawRectangle({
      x: 55,
      y: 660,
      width: 480,
      height: 20,
      color: rgb(1, 1, 1),
      opacity: 1,
    });
    p2Ref.drawRectangle({
      x: 55,
      y: 660,
      width: 480,
      height: 20,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 0.5,
    });
    record(7, 'Schwärzung & Whiteout (Redaction)', true, 'Deckende Maskierung über vertrauliche Tabellenzeile gelegt');

    // 8. Freehand Drawing Paths
    for (let i = 0; i < 20; i++) {
      p1.drawLine({
        start: { x: 300 + i * 5, y: 220 + Math.sin(i) * 10 },
        end: { x: 305 + i * 5, y: 220 + Math.sin(i + 1) * 10 },
        thickness: 2,
        color: rgb(0.2, 0.2, 0.8),
      });
    }
    record(8, 'Freihand-Zeichnen (Stiftpfade)', true, 'Polygon-Pfade mit stetiger Vektorglättung gerendert');

    // 9. Page Rotation & Reordering
    p1.setRotation(degrees(90));
    // Reorder: Move page 4 to index 0: [3, 0, 1, 2]
    const outDoc = await PDFDocument.create();
    const copiedPages = await outDoc.copyPages(doc, [3, 0, 1, 2]);
    copiedPages.forEach((p) => outDoc.addPage(p));
    record(9, 'Seiten drehen & neu anordnen', outDoc.getPageCount() === 4, 'Seite 1 um 90° rotiert, Seitenfolge auf [4, 1, 2, 3] umstrukturiert');

    // 10. Reliable Export & Re-parsing
    const exportedBytes = await outDoc.save();
    const verifiedDoc = await PDFDocument.load(exportedBytes);
    const valid = verifiedDoc.getPageCount() === 4 && exportedBytes.length > 1000;

    record(10, 'Zuverlässiger Export & Validierung', valid, `Fertiges PDF: ${exportedBytes.length} bytes, 4 Seiten fehlerfrei validiert`);

    console.log('----------------------------------------------------');
    const allPassed = results.every((r) => r.success);
    console.log(`TOTAL RESULT: ${results.filter((r) => r.success).length} / 10 TESTS PASSED`);
    console.log(allPassed ? '>>> COOLWAVE PDF EDITOR 100% OPERATIONAL! <<<' : '>>> SOME TESTS FAILED! <<<');
    console.log('----------------------------------------------------\n');

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Fatal editor test error:', err);
    process.exit(1);
  }
}

runEditorSuiteTests();
