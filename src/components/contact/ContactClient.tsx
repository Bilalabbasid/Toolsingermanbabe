'use client';

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Clock, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { featureFlags } from '@/config/featureFlags.config';

export function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('support');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTopic = params.get('thema') || params.get('topic');
      if (urlTopic && ['support', 'billing', 'feature', 'business', 'privacy'].includes(urlTopic)) {
        setTopic(urlTopic);
      }
    }
  }, []);

  const breadcrumbs = [
    { name: 'Kontakt & Support', url: '/de/kontakt' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto my-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
          <span>Support & Kundenservice</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Wir sind für Sie da
        </h1>
        <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
          Haben Sie Fragen zu unseren Datei- & PDF-Tools, Anregungen oder Feedback? Unser Support-Team hilft Ihnen gerne weiter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-10 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Direkter E-Mail-Support</h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              Für allgemeine Anfragen und Hilfe zu allen Funktionen:
            </p>
            <a
              href="mailto:support@coolwave.cool"
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 underline"
            >
              support@coolwave.cool
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Reaktionszeit</h3>
            <p className="text-xs text-slate-600 mt-1">
              Wir antworten in der Regel innerhalb von <strong>24 Stunden</strong> (Montag bis Freitag, 09:00 – 18:00 Uhr MEZ).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Datenschutz & Sicherheit</h3>
            <p className="text-xs text-slate-600 mt-1">
              Ihre Anfragen werden streng vertraulich und nach den Vorschriften der DSGVO behandelt. Senden Sie keine sensiblen Passwörter per E-Mail.
            </p>
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          {isSubmitted ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Vielen Dank für Ihre Nachricht!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen unter <strong>{email}</strong> melden.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Weitere Nachricht senden
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Nachricht an das CoolWave-Team senden
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Ihr Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Ihre E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Thema / Betreff
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                >
                  <option value="support">Hilfe bei einer Konvertierung / Technischer Support</option>
                  {featureFlags.enableStripeCheckout && <option value="billing">Fragen zu CoolWave Pro / Rechnung</option>}
                  <option value="feature">Feedback & Vorschlag für neue Werkzeuge</option>
                  {featureFlags.enableStripeCheckout && <option value="business">Business & Enterprise / Team-Lizenz</option>}
                  <option value="privacy">Datenschutz & DSGVO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Ihre Nachricht *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Wie können wir Ihnen weiterhelfen? Bitte beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50 resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Wird übermittelt...' : 'Nachricht absenden'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
