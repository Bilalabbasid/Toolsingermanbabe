import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  Zap,
  UserX,
  BadgeEuro,
  MonitorSmartphone,
  FileUp,
  SlidersHorizontal,
  Download,
  Server,
  Laptop,
  X,
  Check,
  Clock,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { ToolDefinition } from '@/types/tool';
import { getActiveTools } from '@/config/tools.config';
import { getAllArticles, BLOG_CATEGORIES } from '@/config/blog.config';
import { featureFlags } from '@/config/featureFlags.config';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { FaqSection } from '@/components/tools/FaqSection';
import { AdSlot } from '@/components/common/AdSlot';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { getNavCategories, getPopularActiveTools, CATEGORY_ACCENTS } from '@/components/common/navData';
import { HeroSearch } from './HeroSearch';
import { HOME_FAQS } from './homeContent';

const QUICK_LINKS: Array<{ label: string; slug: string }> = [
  { label: 'PDF zusammenfügen', slug: 'pdf-zusammenfuegen' },
  { label: 'PDF komprimieren', slug: 'pdf-komprimieren' },
  { label: 'JPG in PDF', slug: 'jpg-in-pdf-umwandeln' },
  { label: 'HEIC in JPG', slug: 'heic-in-jpg-umwandeln' },
  { label: 'Bild komprimieren', slug: 'bild-komprimieren' },
  { label: 'PDF unterschreiben', slug: 'pdf-unterschreiben' },
];

const PRIVACY_POINTS = [
  { icon: UploadCloud, title: 'Kein Upload', text: 'Dateien werden im Arbeitsspeicher Ihres Browsers verarbeitet – nicht auf fremden Servern.' },
  { icon: Zap, title: 'Spürbar schneller', text: 'Keine Wartezeit für Hoch- und Herunterladen. Das Ergebnis steht sofort bereit.' },
  { icon: UserX, title: 'Ohne Konto', text: 'Keine Registrierung, keine E-Mail-Adresse, keine Installation.' },
  { icon: BadgeEuro, title: 'Kostenlos', text: 'Alle Tools sind gratis – ohne Abo, ohne Testphase, ohne Haken.' },
];

