async function auditAllSitemapPages() {
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  const xml = await sitemapRes.text();
  const locs = (xml.match(/<loc>(.*?)<\/loc>/g) || []).map(s => s.replace(/<\/?loc>/g, ''));
  console.log(`Auditing metadata for ${locs.length} pages in sitemap...`);

  const longTitles = [];
  const shortTitles = [];
  const longDescs = [];
  const shortDescs = [];
  const missingH1 = [];
  const missingCanonical = [];

  // Audit sample of 25 pages across categories and tools
  const sample = [
    ...locs.filter(u => u.includes('/kategorie/')),
    ...locs.filter(u => !u.includes('/kategorie/') && !u.match(/\/[a-z]+-[a-z]+/)).slice(0, 10),
    ...locs.filter(u => u.includes('pdf-')).slice(0, 10),
    ...locs.filter(u => u.includes('jpg-') || u.includes('png-')).slice(0, 10),
    ...locs.filter(u => u.includes('word-') || u.includes('excel-')).slice(0, 5),
  ];

  const uniqueSample = [...new Set(sample)];
  console.log(`Testing ${uniqueSample.length} diverse pages...`);

  for (const u of uniqueSample) {
    const localUrl = u.replace('https://coolwave.cool', 'http://localhost:3000');
    try {
      const res = await fetch(localUrl);
      const html = await res.text();

      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';

      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const desc = descMatch ? descMatch[1] : '';

      const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      const canon = canonMatch ? canonMatch[1] : '';

      const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;

      if (!canon) missingCanonical.push(u);
      if (h1Count !== 1) missingH1.push({ url: u, count: h1Count });

      if (title.length > 70) longTitles.push({ url: u, len: title.length, title });
      else if (title.length < 30) shortTitles.push({ url: u, len: title.length, title });

      if (desc.length > 165) longDescs.push({ url: u, len: desc.length, desc });
      else if (desc.length < 80) shortDescs.push({ url: u, len: desc.length, desc });
    } catch (e) {
      console.error('Error fetching', localUrl, e.message);
    }
  }

  console.log('\nResults:');
  console.log('Missing Canonical:', missingCanonical);
  console.log('Pages without exactly 1 H1:', missingH1);
  console.log('Titles > 70 chars:', longTitles);
  console.log('Titles < 30 chars:', shortTitles);
  console.log('Descriptions > 165 chars:', longDescs);
  console.log('Descriptions < 80 chars:', shortDescs);
}

auditAllSitemapPages().catch(console.error);
