import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PdfService } from '../src/server/services/adapters/PdfService';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- STARTING HIGH-VALUE PDF SUITE TESTS ---');

  const tmpDir = path.join(process.cwd(), 'scratch', 'test_pdf_out');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // 1. Create a dummy base PDF with 2 pages and a form field
  console.log('\n[1] Creating Base Sample PDF with 2 pages...');
  const baseDoc = await PDFDocument.create();
  const font = await baseDoc.embedFont(StandardFonts.Helvetica);

  const page1 = baseDoc.addPage([595.28, 841.89]); // A4
  page1.drawText('Original Document - Page 1\nConfidential Report for CoolWave Q3.', {
    x: 50,
    y: 750,
    size: 16,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Add form field to test flattening
  const form = baseDoc.getForm();
  const textField = form.createTextField('applicant_name');
  textField.setText('Max Mustermann');
  textField.addToPage(page1, { x: 50, y: 650, width: 200, height: 25 });

  const page2 = baseDoc.addPage([595.28, 841.89]);
  page2.drawText('Original Document - Page 2\nFinancial metrics and appendix data.', {
    x: 50,
    y: 750,
    size: 14,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const basePdfBytes = await baseDoc.save();
  const basePdfPath = path.join(tmpDir, 'sample_base.pdf');
  fs.writeFileSync(basePdfPath, basePdfBytes);
  console.log(`Base PDF written (${basePdfBytes.length} bytes) to: ${basePdfPath}`);

  // 2. Test PDF Watermark
  console.log('\n[2] Testing PDF Watermark...');
  const wmDoc = await PDFDocument.load(basePdfBytes);
  const wmFont = await wmDoc.embedFont(StandardFonts.HelveticaBold);
  for (const page of wmDoc.getPages()) {
    page.drawText('VERTRAULICH', {
      x: 150,
      y: 400,
      size: 40,
      font: wmFont,
      color: rgb(0.85, 0.2, 0.2),
      opacity: 0.35,
      rotate: { type: 'degrees' as any, angle: 45 } as any,
    });
  }
  const wmPdfBytes = await wmDoc.save();
  console.log(`Watermarked PDF created (${wmPdfBytes.length} bytes)`);

  // 3. Test PDF Page Numbering & Header/Footer
  console.log('\n[3] Testing PDF Page Numbering & Header/Footer...');
  const numDoc = await PDFDocument.load(basePdfBytes);
  const numFont = await numDoc.embedFont(StandardFonts.Helvetica);
  const total = numDoc.getPageCount();
  numDoc.getPages().forEach((page, idx) => {
    // Header
    page.drawText('CoolWave Vertraulichkeitsbericht', {
      x: 50,
      y: 810,
      size: 9,
      font: numFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    // Footer
    page.drawText(`Seite ${idx + 1} von ${total}`, {
      x: 250,
      y: 25,
      size: 9,
      font: numFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  const numPdfBytes = await numDoc.save();
  console.log(`Numbered PDF created (${numPdfBytes.length} bytes)`);

  // 4. Test Backend PdfService: Flatten
  console.log('\n[4] Testing PdfService Flatten...');
  const pdfService = new PdfService();
  const inputBuffer = fs.readFileSync(basePdfPath);

  const flattenResult = await pdfService.execute(
    inputBuffer,
    'sample_base.pdf',
    { jobType: 'pdf_flatten' } as any,
    () => {}
  );
  console.log(`Flatten Result: ${flattenResult.fileName}, size: ${flattenResult.data.length} bytes`);
  const flatDoc = await PDFDocument.load(flattenResult.data);
  const flatFields = flatDoc.getForm().getFields();
  console.log(`Form field count after flatten: ${flatFields.length} (expected 0)`);
  if (flatFields.length !== 0) throw new Error('Flatten failed to remove form fields');

  // 5. Test Backend PdfService: Optimize & Repair
  console.log('\n[5] Testing PdfService Optimize & Repair...');
  const optResult = await pdfService.execute(
    inputBuffer,
    'sample_base.pdf',
    { jobType: 'pdf_optimize' } as any,
    () => {}
  );
  console.log(`Optimize Result: ${optResult.fileName}, size: ${optResult.data.length} bytes`);

  const repResult = await pdfService.execute(
    inputBuffer,
    'sample_base.pdf',
    { jobType: 'pdf_repair' } as any,
    () => {}
  );
  console.log(`Repair Result: ${repResult.fileName}, size: ${repResult.data.length} bytes`);

  // 6. Test Backend PdfService: PDF/A
  console.log('\n[6] Testing PdfService PDF/A-1b metadata embedding...');
  const pdfaResult = await pdfService.execute(
    inputBuffer,
    'sample_base.pdf',
    { jobType: 'pdf_pdfa' } as any,
    () => {}
  );
  console.log(`PDF/A Result: ${pdfaResult.fileName}, size: ${pdfaResult.data.length} bytes`);
  const pdfaDoc = await PDFDocument.load(pdfaResult.data);
  const subject = pdfaDoc.getSubject();
  console.log(`PDF/A Subject metadata: "${subject}"`);
  if (!subject?.includes('PDF/A-1b')) throw new Error('PDF/A metadata not found in output');

  // 7. Test Backend PdfService: Strip Annotations
  console.log('\n[7] Testing PdfService Strip Annotations...');
  const stripResult = await pdfService.execute(
    inputBuffer,
    'sample_base.pdf',
    { jobType: 'pdf_annotations_remove' } as any,
    () => {}
  );
  console.log(`Strip Annotations Result: ${stripResult.fileName}, size: ${stripResult.data.length} bytes`);

  // 8. Test Semantic PDF Compare logic (word token LCS)
  console.log('\n[8] Testing Semantic Comparison Algorithm...');
  function tokenize(text: string) {
    return text.split(/\s+/).filter(Boolean);
  }
  function computeDiff(text1: string, text2: string) {
    const t1 = tokenize(text1);
    const t2 = tokenize(text2);
    // Simple similarity ratio
    const set1 = new Set(t1);
    const set2 = new Set(t2);
    let common = 0;
    for (const w of t1) {
      if (set2.has(w)) common++;
    }
    const similarity = Math.round((common / Math.max(t1.length, t2.length)) * 100);
    return { wordCount1: t1.length, wordCount2: t2.length, similarity };
  }

  const doc1Text = 'Original Document Page 1 Confidential Report for CoolWave Q3.';
  const doc2Text = 'Original Document Page 1 PUBLIC Report for CoolWave Q4 with revisions.';
  const diffResult = computeDiff(doc1Text, doc2Text);
  console.log(`Diff result: Similarity = ${diffResult.similarity}%, Doc1 words = ${diffResult.wordCount1}, Doc2 words = ${diffResult.wordCount2}`);
  if (diffResult.similarity < 50 || diffResult.similarity > 90) {
    throw new Error('Comparison algorithm unexpected ratio');
  }

  console.log('\n--- ALL HIGH-VALUE PDF SUITE TESTS COMPLETED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
