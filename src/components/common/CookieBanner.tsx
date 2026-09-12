'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Settings, X } from 'lucide-react';

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
      }
    } catch {
      // In case localStorage is blocked
    }
  }, []);

  const saveConsent = (allAccepted: boolean, customAnalytics = false, customMarketing = false) => {
    const preferences = {
      essential: true,
      analytics: allAccepted || customAnalytics,
      marketing: allAccepted || customMarketing,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem('coolwave_cookie_consent', JSON.stringify(preferences));
    } catch {}
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="p-2 rounded-lg bg-sky-600/20 text-sky-400 shrink-0 border border-sky-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-1">
                Datenschutz & Privatsphäre bei CoolWave
              </span>
              Wir verwenden ausschließlich technisch notwendige Cookies, um unsere Plattform bereitzustellen. Mit Ihrer Einwilligung nutzen wir anonyme Analysen zur Produktverbesserung. Ihre Dokumente werden bei den meisten Werkzeugen direkt in Ihrem Browser verarbeitet. Mehr Informationen in unserer{' '}
              <Link href="/de/datenschutz" className="underline text-sky-400 hover:text-sky-300">
                Datenschutzerklärung
              </Link>{' '}
              und unserer{' '}
              <Link href="/de/cookie-richtlinie" className="underline text-sky-400 hover:text-sky-300">
                Cookie-Richtlinie
              </Link>.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Einstellungen</span>
            </button>
            <button
              onClick={() => saveConsent(false)}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Nur notwendige
            </button>
            <button
              onClick={() => saveConsent(true)}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Cookie-Einstellungen</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">Technisch notwendig</div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Unverzichtbar für die Funktionalität der Werkzeuge und Sicherheitseinstellungen.
                  </p>
                </div>
                <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded">
                  Immer aktiv
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">Anonyme Analyse</div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Hilft uns zu verstehen, welche Konvertierungstools am häufigsten genutzt werden.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-1 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">Personalisierte Werbung</div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Ermöglicht das Einblenden relevanter Partnerangebote zur Finanzierung der kostenlosen Tools.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => saveConsent(false, analytics, marketing)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
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
