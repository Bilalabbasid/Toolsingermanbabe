export interface BatchTask<T> {
  id: string;
  run: (signal?: AbortSignal) => Promise<T>;
  onProgress?: (percent: number, statusText?: string) => void;
}

export interface BatchRunnerOptions {
  concurrency: number;
  signal?: AbortSignal;
  onItemStart?: (id: string) => void;
  onItemComplete?: (id: string, result: any) => void;
  onItemError?: (id: string, error: Error) => void;
  onBatchProgress?: (completedCount: number, totalCount: number) => void;
}

export async function runConcurrentBatch<T>(
  tasks: BatchTask<T>[],
  options: BatchRunnerOptions
): Promise<Map<string, { success: boolean; result?: T; error?: string }>> {
  const results = new Map<string, { success: boolean; result?: T; error?: string }>();
  const concurrency = Math.max(1, options.concurrency || 2);
  let activeIndex = 0;
  let completedCount = 0;

  async function worker() {
    while (activeIndex < tasks.length) {
      if (options.signal?.aborted) break;

      const currentIndex = activeIndex++;
      const task = tasks[currentIndex];
      if (!task) break;

      options.onItemStart?.(task.id);

      try {
        const res = await task.run(options.signal);
        results.set(task.id, { success: true, result: res });
        options.onItemComplete?.(task.id, res);
      } catch (err: unknown) {
        const errorMsg = (err as Error).message || 'Verarbeitung fehlgeschlagen';
        results.set(task.id, { success: false, error: errorMsg });
        options.onItemError?.(task.id, err as Error);
      } finally {
        completedCount++;
        options.onBatchProgress?.(completedCount, tasks.length);
      }
    }
  }

  const workerPromises: Promise<void>[] = [];
  const workerCount = Math.min(concurrency, tasks.length);

  for (let i = 0; i < workerCount; i++) {
    workerPromises.push(worker());
  }

  await Promise.all(workerPromises);
  return results;
}
