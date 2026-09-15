'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Settings, X } from 'lucide-react';

export interface CookieConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('coolwave_cookie_consent');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function openCookiePreferencesModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coolwave_open_cookie_preferences'));
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('coolwave_cookie_consent');
      if (!consent) {
        queueMicrotask(() => {
          setShowBanner(true);
        });
      } else {
        const parsed = JSON.parse(consent);
        setAnalytics(!!parsed.analytics);
        setMarketing(!!parsed.marketing);
      }
    } catch {
      // In case localStorage is blocked
    }

    const handleOpen = () => {
      try {
        const current = getCookieConsent();
        if (current) {
          setAnalytics(!!current.analytics);
          setMarketing(!!current.marketing);
        }
      } catch {}
      setShowPreferences(true);
    };

    window.addEventListener('coolwave_open_cookie_preferences', handleOpen);
    return () => {
      window.removeEventListener('coolwave_open_cookie_preferences', handleOpen);
    };
  }, []);

  const saveConsent = (allAccepted: boolean, customAnalytics = false, customMarketing = false) => {
    const preferences: CookieConsentPreferences = {
      essential: true,
      analytics: allAccepted || customAnalytics,
      marketing: allAccepted || customMarketing,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('coolwave_cookie_consent', JSON.stringify(preferences));
      window.dispatchEvent(new CustomEvent('coolwave_consent_updated', { detail: preferences }));
    } catch {}
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Cookie Banner Bar */}
      {showBanner && (
        <div 
          role="region"
          aria-label="Cookie-Einwilligung"
          className="fixed bottom-0 inset-x-0 z-50 p-3.5 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl animate-fade-in safe-area-bottom"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3 max-w-3xl">
              <div className="p-1.5 sm:p-2 rounded-lg bg-sky-600/20 text-sky-400 shrink-0 border border-sky-500/30 mt-0.5" aria-hidden="true">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-semibold text-white block mb-0.5 sm:mb-1 text-xs sm:text-sm">
                  Datenschutz & Privatsphäre bei CoolWave
                </span>
                Wir verwenden technisch notwendige Cookies und mit Ihrer Einwilligung anonyme Analysen zur Produktverbesserung. Client-Tools verarbeiten Dateien direkt im Browser; Server-Konvertierungen erfolgen verschlüsselt mit automatischer Löschung nach 15 Minuten. Details in der{' '}
                <Link href="/de/datenschutz" className="underline text-sky-400 hover:text-sky-300">
                  Datenschutzerklärung
                </Link>{' '}
                und{' '}
                <Link href="/de/cookie-richtlinie" className="underline text-sky-400 hover:text-sky-300">
                  Cookie-Richtlinie
                </Link>.
              </div>
            </div>

            {/* Responsive Actions: stacked layout on mobile for easy thumb tapping */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => saveConsent(true)}
                className="order-1 sm:order-3 min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm touch-manipulation text-center cursor-pointer"
              >
                Alle akzeptieren
              </button>

              <div className="order-2 flex items-center gap-2">
                <button
                  onClick={() => saveConsent(false)}
                  className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors touch-manipulation text-center cursor-pointer"
                >
                  Nur notwendige
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Anpassen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-6 text-slate-900 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
              <h3 id="cookie-preferences-title" className="text-sm sm:text-base font-bold text-slate-900">Cookie-Einstellungen</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:bg-slate-100 touch-manipulation cursor-pointer"
                aria-label="Einstellungen schließen"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="py-4 space-y-3 sm:space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">Technisch notwendig</div>
                  <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
                    Unverzichtbar für die Funktionalität der Werkzeuge und Sicherheitseinstellungen.
                  </p>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded shrink-0">
                  Immer aktiv
                </span>
              </div>

              <label className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition">
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">Anonyme Analyse</div>
                  <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
                    Hilft uns zu verstehen, welche Werkzeuge und Funktionen am häufigsten genutzt werden.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-0.5 cursor-pointer touch-manipulation shrink-0"
                />
              </label>

              <label className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition">
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">Personalisierte Werbung</div>
                  <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
                    Ermöglicht das Einblenden relevanter Partnerangebote zur Finanzierung der kostenlosen Werkzeuge.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-0.5 cursor-pointer touch-manipulation shrink-0"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => saveConsent(false, analytics, marketing)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors touch-manipulation text-center"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
