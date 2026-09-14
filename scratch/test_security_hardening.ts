import assert from 'assert';
import JSZip from 'jszip';
import { sanitizeFilename, validateUploadedFile } from '../src/server/security/fileValidator';
import { safeLoadZip, ZipBombError } from '../src/server/security/safeArchive';
import { rateLimiter } from '../src/server/security/rateLimiter';
import { privacyLog } from '../src/server/utils/privacyLogger';
import { generateSignedDownloadUrl, verifySignedDownloadToken } from '../src/server/security/signedUrl';

console.log('====================================================');
console.log('   COOLWAVE FULL SECURITY HARDENING AUDIT SUITE     ');
console.log('====================================================\n');

async function runSecurityAudit() {
  // -------------------------------------------------------------------------
  // 1. Filename Sanitization & Path Traversal Guards
  // -------------------------------------------------------------------------
  console.log('[Test 1] Testing Filename Sanitization & Traversal Prevention...');
  const traversal1 = '../../../../etc/passwd';
  const sanitized1 = sanitizeFilename(traversal1);
  assert.strictEqual(sanitized1, 'passwd', 'Directory traversal "../" must be completely stripped');

  const windowsTraversal = '..\\..\\Windows\\System32\\calc.exe';
  const sanitized2 = sanitizeFilename(windowsTraversal);
  assert.strictEqual(sanitized2, 'calc.exe', 'Windows directory traversal "..\\" must be stripped');

  const nullByte = 'safe_document.pdf\x00.exe';
  const sanitized3 = sanitizeFilename(nullByte);
  assert.ok(!sanitized3.includes('\x00'), 'Null bytes must be eliminated');

  const umlauts = 'Rechnung_März_2026_Großhändler.pdf';
  const sanitizedUmlauts = sanitizeFilename(umlauts);
  assert.strictEqual(sanitizedUmlauts, umlauts, 'German umlauts must be preserved');
  console.log('✓ Filename sanitization & path traversal prevention verified!');

  // -------------------------------------------------------------------------
  // 2. File Validation, Anti-Spoofing & Malicious Executable Detection
  // -------------------------------------------------------------------------
  console.log('\n[Test 2] Testing File Validation & Anti-Spoofing Engine...');

  // A. Legitimate PDF
  const validPdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const validPdfRes = validateUploadedFile(validPdfBuffer, 'test.pdf', 'application/pdf');
  assert.strictEqual(validPdfRes.valid, true);
  assert.strictEqual(validPdfRes.detectedFormat, 'pdf');

  // B. Spoofed Executable (MZ DOS header named invoice.pdf)
  const fakePdfMzBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
  const fakePdfRes = validateUploadedFile(fakePdfMzBuffer, 'invoice.pdf', 'application/pdf');
  assert.strictEqual(fakePdfRes.valid, false, 'MZ executable disguised as PDF must be rejected');
  assert.strictEqual(fakePdfRes.code, 'MALICIOUS_EXECUTABLE_DETECTED');

  // C. Spoofed Executable (ELF Linux binary named report.docx)
  const fakeDocxElfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]); // \x7fELF
  const fakeDocxRes = validateUploadedFile(fakeDocxElfBuffer, 'report.docx');
  assert.strictEqual(fakeDocxRes.valid, false, 'ELF binary disguised as DOCX must be rejected');
  assert.strictEqual(fakeDocxRes.code, 'MALICIOUS_EXECUTABLE_DETECTED');

  // D. Extension Spoofing (Plain text named photo.png)
  const fakePngBuffer = Buffer.from('Hello world this is not a png file');
  const fakePngRes = validateUploadedFile(fakePngBuffer, 'photo.png', 'image/png');
  assert.strictEqual(fakePngRes.valid, false, 'Invalid PNG magic bytes must be rejected');
  assert.strictEqual(fakePngRes.code, 'SPOOFED_PNG');

  // E. Disallowed Executable Extension
  const exeBuffer = Buffer.from('MZdummy');
  const exeRes = validateUploadedFile(exeBuffer, 'malware.exe');
  assert.strictEqual(exeRes.valid, false, 'Direct executable extension must be rejected');

  // F. Empty file
  const emptyRes = validateUploadedFile(Buffer.alloc(0), 'empty.pdf');
  assert.strictEqual(emptyRes.valid, false, 'Zero-byte upload must be rejected');

  console.log('✓ Anti-spoofing engine verified: Disguised binaries, wrong magic bytes & spoofed extensions blocked!');

  // -------------------------------------------------------------------------
  // 3. Zip Bomb & Decompression Defense
  // -------------------------------------------------------------------------
  console.log('\n[Test 3] Testing Zip Bomb & Archive Decompression Guards...');

  // A. Safe normal zip
  const normalZip = new JSZip();
  normalZip.file('document.xml', '<document>Safe content</document>');
  const normalZipBuf = await normalZip.generateAsync({ type: 'nodebuffer' });
  const safeZip = await safeLoadZip(normalZipBuf);
  assert.ok(safeZip.file('document.xml'), 'Normal zip must load cleanly');

  // B. Path traversal entry inside zip
  const maliciousZip = new JSZip();
  maliciousZip.file('../../etc/passwd', 'root:x:0:0:root:/root:/bin/bash');
  const maliciousZipBuf = await maliciousZip.generateAsync({ type: 'nodebuffer' });

  let zipTraversalCaught = false;
  try {
    await safeLoadZip(maliciousZipBuf);
  } catch (err: any) {
    if (err instanceof ZipBombError && err.message.includes('Pfad-Traversal-Sequenz')) {
      zipTraversalCaught = true;
    }
  }
  assert.strictEqual(zipTraversalCaught, true, 'ZIP containing path traversal entry must be rejected');

  // C. Excessive entry count
  const entryCountZip = new JSZip();
  for (let i = 0; i < 20; i++) {
    entryCountZip.file(`file_${i}.txt`, 'a');
  }
  const entryCountBuf = await entryCountZip.generateAsync({ type: 'nodebuffer' });

  let entryLimitCaught = false;
  try {
    await safeLoadZip(entryCountBuf, { maxEntries: 10 });
  } catch (err: any) {
    if (err instanceof ZipBombError && err.message.includes('zu viele Einträge')) {
      entryLimitCaught = true;
    }
  }
  assert.strictEqual(entryLimitCaught, true, 'ZIP exceeding entry count limit must be rejected');

  console.log('✓ Archive security verified: Zip bombs and traversal entries blocked!');

  // -------------------------------------------------------------------------
  // 4. Rate Limiting & DoS Protection
  // -------------------------------------------------------------------------
  console.log('\n[Test 4] Testing Sliding-Window Rate Limiting...');
  const testIp = '198.51.100.99';
  rateLimiter.reset(testIp);

  // Free user limit for 'job' is 30 req/min
  for (let i = 0; i < 30; i++) {
    const res = rateLimiter.check(testIp, 'job', false);
    assert.strictEqual(res.allowed, true, `Request ${i + 1} within limit should be allowed`);
  }

  // 31st request should be blocked
  const blockedRes = rateLimiter.check(testIp, 'job', false);
  assert.strictEqual(blockedRes.allowed, false, '31st request must trigger rate limit 429');
  assert.ok(blockedRes.resetSeconds > 0, 'Retry-After seconds must be positive');

  // Pro user should have higher allowance (150)
  const proIp = '198.51.100.100';
  rateLimiter.reset(proIp);
  for (let i = 0; i < 35; i++) {
    const res = rateLimiter.check(proIp, 'job', true);
    assert.strictEqual(res.allowed, true, 'Pro user should have higher limit');
  }

  console.log('✓ Rate limiter verified: Enforces limits per IP and distinguishes Free vs Pro tiers!');

  // -------------------------------------------------------------------------
  // 5. Password & Secret Leakage Prevention
  // -------------------------------------------------------------------------
  console.log('\n[Test 5] Testing Password & Secret Redaction in Logging...');
  let interceptedError = '';
  const originalError = console.error;
  console.error = (msg: string) => {
    interceptedError = msg;
  };

  privacyLog('error', 'Processing failed', {
    userPassword: 'UserSecretPassword99!',
    pdfPassword: 'OwnerSecretPassword88!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    safeInfo: 'job_12345',
  });

  console.error = originalError;

  assert.ok(!interceptedError.includes('UserSecretPassword99!'), 'User password must NEVER appear in logs');
  assert.ok(!interceptedError.includes('OwnerSecretPassword88!'), 'PDF owner password must NEVER appear in logs');
  assert.ok(!interceptedError.includes('eyJhbGci'), 'Auth tokens must NEVER appear in logs');
  assert.ok(interceptedError.includes('[REDACTED]'), 'Secrets must be replaced with [REDACTED]');
  assert.ok(interceptedError.includes('job_12345'), 'Non-sensitive metadata must be preserved');

  console.log('✓ Password confidentiality confirmed: Passwords and tokens are completely redacted!');

  // -------------------------------------------------------------------------
  // 6. Signed Download URLs & Anti-Tampering
  // -------------------------------------------------------------------------
  console.log('\n[Test 6] Testing Signed Download URL Tamper Resistance...');
  const jobId = 'job_secure_98765';
  const exp = Date.now() + 60000;
  const signed = generateSignedDownloadUrl(jobId, exp);

  const token = signed.match(/token=([a-f0-9]+)/)![1];
  const validCheck = verifySignedDownloadToken(jobId, token, String(exp));
  assert.strictEqual(validCheck.valid, true);

  // Tampered token
  const badToken = token.replace(/^[a-f0-9]{4}/, 'ffff');
  const badCheck = verifySignedDownloadToken(jobId, badToken, String(exp));
  assert.strictEqual(badCheck.valid, false, 'Forged signature must be rejected');

  console.log('✓ Signed download URLs verified: HMAC-SHA256 tokens resist tampering and forgery!');

  console.log('\n====================================================');
  console.log('   ALL SECURITY HARDENING TESTS PASSED (100%)       ');
  console.log('====================================================');
}

runSecurityAudit().catch((err) => {
  console.error('Security audit failed:', err);
  process.exit(1);
});
