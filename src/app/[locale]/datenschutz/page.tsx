import React from 'react';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { privacyConfig } from '@/config/privacy.config';
import Link from 'next/link';
import { ShieldCheck, Lock, Trash2, Cpu, Server, Key } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Datenschutzerklärung – 100% DSGVO-konform | CoolWave',
  description: 'Transparente Informationen zur Verarbeitung personenbezogener Daten, Dateilebenszyklus und Privatsphäre bei CoolWave. Keine permanente Speicherung.',
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
            <div className="text-xs font-bold text-sky-950 uppercase tracking-wide">Client-Side First</div>
            <p className="text-xs text-sky-800 mt-0.5">Viele Tools verarbeiten Daten zu 100% lokal im Browser ohne Upload.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">{privacyConfig.retentionMinutes} Min. Löschzyklus</div>
            <p className="text-xs text-amber-800 mt-0.5">Server-Dateien werden nach {privacyConfig.retentionMinutes} Minuten automatisch gelöscht.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Minimale Logs</div>
            <p className="text-xs text-emerald-800 mt-0.5">IP-Anonymisierung (/24) und strikter Verzicht auf Dateiinhalts-Logs.</p>
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
            Bei CoolWave gilt das Prinzip der Datenminimierung und Transparenz nach Art. 5 Abs. 1 lit. c DSGVO.
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600" />
                A. Reine Client-seitige Browser-Werkzeuge (Zero-Upload)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Zahlreiche Werkzeuge auf unserer Plattform (darunter Standard-PDF-Zusammenführung, PDF-Rotation, PDF-Seiten-Entfernung sowie Client-Bildkonvertierungen) werden mittels moderner WebAssembly- und HTML5-Technologien <strong>vollständig lokal in Ihrem Webbrowser</strong> ausgeführt. In diesen Fällen verlassen Ihre Dokumente Ihr Endgerät zu keinem Zeitpunkt und werden nicht an unsere Server übertragen.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                B. Server-gestützte Konvertierungs- und OCR-Werkzeuge
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Für komplexe Aufgaben (insbesondere Dokumentenkonvertierungen wie DOCX/XLSX/PPTX, OCR-Texterkennung oder Stapelverarbeitungen) ist eine temporäre serverseitige Verarbeitung technisch erforderlich. In diesen Fällen wird Ihre Datei über eine TLS/HTTPS-verschlüsselte Verbindung an unsere abgesicherten Server übertragen.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>2. Temporärer Dateilebenszyklus (File Lifecycle)</span>
          </h2>
          <p>
            Sofern eine serverseitige Verarbeitung stattfindet, unterliegen alle Dateien einem streng reglementierten, flüchtigen Lebenszyklus:
          </p>

          <div className="my-4 border border-slate-200 rounded-xl p-4 bg-slate-50 font-mono text-xs space-y-2 text-slate-700">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">1. Upload:</span>
              <span>Empfang über HTTPS & Speicherung unter kryptografisch zufälliger UUID in isoliertem Arbeitsverzeichnis.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">2. Verarbeitung:</span>
              <span>Ausführung des Konvertierungs- oder OCR-Auftrags in isolierter Prozessumgebung.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">3. Sofortige Datenminimierung:</span>
              <span>Die ursprüngliche Quelldatei wird unmittelbar nach Fertigstellung des Ergebnisses vom Server gelöscht.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">4. Bereitstellung:</span>
              <span>Das Ergebnis steht ausschließlich über eine signierte, zeitlich begrenzte Download-URL bereit.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">5. Automatische Löschung:</span>
              <span>Nach Ablauf der Aufbewahrungsfrist ({privacyConfig.retentionMinutes} Minuten) wird die Ergebnisdatei automatisiert und unwiderruflich vernichtet.</span>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Es findet zu keinem Zeitpunkt eine dauerhafte Speicherung, inhaltliche Auswertung, Vervielfältigung oder Weitergabe Ihrer Dokumenteninhalte an Dritte statt.
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
            <p className="font-bold text-slate-900">[Name des Diensteanbieters / Betreibergesellschaft]</p>
            <p>[Vertretungsberechtigte Person / Geschäftsführer]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[Postleitzahl und Ort, Deutschland / EU]</p>
            <p className="text-sky-700">E-Mail für Datenschutzanfragen: datenschutz@coolwave.cool</p>
            <p>Allgemeiner Support: support@coolwave.cool</p>
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
            <span>5. Signierte Download-URLs & Speicherzugriff</span>
          </h2>
          <p>
            Um unbefugten Zugriff durch Dritte oder automatisierte Scraper auszuschließen:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 mt-2">
            <li>Dateinamen werden im Speicher durch zufallsgenerierte, nicht erratbare UUIDs ersetzt.</li>
            <li>Das direkte Durchsuchen von Verzeichnissen (Directory Indexing) ist serverseitig strikt unterbunden.</li>
            <li>Download-Links werden mit einem kryptografischen HMAC-SHA256-Token und einer festen Ablaufzeit ({privacyConfig.retentionMinutes} Min.) versehen. Manipulationen oder unautorisierte Abfragen werden abgewiesen.</li>
          </ul>
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
              <strong>Werbefreiheit für Pro-Nutzer:</strong> Abonnenten von CoolWave Pro erhalten eine werbefreie Nutzungsumgebung, in der keinerlei Werbe- oder Marketing-Tracker ausgeführt werden.
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
