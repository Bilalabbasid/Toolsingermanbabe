import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
