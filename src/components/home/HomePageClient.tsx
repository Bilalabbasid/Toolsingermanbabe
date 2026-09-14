'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { ToolDefinition } from '@/types/tool';
import { AdSlot } from '@/components/common/AdSlot';

import { searchToolsWithRelevance, getFormatFlow } from '@/lib/search';

interface HomePageClientProps {
  initialTools: ToolDefinition[];
}

const QUICK_SEARCH_CHIPS = [
  'PDF in Word',
  'Komprimieren',
  'Word in PDF',
  'Excel in PDF',
  'JPG in PNG',
  'Signieren',
  'OCR',
  'Audio konvertieren',
  'ZIP erstellen',
];

export function HomePageClient({ initialTools }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Alle Werkzeuge' },
    { id: 'pdf', label: 'PDF Tools' },
    { id: 'images', label: 'Bild Tools' },
    { id: 'documents', label: 'Dokumente' },
    { id: 'security', label: 'Sicherheit' },
    { id: 'utilities', label: 'Text & Utilities' },
  ];

  const searchResults = searchToolsWithRelevance(searchQuery, selectedCategory);
  const filteredTools = searchQuery.trim()
    ? searchResults.map((r) => r.tool)
    : initialTools.filter((tool) => selectedCategory === 'all' || tool.category === selectedCategory);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kostenlos & 100% DSGVO-konform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Alle wichtigen Datei- und PDF-Tools{' '}
            <span className="text-sky-600">an einem Ort.</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            PDFs bearbeiten, Dateien konvertieren, Bilder komprimieren und Dokumente zusammenführen – schnell, einfach und sicher direkt im Browser.
          </p>

          {/* Quick Search Input */}
          <div className="mt-8 sm:mt-10 max-w-xl mx-auto space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Werkzeug suchen (z. B. Word, Excel, Bild, Komprimieren, OCR)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Zurücksetzen
                </button>
              )}
            </div>

            {/* Quick Search Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mr-1">Beliebt:</span>
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className={`text-2xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === chip.toLowerCase()
                      ? 'bg-sky-600 text-white border-sky-600 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Kein Server-Upload für Browser-Tools
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Keine Softwareinstallation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sofortiger Download ohne Wartezeit
            </span>
          </div>
        </div>
      </section>

      {/* Main Tools Catalog */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/de/${tool.slug}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tool.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        {tool.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {getFormatFlow(tool)}
                    </span>
                  </div>
                </div>

                <h2 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors mb-1.5">
                  {tool.nameDe}
                </h2>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.shortDescriptionDe}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-600 font-medium">
                <span>Jetzt nutzen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <p className="text-base font-semibold">Keine Werkzeuge gefunden.</p>
            <p className="text-xs text-slate-400 mt-1">
              Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.
            </p>
          </div>
        )}
      </section>

      {/* Non-intrusive Ad Placement */}
      <AdSlot format="horizontal" />

      {/* Trust & Privacy Architecture Section */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Sicherheit & Privatsphäre nach europäischem Maßstab
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

      {/* Policy-Compliant Homepage Content Ad Placement */}
      <AdSlot slotKey="homepage_bottom" className="my-6 max-w-5xl" />

      {/* Pro Upsell Callout */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold mb-3 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CoolWave Pro</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Mehr Power für Vielnutzer & Profis
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Arbeiten Sie ohne Werbung, verarbeiten Sie bis zu 50 Dateien gleichzeitig im Batch-Modus und heben Sie das Dateilimit auf bis zu 500 MB an.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/de/preise"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Pläne & Preise ansehen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
