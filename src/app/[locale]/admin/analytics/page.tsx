'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  HardDrive,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Zap,
  DollarSign,
  ArrowUpRight,
  Layers,
  Activity,
  ChevronDown
} from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { AnalyticsDashboardData, ToolPerformanceMetric } from '@/types/analytics';
import { formatBytes } from '@/lib/utils';

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof ToolPerformanceMetric>('views');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchDashboardData = async (range: 'today' | '7d' | '30d' | 'all') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/analytics/dashboard?range=${range}`);
      if (!res.ok) throw new Error('Fehler beim Laden der Analytics-Daten');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  const breadcrumbs = [
    { name: 'Administration', url: '/de/admin/analytics' },
    { name: 'Analytics & Performance', url: '/de/admin/analytics' },
  ];

  // Filtering & sorting for tools table
  const filteredTools = (data?.tools || []).filter((t) => {
    const matchesSearch =
      t.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toolSlug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  filteredTools.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof ToolPerformanceMetric) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbs} />

          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['today', '7d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === r
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'today'
                    ? 'Heute'
                    : r === '7d'
                    ? '7 Tage'
                    : r === '30d'
                    ? '30 Tage'
                    : 'Gesamt'}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchDashboardData(timeRange)}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title & Privacy Architecture Badge */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  CoolWave Product Analytics
                </h1>
                <p className="text-sm text-slate-500">
                  Datenschutzkonforme Produktmetriken, Funnels und Infrastruktur-Kostenanalyse
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2.5 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero-PII Architektur:</strong> Keine IP-Adressen, Passwörter oder Inhalte gespeichert. Modularer Provider: <code>LocalPrivacyAnalyticsProvider</code>.
            </span>
          </div>
        </div>

        {/* 1. Overview KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Tool-Aufrufe</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data?.overview.totalToolViews.toLocaleString('de-DE') || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Traffic & Impressionen</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Konvertierungen</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {data?.overview.totalConversionsCompleted.toLocaleString('de-DE') || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Erfolgreich abgeschlossen</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Erfolgsquote</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data?.overview.overallSuccessRate || 100}%
            </div>
            <div className="text-[11px] text-rose-500 mt-1">
              Fehlerrate: {Math.round((100 - (data?.overview.overallSuccessRate || 100)) * 10) / 10}%
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Ø Rechenzeit</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data?.overview.avgProcessingTimeMs || 0} <span className="text-sm font-normal text-slate-500">ms</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Über alle Engines</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Bandbreite</span>
              <HardDrive className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data?.overview.totalBandwidthMB.toLocaleString('de-DE') || 0} <span className="text-sm font-normal text-slate-500">MB</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Transfervolumen</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Pro Upgrades</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {data?.overview.totalProConversions || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Zahlende Abonnenten</div>
          </div>
        </div>

        {/* 2. Analytical Intelligence Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Question: Which tools consume the most infrastructure / are expensive? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-slate-900 text-sm">
                  Infrastruktur & Kosten-Treiber
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Top 5 Ressourcen-Tools</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Welche Tools belasten CPU, Speicher und Bandbreite am stärksten?
            </p>
            <div className="space-y-3">
              {data?.infrastructureTopExpensive.map((tool, idx) => (
                <div
                  key={tool.toolSlug}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {tool.toolName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {tool.reason}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-amber-600">
                      Index {tool.costScore}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tool.avgTimeMs} ms • Ø {tool.avgSizeMB} MB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question: Which tools lead to Pro? (Pro Funnel Attribution) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h2 className="font-semibold text-slate-900 text-sm">
                  Pro-Konvertierung & Funnel
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Monetarisierung</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Welche Tools lösen die meisten Upgrades zu CoolWave Pro aus?
            </p>

            {/* Funnel Steps */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <div>
                <div className="text-xs text-slate-400">Pro Views</div>
                <div className="text-base font-bold text-slate-800">
                  {data?.proFunnel.proViewedTotal || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Pro Klicks</div>
                <div className="text-base font-bold text-blue-600">
                  {data?.proFunnel.proClickedTotal || 0}
                </div>
                <div className="text-[10px] text-slate-400">
                  {data?.proFunnel.viewToClickRate}% CTR
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Signups</div>
                <div className="text-base font-bold text-emerald-600">
                  {data?.proFunnel.signupCompletedTotal || 0}
                </div>
                <div className="text-[10px] text-slate-400">
                  {data?.proFunnel.clickToSignupRate}% CR
                </div>
              </div>
            </div>

            {/* Top Trigger Tools */}
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Top Upsell-Trigger Tools:
            </div>
            <div className="space-y-2">
              {data?.proFunnel.topTriggerTools.map((t) => (
                <div
                  key={t.toolSlug}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50"
                >
                  <span className="text-slate-800 font-medium truncate">{t.toolName}</span>
                  <span className="text-slate-500 font-semibold">{t.count} Upsell-Views</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question: Usage by Category & Top Organic Landing Pages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-slate-900 text-sm">
                  Nutzung nach Kategorie
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Traffic-Verteilung</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Verteilung der Nachfrage über PDF, Bilder, Dokumente und Utilities.
            </p>

            <div className="space-y-3 mb-5">
              {data?.categories.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800">{cat.category}</span>
                    <span className="text-slate-500">
                      {cat.views.toLocaleString('de-DE')} Aufrufe ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Top Organische Einstiegs-Tools:
              </div>
              <div className="space-y-1.5">
                {data?.organicLandingPages.slice(0, 3).map((tool) => (
                  <div
                    key={tool.toolSlug}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-slate-50"
                  >
                    <span className="text-blue-600 font-medium truncate">{tool.toolName}</span>
                    <span className="text-slate-500">
                      {tool.views} Views • {tool.conversionRate}% CR
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Comprehensive Tool Performance Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Tool-Nutzung & Performance-Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Detaillierte Auswertung aller Werkzeuge hinsichtlich Volumen, Erfolgsquoten und Ressourceneinsatz
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Kategorien</option>
                  <option value="PDF">PDF</option>
                  <option value="Bilder">Bilder</option>
                  <option value="Dokumente">Dokumente</option>
                  <option value="OCR">OCR</option>
                  <option value="Konvertieren">Konvertieren</option>
                  <option value="Tools & Utilities">Tools & Utilities</option>
                </select>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tool filtern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 select-none">
                  <th
                    onClick={() => handleSort('toolName')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                  >
                    Tool & Slug
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900"
                  >
                    Kategorie
                  </th>
                  <th
                    onClick={() => handleSort('views')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Aufrufe
                  </th>
                  <th
                    onClick={() => handleSort('conversionsCompleted')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Runs
                  </th>
                  <th
                    onClick={() => handleSort('successRate')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Erfolgsquote
                  </th>
                  <th
                    onClick={() => handleSort('failureRate')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Fehler
                  </th>
                  <th
                    onClick={() => handleSort('avgProcessingTimeMs')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Ø Dauer
                  </th>
                  <th
                    onClick={() => handleSort('avgInputSizeBytes')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Ø Input
                  </th>
                  <th
                    onClick={() => handleSort('avgOutputSizeBytes')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Ø Output
                  </th>
                  <th
                    onClick={() => handleSort('infrastructureCostScore')}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Kosten-Index
                  </th>
                  <th
                    onClick={() => handleSort('proAttributedSignups')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-900"
                  >
                    Pro Signups
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTools.map((tool) => (
                  <tr key={tool.toolSlug} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link
                        href={`/de/${tool.toolSlug}`}
                        target="_blank"
                        className="hover:text-blue-600 flex items-center gap-1.5"
                      >
                        <span>{tool.toolName}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        /{tool.toolSlug}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {tool.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {tool.views.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {tool.conversionsCompleted.toLocaleString('de-DE')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          tool.successRate >= 95
                            ? 'text-emerald-600'
                            : tool.successRate >= 85
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {tool.successRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`${
                          tool.conversionsFailed > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {tool.conversionsFailed}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-mono">
                      {tool.avgProcessingTimeMs} ms
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {tool.avgInputSizeBytes > 0 ? formatBytes(tool.avgInputSizeBytes) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {tool.avgOutputSizeBytes > 0 ? formatBytes(tool.avgOutputSizeBytes) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          tool.infrastructureCostScore > 100
                            ? 'bg-rose-50 text-rose-700'
                            : tool.infrastructureCostScore > 30
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {tool.infrastructureCostScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-amber-600">
                      {tool.proAttributedSignups > 0 ? `+${tool.proAttributedSignups}` : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
