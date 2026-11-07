import { serializeJsonLd } from '@/lib/json-ld';
import { getClientFileLimitMB } from '@/config/deployment.config';
import React from 'react';
import Link from 'next/link';
import { ToolDefinition } from '@/types/tool';
import { CATEGORIES } from '@/config/categories.config';
import { getToolsByCategory } from '@/config/tools.config';
import { getArticlesForTool } from '@/config/blog.config';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ToolInterface } from '@/components/tools/ToolInterface';
import { HowItWorks } from '@/components/tools/HowItWorks';
import { FaqSection } from '@/components/tools/FaqSection';
import { RelatedTools } from '@/components/tools/RelatedTools';
import { AdSlot } from '@/components/common/AdSlot';
import { ToolIcon } from '@/components/common/ToolIcon';
import { CATEGORY_ACCENTS } from '@/components/common/navMeta';
import { sortByPopularity } from '@/components/common/navData';
import { getFormatFlow } from '@/lib/search';
import {
  generateWebApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lightbulb,
  BadgeEuro,
  UserX,
  HardDrive,
  BookOpen,
  Clock,
} from 'lucide-react';

interface ToolPageProps {
  tool: ToolDefinition;
  locale: string;
}

/** Copy that still describes the retired server pipeline must not be shown next to the "local" promise. */
const SERVER_COPY = /server|hochgelad|15\s*min|geschredder|temporär gespeichert|cloud/i;

const LOCAL_PRIVACY_TEXT =
  'Die Verarbeitung läuft vollständig in Ihrem Browser – per JavaScript und WebAssembly direkt auf Ihrem Gerät. Ihre Dateien werden zu keinem Zeitpunkt hochgeladen, gespeichert oder an Dritte übertragen. Sobald Sie den Tab schließen, sind alle Daten aus dem Arbeitsspeicher entfernt.';

