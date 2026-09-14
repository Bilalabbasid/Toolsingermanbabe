import { IConversionService } from '../services/base.service';
import { PdfService } from '../services/adapters/PdfService';
import { PdfSecurityService } from '../services/adapters/PdfSecurityService';
import { OfficeService } from '../services/adapters/OfficeService';
import { ImageService } from '../services/adapters/ImageService';
import { OcrService } from '../services/adapters/OcrService';
import { AudioService } from '../services/adapters/AudioService';
import { VideoService } from '../services/adapters/VideoService';
import { ArchiveService } from '../services/adapters/ArchiveService';
import { jobQueue } from '../queue/queue';
import { storageProvider } from '../storage/storage';
import { ConversionJob, ServiceOptions } from '@/types/job';
import { privacyConfig } from '@/config/privacy.config';
import { getInfrastructureConfig } from '@/config/infrastructure.config';
import { generateSignedDownloadUrl } from '../security/signedUrl';
import { analyticsService } from '../analytics/analytics.service';

export class ConversionEngine {
  private services: IConversionService[] = [];
  private activeWorkers = 0;
  private activeMediaWorkers = 0;
  private activeOcrWorkers = 0;
  private isDispatcherRunning = false;

  constructor() {
    this.services = [
      new PdfSecurityService(),
      new PdfService(),
      new OfficeService(),
      new ImageService(),
      new OcrService(),
      new AudioService(),
      new VideoService(),
      new ArchiveService(),
    ];
  }

  private isMediaJob(type: string): boolean {
    return (
      type.startsWith('audio') ||
      type.startsWith('video') ||
      type.includes('mp3') ||
      type.includes('webm') ||
      type.includes('gif')
    );
  }

  private isOcrJob(type: string): boolean {
    return (
      type.startsWith('ocr_') ||
      type.startsWith('ocr-') ||
      type.includes('ocr') ||
      type.includes('durchsuchbar')
    );
  }

  getService(type: string): IConversionService | undefined {
    return this.services.find((s) => s.canHandle(type));
  }

  // Concurrent worker pool dispatcher
  async triggerWorker(): Promise<void> {
    if (this.isDispatcherRunning) return;
    this.isDispatcherRunning = true;

    const infraConfig = getInfrastructureConfig();
    const maxConcurrency = infraConfig.concurrency.general;
    const maxMediaConcurrency = infraConfig.concurrency.media;
    const maxOcrConcurrency = infraConfig.concurrency.ocr;

    try {
      while (true) {
        while (this.activeWorkers < maxConcurrency) {
          const job = await jobQueue.dequeue();
          if (!job) break;

          // Skip cancelled or expired jobs
          if (job.status === 'cancelled' || job.status === 'expired') {
            continue;
          }

          const isMedia = this.isMediaJob(job.type);
          const isOcr = this.isOcrJob(job.type);

          if (isMedia && this.activeMediaWorkers >= maxMediaConcurrency) {
            // Re-enqueue job to defer until a media slot opens
            await jobQueue.enqueue(job);
            await new Promise((r) => setTimeout(r, 100));
            break;
          }

          if (isOcr && this.activeOcrWorkers >= maxOcrConcurrency) {
            // Re-enqueue job to defer until an OCR slot opens
            await jobQueue.enqueue(job);
            await new Promise((r) => setTimeout(r, 100));
            break;
          }

          this.activeWorkers++;
          if (isMedia) this.activeMediaWorkers++;
          if (isOcr) this.activeOcrWorkers++;

          this.processJob(job).finally(() => {
            this.activeWorkers--;
            if (isMedia) this.activeMediaWorkers--;
            if (isOcr) this.activeOcrWorkers--;
            this.triggerWorker().catch((err) => console.error('[Worker Re-trigger Error]:', err));
          });
        }

        if (this.activeWorkers === 0 && jobQueue.getQueueLength() === 0) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 80));
        if (this.activeWorkers === 0 && jobQueue.getQueueLength() === 0) {
          break;
        }
      }
    } finally {
      this.isDispatcherRunning = false;
    }
  }

  private async processJob(job: ConversionJob): Promise<void> {
    const service = this.getService(job.type);

    if (!service) {
      await jobQueue.updateJob(job.id, {
        status: 'failed',
        error: `Kein Konvertierungs-Service für Job-Typ „${job.type}“ registriert.`,
        completedAt: new Date().toISOString(),
      });
      return;
    }

    const infraConfig = getInfrastructureConfig();
    let timeoutMs = infraConfig.timeouts.generalMs;
    if (this.isMediaJob(job.type)) {
      timeoutMs = infraConfig.timeouts.mediaMs;
    } else if (this.isOcrJob(job.type)) {
      timeoutMs = infraConfig.timeouts.ocrMs;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    const startTime = Date.now();
    try {
      await jobQueue.updateJob(job.id, {
        status: 'processing',
        startedAt: new Date().toISOString(),
        progress: 10,
      });

      // Track conversion started
      analyticsService.track({
        eventType: 'conversion_started',
        toolSlug: job.type,
        fileSizeBytes: job.input.sizeBytes,
      }).catch(() => {});

      // Read input from ephemeral storage
      const inputBuffer = await storageProvider.read(job.input.storagePath);

      const options: ServiceOptions = {
        targetFormat:
          (job.options as any)?.targetFormat ||
          (job as any).outputType ||
          job.type.split('_to_')[1]?.toUpperCase(),
        jobType: job.type,
        ...(job.options || {}),
      };

      const result = await service.execute(
        inputBuffer,
        job.input.originalName,
        options,
        async (progress) => {
          await jobQueue.updateJob(job.id, { progress });
        },
        abortController.signal
      );

      // Save output in isolated storage
      const savedOutput = await storageProvider.saveOutput(result.data, result.fileName);

      // Data minimization & cost saving: delete input immediately on success
      if (infraConfig.storage.purgeInputImmediately && job.input?.storagePath) {
        await storageProvider.delete(job.input.storagePath);
      }

      const downloadUrl = generateSignedDownloadUrl(job.id, job.expiration);
      const durationMs = Date.now() - startTime;

      // Track conversion completed
      analyticsService.track({
        eventType: 'conversion_completed',
        toolSlug: job.type,
        durationMs,
        outputSizeBytes: savedOutput.sizeBytes,
        fileSizeBytes: job.input.sizeBytes,
      }).catch(() => {});

      await jobQueue.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        output: {
          fileName: result.fileName,
          mimeType: result.mimeType,
          sizeBytes: savedOutput.sizeBytes,
          storagePath: savedOutput.storagePath,
          downloadUrl,
        },
      });
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Unbekannter Fehler während der Verarbeitung';
      analyticsService.track({
        eventType: 'conversion_failed',
        toolSlug: job.type,
        errorCode: errorMsg,
      }).catch(() => {});

      // Zero unnecessary retention: delete input even on failure to avoid storage leaks
      if (infraConfig.storage.purgeInputImmediately && job.input?.storagePath) {
        try {
          await storageProvider.delete(job.input.storagePath);
        } catch {
          // Best-effort cleanup
        }
      }

      await jobQueue.updateJob(job.id, {
        status: 'failed',
        error: errorMsg,
        completedAt: new Date().toISOString(),
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Global conversion engine singleton
export const conversionEngine = new ConversionEngine();
