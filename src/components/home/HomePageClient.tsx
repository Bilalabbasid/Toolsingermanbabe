'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ScanText,
  Wrench,
  Flame
} from 'lucide-react';
import { ToolDefinition, ToolCategory } from '@/types/tool';
import { AdSlot } from '@/components/common/AdSlot';
import { ToolCard } from '@/components/tools/ToolCard';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolIcon } from '@/components/common/ToolIcon';
import { searchToolsWithRelevance, getRecentTools, clearRecentTools } from '@/lib/search';

interface HomePageClientProps {
  initialTools: ToolDefinition[];
}

const QUICK_SEARCH_CHIPS = [
  'PDF in Word',
  'PDF zusammenfügen',
  'PDF komprimieren',
  'Word in PDF',
  'Bild komprimieren',
  'JPG in PNG',
  'PDF unterschreiben',
  'OCR',
  'PDF entsperren',
];

// Curated top 8 popular tools
const POPULAR_SLUGS = [
  'pdf-zusammenfuegen',
  'pdf-in-word-umwandeln',
  'pdf-komprimieren',
  'word-in-pdf-umwandeln',
  'bild-komprimieren',
  'pdf-unterschreiben',
  'pdf-ocr-texterkennung',
  'pdf-entsperren',
];

interface CategoryTab {
  id: string;
  label: string;
  category?: ToolCategory;
  icon?: React.ComponentType<{ className?: string }>;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'all',       label: 'Alle Werkzeuge' },
  { id: 'pdf',       label: 'PDF-Tools',               category: 'pdf',       icon: FileText },
  { id: 'images',    label: 'Bild-Tools',              category: 'images',    icon: ImageIcon },
  { id: 'documents', label: 'Dokumente',               category: 'documents', icon: FileSpreadsheet },
  { id: 'security',  label: 'Sicherheit',              category: 'security',  icon: Lock },
  { id: 'ocr',       label: 'OCR & Texterkennung',     category: 'ocr',       icon: ScanText },
  { id: 'utilities', label: 'Text & Hilfsprogramme',   category: 'utilities', icon: Wrench },
];

