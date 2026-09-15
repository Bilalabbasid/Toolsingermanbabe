'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  CornerDownLeft,
  ArrowLeft,
} from 'lucide-react';
import { ToolIcon } from '@/components/common/ToolIcon';
import {
  searchToolsWithRelevance,
  getPopularTools,
  getRecommendedTools,
  getRecentTools,
  clearRecentTools,
  SearchResultItem,
} from '@/lib/search';
import { ToolDefinition, ToolCategory } from '@/types/tool';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_TABS: Array<{ id: string; label: string; emoji: string }> = [
  { id: 'all',       label: 'Alle',       emoji: '🔍' },
  { id: 'pdf',       label: 'PDF',        emoji: '📄' },
  { id: 'images',    label: 'Bilder',     emoji: '🖼️' },
  { id: 'documents', label: 'Dokumente',  emoji: '📝' },
  { id: 'utilities', label: 'Werkzeuge',  emoji: '🔧' },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentTools, setRecentTools] = useState<ToolDefinition[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load recent tools on open
  useEffect(() => {
    if (isOpen) {
      setRecentTools(getRecentTools());
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setCategoryFilter('all');
    }
  }, [isOpen]);

  // Results calculation
  const searchResults: SearchResultItem[] = useMemo(() => {
    if (!isOpen) return [];
    return searchToolsWithRelevance(query, categoryFilter);
  }, [isOpen, query, categoryFilter]);

  const popularTools = useMemo(() => getPopularTools().slice(0, 6), []);
  const recommendedTools = useMemo(() => getRecommendedTools().slice(0, 4), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, searchResults.length - 1)));
      } else if (e.key === 'Enter') {
        if ((query.trim() || categoryFilter !== 'all') && searchResults.length > 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          const targetTool = searchResults[selectedIndex].tool;
          router.push(`/de/${targetTool.slug}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, query, categoryFilter, router, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentTools();
    setRecentTools([]);
  };

  const getCategoryColor = (cat: ToolCategory) => {
    switch (cat) {
      case 'pdf':        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'images':     return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'documents':  return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'security':   return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ocr':        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:           return 'bg-sky-50 text-sky-600 border-sky-100';
    }
  };

  const getToolIcon = (tool: ToolDefinition) => (
    <ToolIcon name={tool.icon} category={tool.category} className="w-4 h-4" />
  );

  const isFiltered = query.trim() !== '' || categoryFilter !== 'all';

  // ToolCard shared between popular/recommended/recent lists
  const ToolCard = ({ tool }: { tool: ToolDefinition }) => (
    <Link
      href={`/de/${tool.slug}`}
      onClick={onClose}
      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm transition-all group"
      style={{ minHeight: 52 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getCategoryColor(tool.category)}`}>
          {getToolIcon(tool)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-slate-900 truncate group-hover:text-sky-600 transition-colors">
            {tool.nameDe}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {tool.shortDescriptionDe || tool.sourceFormats.join(' · ')}
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </Link>
  );

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Werkzeugsuche"
      className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-14 md:pt-16 animate-fade-in"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal panel — flex column with bounded height so content area scrolls */}
      <div
        className="w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200/90 animate-scale-up search-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* — Search header — */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0" style={{ paddingTop: 'max(14px, env(safe-area-inset-top, 0px))' }}>
          {/* Back button (mobile only) */}
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Suche schließen"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <Search className="hidden sm:block w-5 h-5 text-slate-400 shrink-0 ml-1" aria-hidden="true" />

          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            role="combobox"
            aria-expanded={isFiltered && searchResults.length > 0}
            aria-autocomplete="list"
            aria-controls="search-results-list"
            placeholder="Werkzeug oder Format suchen (z. B. Word, Bild, ZIP)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base border-none outline-none ring-0 focus:outline-none focus:ring-0"
            style={{ minHeight: 44 }}
          />

          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSelectedIndex(0); inputRef.current?.focus(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Eingabe löschen"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Suche schließen (Escape)"
            className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs font-mono transition-colors select-none"
          >
            ESC
          </button>
        </div>

        {/* — Category filter tabs — */}
        <div
          role="tablist"
          aria-label="Kategoriefilter"
          className="shrink-0 border-b border-slate-100 bg-slate-50/60"
          style={{ overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 6, padding: '8px 16px' }}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                style={{
                  flexShrink: 0,
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#fff' : '#475569',
                  boxShadow: isActive ? '0 1px 3px rgba(2,132,199,0.35)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(203,213,225,0.5)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setSelectedIndex(0);
                  if (scrollRef.current) scrollRef.current.scrollTop = 0;
                }}
              >
                <span style={{ marginRight: 4 }}>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* — Scrollable content — */}
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            flex: '1 1 0',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '12px 16px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {isFiltered ? (
            /* SEARCH / CATEGORY RESULTS */
            <div>
              {searchResults.length > 0 ? (
                <div id="search-results-list" role="listbox" aria-label="Suchergebnisse">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 pb-2 pt-1">
                    {query.trim() !== ''
                      ? `${searchResults.length} Treffer gefunden`
                      : `${searchResults.length} Werkzeuge in dieser Kategorie`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {searchResults.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <Link
                          key={item.tool.id}
                          id={`search-result-${item.tool.id}`}
                          role="option"
                          aria-selected={isSelected}
                          href={`/de/${item.tool.slug}`}
                          onClick={onClose}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className="flex items-center justify-between p-3 rounded-xl border transition-all"
                          style={{
                            minHeight: 56,
                            backgroundColor: isSelected ? 'rgb(240,249,255)' : '#fff',
                            borderColor: isSelected ? '#7dd3fc' : 'transparent',
                            boxShadow: isSelected ? '0 0 0 1px #7dd3fc' : 'none',
                          }}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${getCategoryColor(item.tool.category)}`}>
                              {getToolIcon(item.tool)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 text-sm">{item.tool.nameDe}</span>
                                {item.tool.badge && (
                                  <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                                    {item.tool.badge}
                                  </span>
                                )}
                                <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-500">
                                  {item.formatFlow}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {item.tool.shortDescriptionDe}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            {isSelected && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 text-2xs font-mono text-sky-600 font-bold mr-1">
                                <span>Öffnen</span>
                                <CornerDownLeft className="w-3 h-3" />
                              </span>
                            )}
                            <ArrowRight
                              className={`w-4 h-4 transition-transform ${isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'}`}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Keine Werkzeuge {query ? `für „${query}"` : 'in dieser Kategorie'} gefunden.
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Versuchen Sie Begriffe wie{' '}
                    <span className="font-semibold text-slate-700">Word</span>,{' '}
                    <span className="font-semibold text-slate-700">Excel</span>,{' '}
                    <span className="font-semibold text-slate-700">JPG</span> oder{' '}
                    <span className="font-semibold text-slate-700">OCR</span>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* IDLE STATE: Recent, Popular & Recommended */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4 }}>
              {/* Zuletzt verwendet */}
              {recentTools.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      Zuletzt verwendet
                    </span>
                    <button
                      type="button"
                      onClick={handleClearRecents}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Verlauf leeren
                    </button>
                  </div>
                  <div className={`grid gap-2 ${recentTools.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {recentTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
                  </div>
                </div>
              )}

              {/* Beliebte Werkzeuge */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Beliebte Werkzeuge
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </div>

              {/* Empfohlene Werkzeuge */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Empfohlene Werkzeuge
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendedTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* — Footer (desktop only) — */}
        <div className="hidden sm:flex shrink-0 px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-slate-600" style={{ fontSize: 10 }}>↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-slate-600" style={{ fontSize: 10 }}>↓</kbd>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Navigieren</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-slate-600" style={{ fontSize: 10 }}>↵</kbd>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Auswählen</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-slate-600" style={{ fontSize: 10 }}>ESC</kbd>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Schließen</span>
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
            {isFiltered
              ? `${searchResults.length} ${searchResults.length === 1 ? 'Werkzeug' : 'Werkzeuge'} verfügbar`
              : '165+ Werkzeuge verfügbar'}
          </span>
        </div>
      </div>
    </div>
  );
}
