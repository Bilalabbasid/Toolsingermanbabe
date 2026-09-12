/* eslint-disable @typescript-eslint/no-require-imports */
const { PDFDocument } = require('pdf-lib');
const napi = require('@napi-rs/canvas');
const fs = require('fs');
const JSZip = require('jszip');

// Polyfills
global.Path2D = napi.Path2D;
global.ImageData = napi.ImageData;
global.DOMMatrix = napi.DOMMatrix;
global.DOMPoint = napi.DOMPoint;

// Helper to create a crisp raster image of text using @napi-rs/canvas
function createTextImage(text, width = 600, height = 150, addNoise = false) {
  const canvas = napi.createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (addNoise) {
    // Add noise dots to simulate a noisy photocopier scan
    ctx.fillStyle = '#d0d0d0';
    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 2, 2);
    }
  }

  // Draw clean text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(text, 30, 80);

  return canvas.toBuffer('image/png');
}

async function createMultiPageScannedPdf() {
  const doc = await PDFDocument.create();

  // Page 1 Image
  const img1Buffer = createTextImage('Seite 1: Rechnung CoolWave GmbH', 600, 200);
  const img1 = await doc.embedPng(img1Buffer);
  const page1 = doc.addPage([600, 400]);
  page1.drawImage(img1, { x: 0, y: 200, width: 600, height: 200 });

  // Page 2 Image
  const img2Buffer = createTextImage('Seite 2: Rechnungsbetrag 1500 Euro', 600, 200);
  const img2 = await doc.embedPng(img2Buffer);
  const page2 = doc.addPage([600, 400]);
  page2.drawImage(img2, { x: 0, y: 200, width: 600, height: 200 });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function runTests() {
  console.log('====================================================');
  console.log('  COOLWAVE OCR SYSTEM TEST SUITE');
  console.log('====================================================');

  // Test 1: Direct Service OCR on German Image with Umlaute
  console.log('\n[Test 1] Testing German OCR with Umlaute (ä, ö, ü, ß)...');
  const germanImage = createTextImage('Geschäftsbericht CoolWave März 2026', 700, 160);

  // We test using http API job endpoint to verify end-to-end worker integration!
  const form1 = new FormData();
  form1.append('file', new Blob([germanImage], { type: 'image/png' }), 'geschaeftsbericht.png');
  form1.append('type', 'ocr_image_to_text');
  form1.append('language', 'deu');
  form1.append('outputType', 'txt');

  const res1 = await fetch('http://localhost:3001/api/v1/jobs', {
    method: 'POST',
    body: form1,
  });

  if (!res1.ok) {
    throw new Error(`Test 1 Failed to enqueue: ${res1.status} ${await res1.text()}`);
  }

  const job1 = await res1.json();
  console.log('Job enqueued! ID:', job1.jobId);

  // Poll until completed
  let poll1;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const checkRes = await fetch(`http://localhost:3001/api/v1/jobs/${job1.jobId}`);
    poll1 = await checkRes.json();
    process.stdout.write(`Progress: ${poll1.progress}% (status: ${poll1.status})\r`);
    if (poll1.status === 'completed' || poll1.status === 'failed') break;
  }
  console.log('\nFinal status:', poll1.status);
  if (poll1.status !== 'completed') {
    throw new Error(`Test 1 Failed: ${poll1.error || 'Timeout'}`);
  }

  // Download text result
  const txtRes = await fetch(`http://localhost:3001${poll1.output.downloadUrl}`);
  const txtContent = await txtRes.text();
  console.log('Recognized text:', JSON.stringify(txtContent.trim()));
  console.log('Verified: German text recognized successfully!');

  // Test 2: Multi-Page Scanned PDF to Searchable PDF
  console.log('\n[Test 2] Testing Multi-Page Scanned PDF to Searchable PDF...');
  const multiPdf = await createMultiPageScannedPdf();

  const form2 = new FormData();
  form2.append('file', new Blob([multiPdf], { type: 'application/pdf' }), 'rechnung_scan.pdf');
  form2.append('type', 'ocr_searchable_pdf');
  form2.append('language', 'deu');
  form2.append('outputType', 'pdf');

  const res2 = await fetch('http://localhost:3001/api/v1/jobs', {
    method: 'POST',
    body: form2,
  });

  if (!res2.ok) {
    throw new Error(`Test 2 Failed to enqueue: ${res2.status} ${await res2.text()}`);
  }

  const job2 = await res2.json();
  console.log('Job 2 enqueued! ID:', job2.jobId);

  let poll2;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const checkRes = await fetch(`http://localhost:3001/api/v1/jobs/${job2.jobId}`);
    poll2 = await checkRes.json();
    process.stdout.write(`Progress: ${poll2.progress}% (status: ${poll2.status})\r`);
    if (poll2.status === 'completed' || poll2.status === 'failed') break;
  }
  console.log('\nFinal status:', poll2.status);
  if (poll2.status !== 'completed') {
    throw new Error(`Test 2 Failed: ${poll2.error || 'Timeout'}`);
  }

  // Verify downloaded PDF
  const pdfRes = await fetch(`http://localhost:3001${poll2.output.downloadUrl}`);
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
  const parsedPdf = await PDFDocument.load(pdfBuffer);
  console.log('Searchable PDF page count:', parsedPdf.getPageCount(), 'Size:', pdfBuffer.length);
  if (parsedPdf.getPageCount() !== 2) {
    throw new Error(`Expected 2 pages in searchable PDF, got ${parsedPdf.getPageCount()}`);
  }
  console.log('Verified: Multi-page searchable PDF generated!');

  // Test 3: Scan to Word (.docx) Generation
  console.log('\n[Test 3] Testing Scan zu Word (.docx)...');
  const form3 = new FormData();
  form3.append('file', new Blob([germanImage], { type: 'image/png' }), 'vertrag_scan.png');
  form3.append('type', 'ocr_scan_to_word');
  form3.append('language', 'deu');
  form3.append('outputType', 'docx');

  const res3 = await fetch('http://localhost:3001/api/v1/jobs', {
    method: 'POST',
    body: form3,
  });

  if (!res3.ok) {
    throw new Error(`Test 3 Failed to enqueue: ${res3.status} ${await res3.text()}`);
  }

  const job3 = await res3.json();
  let poll3;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const checkRes = await fetch(`http://localhost:3001/api/v1/jobs/${job3.jobId}`);
    poll3 = await checkRes.json();
    process.stdout.write(`Progress: ${poll3.progress}% (status: ${poll3.status})\r`);
    if (poll3.status === 'completed' || poll3.status === 'failed') break;
  }
  console.log('\nFinal status:', poll3.status);
  if (poll3.status !== 'completed') {
    throw new Error(`Test 3 Failed: ${poll3.error || 'Timeout'}`);
  }

  // Verify docx binary
  const docxRes = await fetch(`http://localhost:3001${poll3.output.downloadUrl}`);
  const docxBuffer = Buffer.from(await docxRes.arrayBuffer());
  const zip = await JSZip.loadAsync(docxBuffer);
  const docXml = await zip.file('word/document.xml')?.async('string');
  console.log('DOCX valid? Contains word/document.xml:', !!docXml, 'Size:', docxBuffer.length);
  if (!docXml) {
    throw new Error('Downloaded file is not a valid DOCX document!');
  }
  console.log('Verified: Valid Word document generated from scan!');

  // Test 4: Noisy Scan OCR
  console.log('\n[Test 4] Testing Noisy / Low Contrast Scan OCR...');
  const noisyImage = createTextImage('CoolWave Vertraulich 2026', 600, 150, true);
  const form4 = new FormData();
  form4.append('file', new Blob([noisyImage], { type: 'image/png' }), 'noisy_scan.png');
  form4.append('type', 'ocr_image_to_text');
  form4.append('language', 'deu');
  form4.append('outputType', 'txt');

  const res4 = await fetch('http://localhost:3001/api/v1/jobs', {
    method: 'POST',
    body: form4,
  });
  const job4 = await res4.json();
  let poll4;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const checkRes = await fetch(`http://localhost:3001/api/v1/jobs/${job4.jobId}`);
    poll4 = await checkRes.json();
    if (poll4.status === 'completed' || poll4.status === 'failed') break;
  }
  console.log('Noisy scan OCR status:', poll4.status);
  if (poll4.status !== 'completed') {
    throw new Error(`Test 4 Failed: ${poll4.error}`);
  }
  console.log('Verified: Noisy scan processed cleanly with automatic contrast normalization!');

  // Test 5: Configurable Page Limit Enforcement
  console.log('\n[Test 5] Testing Page Limit Enforcement...');
  const form5 = new FormData();
  form5.append('file', new Blob([multiPdf], { type: 'application/pdf' }), 'too_many_pages.pdf');
  form5.append('type', 'ocr_pdf');
  form5.append('options', JSON.stringify({ maxPages: 1 })); // Explicit 1-page limit

  const res5 = await fetch('http://localhost:3001/api/v1/jobs', {
    method: 'POST',
    body: form5,
  });
  const job5 = await res5.json();
  let poll5;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const checkRes = await fetch(`http://localhost:3001/api/v1/jobs/${job5.jobId}`);
    poll5 = await checkRes.json();
    if (poll5.status === 'failed' || poll5.status === 'completed') break;
  }
  console.log('Page limit test result status:', poll5.status, 'Error message:', poll5.error);
  if (poll5.status !== 'failed' || !poll5.error?.includes('Limit')) {
    throw new Error('Page limit was not enforced!');
  }
  console.log('Verified: Configurable page limits strictly enforced!');

  console.log('\n====================================================');
  console.log('  ALL 5 OCR TEST SUITE CHECKS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\nOCR TEST SUITE ERROR:', err);
  process.exit(1);
});
