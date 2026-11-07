/**
 * Builds FFmpeg command lines for the media tools. Pure module (no DOM), so it
 * can be tested under Node against the real ffmpeg-core WASM build.
 *
 * ffmpeg-core 0.12 (single thread) ships libx264, libvpx (VP8/VP9), libmp3lame,
 * libvorbis, native AAC/FLAC/PCM and the GIF encoder. (libopus and VP9 crash
 * with "memory access out of bounds" in this build, so WebM uses VP8 + Vorbis.)
 */

export type MediaToolId =
  | 'audio-konvertieren'
  | 'audio-komprimieren'
  | 'video-in-mp3-umwandeln'
  | 'video-konvertieren'
  | 'video-komprimieren'
  | 'video-in-gif-umwandeln'
  | 'video-in-mp4-umwandeln'
  | 'mp4-in-webm-umwandeln';

export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a';
export type AudioBitrate = '64k' | '96k' | '128k' | '192k' | '256k';
export type VideoFormat = 'mp4' | 'webm' | 'gif' | 'mov' | 'avi' | 'mkv';
export type CompressionLevel = 'high' | 'balanced' | 'low';
export type GifFps = 10 | 15;

export const AUDIO_INPUT_EXTENSIONS = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.oga', '.opus', '.m4a', '.wma', '.aiff', '.aif'];
export const VIDEO_INPUT_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.3gp', '.mpeg', '.mpg', '.ts'];

/** Maximum GIF length in seconds (GIFs get huge quickly). */
export const GIF_MAX_SECONDS = 30;

export interface MediaJobOptions {
  toolId: MediaToolId;
  /** Path of the input inside the FFmpeg file system. */
  inputPath: string;
  /** Original file name (used for the output name and format detection). */
  inputName: string;
  targetAudioFormat?: AudioFormat;
  audioBitrate?: AudioBitrate;
  targetVideoFormat?: VideoFormat;
  compressionLevel?: CompressionLevel;
  gifFps?: GifFps;
}

export interface MediaJobPlan {
  args: string[];
  outputPath: string;
  outputName: string;
  mimeType: string;
  kind: 'audio' | 'video' | 'gif';
}

const MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  webm: 'video/webm',
  gif: 'image/gif',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
};

export function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : '';
}

