/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const bmp = require('bmp-js');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;
const { decodeIco } = require('icojs');

const BASE_URL = 'http://localhost:3001';

// Helper to poll a job until completed
async function waitForJob(jobId, timeoutSeconds = 30) {
  for (let i = 0; i < timeoutSeconds; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}`);
    if (!res.ok) continue;
    const data = await res.json();
    if (data.status === 'completed') return data;
    if (data.status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${data.error}`);
    }
  }
  throw new Error(`Job ${jobId} timed out after ${timeoutSeconds}s`);
}

// Helper to send a file to /api/v1/jobs
async function runConversion(buffer, filename, targetFormat) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('type', 'image_convert');
  form.append('targetFormat', targetFormat);
  form.append('options', JSON.stringify({ targetFormat }));

  const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`POST /api/v1/jobs error: ${res.status} ${await res.text()}`);
  }

  const job = await res.json();
  const completedJob = await waitForJob(job.jobId);

  // Fetch resulting output
  const dlRes = await fetch(`${BASE_URL}${completedJob.output.downloadUrl}`);
  if (!dlRes.ok) throw new Error(`Download error: ${dlRes.status}`);
  const outBuffer = Buffer.from(await dlRes.arrayBuffer());

  return {
    job: completedJob,
    buffer: outBuffer,
    mimeType: completedJob.output.mimeType,
  };
}

