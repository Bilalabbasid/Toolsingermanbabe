import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CookiePreferencesButton } from '@/components/common/CookiePreferencesButton';
import Link from 'next/link';
import { Cookie, ShieldCheck, BarChart3, Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Cookie-Richtlinie | CoolWave',
  description: 'Transparente Übersicht über den Einsatz von Cookies, Drittanbieter-Diensten und Ihre Widerrufsmöglichkeiten bei CoolWave.',
};

export default function CookieRichtliniePage() {
  const breadcrumbs = [
    { name: 'Cookie-Richtlinie', url: '/de/cookie-richtlinie' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cookie-Richtlinie
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Transparenz über den Einsatz von Cookies und Tracking-Technologien (TDDDG & DSGVO)
        </p>
      </div>

      {/* Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-base font-bold text-slate-900">Möchten Sie Ihre Einstellungen ändern?</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Sie können Ihre einmal erteilten Cookie-Einwilligungen jederzeit mit Wirkung für die Zukunft anpassen oder widerrufen.
          </p>
        </div>
        <CookiePreferencesButton label="Cookie-Einstellungen öffnen" className="shrink-0" />
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* 1. Was sind Cookies? */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Was sind Cookies & Web Storage?</h2>
          <p>
            Cookies sind kleine Textdateien, die Ihr Browser auf Ihrem Endgerät speichert. Sie ermöglichen es Webanwendungen, Einstellungen (wie z. B. Ihre Sprachauswahl oder Ihre Datenschutzeinstellungen) sitzungsübergreifend beizubehalten. Ergänzend zu Cookies nutzt unsere Website lokale Browserspeicher (wie <code>localStorage</code>) für eine besonders ressourcensparende Speicherung Ihrer Berechtigungen.
          </p>
        </section>

        {/* 2. Kategorien */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">2. Welche Arten von Cookies setzen wir ein?</h2>
          
          <div className="space-y-4">
            {/* Essential */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Technisch notwendige Cookies (Rechtsgrundlage: § 25 Abs. 2 TDDDG)</h3>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Diese Cookies bzw. Storage-Einträge sind zwingend erforderlich, damit Sie sich auf der Website bewegen und grundlegende Funktionen (z. B. Beibehaltung des Cookie-Consent-Status oder Session-Tokens) nutzen können. Sie bedürfen keiner vorherigen Einwilligung und können nicht abgewählt werden.
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                Typische Einträge: <code>coolwave_cookie_consent</code>, Sitzungszustand.
              </div>
            </div>

            {/* Analytics */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Analyse & Performance (Opt-in: Art. 6 Abs. 1 lit. a DSGVO)</h3>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Helfen uns zu verstehen, welche Konvertierungswerkzeuge am häufigsten genutzt werden und wo technische Fehler auftreten. Alle statistischen Erhebungen erfolgen anonymisiert ohne Bildung individueller Nutzerprofile. Sie werden nur mit Ihrer ausdrücklichen Einwilligung aktiviert.
              </p>
            </div>

            {/* Advertising */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Marketing & Google AdSense (Opt-in: Art. 6 Abs. 1 lit. a DSGVO)</h3>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Werden im kostenfreien Tarif genutzt, um relevante Werbeanzeigen bereitzustellen und den kostenfreien Betrieb der Konvertierungsserver zu finanzieren. Werbepartner wie Google Ireland Limited verarbeiten Daten nur, wenn Sie dieser Kategorie ausdrücklich zugestimmt haben.
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Abonnenten von CoolWave Pro erhalten eine 100% werbefreie Nutzung: Hier werden generell keine Werbeskripte geladen.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Browser-Verwaltung */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Steuerung über den Browser</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unabhängig von unserem Einwilligungs-Banner können Sie das Speichern von Cookies in Ihren Browsereinstellungen (z. B. unter Mozilla Firefox, Google Chrome, Safari oder Microsoft Edge) jederzeit deaktivieren, einschränken oder bestehende Cookies löschen. Bitte beachten Sie, dass bei vollständiger Blockade aller Cookies funktionale Einschränkungen auftreten können.
          </p>
        </section>

        {/* 4. Kontakt & Datenschutz */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Weitere Auskünfte & Verantwortlicher</h2>
          <p className="text-xs text-slate-600">
            Ausführliche Erläuterungen zu Ihren Rechten und der Datenverarbeitung bei CoolWave finden Sie in unserer{' '}
            <Link href="/de/datenschutz" className="text-sky-600 underline font-medium">
              Datenschutzerklärung
            </Link>.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-0.5 mt-3">
            <p className="font-semibold text-slate-900">[Name des Diensteanbieters / Betreibergesellschaft]</p>
            <p>[Straße und Hausnummer], [PLZ und Ort, Deutschland / EU]</p>
            <p>E-Mail: datenschutz@coolwave.cool</p>
          </div>
        </section>

      </div>
    </div>
  );
}