const STEPS = [
  { icon: FileUp, title: 'Datei auswählen', text: 'Ziehen Sie Ihre Datei in das Tool oder wählen Sie sie aus. Sie wird nur lokal geöffnet.' },
  { icon: SlidersHorizontal, title: 'Optionen festlegen', text: 'Reihenfolge, Qualität oder Format einstellen – mit Vorschau, wo es sinnvoll ist.' },
  { icon: Download, title: 'Ergebnis speichern', text: 'Ihr Browser berechnet das Ergebnis in Sekunden. Herunterladen, fertig.' },
];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function HomePage() {
  const tools: ToolDefinition[] = getActiveTools();
  const toolCount = tools.length;
  const toolSlugs = new Set(tools.map((t) => t.slug));
  const popularTools = getPopularActiveTools(8, tools);
  const categories = getNavCategories(5, tools);
  const quickLinks = QUICK_LINKS.filter((q) => toolSlugs.has(q.slug));
  const latestArticles = [...getAllArticles()]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 3);

  return (
    <div className="w-full">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-line" aria-labelledby="home-title">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-canvas" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="container-page pt-10 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/90 ring-1 ring-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-card">
            <span className="relative flex w-2 h-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            Ihre Dateien verlassen nie Ihr Gerät
          </p>

          <h1 id="home-title" className="mt-5 text-display text-ink max-w-4xl mx-auto">
            Dateien konvertieren –{' '}
            <span className="bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">100 % im Browser</span>, ohne
            Upload
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            PDFs zusammenfügen, Bilder verkleinern, Dokumente umwandeln: {toolCount} kostenlose Tools, die direkt auf Ihrem
            Gerät arbeiten. Schnell, privat und ohne Anmeldung.
          </p>

          <div className="mt-7 sm:mt-9">
            <HeroSearch toolCount={toolCount} />
          </div>

          {quickLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-ink-subtle">Beliebt:</span>
              {quickLinks.map((q) => (
                <Link
                  key={q.slug}
                  href={`/de/${q.slug}`}
                  className="inline-flex items-center h-8 px-3 rounded-full bg-white ring-1 ring-line text-xs font-medium text-ink-muted hover:text-sky-700 hover:ring-sky-300 transition-colors"
                >
                  {q.label}
                </Link>
              ))}
            </div>
          )}

          <ul className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            {['Kein Upload, keine Speicherung', 'Kostenlos & ohne Anmeldung', 'Für Computer und Smartphone'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Popular tools ───────────────────────────────────────────── */}
      <section className="container-page py-12 sm:py-16" aria-labelledby="popular-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="eyebrow">Am häufigsten genutzt</p>
            <h2 id="popular-title" className="mt-2 text-title text-ink">
              Beliebte Tools
            </h2>
          </div>
          <Link href="/de/kategorie/pdf" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
            Alle PDF-Tools <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <ToolGrid tools={popularTools} columns={4} />
      </section>

      {/* ── Categories ──────────────────────────────────────────────── */}
      <section className="bg-white border-y border-line" aria-labelledby="categories-title">
        <div className="container-page py-12 sm:py-16">
          <div className="max-w-2xl mb-8">
            <p className="eyebrow">Alle Kategorien</p>
            <h2 id="categories-title" className="mt-2 text-title text-ink">
              Für jede Datei das passende Werkzeug
            </h2>
            <p className="mt-3 text-ink-muted">
              {toolCount} Tools in {categories.length} Kategorien – vom PDF-Editor bis zum Video-Konverter.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {categories.map((cat) => {
              const accent = CATEGORY_ACCENTS[cat.slug];
              return (
                <li key={cat.slug} className="card p-5 sm:p-6 flex flex-col">
                  <div className="flex items-start gap-3.5">
                    <span className={`w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0 ${accent.tile}`}>
                      <CategoryIcon category={cat.slug} className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-ink">
                        <Link href={`/de/kategorie/${cat.slug}`} className="hover:text-sky-700 transition-colors">
                          {cat.name}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-[13px] text-ink-subtle leading-snug">{cat.description}</p>
                    </div>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {cat.tools.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={`/de/${tool.slug}`}
                          className="inline-flex items-center h-8 px-2.5 rounded-lg bg-surface-muted text-[13px] text-ink-muted hover:bg-sky-50 hover:text-sky-700 transition-colors"
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/de/kategorie/${cat.slug}`}
                    className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Alle {cat.count} {cat.name} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Privacy / trust ─────────────────────────────────────────── */}
      <section className="container-page py-14 sm:py-20" aria-labelledby="privacy-title">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Datenschutz by Design
            </p>
            <h2 id="privacy-title" className="mt-2 text-title text-ink">
              Ihre Dateien bleiben, wo sie hingehören: bei Ihnen
            </h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Klassische Online-Konverter laden Ihre Dokumente auf ihre Server. Datei Tools geht einen anderen Weg: Die
              komplette Verarbeitung läuft per WebAssembly in Ihrem Browser. Verträge, Ausweise oder Fotos verlassen Ihr
              Gerät nicht – nicht einmal kurzzeitig.
            </p>

            <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRIVACY_POINTS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold text-ink">{title}</dt>
                    <dd className="mt-0.5 text-[13px] text-ink-subtle leading-relaxed">{text}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <Link
              href="/de/datenschutz"
              className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              Zur Datenschutzerklärung <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Comparison graphic */}
          <div className="space-y-4" aria-label="Vergleich: klassischer Online-Konverter und Datei Tools">
            <div className="rounded-2xl bg-white ring-1 ring-line p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Klassischer Online-Konverter</p>
              <div className="mt-4 flex items-center justify-between gap-2 text-center text-xs text-ink-muted">
                <FlowNode icon={<Laptop className="w-5 h-5" />} label="Ihr Gerät" />
                <FlowArrow label="Upload" muted />
                <FlowNode icon={<Server className="w-5 h-5" />} label="Fremder Server" tone="warn" />
                <FlowArrow label="Download" muted />
                <FlowNode icon={<Laptop className="w-5 h-5" />} label="Ihr Gerät" />
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[13px] text-rose-700">
                <X className="w-4 h-4 shrink-0" aria-hidden="true" /> Datei liegt (zeitweise) bei Dritten
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 p-5 sm:p-6 text-white shadow-raised">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-100">Datei Tools</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-6 h-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">Alles passiert in Ihrem Browser</p>
                  <p className="text-[13px] text-sky-100">Öffnen, bearbeiten, speichern – auf Ihrem Gerät.</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[13px] text-white">
                <Check className="w-4 h-4 shrink-0" aria-hidden="true" /> Keine Übertragung, keine Kopie, kein Risiko
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="bg-white border-y border-line" aria-labelledby="how-title">
        <div className="container-page py-12 sm:py-16">
          <div className="max-w-2xl mb-8">
            <p className="eyebrow">So einfach geht’s</p>
            <h2 id="how-title" className="mt-2 text-title text-ink">
              In drei Schritten zur fertigen Datei
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl bg-canvas ring-1 ring-line p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-brand">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Schritt {i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-subtle leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AdSlot slotKey="homepage_bottom" className="max-w-5xl" />

      {/* ── Latest guides ───────────────────────────────────────────── */}
      {latestArticles.length > 0 && (
        <section className="container-page py-12 sm:py-16" aria-labelledby="guides-title">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="eyebrow">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Ratgeber
              </p>
              <h2 id="guides-title" className="mt-2 text-title text-ink">
                Neueste Anleitungen
              </h2>
            </div>
            <Link href="/de/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
              Alle Ratgeber <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
            {latestArticles.map((article) => (
              <li key={article.slug} className="min-w-0">
                <article className="group relative h-full card p-5 sm:p-6 flex flex-col hover:border-sky-300 hover:shadow-raised transition-[border-color,box-shadow]">
                  <p className="text-xs font-semibold text-sky-700">{BLOG_CATEGORIES[article.category]?.name ?? 'Ratgeber'}</p>
                  <h3 className="mt-2 text-base font-semibold text-ink group-hover:text-sky-700 transition-colors line-clamp-2">
                    <Link href={`/de/blog/${article.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-ink-subtle leading-relaxed line-clamp-3">{article.excerpt}</p>
                  <p className="mt-auto pt-4 flex items-center gap-3 text-xs text-ink-subtle">
                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {article.readingTimeMinutes} Min.
                    </span>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <div className="container-page">
        <div className="max-w-3xl mx-auto">
          <FaqSection
            faqs={HOME_FAQS}
            toolName="Datei Tools"
            title="Häufige Fragen zu Datei Tools"
            subtitle="Alles Wichtige zu Datenschutz, Kosten und Funktionsweise."
            id="home-faq"
          />
        </div>
      </div>

      {/* ── Closing CTA ─────────────────────────────────────────────── */}
      <section className="container-page pb-14 sm:pb-20" aria-labelledby="cta-title">
        <div className="relative overflow-hidden rounded-3xl bg-inverse px-6 py-10 sm:px-12 sm:py-14 text-center">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-sky-500/20 blur-3xl"
            aria-hidden="true"
          />
          <h2 id="cta-title" className="relative text-title text-white">
            Bereit? Ihre nächste Datei ist in Sekunden fertig.
          </h2>
          <p className="relative mt-3 text-slate-300 max-w-xl mx-auto">
            Kein Upload, kein Konto, keine Wartezeit – starten Sie direkt mit einem der beliebtesten Tools.
          </p>
          <div className="relative mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/de/pdf-zusammenfuegen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-colors"
            >
              PDF zusammenfügen <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/de/bild-komprimieren"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/20 text-white font-semibold transition-colors"
            >
              Bild komprimieren
            </Link>
          </div>
          {featureFlags.enableStripeCheckout && (
            <Link href="/de/preise" className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200">
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Datei Tools Pro für Vielnutzer
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function FlowNode({ icon, label, tone }: { icon: React.ReactNode; label: string; tone?: 'warn' }) {
  return (
    <span className="flex flex-col items-center gap-1.5 min-w-0">
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${
          tone === 'warn' ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-surface-muted text-ink-muted ring-line'
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </span>
  );
}

function FlowArrow({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${muted ? 'text-ink-subtle' : ''}`} aria-hidden="true">
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      <span className="w-full border-t-2 border-dashed border-line-strong" />
    </span>
  );
}
