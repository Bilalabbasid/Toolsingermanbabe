import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata = {
  title: 'Cookie-Richtlinie | CoolWave',
  description: 'Übersicht über den Einsatz von Cookies und Tracking-Technologien auf CoolWave.',
};

export default function CookieRichtliniePage() {
  const breadcrumbs = [
    { name: 'Cookie-Richtlinie', url: '/de/cookie-richtlinie' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-6">
        Cookie-Richtlinie
      </h1>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-8 rounded-2xl border border-slate-200">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Was sind Cookies?</h2>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert. Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Welche Arten von Cookies setzen wir ein?</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Technisch notwendige Cookies</h3>
              <p className="text-xs text-slate-600 mt-1">
                Diese Cookies sind für den Betrieb der Website zwingend erforderlich (z.B. Speicherung Ihrer Cookie-Einwilligung oder Sitzungszustand). Sie können nicht deaktiviert werden.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Analyse-Cookies (nur mit Einwilligung)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Ermöglichen uns das anonyme Erfassen von Besucherzahlen und beliebten Konvertierungswerkzeugen, um die Leistung unserer Plattform kontinuierlich zu verbessern.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Verwaltung Ihrer Cookie-Einstellungen</h2>
          <p>
            Sie können Ihre Cookie-Präferenzen jederzeit über das Cookie-Banner am unteren Bildschirmrand anpassen oder in den Browsereinstellungen das Setzen von Cookies grundsätzlich blockieren.
          </p>
        </section>
      </div>
    </div>
  );
}
