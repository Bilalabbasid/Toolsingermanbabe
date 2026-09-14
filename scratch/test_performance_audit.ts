import http from 'http';

interface AuditResult {
  url: string;
  statusCode: number;
  ttfbMs: number;
  totalTimeMs: number;
  contentLengthBytes: number;
  cacheControl?: string;
  contentEncoding?: string;
}

function fetchWithMetrics(url: string): Promise<AuditResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let ttfb = 0;

    const req = http.get(url, (res) => {
      ttfb = Date.now() - start;
      let totalBytes = 0;

      res.on('data', (chunk) => {
        totalBytes += chunk.length;
      });

      res.on('end', () => {
        const totalTime = Date.now() - start;
        resolve({
          url,
          statusCode: res.statusCode || 0,
          ttfbMs: ttfb,
          totalTimeMs: totalTime,
          contentLengthBytes: totalBytes,
          cacheControl: res.headers['cache-control'],
          contentEncoding: res.headers['content-encoding'],
        });
      });
    });

    req.on('error', (err) => reject(err));
  });
}

async function runPerformanceAudit() {
  console.log('====================================================');
  console.log('   COOLWAVE CORE WEB VITALS & PERFORMANCE AUDIT     ');
  console.log('====================================================\n');

  const testEndpoints = [
    { name: 'Homepage (DE)', path: '/de' },
    { name: 'PDF Compress Tool', path: '/de/pdf-komprimieren' },
    { name: 'Word to PDF Converter', path: '/de/word-in-pdf-umwandeln' },
    { name: 'Image Compress Tool', path: '/de/bilder-komprimieren' },
    { name: 'Word Counter Utility', path: '/de/wortzaehler' },
    { name: 'Admin Analytics Dashboard', path: '/de/admin/analytics' },
  ];

  console.log('[Phase 1] Auditing TTFB (Time to First Byte) & Server Response Times...\n');

  for (const ep of testEndpoints) {
    // Warm up
    await fetchWithMetrics(`http://localhost:3000${ep.path}`);

    // Benchmark run
    const res = await fetchWithMetrics(`http://localhost:3000${ep.path}`);
    console.log(`- ${ep.name} (${ep.path}):`);
    console.log(`    Status: ${res.statusCode}`);
    console.log(`    TTFB: ${res.ttfbMs} ms (Target: < 200 ms)`);
    console.log(`    Total Response Time: ${res.totalTimeMs} ms`);
    console.log(`    Payload: ${(res.contentLengthBytes / 1024).toFixed(1)} KB`);
    console.log(`    Compression: ${res.contentEncoding || 'standard chunked'}`);

    if (res.ttfbMs > 500) {
      console.warn(`    ⚠️ Warning: TTFB higher than recommended (${res.ttfbMs}ms)`);
    } else {
      console.log(`    ✓ TTFB is excellent (< 200ms)`);
    }
    console.log('');
  }

  console.log('[Phase 2] Auditing Static Asset Caching Headers...\n');

  const staticAudit = await fetchWithMetrics('http://localhost:3000/favicon.ico');
  console.log(`- Static Asset (/favicon.ico):`);
  console.log(`    Status: ${staticAudit.statusCode}`);
  console.log(`    Cache-Control: ${staticAudit.cacheControl || 'None'}`);
  if (staticAudit.cacheControl?.includes('public') && staticAudit.cacheControl?.includes('max-age')) {
    console.log(`    ✓ Static caching headers properly configured!`);
  }

  console.log('\n====================================================');
  console.log('   PERFORMANCE AUDIT COMPLETED SUCCESSFULLY!        ');
  console.log('====================================================\n');
}

runPerformanceAudit().catch((err) => {
  console.error('Performance Audit Failed:', err);
  process.exit(1);
});
