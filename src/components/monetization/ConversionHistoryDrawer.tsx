'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Sparkles, 
  Clock, 
  FileText 
} from 'lucide-react';
import { getConversionHistory, clearConversionHistory, ConversionHistoryItem } from '@/lib/monetization/usage';
import { getClientSubscription } from '@/lib/monetization/subscription';
import { formatBytes } from '@/lib/utils';

interface ConversionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgradeModal: () => void;
}

export function ConversionHistoryDrawer({
  isOpen,
  onClose,
  onOpenUpgradeModal,
}: ConversionHistoryDrawerProps) {
  const [historyItems, setHistoryItems] = useState<ConversionHistoryItem[]>([]);
  const [isPro, setIsPro] = useState(false);

  const loadHistory = () => {
    const sub = getClientSubscription();
    setIsPro(sub.isPro);
    const items = getConversionHistory(sub.isPro);
    setHistoryItems(items);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (confirm('Möchten Sie den Konvertierungsverlauf wirklich leeren?')) {
      clearConversionHistory();
      setHistoryItems([]);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-heading"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full">
          {/* Drawer Header (safe area aware on iOS notch) */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between safe-area-top shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300" aria-hidden="true">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 id="history-drawer-heading" className="font-bold text-sm sm:text-base">Konvertierungsverlauf</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isPro ? 'Vollständiger 30-Tage Verlauf' : 'Letzte Aktivitäten'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white transition touch-manipulation cursor-pointer"
              aria-label="Konvertierungsverlauf schließen"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Pro Upsell banner for free tier */}
          {!isPro && (
            <div className="m-3 sm:m-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/60 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Verlauf dauerhaft sichern</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Pro speichert alle Ihre Dokumente für 30 Tage mit praktischem Sofort-Download.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgradeModal();
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600 active:bg-indigo-700 text-white text-[11px] font-bold hover:bg-indigo-700 whitespace-nowrap touch-manipulation"
              >
                Pro ansehen
              </button>
            </div>
          )}

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100 safe-area-bottom">
            {historyItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Noch keine Konvertierungen durchgeführt</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sobald Sie eine Datei bearbeiten, erscheint sie hier im Verlauf.
                </p>
              </div>
            ) : (
              historyItems.map((item) => (
                <div key={item.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={item.fileName}>
                        {item.fileName}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                        {item.toolTitle} • {formatBytes(item.originalSizeBytes)}
                        {item.resultSizeBytes && item.resultSizeBytes !== item.originalSizeBytes && (
                          <span className="text-emerald-600 font-medium ml-1">
                            → {formatBytes(item.resultSizeBytes)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {historyItems.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 safe-area-bottom">
              <button
                onClick={handleClear}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 active:text-rose-700 transition cursor-pointer touch-manipulation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Verlauf leeren</span>
              </button>

              <span className="text-xs text-slate-400">
                {historyItems.length} {historyItems.length === 1 ? 'Eintrag' : 'Einträge'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
