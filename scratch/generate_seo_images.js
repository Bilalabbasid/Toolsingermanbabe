const sharp = require('sharp');
const path = require('path');

async function generateImages() {
  console.log('Generating high-res OpenGraph and Organization assets...');

  // 1. 1200x630 OpenGraph Image
  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />

    <!-- Subtle background wave patterns -->
    <path d="M-100,500 C300,420 600,580 1300,460 L1300,630 L-100,630 Z" fill="#0284c7" opacity="0.15" />
    <path d="M-100,550 C400,480 800,600 1300,520 L1300,630 L-100,630 Z" fill="#38bdf8" opacity="0.1" />

    <!-- Content Container -->
    <g transform="translate(100, 100)">
      <!-- Badge -->
      <rect x="0" y="0" width="280" height="42" rx="21" fill="#0284c7" opacity="0.3" stroke="#38bdf8" stroke-width="1.5" />
      <circle cx="24" cy="21" r="6" fill="#10b981" />
      <text x="42" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#38bdf8">100% DSGVO-KONFORM</text>

      <!-- Logo & Brand Name -->
      <g transform="translate(0, 75)">
        <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#waveGrad)" filter="url(#shadow)"/>
        <!-- File Wave Icon inside -->
        <path d="M22,18 L36,18 L44,26 L44,46 L22,46 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" />
        <path d="M36,18 L36,26 L44,26" fill="none" stroke="#ffffff" stroke-width="3" />
        <path d="M26,34 Q33,30 40,34" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
        
        <text x="84" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="-1">CoolWave</text>
      </g>

      <!-- Main Headline -->
      <text x="0" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
        Kostenlose Datei- &amp; PDF-Tools
      </text>
      <text x="0" y="285" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#38bdf8" letter-spacing="-0.5">
        sicher im Webbrowser nutzen.
      </text>

      <!-- Subtitle -->
      <text x="0" y="345" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94a3b8">
        PDFs bearbeiten, zusammenfügen, verkleinern &amp; konvertieren – ohne Server-Upload.
      </text>

      <!-- Feature Pill Badges at bottom -->
      <g transform="translate(0, 395)">
        <g transform="translate(0, 0)">
          <rect width="200" height="40" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="100" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">⚡ 160+ Werkzeuge</text>
        </g>
        <g transform="translate(215, 0)">
          <rect width="220" height="40" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="110" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">🔒 100% In-Browser</text>
        </g>
        <g transform="translate(450, 0)">
          <rect width="230" height="40" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="115" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">✓ Ohne Registrierung</text>
        </g>
      </g>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png({ quality: 95 })
    .toFile(path.join(process.cwd(), 'public', 'og-image.png'));
  console.log('✓ Created public/og-image.png (1200x630)');

  // 2. 512x512 Organization Logo Icon
  const iconSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
      <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Background rounded squircle -->
    <rect width="512" height="512" rx="128" fill="url(#iconBg)" />
    
    <!-- Document + Wave Graphic -->
    <g transform="translate(136, 116)" filter="url(#iconShadow)">
      <path d="M40,20 L160,20 L220,80 L220,260 L40,260 Z" fill="#ffffff" rx="12" />
      <path d="M160,20 L160,80 L220,80" fill="#e0f2fe" />
      
      <!-- Wave Accent lines inside document -->
      <path d="M70,140 Q130,110 190,140" fill="none" stroke="#0284c7" stroke-width="14" stroke-linecap="round" />
      <path d="M70,180 Q130,150 190,180" fill="none" stroke="#38bdf8" stroke-width="14" stroke-linecap="round" />
      <path d="M70,220 Q130,190 190,220" fill="none" stroke="#0ea5e9" stroke-width="14" stroke-linecap="round" />
    </g>
  </svg>
  `;

  await sharp(Buffer.from(iconSvg))
    .png({ quality: 95 })
    .toFile(path.join(process.cwd(), 'public', 'icon-512.png'));
  console.log('✓ Created public/icon-512.png (512x512)');
}

generateImages().catch(console.error);
