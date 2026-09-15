'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  User,
  Crown,
  FileText,
  CreditCard,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

export default function UserAccountPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          router.push(`/${locale}/login?redirect=/${locale}/konto`);
          return;
        }
        const data = await res.json();
        setUserData(data);
      })
      .catch(() => {
        router.push(`/${locale}/login?redirect=/${locale}/konto`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      router.push(`/${locale}`);
    }
  };

  const handleManageSubscription = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/v1/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Abrechnungsportal konnte nicht geladen werden.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setBillingError(err.message || 'Abrechnungsportal derzeit nicht verfügbar.');
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData?.user) return null;

  const { user, entitlements } = userData;
  const isPro = user.plan === 'pro' || user.plan === 'business';

  return (
    <div className="min-h-[80vh] bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mein Benutzerkonto</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verwalten Sie Ihre Tarif-Einstellungen, Limits und Sitzungen
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'ADMIN' && (
              <Link
                href={`/${locale}/admin`}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Administrator-Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {billingError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{billingError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg border border-sky-100">
                {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 truncate">{user.name || 'Benutzer'}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Rolle:</span>
                <span className="font-semibold text-slate-800">{user.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Konto-Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Aktiv
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Mitglied seit:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription / Plan Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Crown className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-sm text-slate-900">
                    Aktueller Tarif: <span className="uppercase text-sky-600">{user.plan}</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isPro ? 'Unbegrenzte Premium-Funktionen aktiv' : 'Kostenloses Standardkonto mit Basisfunktionen'}
                  </p>
                </div>
              </div>

              {isPro ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={billingLoading}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Abo verwalten</span>
                </button>
              ) : (
                <Link
                  href={`/${locale}/preise`}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Auf Pro upgraden</span>
                </Link>
              )}
            </div>

            {/* Entitlements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Dateigröße</span>
                <span className="font-bold text-slate-800 text-sm">{entitlements?.maxFileSizeMB || 50} MB</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Tägliche Limits</span>
                <span className="font-bold text-slate-800 text-sm">
                  {entitlements?.dailyConversions === 999999 ? 'Unbegrenzt' : entitlements?.dailyConversions}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Batch-Verarbeitung</span>
                <span className="font-bold text-slate-800 text-sm">
                  bis zu {entitlements?.batchFiles || 3} Dateien
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Werbefreiheit</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {entitlements?.adsEnabled ? 'Nein' : 'Aktiviert'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy Card */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Datenschutz &amp; Dateisicherheit
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            CoolWave speichert niemals den Inhalt Ihrer hochgeladenen Dokumente dauerhaft in der Datenbank.
            Alle temporären Konvertierungsdateien werden nach Ablauf automatisch und rückstandslos von den Servern gelöscht.
            Metadaten dienen ausschließlich der technischen Nachverfolgung von Konvertierungsabbrüchen.
          </p>
        </div>
      </div>
    </div>
  );
}