export function baseNameOf(name: string): string {
  const stripped = name.replace(/\.[^.]+$/, '');
  return (stripped || 'datei').replace(/[\\/:*?"<>|]+/g, '_');
}

export function isAudioInputTool(toolId: MediaToolId): boolean {
  return toolId === 'audio-konvertieren' || toolId === 'audio-komprimieren';
}

export function isAudioOutputTool(toolId: MediaToolId): boolean {
  return isAudioInputTool(toolId) || toolId === 'video-in-mp3-umwandeln';
}

/** Encoder arguments for an audio-only output. */
function audioEncoderArgs(format: AudioFormat, bitrate: AudioBitrate): string[] {
  switch (format) {
    case 'mp3':
      return ['-c:a', 'libmp3lame', '-b:a', bitrate];
    case 'wav':
      return ['-c:a', 'pcm_s16le'];
    case 'flac':
      return ['-c:a', 'flac', '-compression_level', '5'];
    case 'ogg':
      return ['-c:a', 'libvorbis', '-b:a', bitrate];
    case 'aac':
      return ['-c:a', 'aac', '-b:a', bitrate, '-f', 'adts'];
    case 'm4a':
      return ['-c:a', 'aac', '-b:a', bitrate, '-movflags', '+faststart'];
  }
}

/** Target format for "Audio komprimieren": keep lossy formats, turn lossless ones into MP3. */
export function compressedAudioFormat(inputName: string): AudioFormat {
  const ext = extensionOf(inputName);
  if (ext === 'ogg' || ext === 'oga') return 'ogg';
  if (ext === 'm4a') return 'm4a';
  if (ext === 'aac') return 'aac';
  return 'mp3'; // mp3, wav, flac, aiff, wma, opus …
}

/** Even dimensions (required by H.264 4:2:0), optionally capped to a max width. */
function evenScale(maxWidth?: number): string {
  if (!maxWidth) return 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
  return `scale=trunc(min(${maxWidth}\\,iw)/2)*2:-2`;
}

function h264Args(crf: number, preset: string, maxWidth?: number, audioBitrate = '128k'): string[] {
  return [
    '-vf', evenScale(maxWidth),
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', String(crf),
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', audioBitrate,
  ];
}

const COMPRESSION: Record<CompressionLevel, { crf: number; maxWidth: number; audio: string }> = {
  high: { crf: 32, maxWidth: 1280, audio: '96k' },
  balanced: { crf: 28, maxWidth: 1280, audio: '128k' },
  low: { crf: 24, maxWidth: 1920, audio: '128k' },
};

function videoEncoderArgs(format: VideoFormat, opts: MediaJobOptions): string[] {
  switch (format) {
    case 'mp4':
      return [...h264Args(23, 'superfast', 1920), '-movflags', '+faststart'];
    case 'mov':
      return [...h264Args(23, 'superfast', 1920), '-movflags', '+faststart'];
    case 'mkv':
      return h264Args(23, 'superfast', 1920);
    case 'avi':
      return [
        '-vf', evenScale(1920),
        '-c:v', 'mpeg4', '-vtag', 'xvid', '-q:v', '4',
        '-c:a', 'libmp3lame', '-b:a', '192k',
      ];
    case 'webm':
      return [
        '-vf', `scale=min(1920\\,iw):-2`,
        '-c:v', 'libvpx',
        '-b:v', '2M', '-crf', '10',
        '-deadline', 'realtime', '-cpu-used', '8',
        '-c:a', 'libvorbis', '-b:a', '128k',
      ];
    case 'gif':
      return gifArgs(opts.gifFps ?? 10);
  }
}

function gifArgs(fps: GifFps): string[] {
  const width = fps === 15 ? 400 : 480;
  return [
    '-t', String(GIF_MAX_SECONDS),
    '-an',
    '-filter_complex',
    `fps=${fps},scale=min(${width}\\,iw):-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
    '-loop', '0',
  ];
}

export function buildMediaJob(opts: MediaJobOptions): MediaJobPlan {
  const base = baseNameOf(opts.inputName);
  const bitrate = opts.audioBitrate ?? '128k';
  const head = ['-hide_banner', '-i', opts.inputPath];

  const audioPlan = (format: AudioFormat, suffix = ''): MediaJobPlan => {
    const outputName = `${base}${suffix}.${format}`;
    const outputPath = `/out.${format}`;
    return {
      args: [...head, '-vn', '-map_metadata', '0', ...audioEncoderArgs(format, bitrate), outputPath],
      outputPath,
      outputName,
      mimeType: MIME[format],
      kind: 'audio',
    };
  };

  const videoPlan = (format: VideoFormat, extra: string[], suffix = ''): MediaJobPlan => {
    const outputName = `${base}${suffix}.${format}`;
    const outputPath = `/out.${format}`;
    return {
      args: [...head, '-sn', '-dn', ...extra, outputPath],
      outputPath,
      outputName,
      mimeType: MIME[format],
      kind: format === 'gif' ? 'gif' : 'video',
    };
  };

  switch (opts.toolId) {
    case 'audio-konvertieren':
      return audioPlan(opts.targetAudioFormat ?? 'mp3');
    case 'audio-komprimieren':
      return audioPlan(compressedAudioFormat(opts.inputName), '_komprimiert');
    case 'video-in-mp3-umwandeln':
      return audioPlan('mp3');
    case 'video-komprimieren': {
      const c = COMPRESSION[opts.compressionLevel ?? 'balanced'];
      return videoPlan('mp4', [...h264Args(c.crf, 'superfast', c.maxWidth, c.audio), '-movflags', '+faststart'], '_komprimiert');
    }
    case 'video-in-gif-umwandeln':
      return videoPlan('gif', gifArgs(opts.gifFps ?? 10));
    case 'video-in-mp4-umwandeln':
      return videoPlan('mp4', videoEncoderArgs('mp4', opts));
    case 'mp4-in-webm-umwandeln':
      return videoPlan('webm', videoEncoderArgs('webm', opts));
    case 'video-konvertieren':
    default: {
      const format = opts.targetVideoFormat ?? 'mp4';
      return videoPlan(format, videoEncoderArgs(format, opts));
    }
  }
}

/** Turns FFmpeg's log output into a short German error message. */
export function explainFfmpegFailure(log: string): string {
  if (/does not contain any stream|Output file #0 does not contain|Stream map .* matches no streams/i.test(log)) {
    return 'Die Datei enthält keine passende Audio- bzw. Videospur.';
  }
  if (/Invalid data found when processing input|moov atom not found|could not find codec parameters/i.test(log)) {
    return 'Die Datei ist beschädigt oder hat ein Format, das im Browser nicht gelesen werden kann.';
  }
  if (/Decoder .* not found|Unknown decoder|no decoder|unsupported codec/i.test(log)) {
    return 'Der Codec dieser Datei wird von der Browser-Version von FFmpeg nicht unterstützt.';
  }
  if (/Cannot allocate memory|out of memory|OOM|memory access out of bounds/i.test(log)) {
    return 'Nicht genügend Arbeitsspeicher im Browser. Bitte verwenden Sie eine kleinere oder kürzere Datei.';
  }
  return 'Die Konvertierung ist fehlgeschlagen. Bitte prüfen Sie die Datei oder wählen Sie ein anderes Zielformat.';
}