export function HomePageClient({ initialTools }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentTools, setRecentTools] = useState<ToolDefinition[]>([]);

  useEffect(() => {
    setRecentTools(getRecentTools());
  }, []);

  const handleClearRecents = () => {
    clearRecentTools();
    setRecentTools([]);
  };

  const searchResults = searchToolsWithRelevance(searchQuery, selectedCategory);
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'all';

  const filteredTools = searchQuery.trim()
    ? searchResults.map((r) => r.tool)
    : initialTools.filter((tool) => selectedCategory === 'all' || tool.category === selectedCategory);

  // Groupings for structured overview on 'all'
  const popularTools = initialTools.filter((t) => POPULAR_SLUGS.includes(t.slug));
  const pdfTools = initialTools.filter((t) => t.category === 'pdf');
  const imageTools = initialTools.filter((t) => t.category === 'images');
  const docTools = initialTools.filter((t) => t.category === 'documents');
  const securityTools = initialTools.filter((t) => t.category === 'security');
  const ocrTools = initialTools.filter((t) => t.category === 'ocr');
  const utilityTools = initialTools.filter((t) => t.category === 'utilities');

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-8 pb-10 sm:pt-16 sm:pb-20 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs mb-4 sm:mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kostenlos, schnell &amp; 100% DSGVO-konform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Alle wichtigen Datei- und PDF-Tools{' '}
            <span className="text-sky-600">an einem Ort.</span>
          </h1>

          <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            PDFs bearbeiten, Dokumente konvertieren, Bilder optimieren und Daten schützen – sicher, blitzschnell und direkt in Ihrem Webbrowser.
          </p>

          {/* Search Box */}
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto space-y-3 px-1">
            <div className="relative flex items-center shadow-xs rounded-2xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Werkzeug suchen (z. B. Word in PDF, Bilder komprimieren, OCR)..."
                className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl border border-slate-300/90 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all min-h-[48px]"
                aria-label="Werkzeuge suchen"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Löschen
                </button>
              ) : (
                <span className="absolute right-4 text-xs font-mono text-slate-400 hidden sm:inline-block">
                  {initialTools.length} Tools
                </span>
              )}
            </div>

            {/* Popular Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Häufig gesucht:
              </span>
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer min-h-[28px] flex items-center touch-manipulation ${
                    searchQuery.toLowerCase() === chip.toLowerCase()
                      ? 'bg-sky-600 text-white border-sky-600 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 active:bg-slate-100'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Keine Softwareinstallation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Lokale Browser-Verarbeitung
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Automatische Server-Löschung nach 15 Min.
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recently Used Tools Bar (if any exist) */}
        {recentTools.length > 0 && !isFiltering && (
          <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Zuletzt verwendete Werkzeuge</span>
              </h2>
              <button
                onClick={handleClearRecents}
                className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                title="Verlauf leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verlauf löschen</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {recentTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compact={true} />
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORY_TABS.map((cat) => {
            const count =
              cat.id === 'all'
                ? initialTools.length
                : initialTools.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            // icon color per category
            const iconColors: Record<string, string> = {
              all: 'text-slate-500',
              pdf: 'text-rose-500',
              images: 'text-purple-500',
              documents: 'text-blue-500',
              security: 'text-amber-600',
              ocr: 'text-emerald-600',
              utilities: 'text-slate-600',
            };

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (searchQuery) setSearchQuery('');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 min-h-[40px] flex items-center gap-1.5 touch-manipulation cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
                }`}
              >
                {cat.icon && (
                  <cat.icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : (iconColors[cat.id] || 'text-slate-500')
                    }`}
                  />
                )}
                {cat.label}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display: Filtered Results OR Structured Overview */}
        {isFiltering ? (
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {searchQuery.trim()
                    ? `Suchergebnisse für „${searchQuery}“`
                    : CATEGORY_TABS.find((c) => c.id === selectedCategory)?.label || 'Werkzeuge'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {filteredTools.length} {filteredTools.length === 1 ? 'Werkzeug' : 'Werkzeuge'} gefunden
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
              >
                Filter zurücksetzen
              </button>
            </div>

            <ToolGrid tools={filteredTools} />
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* 1. Beliebteste Werkzeuge (Curated Top 8) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Beliebteste Werkzeuge</h2>
                    <p className="text-xs text-slate-500">Die am häufigsten genutzten Funktionen für den Alltag</p>
                  </div>
                </div>
              </div>
              <ToolGrid tools={popularTools.slice(0, 8)} />
            </div>

            {/* 2. PDF-Werkzeuge */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">PDF-Werkzeuge</h2>
                    <p className="text-xs text-slate-500">Zusammenfügen, verkleinern, bearbeiten und konvertieren</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('pdf')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <span>Alle {pdfTools.length} PDF-Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ToolGrid tools={pdfTools.slice(0, 8)} />
            </div>

            {/* 3. Bild-Tools */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Bild-Tools &amp; Konvertierung</h2>
                    <p className="text-xs text-slate-500">Formate umwandeln, skalieren, zuschneiden und optimieren</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('images')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <span>Alle {imageTools.length} Bild-Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ToolGrid tools={imageTools.slice(0, 8)} />
            </div>

            {/* 4. Dokumenten- & Tabellen-Konverter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dokumente &amp; Office</h2>
                    <p className="text-xs text-slate-500">Word, Excel, PowerPoint, Text- und Tabellenformate</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('documents')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <span>Alle {docTools.length} Dokument-Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ToolGrid tools={docTools.slice(0, 8)} />
            </div>

            {/* 5. Sicherheit, OCR & Utilities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Security Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sicherheit &amp; Schutz</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCategory('security')}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                  >
                    Alle ({securityTools.length}) →
                  </button>
                </div>
                <div className="space-y-2">
                  {securityTools.slice(0, 4).map((tool) => (
                    <ToolCard key={tool.id} tool={tool} compact={true} />
                  ))}
                </div>
              </div>

              {/* OCR Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <ScanText className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">OCR &amp; Texterkennung</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCategory('ocr')}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                  >
                    Alle ({ocrTools.length}) →
                  </button>
                </div>
                <div className="space-y-2">
                  {ocrTools.slice(0, 4).map((tool) => (
                    <ToolCard key={tool.id} tool={tool} compact={true} />
                  ))}
                </div>
              </div>

              {/* Utilities Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Text &amp; Hilfsmittel</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCategory('utilities')}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                  >
                    Alle ({utilityTools.length}) →
                  </button>
                </div>
                <div className="space-y-2">
                  {utilityTools.slice(0, 4).map((tool) => (
                    <ToolCard key={tool.id} tool={tool} compact={true} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Non-intrusive Content Ad Slot */}
      <AdSlot format="horizontal" />

      {/* Trust & Architecture Section */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Sicherheit &amp; Privatsphäre nach europäischem Maßstab
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Vertrauliche Dateien verdienen maximalen Schutz. CoolWave setzt auf ein kompromissloses Sicherheitskonzept.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                1. Lokale Browser-Berechnung
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Bildkomprimierung, Bildskalierung, PDF-Zusammenführung, Drehung und Editierung laufen dank moderner WebAssembly-Technologie direkt auf Ihrem Computer. Ihre Dateien verlassen Ihr Gerät nicht.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                2. 100% DSGVO-konform
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Keine geheimen Tracker, kein Verkauf Ihrer Daten und keine permanente Speicherung. CoolWave erfüllt alle strengen Vorgaben der europäischen Datenschutz-Grundverordnung.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                3. Automatische Löschung
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sollte für komplexe Office-Konvertierungen eine serverseitige Verarbeitung nötig sein, werden alle temporären Daten nach 15 Minuten unwiderruflich und restlos von den Servern gelöscht.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Bottom Ad Placement */}
      <AdSlot slotKey="homepage_bottom" className="my-6 max-w-5xl" />

      {/* Pro Upsell Callout */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold mb-2.5 sm:mb-3 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CoolWave Pro</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              Mehr Leistung für Vielnutzer &amp; Profis
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Arbeiten Sie ohne Werbung, verarbeiten Sie bis zu 50 Dateien gleichzeitig in der Stapelverarbeitung und heben Sie das Dateilimit auf bis zu 500 MB an.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <Link
              href="/de/preise"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors touch-manipulation"
            >
              Preise &amp; Tarife ansehen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
