import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata = {
  title: 'Allgemeine Geschäftsbedingungen (AGB) | CoolWave',
  description: 'Nutzungsbedingungen und AGB für die Nutzung der Datei- und PDF-Werkzeuge auf CoolWave.',
};

export default function AgbPage() {
  const breadcrumbs = [
    { name: 'AGB', url: '/de/agb' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-6">
        Allgemeine Geschäftsbedingungen (AGB)
      </h1>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-8 rounded-2xl border border-slate-200">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für alle kostenlosen und kostenpflichtigen Dienste der Plattform CoolWave (coolwave.cool), betrieben von [Betreibergesellschaft].
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Leistungsbeschreibung & Verfügbarkeit</h2>
          <p>
            CoolWave bietet webbasierte Werkzeuge zur Konvertierung, Komprimierung, Bearbeitung und Verwaltung von digitalen Dokumenten und Bilddateien. Wir bemühen uns um eine unterbrechungsfreie Verfügbarkeit, garantieren jedoch keine 100%ige Uptime im kostenlosen Tarif.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Pflichten der Nutzer</h2>
          <p>
            Der Nutzer verpflichtet sich, keine Dateien hochzuladen oder zu verarbeiten, die Schadsoftware, Viren oder rechtswidrige Inhalte enthalten oder Schutzrechte Dritter (z. B. Urheberrechte) verletzen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Abonnements & Kündigung (CoolWave Pro)</h2>
          <p>
            Kostenpflichtige Abonnements verlängern sich automatisch um den gewählten Abrechnungszeitraum (monatlich oder jährlich), sofern sie nicht vor Ablauf gekündigt werden. Die Kündigung kann jederzeit mit Wirkung zum Ende des laufenden Abrechnungszeitraums über das Benutzerprofil vorgenommen werden.
          </p>
        </section>
      </div>
    </div>
  );
}
