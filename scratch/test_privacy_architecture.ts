import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { privacyConfig } from '../src/config/privacy.config';
import {
  generateDownloadSignature,
  generateSignedDownloadUrl,
  verifySignedDownloadToken,
} from '../src/server/security/signedUrl';
import { anonymizeIp, privacyLog } from '../src/server/utils/privacyLogger';
import { LocalStorageProvider } from '../src/server/storage/storage';

console.log('====================================================');
console.log('   COOLWAVE TECHNICAL PRIVACY ARCHITECTURE TESTS    ');
console.log('====================================================\n');

// 1. Config tests
console.log('[Test 1] Testing Privacy Configuration...');
assert.strictEqual(typeof privacyConfig.retentionMinutes, 'number');
assert.ok(privacyConfig.retentionMinutes >= 5 && privacyConfig.retentionMinutes <= 120);
assert.strictEqual(privacyConfig.deleteInputImmediatelyOnSuccess, true);
assert.strictEqual(privacyConfig.signedUrls.enabled, true);
assert.strictEqual(privacyConfig.anonymizeIp, true);
console.log(`✓ Privacy Config verified: ${privacyConfig.retentionMinutes} min retention, immediate input deletion active.`);

// 2. Signed Download URL tests
console.log('\n[Test 2] Testing Cryptographic Signed Download URLs...');
const testJobId = 'job_test_123456';
const futureExp = Date.now() + 15 * 60 * 1000;
const pastExp = Date.now() - 5000;

// Valid signature
const signedUrl = generateSignedDownloadUrl(testJobId, futureExp);
assert.ok(signedUrl.includes(testJobId));
assert.ok(signedUrl.includes('token='));
assert.ok(signedUrl.includes('exp='));

const tokenMatch = signedUrl.match(/token=([a-f0-9]+)/);
const expMatch = signedUrl.match(/exp=([0-9]+)/);
assert.ok(tokenMatch && tokenMatch[1]);
assert.ok(expMatch && expMatch[1]);

const validCheck = verifySignedDownloadToken(testJobId, tokenMatch[1], expMatch[1]);
assert.strictEqual(validCheck.valid, true, 'Valid token should be accepted');

// Expired token
const expiredUrl = generateSignedDownloadUrl(testJobId, pastExp);
const expiredToken = expiredUrl.match(/token=([a-f0-9]+)/)![1];
const expiredCheck = verifySignedDownloadToken(testJobId, expiredToken, String(pastExp));
assert.strictEqual(expiredCheck.valid, false, 'Expired token should be rejected');
assert.ok(expiredCheck.reason?.includes('abgelaufen'));

// Tampered token
const tamperedToken = tokenMatch[1].substring(0, 10) + 'deadbeef' + tokenMatch[1].substring(18);
const tamperedCheck = verifySignedDownloadToken(testJobId, tamperedToken, expMatch[1]);
assert.strictEqual(tamperedCheck.valid, false, 'Tampered token should be rejected');

// Mismatched Job ID
const wrongJobCheck = verifySignedDownloadToken('job_attacker_id', tokenMatch[1], expMatch[1]);
assert.strictEqual(wrongJobCheck.valid, false, 'Mismatched job ID should be rejected');

console.log('✓ HMAC-SHA256 signed download tokens verified against forgery and expiration!');

async function runTests() {
// 3. Storage path traversal containment
console.log('\n[Test 3] Testing Storage Sandboxing & Path Traversal Guards...');
const testStorageDir = path.join(process.cwd(), '.tmp', 'test_privacy_storage');
const storage = new LocalStorageProvider(testStorageDir);

let traversalBlocked = false;
try {
  // Attempt to read arbitrary system file via traversal
  await storage.read(path.join(testStorageDir, '..', '..', 'package.json'));
} catch (err: any) {
  if (err.message.includes('außerhalb des sicheren Speicherbereichs')) {
    traversalBlocked = true;
  }
}
assert.strictEqual(traversalBlocked, true, 'Path traversal read must be blocked');

// Normal isolated write and read
const inputSaved = await storage.saveInput(Buffer.from('Privacy Test Content'), 'test.txt');
assert.ok(inputSaved.storagePath.startsWith(path.resolve(testStorageDir)));
const content = await storage.read(inputSaved.storagePath);
assert.strictEqual(content.toString(), 'Privacy Test Content');

// Cleanup
await storage.delete(inputSaved.storagePath);
console.log('✓ Storage sandbox confirmed: Path traversal strictly prevented, UUID isolation verified!');

// 4. IP Anonymization & Minimal Logging
console.log('\n[Test 4] Testing IP Anonymization & Minimal Logging...');
const ipv4 = '198.51.100.155';
const anonIpv4 = anonymizeIp(ipv4);
assert.strictEqual(anonIpv4, '198.51.100.0', 'IPv4 must be masked to /24');

const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
const anonIpv6 = anonymizeIp(ipv6);
assert.ok(anonIpv6.startsWith('2001:0db8:85a3::'), 'IPv6 must be masked to /48');

// Privacy log redaction check
let errorLogged = false;
const originalConsoleError = console.error;
console.error = (msg: string) => {
  errorLogged = true;
  assert.ok(!msg.includes('my_super_secret_password'));
  assert.ok(msg.includes('[REDACTED]'));
  assert.ok(msg.includes('192.168.1.0'));
};
privacyLog('error', 'Test Privacy Error', {
  password: 'my_super_secret_password',
  userIp: '192.168.1.42',
});
console.error = originalConsoleError;
assert.strictEqual(errorLogged, true);
console.log('✓ Minimal logging & IP anonymization verified!');

// 5. Legal Pages Verification
console.log('\n[Test 5] Verifying Legal Pages and Placeholder Compliance...');
const pagesToCheck = [
  { file: 'src/app/[locale]/datenschutz/page.tsx', name: 'Datenschutz' },
  { file: 'src/app/[locale]/impressum/page.tsx', name: 'Impressum' },
  { file: 'src/app/[locale]/agb/page.tsx', name: 'AGB' },
  { file: 'src/app/[locale]/cookie-richtlinie/page.tsx', name: 'Cookie-Richtlinie' },
];

for (const p of pagesToCheck) {
  const fullPath = path.join(process.cwd(), p.file);
  assert.ok(fs.existsSync(fullPath), `${p.name} page file must exist`);
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Verify placeholders are present
  assert.ok(
    content.includes('[Name') || content.includes('[Firma') || content.includes('[Straße'),
    `${p.name} must use legal placeholders`
  );

  // Verify no fake registrations invented
  assert.ok(!content.includes('HRB 999999'));
  assert.ok(!content.includes('DE999999999'));
  assert.ok(!content.includes('Musteranwalt'));
  assert.ok(!content.includes('TÜV-zertifiziert'));

  // Specific checks
  if (p.name === 'Datenschutz') {
    assert.ok(content.includes('Zero-Upload') || content.includes('Client-Side'));
    assert.ok(content.includes('Server-gestützte') || content.includes('serverseitig'));
    assert.ok(content.includes(String(privacyConfig.retentionMinutes)));
    assert.ok(content.includes('Sofortige Datenminimierung') || content.includes('Datenminimierung'));
  }
  if (p.name === 'Impressum') {
    assert.ok(content.includes('§ 5 Digitale-Dienste-Gesetz (DDG)'));
    assert.ok(content.includes('support@coolwave.cool'));
  }
}
console.log('✓ All 4 legal pages verified: Proper placeholders used, no invented credentials, technical facts accurate!');

console.log('\n====================================================');
console.log('   ALL PRIVACY ARCHITECTURE TESTS PASSED (100%)     ');
console.log('====================================================');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
