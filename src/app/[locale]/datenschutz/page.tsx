import React from 'react';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import Link from 'next/link';
import { Lock, Cpu, HardDrive } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Datenschutzerklärung | Datei Tools',
  description: 'Datenschutzerklärung von Datei Tools: Ihre Dateien werden lokal im Browser verarbeitet und nicht hochgeladen. Infos zu Server-Logs, Cookies und Ihren Rechten.',
  path: '/datenschutz',
  locale: 'de',
});

export default function DatenschutzPage() {
  const breadcrumbs = [
    { name: 'Datenschutz', url: '/de/datenschutz' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Datenschutzerklärung
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Stand: September 2026 | Transparente Angaben gemäß Art. 13 und 14 EU-DSGVO
        </p>
      </div>

      {/* Technical Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-3">
          <Cpu className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-sky-950 uppercase tracking-wide">100 % lokal im Browser</div>
            <p className="text-xs text-sky-800 mt-0.5">Alle Werkzeuge verarbeiten Ihre Dateien direkt auf Ihrem Gerät.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">Kein Datei-Upload</div>
            <p className="text-xs text-amber-800 mt-0.5">Dateiinhalte werden nicht an unsere Server übertragen oder dort gespeichert.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Minimale Logs</div>
            <p className="text-xs text-emerald-800 mt-0.5">IP-Anonymisierung und strikter Verzicht auf Dateiinhalts-Logs.</p>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-8 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>1. Grundsätze und technische Architektur</span>
          </h2>
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten und den verantwortungsvollen Umgang mit Ihren Dokumenten sehr ernst.
            Bei Datei Tools gilt das Prinzip der Datenminimierung und Transparenz nach Art. 5 Abs. 1 lit. c DSGVO.
          </p>

          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600" />
                Lokale Verarbeitung im Browser (kein Upload)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Sämtliche Werkzeuge auf unserer Plattform – darunter PDF-, Bild-, Dokumenten-, OCR-, Video-, Audio- und Archiv-Werkzeuge – werden mittels JavaScript- und WebAssembly-Technologien <strong>vollständig lokal in Ihrem Webbrowser</strong> ausgeführt. Die von Ihnen ausgewählten Dateien werden ausschließlich im Arbeitsspeicher Ihres Endgeräts verarbeitet. Sie verlassen Ihr Endgerät zu keinem Zeitpunkt und werden nicht an unsere Server übertragen; wir erhalten daher keine Kenntnis von Dateiinhalten oder Dateinamen.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                Programmbibliotheken und Sprachdaten
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Für einzelne Werkzeuge (z. B. Texterkennung, Video- oder Archivverarbeitung) lädt Ihr Browser beim ersten Aufruf benötigte Programmbestandteile wie WebAssembly-Module oder Sprachdaten von unserem Webserver herunter. Dabei werden lediglich die unter Ziffer 4 genannten technisch notwendigen Zugriffsdaten verarbeitet – Ihre Dateien werden hierbei nicht übertragen.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>2. Umgang mit Ihren Dateien</span>
          </h2>
          <p>
            Da die Verarbeitung lokal erfolgt, findet keine Speicherung, inhaltliche Auswertung, Vervielfältigung oder Weitergabe Ihrer Dokumenteninhalte durch uns statt. Ergebnisdateien werden direkt in Ihrem Browser erzeugt und über die Download-Funktion Ihres Browsers auf Ihrem Gerät gespeichert.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Sobald Sie den Browser-Tab schließen oder neu laden, werden die verarbeiteten Daten aus dem Arbeitsspeicher entfernt. Bitte beachten Sie, dass installierte Browser-Erweiterungen grundsätzlich Zugriff auf Webseiteninhalte haben können; hierauf haben wir keinen Einfluss.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>3. Verantwortliche Stelle</span>
          </h2>
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">Bil Al</p>
            <p>20095 Hamburg, Deutschland</p>
            <p className="text-sky-700">E-Mail für Datenschutzanfragen: info@datei-tools.de</p>
            <p>Allgemeiner Support: info@datei-tools.de</p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>4. Datenerfassung, Server-Logs & IP-Anonymisierung</span>
          </h2>
          <p>
            Beim Aufruf unserer Website verarbeitet unser Webserver technisch notwendige Zugriffsdaten in sogenannten Server-Log-Dateien. Um den Grundsatz der Datenminimierung zu wahren, werden IP-Adressen automatisiert maskiert (bei IPv4 werden die letzten 8 Bit auf .0 gesetzt, IPv6 wird auf /48 gekürzt).
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Erfasste Log-Daten: Browsertyp, Betriebssystem, Referrer URL, Zugriffszeit und anonymisierte IP. Es findet keine Zusammenführung mit anderen Datenquellen oder Profilbildung statt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Gewährleistung von Systemsicherheit und Missbrauchsabwehr).
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>5. Keine serverseitige Dateispeicherung</span>
          </h2>
          <p>
            Unsere Server stellen ausschließlich die Website und die für die lokale Verarbeitung benötigten Programmdateien bereit. Ein Upload-, Konvertierungs- oder Speicherdienst für Ihre Dateien wird nicht betrieben. Es existieren daher weder Upload-Verzeichnisse noch Download-Links zu Ihren Dokumenten auf unseren Systemen.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>6. Cookie-Einwilligung & Werbedienste (Google AdSense)</span>
          </h2>
          <p>
            Wir setzen ein transparentes Consent-Management-System ein. Nicht-notwendige Cookies und Drittanbieter-Dienste werden erst nach Ihrer ausdrücklichen Zustimmung aktiviert (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <p>
              <strong>Google AdSense:</strong> Im kostenfreien Tarif binden wir Werbeanzeigen über Google AdSense (Google Ireland Limited, Dublin, Irland) ein. Diese Skripte werden ausschließlich geladen, wenn Sie der Kategorie „Marketing“ im Cookie-Banner zugestimmt haben.
            </p>
            <p>
              <strong>Werbefreiheit für Pro-Nutzer:</strong> Abonnenten von Datei Tools Pro erhalten eine werbefreie Nutzungsumgebung, in der keinerlei Werbe- oder Marketing-Tracker ausgeführt werden.
            </p>
            <p>
              Sie können Ihre Cookie-Präferenzen jederzeit in unserer{' '}
              <Link href="/de/cookie-richtlinie" className="text-sky-600 underline font-medium hover:text-sky-700">
                Cookie-Richtlinie
              </Link>{' '}
              anpassen oder widerrufen.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>7. Ihre Rechte als betroffene Person</span>
          </h2>
          <p>
            Nach den Bestimmungen der DSGVO stehen Ihnen umfassende Rechte bezüglich Ihrer Daten zu:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs text-slate-700">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="block text-slate-900 mb-1">Auskunftsrecht (Art. 15 DSGVO)</strong>
              Sie können Auskunft über Ihre bei uns verarbeiteten personenbezogenen Daten verlangen.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="block text-slate-900 mb-1">Löschungsrecht (Art. 17 DSGVO)</strong>
              Sie haben das Recht auf unverzügliche Löschung Ihrer Daten, sofern keine gesetzlichen Pflichten entgegenstehen.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="block text-slate-900 mb-1">Widerspruchsrecht (Art. 21 DSGVO)</strong>
              Sie können aus Gründen Ihrer besonderen Situation der Datenverarbeitung jederzeit widersprechen.
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="block text-slate-900 mb-1">Beschwerderecht (Art. 77 DSGVO)</strong>
              Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
