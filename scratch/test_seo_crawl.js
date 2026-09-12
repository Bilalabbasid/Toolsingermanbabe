/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });
    req.on('error', reject);
  });
}

async function runSeoAudit() {
  console.log('--- STARTING COOLWAVE GERMAN SEO CONTENT AUDIT ---\n');
  let failures = 0;

  // 1. Robots.txt
  console.log('1. Checking /robots.txt:');
  const robotsRes = await fetchUrl('http://localhost:3001/robots.txt');
  if (robotsRes.statusCode === 200 && robotsRes.data.includes('sitemap.xml')) {
    console.log('   ✓ robots.txt verified.');
  } else {
    console.log('   ✗ robots.txt failed.');
    failures++;
  }

  // 2. Sitemap includes new tools
  console.log('\n2. Checking /sitemap.xml for office and image tools:');
  const sitemapRes = await fetchUrl('http://localhost:3001/sitemap.xml');
  const hasExcel = sitemapRes.data.includes('/de/pdf-in-excel-umwandeln');
  const hasHeic = sitemapRes.data.includes('/de/heic-in-jpg-umwandeln');
  if (hasExcel && hasHeic) {
    console.log('   ✓ sitemap.xml includes pdf-in-excel-umwandeln and heic-in-jpg-umwandeln.');
  } else {
    console.log('   ✗ sitemap.xml missing new tools.');
    failures++;
  }

  // 3. Raw Server-Rendered HTML Inspection (/de/pdf-in-word-umwandeln)
  console.log('\n3. Inspecting raw server-rendered HTML (/de/pdf-in-word-umwandeln):');
  const wordRes = await fetchUrl('http://localhost:3001/de/pdf-in-word-umwandeln');
  const wordHtml = wordRes.data;

  const wordChecks = [
    { name: 'H1 in HTML', test: wordHtml.includes('<h1') && wordHtml.includes('PDF in Word umwandeln') },
    { name: 'Search intent unification (PDF zu Word FAQ & Keywords)', test: wordHtml.includes('PDF zu Word') },
    { name: 'Troubleshooting section present in HTML', test: wordHtml.includes('Häufige Probleme &amp; Lösungen') || wordHtml.includes('Häufige Probleme & Lösungen') },
    { name: 'Specific troubleshooting issue in HTML', test: wordHtml.includes('Word-Datei nur uneditierbare Bilder') },
    { name: 'Privacy explanation in HTML', test: wordHtml.includes('Datenschutz &amp; Dateisicherheit') || wordHtml.includes('Datenschutz & Dateisicherheit') },
    { name: 'Related tools links in HTML', test: wordHtml.includes('/de/word-in-pdf-umwandeln') },
  ];

  for (const check of wordChecks) {
    if (check.test) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.log(`   ✗ ${check.name} FAILED!`);
      failures++;
    }
  }

  // 4. Raw Server-Rendered HTML Inspection (/de/pdf-in-excel-umwandeln)
  console.log('\n4. Inspecting raw HTML for Office tool (/de/pdf-in-excel-umwandeln):');
  const excelRes = await fetchUrl('http://localhost:3001/de/pdf-in-excel-umwandeln');
  const excelHtml = excelRes.data;

  const excelChecks = [
    { name: 'H1 in HTML', test: excelHtml.includes('PDF in Excel umwandeln') },
    { name: 'Intro copy in HTML', test: excelHtml.includes('Das manuelle Abtippen von Tabellen') },
    { name: 'Troubleshooting in HTML', test: excelHtml.includes('Tabellenspalten sind nach der Umwandlung verschoben') },
    { name: 'Format specifications in HTML', test: excelHtml.includes('PDF zu XLSX / CSV') },
  ];

  for (const check of excelChecks) {
    if (check.test) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.log(`   ✗ ${check.name} FAILED!`);
      failures++;
    }
  }

  // 5. Raw Server-Rendered HTML Inspection (/de/heic-in-jpg-umwandeln)
  console.log('\n5. Inspecting raw HTML for Image tool (/de/heic-in-jpg-umwandeln):');
  const heicRes = await fetchUrl('http://localhost:3001/de/heic-in-jpg-umwandeln');
  const heicHtml = heicRes.data;

  const heicChecks = [
    { name: 'H1 in HTML', test: heicHtml.includes('HEIC in JPG umwandeln') },
    { name: 'Intro copy in HTML', test: heicHtml.includes('Apples Standard-Fotoformat HEIC') },
    { name: 'FAQ in HTML', test: heicHtml.includes('Was ist HEIC?') },
  ];

  for (const check of heicChecks) {
    if (check.test) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.log(`   ✗ ${check.name} FAILED!`);
      failures++;
    }
  }

  console.log(`\n--- GERMAN CONTENT AUDIT FINISHED: ${failures === 0 ? 'ALL PASSED (100%)' : failures + ' FAILURES'} ---`);
  process.exit(failures === 0 ? 0 : 1);
}

runSeoAudit().catch((err) => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
