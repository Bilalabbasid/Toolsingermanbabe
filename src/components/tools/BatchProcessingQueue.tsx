'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Download, 
  Trash2, 
  RefreshCw, 
  Zap, 
  Layers, 
  Play, 
  StopCircle,
  Archive
} from 'lucide-react';
import Link from 'next/link';
import { formatBytes, downloadBlob } from '@/lib/utils';
import { batchConfig, getBatchLimits, BatchTierLimits } from '@/config/batch.config';
import { getClientSubscription } from '@/lib/monetization/subscription';

export type BatchItemStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchItem {
  id: string;
  file: File;
  status: BatchItemStatus;
  progress: number;
  statusText?: string;
  outputBlob?: Blob;
  outputFileName?: string;
  outputSize?: number;
  error?: string;
}

interface BatchProcessingQueueProps {
  items: BatchItem[];
  isProcessing: boolean;
  onStartBatch: () => void;
  onCancelBatch: () => void;
  onClearQueue: () => void;
  onRemoveItem: (id: string) => void;
  onRetryItem?: (id: string) => void;
  onDownloadItem: (item: BatchItem) => void;
  onDownloadAllZip: () => void;
  isZipping?: boolean;
  toolTitle?: string;
}

export function BatchProcessingQueue({
  items,
  isProcessing,
  onStartBatch,
  onCancelBatch,
  onClearQueue,
  onRemoveItem,
  onRetryItem,
  onDownloadItem,
  onDownloadAllZip,
  isZipping = false,
  toolTitle = 'Stapelverarbeitung',
}: BatchProcessingQueueProps) {
  // Authenticated subscription state
  const [isPro, setIsPro] = useState<boolean>(() => getClientSubscription().isPro);

  useEffect(() => {
    const checkSub = () => {
      setIsPro(getClientSubscription().isPro);
    };
    checkSub();
    window.addEventListener('coolwave_subscription_changed', checkSub);
    return () => window.removeEventListener('coolwave_subscription_changed', checkSub);
  }, []);

  const limits: BatchTierLimits = getBatchLimits(isPro);

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const queuedCount = items.filter((i) => i.status === 'queued').length;
  const totalCount = items.length;

  const overallProgress = totalCount > 0
    ? Math.round(
        items.reduce((acc, item) => acc + (item.progress || 0), 0) / totalCount
      )
    : 0;

  const totalInputBytes = items.reduce((acc, i) => acc + i.file.size, 0);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Header & Limit Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {toolTitle}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  {totalCount} {totalCount === 1 ? 'Datei' : 'Dateien'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Gesamtgröße: {formatBytes(totalInputBytes)} • Parallelität: {limits.clientConcurrency} Jobs gleichzeitig
              </p>
            </div>
          </div>

          {/* User Tier Badge */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl backdrop-blur-sm self-start md:self-auto">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${isPro ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">
                  {isPro ? 'Pro-Konto (aktiv)' : 'Kostenloser Tarif'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Limit: max. {limits.maxBatchFiles} Dateien / {limits.maxFileSizeMB} MB je Datei
                </div>
              </div>
            </div>
            {!isPro && (
              <Link
                href="/preise"
                className="text-[10px] px-2.5 py-1 rounded-md font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">
              Fortschritt: {completedCount} von {totalCount} fertiggestellt
              {failedCount > 0 && <span className="text-rose-400 ml-2">({failedCount} fehlgeschlagen)</span>}
            </span>
            <span className="font-bold text-indigo-300">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                failedCount > 0 && completedCount === 0
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isProcessing ? (
            <button
              onClick={onStartBatch}
              disabled={items.length === 0 || queuedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
            >
              <Play className="w-4 h-4 fill-white" />
              Stapel starten ({queuedCount})
            </button>
          ) : (
            <button
              onClick={onCancelBatch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 shadow-sm transition"
            >
              <StopCircle className="w-4 h-4" />
              Abbrechen
            </button>
          )}

          <button
            onClick={onClearQueue}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-100 disabled:opacity-50 transition"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Warteschlange leeren
          </button>
        </div>

        {/* Download All as ZIP */}
        <button
          onClick={onDownloadAllZip}
          disabled={completedCount === 0 || isZipping}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
        >
          {isZipping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ZIP wird erstellt...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              Alle als ZIP herunterladen ({completedCount})
            </>
          )}
        </button>
      </div>

      {/* Queue Items Table / List */}
      <div className="divide-y divide-slate-200 max-h-[440px] overflow-y-auto">
        {items.map((item, idx) => {
          const isPdf = item.file.name.toLowerCase().endsWith('.pdf');
          const isImg = /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff|avif|ico)$/i.test(item.file.name);

          return (
            <div
              key={item.id}
              className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.status === 'processing'
                  ? 'bg-indigo-50/40'
                  : item.status === 'completed'
                  ? 'bg-emerald-50/20'
                  : item.status === 'failed'
                  ? 'bg-rose-50/20'
                  : 'hover:bg-slate-50/60'
              }`}
            >
              {/* File details & icon */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isPdf
                      ? 'bg-rose-100 text-rose-600'
                      : isImg
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {isPdf ? (
                    <FileText className="w-5 h-5" />
                  ) : isImg ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <Layers className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">#{idx + 1}</span>
                    <p className="text-sm font-medium text-slate-900 truncate" title={item.file.name}>
                      {item.file.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{formatBytes(item.file.size)}</span>
                    {item.outputSize && item.outputSize !== item.file.size && (
                      <>
                        <span>→</span>
                        <span className="text-emerald-600 font-medium">
                          {formatBytes(item.outputSize)}
                        </span>
                      </>
                    )}
                    {item.statusText && (
                      <span className="text-slate-400 truncate max-w-[200px]">
                        • {item.statusText}
                      </span>
                    )}
                  </div>

                  {/* Progress bar per item */}
                  {item.status === 'processing' && (
                    <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {item.status === 'failed' && item.error && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {item.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                {item.status === 'queued' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    <Clock className="w-3 h-3" />
                    Wartend
                  </span>
                )}

                {item.status === 'processing' && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium border border-indigo-200">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                    {item.progress}%
                  </span>
                )}

                {item.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Fertig
                  </span>
                )}

                {item.status === 'failed' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium border border-rose-200">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Fehler
                  </span>
                )}

                {item.status === 'cancelled' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
                    Abgebrochen
                  </span>
                )}

                {/* Individual Download Action */}
                {item.status === 'completed' && (
                  <button
                    onClick={() => onDownloadItem(item)}
                    type="button"
                    title="Diese Datei herunterladen"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Retry action */}
                {item.status === 'failed' && onRetryItem && (
                  <button
                    onClick={() => onRetryItem(item.id)}
                    type="button"
                    title="Erneut versuchen"
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                {/* Remove from queue */}
                {!isProcessing && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    type="button"
                    title="Aus Warteschlange entfernen"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
