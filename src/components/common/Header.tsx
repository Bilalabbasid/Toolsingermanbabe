'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown, Sparkles, FileText, Image as ImageIcon, Wrench, Shield, Globe } from 'lucide-react';
import { SearchModal } from './SearchModal';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/de" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-sky-600/20 group-hover:bg-sky-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Cool<span className="text-sky-600">Wave</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
                Datei- & PDF-Tools
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/de/kategorie/pdf"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
            >
              PDF Tools
            </Link>
            <Link
              href="/de/kategorie/images"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
            >
              Bild Tools
            </Link>
            <Link
              href="/de/kategorie/documents"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
            >
              Dokumente
            </Link>
            <Link
              href="/de/kategorie/utilities"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
            >
              Text & Tools
            </Link>
            <Link
              href="/de/preise"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Preise</span>
            </Link>
          </nav>

          {/* Right Actions: Search, Language, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-white text-xs sm:text-sm font-normal transition-all"
              aria-label="Tool suchen"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Tool suchen...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                Strg+K
              </kbd>
            </button>

            {/* Language Pill */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>DE</span>
            </div>

            {/* Pro Upgrade CTA */}
            <Link
              href="/de/preise"
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              CoolWave Pro
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Navigation öffnen"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 animate-fade-in">
            <Link
              href="/de/kategorie/pdf"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 font-medium text-sm"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>PDF Tools</span>
            </Link>
            <Link
              href="/de/kategorie/images"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 font-medium text-sm"
            >
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <span>Bild Tools</span>
            </Link>
            <Link
              href="/de/kategorie/documents"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 font-medium text-sm"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Dokumente & Office</span>
            </Link>
            <Link
              href="/de/kategorie/utilities"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 font-medium text-sm"
            >
              <Wrench className="w-4 h-4 text-sky-600" />
              <span>Text & Werkzeuge</span>
            </Link>
            <Link
              href="/de/preise"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 font-medium text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Preise & CoolWave Pro</span>
            </Link>
            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/de/preise"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-sky-600 text-white font-semibold text-sm shadow-sm"
              >
                CoolWave Pro entdecken
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Instant Search Palette Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