export function ToolPage({ tool, locale }: ToolPageProps) {
  const maxFileSizeMB = getClientFileLimitMB(tool.processingEngine);
  const categoryInfo = CATEGORIES[tool.category];
  const categoryName = categoryInfo ? categoryInfo.name : 'Werkzeuge';
  const categoryHref = `/${locale}/kategorie/${tool.category}`;
  const accent = CATEGORY_ACCENTS[tool.category] || CATEGORY_ACCENTS.utilities;
  const flow = getFormatFlow(tool);

  const features = (tool.features || []).filter((f) => !SERVER_COPY.test(f));
  const privacyText =
    tool.privacyExplanationDe && !SERVER_COPY.test(tool.privacyExplanationDe) ? tool.privacyExplanationDe : null;

  const moreInCategory = sortByPopularity(getToolsByCategory(tool.category))
    .filter((t) => t.slug !== tool.slug && !tool.relatedTools.includes(t.slug))
    .slice(0, 8);
  const categoryCount = getToolsByCategory(tool.category).length;
  const guides = getArticlesForTool(tool.slug, tool.category, 3);

  const breadcrumbs = [
    { name: categoryName, url: categoryHref },
    { name: tool.nameDe, url: `/${locale}/${tool.slug}` },
  ];

  const appSchema = generateWebApplicationSchema(tool, locale);
  const faqSchema = generateFAQSchema(tool);
  const breadcrumbSchema = generateBreadcrumbSchema([{ name: 'Startseite', url: `/${locale}` }, ...breadcrumbs]);

  return (
    <>
      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(appSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />

      {/* ── Hero + workspace ─────────────────────────────────────────── */}
      <div className="relative isolate">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-sky-50 via-sky-50/40 to-transparent"
          aria-hidden="true"
        />
        <div className="container-page pt-1 sm:pt-3">
          <Breadcrumbs items={breadcrumbs} />

          <header className="max-w-3xl mx-auto text-center mt-2 sm:mt-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`w-11 h-11 rounded-2xl ring-1 flex items-center justify-center shadow-card ${accent.tile}`}>
                <ToolIcon name={tool.icon} category={tool.category} className="w-5.5 h-5.5" />
              </span>
              <Link
                href={categoryHref}
                className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-line px-3 py-1 text-xs font-semibold text-ink-muted hover:text-sky-700 hover:ring-sky-200 transition-colors"
              >
                {categoryName}
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>

            <h1 className="text-[1.75rem] leading-[1.15] sm:text-4xl md:text-[2.75rem] font-extrabold tracking-tight text-ink">
              {tool.h1De}
            </h1>
            <p className="mt-3 text-[15px] sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
              {tool.shortDescriptionDe}
            </p>

            <ul className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium" aria-label="Eigenschaften">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                Lokal verarbeitet
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink-muted ring-1 ring-line px-3 py-1">
                <BadgeEuro className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                Kostenlos
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink-muted ring-1 ring-line px-3 py-1">
                <UserX className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                Ohne Anmeldung
              </li>
              <li className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white text-ink-muted ring-1 ring-line px-3 py-1">
                {flow}
              </li>
              {tool.badge && (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {tool.badge}
                </li>
              )}
            </ul>
          </header>

          <div className="max-w-5xl mx-auto">
            <ToolInterface tool={tool} />
          </div>
        </div>
      </div>

      <div className="container-page">
        <AdSlot format="horizontal" />

        {/* ── Content + sidebar ─────────────────────────────────────── */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_19rem] gap-8 lg:gap-12 items-start">
          <div className="min-w-0">
            {/* Intro & features */}
            <section aria-labelledby="tool-intro-title">
              <p className="eyebrow">Über das Tool</p>
              <h2 id="tool-intro-title" className="mt-2 text-heading text-ink">
                {tool.nameDe} – kostenlos und ohne Upload
              </h2>
              <div className="prose-tool mt-4 text-[15px] sm:text-base text-ink-muted leading-relaxed">
                <p>{tool.introDe}</p>
              </div>

              {features.length > 0 && (
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5" aria-label="Funktionen">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-xl bg-white ring-1 ring-line px-3.5 py-3 text-sm text-ink-muted">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <HowItWorks steps={tool.howItWorksDe} toolName={tool.nameDe} />

            {/* Troubleshooting */}
            {tool.troubleshootingDe && tool.troubleshootingDe.length > 0 && (
              <section aria-labelledby="troubleshooting-title" className="my-12 sm:my-16">
                <p className="eyebrow">Tipps</p>
                <h2 id="troubleshooting-title" className="mt-2 text-heading text-ink">
                  Häufige Probleme &amp; Lösungen
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  {tool.troubleshootingDe.map((item, idx) => (
                    <div key={idx} className="card p-4 sm:p-5 flex items-start gap-3.5">
                      <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">{item.issue}</h3>
                        <p className="mt-1 text-sm text-ink-muted leading-relaxed">{item.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <AdSlot slotKey="tool_content" className="my-10" />

            <FaqSection faqs={tool.faqDe} toolName={tool.nameDe} />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-4" aria-label="Weitere Informationen">
            <div className="rounded-2xl bg-emerald-50/70 ring-1 ring-emerald-200/70 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                Datenschutz: lokal verarbeitet
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-emerald-900/80">{privacyText ?? LOCAL_PRIVACY_TEXT}</p>
            </div>

            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <HardDrive className="w-4 h-4 text-sky-600" aria-hidden="true" />
                Dateilimits
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Pro Datei</dt>
                  <dd className="mt-0.5 font-bold text-ink">{maxFileSizeMB} MB</dd>
                </div>
                <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Upload</dt>
                  <dd className="mt-0.5 font-bold text-ink">Keiner – lokal</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-ink-subtle leading-relaxed">
                Große Dateien benötigen mehr Arbeitsspeicher. Auf älteren Smartphones kann die Verarbeitung länger dauern.
              </p>
            </div>

            {moreInCategory.length > 0 && (
              <nav className="card p-5" aria-labelledby="more-in-category-title">
                <h2 id="more-in-category-title" className="text-sm font-bold text-ink">
                  Mehr {categoryName}
                </h2>
                <ul className="mt-2 -mx-2">
                  {moreInCategory.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/${locale}/${t.slug}`}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-muted hover:bg-surface-muted hover:text-sky-700 transition-colors"
                      >
                        <ToolIcon name={t.icon} category={t.category} className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                        <span className="truncate">{t.nameDe}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={categoryHref}
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-sky-700 hover:text-sky-800"
                >
                  Alle {categoryCount} {categoryName} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </nav>
            )}
          </aside>
        </div>

        <RelatedTools relatedSlugs={tool.relatedTools} currentToolName={tool.nameDe} category={tool.category} />

        {/* Related guides */}
        {guides.length > 0 && (
          <section aria-labelledby="tool-guides-title" className="my-12 sm:my-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <p className="eyebrow">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Ratgeber
                </p>
                <h2 id="tool-guides-title" className="mt-2 text-heading text-ink">
                  Anleitungen rund um {tool.nameDe}
                </h2>
              </div>
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800 self-start sm:self-auto"
              >
                Alle Ratgeber <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4" role="list">
              {guides.map((article) => (
                <li key={article.slug} className="min-w-0">
                  <Link
                    href={`/${locale}/blog/${article.slug}`}
                    className="group flex flex-col h-full card p-5 hover:border-sky-300 hover:shadow-raised transition-[border-color,box-shadow]"
                  >
                    <h3 className="text-[15px] font-semibold text-ink group-hover:text-sky-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-[13px] text-ink-subtle leading-relaxed line-clamp-3">{article.excerpt}</p>
                    <span className="mt-auto pt-4 flex items-center justify-between text-xs text-ink-subtle">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {article.readingTimeMinutes} Min. Lesezeit
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                        Lesen <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
