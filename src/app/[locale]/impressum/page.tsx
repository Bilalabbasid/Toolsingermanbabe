import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata = {
  title: 'Impressum | CoolWave',
  description: 'Gesetzliche Anbieterkennzeichnung nach § 5 DDG für CoolWave (coolwave.cool).',
};

export default function ImpressumPage() {
  const breadcrumbs = [
    { name: 'Impressum', url: '/de/impressum' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-6">
        Impressum
      </h1>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-8 rounded-2xl border border-slate-200">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">[Name des Diensteanbieters / Betreibergesellschaft]</p>
            <p>[Vertretungsberechtigte Person / Geschäftsführer]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ und Ort, Deutschland / EU]</p>
            <p>Handelsregister: [Amtsgericht ...] | HRB [Nummer]</p>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [DE ...]</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Kontakt</h2>
          <p>
            E-Mail: support@coolwave.cool<br />
            Website: https://coolwave.cool
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Verbraucherstreitbeilegung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            https://ec.europa.eu/consumers/odr. Wir sind nicht verpflichtet und grundsätzlich nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Haftung für Inhalte und Links</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir übernehmen keine Gewähr für die Richtigkeit der durch Nutzer bearbeiteten oder konvertierten Dateien.
          </p>
        </section>
      </div>
    </div>
  );
}
