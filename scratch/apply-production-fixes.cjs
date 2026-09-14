const fs = require('node:fs');
function edit(p, fn) { fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')), 'utf8'); }
function write(p, text) { fs.writeFileSync(p, text, 'utf8'); }
write('src/app/api/v1/jobs/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { submitJobs } from '@/server/jobs';
import { isAdminRequest } from '@/server/security/request';
import { jobQueue } from '@/server/queue/queue';
export async function POST(req: NextRequest) { return submitJobs(req, false); }
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req, process.env.CRON_SECRET)) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  const jobs = await jobQueue.listJobs();
  return NextResponse.json({ total: jobs.length, jobs: jobs.map(j => ({ id: j.id, status: j.status, type: j.type })) }, { headers: { 'Cache-Control': 'no-store' } });
}
`);
write('src/app/api/v1/jobs/batch/route.ts', `import { NextRequest } from 'next/server';
import { submitJobs } from '@/server/jobs';
export async function POST(req: NextRequest) { return submitJobs(req, true); }
`);
write('src/app/api/v1/convert/route.ts', `// Legacy route uses the real validated conversion queue.
export { POST } from '../jobs/route';
`);
for (const p of ['src/app/api/v1/jobs/cleanup/route.ts', 'src/app/api/v1/analytics/dashboard/route.ts']) {
  edit(p, s => {
    s = "import { isAdminRequest } from '@/server/security/request';\n" + s;
    const start = s.indexOf('    const ', s.indexOf('  try {'));
    const end = s.indexOf(p.includes('cleanup') ? '    const retentionMinutes' : '    const searchParams', start);
    return s.slice(0, start) + `    if (!isAdminRequest(req${p.includes('cleanup') ? ', process.env.CRON_SECRET' : ''})) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });\n\n` + s.slice(end);
  });
}
edit('src/app/api/v1/jobs/[id]/download/route.ts', s => {
  s = "import { isProRequest } from '@/server/security/request';\n" + s;
  s = s.replace("Boolean(req.headers.get('x-api-key'))", 'isProRequest(req)');
  const start = s.indexOf('  // Verify signed download');
  const end = s.indexOf('  const job =', start);
  return s.slice(0, start) + `  const verification = verifySignedDownloadToken(id, token, exp);
  if (!verification.valid) return NextResponse.json({ error: 'Ungueltiger oder abgelaufener Download-Link.' }, { status: 403 });

` + s.slice(end);
});
edit('src/app/api/v1/pdf/security/route.ts', s => {
  s = "import { boundedFormData, isProRequest, requestError, RequestError } from '@/server/security/request';\n" + s;
  s = s.replace("const isPro = !!apiKey;", 'const isPro = isProRequest(req);');
  s = s.replace('await req.formData()', 'await boundedFormData(req, (isPro ? 250 : 50) * 1024 * 1024 + 65536)');
  s = s.replace('if (!file) {', 'if (!(file instanceof File)) {');
  s = s.replaceAll('${file.name}', '${safeFilename}');
  s = s.replace('return NextResponse.json({ error: errorMsg }, { status: 422 });', "return err instanceof RequestError ? requestError(err) : NextResponse.json({ error: 'PDF-Verarbeitung fehlgeschlagen. Bitte pruefen Sie Datei und Passwort.', code: 'INVALID_PDF' }, { status: 422 });");
  return s;
});
// Billing cannot safely accept money until authenticated account binding and durable
// subscription provisioning exist. Fail closed instead of selling a non-delivered tier.
for (const endpoint of ['checkout', 'portal']) write(`src/app/api/v1/stripe/${endpoint}/route.ts`, `import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ error: 'Abonnements sind derzeit nicht verfuegbar.', code: 'BILLING_UNAVAILABLE' }, { status: 503 });
}
`);
for (const p of ['src/components/pricing/PricingClient.tsx','src/components/monetization/UpgradeModal.tsx']) {
  edit(p, s => s.replaceAll("setClientSubscription('pro', true);", "// Paid access is granted only by the server.").replaceAll("alert('CoolWave Pro aktiviert!');", "alert('Das Upgrade ist derzeit nicht verfuegbar. Ihr Tarif wurde nicht geaendert.');").replaceAll("alert('CoolWave Pro erfolgreich aktiviert (Sandbox-Modus)!');", "alert('Das Upgrade ist derzeit nicht verfuegbar.');"));
}
edit('src/server/services/adapters/PdfService.ts', s => s.replace("return this.supportedTypes.includes(type) || type.startsWith('pdf_');", "return this.supportedTypes.includes(type);").replace("const jobType = options.jobType || 'pdf_optimize';", "const jobType = options.jobType || 'pdf_optimize';\n    if (jobType === 'pdf_pdfa') throw new Error('PDF/A validation is unavailable.');"));
edit('src/server/services/adapters/OcrService.ts', s => s.replace('Boolean(options.apiKey || options.isPro)', 'options.isPro === true').replace('options.maxPages || (isPro ? 100 : limits.maxPages)', '(isPro ? 100 : limits.maxPages)'));
edit('src/server/services/adapters/ArchiveService.ts', s => s.replace("import JSZip from 'jszip';", "import JSZip from 'jszip';\nimport { safeLoadZip } from '@/server/security/safeArchive';").replace("options.type || 'archive_zip_extract'", "options.jobType || options.type || 'archive_zip_extract'").replace('gunzipAsync(inputBuffer)', 'gunzipAsync(inputBuffer, { maxOutputLength: MAX_UNCOMPRESSED_BYTES })').replace('await zip.loadAsync(inputBuffer)', 'await safeLoadZip(inputBuffer, { maxEntries: MAX_ENTRIES_COUNT, maxUncompressedBytes: MAX_UNCOMPRESSED_BYTES })'));
console.log('Applied route, billing and conversion hardening.');
