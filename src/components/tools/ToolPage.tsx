import React from 'react';
import { ToolDefinition } from '@/types/tool';
import { CATEGORIES } from '@/config/categories.config';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ToolInterface } from '@/components/tools/ToolInterface';
import { HowItWorks } from '@/components/tools/HowItWorks';
import { FaqSection } from '@/components/tools/FaqSection';
import { RelatedTools } from '@/components/tools/RelatedTools';
import { AdSlot } from '@/components/common/AdSlot';
import { 
  generateWebApplicationSchema, 
  generateFAQSchema, 
  generateBreadcrumbSchema
} from '@/lib/seo';
import { ShieldCheck, Cpu, CheckCircle2, Sparkles, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface ToolPageProps {
  tool: ToolDefinition;
  locale: string;
}

export function ToolPage({ tool, locale }: ToolPageProps) {
  const categoryInfo = CATEGORIES[tool.category];
  const categoryName = categoryInfo ? categoryInfo.name : 'Werkzeuge';

  const breadcrumbs = [
    { name: categoryName, url: `/${locale}/kategorie/${tool.category}` },
    { name: tool.nameDe, url: `/${locale}/${tool.slug}` },
  ];

  const appSchema = generateWebApplicationSchema(tool);
  const faqSchema = generateFAQSchema(tool);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Startseite', url: `/${locale}` },
    ...breadcrumbs,
  ]);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Breadcrumb Navigation */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Above-the-Fold Hero & Tool Workspace */}
        <div className="text-center max-w-3xl mx-auto mt-2 sm:mt-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3">
            {tool.badge && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                {tool.badge}
              </span>
            )}
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold max-w-full truncate">
              {tool.browserCapable ? (
                <>
                  <Cpu className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="hidden sm:inline">Lokale Browser-Verarbeitung (100% Datenschutz)</span>
                  <span className="sm:hidden">100% Lokal im Browser</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="hidden sm:inline">Verschlüsselte Cloud-Verarbeitung (15 Min. Auto-Löschung)</span>
                  <span className="sm:hidden">Verschlüsselt (15 Min. Löschung)</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight px-1">
            {tool.h1De}
          </h1>

          <p className="mt-2 text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto px-1">
            {tool.shortDescriptionDe}
          </p>

          {/* Quick Trust Signals */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              100% Kostenlos
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
              Keine Registrierung
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              Ohne Installation
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              DSGVO-konform
            </span>
          </div>
        </div>

        {/* Primary Interactive Workspace */}
        <div className="max-w-4xl mx-auto mb-10">
          <ToolInterface tool={tool} />
        </div>

        {/* Non-intrusive Ad Slot */}
        <AdSlot format="horizontal" />

        {/* In-Depth SEO Explanation Section */}
        <section className="my-10 sm:my-16 max-w-4xl mx-auto">
          <div className="p-4 sm:p-8 md:p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              {tool.nameDe} – kostenlos und online
            </h2>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
              <p>{tool.introDe}</p>
            </div>

            {/* Key Features List */}
            {tool.features && tool.features.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Ihre Vorteile mit CoolWave:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Execution Breakdown */}
            {tool.privacyExplanationDe && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                  <Lock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Datenschutz & Dateisicherheit:
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tool.privacyExplanationDe}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Limits Comparison Cards */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Kapazität & Limitierungen:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Kostenlose Version
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Bis zu {tool.freeLimits.maxFileSizeMB} MB / Datei
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Maximal {tool.freeLimits.maxBatch} {tool.freeLimits.maxBatch === 1 ? 'Datei' : 'Dateien'} gleichzeitig
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/60 border border-sky-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      CoolWave Pro
                    </div>
                    <Link
                      href={`/${locale}/preise`}
                      className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-0.5"
                    >
                      Upgraden <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Bis zu {tool.proLimits.maxFileSizeMB} MB / Datei
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Bis zu {tool.proLimits.maxBatch} Dateien gleichzeitig im Stapel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <HowItWorks steps={tool.howItWorksDe} toolName={tool.nameDe} />

        {/* Troubleshooting & Edge Cases Section */}
        {tool.troubleshootingDe && tool.troubleshootingDe.length > 0 && (
          <section className="my-10 sm:my-16 max-w-4xl mx-auto">
            <div className="p-4 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Häufige Probleme & Lösungen zu {tool.nameDe}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Praxistipps für fehlerfreie Ergebnisse und knifflige Dokumente.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {tool.troubleshootingDe.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/60 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-start gap-2">
                      <span className="text-sky-600 font-black">?</span>
                      <span>{item.issue}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-4">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Policy-Compliant In-Content Ad Placement (Safely placed far below application controls) */}
        <AdSlot slotKey="tool_content" className="my-10" />

        {/* FAQ Accordion with Schema */}
        <FaqSection faqs={tool.faqDe} toolName={tool.nameDe} />

        {/* Bidirectional Internal Link Graph */}
        <RelatedTools
          relatedSlugs={tool.relatedTools}
          currentToolName={tool.nameDe}
        />
      </div>
    </>
  );
}
