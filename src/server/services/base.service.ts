import { ServiceOptions } from '@/types/job';

export interface ConversionResult {
  data: Buffer | Uint8Array;
  fileName: string;
  mimeType: string;
}

export interface IConversionService {
  name: string;
  supportedTypes: string[];
  canHandle(type: string): boolean;
  execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult>;
}
