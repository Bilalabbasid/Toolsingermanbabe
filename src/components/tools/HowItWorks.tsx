import React from 'react';
import { HowItWorksStep } from '@/types/tool';

interface HowItWorksProps {
  steps: HowItWorksStep[];
  toolName: string;
}

export function HowItWorks({ steps, toolName }: HowItWorksProps) {
  return (
    <section className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          So funktioniert {toolName}
        </h2>
        <p className="text-sm text-slate-500">
          So wählen Sie Ihre Datei aus, starten die Bearbeitung und speichern das Ergebnis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.step}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative hover:border-slate-300 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 font-black text-sm flex items-center justify-center mb-4 border border-sky-100">
              {step.step}
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
