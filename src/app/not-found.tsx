import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-5 border border-sky-100">
          <FileQuestion className="w-7 h-7" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
          Fehler 404
        </span>

        <h1 className="mt-2 text-2xl font-black text-slate-900">
          Seite nicht gefunden
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Die von Ihnen aufgerufene Seite existiert leider nicht.
        </p>

        <div className="mt-6">
          <Link
            href="/de"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Zur Startseite</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
