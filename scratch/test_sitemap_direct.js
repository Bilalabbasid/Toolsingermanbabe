const path = require('path');
async function testSitemapDirect() {
  // Let's dynamically test via tsx
  const { execSync } = require('child_process');
  const code = `
    import sitemap from './src/app/sitemap';
    const items = sitemap();
    console.log('Total items in sitemap function:', items.length);
    const hasKontakt = items.some(i => i.url.includes('/kontakt'));
    console.log('Has /kontakt in sitemap():', hasKontakt);
    const hasMediaCat = items.some(i => i.url.includes('/kategorie/'));
    console.log('Categories count:', items.filter(i => i.url.includes('/kategorie/')).length);
  `;
  const res = execSync('npx tsx -e "' + code.replace(/\n/g, ' ') + '"', { cwd: process.cwd() });
  console.log(res.toString());
}

testSitemapDirect().catch(console.error);
