'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Sparkles,
  History,
  Zap,
  Crown,
  User,
  ChevronDown,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { BrandLogo } from '@/components/common/BrandLogo';
import { OPEN_SEARCH_EVENT, openGlobalSearch, type OpenSearchDetail } from '@/components/common/searchEvents';
import { CATEGORY_ACCENTS, type NavCategory } from '@/components/common/navMeta';
import { getClientSubscription, hydrateClientSubscription, SubscriptionTier } from '@/lib/monetization/subscription';
import { featureFlags } from '@/config/featureFlags.config';

// Heavy, rarely-needed UI is code-split and only fetched on demand.
const loadSearchModal = () => import('./SearchModal');
const SearchModal = dynamic(() => loadSearchModal().then((m) => m.SearchModal), { ssr: false });
const UpgradeModal = dynamic(
  () => import('@/components/monetization/UpgradeModal').then((m) => m.UpgradeModal),
  { ssr: false }
);
const ConversionHistoryDrawer = dynamic(
  () => import('@/components/monetization/ConversionHistoryDrawer').then((m) => m.ConversionHistoryDrawer),
  { ssr: false }
);

/** Fallback when the layout does not pass navigation data. */
const FALLBACK_CATEGORIES: NavCategory[] = [
  { slug: 'pdf', label: 'PDF', name: 'PDF-Tools', description: 'PDFs bearbeiten, zusammenfügen und konvertieren.', count: 0, tools: [] },
  { slug: 'images', label: 'Bilder', name: 'Bild-Tools', description: 'Bilder umwandeln, verkleinern und anpassen.', count: 0, tools: [] },
  { slug: 'documents', label: 'Dokumente', name: 'Dokumente', description: 'Office-Dokumente konvertieren.', count: 0, tools: [] },
  { slug: 'utilities', label: 'Text, Medien & Mehr', name: 'Text-Tools & Hilfsmittel', description: 'Nützliche Helfer.', count: 0, tools: [] },
];

interface HeaderUser {
  name?: string | null;
  email?: string;
  role?: string;
  plan?: SubscriptionTier;
}

interface HeaderProps {
  /** Navigation data computed on the server (see navData.ts). Optional for backwards compatibility. */
  categories?: NavCategory[];
}

