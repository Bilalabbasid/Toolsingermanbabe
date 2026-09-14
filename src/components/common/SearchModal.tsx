'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  Flame,
  FileSpreadsheet,
  Image as ImageIcon,
  Music,
  Video,
  FolderArchive,
  Wrench,
  Shield,
  CornerDownLeft,
  ArrowLeft,
} from 'lucide-react';
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

const CATEGORY_TABS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Alle' },
  { id: 'pdf', label: 'PDF' },
  { id: 'images', label: 'Bilder' },
  { id: 'documents', label: 'Dokumente' },
  { id: 'utilities', label: 'Tools' },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentTools, setRecentTools] = useState<ToolDefinition[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
        if (query.trim() && searchResults.length > 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          const targetTool = searchResults[selectedIndex].tool;
          router.push(`/de/${targetTool.slug}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, query, router, onClose]);

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
      case 'pdf':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'images':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'documents':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'security':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ocr':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-sky-50 text-sky-600 border-sky-100';
    }
  };

  const getToolIcon = (tool: ToolDefinition) => {
    const s = tool.slug;
    if (s.includes('audio') || s.includes('mp3')) return <Music className="w-4 h-4" />;
    if (s.includes('video') || s.includes('gif')) return <Video className="w-4 h-4" />;
    if (s.includes('zip') || s.includes('7z') || s.includes('tar') || s.includes('gzip')) return <FolderArchive className="w-4 h-4" />;
    if (tool.category === 'images') return <ImageIcon className="w-4 h-4" />;
    if (tool.category === 'documents') return <FileSpreadsheet className="w-4 h-4" />;
    if (tool.category === 'security') return <Shield className="w-4 h-4" />;
    if (tool.category === 'utilities') return <Wrench className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Werkzeugsuche"
      className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-16 md:pt-20 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200/80 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input (safe area aware on notched phones) */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-2 sm:gap-3 bg-white safe-area-top">
          {/* Back button for mobile */}
          <button
            onClick={onClose}
            className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
            aria-label="Suche schließen"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shrink-0" aria-hidden="true">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            role="combobox"
            aria-expanded={query.trim() !== '' && searchResults.length > 0}
            aria-autocomplete="list"
            aria-controls="search-results-list"
            aria-activedescendant={searchResults.length > 0 && selectedIndex >= 0 ? `search-result-${searchResults[selectedIndex]?.tool.id}` : undefined}
            placeholder="Tool suchen (z. B. Word, Bild, ZIP)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none min-h-[44px]"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              aria-label="Eingabe löschen"
              title="Eingabe löschen"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Suche schließen (Escape)"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-mono cursor-pointer"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Category Filter Pills (horizontal touch scrolling) */}
        <div 
          role="tablist" 
          aria-label="Kategoriefilter"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto no-scrollbar text-xs"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === tab.id}
              onClick={() => {
                setCategoryFilter(tab.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap min-h-[32px] flex items-center cursor-pointer touch-manipulation ${
                categoryFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 space-y-4 safe-area-bottom">
          {/* 1. ACTIVE SEARCH QUERY RESULTS */}
          {query.trim() !== '' ? (
            <div>
              {searchResults.length > 0 ? (
                <div id="search-results-list" role="listbox" aria-label="Suchergebnisse" className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1">
                    {searchResults.length} {searchResults.length === 1 ? 'Treffer' : 'Treffer'} gefunden
                  </div>
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
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all min-h-[56px] touch-manipulation ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-300 shadow-xs ring-1 ring-sky-300'
                            : 'bg-white border-transparent hover:bg-slate-50 active:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${getCategoryColor(
                              item.tool.category
                            )}`}
                          >
                            {getToolIcon(item.tool)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{item.tool.nameDe}</span>
                              {item.tool.badge && (
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  {item.tool.badge}
                                </span>
                              )}
                              <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {item.formatFlow}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {item.tool.shortDescriptionDe}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2 sm:ml-3">
                          {isSelected && (
                            <span className="hidden sm:inline-flex items-center gap-0.5 text-2xs font-mono text-sky-600 font-bold mr-1">
                              <span>Öffnen</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </span>
                          )}
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Keine Werkzeuge für „{query}“ gefunden.
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Versuchen Sie es mit Begriffen wie <span className="font-semibold text-slate-700">Word</span>,{' '}
                    <span className="font-semibold text-slate-700">Excel</span>,{' '}
                    <span className="font-semibold text-slate-700">JPG</span>,{' '}
                    <span className="font-semibold text-slate-700">Komprimieren</span> oder{' '}
                    <span className="font-semibold text-slate-700">OCR</span>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* 2. EMPTY STATE: RECENT, POPULAR & RECOMMENDED FEEDS */
            <div className="space-y-5 pt-1">
              {/* Zuletzt verwendet (Recent tools) */}
              {recentTools.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      Zuletzt verwendet
                    </span>
                    <button
                      onClick={handleClearRecents}
                      className="text-2xs text-slate-400 hover:text-rose-600 active:text-rose-700 lowercase tracking-normal min-h-[32px] px-1 flex items-center"
                    >
                      Löschen
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/de/${tool.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 active:bg-slate-100 transition-all group min-h-[48px] touch-manipulation"
                      >
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${getCategoryColor(
                            tool.category
                          )}`}
                        >
                          {getToolIcon(tool)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-slate-800 truncate group-hover:text-sky-700">
                            {tool.nameDe}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{tool.category.toUpperCase()}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Beliebte Tools (Popular tools) */}
              <div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Beliebte Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/de/${tool.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 active:bg-slate-100 transition-all group min-h-[48px] touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${getCategoryColor(
                            tool.category
                          )}`}
                        >
                          {getToolIcon(tool)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800 truncate group-hover:text-sky-700">
                            {tool.nameDe}
                          </div>
                          <div className="text-2xs text-slate-400 font-mono truncate">{tool.sourceFormats.join('/')}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Empfohlene Tools (Recommended tools) */}
              <div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Empfohlene Tools
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendedTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/de/${tool.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 active:bg-slate-100 transition-all group min-h-[48px] touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${getCategoryColor(
                            tool.category
                          )}`}
                        >
                          {getToolIcon(tool)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800 truncate group-hover:text-sky-700">
                            {tool.nameDe}
                          </div>
                          <div className="text-2xs text-slate-400 line-clamp-1">{tool.shortDescriptionDe}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Shortcuts (desktop only) */}
        <div className="hidden sm:flex px-4 py-2.5 bg-slate-50 border-t border-slate-100 items-center justify-between text-2xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-white font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-white font-mono text-[10px]">↓</kbd>
              <span>Navigieren</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-white font-mono text-[10px]">↵</kbd>
              <span>Auswählen</span>
            </span>
          </div>
          <span className="font-medium text-slate-600">
            {searchResults.length} Werkzeuge verfügbar
          </span>
        </div>
      </div>
    </div>
  );
}
