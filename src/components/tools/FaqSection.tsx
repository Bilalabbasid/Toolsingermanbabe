import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem } from '@/types/tool';

interface FaqSectionProps {
  faqs: FaqItem[];
  toolName: string;
  /** Override the heading text. */
  title?: string;
  subtitle?: string;
  id?: string;
  className?: string;
}

/**
 * FAQ accordion built on native <details>/<summary>: zero JavaScript, keyboard
 * accessible and all answers are in the HTML for search engines.
 */
export function FaqSection({ faqs, toolName, title, subtitle, id = 'faq', className = '' }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`my-12 sm:my-16 ${className}`}>
      <div className="max-w-2xl mb-6 sm:mb-8">
        <p className="eyebrow">FAQ</p>
        <h2 id={`${id}-title`} className="mt-2 text-heading text-ink">
          {title ?? `Häufige Fragen zu ${toolName}`}
        </h2>
        <p className="mt-2 text-sm text-ink-subtle">
          {subtitle ?? 'Antworten zu Nutzung, Datenschutz und Dateiformaten.'}
        </p>
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item group" open={index === 0}>
            <summary className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-surface-muted/60 transition-colors">
              <h3 className="font-semibold text-ink text-[15px]">{faq.question}</h3>
              <ChevronDown className="faq-chevron w-4 h-4 text-ink-subtle shrink-0 transition-transform duration-200" aria-hidden="true" />
            </summary>
            <div className="px-4 sm:px-6 pb-5 -mt-1 text-sm text-ink-muted leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
