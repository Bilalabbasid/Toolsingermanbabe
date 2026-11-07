import React from 'react';
import Link from 'next/link';
import { ShieldCheck, WifiOff, BadgeEuro, ArrowRight, BookOpen, Globe } from 'lucide-react';
import { CookiePreferencesButton } from './CookiePreferencesButton';
import { BrandLogo } from './BrandLogo';
import { getNavCategories } from './navData';
import { getAllArticles } from '@/config/blog.config';
import { featureFlags } from '@/config/featureFlags.config';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: '100 % lokal verarbeitet',
    text: 'Ihre Dateien werden direkt in Ihrem Browser bearbeitet und nie auf einen Server hochgeladen.',
  },
  {
    icon: WifiOff,
    title: 'Keine Speicherung, kein Konto',
    text: 'Ohne Registrierung nutzbar. Schließen Sie den Tab, sind alle Daten aus dem Arbeitsspeicher verschwunden.',
  },
  {
    icon: BadgeEuro,
    title: 'Kostenlos & DSGVO-freundlich',
    text: 'Alle Tools sind gratis. Weil nichts übertragen wird, sehen wir Ihre Dateiinhalte nie.',
  },
];

const linkClass = 'inline-block py-1 text-[13px] text-slate-400 hover:text-white transition-colors';
const headingClass = 'text-xs font-bold uppercase tracking-[0.1em] text-slate-200 mb-3';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const categories = getNavCategories(6);
  const latestArticles = [...getAllArticles()]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 5);

  return (
    <footer className="bg-inverse text-slate-300 safe-area-bottom" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Fußzeile
      </h2>

      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 py-8 sm:py-10">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 text-sky-300 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,15rem)_1fr] gap-10 lg:gap-14">
          {/* Brand column */}
          <div>
            <Link href="/de" aria-label="Datei Tools – Startseite" className="inline-block rounded-lg">
              <BrandLogo inverted />
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-400 max-w-xs">
              Datei Tools bündelt über {categories.reduce((s, c) => s + c.count, 0)} kostenlose Werkzeuge für PDFs, Bilder,
              Dokumente und mehr – alle laufen vollständig in Ihrem Browser.
            </p>
            <Link
              href="/de/blog"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-sky-300" aria-hidden="true" />
              Ratgeber &amp; Anleitungen
            </Link>
          </div>

          {/* Link grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-9">
            {categories.map((cat) => (
              <nav key={cat.slug} aria-label={cat.name}>
                <h3 className={headingClass}>
                  <Link href={`/de/kategorie/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </h3>
                <ul>
                  {cat.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/de/${tool.slug}`} className={linkClass}>
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/de/kategorie/${cat.slug}`}
                      className="inline-flex items-center gap-1 py-1 text-[13px] font-semibold text-sky-300 hover:text-sky-200"
                    >
                      Alle {cat.count} anzeigen <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              </nav>
            ))}

            {latestArticles.length > 0 && (
              <nav aria-label="Neueste Ratgeber">
                <h3 className={headingClass}>
                  <Link href="/de/blog" className="hover:text-white transition-colors">
                    Ratgeber
                  </Link>
                </h3>
                <ul>
                  {latestArticles.map((article) => (
                    <li key={article.slug}>
                      <Link href={`/de/blog/${article.slug}`} className={`${linkClass} line-clamp-1`}>
                        {article.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/de/blog" className="inline-flex items-center gap-1 py-1 text-[13px] font-semibold text-sky-300 hover:text-sky-200">
                      Alle Ratgeber <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              </nav>
            )}

            <nav aria-label="Service und Rechtliches">
              <h3 className={headingClass}>Service &amp; Rechtliches</h3>
              <ul>
                <li><Link href="/de/kontakt" className={linkClass}>Kontakt</Link></li>
                {featureFlags.enableStripeCheckout && (
                  <li><Link href="/de/preise" className={linkClass}>Preise</Link></li>
                )}
                <li><Link href="/de/impressum" className={linkClass}>Impressum</Link></li>
                <li><Link href="/de/datenschutz" className={linkClass}>Datenschutzerklärung</Link></li>
                <li><Link href="/de/agb" className={linkClass}>AGB</Link></li>
                <li><Link href="/de/cookie-richtlinie" className={linkClass}>Cookie-Richtlinie</Link></li>
                <li>
                  <CookiePreferencesButton variant="link" label="Cookie-Einstellungen" className={`${linkClass} cursor-pointer`} />
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <p>© {currentYear} Datei Tools · datei-tools.de</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" /> Deutsch
            </span>
            <span aria-hidden="true">·</span>
            <span>Dateien bleiben auf Ihrem Gerät</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
