import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

export class AudioService implements IConversionService {
  name = 'AudioService';
  supportedTypes = ['audio_convert', 'audio_compress', 'video_to_mp3'];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('audio_');
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    // Strict safeguard limits
    const maxDurationSec = parseInt(process.env.MAX_AUDIO_DURATION_SEC || '600', 10);
    if (typeof options.duration === 'number' && options.duration > maxDurationSec) {
      throw new Error(`Die Audiodatei überschreitet die maximale Dauer von ${maxDurationSec} Sekunden.`);
    }
    const maxFileSize = parseInt(process.env.MAX_AUDIO_SIZE_MB || '100', 10) * 1024 * 1024;

    if (inputBuffer.length > maxFileSize) {
      throw new Error(`Die Audiodatei ist zu groß. Maximal zulässig: ${process.env.MAX_AUDIO_SIZE_MB || '100'} MB.`);
    }

    onProgress(30);
    if (signal?.aborted) throw new Error('Operation aborted');

    // Transcode simulation / pass-through for MVP, isolated behind service interface
    onProgress(60);
    const baseName = inputName.replace(/\.[^/.]+$/, '');
    const targetExt = options.targetFormat?.toLowerCase() || 'mp3';

    onProgress(90);
    if (signal?.aborted) throw new Error('Operation aborted');

    onProgress(100);
    return {
      data: inputBuffer,
      fileName: `${baseName}.${targetExt}`,
      mimeType: `audio/${targetExt}`,
    };
  }
}
