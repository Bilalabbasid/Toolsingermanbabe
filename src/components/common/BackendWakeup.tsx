import type { ReactNode } from 'react';

/**
 * Legacy wrapper kept for backwards compatibility.
 *
 * All tools now run 100 % in the browser, so there is no conversion backend
 * to warm up and no "server is starting" UI. It simply renders its children.
 */
export function BackendWakeup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
