import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getRelatedArticles,
  BLOG_CATEGORIES,
  getBlogCategoryPath,
} from '@/config/blog.config';
import { getToolBySlug } from '@/config/tools.config';
import { CATEGORIES } from '@/config/categories.config';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { BlogToolCTA } from '@/components/blog/BlogToolCTA';
import { BlogRichText, toPlainText } from '@/components/blog/BlogRichText';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { formatGermanDate } from '@/components/blog/cardData';
import { ToolIcon } from '@/components/common/ToolIcon';
import {
  generateArticleMetadata,
  generateArticleSchema,
  generateFAQPageSchema,
  generateHowToSchema,
  localeUrl,
} from '@/lib/seo';
import { serializeJsonLd } from '@/lib/json-ld';
import { Clock, Calendar, Sparkles, HelpCircle, Wrench, Shield, ArrowRight, BookOpen } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Only the articles known at build time exist; everything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllArticles().map((art) => ({
    locale: 'de',
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artikel nicht gefunden | Datei Tools',
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
    section: BLOG_CATEGORIES[article.category]?.name,
    tags: [article.primaryKeyword, ...article.secondaryKeywords.slice(0, 5)],
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const catInfo = BLOG_CATEGORIES[article.category];
  const categoryPath = getBlogCategoryPath(article.category, locale);
  const primaryTool = getToolBySlug(article.primaryToolSlug);
  const relatedTools = article.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const toolCategory = primaryTool ? CATEGORIES[primaryTool.category] : undefined;
  const related = getRelatedArticles(article.slug, 4);
  const moreInCategory = getArticlesByCategory(article.category)
    .filter((a) => a.slug !== article.slug && !related.some((r) => r.slug === a.slug))
    .slice(0, 5);

  const pageUrl = localeUrl(`/blog/${article.slug}`, locale);
  const wordCount = [
    article.directAnswer,
    ...article.steps.map((s) => `${s.title} ${s.text}`),
    ...article.sections.map((s) => `${s.heading} ${toPlainText(s.content)}`),
    ...article.faqs.map((f) => `${f.question} ${f.answer}`),
  ]
    .join(' ')
    .split(/\s+/).length;

  const articleSchema = generateArticleSchema({
    slug: article.slug,
    title: article.h1 || article.title,
    description: article.metaDescription,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: article.author,
    locale,
    section: catInfo?.name,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords],
    wordCount,
    aboutTool: primaryTool ? { name: primaryTool.nameDe, url: localeUrl(`/${primaryTool.slug}`, locale) } : undefined,
  });
  const faqSchema = generateFAQPageSchema(article.faqs);
  const howToSchema =
    article.searchIntent !== 'commercial'
      ? generateHowToSchema({
          name: article.h1 || article.title,
          description: article.directAnswer,
          url: pageUrl,
          steps: article.steps,
          toolName: primaryTool ? `${primaryTool.nameDe} (Datei Tools)` : undefined,
          stepAnchors: true,
        })
      : null;

  const breadcrumbs = [
    { name: 'Ratgeber', url: `/${locale}/blog` },
    { name: catInfo ? catInfo.name : 'Artikel', url: categoryPath },
    { name: article.title, url: `/${locale}/blog/${article.slug}` },
  ];

  const tocItems = [
    { id: 'schritt-fuer-schritt', label: 'Schritt-für-Schritt-Anleitung' },
    ...article.sections.map((sec, idx) => ({ id: `abschnitt-${idx + 1}`, label: sec.heading })),
    ...(article.faqs.length > 0 ? [{ id: 'faq', label: 'Häufige Fragen (FAQ)' }] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      )}
      {howToSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToSchema) }} />
      )}

      <article className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <BlogBreadcrumbs items={breadcrumbs} />

        <header className="mb-8 mt-6 sm:mb-10">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 text-xs text-ink-subtle sm:gap-3">
            <Link
              href={categoryPath}
              className="rounded-full border border-sky-100 bg-sky-50 px-3 py-0.5 font-bold text-sky-700 hover:border-sky-300"
            >
              {catInfo ? catInfo.name : article.category}
            </Link>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readingTimeMinutes} Min. Lesezeit
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {article.updatedAt && article.updatedAt !== article.publishedAt ? (
                <>
                  Aktualisiert am <time dateTime={article.updatedAt}>{formatGermanDate(article.updatedAt)}</time>
                </>
              ) : (
                <>
                  Veröffentlicht am <time dateTime={article.publishedAt}>{formatGermanDate(article.publishedAt)}</time>
                </>
              )}
            </span>
          </div>

          <h1 className="text-2xl font-black leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            {article.h1}
          </h1>

          <p className="mt-4 text-sm font-medium leading-relaxed text-ink-muted sm:text-lg">{article.excerpt}</p>

          <div className="mt-6 rounded-2xl border border-sky-200/90 bg-sky-50/80 p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800">
              <Sparkles className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <span>Kurz erklärt</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-800">{article.directAnswer}</p>
          </div>

          <p className="mt-3 text-xs text-ink-subtle">
            Von der {article.author} · Erstveröffentlichung{' '}
            <time dateTime={article.publishedAt}>{formatGermanDate(article.publishedAt)}</time>
          </p>
        </header>

        <BlogToolCTA
          toolSlug={article.primaryToolSlug}
          headline={article.ctaHeadline}
          buttonLabel={article.ctaButtonLabel}
          className="mb-10 sm:mb-12"
        />

        <nav aria-label="Inhaltsverzeichnis" className="mb-10 rounded-2xl border border-line bg-surface-muted p-5 text-sm sm:p-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Inhalt dieser Anleitung</p>
          <ol className="list-decimal space-y-2 pl-5 marker:text-ink-subtle">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-ink-muted hover:text-sky-700">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="schritt-fuer-schritt" className="my-10 scroll-mt-24 sm:my-14" aria-labelledby="schritte-titel">
          <h2 id="schritte-titel" className="mb-6 text-xl font-black tracking-tight text-ink sm:text-2xl">
            Schritt-für-Schritt-Anleitung
          </h2>
          <ol className="space-y-4 sm:space-y-5">
            {article.steps.map((step) => (
              <li
                key={step.step}
                id={`schritt-${step.step}`}
                className="flex scroll-mt-24 items-start gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sm font-black text-sky-700"
                  aria-hidden="true"
                >
                  {step.step}
                </span>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-ink sm:text-base">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="my-10 space-y-10 sm:space-y-12">
          {article.sections.map((section, idx) => (
            <section key={idx} id={`abschnitt-${idx + 1}`} className="scroll-mt-24">
              <h2 className="mb-4 text-xl font-black tracking-tight text-ink sm:text-2xl">{section.heading}</h2>
              <BlogRichText content={section.content} locale={locale} />

              {idx === 0 && primaryTool && (
                <BlogToolCTA toolSlug={article.primaryToolSlug} variant="compact" className="my-6" />
              )}
            </section>
          ))}
        </div>

        <aside className="my-10 flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white sm:p-6">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-sky-400">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="mb-1 text-sm font-bold text-white sm:text-base">Datenschutz: Ihre Dateien bleiben auf Ihrem Gerät</p>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Alle Werkzeuge von Datei Tools arbeiten lokal in Ihrem Browser. Ihre Dokumente, Fotos und Videos werden nicht
              auf einen Server hochgeladen – das ist datensparsam, DSGVO-freundlich und funktioniert ohne Anmeldung.{' '}
              <Link href={`/${locale}/blog/dateien-ohne-upload-bearbeiten-dsgvo`} className="font-semibold text-sky-300 underline underline-offset-2 hover:text-sky-200">
                So funktioniert die lokale Verarbeitung
              </Link>
            </p>
          </div>
        </aside>

        {article.faqs.length > 0 && (
          <section id="faq" className="my-12 scroll-mt-24 sm:my-16" aria-labelledby="faq-titel">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 id="faq-titel" className="text-xl font-black tracking-tight text-ink sm:text-2xl">
                Häufig gestellte Fragen
              </h2>
            </div>
            <div className="space-y-3">
              {article.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  open={idx === 0}
                  className="group rounded-2xl border border-line bg-surface p-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-bold text-ink sm:text-base">
                    <h3 className="font-bold">{faq.question}</h3>
                    <span className="mt-0.5 text-sky-600 transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {relatedTools.length > 0 && (
          <section className="my-12 rounded-3xl border border-line bg-surface-muted p-6 sm:my-16 sm:p-8" aria-labelledby="tools-titel">
            <div className="mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <h2 id="tools-titel" className="text-base font-black text-ink sm:text-lg">
                Passende Werkzeuge für diese Aufgabe
              </h2>
            </div>
            <p className="mb-6 text-xs text-ink-subtle">Kostenlos, ohne Anmeldung und lokal im Browser:</p>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {relatedTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/${locale}/${tool.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-4 transition-all hover:border-sky-300 hover:shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <ToolIcon name={tool.icon} category={tool.category} className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-ink group-hover:text-sky-700">{tool.nameDe}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-ink-subtle">{tool.shortDescriptionDe}</p>
                    <span className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[11px] font-bold text-sky-700">
                      Tool öffnen
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {toolCategory && (
              <p className="mt-5 text-xs text-ink-subtle">
                Alle Werkzeuge der Kategorie{' '}
                <Link href={`/${locale}/kategorie/${toolCategory.slug}`} className="font-semibold text-sky-700 hover:underline">
                  {toolCategory.name}
                </Link>{' '}
                im Überblick.
              </p>
            )}
          </section>
        )}

        <BlogToolCTA
          toolSlug={article.primaryToolSlug}
          headline={article.ctaHeadline}
          buttonLabel={article.ctaButtonLabel}
          className="my-10"
        />

        <RelatedArticles articles={related} title="Das könnte Sie auch interessieren" />

        {moreInCategory.length > 0 && catInfo && (
          <nav aria-labelledby="mehr-kategorie" className="my-12 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <h2 id="mehr-kategorie" className="text-base font-black text-ink">
                Mehr aus „{catInfo.name}“
              </h2>
            </div>
            <ul className="space-y-2 text-sm">
              {moreInCategory.map((a) => (
                <li key={a.slug}>
                  <Link href={`/${locale}/blog/${a.slug}`} className="text-ink-muted hover:text-sky-700 hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={categoryPath} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800">
              Alle Artikel zu {catInfo.name}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </nav>
        )}
      </article>
    </>
  );
}
