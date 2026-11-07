'use client';

import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { openGlobalSearch } from '@/components/common/searchEvents';

interface HeroSearchProps {
  toolCount: number;
}

/**
 * Lightweight hero search: it does not bundle the tool index itself but hands
 * the query to the global, lazily loaded search modal owned by the Header.
 */
export function HeroSearch({ toolCount }: HeroSearchProps) {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    openGlobalSearch(value.trim() || undefined);
  };

  return (
    <form role="search" onSubmit={submit} className="relative w-full max-w-2xl mx-auto">
      <label htmlFor="hero-search" className="sr-only">
        Tool suchen
      </label>
      <Search className="w-5 h-5 text-ink-subtle absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
      <input
        id="hero-search"
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          // Hand over to the full search experience after the first characters.
          // Re-dispatching keeps the modal in sync while its chunk is still loading.
          if (next.trim().length >= 2) openGlobalSearch(next);
        }}
        placeholder="Tool suchen, z. B. „PDF zusammenfügen“"
        title={`${toolCount} Tools durchsuchen`}
        className="w-full h-14 sm:h-16 pl-12 pr-32 sm:pr-36 rounded-2xl bg-white text-ink placeholder:text-ink-subtle text-[15px] sm:text-base ring-1 ring-line-strong shadow-raised focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 h-10 sm:h-12 px-4 sm:px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-brand transition-colors cursor-pointer"
      >
        Suchen
        <ArrowRight className="w-4 h-4 hidden sm:block" aria-hidden="true" />
      </button>
    </form>
  );
}
