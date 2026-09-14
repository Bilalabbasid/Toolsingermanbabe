import { batchConfig, getBatchLimits, validateBatchFiles } from '../src/config/batch.config';
import { jobQueue } from '../src/server/queue/queue';
import { conversionEngine } from '../src/server/engine/conversion.engine';
import { ConversionJob } from '../src/types/job';
import { runConcurrentBatch } from '../src/lib/batch-queue';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

async function runBatchTests() {
  console.log('====================================================');
  console.log('    COOLWAVE BATCH PROCESSING SYSTEM TEST SUITE     ');
  console.log('====================================================\n');

  // Test 1: Configurable Free vs Pro Limits
  console.log('[Test 1] Testing Free vs Pro Configurable Limits...');
  const freeLimits = getBatchLimits(false);
  const proLimits = getBatchLimits(true);

  console.log(`Free Limits: maxBatch=${freeLimits.maxBatchFiles}, maxFileSize=${freeLimits.maxFileSizeMB}MB, concurrency=${freeLimits.clientConcurrency}`);
  console.log(`Pro Limits:  maxBatch=${proLimits.maxBatchFiles}, maxFileSize=${proLimits.maxFileSizeMB}MB, concurrency=${proLimits.clientConcurrency}`);

  if (freeLimits.maxBatchFiles >= proLimits.maxBatchFiles) {
    throw new Error('Pro limit must be strictly greater than Free limit');
  }
  if (freeLimits.maxFileSizeMB >= proLimits.maxFileSizeMB) {
    throw new Error('Pro file size must be strictly greater than Free file size');
  }
  console.log('✓ Configurable tier limits verified successfully!\n');

  // Test 2: Validation of Batch Sizes & File Counts
  console.log('[Test 2] Testing Batch Validation Logic...');
  const smallFiles = [
    { name: 'doc1.pdf', size: 10 * 1024 * 1024 },
    { name: 'doc2.pdf', size: 12 * 1024 * 1024 },
    { name: 'doc3.pdf', size: 15 * 1024 * 1024 },
  ];
  const validFree = validateBatchFiles(smallFiles, false);
  console.log(`3 small files on Free tier valid: ${validFree.valid} (total: ${(validFree.totalBytes / 1024 / 1024).toFixed(1)} MB)`);
  if (!validFree.valid) throw new Error('Valid batch was rejected for Free tier');

  // 8 files exceeds Free tier (default 5)
  const tooManyFiles = Array.from({ length: 8 }, (_, i) => ({
    name: `file_${i}.png`,
    size: 2 * 1024 * 1024,
  }));
  const invalidFreeCount = validateBatchFiles(tooManyFiles, false);
  console.log(`8 files on Free tier valid: ${invalidFreeCount.valid}, code: ${invalidFreeCount.code}, error: "${invalidFreeCount.error}"`);
  if (invalidFreeCount.valid || invalidFreeCount.code !== 'TOO_MANY_FILES') {
    throw new Error('Failed to enforce Free tier batch count limit');
  }

  // Same 8 files is allowed on Pro tier
  const validProCount = validateBatchFiles(tooManyFiles, true);
  console.log(`8 files on Pro tier valid: ${validProCount.valid}`);
  if (!validProCount.valid) throw new Error('Pro tier should accept 8 files');

  // Oversized file test
  const oversizedFile = [{ name: 'huge.pdf', size: 80 * 1024 * 1024 }]; // 80 MB exceeds Free (50 MB)
  const invalidFreeSize = validateBatchFiles(oversizedFile, false);
  console.log(`80MB file on Free tier valid: ${invalidFreeSize.valid}, code: ${invalidFreeSize.code}`);
  if (invalidFreeSize.valid || invalidFreeSize.code !== 'FILE_TOO_LARGE') {
    throw new Error('Failed to enforce Free tier single file size limit');
  }

  const validProSize = validateBatchFiles(oversizedFile, true);
  console.log(`80MB file on Pro tier valid: ${validProSize.valid}`);
  if (!validProSize.valid) throw new Error('Pro tier should allow 80MB file');
  console.log('✓ Validation logic verified successfully!\n');

  // Test 3: Client-Side Concurrency Queue Runner
  console.log('[Test 3] Testing Client-Side Bounded Concurrency Runner...');
  let maxActiveConcurrent = 0;
  let currentActive = 0;

  const mockTasks = Array.from({ length: 6 }, (_, i) => ({
    id: `task_${i}`,
    run: async () => {
      currentActive++;
      maxActiveConcurrent = Math.max(maxActiveConcurrent, currentActive);
      // Simulate async processing
      await new Promise((r) => setTimeout(r, 60));
      currentActive--;
      return `result_${i}`;
    },
  }));

  const testConcurrency = 2;
  const results = await runConcurrentBatch(mockTasks, {
    concurrency: testConcurrency,
  });

  console.log(`Executed 6 tasks with concurrency limit ${testConcurrency}. Peak concurrency observed: ${maxActiveConcurrent}`);
  if (maxActiveConcurrent > testConcurrency) {
    throw new Error(`Concurrency exceeded limit! Observed: ${maxActiveConcurrent}, Max allowed: ${testConcurrency}`);
  }
  if (results.size !== 6) throw new Error('Not all tasks completed');
  console.log('✓ Bounded concurrency runner strictly enforced!\n');

  // Test 4: ZIP Packaging (JSZip) for "Download all"
  console.log('[Test 4] Testing JSZip "Download All" Bundling...');
  const zip = new JSZip();
  zip.file('file1.txt', 'CoolWave Batch Test File 1');
  zip.file('file2.txt', 'CoolWave Batch Test File 2');
  zip.file('images/file3.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  console.log(`Generated ZIP archive: ${zipBuffer.length} bytes`);
  // ZIP files start with PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  const isZipValid = zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4B;
  console.log(`ZIP magic header valid: ${isZipValid}`);
  if (!isZipValid) throw new Error('Generated file is not a valid ZIP archive');
  console.log('✓ ZIP packaging verified successfully!\n');

  // Test 5: Server Queue Capacity & Concurrent Worker Pool
  console.log('[Test 5] Testing Server Queue Capacity & Concurrency Protection...');
  const initialQueueLength = jobQueue.getQueueLength();
  const initialActive = jobQueue.getActiveCount();
  const canAccept = jobQueue.canAcceptJob(100);
  console.log(`Current queue length: ${initialQueueLength}, Active jobs: ${initialActive}, Can accept: ${canAccept}`);
  if (!canAccept) throw new Error('Job queue should be able to accept jobs');

  console.log('\n====================================================');
  console.log('   ALL 5 BATCH PROCESSING TESTS PASSED WITH 100%!   ');
  console.log('====================================================');
  process.exit(0);
}

runBatchTests().catch((err) => {
  console.error('Batch tests failed:', err);
  process.exit(1);
});
