import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import Link from 'next/link';

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

      <div className="mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Impressum
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Anbieterkennzeichnung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Diensteanbieter</h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">[Name des Diensteanbieters / Betreibergesellschaft]</p>
            <p>[Rechtsform, z. B. Einzelunternehmen / GmbH / UG (haftungsbeschränkt)]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[Postleitzahl und Ort, Deutschland / EU]</p>
          </div>
        </section>

        {/* Vertretung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Vertretungsberechtigte Personen</h2>
          <p className="text-xs text-slate-600">
            Vertreten durch: [Name der vertretungsberechtigten Person / Geschäftsführer]
          </p>
        </section>

        {/* Register & USt-ID */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Registereintrag & Steuernummer</h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
            <p>Registergericht: [Amtsgericht ..., falls eingetragen]</p>
            <p>Registernummer: [HRB / HRA ..., falls eingetragen]</p>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [DE ..., falls vorhanden]</p>
          </div>
        </section>

        {/* Kontakt */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Kontakt</h2>
          <p className="text-xs text-slate-600">
            E-Mail: <a href="mailto:support@coolwave.cool" className="text-sky-600 underline font-medium">support@coolwave.cool</a><br />
            Support & Kontaktformular:{' '}
            <Link href="/de/kontakt" className="text-sky-600 underline font-medium">
              coolwave.cool/de/kontakt
            </Link>
          </p>
        </section>

        {/* Redaktionell verantwortlich */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="text-xs text-slate-600">
            [Name der verantwortlichen Person]<br />
            [Straße und Hausnummer]<br />
            [Postleitzahl und Ort]
          </p>
        </section>

        {/* Streitbeilegung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">EU-Streitschlichtung & Verbraucherstreitbeilegung</h2>
          <p className="text-xs text-slate-600">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">
              https://ec.europa.eu/consumers/odr/
            </a>.<br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
          </p>
        </section>

        {/* Haftung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Haftung für Inhalte und Hyperlinks</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir überwachen übermittelte oder gespeicherte fremde Informationen nicht kontinuierlich auf etwaige Rechtswidrigkeiten (§§ 8 bis 10 DDG). Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte unverzüglich entfernen.
          </p>
        </section>

      </div>
    </div>
  );
}
