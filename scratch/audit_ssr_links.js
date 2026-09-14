async function audit() {
  const res = await fetch('http://localhost:3000/de');
  const html = await res.text();
  const linkRegex = /href="(\/de\/[^"]+)"/g;
  const matches = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  const unique = [...new Set(matches)];
  console.log('Total /de/ links on homepage:', matches.length);
  console.log('Total UNIQUE /de/ links on homepage:', unique.length);
  
  // Categorize
  const toolLinks = unique.filter(u => !u.includes('/kategorie/') && !['/de', '/de/preise', '/de/kontakt', '/de/impressum', '/de/datenschutz', '/de/agb', '/de/cookie-richtlinie', '/de/blog'].includes(u));
  console.log('Unique tool links on homepage:', toolLinks.length);
  console.log('Sample tool links:', toolLinks.slice(0, 5));
}
audit().catch(console.error);