export function Header({ categories }: HeaderProps = {}) {
  const accountsEnabled = featureFlags.enableAccounts;
  const billingEnabled = featureFlags.enableStripeCheckout;
  const historyEnabled = featureFlags.enableConversionHistory;
  const navCategories = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const totalTools = navCategories.reduce((sum, c) => sum + c.count, 0);
  const primaryLinks = navCategories.filter((c) => ['pdf', 'images', 'documents'].includes(c.slug));

  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaButtonRef = useRef<HTMLButtonElement>(null);

  // All "open search" requests go through the event bridge so there is a single code path.
  const openSearch = (query?: string) => openGlobalSearch(query);

  // Account hydration (dormant unless accounts are enabled)
  useEffect(() => {
    if (!accountsEnabled) {
      hydrateClientSubscription(null);
      return;
    }
    fetch('/api/v1/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setCurrentUser(d.user);
          hydrateClientSubscription(d.user);
        } else {
          hydrateClientSubscription(null);
        }
      })
      .catch(() => {
        hydrateClientSubscription(null);
      });
  }, [accountsEnabled]);

  useEffect(() => {
    const updateSubscription = () => setTier(getClientSubscription().tier);
    updateSubscription();
    window.addEventListener('coolwave_subscription_changed', updateSubscription);
    return () => window.removeEventListener('coolwave_subscription_changed', updateSubscription);
  }, []);

  // Close menus on navigation (state adjustment during render, no effect needed)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsMegaOpen(false);
  }

  // Elevation once the page is scrolled
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Global shortcuts (Ctrl/⌘+K for search, Escape closes menus) + search event bridge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSearchOpen) setIsSearchOpen(false);
        else openGlobalSearch();
      } else if (e.key === 'Escape') {
        if (isMegaOpen) {
          setIsMegaOpen(false);
          megaButtonRef.current?.focus();
        }
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    const handleOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<OpenSearchDetail>).detail;
      setSearchQuery(detail?.query);
      setSearchMounted(true);
      setIsSearchOpen(true);
      setIsMobileMenuOpen(false);
      setIsMegaOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleOpenEvent);
    };
  }, [isMobileMenuOpen, isMegaOpen, isSearchOpen]);

  // Close mega menu on outside click
  useEffect(() => {
    if (!isMegaOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (megaRef.current?.contains(target) || megaButtonRef.current?.contains(target)) return;
      setIsMegaOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isMegaOpen]);

  // Lock body scroll when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isPro = tier === 'pro' || tier === 'business';
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const prefetchSearch = () => {
    void loadSearchModal();
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const navLinkClass = (active: boolean) =>
    `relative inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
      active ? 'text-ink bg-surface-muted' : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full safe-area-top border-b transition-[background-color,box-shadow,border-color] duration-200 ${
          isScrolled || isMobileMenuOpen || isMegaOpen
            ? 'bg-white/90 backdrop-blur-md border-line shadow-[0_1px_0_rgb(15_23_42/0.02),0_6px_16px_-12px_rgb(15_23_42/0.18)]'
            : 'bg-white/80 backdrop-blur-md border-transparent'
        }`}
      >
        <div className="container-page h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/de" aria-label="Datei Tools – Startseite" className="shrink-0 rounded-lg" onClick={closeMobileMenu}>
            <BrandLogo showTagline />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Hauptnavigation" className="hidden lg:flex items-center gap-0.5">
            <button
              ref={megaButtonRef}
              type="button"
              onClick={() => setIsMegaOpen((v) => !v)}
              aria-expanded={isMegaOpen}
              aria-controls="mega-menu"
              className={`${navLinkClass(isMegaOpen)} cursor-pointer`}
            >
              <LayoutGrid className="w-4 h-4 text-sky-600" aria-hidden="true" />
              Alle Tools
              <ChevronDown className={`w-3.5 h-3.5 text-ink-subtle transition-transform ${isMegaOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {primaryLinks.map((cat) => {
              const href = `/de/kategorie/${cat.slug}`;
              return (
                <Link key={cat.slug} href={href} className={navLinkClass(isActive(href))} aria-current={isActive(href) ? 'page' : undefined}>
                  {cat.name}
                </Link>
              );
            })}
            <Link href="/de/blog" className={navLinkClass(isActive('/de/blog'))} aria-current={isActive('/de/blog') ? 'page' : undefined}>
              Ratgeber
            </Link>
            {billingEnabled && (
              <Link href="/de/preise" className={navLinkClass(isActive('/de/preise'))}>
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Preise
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => openSearch()}
              onPointerEnter={prefetchSearch}
              onFocus={prefetchSearch}
              className="group inline-flex items-center gap-2 h-10 sm:h-9 min-w-10 justify-center sm:justify-start px-2.5 sm:pl-3 sm:pr-2 rounded-xl border border-line bg-surface-muted/70 text-ink-subtle hover:text-ink hover:border-line-strong hover:bg-white text-sm transition-colors cursor-pointer sm:w-56 xl:w-64"
              aria-label="Tools durchsuchen (Strg+K)"
              aria-haspopup="dialog"
            >
              <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline flex-1 text-left truncate">Tool suchen …</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle bg-white border border-line rounded-md font-sans">
                Strg K
              </kbd>
            </button>

            {historyEnabled && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-xl border border-line bg-white text-ink-muted hover:text-ink hover:bg-surface-muted transition cursor-pointer"
                aria-label="Konvertierungsverlauf anzeigen"
                aria-haspopup="dialog"
                title="Konvertierungsverlauf anzeigen"
              >
                <History className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {billingEnabled && (
              <button
                onClick={() => setIsUpgradeOpen(true)}
                type="button"
                aria-label={isPro ? 'Pro-Abonnement aktiv – Details anzeigen' : 'Kostenlose Version – Zu Pro wechseln'}
                aria-haspopup="dialog"
                className={`hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isPro
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700'
                }`}
              >
                {isPro ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    <span>Pro aktiv</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Zu Pro</span>
                  </>
                )}
              </button>
            )}

            {accountsEnabled &&
              (currentUser ? (
                <Link
                  href="/de/konto"
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line bg-white hover:bg-surface-muted text-ink-muted text-xs font-semibold transition"
                  title={currentUser.email}
                >
                  <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  <span className="max-w-[80px] truncate">{currentUser.name || 'Konto'}</span>
                </Link>
              ) : (
                <Link
                  href="/de/login"
                  className="hidden sm:inline-flex items-center h-9 px-3 rounded-xl border border-line bg-white hover:bg-surface-muted text-ink-muted text-xs font-semibold transition"
                >
                  Anmelden
                </Link>
              ))}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-muted hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Desktop mega menu */}
        {isMegaOpen && (
          <div
            ref={megaRef}
            id="mega-menu"
            className="hidden lg:block absolute inset-x-0 top-full border-b border-line bg-white shadow-pop animate-slide-down"
          >
            <div className="container-page py-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                {navCategories.map((cat) => {
                  const accent = CATEGORY_ACCENTS[cat.slug];
                  return (
                    <div key={cat.slug} className="min-w-0">
                      <Link
                        href={`/de/kategorie/${cat.slug}`}
                        className="group flex items-center gap-3 rounded-xl p-2 -m-2 hover:bg-surface-muted transition-colors"
                      >
                        <span className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center shrink-0 ${accent.tile}`}>
                          <CategoryIcon category={cat.slug} className="w-4.5 h-4.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-ink group-hover:text-sky-700">
                            {cat.name}
                            {cat.count > 0 && (
                              <span className="text-[11px] font-semibold text-ink-subtle">{cat.count}</span>
                            )}
                          </span>
                          <span className="block text-xs text-ink-subtle truncate">{cat.description}</span>
                        </span>
                      </Link>
                      {cat.tools.length > 0 && (
                        <ul className="mt-3 grid grid-cols-1 gap-0.5 pl-12">
                          {cat.tools.slice(0, 5).map((tool) => (
                            <li key={tool.slug}>
                              <Link
                                href={`/de/${tool.slug}`}
                                className="block truncate rounded-md py-1 text-[13px] text-ink-muted hover:text-sky-700 transition-colors"
                              >
                                {tool.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={`/de/kategorie/${cat.slug}`}
                              className="inline-flex items-center gap-1 py-1 text-[13px] font-semibold text-sky-700 hover:text-sky-800"
                            >
                              Alle anzeigen <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </Link>
                          </li>
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-4 text-xs text-ink-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  {totalTools > 0 ? `${totalTools} Tools – ` : ''}alle laufen lokal in Ihrem Browser. Keine Uploads, keine Anmeldung.
                </span>
                <Link href="/de/blog" className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-800">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Ratgeber &amp; Anleitungen
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-14 sm:top-16 z-30 bg-slate-900/30 backdrop-blur-[2px]"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <div
              id="mobile-navigation-menu"
              role="region"
              aria-label="Mobiles Navigationsmenü"
              className="lg:hidden fixed inset-x-0 top-14 sm:top-16 z-40 bg-white border-b border-line shadow-pop animate-slide-down safe-area-x"
            >
              <div className="container-page pt-3 pb-6 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain">
                <button
                  type="button"
                  onClick={() => openSearch()}
                  className="w-full flex items-center gap-3 h-12 px-4 rounded-xl bg-surface-muted border border-line text-ink-subtle text-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>Tool oder Format suchen …</span>
                </button>

                <ul className="mt-3 divide-y divide-line">
                  {navCategories.map((cat) => {
                    const accent = CATEGORY_ACCENTS[cat.slug];
                    return (
                      <li key={cat.slug}>
                        <details className="group">
                          <summary className="flex items-center gap-3 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            <span className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center shrink-0 ${accent.tile}`}>
                              <CategoryIcon category={cat.slug} className="w-4 h-4" />
                            </span>
                            <span className="flex-1 text-[15px] font-semibold text-ink">{cat.name}</span>
                            {cat.count > 0 && <span className="text-xs text-ink-subtle">{cat.count}</span>}
                            <ChevronDown className="w-4 h-4 text-ink-subtle transition-transform group-open:rotate-180" aria-hidden="true" />
                          </summary>
                          <ul className="pb-3 pl-12 space-y-0.5">
                            {cat.tools.map((tool) => (
                              <li key={tool.slug}>
                                <Link href={`/de/${tool.slug}`} onClick={closeMobileMenu} className="block py-2 text-sm text-ink-muted hover:text-sky-700">
                                  {tool.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                href={`/de/kategorie/${cat.slug}`}
                                onClick={closeMobileMenu}
                                className="inline-flex items-center gap-1 py-2 text-sm font-semibold text-sky-700"
                              >
                                Alle {cat.name} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </Link>
                            </li>
                          </ul>
                        </details>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/de/blog"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-line text-sm font-semibold text-ink"
                  >
                    <BookOpen className="w-4 h-4 text-sky-600" aria-hidden="true" /> Ratgeber
                  </Link>
                  <Link
                    href="/de/kontakt"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-line text-sm font-semibold text-ink"
                  >
                    Kontakt
                  </Link>
                  {billingEnabled && (
                    <Link
                      href="/de/preise"
                      onClick={closeMobileMenu}
                      className="col-span-2 flex items-center justify-center gap-2 h-11 rounded-xl bg-sky-600 text-white text-sm font-bold"
                    >
                      <Sparkles className="w-4 h-4" aria-hidden="true" /> Preise &amp; Pro
                    </Link>
                  )}
                  {accountsEnabled && (
                    <Link
                      href={currentUser ? '/de/konto' : '/de/login'}
                      onClick={closeMobileMenu}
                      className="col-span-2 flex items-center justify-center gap-2 h-11 rounded-xl border border-line text-sm font-semibold text-ink"
                    >
                      <User className="w-4 h-4 text-sky-600" aria-hidden="true" />
                      {currentUser ? 'Mein Konto' : 'Anmelden / Registrieren'}
                    </Link>
                  )}
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs text-ink-subtle">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  Alle Tools arbeiten lokal im Browser – Ihre Dateien verlassen nie Ihr Gerät.
                </p>
              </div>
            </div>
          </>
        )}
      </header>

      {searchMounted && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} initialQuery={searchQuery} />
      )}
      {billingEnabled && isUpgradeOpen && <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />}
      {historyEnabled && isHistoryOpen && (
        <ConversionHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
        />
      )}
    </>
  );
}
