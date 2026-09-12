import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata = {
  title: 'Datenschutzerklärung | CoolWave',
  description: 'Informationen zur Verarbeitung personenbezogener Daten und zum Schutz Ihrer Privatsphäre bei CoolWave.',
};

export default function DatenschutzPage() {
  const breadcrumbs = [
    { name: 'Datenschutz', url: '/de/datenschutz' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-6">
        Datenschutzerklärung
      </h1>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-8 rounded-2xl border border-slate-200">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Datenschutz auf einen Blick</h2>
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Bei CoolWave gilt das Prinzip „Privacy by Design“: Viele unserer Dateiwerkzeuge (wie Bildkomprimierung, Bildkonvertierung, PDF-Zusammenführung, Rotation und PDF-Bearbeitung) verarbeiten Ihre Dateien zu 100% lokal in Ihrem Webbrowser mittels moderner Browser-Technologie (HTML5 Canvas & WebAssembly). In diesen Fällen verlassen Ihre Dateien Ihr Endgerät zu keinem Zeitpunkt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Verantwortliche Stelle</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            [Firma / Betreiber Name]<br />
            [Straße und Hausnummer]<br />
            [PLZ und Ort, Deutschland / EU]<br />
            E-Mail: datenschutz@coolwave.cool
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Datenerfassung auf unserer Website</h2>
          <h3 className="font-semibold text-slate-800 text-sm mt-3 mb-1">Server-Log-Dateien</h3>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt (Browsertyp, Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse). Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Grundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>

          <h3 className="font-semibold text-slate-800 text-sm mt-3 mb-1">Verarbeitung von hochgeladenen Dateien</h3>
          <p>
            Sollte für ein bestimmtes Konvertierungswerkzeug eine serverseitige Verarbeitung erforderlich sein, werden die Dateien über eine verschlüsselte HTTPS-Verbindung übertragen, ausschließlich im flüchtigen temporären Speicher verarbeitet und nach maximal 15 Minuten automatisch und unwiderruflich von unseren Systemen gelöscht. Es findet keine dauerhafte Speicherung oder inhaltliche Auswertung statt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
          </p>
        </section>
      </div>
    </div>
  );
}
