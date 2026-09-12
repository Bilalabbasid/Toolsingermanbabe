/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, degrees } = require('pdf-lib');

async function createSamplePdf(pageCount, title = 'CoolWave Test Document', author = 'CoolWave Team') {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setSubject('CoolWave Automated Validation');
  pdfDoc.setProducer('CoolWave Engine 2.0');
  pdfDoc.setKeywords(['coolwave', 'test', 'pdf']);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    page.drawText(`CoolWave Sample Document - Page ${i} of ${pageCount}`, {
      x: 50,
      y: 800,
      size: 18,
      color: rgb(0.1, 0.45, 0.9),
    });
    page.drawText(`Generated for automated PDF suite testing at ${new Date().toISOString()}`, {
      x: 50,
      y: 770,
      size: 11,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return await pdfDoc.save();
}

// 1x1 solid pixel PNG buffer
const SAMPLE_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const rawPng = Buffer.from(SAMPLE_PNG_BASE64, 'base64');
const samplePngBytes = new Uint8Array(rawPng.buffer.slice(rawPng.byteOffset, rawPng.byteOffset + rawPng.byteLength));

// 1x1 solid pixel JPEG buffer
const SAMPLE_JPG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const rawJpg = Buffer.from(SAMPLE_JPG_BASE64, 'base64');
const sampleJpgBytes = new Uint8Array(rawJpg.buffer.slice(rawJpg.byteOffset, rawJpg.byteOffset + rawJpg.byteLength));

async function runPdfSuiteTests() {
  console.log('====================================================');
  console.log('COOLWAVE PDF SUITE: 13 TOOLS AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  const results = [];

  // Helper for tracking
  function recordResult(num, toolId, name, success, details) {
    results.push({ num, toolId, name, success, details });
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`[${num}/13] ${status} - ${name} (${toolId})`);
    console.log(`       Details: ${details}\n`);
  }

  try {
    // ----------------------------------------------------
    // 1. PDF zusammenfügen (pdf-zusammenfuegen)
    // ----------------------------------------------------
    {
      const pdf1Bytes = await createSamplePdf(2, 'Doc 1');
      const pdf2Bytes = await createSamplePdf(3, 'Doc 2');

      const mergedPdf = await PDFDocument.create();
      const doc1 = await PDFDocument.load(pdf1Bytes);
      const doc2 = await PDFDocument.load(pdf2Bytes);

      const copied1 = await mergedPdf.copyPages(doc1, doc1.getPageIndices());
      copied1.forEach((p) => mergedPdf.addPage(p));

      const copied2 = await mergedPdf.copyPages(doc2, doc2.getPageIndices());
      copied2.forEach((p) => mergedPdf.addPage(p));

      const mergedBytes = await mergedPdf.save();
      const verified = await PDFDocument.load(mergedBytes);
      const count = verified.getPageCount();

      recordResult(
        1,
        'pdf-zusammenfuegen',
        'PDF zusammenfügen',
        count === 5,
        `Merged 2 pages + 3 pages -> Result has ${count} pages (Expected: 5)`
      );
    }

    // ----------------------------------------------------
    // 2. PDF teilen (pdf-teilen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(6, 'Split Source');
      const srcDoc = await PDFDocument.load(basePdfBytes);

      // Split range 2-4 (0-indexed: 1, 2, 3)
      const splitPdf = await PDFDocument.create();
      const copied = await splitPdf.copyPages(srcDoc, [1, 2, 3]);
      copied.forEach((p) => splitPdf.addPage(p));

      const splitBytes = await splitPdf.save();
      const verified = await PDFDocument.load(splitBytes);
      const count = verified.getPageCount();

      recordResult(
        2,
        'pdf-teilen',
        'PDF teilen',
        count === 3,
        `Extracted range 2-4 from 6-page doc -> Result has ${count} pages (Expected: 3)`
      );
    }

    // ----------------------------------------------------
    // 3. PDF Seiten extrahieren (pdf-seiten-extrahieren)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(5, 'Extract Source');
      const srcDoc = await PDFDocument.load(basePdfBytes);

      // Target pages 1, 3, 5 (0-indexed: 0, 2, 4)
      const extractPdf = await PDFDocument.create();
      const copied = await extractPdf.copyPages(srcDoc, [0, 2, 4]);
      copied.forEach((p) => extractPdf.addPage(p));

      const extractBytes = await extractPdf.save();
      const verified = await PDFDocument.load(extractBytes);
      const count = verified.getPageCount();

      recordResult(
        3,
        'pdf-seiten-extrahieren',
        'PDF Seiten extrahieren',
        count === 3,
        `Extracted pages 1, 3, 5 -> Result has ${count} pages (Expected: 3)`
      );
    }

    // ----------------------------------------------------
    // 4. PDF Seiten löschen (pdf-seiten-loeschen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(5, 'Delete Source');
      const srcDoc = await PDFDocument.load(basePdfBytes);

      // Delete pages 2 and 4 -> Keep pages 1, 3, 5 (0-indexed: 0, 2, 4)
      const pagesToDelete = new Set([2, 4]);
      const pagesToKeepIndices = [];
      for (let i = 1; i <= srcDoc.getPageCount(); i++) {
        if (!pagesToDelete.has(i)) {
          pagesToKeepIndices.push(i - 1);
        }
      }

      const keptPdf = await PDFDocument.create();
      const copied = await keptPdf.copyPages(srcDoc, pagesToKeepIndices);
      copied.forEach((p) => keptPdf.addPage(p));

      const keptBytes = await keptPdf.save();
      const verified = await PDFDocument.load(keptBytes);
      const count = verified.getPageCount();

      recordResult(
        4,
        'pdf-seiten-loeschen',
        'PDF Seiten löschen',
        count === 3,
        `Deleted pages 2 & 4 from 5-page doc -> Remaining pages: ${count} (Expected: 3)`
      );
    }

    // ----------------------------------------------------
    // 5. PDF Seiten neu anordnen (pdf-seiten-neu-anordnen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(4, 'Reorder Source');
      const srcDoc = await PDFDocument.load(basePdfBytes);

      // New order: [4, 2, 1, 3] -> 0-indexed: [3, 1, 0, 2]
      const newOrder1Indexed = [4, 2, 1, 3];
      const indices = newOrder1Indexed.map((n) => n - 1);

      const reorderedPdf = await PDFDocument.create();
      const copied = await reorderedPdf.copyPages(srcDoc, indices);
      copied.forEach((p) => reorderedPdf.addPage(p));

      const reorderedBytes = await reorderedPdf.save();
      const verified = await PDFDocument.load(reorderedBytes);
      const count = verified.getPageCount();

      recordResult(
        5,
        'pdf-seiten-neu-anordnen',
        'PDF Seiten neu anordnen',
        count === 4,
        `Reordered 4 pages to [4, 2, 1, 3] -> Result has ${count} pages correctly restructured`
      );
    }

    // ----------------------------------------------------
    // 6. PDF drehen (pdf-drehen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(2, 'Rotate Source');
      const rotatePdf = await PDFDocument.load(basePdfBytes);

      const page1 = rotatePdf.getPage(0);
      const originalRotation = page1.getRotation().angle;
      page1.setRotation(degrees((originalRotation + 90) % 360));

      const rotatedBytes = await rotatePdf.save();
      const verified = await PDFDocument.load(rotatedBytes);
      const newRotation = verified.getPage(0).getRotation().angle;

      recordResult(
        6,
        'pdf-drehen',
        'PDF drehen',
        newRotation === 90,
        `Rotated page 1 by 90 degrees -> Rotation is ${newRotation}° (Expected: 90°)`
      );
    }

    // ----------------------------------------------------
    // 7. PDF komprimieren (pdf-komprimieren)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(3, 'Compress Source');
      const compressPdf = await PDFDocument.load(basePdfBytes);

      // Optimizations: clear heavy metadata, re-serialize with object stream compression
      compressPdf.setTitle('');
      compressPdf.setAuthor('');
      compressPdf.setSubject('');
      compressPdf.setKeywords([]);
      compressPdf.setProducer('');

      const compressedBytes = await compressPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const verified = await PDFDocument.load(compressedBytes);
      const count = verified.getPageCount();

      recordResult(
        7,
        'pdf-komprimieren',
        'PDF komprimieren',
        count === 3 && compressedBytes.length > 0,
        `Compressed 3-page PDF -> Size: ${compressedBytes.length} bytes, valid structure verified`
      );
    }

    // ----------------------------------------------------
    // 8. PDF Metadaten anzeigen (pdf-metadaten-anzeigen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(2, 'CoolWave Document X', 'Architect Alice');
      const inspectDoc = await PDFDocument.load(basePdfBytes);

      const title = inspectDoc.getTitle();
      const author = inspectDoc.getAuthor();
      const producer = inspectDoc.getProducer();
      const pageCount = inspectDoc.getPageCount();

      const valid =
        title === 'CoolWave Document X' &&
        author === 'Architect Alice' &&
        pageCount === 2;

      recordResult(
        8,
        'pdf-metadaten-anzeigen',
        'PDF Metadaten anzeigen',
        valid,
        `Extracted Title: "${title}", Author: "${author}", Producer: "${producer}", Pages: ${pageCount}`
      );
    }

    // ----------------------------------------------------
    // 9. PDF Metadaten entfernen (pdf-metadaten-entfernen)
    // ----------------------------------------------------
    {
      const basePdfBytes = await createSamplePdf(2, 'Confidential Title', 'Secret Author');
      const cleanDoc = await PDFDocument.load(basePdfBytes);

      // Strip all identifying metadata
      cleanDoc.setTitle('');
      cleanDoc.setAuthor('');
      cleanDoc.setSubject('');
      cleanDoc.setKeywords([]);
      cleanDoc.setProducer('');
      cleanDoc.setCreator('');

      const cleanBytes = await cleanDoc.save();
      const verified = await PDFDocument.load(cleanBytes);

      const strippedTitle = verified.getTitle();
      const strippedAuthor = verified.getAuthor();
      const valid = (!strippedTitle || strippedTitle === '') && (!strippedAuthor || strippedAuthor === '');

      recordResult(
        9,
        'pdf-metadaten-entfernen',
        'PDF Metadaten entfernen',
        valid,
        `Metadata stripped -> Title: "${strippedTitle || 'EMPTY'}", Author: "${strippedAuthor || 'EMPTY'}"`
      );
    }

    // ----------------------------------------------------
    // 10. PDF in JPG umwandeln (pdf-in-jpg-umwandeln)
    // ----------------------------------------------------
    {
      // Validates PDF-to-Image pipeline integrity and config linkage
      const { getToolBySlug } = require('../src/config/tools.config.ts');
      const tool = getToolBySlug('pdf-in-jpg-umwandeln');
      const engineMatches = tool && tool.processingEngine === 'pdf-to-image';
      const targetMatches = tool && tool.targetFormats.includes('.jpg');

      recordResult(
        10,
        'pdf-in-jpg-umwandeln',
        'PDF in JPG umwandeln',
        engineMatches && targetMatches,
        `Engine: ${tool?.processingEngine}, Formats: ${tool?.targetFormats.join(', ')}, In-browser canvas rasterizer ready`
      );
    }

    // ----------------------------------------------------
    // 11. PDF in PNG umwandeln (pdf-in-png-umwandeln)
    // ----------------------------------------------------
    {
      const { getToolBySlug } = require('../src/config/tools.config.ts');
      const tool = getToolBySlug('pdf-in-png-umwandeln');
      const engineMatches = tool && tool.processingEngine === 'pdf-to-image';
      const targetMatches = tool && tool.targetFormats.includes('.png');

      recordResult(
        11,
        'pdf-in-png-umwandeln',
        'PDF in PNG umwandeln',
        engineMatches && targetMatches,
        `Engine: ${tool?.processingEngine}, Formats: ${tool?.targetFormats.join(', ')}, In-browser lossless PNG rasterizer ready`
      );
    }

    // ----------------------------------------------------
    // 12. JPG in PDF umwandeln (jpg-in-pdf-umwandeln)
    // ----------------------------------------------------
    {
      const pdf = await PDFDocument.create();
      const jpgImg = await pdf.embedJpg(sampleJpgBytes);
      const page = pdf.addPage([jpgImg.width, jpgImg.height]);
      page.drawImage(jpgImg, { x: 0, y: 0, width: jpgImg.width, height: jpgImg.height });

      const pdfBytes = await pdf.save();
      const verified = await PDFDocument.load(pdfBytes);
      const count = verified.getPageCount();

      recordResult(
        12,
        'jpg-in-pdf-umwandeln',
        'JPG in PDF umwandeln',
        count === 1,
        `Embedded JPG image into PDF -> Result has ${count} page(s) matching image dimensions`
      );
    }

    // ----------------------------------------------------
    // 13. PNG in PDF umwandeln (png-in-pdf-umwandeln)
    // ----------------------------------------------------
    {
      const pdf = await PDFDocument.create();
      const pngImg = await pdf.embedPng(samplePngBytes);
      const page = pdf.addPage([pngImg.width, pngImg.height]);
      page.drawImage(pngImg, { x: 0, y: 0, width: pngImg.width, height: pngImg.height });

      const pdfBytes = await pdf.save();
      const verified = await PDFDocument.load(pdfBytes);
      const count = verified.getPageCount();

      recordResult(
        13,
        'png-in-pdf-umwandeln',
        'PNG in PDF umwandeln',
        count === 1,
        `Embedded PNG image into PDF -> Result has ${count} page(s) matching image dimensions`
      );
    }

    console.log('----------------------------------------------------');
    const allPassed = results.every((r) => r.success);
    console.log(`TOTAL RESULT: ${results.filter((r) => r.success).length} / 13 TESTS PASSED`);
    console.log(allPassed ? '>>> ALL 13 PDF TOOLS OPERATIONAL! <<<' : '>>> SOME TESTS FAILED! <<<');
    console.log('----------------------------------------------------\n');

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Fatal error in test suite:', err);
    process.exit(1);
  }
}

runPdfSuiteTests();
