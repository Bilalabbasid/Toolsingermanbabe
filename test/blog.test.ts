import { describe, it, expect } from 'vitest';
import { validateBlogInternalLinks, getAllArticles } from '@/config/blog.config';

describe('Blog Articles & Internal Links Validation', () => {
  it('should have valid internal links for all blog articles', () => {
    const result = validateBlogInternalLinks();
    if (!result.valid) {
      console.error('Broken blog links found:', result.brokenSlugs);
    }
    expect(result.valid).toBe(true);
    expect(result.brokenSlugs).toEqual([]);
  });

  it('should have articles registered with valid properties', () => {
    const articles = getAllArticles();
    expect(articles.length).toBeGreaterThanOrEqual(92);

    for (const article of articles) {
      expect(article.slug).toBeTruthy();
      expect(article.title).toBeTruthy();
      expect(article.metaTitle.length).toBeLessThanOrEqual(75);
      expect(article.metaDescription.length).toBeLessThanOrEqual(180);
      expect(article.directAnswer).toBeTruthy();
      expect(article.primaryToolSlug).toBeTruthy();
      expect(article.sections.length).toBeGreaterThan(0);
    }
  });
});

