import { describe, it, expect } from 'vitest';
import { sanitizeEntryPath, ARCHIVE_LIMITS } from '@/lib/client/archive/safety';

describe('Archive safety helpers', () => {
  it('should enforce reasonable safety limits', () => {
    expect(ARCHIVE_LIMITS.maxInputBytes).toBe(500 * 1024 * 1024);
    expect(ARCHIVE_LIMITS.maxTotalBytes).toBe(1024 * 1024 * 1024);
    expect(ARCHIVE_LIMITS.maxEntries).toBe(10_000);
    expect(ARCHIVE_LIMITS.maxRatio).toBe(1000);
  });

  it('should sanitize safe relative paths', () => {
    expect(sanitizeEntryPath('folder/subfolder/file.txt')).toBe('folder/subfolder/file.txt');
    expect(sanitizeEntryPath('documents/report.pdf')).toBe('documents/report.pdf');
  });

  it('should prevent directory traversal (Zip Slip)', () => {
    expect(sanitizeEntryPath('../../etc/passwd')).toBe('etc/passwd');
    expect(sanitizeEntryPath('a/../../b/../c/file.txt')).toBe('a/b/c/file.txt');
    expect(sanitizeEntryPath('../../../secret.txt')).toBe('secret.txt');
  });

  it('should strip Windows drive letters and convert backslashes', () => {
    expect(sanitizeEntryPath('C:\\Windows\\System32\\calc.exe')).toBe('Windows/System32/calc.exe');
    expect(sanitizeEntryPath('D:\\Data\\Notes.txt')).toBe('Data/Notes.txt');
  });

  it('should remove control characters and dangerous symbols', () => {
    expect(sanitizeEntryPath('test\u0000file.txt')).toBe('testfile.txt');
    expect(sanitizeEntryPath('file<name>:with*illegal?chars.txt')).toBe('file_name__with_illegal_chars.txt');
  });

  it('should return null for empty or only-traversal paths', () => {
    expect(sanitizeEntryPath('')).toBeNull();
    expect(sanitizeEntryPath('..')).toBeNull();
    expect(sanitizeEntryPath('../..')).toBeNull();
    expect(sanitizeEntryPath('///')).toBeNull();
  });
});

