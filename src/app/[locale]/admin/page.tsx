'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Users,
  CreditCard,
  Sliders,
  ShieldAlert,
  Activity,
  BarChart3,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  HardDrive
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

type AdminTab =
  | 'dashboard'
  | 'tools'
  | 'jobs'
  | 'users'
  | 'subscriptions'
  | 'settings'
  | 'audit-logs'
  | 'health';

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [tools, setTools] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  // Filter & Search states
  const [toolSearch, setToolSearch] = useState('');
  const [editingTool, setEditingTool] = useState<any | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [toolsRes, jobsRes, usersRes, subsRes, settingsRes, auditRes, healthRes] = await Promise.allSettled([
        fetch('/api/v1/admin/tools').then((r) => r.json()),
        fetch('/api/v1/admin/jobs?limit=50').then((r) => r.json()),
        fetch('/api/v1/admin/users').then((r) => r.json()),
        fetch('/api/v1/admin/subscriptions').then((r) => r.json()),
        fetch('/api/v1/admin/settings').then((r) => r.json()),
        fetch('/api/v1/admin/audit-logs?limit=50').then((r) => r.json()),
        fetch('/api/health').then((r) => r.json()),
      ]);

      if (toolsRes.status === 'fulfilled' && toolsRes.value.tools) setTools(toolsRes.value.tools);
      if (jobsRes.status === 'fulfilled' && jobsRes.value.jobs) setJobs(jobsRes.value.jobs);
      if (usersRes.status === 'fulfilled' && usersRes.value.users) setUsers(usersRes.value.users);
      if (subsRes.status === 'fulfilled' && subsRes.value.subscriptions) setSubscriptions(subsRes.value.subscriptions);
      if (settingsRes.status === 'fulfilled' && settingsRes.value.settings) setSettings(settingsRes.value.settings);
      if (auditRes.status === 'fulfilled' && auditRes.value.auditLogs) setAuditLogs(auditRes.value.auditLogs);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Tool updates
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    try {
      const res = await fetch('/api/v1/admin/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: editingTool.slug,
          updates: {
            isEnabled: editingTool.isEnabled,
            isHidden: editingTool.isHidden,
            isProOnly: editingTool.isProOnly,
            maxFileSizeMB: Number(editingTool.maxFileSizeMB),
            metaTitle: editingTool.metaTitle,
            metaDescription: editingTool.metaDescription,
            shortDescription: editingTool.shortDescription,
          },
        }),
      });

      if (!res.ok) throw new Error('Fehler beim Speichern');
      showNotification('success', `Tool "${editingTool.title || editingTool.slug}" erfolgreich aktualisiert.`);
      setEditingTool(null);
      fetchAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Speichern fehlgeschlagen');
    }
  };

  // Setting update
  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Fehler beim Aktualisieren der Einstellung');
      showNotification('success', `Einstellung "${key}" aktualisiert.`);
      fetchAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Aktualisieren fehlgeschlagen');
    }
  };

  // User role update
  const handleUpdateUser = async (userId: string, updates: { role?: string; plan?: string }) => {
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });
      if (!res.ok) throw new Error('Fehler beim Aktualisieren des Benutzers');
      showNotification('success', 'Benutzer erfolgreich aktualisiert.');
      fetchAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Aktualisieren fehlgeschlagen');
    }
  };

  const filteredTools = tools.filter((t) =>
    (t.title || t.slug).toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.category?.toLowerCase().includes(toolSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              CW
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                CoolWave Administrator-Panel
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Live DB
                </span>
              </h1>
              <p className="text-xs text-slate-500">Systemkontrolle, Mandanten & Tools</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/de/admin/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Erweiterte Analytics
            </Link>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-slate-100 py-1.5 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tools', label: `Tools (${tools.length})`, icon: Wrench },
            { id: 'jobs', label: `Jobs (${jobs.length})`, icon: FileText },
            { id: 'users', label: `Benutzer (${users.length})`, icon: Users },
            { id: 'subscriptions', label: `Abos (${subscriptions.length})`, icon: CreditCard },
            { id: 'settings', label: 'Einstellungen', icon: Sliders },
            { id: 'audit-logs', label: `Audit-Logs (${auditLogs.length})`, icon: ShieldAlert },
            { id: 'health', label: 'System-Status', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Alert */}
      {actionMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Aktive Tools</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {tools.filter((t) => t.isEnabled).length} / {tools.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Konvertierungs-Engines</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Registrierte Benutzer</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {users.filter((u) => u.role === 'ADMIN').length} Administratoren
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Pro Abonnements</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {subscriptions.filter((s) => s.status === 'ACTIVE').length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Aktiv via Stripe</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Geleistete Konvertierungen</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">{jobs.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Protokollierte Durchläufe</div>
              </div>
            </div>

            {/* Quick Links / Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Infrastruktur & Umgebung
                </h2>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Datenbank:</span>
                    <span className="font-semibold text-slate-900">
                      {health?.database?.status === 'ok' ? (
                        <span className="text-emerald-600 font-bold">PostgreSQL Verbunden</span>
                      ) : (
                        <span className="text-amber-600">Lokal / Fallback</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Stripe Billing:</span>
                    <span className="font-semibold text-slate-900">
                      {health?.stripe?.configured ? (
                        <span className="text-emerald-600">Aktiviert</span>
                      ) : (
                        <span className="text-slate-400">Schlüssel ausstehend (Graceful Fallback)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Sitzungsverwaltung:</span>
                    <span className="font-semibold text-slate-900">Prisma / HTTP-Only Cookie (cw_session)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Node-Umgebung:</span>
                    <span className="font-mono text-slate-700">{process.env.NODE_ENV || 'production'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Letzte Audit-Aktivitäten
                </h2>
                <div className="space-y-2 text-xs">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{log.action}</div>
                        <div className="text-[11px] text-slate-500">
                          Ziel: {log.targetType} {log.targetId ? `(${log.targetId})` : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString('de-DE')}
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-xs text-slate-400 italic py-2">Noch keine Aktionen protokolliert.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TOOLS MANAGEMENT */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tools filtern..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="text-xs text-slate-500">
                Zeige <strong>{filteredTools.length}</strong> von {tools.length} Tools
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Tool</th>
                      <th className="py-3 px-3">Kategorie</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Sichtbarkeit</th>
                      <th className="py-3 px-3 text-center">Zugang</th>
                      <th className="py-3 px-3 text-right">Max. MB</th>
                      <th className="py-3 px-4 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTools.map((t) => (
                      <tr key={t.slug} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{t.title || t.slug}</div>
                          <div className="text-[11px] text-slate-400 font-mono">/{t.slug}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {t.isEnabled ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Deaktiviert
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {t.isHidden ? (
                            <span className="text-amber-600 font-medium">Versteckt</span>
                          ) : (
                            <span className="text-slate-500">Sichtbar</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {t.isProOnly ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                              Pro Only
                            </span>
                          ) : (
                            <span className="text-slate-500">Kostenlos</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium">
                          {t.maxFileSizeMB} MB
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setEditingTool({ ...t })}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition text-xs"
                          >
                            Konfigurieren
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CONVERSION JOBS */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Verarbeitete Konvertierungs-Jobs</h2>
                <p className="text-xs text-slate-500">Echtzeit-Audit ohne Speicherung privater Dateiinhalte</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Letzte {jobs.length} Jobs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-3">Tool</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Dateigröße</th>
                    <th className="py-3 px-3 text-right">Dauer</th>
                    <th className="py-3 px-4 text-right">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {j.id.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{j.toolId}</td>
                      <td className="py-3 px-3 text-slate-500">
                        {j.inputMime || '-'} &rarr; {j.outputMime || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            j.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : j.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {j.inputSize ? formatBytes(j.inputSize) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {j.durationMs ? `${j.durationMs} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(j.createdAt).toLocaleTimeString('de-DE')}
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Noch keine Konvertierungs-Jobs in der Datenbank hinterlegt.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Registrierte Benutzerkonten</h2>
                <p className="text-xs text-slate-500">Rollenverwaltung (USER / ADMIN) und Abonnement-Status</p>
              </div>
              <span className="text-xs text-slate-400">{users.length} Konten</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">E-Mail</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Rolle</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Registriert</th>
                    <th className="py-3 px-4 text-right">Rolle anpassen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.email}</td>
                      <td className="py-3 px-3 text-slate-600">{u.name || '-'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.plan === 'pro'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateUser(u.id, {
                              role: u.role === 'ADMIN' ? 'USER' : 'ADMIN',
                            })
                          }
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
                        >
                          {u.role === 'ADMIN' ? 'Zu User machen' : 'Zu Admin machen'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Keine Benutzer in der Datenbank gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Stripe Abonnements</h2>
                <p className="text-xs text-slate-500">Live-Synchronisation mit Stripe Webhooks</p>
              </div>
              <span className="text-xs text-slate-400">{subscriptions.length} Abonnements</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Kunde (E-Mail)</th>
                    <th className="py-3 px-3">Stripe Kunde</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Aktuelle Periode Ende</th>
                    <th className="py-3 px-4 text-right">Kündigung vorgemerkt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {s.user?.email || 'Unbekannt'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{s.stripeCustomerId}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium uppercase text-slate-800">{s.plan}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString('de-DE') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.cancelAtPeriodEnd ? (
                          <span className="text-amber-600 font-semibold">Ja (Läuft aus)</span>
                        ) : (
                          <span className="text-emerald-600">Automatische Verlängerung</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Keine aktiven Stripe-Abonnements in der Datenbank gespeichert.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Globale System-Einstellungen</h2>
              <p className="text-xs text-slate-500">
                Laufzeit-Konfigurationen in PostgreSQL mit sofortiger Wirkung ohne Neustart.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              {settings.map((s) => (
                <div
                  key={s.key}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 pr-4">
                    <div className="font-semibold text-xs text-slate-900 font-mono">{s.key}</div>
                    <div className="text-xs text-slate-600">{s.description}</div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {typeof s.value === 'boolean' ? (
                      <button
                        onClick={() => handleUpdateSetting(s.key, !s.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          s.value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {s.value ? 'AKTIV' : 'INAKTIV'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={s.value}
                          onBlur={(e) => handleUpdateSetting(s.key, Number(e.target.value))}
                          className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-right font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AUDIT LOGS */}
        {activeTab === 'audit-logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Audit-Protokoll</h2>
                <p className="text-xs text-slate-500">Unveränderbare Aufzeichnung administrativer Änderungen</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Letzte {auditLogs.length} Events</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Zeitpunkt</th>
                    <th className="py-3 px-3">Aktion</th>
                    <th className="py-3 px-3">Administrator</th>
                    <th className="py-3 px-3">Ziel</th>
                    <th className="py-3 px-4">Metadaten</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('de-DE')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{log.action}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {log.user?.email || log.actorUserId || 'System'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {log.targetType} {log.targetId ? `[${log.targetId}]` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-md truncate">
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic font-sans">
                        Noch keine Audit-Events protokolliert.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Live-Systemprüfung
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Web-Server Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ONLINE
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Datenbank (PostgreSQL):</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      health?.database?.status === 'ok'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {health?.database?.status === 'ok' ? 'VERBUNDEN (READY)' : 'FALLBACK / UNCONFIGURED'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Stripe Billing Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      health?.stripe?.configured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {health?.stripe?.configured ? 'AKTIVIERT' : 'STANDBY (WAITING FOR SECRETS)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Umgebung & Endpunkte
              </h2>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Healthcheck-Endpunkte für Docker / Kubernetes / Azure Load Balancer:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-800 border border-slate-200">
                  GET /api/health
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-800 border border-slate-200">
                  GET /api/health/ready
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOOL CONFIG EDIT MODAL */}
      {editingTool && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Tool konfigurieren</h3>
                <span className="text-xs text-slate-500 font-mono">/{editingTool.slug}</span>
              </div>
              <button
                onClick={() => setEditingTool(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTool.isEnabled}
                    onChange={(e) => setEditingTool({ ...editingTool, isEnabled: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span className="font-semibold text-slate-800">Tool aktiviert</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTool.isHidden}
                    onChange={(e) => setEditingTool({ ...editingTool, isHidden: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span className="font-semibold text-slate-800">In Listen verstecken</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTool.isProOnly}
                    onChange={(e) => setEditingTool({ ...editingTool, isProOnly: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span className="font-semibold text-slate-800">Nur für Pro-Nutzer</span>
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Max. Dateigröße (MB)
                  </label>
                  <input
                    type="number"
                    value={editingTool.maxFileSizeMB || 50}
                    onChange={(e) => setEditingTool({ ...editingTool, maxFileSizeMB: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  SEO Title (Meta-Title)
                </label>
                <input
                  type="text"
                  value={editingTool.metaTitle || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, metaTitle: e.target.value })}
                  placeholder="Standard aus Registry verwenden..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  SEO Description (Meta-Beschreibung)
                </label>
                <textarea
                  rows={3}
                  value={editingTool.metaDescription || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, metaDescription: e.target.value })}
                  placeholder="Standard aus Registry verwenden..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Konfiguration speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
