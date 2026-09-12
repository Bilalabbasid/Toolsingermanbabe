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

export class ConversionEngine {
  private services: IConversionService[] = [];
  private isWorkerRunning = false;

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

  getService(type: string): IConversionService | undefined {
    return this.services.find((s) => s.canHandle(type));
  }

  // Asynchronous worker processor
  async triggerWorker(): Promise<void> {
    if (this.isWorkerRunning) return;
    this.isWorkerRunning = true;

    try {
      while (true) {
        const job = await jobQueue.dequeue();
        if (!job) break;

        // Skip cancelled or expired jobs
        if (job.status === 'cancelled' || job.status === 'expired') {
          continue;
        }

        await this.processJob(job);
      }
    } finally {
      this.isWorkerRunning = false;
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

    const timeoutMs = parseInt(process.env.PROCESSING_TIMEOUT_MS || '60000', 10);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    try {
      await jobQueue.updateJob(job.id, {
        status: 'processing',
        startedAt: new Date().toISOString(),
        progress: 10,
      });

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

      await jobQueue.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        output: {
          fileName: result.fileName,
          mimeType: result.mimeType,
          sizeBytes: savedOutput.sizeBytes,
          storagePath: savedOutput.storagePath,
          downloadUrl: `/api/v1/jobs/${job.id}/download`,
        },
      });
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Unbekannter Fehler während der Verarbeitung';
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
