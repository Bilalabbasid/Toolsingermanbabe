/**
 * Runs one media conversion with ffmpeg.wasm entirely in the browser.
 */
import type { FFFSType } from '@ffmpeg/ffmpeg';
import { getFFmpeg, resetFFmpeg } from './ffmpegClient';
import { buildMediaJob, explainFfmpegFailure, type MediaJobOptions } from './mediaArgs';

export interface ConvertCallbacks {
  /** 0..1 while the FFmpeg core is downloaded (first use only). */
  onEngineDownload?: (fraction: number) => void;
  /** 0..1 conversion progress reported by FFmpeg. */
  onProgress?: (fraction: number) => void;
  onStage?: (stage: 'loading' | 'preparing' | 'converting' | 'finalizing') => void;
  /** Set to true by the caller to signal that a cancel was requested. */
  isCancelled?: () => boolean;
}

export interface ConvertResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
  kind: 'audio' | 'video' | 'gif';
}

export class MediaCancelledError extends Error {
  constructor() {
    super('Die Konvertierung wurde abgebrochen.');
    this.name = 'MediaCancelledError';
  }
}

const INPUT_DIR = '/input';

export async function convertMedia(
  file: File,
  options: Omit<MediaJobOptions, 'inputPath' | 'inputName'>,
  cb: ConvertCallbacks = {}
): Promise<ConvertResult> {
  cb.onStage?.('loading');
  const ffmpeg = await getFFmpeg(cb.onEngineDownload);
  if (cb.isCancelled?.()) throw new MediaCancelledError();

  cb.onStage?.('preparing');
  try {
    await ffmpeg.createDir(INPUT_DIR);
  } catch {
    /* already exists */
  }

  // Mount the File read-only via WORKERFS (no copy into WASM memory);
  // fall back to writing the bytes if mounting is not available.
  let mounted = false;
  let inputPath = `${INPUT_DIR}/${file.name}`;
  try {
    mounted = Boolean(await ffmpeg.mount('WORKERFS' as FFFSType, { files: [file] }, INPUT_DIR));
  } catch {
    mounted = false;
  }
  if (!mounted) {
    inputPath = `${INPUT_DIR}/eingabe.${(file.name.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '')}`;
    await ffmpeg.writeFile(inputPath, new Uint8Array(await file.arrayBuffer()));
  }

  const plan = buildMediaJob({ ...options, inputPath, inputName: file.name });
  const logTail: string[] = [];
  const onLog = ({ message }: { message: string }) => {
    logTail.push(message);
    if (logTail.length > 80) logTail.shift();
  };
  const onProgress = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) cb.onProgress?.(Math.max(0, Math.min(1, progress)));
  };
  ffmpeg.on('log', onLog);
  ffmpeg.on('progress', onProgress);

  try {
    cb.onStage?.('converting');
    let exitCode: number;
    try {
      exitCode = await ffmpeg.exec(plan.args);
    } catch (err) {
      if (cb.isCancelled?.()) throw new MediaCancelledError();
      // The WASM instance is unusable after a crash (e.g. out of memory) → reload next time.
      resetFFmpeg();
      console.error('[ffmpeg] exec crashed', err, logTail.slice(-15).join('\n'));
      throw new Error(explainFfmpegFailure(`${String(err)}\n${logTail.join('\n')}`));
    }
    if (cb.isCancelled?.()) throw new MediaCancelledError();
    if (exitCode !== 0) {
      console.error('[ffmpeg] exit code', exitCode, logTail.slice(-15).join('\n'));
      throw new Error(explainFfmpegFailure(logTail.join('\n')));
    }

    cb.onStage?.('finalizing');
    const data = await ffmpeg.readFile(plan.outputPath);
    if (!(data instanceof Uint8Array) || data.length === 0) {
      throw new Error('FFmpeg hat keine Ausgabedatei erzeugt. Enthält die Datei eine passende Audio- bzw. Videospur?');
    }
    await ffmpeg.deleteFile(plan.outputPath).catch(() => undefined);
    return {
      blob: new Blob([data as BlobPart], { type: plan.mimeType }),
      fileName: plan.outputName,
      mimeType: plan.mimeType,
      kind: plan.kind,
    };
  } finally {
    ffmpeg.off('log', onLog);
    ffmpeg.off('progress', onProgress);
    if (!cb.isCancelled?.()) {
      if (mounted) await ffmpeg.unmount(INPUT_DIR).catch(() => undefined);
      else await ffmpeg.deleteFile(inputPath).catch(() => undefined);
    }
  }
}

/** Aborts a running conversion by terminating the FFmpeg worker. */
export function cancelMediaConversion(): void {
  resetFFmpeg();
}
