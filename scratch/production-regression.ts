import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import JSZip from 'jszip';
import { Document, Packer, Paragraph } from 'docx';
import { LocalStorageProvider } from '../src/server/storage/storage';
import { rateLimiter, getClientIp } from '../src/server/security/rateLimiter';
import { parseOptions, boundedBody, isProRequest } from '../src/server/security/request';
import { generateSignedDownloadUrl, verifySignedDownloadToken } from '../src/server/security/signedUrl';
import { safeLoadZip } from '../src/server/security/safeArchive';

const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const results: { name: string; passed: boolean; error?: string }[] = [];
let cookie = `cw_owner=${crypto.randomBytes(32).toString('hex')}`;
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); results.push({ name, passed: true }); console.log('PASS', name); }
  catch (err) { results.push({ name, passed: false, error: String(err) }); console.error('FAIL', name, String(err)); }
}
async function request(url: string, init: RequestInit = {}) {
  return fetch(base + url, { ...init, headers: { cookie, ...init.headers }, signal: AbortSignal.timeout(180000) });
}
function form(buffer: Uint8Array | string, name: string, type = 'pdf_optimize', options: Record<string, unknown> = {}) {
  const data = new FormData(); data.append('file', new Blob([buffer as BlobPart]), name); data.append('type', type); data.append('options', JSON.stringify(options)); return data;
}
async function convert(buffer: Uint8Array | string, name: string, type: string, options: Record<string, unknown> = {}) {
  const res = await request('/api/v1/jobs', { method: 'POST', body: form(buffer, name, type, options) });
  assert.equal(res.status, 202, await res.clone().text());
  const created = await res.json();
  for (let i = 0; i < 180; i++) {
    const poll = await request(`/api/v1/jobs/${created.jobId}`); assert.equal(poll.status, 200);
    const job = await poll.json();
    if (job.status === 'completed' || job.status === 'failed') return job;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Job timed out');
}

async function main() {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < 5; i++) pdf.addPage().drawText(`Production fixture page ${i + 1}`);
  const pdfBytes = await pdf.save();
  const image = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#54a6e2' } }).png().toBuffer();
  await fs.mkdir('scratch/production-fixtures', { recursive: true });
  await fs.writeFile('scratch/production-fixtures/multipage.pdf', pdfBytes);
  await fs.writeFile('scratch/production-fixtures/image.png', image);
  const docx = await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph('Production document conversion fixture')] }] }));
  await fs.writeFile('scratch/production-fixtures/document.docx', docx);

  await test('Homepage, legal pages, navigation, categories and tools', async () => {
    for (const url of ['/de', '/de/kategorie/pdf', '/de/kategorie/images', '/de/kategorie/documents', '/de/kategorie/utilities', '/de/datenschutz', '/de/impressum', '/de/agb', '/de/cookie-richtlinie', '/de/kontakt', '/de/preise', '/de/pdf-bearbeiten', '/de/ocr-pdf', '/de/word-in-pdf-umwandeln']) {
      const res = await request(url); assert.equal(res.status, 200, url); const html = await res.text(); assert.match(html, /<h1/); assert.match(html, /<title>/); assert.match(html, /name="description"/);
    }
  });
  await test('Sitemap: all listed URLs return 200 with canonical and one H1', async () => {
    const res = await request('/sitemap.xml'); assert.equal(res.status, 200);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    assert.ok(urls.length > 100); assert.ok(!urls.some(u => u.includes('/admin') || u.includes('/api')));
    for (const url of urls) {
      const page = await request(url); assert.equal(page.status, 200, url); const html = await page.text();
      assert.equal((html.match(/<h1\b/g) || []).length, 1, url); assert.match(html, /rel="canonical"/);
    }
    console.log('Crawled sitemap URLs:', urls.length);
  });
  await test('Robots blocks private routes but permits assets', async () => {
    const text = await (await request('/robots.txt')).text(); assert.match(text, /Disallow: \/api\//); assert.match(text, /Disallow: \/admin\//); assert.doesNotMatch(text, /Disallow: \/_next/);
  });
  await test('Admin and job listings fail closed without credentials', async () => {
    for (const url of ['/api/v1/jobs', '/api/v1/jobs/cleanup', '/api/v1/analytics/dashboard', '/de/admin/analytics']) assert.equal((await request(url)).status, 401, url);
  });
  await test('Checkout and portal cannot grant mock Pro or accept arbitrary customers', async () => {
    for (const endpoint of ['checkout', 'portal']) assert.equal((await request('/api/v1/stripe/' + endpoint, { method: 'POST', body: JSON.stringify({ customerId: 'cus_victim' }) })).status, 503);
  });
  await test('Unsigned webhook is rejected', async () => { assert.equal((await request('/api/v1/stripe/webhook', { method: 'POST', body: '{"type":"checkout.session.completed"}' })).status, 401); });
  await test('Forged API keys and cookies do not grant Pro', () => {
    assert.equal(isProRequest(new NextRequest(base, { headers: { 'x-api-key': 'anything', cookie: 'coolwave_pro_active=true' } })), false);
  });
  await test('Client cannot override worker paths, identity or OCR limits', async () => {
    for (const options of [{ maxPages: 100000 }, { isPro: true }, { jobType: 'pdf_sign' }, { outputPath: '../../secret' }, { targetFormat: '../../secret' }]) {
      assert.throws(() => parseOptions(JSON.stringify(options)));
    }
    const res = await request('/api/v1/jobs', { method: 'POST', body: form(pdfBytes, 'input.pdf', 'pdf_optimize', { isPro: true }) }); assert.equal(res.status, 400);
  });
  await test('Chunked oversized bodies stop before parsing', async () => {
    const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(2048)); c.close(); } });
    await assert.rejects(() => boundedBody(new NextRequest(base, { method: 'POST', body: stream, duplex: 'half' } as any), 1024), /FILE_TOO_LARGE/);
  });
  for (const [name, content, code] of [ ['empty.pdf', '', 'EMPTY_FILE'], ['fake.pdf', 'hello', 'SPOOFED_PDF'], ['bad.png', 'hello', 'SPOOFED_PNG'], ['shell.php', '<?php', 'DISALLOWED_FILE_TYPE'], ['trojan.pdf', 'MZpayload', 'MALICIOUS_EXECUTABLE_DETECTED'] ]) {
    await test('Reject ' + name, async () => { const res = await request('/api/v1/jobs', { method: 'POST', body: form(content, name) }); assert.equal(res.status, 400); assert.equal((await res.json()).code, code); });
  }
  await test('Reject 51 MB free upload despite forged API key', async () => {
    const res = await request('/api/v1/jobs', { method: 'POST', headers: { 'x-api-key': 'forged' }, body: form(new Uint8Array(51 * 1024 * 1024), 'big.pdf') }); assert.equal(res.status, 413);
  });
  await test('Invalid multipart file field returns 400, not 500', async () => {
    const data = new FormData(); data.append('file', 'not a file'); const res = await request('/api/v1/jobs', { method: 'POST', body: data }); assert.equal(res.status, 400);
  });
  let completed: any;
  await test('Multi-page PDF, malicious filename, signed download and preserved pages', async () => {
    completed = await convert(pdfBytes, '../../malicious"name.pdf', 'pdf_optimize'); assert.equal(completed.status, 'completed', completed.error);
    const dl = await request(completed.output.downloadUrl); assert.equal(dl.status, 200); assert.match(dl.headers.get('cache-control') || '', /no-store/);
    assert.equal((await PDFDocument.load(await dl.arrayBuffer())).getPageCount(), 5);
    assert.doesNotMatch(JSON.stringify(completed), /storagePath|[A-Z]:\\/);
  });
  await test('Cross-browser polling and cancellation are denied', async () => {
    assert.ok(completed);
    const url = '/api/v1/jobs/' + completed.id;
    for (const method of ['GET', 'DELETE']) assert.equal((await request(url, { method, headers: { cookie: '' } })).status, 404);
  });
  await test('Unsigned and tampered downloads are denied', async () => {
    assert.ok(completed); assert.equal((await request('/api/v1/jobs/' + completed.id + '/download')).status, 403);
    const url = new URL(completed.output.downloadUrl, base); url.searchParams.set('token', 'a'.repeat(64)); assert.equal((await request(url.pathname + url.search)).status, 403);
  });
  await test('Signed URLs expire and reject malformed suffixes', () => {
    const url = new URL(generateSignedDownloadUrl('expiry-test', Date.now() - 1000), base);
    assert.equal(verifySignedDownloadToken('expiry-test', url.searchParams.get('token'), url.searchParams.get('exp')).valid, false);
    assert.equal(verifySignedDownloadToken('expiry-test', 'a'.repeat(64) + 'junk', String(Date.now() + 10000)).valid, false);
  });
  await test('Corrupted PDF job fails without sensitive errors', async () => {
    const job = await convert('%PDF-1.7\ncorrupted', 'broken.pdf', 'pdf_optimize'); assert.equal(job.status, 'failed'); assert.doesNotMatch(job.error, /C:|ENOENT|node_modules|stack|storage|input\.pdf/);
  });
  await test('PNG to JPEG conversion produces decodable output', async () => {
    const job = await convert(image, 'image.png', 'image_convert', { targetFormat: 'jpg' }); assert.equal(job.status, 'completed', job.error);
    const bytes = Buffer.from(await (await request(job.output.downloadUrl)).arrayBuffer()); assert.equal((await sharp(bytes).metadata()).format, 'jpeg');
  });
  await test('DOCX to PDF real conversion', async () => {
    const job = await convert(docx, 'document.docx', 'office_docx_to_pdf'); assert.equal(job.status, 'completed', job.error);
    assert.ok((await PDFDocument.load(await (await request(job.output.downloadUrl)).arrayBuffer())).getPageCount() >= 1);
  });
  await test('TXT to DOCX real conversion', async () => {
    const job = await convert('Production document content', 'document.txt', 'office_txt_to_docx'); assert.equal(job.status, 'completed', job.error);
    const zip = await JSZip.loadAsync(await (await request(job.output.downloadUrl)).arrayBuffer()); assert.ok(zip.file('word/document.xml'));
  });
  await test('Large 250-page PDF stays multi-page', async () => {
    const large = await PDFDocument.create(); for (let i = 0; i < 250; i++) large.addPage().drawText('Page ' + i);
    const job = await convert(await large.save(), 'large.pdf', 'pdf_optimize'); assert.equal(job.status, 'completed', job.error);
    assert.equal((await PDFDocument.load(await (await request(job.output.downloadUrl)).arrayBuffer())).getPageCount(), 250);
  });
  await test('Scanned PDF OCR produces recognized text', async () => {
    const scan = await sharp(Buffer.from('<svg width="1000" height="300"><rect width="100%" height="100%" fill="white"/><text x="40" y="120" font-size="64" fill="black">PRODUCTION TEST 2026</text></svg>')).png().toBuffer();
    const doc = await PDFDocument.create(); const img = await doc.embedPng(scan); doc.addPage([1000, 300]).drawImage(img, { x: 0, y: 0, width: 1000, height: 300 });
    const scanned = await doc.save(); await fs.writeFile('scratch/production-fixtures/scanned.pdf', scanned);
    const job = await convert(scanned, 'scanned.pdf', 'ocr_text', { language: 'eng', outputType: 'txt' }); assert.equal(job.status, 'completed', job.error);
    assert.match(await (await request(job.output.downloadUrl)).text(), /PRODUCTION|2026/);
  });
  await test('Valid multiple files and duplicate names survive batch ZIP', async () => {
    const data = new FormData(); data.append('type', 'pdf_optimize'); data.append('files', new Blob([pdfBytes as BlobPart]), 'same.pdf'); data.append('files', new Blob([pdfBytes as BlobPart]), 'same.pdf');
    const res = await request('/api/v1/jobs/batch', { method: 'POST', body: data }); assert.equal(res.status, 202); const batch = await res.json();
    for (let i = 0; i < 60; i++) {
      const jobs = await Promise.all(batch.jobs.map(async (j: any) => (await request('/api/v1/jobs/' + j.id)).json()));
      if (jobs.every(j => j.status === 'completed')) break;
      await new Promise(r => setTimeout(r, 500));
    }
    const opts = { method: 'POST', body: JSON.stringify({ jobIds: batch.jobs.map((j: any) => j.id) }), headers: { 'content-type': 'application/json' } };
    const zipRes = await request('/api/v1/jobs/batch/download', opts); assert.equal(zipRes.status, 200);
    assert.equal(Object.keys((await JSZip.loadAsync(await zipRes.arrayBuffer())).files).length, 2);
    assert.equal((await request('/api/v1/jobs/batch/download', { ...opts, headers: { cookie: '' } })).status, 404);
  });
  await test('Mixed valid/invalid batch rejects the entire submission', async () => {
    const data = new FormData(); data.append('type', 'pdf_optimize'); data.append('files', new Blob([pdfBytes as BlobPart]), 'valid.pdf'); data.append('files', new Blob(['invalid']), 'bad.pdf');
    assert.equal((await request('/api/v1/jobs/batch', { method: 'POST', body: data })).status, 400);
  });
  await test('ZIP path traversal rejected before extraction', async () => {
    const zip = new JSZip(); zip.file('../../escape.txt', 'private');
    const data = await zip.generateAsync({ type: 'nodebuffer' }); await assert.rejects(() => safeLoadZip(data));
  });
  await test('Storage denies unrelated paths and symlink escapes; expired files are deleted', async () => {
    const root = path.resolve('scratch/production-storage-' + crypto.randomUUID()); const storage = new LocalStorageProvider(root);
    const saved = await storage.saveInput(Buffer.from('fixture'), 'test.txt');
    await assert.rejects(() => storage.read(path.resolve('package.json')));
    const link = path.join(root, 'uploads', 'outside'); await fs.symlink(process.cwd(), link, 'junction');
    await assert.rejects(() => storage.read(path.join(link, 'package.json')));
    await fs.unlink(link);
    await fs.utimes(saved.storagePath, new Date(0), new Date(0)); assert.equal(await storage.cleanupExpired(1), 1);
    await assert.rejects(() => fs.stat(saved.storagePath));
    await fs.rmdir(path.join(root, 'uploads')); await fs.rmdir(path.join(root, 'outputs')); await fs.rmdir(root);
  });
  await test('Rate limiter enforces quota and ignores forged forwarding headers', () => {
    rateLimiter.reset(); const req = new NextRequest(base, { headers: { 'x-forwarded-for': '1.2.3.4' } });
    assert.equal(getClientIp(req), 'untrusted-origin');
    for (let i = 0; i < 30; i++) assert.equal(rateLimiter.check('regression', 'job').allowed, true);
    assert.equal(rateLimiter.check('regression', 'job').allowed, false);
  });
  await test('HTTP rate limits work even when the attacker changes X-Forwarded-For', async () => {
    let blocked = false;
    for (let i = 0; i < 35; i++) {
      const res = await request('/api/v1/jobs', { method: 'POST', headers: { 'x-forwarded-for': `192.0.2.${i}`, 'x-api-key': 'fake' }, body: form('', 'empty.pdf') });
      if (res.status === 429) { assert.ok(res.headers.get('retry-after')); blocked = true; break; }
    }
    assert.equal(blocked, true);
  });
  await fs.writeFile('scratch/production-results.json', JSON.stringify({ date: new Date().toISOString(), base, results }, null, 2));
  console.log(`TOTAL ${results.filter(r => r.passed).length}/${results.length} passed`);
  process.exit(results.every(r => r.passed) ? 0 : 1);
}
main().catch(err => { console.error(err); process.exit(1); });
