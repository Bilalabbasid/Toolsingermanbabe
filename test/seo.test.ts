import { describe, it, expect } from 'vitest';
import { getActiveTools, getToolBySlug } from '@/config/tools.config';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { generateToolMetadata, generateWebsiteSchema, SITE_URL } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';

describe('German SEO consistency', () => {
  it('publishes unique canonical URLs without fabricated modification dates', () => {
    const pages = sitemap();
    expect(new Set(pages.map(p => p.url)).size).toBe(pages.length);
    expect(pages.every(p => p.url.startsWith(`${SITE_URL}/de`))).toBe(true);
    // Tool and static landing pages avoid fabricated modification dates; blog articles have real timestamps
    const nonBlogPages = pages.filter(p => !p.url.includes('/blog'));
    expect(nonBlogPages.every(p => !p.lastModified)).toBe(true);
    expect(pages.some(p => p.url.endsWith('/blog'))).toBe(true);
    for (const tool of getActiveTools()) {
      const metadata = generateToolMetadata(tool);
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/de/${tool.slug}`);
      expect(metadata.keywords).toBeUndefined();
      expect(Boolean(pages.find(p => p.url === metadata.alternates?.canonical))).toBe(tool.processingEngine !== 'pdf-pdfa');
    }
  });
  it('uses a consistent registry for navigation and landing pages', () => {
    const tools = getActiveTools();
    expect(new Set(tools.map(t => t.slug)).size).toBe(tools.length);
    for (const tool of tools) expect(getToolBySlug(tool.slug)).toEqual(tool);
  });
  it('describes server document conversion accurately', () => {
    for (const tool of getActiveTools().filter(t => t.processingEngine === 'doc-convert')) {
      expect(tool.browserCapable).toBe(false);
      expect(tool.privacyExplanationDe).toContain('Server');
    }
    expect(getToolBySlug('pdf-in-word-umwandeln')?.introDe).toContain('Seitenumbrüche');
    expect(getToolBySlug('pdf-komprimieren')?.introDe).toContain('nicht garantiert');
  });
  it('escapes structured data without changing its content', () => {
    const data = { text: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(data);
    expect(generateWebsiteSchema()).not.toHaveProperty('potentialAction');
  });
  it('applies the same crawl exclusions to all crawlers', () => {
    expect(robots().rules).toEqual([expect.objectContaining({ userAgent: '*', disallow: expect.arrayContaining(['/api/', '/de/admin', '/scratch/']) })]);
  });
});
