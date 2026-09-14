'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Layers, 
  Lock, 
  FileText 
} from 'lucide-react';
import { getPlan, formatPlanPrice, calculateAnnualSavings } from '@/config/plans.config';
import { setClientSubscription } from '@/lib/monetization/subscription';
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
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      trackProViewed(triggerReason);
    }
  }, [isOpen, triggerReason]);

  if (!isOpen) return null;

  const proPlan = getPlan('pro');
  const savings = calculateAnnualSavings(proPlan);

  const handleCheckout = async () => {
    setIsLoading(true);
    trackProClicked('pro', interval);
    trackSignupStarted('pro');
    try {
      const res = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro', interval }),
      });

      if (!res.ok) throw new Error('Checkout konnte nicht initiiert werden');

      const data = await res.json();
      if (data.url) {
        trackSignupCompleted('pro');
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      // Fallback local activation
      setClientSubscription('pro', true);
      trackSignupCompleted('pro');
      alert('CoolWave Pro erfolgreich aktiviert!');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantActivate = () => {
    setClientSubscription('pro', true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            CoolWave Pro Upgrade
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Arbeiten Sie schneller & ohne Grenzen
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-md">
            {triggerReason}
          </p>

          {/* Billing interval switch */}
          <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-slate-900/60 border border-indigo-400/20">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                interval === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Monatlich ({formatPlanPrice(proPlan, 'monthly')})
            </button>
            <button
              type="button"
              onClick={() => setInterval('yearly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                interval === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <span>Jährlich ({formatPlanPrice(proPlan, 'yearly')})</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold">
                -{savings}%
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { title: '500 MB Dateigröße', desc: '10x größere Dateien verarbeiten' },
              { title: 'Stapelverarbeitung (50 Dateien)', desc: 'Alle Dokumente gleichzeitig konvertieren' },
              { title: '100% Werbefrei', desc: 'Fokussiertes Arbeiten ohne Werbebanner' },
              { title: 'Prioritäts-Warteschlange', desc: 'VIP-Verarbeitung ohne Wartezeiten' },
              { title: 'Unbegrenzte Hochpräzisions-OCR', desc: 'Gescannte Dokumente in Text wandeln' },
              { title: '30 Tage Konvertierungs-Historie', desc: 'Frühere Ergebnisse jederzeit erneut laden' },
            ].map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl">
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

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-900">
                {formatPlanPrice(proPlan, interval)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ Monat</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {interval === 'yearly' ? 'Jährlich abgerechnet (59,00 €/Jahr)' : 'Monatlich kündbar'} • Inkl. MwSt.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleInstantActivate}
                className="px-3 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition whitespace-nowrap"
                title="Sofort im Browser für diesen Browser aktivieren"
              >
                Pro aktivieren
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isLoading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird geladen...
                  </>
                ) : (
                  <>
                    <span>Jetzt upgraden</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
