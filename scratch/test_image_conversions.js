const sharp = require('sharp');
const bmp = require('bmp-js');
const pngToIco = require('png-to-ico');
const potrace = require('potrace');

async function testConversions() {
  console.log('Testing core image conversions in sharp and helper libraries...');

  // 1. Base test image (50x50 PNG with red circle and alpha)
  const basePng = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 50, b: 50, alpha: 0.8 }
    }
  }).png().toBuffer();
  console.log('[1] Base PNG created, bytes:', basePng.length);

  // 2. PNG -> JPG
  const jpg = await sharp(basePng).flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).toBuffer();
  console.log('[2] PNG -> JPG success, bytes:', jpg.length);

  // 3. JPG -> WebP
  const webp = await sharp(jpg).webp({ quality: 85 }).toBuffer();
  console.log('[3] JPG -> WebP success, bytes:', webp.length);

  // 4. WebP -> PNG
  const pngFromWebp = await sharp(webp).png().toBuffer();
  console.log('[4] WebP -> PNG success, bytes:', pngFromWebp.length);

  // 5. PNG -> GIF
  const gif = await sharp(basePng).gif().toBuffer();
  console.log('[5] PNG -> GIF success, bytes:', gif.length);

  // 6. GIF -> JPG
  const jpgFromGif = await sharp(gif).flatten({ background: '#ffffff' }).jpeg().toBuffer();
  console.log('[6] GIF -> JPG success, bytes:', jpgFromGif.length);

  // 7. SVG -> PNG / JPG / WebP
  const svgXml = '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#3b82f6"/><circle cx="32" cy="32" r="20" fill="#ffffff"/></svg>';
  const pngFromSvg = await sharp(Buffer.from(svgXml)).png().toBuffer();
  console.log('[7] SVG -> PNG success, bytes:', pngFromSvg.length);

  // 8. PNG -> SVG (via potrace vectorization)
  const svgOutput = await new Promise((resolve, reject) => {
    potrace.trace(basePng, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
  console.log('[8] PNG -> SVG success, starts with <svg:', svgOutput.startsWith('<svg'));

  // 9. AVIF -> JPG / PNG
  const avif = await sharp(basePng).avif().toBuffer();
  const pngFromAvif = await sharp(avif).png().toBuffer();
  console.log('[9] AVIF -> PNG success, bytes:', pngFromAvif.length);

  // 10. TIFF -> JPG / PNG
  const tiff = await sharp(basePng).tiff().toBuffer();
  const pngFromTiff = await sharp(tiff).png().toBuffer();
  console.log('[10] TIFF -> PNG success, bytes:', pngFromTiff.length);

  // 11. PNG -> BMP (via bmp-js)
  const rawRgba = await sharp(basePng).ensureAlpha().raw().toBuffer();
  const bmpData = {
    data: rawRgba,
    width: 64,
    height: 64
  };
  const bmpBuf = bmp.encode(bmpData).data;
  console.log('[11] PNG -> BMP success, bytes:', bmpBuf.length);

  // 12. BMP -> PNG / JPG
  const decodedBmp = bmp.decode(bmpBuf);
  const pngFromBmp = await sharp(decodedBmp.data, {
    raw: {
      width: decodedBmp.width,
      height: decodedBmp.height,
      channels: 4
    }
  }).png().toBuffer();
  console.log('[12] BMP -> PNG success, bytes:', pngFromBmp.length);

  // 13. PNG -> ICO (via png-to-ico)
  const icoBuf = await pngToIco(basePng);
  console.log('[13] PNG -> ICO success, bytes:', icoBuf.length);

  console.log('--- ALL 13 TEST CONVERSIONS SUCCEEDED ---');
}

testConversions().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
