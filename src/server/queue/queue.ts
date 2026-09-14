import fs from 'fs/promises';
import path from 'path';
import { ConversionJob } from '@/types/job';
import { storageProvider } from '../storage/storage';

export interface IJobQueue {
  enqueueMany(jobs: ConversionJob[], maxCapacity: number): Promise<boolean>;
  enqueue(job: ConversionJob): Promise<void>;
  dequeue(): Promise<ConversionJob | null>;
  getJob(id: string): Promise<ConversionJob | null>;
  updateJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | null>;
  cancelJob(id: string): Promise<boolean>;
  listJobs(): Promise<ConversionJob[]>;
  cleanupExpired(): Promise<number>;
  getQueueLength(): number;
  getActiveCount(): number;
  canAcceptJob(maxCapacity?: number): boolean;
}

export class HostingerJobQueue implements IJobQueue {
  private jobs: Map<string, ConversionJob> = new Map();
  private queueOrder: string[] = [];
  private persistenceFile: string;
  private ready: Promise<void>;
  private saving: Promise<void> = Promise.resolve();

  constructor() {
    this.persistenceFile = path.join(process.env.COOLWAVE_TEMP_DIR || path.join(process.cwd(), '.tmp'), 'queue_journal.json');
    this.ready = this.loadJournal();
    const timer = setInterval(() => { void this.cleanupExpired(); }, 60000);
    timer.unref();
  }

  private async loadJournal() {
    try {
      const content = await fs.readFile(this.persistenceFile, 'utf-8');
      const data = JSON.parse(content) as ConversionJob[];
      data.forEach((job) => {
        if (job.status === 'processing') {
          job.status = 'failed';
          job.error = 'Verarbeitung durch Server-Neustart unterbrochen.';
        }
        this.jobs.set(job.id, job);
        if (job.status === 'queued') {
          this.queueOrder.push(job.id);
        }
      });
    } catch {
      // Persistence file does not exist yet
    }
  }

  private async saveJournal() {
    this.saving = this.saving.then(async () => {
    try {
      await fs.mkdir(path.dirname(this.persistenceFile), { recursive: true });
      // Passwords/options and source filenames are unnecessary for terminal jobs.
      const data = Array.from(this.jobs.values()).map(job => ['queued', 'processing'].includes(job.status) ? job : { ...job, options: undefined });
      await fs.writeFile(this.persistenceFile + '.new', JSON.stringify(data), { encoding: 'utf-8', mode: 0o600 });
      await fs.rename(this.persistenceFile + '.new', this.persistenceFile);
    } catch {
      // Failed to save journal, in-memory remains authoritative
    }
    });
    await this.saving;
  }

  async enqueueMany(jobs: ConversionJob[], maxCapacity: number): Promise<boolean> {
    await this.ready;
    if (this.getActiveCount() + jobs.length > maxCapacity) return false;
    for (const job of jobs) {
      this.jobs.set(job.id, job);
      this.queueOrder.push(job.id);
    }
    await this.saveJournal();
    return true;
  }

  async enqueue(job: ConversionJob): Promise<void> {
    await this.ready;
    this.jobs.set(job.id, job);
    this.queueOrder.push(job.id);
    await this.saveJournal();
  }

  async dequeue(): Promise<ConversionJob | null> {
    await this.ready;
    const nextId = this.queueOrder.shift();
    if (!nextId) return null;
    const job = this.jobs.get(nextId) || null;
    await this.saveJournal();
    return job;
  }

  async getJob(id: string): Promise<ConversionJob | null> {
    await this.ready;
    const job = this.jobs.get(id);
    if (!job) return null;

    // Check expiration
    if (new Date(job.expiration).getTime() < Date.now() && job.status !== 'expired') {
      job.status = 'expired';
      await storageProvider.delete(job.input.storagePath);
      if (job.output) await storageProvider.delete(job.output.storagePath);
      await this.saveJournal();
    }

    return job;
  }

  async updateJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | null> {
    await this.ready;
    const job = this.jobs.get(id);
    if (!job) return null;

    if (['cancelled', 'expired'].includes(job.status)) return job;
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    await this.saveJournal();
    return updatedJob;
  }

  async cancelJob(id: string): Promise<boolean> {
    await this.ready;
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'queued' || job.status === 'processing') {
      job.status = 'cancelled';
      await storageProvider.delete(job.input.storagePath);
      this.queueOrder = this.queueOrder.filter((item) => item !== id);
      await this.saveJournal();
      return true;
    }

    return false;
  }

  async listJobs(): Promise<ConversionJob[]> {
    await this.ready;
    return Array.from(this.jobs.values());
  }

  async cleanupExpired(): Promise<number> {
    await this.ready;
    let count = 0;
    const now = Date.now();

    for (const [id, job] of this.jobs.entries()) {
      if (['failed', 'cancelled'].includes(job.status)) await storageProvider.delete(job.input.storagePath);
      if (new Date(job.expiration).getTime() < now) {
        await storageProvider.delete(job.input.storagePath);
        if (job.output) await storageProvider.delete(job.output.storagePath);
        this.jobs.delete(id);
        this.queueOrder = this.queueOrder.filter((qId) => qId !== id);
        count++;
      }
    }

    if (count > 0) {
      await this.saveJournal();
    }
    await storageProvider.cleanupExpired(Number(process.env.TEMP_FILE_RETENTION_MINUTES || 15));
    return count;
  }

  getQueueLength(): number {
    return this.queueOrder.length;
  }

  getActiveCount(): number {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.status === 'processing' || job.status === 'queued') {
        count++;
      }
    }
    return count;
  }

  canAcceptJob(maxCapacity: number = 100): boolean {
    return this.getActiveCount() < maxCapacity;
  }
}

// Global singleton instance
export const jobQueue: IJobQueue = new HostingerJobQueue();
