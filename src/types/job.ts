export type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface JobInput {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}

export interface JobOutput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  downloadUrl: string;
}

export interface ConversionJob {
  id: string;
  type: string;
  status: JobStatus;
  input: JobInput;
  output?: JobOutput;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  options?: ServiceOptions;
  expiration: string; // ISO string representing when the job & files expire
}

export interface ServiceOptions {
  targetFormat?: string;
  quality?: number;
  language?: string;
  password?: string;
  outputType?: 'pdf' | 'docx' | 'txt';
  maxPages?: number;
  [key: string]: unknown;
}

export interface JobConfig {
  maxFileSizeFreeMB: number;
  maxFileSizeProMB: number;
  processingTimeoutMs: number;
  retentionMinutes: number;
}
