import { IConversionService, ConversionResult } from '../base.service';
import { ServiceOptions } from '@/types/job';

export class VideoService implements IConversionService {
  name = 'VideoService';
  supportedTypes = ['video_convert', 'video_compress', 'video_to_gif'];

  canHandle(type: string): boolean {
    return this.supportedTypes.includes(type) || type.startsWith('video_');
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    const maxVideoMB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '200', 10);
    const maxSizeBytes = maxVideoMB * 1024 * 1024;

    if (inputBuffer.length > maxSizeBytes) {
      throw new Error(`Die Videodatei überschreitet das Limit von ${maxVideoMB} MB.`);
    }

    onProgress(40);
    if (signal?.aborted) throw new Error('Operation aborted');

    const baseName = inputName.replace(/\.[^/.]+$/, '');
    const targetExt = options.targetFormat?.toLowerCase() || 'mp4';

    onProgress(80);
    if (signal?.aborted) throw new Error('Operation aborted');

    onProgress(100);
    return {
      data: inputBuffer,
      fileName: `${baseName}.${targetExt}`,
      mimeType: `video/${targetExt}`,
    };
  }
}
