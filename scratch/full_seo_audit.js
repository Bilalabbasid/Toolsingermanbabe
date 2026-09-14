const fs = require('fs');
const path = require('path');

async function runAudit() {
  console.log('=== COOLWAVE COMPREHENSIVE TECHNICAL SEO AUDIT ===\n');

  // 1. Check sitemap.xml
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  const sitemapXml = await sitemapRes.text();
  const sitemapLocs = (sitemapXml.match(/<loc>(.*?)<\/loc>/g) || []).map(s => s.replace(/<\/?loc>/g, ''));
  console.log(`[SITEMAP] Found ${sitemapLocs.length} URLs in sitemap.xml`);

  // Check for missing important pages in sitemap
  const expectedPages = [
    'https://coolwave.cool/de',
    'https://coolwave.cool/de/preise',
    'https://coolwave.cool/de/kontakt',
    'https://coolwave.cool/de/impressum',
    'https://coolwave.cool/de/datenschutz',
    'https://coolwave.cool/de/agb',
    'https://coolwave.cool/de/cookie-richtlinie',
    'https://coolwave.cool/de/blog',
    'https://coolwave.cool/de/kategorie/pdf',
    'https://coolwave.cool/de/kategorie/images',
    'https://coolwave.cool/de/kategorie/documents',
    'https://coolwave.cool/de/kategorie/security',
    'https://coolwave.cool/de/kategorie/utilities',
    'https://coolwave.cool/de/kategorie/media'
  ];

  const missingFromSitemap = expectedPages.filter(p => !sitemapLocs.includes(p));
  console.log(`[SITEMAP] Missing expected pages:`, missingFromSitemap);

  // 2. Audit Robots.txt
  const robotsRes = await fetch('http://localhost:3000/robots.txt');
  const robotsTxt = await robotsRes.text();
  console.log('\n[ROBOTS.TXT] Current content:\n' + robotsTxt);

  // 3. Sample tool page inspection (e.g. /de/pdf-komprimieren, /de/pdf-in-word-umwandeln, /de/jpg-in-png)
  const testUrls = [
    'http://localhost:3000/de',
    'http://localhost:3000/de/pdf-komprimieren',
    'http://localhost:3000/de/pdf-in-word-umwandeln',
    'http://localhost:3000/de/kategorie/pdf',
    'http://localhost:3000/de/preise',
    'http://localhost:3000/de/kontakt'
  ];

  console.log('\n[PAGE LEVEL AUDIT]');
  for (const url of testUrls) {
    const res = await fetch(url);
    const html = await res.text();

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'MISSING';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1] : 'MISSING';

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';

    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

    const ldJsonMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => {
      try {
        return JSON.parse(m[1]);
      } catch (e) {
        return 'INVALID JSON';
      }
    });

    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    const twitterCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);

    console.log(`\nURL: ${url} (Status: ${res.status})`);
    console.log(`  Title (${title.length} chars): ${title}`);
    console.log(`  Meta Description (${metaDesc.length} chars): ${metaDesc.slice(0, 80)}...`);
    console.log(`  Canonical: ${canonical}`);
    console.log(`  H1 count: ${h1Matches.length} -> "${h1Matches[0] || ''}"`);
    console.log(`  H2 count: ${h2Count}`);
    console.log(`  JSON-LD Schemas: ${ldJsonMatches.length} (${ldJsonMatches.map(s => s['@type'] || 'unknown').join(', ')})`);
    console.log(`  OG Image: ${ogImage ? ogImage[1] : 'MISSING'}`);
    console.log(`  Twitter Card: ${twitterCard ? twitterCard[1] : 'MISSING'}`);
  }
}

runAudit().catch(console.error);
