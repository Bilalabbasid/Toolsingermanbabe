import { describe, it, expect } from 'vitest';
import {
  permissionArgs,
  encryptArgs,
  COMPRESSION_ARGS,
  IN_PATH,
  OUT_PATH,
} from '@/lib/client/pdf/qpdfArgs';

describe('qpdfArgs pure builder', () => {
  it('should export correct constant paths and compression args', () => {
    expect(IN_PATH).toBe('/work/input.pdf');
    expect(OUT_PATH).toBe('/work/output.pdf');
    expect(COMPRESSION_ARGS).toContain('--object-streams=generate');
    expect(COMPRESSION_ARGS).toContain('--compression-level=9');
  });

  it('should generate correct permission flags when all allowed', () => {
    const args = permissionArgs({
      allowPrinting: true,
      allowCopying: true,
      allowModifying: true,
    });
    expect(args).toEqual(['--print=full', '--extract=y', '--modify=all']);
  });

  it('should generate correct permission flags when all denied', () => {
    const args = permissionArgs({
      allowPrinting: false,
      allowCopying: false,
      allowModifying: false,
    });
    expect(args).toEqual(['--print=none', '--extract=n', '--modify=none']);
  });

  it('should generate encrypt arguments with 256-bit encryption', () => {
    const args = encryptArgs(
      'user123',
      'owner123',
      {
        allowPrinting: true,
        allowCopying: false,
        allowModifying: false,
      },
      'existingPass'
    );

    expect(args).toContain('--password=existingPass');
    expect(args).toContain('--encrypt');
    expect(args).toContain('--user-password=user123');
    expect(args).toContain('--owner-password=owner123');
    expect(args).toContain('--bits=256');
    expect(args).toContain('--print=full');
    expect(args).toContain('--extract=n');
    expect(args).toContain('--modify=none');
    expect(args).toContain('--');
    expect(args[args.length - 1]).toBe(OUT_PATH);
  });
});

