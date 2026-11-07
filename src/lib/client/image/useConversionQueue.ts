'use client';

/**
 * Shared client-side queue for converting one or many files in the browser,
 * compatible with the BatchProcessingQueue component.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import type { BatchItem } from '@/components/tools/BatchProcessingQueue';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { downloadBlob } from '@/lib/utils';

export interface QueueResult {
  blob: Blob;
  fileName: string;
  size: number;
  note?: string;
}

export type QueueConverter = (
  file: File,
  onProgress: (percent: number, message?: string) => void,
  signal?: AbortSignal
) => Promise<QueueResult>;

export type QueueItem = BatchItem & { note?: string };

let idCounter = 0;
const newId = () => `cw_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (used.has(`${stem}_${i}${ext}`)) i++;
  const result = `${stem}_${i}${ext}`;
  used.add(result);
  return result;
}

export function useConversionQueue(converter: QueueConverter, concurrency: number) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const converterRef = useRef(converter);
  const itemsRef = useRef<QueueItem[]>([]);

  useEffect(() => {
    converterRef.current = converter;
  }, [converter]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const patch = useCallback((id: string, update: Partial<QueueItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...update } : i)));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map<QueueItem>((file) => ({ id: newId(), file, status: 'queued', progress: 0 })),
    ]);
  }, []);

  const runItems = useCallback(
    async (targets: QueueItem[]) => {
      if (targets.length === 0) return;
      setIsProcessing(true);
      const controller = new AbortController();
      abortRef.current = controller;
      await runConcurrentBatch(
        targets.map((item) => ({
          id: item.id,
          run: async (signal?: AbortSignal) => {
            if (signal?.aborted) throw new Error('Abgebrochen');
            return converterRef.current(
              item.file,
              (progress, statusText) => patch(item.id, { progress, statusText }),
              signal
            );
          },
        })),
        {
          concurrency,
          signal: controller.signal,
          onItemStart: (id) => patch(id, { status: 'processing', progress: 5, error: undefined, statusText: 'Wird gestartet...' }),
          onItemComplete: (id, res: QueueResult) =>
            patch(id, {
              status: 'completed',
              progress: 100,
              outputBlob: res.blob,
              outputFileName: res.fileName,
              outputSize: res.size,
              note: res.note,
              statusText: 'Fertig',
            }),
          onItemError: (id, err) => {
            console.error('[Konvertierung]', err);
            patch(id, {
              status: 'failed',
              progress: 0,
              error: err?.message || 'Die Konvertierung ist fehlgeschlagen.',
            });
          },
        }
      );
      if (abortRef.current === controller) abortRef.current = null;
      setIsProcessing(false);
    },
    [concurrency, patch]
  );

  const start = useCallback(() => {
    void runItems(itemsRef.current.filter((i) => i.status === 'queued' || i.status === 'cancelled'));
  }, [runItems]);

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;
      patch(id, { status: 'queued', progress: 0, error: undefined });
      void runItems([{ ...item, status: 'queued' }]);
    },
    [patch, runItems]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setItems((prev) =>
      prev.map((i) => (i.status === 'queued' || i.status === 'processing' ? { ...i, status: 'cancelled', progress: 0 } : i))
    );
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setItems([]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /** Re-queues finished items, e.g. after the user changed options. */
  const resetResults = useCallback(() => {
    setItems((prev) =>
      prev.map((i) => ({ ...i, status: 'queued', progress: 0, outputBlob: undefined, outputFileName: undefined, outputSize: undefined, error: undefined, note: undefined }))
    );
  }, []);

  const downloadItem = useCallback((item: BatchItem) => {
    if (item.outputBlob && item.outputFileName) downloadBlob(item.outputBlob, item.outputFileName);
  }, []);

  const downloadZip = useCallback(async (zipName: string) => {
    const done = itemsRef.current.filter((i) => i.status === 'completed' && i.outputBlob && i.outputFileName);
    if (done.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      for (const item of done) zip.file(uniqueName(item.outputFileName!, used), item.outputBlob!);
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, zipName);
    } catch (err) {
      console.error('[ZIP]', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  }, []);

  return {
    items,
    isProcessing,
    isZipping,
    addFiles,
    start,
    retry,
    cancel,
    clear,
    remove,
    resetResults,
    downloadItem,
    downloadZip,
  };
}
