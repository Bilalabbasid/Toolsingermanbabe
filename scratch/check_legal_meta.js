async function checkLegalMetadata() {
  const pages = ['impressum', 'datenschutz', 'agb', 'cookie-richtlinie', 'blog'];
  for (const p of pages) {
    const res = await fetch(`http://localhost:3000/de/${p}`);
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    console.log(`[PAGE: /de/${p}] Title: ${titleMatch ? titleMatch[1] : 'MISSING'} | Canonical: ${canonicalMatch ? canonicalMatch[1] : 'MISSING'}`);
  }
}
checkLegalMetadata().catch(console.error);
