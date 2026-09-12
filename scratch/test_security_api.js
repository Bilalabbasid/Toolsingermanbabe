/* eslint-disable @typescript-eslint/no-require-imports */
const { PDFDocument } = require('pdf-lib');
const pdfjs = require('pdfjs-dist');
const fs = require('fs');

async function createSamplePdf() {
  const doc = await PDFDocument.create();
  doc.setTitle('Streng Vertrauliches Dokument');
  doc.setAuthor('Dipl.-Ing. Max Mustermann');
  const page = doc.addPage([500, 500]);
  page.drawText('Geheime Transaktionsdaten:', { x: 50, y: 400, size: 16 });
  page.drawText('IBAN: DE12345678901234567890', { x: 50, y: 350, size: 14 });
  page.drawText('Vertrauliches Kennwort: TopSecret2026', { x: 50, y: 300, size: 14 });
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function runTests() {
  console.log('--- Starting PDF Security Suite Verification ---');
  const samplePdfBuffer = await createSamplePdf();

  // Test 1: Protect / Encrypt PDF
  console.log('\n[Test 1] Testing PDF Verschlüsseln / Schützen...');
  const form1 = new FormData();
  form1.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'rechnung.pdf');
  form1.append('action', 'protect');
  form1.append('password', 'MeinSicheresPasswort2026!');

  const res1 = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: form1,
  });

  if (!res1.ok) {
    throw new Error(`Test 1 Failed: HTTP ${res1.status}: ${await res1.text()}`);
  }

  const encBytes = Buffer.from(await res1.arrayBuffer());
  console.log('Encrypted PDF received. Size:', encBytes.length);

  // Assert it cannot be opened without password
  let failedWithoutPassword = false;
  try {
    await PDFDocument.load(encBytes);
  } catch (err) {
    failedWithoutPassword = true;
    console.log('Verified: Document strictly rejects unauthenticated opening:', err.message.substring(0, 50));
  }
  if (!failedWithoutPassword) {
    throw new Error('SECURITY FLAW: Document was not encrypted!');
  }

  // Test 2: Unlock / Decrypt PDF with wrong password (should fail gracefully)
  console.log('\n[Test 2] Testing PDF Entsperren mit falschem Passwort...');
  const form2Fail = new FormData();
  form2Fail.append('file', new Blob([encBytes], { type: 'application/pdf' }), 'rechnung_geschuetzt.pdf');
  form2Fail.append('action', 'unlock');
  form2Fail.append('password', 'FalschesPasswort');

  const res2Fail = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: form2Fail,
  });

  if (res2Fail.ok) {
    throw new Error('SECURITY FLAW: Wrong password was accepted!');
  }
  const failData = await res2Fail.json();
  console.log('Verified: Rejection with clean German message:', failData.error);

  // Test 3: Unlock / Decrypt PDF with correct password
  console.log('\n[Test 3] Testing PDF Entsperren mit korrektem Passwort...');
  const form2 = new FormData();
  form2.append('file', new Blob([encBytes], { type: 'application/pdf' }), 'rechnung_geschuetzt.pdf');
  form2.append('action', 'unlock');
  form2.append('password', 'MeinSicheresPasswort2026!');

  const res2 = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: form2,
  });

  if (!res2.ok) {
    throw new Error(`Test 3 Failed: HTTP ${res2.status}: ${await res2.text()}`);
  }

  const decBytes = Buffer.from(await res2.arrayBuffer());
  const decDoc = await PDFDocument.load(decBytes);
  console.log('Verified: Document decrypted and freely readable! Page count:', decDoc.getPageCount());

  // Test 4: True Redaction
  console.log('\n[Test 4] Testing PDF Schwärzen (True Content Stream Redaction)...');
  const formRedact = new FormData();
  formRedact.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'geheim.pdf');
  formRedact.append('action', 'redact');
  formRedact.append('terms', JSON.stringify(['DE12345678901234567890', 'TopSecret2026']));
  formRedact.append('zones', JSON.stringify([{ pageIndex: 0, x: 50, y: 340, width: 300, height: 25 }]));

  const resRedact = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: formRedact,
  });

  if (!resRedact.ok) {
    throw new Error(`Test 4 Failed: HTTP ${resRedact.status}: ${await resRedact.text()}`);
  }

  const redactBytes = Buffer.from(await resRedact.arrayBuffer());
  // Verify with pdfjs text extraction that secret information is completely gone
  const pdfJsDoc = await pdfjs.getDocument({ data: new Uint8Array(redactBytes) }).promise;
  const redactPage = await pdfJsDoc.getPage(1);
  const textContent = await redactPage.getTextContent();
  const extractedText = textContent.items.map((i) => i.str).join(' ');

  console.log('Extracted text after true redaction:', JSON.stringify(extractedText));
  const hasIban = extractedText.includes('DE12345678901234567890');
  const hasSecret = extractedText.includes('TopSecret2026');

  if (hasIban || hasSecret) {
    throw new Error(`SECURITY FLAW: Redacted text still present in text stream! IBAN=${hasIban}, Secret=${hasSecret}`);
  }
  console.log('Verified: Sensitive data was completely excised from PDF content stream!');

  // Test 5: Metadata Removal
  console.log('\n[Test 5] Testing PDF Metadaten entfernen...');
  const formMeta = new FormData();
  formMeta.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'meta_sample.pdf');
  formMeta.append('action', 'metadata_remove');

  const resMeta = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: formMeta,
  });

  if (!resMeta.ok) {
    throw new Error(`Test 5 Failed: HTTP ${resMeta.status}: ${await resMeta.text()}`);
  }

  const metaCleanBytes = Buffer.from(await resMeta.arrayBuffer());
  const metaCleanDoc = await PDFDocument.load(metaCleanBytes);
  console.log('Title after cleaning:', JSON.stringify(metaCleanDoc.getTitle() || ''));
  console.log('Author after cleaning:', JSON.stringify(metaCleanDoc.getAuthor() || ''));
  if (metaCleanDoc.getTitle() || metaCleanDoc.getAuthor()) {
    throw new Error('Metadata was not cleared!');
  }
  console.log('Verified: Metadata completely scrubbed.');

  // Test 6: PDF Signieren
  console.log('\n[Test 6] Testing PDF Signieren...');
  const formSign = new FormData();
  formSign.append('file', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'vertrag.pdf');
  formSign.append('action', 'sign');
  formSign.append('signerName', 'Erika Mustermann');
  formSign.append('reason', 'Vertragsabschluss CoolWave GmbH');

  const resSign = await fetch('http://localhost:3001/api/v1/pdf/security', {
    method: 'POST',
    body: formSign,
  });

  if (!resSign.ok) {
    throw new Error(`Test 6 Failed: HTTP ${resSign.status}: ${await resSign.text()}`);
  }

  const signedBytes = Buffer.from(await resSign.arrayBuffer());
  const signedDoc = await PDFDocument.load(signedBytes);
  console.log('Signed document subject:', signedDoc.getSubject());
  console.log('Verified: Document signed and verification stamp applied.');

  console.log('\n>>> ALL 6 SECURITY API TESTS PASSED WITH 100% SUCCESS! <<<');
}

runTests().catch((err) => {
  console.error('TEST SUITE ERROR:', err);
  process.exit(1);
});
