'use client';

const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, '');

let warmupPromise: Promise<void> | null = null;

export function hasRemoteApi(): boolean {
  if (!configuredBaseUrl || typeof window === 'undefined') return false;
  try {
    return new URL(configuredBaseUrl, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function apiUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${configuredBaseUrl}${path}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function readinessRequest(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(apiUrl('/api/health/ready'), {
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Starts a scale-to-zero conversion backend before the visitor submits a file.
 * A single shared promise prevents every engine on the page from waking it again.
 */
export function warmConversionBackend(maxWaitMs = 90_000): Promise<void> {
  if (!hasRemoteApi()) return Promise.resolve();
  if (warmupPromise) return warmupPromise;

  warmupPromise = (async () => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < maxWaitMs) {
      if (await readinessRequest()) return;
      await delay(1_500);
    }
    throw new Error('BACKEND_START_TIMEOUT');
  })().catch((error) => {
    warmupPromise = null;
    throw error;
  });

  return warmupPromise;
}

export function retryBackendWarmup(): Promise<void> {
  warmupPromise = null;
  return warmConversionBackend();
}

export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(apiUrl(input), {
    ...init,
    credentials: init.credentials ?? 'include',
  });
}