async function runSuite() {
  console.log('====================================================');
  console.log('  COOLWAVE COMPREHENSIVE IMAGE CONVERSION TEST SUITE');
  console.log('====================================================');

  // --- Fixture Generation ---
  console.log('\n[Fixtures] Creating sample images for all test formats...');

  // 1. PNG Fixture (with Alpha transparency)
  const pngFixture = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 59, g: 130, b: 246, alpha: 0.8 },
    },
  })
    .png()
    .toBuffer();

  // 2. JPG Fixture
  const jpgFixture = await sharp(pngFixture)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 90 })
    .toBuffer();

  // 3. WebP Fixture
  const webpFixture = await sharp(pngFixture).webp({ quality: 90 }).toBuffer();

  // 4. GIF Fixture
  const gifFixture = await sharp(pngFixture).gif().toBuffer();

  // 5. SVG Fixture
  const svgFixture = Buffer.from(
    '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#10b981"/><circle cx="32" cy="32" r="18" fill="#ffffff"/></svg>',
    'utf-8'
  );

  // 6. AVIF Fixture
  const avifFixture = await sharp(pngFixture).avif({ quality: 80 }).toBuffer();

  // 7. TIFF Fixture
  const tiffFixture = await sharp(pngFixture).tiff().toBuffer();

  // 8. BMP Fixture
  const rawRgba = await sharp(pngFixture).ensureAlpha().raw().toBuffer();
  const bmpFixture = bmp.encode({ data: rawRgba, width: 64, height: 64 }).data;

  // 9. ICO Fixture
  const icoFixture = await pngToIco(pngFixture);

  console.log('Fixtures generated successfully!');

  // Define test cases: [Name, inputBuffer, inputFilename, targetFormat, validator]
  const tests = [
    // 1. JPG -> PNG
    {
      name: 'JPG → PNG',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
    },
    // 2. PNG → JPG
    {
      name: 'PNG → JPG',
      input: pngFixture,
      filename: 'test.png',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
    },
    // 3. JPG → WebP
    {
      name: 'JPG → WebP',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'webp',
      check: (buf) => buf.toString('ascii', 8, 12) === 'WEBP',
    },
    // 4. WebP → JPG
    {
      name: 'WebP → JPG',
      input: webpFixture,
      filename: 'test.webp',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 5. PNG → WebP
    {
      name: 'PNG → WebP',
      input: pngFixture,
      filename: 'test.png',
      target: 'webp',
      check: (buf) => buf.toString('ascii', 8, 12) === 'WEBP',
    },
    // 6. WebP → PNG
    {
      name: 'WebP → PNG',
      input: webpFixture,
      filename: 'test.webp',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 7. GIF → JPG
    {
      name: 'GIF → JPG',
      input: gifFixture,
      filename: 'test.gif',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 8. GIF → PNG
    {
      name: 'GIF → PNG',
      input: gifFixture,
      filename: 'test.gif',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 9. PNG → GIF
    {
      name: 'PNG → GIF',
      input: pngFixture,
      filename: 'test.png',
      target: 'gif',
      check: (buf) => buf.toString('ascii', 0, 3) === 'GIF',
    },
    // 10. JPG → GIF
    {
      name: 'JPG → GIF',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'gif',
      check: (buf) => buf.toString('ascii', 0, 3) === 'GIF',
    },
    // 11. SVG → PNG
    {
      name: 'SVG → PNG',
      input: svgFixture,
      filename: 'test.svg',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 12. SVG → JPG
    {
      name: 'SVG → JPG',
      input: svgFixture,
      filename: 'test.svg',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 13. SVG → WebP
    {
      name: 'SVG → WebP',
      input: svgFixture,
      filename: 'test.svg',
      target: 'webp',
      check: (buf) => buf.toString('ascii', 8, 12) === 'WEBP',
    },
    // 14. PNG → SVG (Potrace vectorization)
    {
      name: 'PNG → SVG (Vectorization)',
      input: pngFixture,
      filename: 'test.png',
      target: 'svg',
      check: (buf) => buf.toString('utf-8').includes('<svg'),
    },
    // 15. AVIF → JPG
    {
      name: 'AVIF → JPG',
      input: avifFixture,
      filename: 'test.avif',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 16. AVIF → PNG
    {
      name: 'AVIF → PNG',
      input: avifFixture,
      filename: 'test.avif',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 17. AVIF → WebP
    {
      name: 'AVIF → WebP',
      input: avifFixture,
      filename: 'test.avif',
      target: 'webp',
      check: (buf) => buf.toString('ascii', 8, 12) === 'WEBP',
    },
    // 18. TIFF → JPG
    {
      name: 'TIFF → JPG',
      input: tiffFixture,
      filename: 'test.tiff',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 19. TIFF → PNG
    {
      name: 'TIFF → PNG',
      input: tiffFixture,
      filename: 'test.tiff',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 20. BMP → JPG
    {
      name: 'BMP → JPG',
      input: bmpFixture,
      filename: 'test.bmp',
      target: 'jpg',
      check: (buf) => buf[0] === 0xff && buf[1] === 0xd8,
    },
    // 21. BMP → PNG
    {
      name: 'BMP → PNG',
      input: bmpFixture,
      filename: 'test.bmp',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 22. ICO → PNG
    {
      name: 'ICO → PNG',
      input: icoFixture,
      filename: 'test.ico',
      target: 'png',
      check: (buf) => buf[0] === 0x89 && buf[1] === 0x50,
    },
    // 23. PNG → ICO
    {
      name: 'PNG → ICO',
      input: pngFixture,
      filename: 'test.png',
      target: 'ico',
      check: (buf) => buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1,
    },
    // 24. Reverse: JPG → BMP
    {
      name: 'JPG → BMP',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'bmp',
      check: (buf) => buf[0] === 0x42 && buf[1] === 0x4d, // "BM"
    },
    // 25. Reverse: PNG → BMP
    {
      name: 'PNG → BMP',
      input: pngFixture,
      filename: 'test.png',
      target: 'bmp',
      check: (buf) => buf[0] === 0x42 && buf[1] === 0x4d, // "BM"
    },
    // 26. Reverse: JPG → TIFF
    {
      name: 'JPG → TIFF',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'tiff',
      check: (buf) => (buf[0] === 0x49 && buf[1] === 0x49) || (buf[0] === 0x4d && buf[1] === 0x4d),
    },
    // 27. Reverse: PNG → TIFF
    {
      name: 'PNG → TIFF',
      input: pngFixture,
      filename: 'test.png',
      target: 'tiff',
      check: (buf) => (buf[0] === 0x49 && buf[1] === 0x49) || (buf[0] === 0x4d && buf[1] === 0x4d),
    },
    // 28. Reverse: JPG → ICO
    {
      name: 'JPG → ICO',
      input: jpgFixture,
      filename: 'test.jpg',
      target: 'ico',
      check: (buf) => buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1,
    },
  ];

  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    process.stdout.write(`[${i + 1}/${tests.length}] Testing ${t.name}... `);

    try {
      const res = await runConversion(t.input, t.filename, t.target);
      const isValid = t.check(res.buffer);

      if (!isValid) {
        throw new Error(`Magic bytes verification failed for ${t.name}`);
      }

      console.log(`OK! (Size: ${res.buffer.length} bytes, MIME: ${res.mimeType})`);
      passed++;
    } catch (err) {
      console.log(`FAILED!`);
      console.error(`  Error: ${err.message}`);
      throw err;
    }
  }

  console.log('\n====================================================');
  console.log(`  ALL ${passed} IMAGE CONVERSION TESTS PASSED (100%)!`);
  console.log('====================================================');
}

runSuite().catch((err) => {
  console.error('\nIMAGE TEST SUITE ERROR:', err);
  process.exit(1);
});
