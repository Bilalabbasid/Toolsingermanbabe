'use client';

import React, { useState } from 'react';
import { Lock, Unlock, FileText, Eye, EyeOff, ShieldCheck, Printer, Copy, Edit3 } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type SecurityMode = 'protect' | 'unlock' | 'permissions';

interface PdfSecurityEngineProps {
  mode: SecurityMode;
}

export function PdfSecurityEngine({ mode }: PdfSecurityEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Permission flags
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toolSlug =
    mode === 'protect'
      ? 'pdf-schuetzen'
      : mode === 'unlock'
      ? 'pdf-entsperren'
      : 'pdf-berechtigungen-aendern';

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      trackEvent('upload_completed', { toolSlug });
    }
  };

  const handleExecute = async () => {
    if (!file) return;

    if (mode === 'protect') {
      if (!password.trim()) {
        setError('Bitte geben Sie ein Kennwort ein.');
        return;
      }
      if (password.length < 4) {
        setError('Das Kennwort sollte aus Sicherheitsgründen mindestens 4 Zeichen lang sein.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setError('Die Passwörter stimmen nicht überein.');
        return;
      }
    } else if (mode === 'unlock') {
      if (!password.trim()) {
        setError('Bitte geben Sie das aktuelle Kennwort des Dokuments ein.');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    setProgress(25);
    setStatusText(
      mode === 'protect'
        ? 'Dokument wird mit ISO-32000 AES-Verschlüsselung gesichert...'
        : mode === 'unlock'
        ? 'Kennwort wird validiert und Schutz entfernt...'
        : 'Berechtigungen werden aktualisiert...'
    );

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (mode === 'protect') {
        formData.append('action', 'protect');
        formData.append('password', password);
        formData.append(
          'permissions',
          JSON.stringify({
            allowPrinting,
            allowCopying,
            allowModifying,
          })
        );
      } else if (mode === 'unlock') {
        formData.append('action', 'unlock');
        formData.append('password', password);
      } else {
        formData.append('action', 'permissions');
        formData.append('password', password);
        formData.append(
          'permissions',
          JSON.stringify({
            allowPrinting,
            allowCopying,
            allowModifying,
          })
        );
      }

      setProgress(55);

      const res = await fetch('/api/v1/pdf/security', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Fehler bei der Sicherheitsoperation.';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // Fallback
        }
        throw new Error(errMessage);
      }

      setProgress(85);
      setStatusText('Ergebnis wird vorbereitet...');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let outName =
        mode === 'protect'
          ? `geschuetzt_${file.name}`
          : mode === 'unlock'
          ? `entsperrt_${file.name}`
          : `berechtigt_${file.name}`;

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) outName = decodeURIComponent(match[1]);
      }

      setResultBlob(blob);
      setOutputFilename(outName);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Fehler bei der Verarbeitung.';
      setError(msg);
      setIsProcessing(false);
      trackEvent('conversion_failed', { toolSlug });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug });
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResultBlob(null);
    setError(null);
    setIsProcessing(false);
  };

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={resultBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel={
          mode === 'protect'
            ? 'Geschütztes PDF herunterladen'
            : mode === 'unlock'
            ? 'Entsperrtes PDF herunterladen'
            : 'Aktualisiertes PDF herunterladen'
        }
      />
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={50}
          onFilesSelected={handleFileSelected}
          title={
            mode === 'protect'
              ? 'PDF zum Schützen ablegen'
              : mode === 'unlock'
              ? 'Geschütztes PDF zum Entsperren ablegen'
              : 'PDF zum Ändern der Berechtigungen ablegen'
          }
          subtitle={
            mode === 'protect'
              ? 'Standardkonforme ISO-32000 Verschlüsselung mit individuellem Kennwort'
              : mode === 'unlock'
              ? 'Entfernen Sie das bekannte Kennwort dauerhaft aus dem Dokument'
              : 'Steuern Sie Zugriffsrechte für Drucken, Kopieren und Bearbeiten'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="py-6 space-y-6 max-w-lg">
            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {mode === 'protect'
                  ? 'Dokument-Passwort festlegen'
                  : mode === 'unlock'
                  ? 'Aktuelles PDF-Passwort eingeben'
                  : 'Aktuelles Besitzer-Passwort (falls geschützt)'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'protect'
                      ? 'Sicheres Kennwort vergeben...'
                      : 'Bestehendes Kennwort eingeben...'
                  }
                  autoComplete="off"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Passwort anzeigen"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm password for Protect mode */}
            {mode === 'protect' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Passwort bestätigen
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Kennwort wiederholen..."
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {/* Permissions Granular Controls */}
            {(mode === 'protect' || mode === 'permissions') && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Berechtigungen für Empfänger festlegen</span>
                </h4>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={allowPrinting}
                      onChange={(e) => setAllowPrinting(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Drucken des Dokuments erlauben</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={allowCopying}
                      onChange={(e) => setAllowCopying(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Kopieren von Texten und Grafiken erlauben</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={allowModifying}
                      onChange={(e) => setAllowModifying(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <Edit3 className="w-4 h-4 text-slate-500" />
                    <span>Bearbeiten und Kommentieren erlauben</span>
                  </label>
                </div>
              </div>
            )}

            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 leading-relaxed">
              <strong>Sicherheits-Garantie:</strong> Passwörter werden ausschließlich zur
              Verschlüsselung verwendet, niemals im Klartext gespeichert und niemals protokolliert.
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={handleExecute}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              {mode === 'protect' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>PDF jetzt verschlüsseln</span>
                </>
              ) : mode === 'unlock' ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Passwort entfernen & entsperren</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Berechtigungen anwenden</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
