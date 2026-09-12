'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem } from '@/types/tool';

interface FaqSectionProps {
  faqs: FaqItem[];
  toolName: string;
}

export function FaqSection({ faqs, toolName }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="my-16 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Häufig gestellte Fragen zu {toolName}
        </h2>
        <p className="text-sm text-slate-500">
          Antworten auf die wichtigsten Fragen zur Nutzung, Privatsphäre und Dateisicherheit.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-900 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-sky-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
