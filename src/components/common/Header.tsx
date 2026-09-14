'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  Globe, 
  History, 
  Zap, 
  Crown 
} from 'lucide-react';
import { SearchModal } from './SearchModal';
import { UpgradeModal } from '@/components/monetization/UpgradeModal';
import { ConversionHistoryDrawer } from '@/components/monetization/ConversionHistoryDrawer';
import { getClientSubscription, SubscriptionTier } from '@/lib/monetization/subscription';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    const updateSubscription = () => {
      const sub = getClientSubscription();
      setTier(sub.tier);
    };

    updateSubscription();
    window.addEventListener('coolwave_subscription_changed', updateSubscription);
    return () => window.removeEventListener('coolwave_subscription_changed', updateSubscription);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isPro = tier === 'pro' || tier === 'business';

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

          {/* Right Actions: Search, History, User Tier, Upgrade */}
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

            {/* Conversion History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              type="button"
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
              title="Konvertierungsverlauf anzeigen"
            >
              <History className="w-4 h-4" />
            </button>

            {/* User Tier Badge */}
            <button
              onClick={() => setIsUpgradeOpen(true)}
              type="button"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                isPro
                  ? 'bg-amber-500/10 text-amber-700 border-amber-300/50 hover:bg-amber-500/20'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isPro ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Pro Aktiv</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kostenlos</span>
                </>
              )}
            </button>

            {/* Pro Upgrade CTA */}
            {!isPro && (
              <button
                onClick={() => setIsUpgradeOpen(true)}
                type="button"
                className="hidden sm:inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>Pro holen</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Menü öffnen"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/de/kategorie/pdf"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              PDF Tools
            </Link>
            <Link
              href="/de/kategorie/images"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Bild Tools
            </Link>
            <Link
              href="/de/kategorie/documents"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Dokumente
            </Link>
            <Link
              href="/de/kategorie/utilities"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Text & Tools
            </Link>
            <Link
              href="/de/preise"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-sky-700 hover:bg-sky-50"
            >
              Preise & Pläne
            </Link>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsUpgradeOpen(true);
                }}
                className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-bold text-center text-sm"
              >
                CoolWave Pro ansehen
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals & Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <ConversionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
      />
    </>
  );
}
