export const metadata = { robots: { index: false, follow: false } };
import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/guards';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/admin`);
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Zugriff verweigert (403)</h1>
          <p className="text-sm text-slate-600 mb-6">
            Ihr Benutzerkonto (<span className="font-semibold text-slate-800">{user.email}</span>) verfügt nicht über Administrator-Berechtigungen.
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
