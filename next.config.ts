import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    proxyClientMaxBodySize: '500mb',
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  outputFileTracingIncludes: {
    '/api/*': ['./node_modules/pdfjs-dist/standard_fonts/**/*'],
  },
  serverExternalPackages: [
    'muhammara',
    'tesseract.js',
    '@napi-rs/canvas',
    'sharp',
    'heic-decode',
    'potrace',
    'icojs',
    'bmp-js',
    'png-to-ico',
    'ag-psd',
    '@ffmpeg-installer/ffmpeg',
    '@ffmpeg-installer/win32-x64',
    '7z-bin',
    'pdfjs-dist',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV !== 'production' ? "'unsafe-eval' " : ''}https://js.stripe.com https://pagead2.googlesyndication.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://m.stripe.network https://pagead2.googlesyndication.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';`,
          },
        ],
      },
      // Cache public static assets (images, icons)
      {
        source: '/(favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
