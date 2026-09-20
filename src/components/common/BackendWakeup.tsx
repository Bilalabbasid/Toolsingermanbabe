'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { LoaderCircle, RotateCw, Server } from 'lucide-react';
import { hasRemoteApi, retryBackendWarmup, warmConversionBackend } from '@/lib/apiClient';

type BackendState = 'local' | 'starting' | 'ready' | 'unavailable';

export function BackendWakeup({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BackendState>('local');

  const start = (retry = false) => {
    if (!hasRemoteApi()) {
      setState('local');
      return;
    }
    setState('starting');
    const wakeup = retry ? retryBackendWarmup() : warmConversionBackend();
    void wakeup.then(() => setState('ready')).catch(() => setState('unavailable'));
  };

  useEffect(() => {
    start();
  }, []);

  return (
    <>
      {state === 'starting' && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900" role="status">
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
          <div>
            <strong>Konverter wird vorbereitet …</strong>
            <p className="mt-0.5 text-blue-800">Du kannst deine Datei bereits auswählen. Der erste Start kann einen Moment dauern.</p>
          </div>
        </div>
      )}
      {state === 'unavailable' && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          <Server className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <strong>Der Konverter braucht länger als erwartet.</strong>
            <p className="mt-0.5 text-amber-900">Bitte starte ihn erneut und lasse diese Seite geöffnet.</p>
          </div>
          <button type="button" onClick={() => start(true)} className="inline-flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-3 py-2 font-semibold hover:bg-amber-100">
            <RotateCw className="h-4 w-4" aria-hidden="true" /> Erneut versuchen
          </button>
        </div>
      )}
      {children}
    </>
  );
}
