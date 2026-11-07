import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { BrandMark } from '@/components/common/BrandLogo';

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="max-w-md w-full text-center card p-8 sm:p-10">
        <BrandMark className="w-12 h-12 mx-auto mb-5" />
        <p className="eyebrow justify-center">Fehler 404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Seite nicht gefunden</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">Die aufgerufene Seite existiert leider nicht.</p>
        <Link
          href="/de"
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-brand transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
