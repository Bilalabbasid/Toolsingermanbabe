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
    const raw = localStorage.getItem('datei_tools_cookie_consent') || localStorage.getItem('coolwave_cookie_consent');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function openCookiePreferencesModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('datei_tools_open_cookie_preferences'));
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('datei_tools_cookie_consent') || localStorage.getItem('coolwave_cookie_consent');
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

    window.addEventListener('datei_tools_open_cookie_preferences', handleOpen);
    return () => {
      window.removeEventListener('datei_tools_open_cookie_preferences', handleOpen);
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
      localStorage.setItem('datei_tools_cookie_consent', JSON.stringify(preferences));
      window.dispatchEvent(new CustomEvent('datei_tools_consent_updated', { detail: preferences }));
    } catch {}
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Cookie Banner – compact floating card */}
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie-Einwilligung"
          className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-md p-3 sm:p-0 safe-area-bottom animate-slide-up"
        >
          <div className="rounded-2xl bg-white border border-line shadow-pop p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 flex items-center justify-center shrink-0" aria-hidden="true">
                <Shield className="w-4.5 h-4.5" />
              </span>
              <div className="text-[13px] text-ink-muted leading-relaxed">
                <p className="font-semibold text-ink text-sm mb-1">Ihre Privatsphäre zuerst</p>
                Technisch notwendige Cookies setzen wir immer, Analyse und Werbung nur mit Ihrer Einwilligung. Ihre
                Dateien sind davon nicht betroffen: Sie werden ausschließlich lokal in Ihrem Browser verarbeitet.{' '}
                <Link href="/de/datenschutz" className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800">
                  Datenschutz
                </Link>
                {' · '}
                <Link href="/de/cookie-richtlinie" className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800">
                  Cookie-Richtlinie
                </Link>
              </div>
            </div>

            {/* Equal-weight choices (DSGVO / TTDSG best practice) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => saveConsent(false)}
                className="min-h-[44px] px-3 rounded-xl border border-line-strong bg-white hover:bg-surface-muted text-ink text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => saveConsent(true)}
                className="min-h-[44px] px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Alle akzeptieren
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="mt-2 w-full min-h-[36px] inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium text-ink-subtle hover:text-ink transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" aria-hidden="true" />
              Einstellungen anpassen
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-pop border border-line p-4 sm:p-6 text-ink my-auto max-h-[90vh] flex flex-col animate-scale-up">
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
