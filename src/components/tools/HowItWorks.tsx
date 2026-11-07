import React from 'react';
import { HowItWorksStep } from '@/types/tool';

interface HowItWorksProps {
  steps: HowItWorksStep[];
  toolName: string;
  /** Optional id for in-page anchors. */
  id?: string;
  className?: string;
}

export function HowItWorks({ steps, toolName, id = 'so-funktionierts', className = '' }: HowItWorksProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`my-12 sm:my-16 ${className}`}>
      <div className="max-w-2xl mb-6 sm:mb-8">
        <p className="eyebrow">Anleitung</p>
        <h2 id={`${id}-title`} className="mt-2 text-heading text-ink">
          So funktioniert {toolName}
        </h2>
        <p className="mt-2 text-sm text-ink-subtle">
          In {steps.length} Schritten zum Ergebnis – alles passiert lokal in Ihrem Browser.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {steps.map((step, i) => (
          <li key={step.step} className="relative card p-5 sm:p-6">
            <span
              className="inline-flex w-9 h-9 rounded-xl bg-sky-600 text-white font-bold text-sm items-center justify-center shadow-brand"
              aria-hidden="true"
            >
              {step.step ?? i + 1}
            </span>
            <h3 className="mt-4 font-semibold text-ink text-base">{step.title}</h3>
            <p className="mt-1.5 text-sm text-ink-subtle leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
