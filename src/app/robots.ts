import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Paths without search value (APIs, admin, account and auth screens). */
const DISALLOW = [
  '/api/',
  '/admin',
  '/de/admin',
  '/de/konto',
  '/de/login',
  '/de/register',
  '/scratch/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // Answer engines / AI search crawlers are explicitly welcome on public content.
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
          'cohere-ai',
        ],
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
