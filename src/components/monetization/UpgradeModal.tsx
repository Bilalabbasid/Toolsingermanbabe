'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { getPlan, formatPlanPrice, calculateAnnualSavings } from '@/config/plans.config';
import { featureFlags } from '@/config/featureFlags.config';
import { trackProViewed, trackProClicked, trackSignupStarted, trackSignupCompleted } from '@/lib/analytics';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
  recommendedPlanId?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  triggerReason = 'Maximale Leistung und Freiheit ohne Limits',
  recommendedPlanId = 'pro',
}: UpgradeModalProps) {
  const billingEnabled = featureFlags.enableStripeCheckout;
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackProViewed(triggerReason);
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
  }, [isOpen, triggerReason, onClose]);

  if (!isOpen) return null;

  const proPlan = getPlan('pro');
  const savings = calculateAnnualSavings(proPlan);

  const handleCheckout = async () => {
    if (!billingEnabled) return;
    setIsLoading(true);
    trackProClicked('pro', interval);
    trackSignupStarted('pro');
    try {
      const res = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro', interval }),
      });

      if (res.status === 401) {
        window.location.href = '/de/login?redirect=/de/preise';
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Checkout konnte nicht initiiert werden');
      }

      const data = await res.json();
      if (data.url) {
        trackSignupCompleted('pro');
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Das Upgrade ist derzeit nicht verfügbar. Ihr Tarif wurde nicht geändert.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-heading"
      aria-describedby="upgrade-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 p-4 sm:p-7 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition touch-manipulation cursor-pointer"
            aria-label="Upgrade-Dialog schließen"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] sm:text-xs font-bold mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" aria-hidden="true" />
            <span>{billingEnabled ? 'CoolWave Pro Upgrade' : 'CoolWave Pro · Demnächst'}</span>
          </div>

          <h2 id="upgrade-modal-heading" className="text-lg sm:text-2xl font-black tracking-tight pr-8">
            {billingEnabled ? 'Arbeiten Sie schneller & ohne Grenzen' : 'CoolWave Pro kommt bald'}
          </h2>
          <p id="upgrade-modal-description" className="text-[11px] sm:text-xs text-indigo-200 mt-1 max-w-md line-clamp-2 sm:line-clamp-none">
            {triggerReason}
          </p>

          {/* Billing interval switch */}
          {billingEnabled && (
          <div 
            role="radiogroup" 
            aria-label="Abrechnungsintervall"
            className="mt-3 sm:mt-5 inline-flex flex-wrap items-center p-1 rounded-xl bg-slate-900/60 border border-indigo-400/20 max-w-full"
          >
            <button
              type="button"
              role="radio"
              aria-checked={interval === 'monthly'}
              onClick={() => setInterval('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition touch-manipulation cursor-pointer ${
                interval === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Monatlich ({formatPlanPrice(proPlan, 'monthly')})
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={interval === 'yearly'}
              onClick={() => setInterval('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 touch-manipulation cursor-pointer ${
                interval === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <span>Jährlich ({formatPlanPrice(proPlan, 'yearly')})</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold">
                -{savings}%
              </span>
            </button>
          </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-7 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3.5">
            {[
              { title: '500 MB Dateigröße', desc: '10x größere Dateien verarbeiten' },
              { title: 'Stapelverarbeitung (50 Dateien)', desc: 'Alle Dokumente gleichzeitig konvertieren' },
              { title: '100% Werbefrei', desc: 'Fokussiertes Arbeiten ohne Werbebanner' },
              { title: 'Prioritäts-Warteschlange', desc: 'VIP-Verarbeitung ohne Wartezeiten' },
              { title: 'Unbegrenzte Hochpräzisions-OCR', desc: 'Gescannte Dokumente in Text wandeln' },
              { title: '30 Tage Konvertierungsverlauf', desc: 'Frühere Ergebnisse jederzeit erneut laden' },
            ].map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 sm:bg-transparent">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{perk.title}</h4>
                  <p className="text-[11px] text-slate-500">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left w-full sm:w-auto">
              {billingEnabled ? (
              <>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {formatPlanPrice(proPlan, interval)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ Monat</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {interval === 'yearly' ? 'Jährlich abgerechnet (59,00 €/Jahr)' : 'Monatlich kündbar'} • Inkl. MwSt.
              </p>
              </>
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">Demnächst verfügbar</div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    Bis dahin können Sie alle kostenlosen Werkzeuge weiter nutzen.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {billingEnabled ? (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold shadow-md transition disabled:opacity-50 touch-manipulation active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird geladen...
                  </>
                ) : (
                  <>
                    <span>Jetzt Pro aktivieren</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition"
                >
                  Kostenlose Werkzeuge weiter nutzen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
