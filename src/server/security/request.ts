import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export class RequestError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

export function secretMatches(value: string | null | undefined, secret: string | undefined): boolean {
  if (!value || !secret || secret.length < 32) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isProRequest(req: NextRequest): boolean {
  return secretMatches(req.headers.get('x-api-key'), process.env.PRO_API_KEY);
}

export function isAdminRequest(req: NextRequest, secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET): boolean {
  return secretMatches(req.headers.get('authorization')?.replace(/^Bearer /, ''), secret);
}

export function ownerId(req: NextRequest): string {
  const value = req.cookies.get('cw_owner')?.value;
  return value && /^[a-f0-9]{64}$/.test(value) ? value : crypto.randomBytes(32).toString('hex');
}

export function ownsJob(req: NextRequest, job: { ownerId?: string }): boolean {
  return !!job.ownerId && secretMatches(req.cookies.get('cw_owner')?.value, job.ownerId);
}

export function setOwnerCookie(req: NextRequest, response: NextResponse, owner: string): NextResponse {
  response.cookies.set('cw_owner', owner, {
    httpOnly: true, sameSite: 'strict', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: 86400,
  });
  return response;
}

// Bound streams before parsing, including requests without Content-Length.
export async function boundedBody(req: NextRequest, limit: number): Promise<Uint8Array> {
  const length = req.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > limit)) throw new RequestError('FILE_TOO_LARGE', 413);
  const reader = req.body?.getReader();
  if (!reader) throw new RequestError('EMPTY_BODY');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw new RequestError('FILE_TOO_LARGE', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, total);
}

export async function boundedFormData(req: NextRequest, limit: number): Promise<FormData> {
  const bytes = await boundedBody(req, limit);
  try {
    return await new Response(bytes as BodyInit, { headers: { 'content-type': req.headers.get('content-type') || '' } }).formData();
  } catch { throw new RequestError('INVALID_MULTIPART'); }
}

export function requestError(err: unknown): NextResponse {
  return NextResponse.json({
    error: err instanceof RequestError ? 'Die Anfrage ist ungueltig oder ueberschreitet ein Limit.' : 'Die Verarbeitung ist fehlgeschlagen. Bitte pruefen Sie Ihre Datei.',
    code: err instanceof RequestError ? err.code : 'PROCESSING_FAILED',
  }, { status: err instanceof RequestError ? err.status : 500 });
}

export function parseOptions(raw: FormDataEntryValue | null): Record<string, unknown> {
  if (raw === null) return {};
  if (typeof raw !== 'string' || raw.length > 16384) throw new RequestError('INVALID_OPTIONS');
  let value;
  try { value = JSON.parse(raw); } catch { throw new RequestError('INVALID_OPTIONS'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestError('INVALID_OPTIONS');
  for (const key of ['__proto__', 'constructor', 'prototype', 'apiKey', 'isPro', 'maxPages', 'maxFileSizeMB', 'jobType', 'type', 'files', 'storagePath', 'outputPath']) {
    if (Object.hasOwn(value, key)) throw new RequestError('RESERVED_OPTION');
  }
  if (value.targetFormat !== undefined && (typeof value.targetFormat !== 'string' || !/^\.?[a-zA-Z0-9]{1,10}$/.test(value.targetFormat))) throw new RequestError('INVALID_FORMAT');
  return value;
}
