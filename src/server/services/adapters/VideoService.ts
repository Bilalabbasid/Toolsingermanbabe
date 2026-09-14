import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

import fsSync from 'fs';

let cachedFfmpegPath: string | null = null;
function getFfmpegPath(): string {
  if (cachedFfmpegPath) return cachedFfmpegPath;
  if (process.env.FFMPEG_PATH && fsSync.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }
  const winBinary = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
  if (fsSync.existsSync(winBinary)) {
    cachedFfmpegPath = winBinary;
    return cachedFfmpegPath;
  }
  const linuxBinary = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'linux-x64', 'ffmpeg');
  if (fsSync.existsSync(linuxBinary)) {
    cachedFfmpegPath = linuxBinary;
    return cachedFfmpegPath;
  }
  cachedFfmpegPath = 'ffmpeg';
  return cachedFfmpegPath;
}

const MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  gif: 'image/gif',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
};

export class VideoService implements IConversionService {
  name = 'VideoService';
  supportedTypes = [
    'video_convert',
    'video_compress',
    'video_to_gif',
    'video_to_mp4',
    'mp4_to_webm',
    'video-konvertieren',
    'video-komprimieren',
    'video-in-gif-umwandeln',
    'video-in-mp4-umwandeln',
    'mp4-in-webm-umwandeln',
  ];

  canHandle(type: string): boolean {
    return (
      this.supportedTypes.includes(type) ||
      type.startsWith('video_') ||
      type.startsWith('video-') ||
      type.startsWith('mp4-')
    );
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);

    // 1. File size limits
    const maxVideoMB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '100', 10);
    const maxFileSizeBytes = maxVideoMB * 1024 * 1024;
    if (inputBuffer.length > maxFileSizeBytes) {
      throw new Error(`Die Videodatei überschreitet das zulässige Limit von ${maxVideoMB} MB.`);
    }

    if (signal?.aborted) throw new Error('Operation abgebrochen');

    if (options.targetFormat && !/^\.?(mp4|webm|gif|mov|avi|mkv)$/i.test(String(options.targetFormat))) throw new Error('Unsupported output format.');
    // 2. Prepare isolated workspace
    const workDir = path.join(process.env.COOLWAVE_TEMP_DIR || path.join(process.cwd(), '.tmp'), 'workdir', `video_${crypto.randomUUID()}`);
    await fs.mkdir(workDir, { recursive: true });

    const inputExt = path.extname(inputName).toLowerCase() || '.mp4';
    const inputPath = path.join(workDir, `input${inputExt}`);
    await fs.writeFile(inputPath, inputBuffer);

    const baseName = path.basename(inputName, path.extname(inputName));
    let targetFormat = (options.targetFormat || 'mp4').toLowerCase().replace(/^\./, '');

    // Infer target format if specific tool type used
    if (options.type === 'video-in-gif-umwandeln' || options.type === 'video_to_gif') {
      targetFormat = 'gif';
    } else if (options.type === 'mp4-in-webm-umwandeln' || options.type === 'mp4_to_webm') {
      targetFormat = 'webm';
    } else if (options.type === 'video-in-mp4-umwandeln' || options.type === 'video_to_mp4') {
      targetFormat = 'mp4';
    }

    const outputPath = path.join(workDir, `output.${targetFormat}`);
    onProgress(25);

    try {
      // 3. Build FFmpeg command arguments
      const args: string[] = ['-y', '-protocol_whitelist', 'pipe', '-format_whitelist', 'mov,mp3,wav,aac,flac,ogg,matroska,avi', '-i', 'pipe:0'];

      const isCompress =
        options.type === 'video_compress' ||
        options.type === 'video-komprimieren' ||
        options.compress === true;

      if (targetFormat === 'gif') {
        // High quality GIF generation
        args.push('-vf', 'fps=10,scale=min(480\\,iw):-1:flags=lanczos');
      } else if (isCompress) {
        // Smart H.264 compression: CRF 28, fast preset, downscale to max 1080p, AAC 128k
        args.push(
          '-c:v',
          'libx264',
          '-crf',
          '28',
          '-preset',
          'fast',
          '-vf',
          'scale=min(1280\\,iw):-2',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-movflags',
          '+faststart'
        );
      } else if (targetFormat === 'webm') {
        // WebM encoding with VP8 and Vorbis
        args.push('-c:v', 'libvpx', '-crf', '10', '-b:v', '1M', '-c:a', 'libvorbis');
      } else if (targetFormat === 'mp4') {
        // Universal web-compatible MP4
        args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart');
      } else if (targetFormat === 'mov') {
        args.push('-c:v', 'libx264', '-c:a', 'aac');
      } else if (targetFormat === 'mkv') {
        args.push('-c:v', 'libx264', '-c:a', 'aac');
      } else if (targetFormat === 'avi') {
        args.push('-c:v', 'mpeg4', '-vtag', 'xvid', '-c:a', 'libmp3lame');
      } else {
        args.push('-c:v', 'libx264', '-c:a', 'aac');
      }

      // Safeguard duration cap (600 seconds / 10 mins)
      const maxDurationSec = parseInt(process.env.MAX_VIDEO_DURATION_SEC || '600', 10);
      args.push('-t', maxDurationSec.toString());
      args.push(outputPath);

      onProgress(40);
      if (signal?.aborted) throw new Error('Operation abgebrochen');

      // 4. Execute isolated FFmpeg child process with hard 90s timeout
      const ffmpegBin = getFfmpegPath();
      await new Promise<void>((resolve, reject) => {
        const timeoutMs = 90000; // 90 seconds timeout
        const child = execFile(
          /*turbopackIgnore: true*/ ffmpegBin,
          args,
          { cwd: workDir, windowsHide: true, timeout: timeoutMs, maxBuffer: 15 * 1024 * 1024 },
          (err, _stdout, stderr) => {
            if (err) {
              if (err.killed) {
                return reject(new Error('Videoverarbeitung wegen Zeitüberschreitung (Timeout 90s) abgebrochen.'));
              }
              return reject(new Error(`FFmpeg Video-Fehler: ${err.message}. ${stderr ? stderr.slice(-300) : ''}`));
            }
            resolve();
          }
        );

        child.stdin?.on('error', () => {});
        child.stdin?.end(inputBuffer);
        if (signal) {
          signal.addEventListener('abort', () => {
            try {
              child.kill('SIGTERM');
            } catch {}
            reject(new Error('Operation abgebrochen'));
          });
        }
      });

      onProgress(85);
      if (signal?.aborted) throw new Error('Operation abgebrochen');

      // 5. Read output buffer
      const outputBuffer = await fs.readFile(outputPath);
      onProgress(100);

      return {
        data: outputBuffer,
        fileName: `${baseName}.${targetFormat}`,
        mimeType: MIME_MAP[targetFormat] || `video/${targetFormat}`,
      };
    } finally {
      // 6. Clean up isolated working directory
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (err) {
        console.error('[VideoService Cleanup Error]:', err);
      }
    }
  }
}
