'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { PRICING_PLANS } from '@/config/plans.config';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const breadcrumbs = [
    { name: 'Preise & Pläne', url: '/de/preise' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto my-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Faire, transparente Preise</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Finden Sie den passenden Plan für Ihre Anforderungen
        </h1>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
          Nutzen Sie alle Standard-Tools dauerhaft kostenlos. Für Vielnutzer und Unternehmen bieten wir erweiterte Dateilimits, Stapelverarbeitung und werbefreies Arbeiten.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isAnnual
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monatliche Zahlung
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              isAnnual
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Jährliche Zahlung</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              30% sparen
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-12 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const price = isAnnual
            ? (plan.priceYearlyEUR / 12).toFixed(2)
            : plan.priceMonthlyEUR.toFixed(2);

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'bg-slate-900 text-white shadow-xl ring-2 ring-sky-500'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm ${
                    plan.isPopular
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <p
                  className={`text-xs mb-6 leading-relaxed ${
                    plan.isPopular ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {plan.description}
                </p>

                {/* Price block */}
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">
                      {plan.priceMonthlyEUR === 0 ? '€0' : `€${price}`}
                    </span>
                    {plan.priceMonthlyEUR > 0 && (
                      <span
                        className={`text-xs ${
                          plan.isPopular ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        / Monat
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] block mt-1 ${
                      plan.isPopular ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {isAnnual && plan.priceYearlyEUR > 0
                      ? `€${plan.priceYearlyEUR} jährlich abgerechnet`
                      : plan.periodLabel}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs sm:text-sm">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          feat.included
                            ? plan.isPopular
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-emerald-50 text-emerald-600'
                            : 'opacity-30'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span
                        className={
                          feat.included
                            ? plan.isPopular
                              ? 'text-slate-200'
                              : 'text-slate-700'
                            : 'text-slate-400 line-through opacity-50'
                        }
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  plan.isPopular
                    ? 'bg-sky-600 hover:bg-sky-500 text-white'
                    : plan.id === 'free'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Box */}
      <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="p-3 rounded-xl bg-sky-600 text-white shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">
            14-Tage Geld-zurück-Garantie & jederzeit monatlich kündbar
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Sie können Ihr Abonnement mit einem Klick in Ihrem Kundenkonto kündigen. Rechnungen mit ausgewiesener Mehrwertsteuer für das Finanzamt werden automatisch generiert.
          </p>
        </div>
      </div>
    </div>
  );
}
