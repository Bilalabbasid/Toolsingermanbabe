import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

import fsSync from 'fs';

// Lazy-resolve ffmpeg path without dynamic require
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
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
};

export class AudioService implements IConversionService {
  name = 'AudioService';
  supportedTypes = [
    'audio_convert',
    'audio_compress',
    'audio-konvertieren',
    'audio-komprimieren',
    'video_to_mp3',
    'video-in-mp3-umwandeln',
  ];

  canHandle(type: string): boolean {
    return (
      this.supportedTypes.includes(type) ||
      type.startsWith('audio_') ||
      type.startsWith('audio-') ||
      type === 'video-in-mp3-umwandeln'
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

    // 1. Resource & file-size guards
    const maxFileSizeMB = parseInt(process.env.MAX_AUDIO_SIZE_MB || '50', 10);
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (inputBuffer.length > maxFileSizeBytes) {
      throw new Error(`Die Audiodatei überschreitet das Limit von ${maxFileSizeMB} MB.`);
    }

    if (signal?.aborted) throw new Error('Operation abgebrochen');

    // 2. Prepare isolated workspace
    const workDir = path.join(process.cwd(), '.tmp', 'workdir', `audio_${crypto.randomUUID()}`);
    await fs.mkdir(workDir, { recursive: true });

    const inputExt = path.extname(inputName).toLowerCase() || '.mp3';
    const inputPath = path.join(workDir, `input${inputExt}`);
    await fs.writeFile(inputPath, inputBuffer);

    const baseName = path.basename(inputName, path.extname(inputName));
    const targetFormat = (options.targetFormat || 'mp3').toLowerCase().replace(/^\./, '');
    const outputPath = path.join(workDir, `output.${targetFormat}`);

    onProgress(25);

    try {
      // 3. Configure FFmpeg arguments based on operation
      const args: string[] = ['-y', '-i', inputPath];

      const isCompress =
        options.type === 'audio_compress' ||
        options.type === 'audio-komprimieren' ||
        options.compress === true;

      const customBitrate = typeof options.bitrate === 'string' ? options.bitrate : '192k';

      if (isCompress) {
        // Bitrate reduction for compression
        const bitrate = typeof options.bitrate === 'string' ? options.bitrate : '128k';
        if (targetFormat === 'mp3' || inputExt === '.mp3') {
          args.push('-c:a', 'libmp3lame', '-b:a', bitrate);
        } else if (targetFormat === 'aac' || targetFormat === 'm4a') {
          args.push('-c:a', 'aac', '-b:a', bitrate);
        } else if (targetFormat === 'ogg') {
          args.push('-c:a', 'libvorbis', '-b:a', bitrate);
        } else {
          args.push('-b:a', bitrate);
        }
      } else {
        // Format transcode mapping
        switch (targetFormat) {
          case 'mp3':
            args.push('-c:a', 'libmp3lame', '-b:a', customBitrate);
            break;
          case 'wav':
            args.push('-c:a', 'pcm_s16le');
            break;
          case 'aac':
          case 'm4a':
            args.push('-c:a', 'aac', '-b:a', customBitrate);
            break;
          case 'flac':
            args.push('-c:a', 'flac');
            break;
          case 'ogg':
            args.push('-c:a', 'libvorbis', '-q:a', '4');
            break;
          default:
            args.push('-c:a', 'libmp3lame', '-b:a', customBitrate);
        }
      }

      // Max duration safeguard (default 600 seconds / 10 mins)
      const maxDurationSec = parseInt(process.env.MAX_AUDIO_DURATION_SEC || '600', 10);
      args.push('-t', maxDurationSec.toString());
      args.push(outputPath);

      onProgress(40);
      if (signal?.aborted) throw new Error('Operation abgebrochen');

      // 4. Execute isolated FFmpeg child process with hard timeout
      const ffmpegBin = getFfmpegPath();
      await new Promise<void>((resolve, reject) => {
        const timeoutMs = 45000; // 45 seconds timeout
        const child = execFile(
          /*turbopackIgnore: true*/ ffmpegBin,
          args,
          { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
          (err, _stdout, stderr) => {
            if (err) {
              if (err.killed) {
                return reject(new Error('Audio-Verarbeitung wegen Zeitüberschreitung (Timeout 45s) abgebrochen.'));
              }
              return reject(new Error(`FFmpeg Audio-Fehler: ${err.message}. ${stderr ? stderr.slice(-300) : ''}`));
            }
            resolve();
          }
        );

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

      // 5. Read output result
      const outputBuffer = await fs.readFile(outputPath);
      onProgress(100);

      return {
        data: outputBuffer,
        fileName: `${baseName}.${targetFormat}`,
        mimeType: MIME_MAP[targetFormat] || `audio/${targetFormat}`,
      };
    } finally {
      // 6. Clean up isolated working directory
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (err) {
        console.error('[AudioService Cleanup Error]:', err);
      }
    }
  }
}
