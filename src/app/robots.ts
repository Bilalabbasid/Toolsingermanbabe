import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/de/admin',
          '/scratch/',
        ],
      },
      // Explicitly allow and welcome AI crawlers & answer engines for indexing and ranking
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
          'cohere-ai',
          'OAI-SearchBot',
          'Bytespider',
          'Diffbot',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/de/admin',
          '/scratch/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
