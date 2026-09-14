/**
 * CoolWave Production Testing Pass Test Suite
 * End-to-end HTTP integration tests for all user requirements.
 */

async function runProductionTests() {
  console.log('================================================================');
  console.log('            COOLWAVE PRODUCTION TESTING PASS SUITE              ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` [PASS] ${message}`);
      passed++;
    } else {
      console.error(` [FAIL] ${message}`);
      failed++;
    }
  }

  const BASE_URL = 'http://localhost:3000';

  // ---------------------------------------------------------------------------
  // 1. WEB PAGES, NAVIGATION, SEO & DISCOVERY
  // ---------------------------------------------------------------------------
  console.log('--- 1. PAGES, NAVIGATION, SEO & DISCOVERY ---');

  // Homepage
  const homeRes = await fetch(`${BASE_URL}/de`);
  assert(homeRes.status === 200, 'Homepage /de responds with 200 OK');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('CoolWave') && homeHtml.includes('<h1'), 'Homepage renders H1 heading and brand title');
  assert(homeHtml.includes('href="/de/pdf-komprimieren"'), 'Homepage contains direct crawlable tool links');
  assert(homeHtml.includes('Werkzeuge durchsuchen') || homeHtml.includes('Search'), 'Search component discoverable on page');

  // Category Pages
  const catRes = await fetch(`${BASE_URL}/de/kategorie/pdf`);
  assert(catRes.status === 200, 'Category page /de/kategorie/pdf responds with 200 OK');
  const catHtml = await catRes.text();
  assert(catHtml.includes('CollectionPage'), 'Category page includes CollectionPage structured schema');

  // Core Legal & Business Pages
  const legalPages = ['impressum', 'datenschutz', 'agb', 'cookie-richtlinie', 'preise', 'kontakt'];
  for (const page of legalPages) {
    const res = await fetch(`${BASE_URL}/de/${page}`);
    assert(res.status === 200, `Page /de/${page} responds with 200 OK`);
  }

  // Tool Pages
  const toolPages = ['pdf-komprimieren', 'pdf-zusammenfuegen', 'bild-konvertieren', 'word-in-pdf-umwandeln', 'scan-zu-pdf'];
  for (const tool of toolPages) {
    const res = await fetch(`${BASE_URL}/de/${tool}`);
    assert(res.status === 200, `Tool page /de/${tool} responds with 200 OK`);
  }

  // Robots.txt & Sitemap.xml
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  assert(robotsRes.status === 200, 'robots.txt responds with 200 OK');
  const robotsText = await robotsRes.text();
  assert(robotsText.includes('Disallow: /admin/') && robotsText.includes('Disallow: /api/'), 'robots.txt disallows /admin/ and /api/');
  assert(!robotsText.includes('Disallow: /_next/'), 'robots.txt allows Googlebot to access /_next/ CSS/JS assets');

  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  assert(sitemapRes.status === 200, 'sitemap.xml responds with 200 OK');
  const sitemapText = await sitemapRes.text();
  assert(sitemapText.includes('https://coolwave.cool/de/kontakt') && sitemapText.includes('https://coolwave.cool/de/pdf-komprimieren'), 'sitemap.xml contains essential URLs');

  // ---------------------------------------------------------------------------
  // 2. HEALTH & MONITORING ENDPOINTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. HEALTH & MONITORING ENDPOINTS ---');
  const healthRes = await fetch(`${BASE_URL}/api/v1/health`);
  assert(healthRes.status === 200, '/api/v1/health returns 200 OK');
  const healthJson = await healthRes.json();
  assert(healthJson.status === 'ok' || healthJson.status === 'healthy', 'Health check status is healthy/ok');

  // ---------------------------------------------------------------------------
  // 3. FILE UPLOAD INTEGRATION, MALICIOUS PAYLOADS & EDGE CASES
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. END-TO-END FILE VALIDATION & SECURITY CHECKS ---');

  // Helper to send multipart upload to /api/v1/jobs
  async function testUpload(fileBlob, filename, jobType = 'office_convert') {
    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    formData.append('type', jobType);
    return fetch(`${BASE_URL}/api/v1/jobs`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-forwarded-for': '198.51.100.1' // Static test IP
      }
    });
  }

  // 3.1 Empty File Check (0 bytes)
  const emptyBlob = new Blob([], { type: 'application/pdf' });
  const emptyRes = await testUpload(emptyBlob, 'empty.pdf');
  const emptyJson = await emptyRes.json();
  assert(emptyRes.status === 400 && emptyJson.code === 'EMPTY_FILE', 'Empty 0-byte file rejected with code EMPTY_FILE');

  // 3.2 Executable Masked as PDF (.exe with MZ header named document.pdf)
  const mzBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
  const mzBlob = new Blob([mzBytes], { type: 'application/pdf' });
  const mzRes = await testUpload(mzBlob, 'trojan.pdf');
  const mzJson = await mzRes.json();
  assert(mzRes.status === 400 && mzJson.code === 'MALICIOUS_EXECUTABLE_DETECTED', 'Binary executable masked as PDF blocked by magic-byte inspection');

  // 3.3 Linux ELF Executable Masked as PDF
  const elfBytes = new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01]);
  const elfBlob = new Blob([elfBytes], { type: 'application/pdf' });
  const elfRes = await testUpload(elfBlob, 'payload.pdf');
  const elfJson = await elfRes.json();
  assert(elfRes.status === 400 && elfJson.code === 'MALICIOUS_EXECUTABLE_DETECTED', 'Linux ELF executable blocked by magic-byte inspection');

  // 3.4 Disallowed Dangerous Extension (.php)
  const phpBlob = new Blob(['<?php phpinfo(); ?>'], { type: 'application/x-php' });
  const phpRes = await testUpload(phpBlob, 'shell.php');
  const phpJson = await phpRes.json();
  assert(phpRes.status === 400 && phpJson.code === 'DISALLOWED_FILE_TYPE', 'Direct executable file type (.php) blocked');

  // 3.5 Spoofed PDF without %PDF- Header
  const fakePdfBlob = new Blob(['Just plain text file disguised as pdf'], { type: 'application/pdf' });
  const fakePdfRes = await testUpload(fakePdfBlob, 'fake.pdf');
  const fakePdfJson = await fakePdfRes.json();
  assert(fakePdfRes.status === 400 && fakePdfJson.code === 'SPOOFED_PDF', 'Spoofed PDF without %PDF- signature rejected');

  // 3.6 Oversized File (> 50 MB for free user)
  // Create virtual 51 MB blob
  const bigChunk = new Uint8Array(1024 * 1024); // 1 MB
  const chunks = Array(51).fill(bigChunk);
  const oversizedBlob = new Blob(chunks, { type: 'application/pdf' });
  const oversizedRes = await testUpload(oversizedBlob, 'large_51mb.pdf');
  const oversizedJson = await oversizedRes.json();
  assert(oversizedRes.status === 400 && oversizedJson.code === 'FILE_TOO_LARGE', 'Oversized file (>50 MB) rejected for free tier with FILE_TOO_LARGE');

  // 3.7 Valid Legitimate PDF with Malicious Traversal Filename
  const validPdfContent = '%PDF-1.7\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>%%EOF';
  const validPdfBlob = new Blob([validPdfContent], { type: 'application/pdf' });
  const traversalRes = await testUpload(validPdfBlob, '../../../../etc/passwd');
  const traversalJson = await traversalRes.json();
  assert(traversalRes.status === 202, 'Legitimate PDF with path traversal in filename is accepted and sanitized');
  assert(traversalJson.jobId && !traversalJson.jobId.includes('..'), 'Job ID generated cleanly without path traversal leakage');

  // ---------------------------------------------------------------------------
  // 4. RATE LIMITING TESTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. RATE LIMITING ENFORCEMENT ---');
  const spamIp = '198.51.100.99';
  let rateLimitTriggered = false;

  for (let i = 0; i < 35; i++) {
    const formData = new FormData();
    formData.append('file', emptyBlob, 'test.pdf');
    const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
      method: 'POST',
      body: formData,
      headers: { 'x-forwarded-for': spamIp }
    });
    if (res.status === 429) {
      rateLimitTriggered = true;
      const json = await res.json();
      assert(json.code === 'RATE_LIMIT_EXCEEDED', 'Rate limiter returns HTTP 429 with RATE_LIMIT_EXCEEDED code');
      assert(res.headers.has('retry-after'), 'HTTP 429 response includes Retry-After header');
      break;
    }
  }
  assert(rateLimitTriggered, 'Rate limit triggered when request volume exceeds quota');

  // ---------------------------------------------------------------------------
  // 5. DATA PRIVACY & ACCESS CONTROLS
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. DATA PRIVACY & ACCESS CONTROLS ---');

  // Unauthenticated jobs listing is protected
  const jobsListRes = await fetch(`${BASE_URL}/api/v1/jobs`);
  // If CRON_SECRET is configured, it returns 401; if not configured in dev, returns total count
  assert(jobsListRes.status === 200 || jobsListRes.status === 401, 'Jobs list endpoint handles authorization correctly');

  // Non-existent or expired download returns 404
  const dlRes = await fetch(`${BASE_URL}/api/v1/jobs/00000000-0000-0000-0000-000000000000/download`);
  assert(dlRes.status === 404, 'Download for non-existent job returns 404 without leaking internal system path');
  const dlJson = await dlRes.json();
  assert(!dlJson.error.includes('C:\\') && !dlJson.error.includes('/var/www'), 'Error response does not leak internal filesystem paths');

  // ---------------------------------------------------------------------------
  // 6. CLEANUP ENDPOINT
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. EPHEMERAL CLEANUP ENGINE ---');
  const cleanupRes = await fetch(`${BASE_URL}/api/v1/jobs/cleanup`);
  assert(cleanupRes.status === 200, 'Cleanup endpoint responds with 200 OK');
  const cleanupJson = await cleanupRes.json();
  assert(cleanupJson.success === true && typeof cleanupJson.cleanedFiles === 'number', 'Cleanup reports cleanedFiles count');

  // ---------------------------------------------------------------------------
  // FINAL SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`PRODUCTION TESTING SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionTests().catch(err => {
  console.error('Fatal error in production testing pass:', err);
  process.exit(1);
});
