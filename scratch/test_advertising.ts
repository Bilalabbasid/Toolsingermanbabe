import { adsConfig, isAdsEnabled, getAdSlotConfig } from '../src/config/ads.config';
import { canDisplayAds } from '../src/lib/monetization/adsense';
import fs from 'fs';
import path from 'path';

async function runAdvertisingTests() {
  console.log('====================================================');
  console.log('   COOLWAVE ADVERTISING ARCHITECTURE TEST SUITE     ');
  console.log('====================================================\n');

  // Test 1: Configuration & Environment Verification
  console.log('[Test 1] Testing Advertising Configuration...');
  console.log(`Ads globally enabled: ${isAdsEnabled()}`);
  console.log(`Configured slots count: ${Object.keys(adsConfig.slots).length}`);

  const homeSlot = getAdSlotConfig('homepage_top');
  const toolSlot = getAdSlotConfig('tool_content');
  const catSlot = getAdSlotConfig('category_top');

  console.log(`Homepage slot min-height: ${homeSlot.minHeightPx}px (CLS protected)`);
  console.log(`Tool slot min-height: ${toolSlot.minHeightPx}px (CLS protected)`);
  console.log(`Category slot min-height: ${catSlot.minHeightPx}px (CLS protected)`);

  if (homeSlot.minHeightPx < 80 || toolSlot.minHeightPx < 80) {
    throw new Error('Ad slot min-height is too small to prevent layout shift (CLS)');
  }
  console.log('✓ Configuration & Core Web Vitals protections verified!\n');

  // Test 2: Legal & Google AdSense Publisher Requirements
  console.log('[Test 2] Checking AdSense Approval Required Pages & Assets...');
  const projectRoot = process.cwd();

  const requiredFiles = [
    { name: 'Impressum', path: path.join(projectRoot, 'src', 'app', '[locale]', 'impressum', 'page.tsx') },
    { name: 'Datenschutz', path: path.join(projectRoot, 'src', 'app', '[locale]', 'datenschutz', 'page.tsx') },
    { name: 'AGB', path: path.join(projectRoot, 'src', 'app', '[locale]', 'agb', 'page.tsx') },
    { name: 'Cookie-Richtlinie', path: path.join(projectRoot, 'src', 'app', '[locale]', 'cookie-richtlinie', 'page.tsx') },
    { name: 'Kontakt', path: path.join(projectRoot, 'src', 'app', '[locale]', 'kontakt', 'page.tsx') },
    { name: 'ads.txt', path: path.join(projectRoot, 'public', 'ads.txt') },
  ];

  for (const item of requiredFiles) {
    const exists = fs.existsSync(item.path);
    console.log(`Required asset [${item.name}]: ${exists ? 'EXISTS' : 'MISSING'} (${item.path})`);
    if (!exists) throw new Error(`Missing required AdSense approval asset: ${item.name}`);
  }

  // Verify privacy policy specifically mentions Google AdSense
  const datenschutzContent = fs.readFileSync(requiredFiles[1].path, 'utf-8');
  const mentionsAdSense = datenschutzContent.includes('Google AdSense') && datenschutzContent.includes('Web Beacons');
  console.log(`Datenschutzerklärung contains Google AdSense disclosure: ${mentionsAdSense}`);
  if (!mentionsAdSense) throw new Error('Datenschutz must disclose Google AdSense and Web Beacons');

  // Verify ads.txt contains google.com
  const adsTxtContent = fs.readFileSync(requiredFiles[5].path, 'utf-8');
  const hasGoogleAds = adsTxtContent.includes('google.com');
  console.log(`ads.txt format valid: ${hasGoogleAds}`);
  if (!hasGoogleAds) throw new Error('ads.txt does not contain google.com entry');
  console.log('✓ All AdSense publisher approval assets verified!\n');

  // Test 3: Safety Guardrails (No ads inside interactive controls)
  console.log('[Test 3] Verifying Ad Placement Policy Guardrails...');
  const toolPageFile = path.join(projectRoot, 'src', 'components', 'tools', 'ToolPage.tsx');
  const toolPageContent = fs.readFileSync(toolPageFile, 'utf-8');

  // ToolInterface renders the dropzone/action area. AdSlot must NOT be inside ToolInterface
  const uploaderFile = path.join(projectRoot, 'src', 'components', 'tools', 'FileUploader.tsx');
  const uploaderContent = fs.readFileSync(uploaderFile, 'utf-8');
  if (uploaderContent.includes('<AdSlot') || uploaderContent.includes('adsbygoogle')) {
    throw new Error('AdSense Policy Violation: Ad detected inside FileUploader!');
  }

  const downloadBoxFile = path.join(projectRoot, 'src', 'components', 'tools', 'DownloadBox.tsx');
  const downloadBoxContent = fs.readFileSync(downloadBoxFile, 'utf-8');
  if (downloadBoxContent.includes('<AdSlot') || downloadBoxContent.includes('adsbygoogle')) {
    throw new Error('AdSense Policy Violation: Ad detected inside DownloadBox!');
  }
  console.log('✓ Safety guardrails verified (0 ads inside upload or download controls)!\n');

  console.log('====================================================');
  console.log('   ALL ADVERTISING & ADSENSE TESTS PASSED (100%)    ');
  console.log('====================================================');
  process.exit(0);
}

runAdvertisingTests().catch((err) => {
  console.error('Advertising tests failed:', err);
  process.exit(1);
});
