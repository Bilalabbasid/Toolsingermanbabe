import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { storageProvider } from './storage/storage';
import { jobQueue } from './queue/queue';
import { conversionEngine } from './engine/conversion.engine';
import { ConversionJob } from '@/types/job';
import { getBatchLimits, batchConfig, validateBatchFiles } from '@/config/batch.config';
import { rateLimiter, getClientIp } from './security/rateLimiter';
import { validateUploadedFile } from './security/fileValidator';
import { boundedFormData, isProRequest, ownerId, setOwnerCookie, RequestError, requestError, parseOptions } from './security/request';

export async function submitJobs(req: NextRequest, batch: boolean): Promise<NextResponse> {
  const savedPaths: string[] = [];
  let committed = false;
  try {
    const isPro = isProRequest(req);
    const limits = getBatchLimits(isPro);
    const rate = rateLimiter.check(getClientIp(req), batch ? 'batch' : 'job', isPro);
    if (!rate.allowed) return NextResponse.json({ error: 'Zu viele Anfragen.', code: 'RATE_LIMIT_EXCEEDED' }, { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } });
    const form = await boundedFormData(req, ((batch ? limits.maxTotalBatchMB : limits.maxFileSizeMB) * 1024 * 1024) + 65536);
    const entries = batch && form.has('files') ? form.getAll('files') : form.getAll('file');
    if (!entries.length || entries.some(f => !(f instanceof File))) throw new RequestError('INVALID_FILE');
    const files = entries as File[];
    if (!batch && files.length !== 1) throw new RequestError('TOO_MANY_FILES');
    const sizeCheck = validateBatchFiles(files, isPro);
    if (!sizeCheck.valid) throw new RequestError(sizeCheck.code || 'INVALID_FILE', sizeCheck.code?.includes('LARGE') ? 413 : 400);
    const options = parseOptions(form.get('options'));
    for (const key of ['targetFormat', 'language', 'outputType', 'scanMode']) {
      const value = form.get(key);
      if (value !== null) {
        if (typeof value !== 'string' || !/^\.?[a-zA-Z0-9_+-]{1,24}$/.test(value)) throw new RequestError('INVALID_OPTIONS');
        options[key] = value;
      }
    }
    if (options.targetFormat && !/^\.?[a-zA-Z0-9]{1,10}$/.test(String(options.targetFormat))) throw new RequestError('INVALID_FORMAT');
    const rawType = form.get('type');
    if (rawType !== null && (typeof rawType !== 'string' || !/^[a-z0-9_-]{1,80}$/.test(rawType))) throw new RequestError('INVALID_JOB_TYPE');
    const owner = ownerId(req);
    const expiration = new Date(Date.now() + batchConfig.retentionMinutes * 60000).toISOString();
    const batchId = `batch_${crypto.randomUUID()}`;
    const jobs: ConversionJob[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateUploadedFile(buffer, file.name, file.type);
      if (!validation.valid) throw new RequestError(validation.code || 'INVALID_FILE');
      const ext = validation.safeFilename.split('.').pop()?.toLowerCase();
      const type = String(rawType || (options.targetFormat ? `office_${ext}_to_${String(options.targetFormat).replace(/^\./, '').toLowerCase()}` : 'office_convert'));
      if (!conversionEngine.getService(type)) throw new RequestError('UNSUPPORTED_JOB_TYPE');
      const saved = await storageProvider.saveInput(buffer, validation.safeFilename);
      savedPaths.push(saved.storagePath);
      jobs.push({ id: `job_${crypto.randomUUID()}`, ownerId: owner, type, status: 'queued',
        input: { originalName: validation.safeFilename, mimeType: file.type || 'application/octet-stream', ...saved },
        progress: 0, options: { ...options, isPro, ...(batch ? { batchId } : {}) }, createdAt: new Date().toISOString(), expiration });
    }
    // Atomic capacity check/enqueue prevents partially accepted batches and upload races.
    if (!await jobQueue.enqueueMany(jobs, batchConfig.maxQueueCapacity)) throw new RequestError('QUEUE_CAPACITY_EXCEEDED', 503);
    committed = true;
    void conversionEngine.triggerWorker().catch(() => {});
    const response = NextResponse.json(batch
      ? { batchId, totalJobs: jobs.length, jobs: jobs.map(j => ({ id: j.id, filename: j.input.originalName, sizeBytes: j.input.sizeBytes })), isPro, expiration }
      : { jobId: jobs[0].id, status: 'queued', type: jobs[0].type, expiration }, { status: 202 });
    return setOwnerCookie(req, response, owner);
  } catch (err) { return requestError(err); }
  finally {
    if (!committed) await Promise.all(savedPaths.map(p => storageProvider.delete(p)));
  }
}
