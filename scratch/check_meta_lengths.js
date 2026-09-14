const { getActiveTools } = require('./src/config/tools.config');

const tools = getActiveTools();
console.log(`Auditing ${tools.length} active tools for Title & Meta Description lengths...`);

const longTitles = [];
const shortTitles = [];
const longDescriptions = [];
const shortDescriptions = [];

tools.forEach(t => {
  const titleLen = t.titleDe ? t.titleDe.length : 0;
  const descLen = t.metaDescriptionDe ? t.metaDescriptionDe.length : 0;

  if (titleLen > 70) {
    longTitles.push({ slug: t.slug, len: titleLen, title: t.titleDe });
  } else if (titleLen < 30) {
    shortTitles.push({ slug: t.slug, len: titleLen, title: t.titleDe });
  }

  if (descLen > 165) {
    longDescriptions.push({ slug: t.slug, len: descLen, desc: t.metaDescriptionDe });
  } else if (descLen < 80) {
    shortDescriptions.push({ slug: t.slug, len: descLen, desc: t.metaDescriptionDe });
  }
});

console.log(`\nLong Titles (> 70 chars): ${longTitles.length}`);
longTitles.slice(0, 5).forEach(x => console.log(`  - [${x.len} chars] ${x.slug}: "${x.title}"`));

console.log(`\nShort Titles (< 30 chars): ${shortTitles.length}`);
shortTitles.slice(0, 5).forEach(x => console.log(`  - [${x.len} chars] ${x.slug}: "${x.title}"`));

console.log(`\nLong Meta Descriptions (> 165 chars): ${longDescriptions.length}`);
longDescriptions.slice(0, 5).forEach(x => console.log(`  - [${x.len} chars] ${x.slug}: "${x.desc}"`));

console.log(`\nShort Meta Descriptions (< 80 chars): ${shortDescriptions.length}`);
shortDescriptions.slice(0, 5).forEach(x => console.log(`  - [${x.len} chars] ${x.slug}: "${x.desc}"`));
