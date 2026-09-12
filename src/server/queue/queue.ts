import fs from 'fs/promises';
import path from 'path';
import { ConversionJob } from '@/types/job';

export interface IJobQueue {
  enqueue(job: ConversionJob): Promise<void>;
  dequeue(): Promise<ConversionJob | null>;
  getJob(id: string): Promise<ConversionJob | null>;
  updateJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | null>;
  cancelJob(id: string): Promise<boolean>;
  listJobs(): Promise<ConversionJob[]>;
  cleanupExpired(): Promise<number>;
}

export class HostingerJobQueue implements IJobQueue {
  private jobs: Map<string, ConversionJob> = new Map();
  private queueOrder: string[] = [];
  private persistenceFile: string;

  constructor() {
    this.persistenceFile = path.join(process.cwd(), '.tmp', 'queue_journal.json');
    this.loadJournal();
  }

  private async loadJournal() {
    try {
      const content = await fs.readFile(this.persistenceFile, 'utf-8');
      const data = JSON.parse(content) as ConversionJob[];
      data.forEach((job) => {
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
    try {
      await fs.mkdir(path.dirname(this.persistenceFile), { recursive: true });
      const data = Array.from(this.jobs.values());
      await fs.writeFile(this.persistenceFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Failed to save journal, in-memory remains authoritative
    }
  }

  async enqueue(job: ConversionJob): Promise<void> {
    this.jobs.set(job.id, job);
    this.queueOrder.push(job.id);
    await this.saveJournal();
  }

  async dequeue(): Promise<ConversionJob | null> {
    const nextId = this.queueOrder.shift();
    if (!nextId) return null;
    const job = this.jobs.get(nextId) || null;
    await this.saveJournal();
    return job;
  }

  async getJob(id: string): Promise<ConversionJob | null> {
    const job = this.jobs.get(id);
    if (!job) return null;

    // Check expiration
    if (new Date(job.expiration).getTime() < Date.now() && job.status !== 'expired') {
      job.status = 'expired';
      await this.saveJournal();
    }

    return job;
  }

  async updateJob(id: string, updates: Partial<ConversionJob>): Promise<ConversionJob | null> {
    const job = this.jobs.get(id);
    if (!job) return null;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    await this.saveJournal();
    return updatedJob;
  }

  async cancelJob(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'queued' || job.status === 'processing') {
      job.status = 'cancelled';
      this.queueOrder = this.queueOrder.filter((item) => item !== id);
      await this.saveJournal();
      return true;
    }

    return false;
  }

  async listJobs(): Promise<ConversionJob[]> {
    return Array.from(this.jobs.values());
  }

  async cleanupExpired(): Promise<number> {
    let count = 0;
    const now = Date.now();

    for (const [id, job] of this.jobs.entries()) {
      if (new Date(job.expiration).getTime() < now) {
        this.jobs.delete(id);
        this.queueOrder = this.queueOrder.filter((qId) => qId !== id);
        count++;
      }
    }

    if (count > 0) {
      await this.saveJournal();
    }
    return count;
  }
}

// Global singleton instance
export const jobQueue: IJobQueue = new HostingerJobQueue();
