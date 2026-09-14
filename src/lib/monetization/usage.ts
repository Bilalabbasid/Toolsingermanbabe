export interface DailyUsage {
  date: string;
  conversionsCount: number;
  totalBytesProcessed: number;
  ocrPagesProcessed: number;
}

export interface ConversionHistoryItem {
  id: string;
  toolSlug: string;
  toolTitle: string;
  fileName: string;
  originalSizeBytes: number;
  resultSizeBytes?: number;
  createdAt: string;
  downloadUrl?: string;
}

const USAGE_STORAGE_KEY = 'coolwave_daily_usage';
const HISTORY_STORAGE_KEY = 'coolwave_conversion_history';

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDailyUsage(): DailyUsage {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), conversionsCount: 0, totalBytesProcessed: 0, ocrPagesProcessed: 0 };
  }

  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!stored) return { date: getTodayKey(), conversionsCount: 0, totalBytesProcessed: 0, ocrPagesProcessed: 0 };

    const parsed: DailyUsage = JSON.parse(stored);
    if (parsed.date !== getTodayKey()) {
      // Reset for new day
      const fresh: DailyUsage = { date: getTodayKey(), conversionsCount: 0, totalBytesProcessed: 0, ocrPagesProcessed: 0 };
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { date: getTodayKey(), conversionsCount: 0, totalBytesProcessed: 0, ocrPagesProcessed: 0 };
  }
}

export function recordConversionUsage(bytesProcessed: number, isOcr: boolean = false, ocrPages: number = 1): DailyUsage {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), conversionsCount: 1, totalBytesProcessed: bytesProcessed, ocrPagesProcessed: isOcr ? ocrPages : 0 };
  }

  const current = getDailyUsage();
  const updated: DailyUsage = {
    date: getTodayKey(),
    conversionsCount: current.conversionsCount + 1,
    totalBytesProcessed: current.totalBytesProcessed + bytesProcessed,
    ocrPagesProcessed: current.ocrPagesProcessed + (isOcr ? ocrPages : 0),
  };

  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}

/**
 * Generous daily limits for free tier before soft upsell reminder
 */
export function isDailyQuotaExceeded(tier: string): { exceeded: boolean; current: number; limit: number } {
  if (tier === 'pro' || tier === 'business') {
    return { exceeded: false, current: 0, limit: Infinity };
  }

  const usage = getDailyUsage();
  const freeDailyLimit = parseInt(process.env.NEXT_PUBLIC_FREE_DAILY_CONVERSIONS || '50', 10);

  return {
    exceeded: usage.conversionsCount >= freeDailyLimit,
    current: usage.conversionsCount,
    limit: freeDailyLimit,
  };
}

export function addConversionToHistory(item: Omit<ConversionHistoryItem, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const existing: ConversionHistoryItem[] = raw ? JSON.parse(raw) : [];

    const newItem: ConversionHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
    };

    // Keep at most 50 items locally
    const updated = [newItem, ...existing].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getConversionHistory(isPro: boolean): ConversionHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: ConversionHistoryItem[] = JSON.parse(raw);

    // Free users see recent 3 conversions with upgrade hint; Pro users see all
    return isPro ? parsed : parsed.slice(0, 3);
  } catch {
    return [];
  }
}

export function clearConversionHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {}
}
