import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getAllArticles,
  getArticleBySlug,
  BLOG_CATEGORIES,
} from '@/config/blog.config';
import { getToolBySlug } from '@/config/tools.config';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogToolCTA } from '@/components/blog/BlogToolCTA';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { ToolIcon } from '@/components/common/ToolIcon';
import {
  generateArticleMetadata,
  generateArticleSchema,
} from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';
import {
  Clock,
  Calendar,
  Sparkles,
  HelpCircle,
  Wrench,
  Check,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((art) => ({
    locale: 'de',
    slug: art.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artikel nicht gefunden | CoolWave',
      robots: { index: false, follow: false },
    };
  }

  return generateArticleMetadata({
    slug: article.slug,
    title: article.metaTitle,
    description: article.metaDescription,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    locale,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const catInfo = BLOG_CATEGORIES[article.category];
  const primaryTool = getToolBySlug(article.primaryToolSlug);
  const relatedTools = article.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => !!t);

  // Schemas
  const articleSchema = generateArticleSchema({
    slug: article.slug,
    title: article.title,
    description: article.metaDescription,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: article.author,
    locale,
  });

  const breadcrumbs = [
    { name: 'Ratgeber', url: `/${locale}/blog` },
    { name: catInfo ? catInfo.name : 'Artikel', url: `/${locale}/blog` },
    { name: article.title, url: `/${locale}/blog/${article.slug}` },
  ];

  // FAQ Schema if FAQs exist
  const faqSchema =
    article.faqs && article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
        />
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <BlogBreadcrumbs items={breadcrumbs} />

        {/* Article Header */}
        <header className="mt-6 mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mb-3.5">
            <span className="font-bold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-0.5 rounded-full">
              {catInfo ? catInfo.name : article.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readingTimeMinutes} Min. Lesezeit
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Aktualisiert: {article.updatedAt}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {article.h1}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-600 leading-relaxed font-medium">
            {article.excerpt}
          </p>

          {/* Quick Direct Answer Box (Google Answer Box Optimization) */}
          <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-sky-50/80 border border-sky-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Die Schnell-Antwort</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {article.directAnswer}
            </p>
          </div>
        </header>

        {/* PRIMARY TOOL CTA: ABOVE THE FOLD */}
        <BlogToolCTA
          toolSlug={article.primaryToolSlug}
          headline={article.ctaHeadline}
          buttonLabel={article.ctaButtonLabel}
          className="mb-10 sm:mb-12"
        />

        {/* Table of Contents */}
        <nav
          aria-label="Inhaltsverzeichnis"
          className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-10 text-xs sm:text-sm"
        >
          <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px] text-slate-500">
            Inhalt dieser Anleitung
          </div>
          <ul className="space-y-2">
            <li>
              <a
                href="#schritt-fuer-schritt"
                className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1.5"
              >
                <span>1. Schritt-für-Schritt-Anleitung</span>
              </a>
            </li>
            {article.sections.map((sec, idx) => (
              <li key={idx}>
                <a
                  href={`#abschnitt-${idx}`}
                  className="text-slate-600 hover:text-sky-600 flex items-center gap-1.5"
                >
                  <span>{idx + 2}. {sec.heading}</span>
                </a>
              </li>
            ))}
            {article.faqs && article.faqs.length > 0 && (
              <li>
                <a
                  href="#faq"
                  className="text-slate-600 hover:text-sky-600 flex items-center gap-1.5"
                >
                  <span>{article.sections.length + 2}. Häufige Fragen (FAQ)</span>
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Step-by-Step Instructions */}
        <section id="schritt-fuer-schritt" className="my-10 sm:my-14 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <span>Schritt-für-Schritt-Anleitung</span>
          </h2>

          <div className="space-y-4 sm:space-y-5">
            {article.steps.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* In-Depth Content Sections */}
        <div className="space-y-10 sm:space-y-12 my-10">
          {article.sections.map((section, idx) => (
            <section
              key={idx}
              id={`abschnitt-${idx}`}
              className="scroll-mt-20 prose prose-slate max-w-none"
            >
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
                {section.heading}
              </h2>
              <div className="text-xs sm:text-base text-slate-700 leading-relaxed space-y-4">
                <p>{section.content}</p>
              </div>

              {/* Contextual compact CTA after first section */}
              {idx === 0 && primaryTool && (
                <BlogToolCTA
                  toolSlug={article.primaryToolSlug}
                  variant="compact"
                  className="my-6"
                />
              )}
            </section>
          ))}
        </div>

        {/* Security / Privacy Trust Callout */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 my-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white mb-1">
              Datenschutz &amp; Vertraulichkeit bei CoolWave
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ihre Dateien und Dokumente werden nach europäischen Datenschutzstandards (DSGVO) verarbeitet. Werkzeuge mit clientseitiger Technologie verarbeiten Ihre Daten vollständig auf Ihrem eigenen Gerät, ohne Server-Upload.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        {article.faqs && article.faqs.length > 0 && (
          <section id="faq" className="my-12 sm:my-16 scroll-mt-20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Häufig gestellte Fragen (FAQ)
              </h2>
            </div>

            <div className="space-y-4">
              {article.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-start gap-2">
                    <span className="text-sky-600 font-bold">F:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Tools from Tool Registry */}
        {relatedTools.length > 0 && (
          <section className="my-12 sm:my-16 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-sky-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Passende CoolWave Werkzeuge für diese Aufgabe
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Diese Tools ergänzen Ihren Workflow und sind sofort kostenlos nutzbar:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${locale}/${tool.slug}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ToolIcon
                        name={tool.icon}
                        category={tool.category}
                        className="w-4 h-4"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                        {tool.nameDe}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {tool.shortDescriptionDe}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-sky-600">
                    <span>Tool öffnen</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FINAL CONVERSION CTA */}
        <BlogToolCTA
          toolSlug={article.primaryToolSlug}
          headline={article.ctaHeadline}
          buttonLabel={article.ctaButtonLabel}
          className="my-10"
        />

        {/* Related Blog Articles */}
        <RelatedArticles currentSlug={article.slug} />
      </article>
    </>
  );
}
