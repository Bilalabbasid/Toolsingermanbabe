import fs from 'node:fs/promises';
const base = process.env.SEO_AUDIT_URL || 'http://localhost:3110';
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`Sitemap: ${sitemapResponse.status}`);
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const results = [], links = new Set();
const decode = s => s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
async function inspect(url) {
  const path = new URL(url).pathname;
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1] || '';
  const h1Count = [...html.matchAll(/<h1(?:\s|>)/g)].length;
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const issues = [];
  if (response.status !== 200) issues.push(`HTTP ${response.status}`);
  if (h1Count !== 1) issues.push(`H1 count ${h1Count}`);
  if (!title) issues.push('Missing title');
  if (!description) issues.push('Missing description');
  if (canonical !== url) issues.push(`Canonical mismatch: ${canonical}`);
  if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html)) issues.push('Sitemap page is noindex');
  for (const schema of schemas) { try { JSON.parse(schema[1]); } catch { issues.push('Invalid JSON-LD'); } }
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = decode(m[1]);
    if (href.startsWith('/de')) links.add(href.split(/[?#]/)[0]);
  }
  results.push({ path, status: response.status, title: decode(title), description: decode(description), canonical, h1Count, schemas: schemas.length, issues });
}
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => { while (next < urls.length) await inspect(urls[next++]); }));
const brokenLinks = [];
const excludedPages = [];
for (const path of ['/de/login', '/de/register', '/de/konto', '/de/blog']) {
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  excludedPages.push({ path, status: response.status, noindex: /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html) });
}
for (const path of links) {
  if (results.some(r => r.path === path && r.status === 200)) continue;
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
  if (response.status >= 400) brokenLinks.push({ path, status: response.status });
  await response.body?.cancel();
}
const duplicates = key => [...Map.groupBy(results, r => r[key]).values()].filter(group => group.length > 1).map(group => group.map(r => r.path));
const report = { base, checkedAt: new Date().toISOString(), pageCount: results.length, internalLinkCount: links.size, duplicateSitemapUrls: urls.length - new Set(urls).size, duplicateTitles: duplicates('title'), duplicateDescriptions: duplicates('description'), brokenLinks, excludedPages, pages: results.sort((a,b) => a.path.localeCompare(b.path)) };
await fs.mkdir('reports', { recursive: true });
await fs.writeFile('reports/seo-crawl.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, pages: report.pages.filter(p => p.issues.length) }, null, 2));
if (report.brokenLinks.length || report.pages.some(p => p.issues.length) || excludedPages.some(p => !p.noindex) || report.duplicateSitemapUrls || report.duplicateTitles.length || report.duplicateDescriptions.length) process.exitCode = 1;
