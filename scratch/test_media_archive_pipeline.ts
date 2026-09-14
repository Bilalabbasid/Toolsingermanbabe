import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { execFile } from 'child_process';
import JSZip from 'jszip';
import { AudioService } from '../src/server/services/adapters/AudioService';
import { VideoService } from '../src/server/services/adapters/VideoService';
import { ArchiveService } from '../src/server/services/adapters/ArchiveService';

const gzipAsync = promisify(zlib.gzip);
const execFileAsync = promisify(execFile);

// Helper to generate a minimal valid 1-second 8kHz mono 8-bit PCM WAV file
function createSyntheticWav(): Buffer {
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1 second
  const headerSize = 44;
  const totalSize = headerSize + numSamples;
  const buffer = Buffer.alloc(totalSize);

  // RIFF chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate, 28); // byte rate (sampleRate * 1 * 8/8)
  buffer.writeUInt16LE(1, 32);  // block align
  buffer.writeUInt16LE(8, 34);  // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);

  // Sine wave tone (440 Hz)
  for (let i = 0; i < numSamples; i++) {
    const val = 128 + Math.round(127 * Math.sin((2 * Math.PI * 440 * i) / sampleRate));
    buffer.writeUInt8(val, 44 + i);
  }

  return buffer;
}

