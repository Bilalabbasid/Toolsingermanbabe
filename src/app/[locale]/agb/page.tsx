import React from 'react';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { privacyConfig } from '@/config/privacy.config';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Allgemeine Geschäftsbedingungen (AGB) | CoolWave',
  description: 'Nutzungsbedingungen und AGB für die Nutzung der Datei- und PDF-Werkzeuge auf CoolWave (coolwave.cool). Regelungen zu kostenlosen und Pro-Diensten.',
  path: '/agb',
  locale: 'de',
});

export default function AgbPage() {
  const breadcrumbs = [
    { name: 'AGB', url: '/de/agb' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Stand: September 2026 | Nutzungsbedingungen für die Online-Plattform CoolWave
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* 1. Geltungsbereich */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Geltungsbereich und Vertragspartner</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung aller auf der Plattform <strong>CoolWave</strong> (coolwave.cool) bereitgestellten Online-Tools, Konvertierungsdienste und Abonnements. Vertragspartner ist:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1 my-3">
            <p className="font-bold text-slate-900">[Name des Diensteanbieters / Betreibergesellschaft]</p>
            <p>[Straße und Hausnummer], [PLZ und Ort, Deutschland / EU]</p>
            <p>E-Mail: support@coolwave.cool</p>
          </div>
          <p className="text-xs text-slate-600">
            Abweichende Geschäftsbedingungen des Nutzers finden keine Anwendung, es sei denn, ihrer Geltung wurde ausdrücklich schriftlich zugestimmt.
          </p>
        </section>

        {/* 2. Leistungsbeschreibung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Leistungsbeschreibung & Tarife</h2>
          <p>
            CoolWave stellt browser- und serverbasierte Werkzeuge zur Verarbeitung, Konvertierung, Komprimierung und Optimierung von Dokumenten und Bilddateien zur Verfügung.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 mt-2">
            <li><strong>Kostenloser Basis-Tarif:</strong> Ermöglicht die freie Nutzung der Kernwerkzeuge mit definierten Dateigrößen- und Stapelverarbeitungslimits. Die Finanzierung erfolgt unter anderem über nicht-personalisierte bzw. zustimmungsbasierte Online-Werbung.</li>
            <li><strong>CoolWave Pro-Abonnement:</strong> Bietet erweiterte Dateigrößenlimits, beschleunigte Prioritätsverarbeitung, unbegrenzte Stapelverarbeitung, OCR-Texterkennung und eine 100% werbefreie Nutzungsumgebung ohne Werbeskripte.</li>
          </ul>
        </section>

        {/* 3. Dateiverarbeitung und Löschung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Dateiverarbeitung, Speicherdauer & Datenschutz</h2>
          <p>
            Der Schutz Ihrer Dokumente hat oberste Priorität:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 mt-2">
            <li>Dateien werden – sofern technisch möglich – ausschließlich lokal in Ihrem Webbrowser verarbeitet.</li>
            <li>Bei servergestützten Werkzeugen werden Dateien temporär über verschlüsselte HTTPS-Verbindungen übertragen und nach Ablauf der Aufbewahrungsfrist von <strong>{privacyConfig.retentionMinutes} Minuten</strong> automatisch und unwiderruflich gelöscht.</li>
            <li>Quelldateien werden im Sinne der Datenminimierung unmittelbar nach erfolgreicher Konvertierung gelöscht.</li>
            <li>Es findet keine dauerhafte Speicherung oder inhaltliche Verwertung Ihrer Dokumente statt. Details regelt unsere{' '}
              <Link href="/de/datenschutz" className="text-sky-600 underline font-medium">
                Datenschutzerklärung
              </Link>.
            </li>
          </ul>
        </section>

        {/* 4. Pflichten des Nutzers */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Pflichten des Nutzers & Verbotene Nutzung</h2>
          <p>
            Der Nutzer verpflichtet sich, die angebotenen Dienste nur im Einklang mit den geltenden Gesetzen zu verwenden. Untersagt ist insbesondere:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 mt-2">
            <li>Das Hochladen von Dateien, die Viren, Trojaner oder sonstige Schadsoftware enthalten.</li>
            <li>Die Verarbeitung von Inhalten, die Rechte Dritter (insbesondere Urheber-, Marken- oder Persönlichkeitsrechte) verletzen.</li>
            <li>Die missbräuchliche Überlastung der Serverinfrastruktur durch automatisierte Massenanfragen außerhalb bereitgestellter Schnittstellen.</li>
          </ul>
        </section>

        {/* 5. Zahlungsabwicklung & Kündigung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">5. Pro-Abonnements, Zahlungsabwicklung & Kündigung</h2>
          <p className="text-xs text-slate-600">
            Die Abrechnung von Pro-Abonnements erfolgt über zertifizierte Zahlungsdienstleister (z. B. Stripe). Das Abonnement verlängert sich automatisch um den gewählten Abrechnungszeitraum (monatlich oder jährlich), sofern es nicht vor Ablauf der jeweiligen Laufzeit gekündigt wird. Die Kündigung kann jederzeit mit wenigen Klicks im Nutzerkonto vorgenommen werden.
          </p>
        </section>

        {/* 6. Gewährleistung & Haftungsbeschränkung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">6. Gewährleistung & Haftung</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wir bemühen uns um eine hohe Verfügbarkeit und optimale Konvertierungsergebnisse. Für den kostenlosen Dienst wird keine Garantie für eine unterbrechungsfreie Verfügbarkeit übernommen. Die Haftung für Datenverluste ist ausgeschlossen, es sei denn, diese beruhen auf vorsätzlichem oder grob fahrlässigem Handeln. Nutzer sind angehalten, Sicherheitskopien ihrer Originaldokumente vorzuhalten.
          </p>
        </section>

        {/* 7. Schlussbestimmungen */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">7. Schlussbestimmungen</h2>
          <p className="text-xs text-slate-600">
            Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG), soweit dem keine zwingenden verbraucherrechtlichen Vorschriften entgegenstehen.
          </p>
        </section>

      </div>
    </div>
  );
}