async function runTests() {
  console.log('=== STARTING MEDIA & ARCHIVE TEST SUITE ===\n');

  const audioService = new AudioService();
  const videoService = new VideoService();
  const archiveService = new ArchiveService();

  const scratchDir = path.join(process.cwd(), 'scratch', 'test_media_out');
  await fs.mkdir(scratchDir, { recursive: true });

  // -------------------------------------------------------------
  // TEST 1: WAV -> MP3 (AudioService)
  // -------------------------------------------------------------
  console.log('1. Testing Audio: WAV to MP3 conversion...');
  const wavBuffer = createSyntheticWav();
  const mp3Result = await audioService.execute(
    wavBuffer,
    'test_audio.wav',
    { targetFormat: 'mp3', type: 'audio-konvertieren', bitrate: '128k' },
    (p) => {}
  );
  assert.strictEqual(mp3Result.fileName, 'test_audio.mp3');
  assert.strictEqual(mp3Result.mimeType, 'audio/mpeg');
  assert.strictEqual(mp3Result.data.length > 0, true, 'MP3 output should not be empty');
  // Check MP3 sync or ID3 header
  const isMp3 =
    (mp3Result.data[0] === 0x49 && mp3Result.data[1] === 0x44 && mp3Result.data[2] === 0x33) ||
    (mp3Result.data[0] === 0xff && (mp3Result.data[1] & 0xe0) === 0xe0);
  assert.strictEqual(isMp3, true, 'Result should be valid MP3 binary');
  console.log(`   ✓ Audio WAV -> MP3 succeeded (${mp3Result.data.length} bytes)`);

  // -------------------------------------------------------------
  // TEST 2: Audio Compression (AudioService)
  // -------------------------------------------------------------
  console.log('2. Testing Audio: Audio Compression...');
  const compResult = await audioService.execute(
    wavBuffer,
    'test_tone.wav',
    { targetFormat: 'mp3', type: 'audio-komprimieren', bitrate: '64k', compress: true },
    (p) => {}
  );
  assert.strictEqual(compResult.fileName, 'test_tone.mp3');
  assert.strictEqual(compResult.data.length > 0, true);
  console.log(`   ✓ Audio Compression succeeded (${compResult.data.length} bytes at 64k)`);

  // -------------------------------------------------------------
  // TEST 3: Generate synthetic 1s test video via FFmpeg
  // -------------------------------------------------------------
  console.log('3. Generating synthetic MP4 video via FFmpeg...');
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  const ffmpegBin = ffmpegInstaller.path;
  const testMp4Path = path.join(scratchDir, 'synthetic_test.mp4');

  await execFileAsync(ffmpegBin, [
    '-y',
    '-f', 'lavfi',
    '-i', 'testsrc=duration=1:size=320x240:rate=10',
    '-f', 'lavfi',
    '-i', 'sine=frequency=1000:duration=1',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    testMp4Path
  ]);
  const syntheticVideoBuffer = await fs.readFile(testMp4Path);
  console.log(`   ✓ Synthetic MP4 generated (${syntheticVideoBuffer.length} bytes)`);

  // -------------------------------------------------------------
  // TEST 4: Video in MP3 umwandeln (VideoService)
  // -------------------------------------------------------------
  console.log('4. Testing Video: Video to MP3 extraction...');
  const videoMp3Result = await audioService.execute(
    syntheticVideoBuffer,
    'synthetic_test.mp4',
    { targetFormat: 'mp3', type: 'video-in-mp3-umwandeln' },
    (p) => {}
  );
  assert.strictEqual(videoMp3Result.fileName, 'synthetic_test.mp3');
  assert.strictEqual(videoMp3Result.mimeType, 'audio/mpeg');
  assert.strictEqual(videoMp3Result.data.length > 0, true);
  console.log(`   ✓ Video to MP3 extraction succeeded (${videoMp3Result.data.length} bytes)`);

  // -------------------------------------------------------------
  // TEST 5: Video in GIF umwandeln (VideoService)
  // -------------------------------------------------------------
  console.log('5. Testing Video: Video to GIF conversion...');
  const gifResult = await videoService.execute(
    syntheticVideoBuffer,
    'synthetic_test.mp4',
    { targetFormat: 'gif', type: 'video-in-gif-umwandeln' },
    (p) => {}
  );
  assert.strictEqual(gifResult.fileName, 'synthetic_test.gif');
  assert.strictEqual(gifResult.mimeType, 'image/gif');
  const isGif = Buffer.from(gifResult.data).subarray(0, 6).toString('latin1').startsWith('GIF');
  assert.strictEqual(isGif, true, 'Output should have GIF87a/GIF89a signature');
  console.log(`   ✓ Video to GIF succeeded (${gifResult.data.length} bytes)`);

  // -------------------------------------------------------------
  // TEST 6: Video in WebM umwandeln (VideoService)
  // -------------------------------------------------------------
  console.log('6. Testing Video: MP4 to WebM conversion...');
  const webmResult = await videoService.execute(
    syntheticVideoBuffer,
    'synthetic_test.mp4',
    { targetFormat: 'webm', type: 'mp4-in-webm-umwandeln' },
    (p) => {}
  );
  assert.strictEqual(webmResult.fileName, 'synthetic_test.webm');
  assert.strictEqual(webmResult.mimeType, 'video/webm');
  // WebM EBML header (\x1a\x45\xdf\xa3)
  const isWebm =
    webmResult.data[0] === 0x1a &&
    webmResult.data[1] === 0x45 &&
    webmResult.data[2] === 0xdf &&
    webmResult.data[3] === 0xa3;
  assert.strictEqual(isWebm, true, 'Output should have valid WebM EBML header');
  console.log(`   ✓ MP4 to WebM succeeded (${webmResult.data.length} bytes)`);

  // -------------------------------------------------------------
  // TEST 7: ZIP erstellen & entpacken (ArchiveService)
  // -------------------------------------------------------------
  console.log('7. Testing Archives: ZIP erstellen & entpacken...');
  const testFiles = [
    { name: 'dokument1.txt', data: Buffer.from('CoolWave Text Dokument 1', 'utf-8') },
    { name: 'tabelle.csv', data: Buffer.from('id,name\n1,CoolWave', 'utf-8') },
  ];

  const zipCreated = await archiveService.execute(
    Buffer.alloc(0),
    'mein_archiv.zip',
    { type: 'zip-erstellen', files: testFiles },
    (p) => {}
  );
  assert.strictEqual(zipCreated.fileName, 'mein_archiv.zip');
  assert.strictEqual(zipCreated.mimeType, 'application/zip');
  assert.strictEqual(zipCreated.data.length > 0, true);

  // Now extract the created ZIP
  const zipExtracted = await archiveService.execute(
    Buffer.from(zipCreated.data),
    'mein_archiv.zip',
    { type: 'zip-entpacken' },
    (p) => {}
  );
  assert.strictEqual(zipExtracted.data.length > 0, true);
  console.log(`   ✓ ZIP create & extract succeeded`);

  // -------------------------------------------------------------
  // TEST 8: GZIP entpacken (ArchiveService)
  // -------------------------------------------------------------
  console.log('8. Testing Archives: GZIP (.gz) decompression...');
  const rawText = 'Dies ist ein komprimierter GZIP-Teststring von CoolWave.';
  const gzBuffer = await gzipAsync(Buffer.from(rawText, 'utf-8'));
  const gzResult = await archiveService.execute(
    gzBuffer,
    'test_logfile.txt.gz',
    { type: 'gzip-entpacken' },
    (p) => {}
  );
  assert.strictEqual(gzResult.fileName, 'test_logfile.txt');
  assert.strictEqual(Buffer.from(gzResult.data).toString('utf-8'), rawText);
  console.log(`   ✓ GZIP decompression succeeded (${gzResult.fileName})`);

  // -------------------------------------------------------------
  // TEST 9: Path Traversal Security Protection (ArchiveService)
  // -------------------------------------------------------------
  console.log('9. Testing Archives: Path Traversal security rejection...');
  const maliciousZip = new JSZip();
  maliciousZip.file('../../evil.txt', 'Hacker content');
  const maliciousZipBuffer = await maliciousZip.generateAsync({ type: 'nodebuffer' });

  let securityBlocked = false;
  try {
    await archiveService.execute(
      maliciousZipBuffer,
      'exploit.zip',
      { type: 'zip-entpacken' },
      (p) => {}
    );
  } catch (err: any) {
    if (err.message.includes('Sicherheitswarnung') || err.message.includes('Path Traversal')) {
      securityBlocked = true;
    }
  }
  assert.strictEqual(securityBlocked, true, 'Malicious path traversal must be rejected with security warning');
  console.log('   ✓ Path Traversal successfully blocked!');

  // Cleanup test artifacts
  await fs.rm(scratchDir, { recursive: true, force: true });

  console.log('\n======================================================');
  console.log('ALL MEDIA & ARCHIVE TESTS PASSED SUCCESSFULLY (100%)!');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
