'use client';

import React, { useState } from 'react';
import { Lock, Unlock, FileText, Eye, EyeOff, ShieldCheck, Printer, Copy, Edit3, Info } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { CLIENT_PDF_LIMITS, outputName, pdfBlob, readFileBytes } from '@/lib/client/pdf/common';
import { toGermanErrorMessage } from '@/lib/client/pdf/errors';
import { changePermissions, protectPdf, unlockPdf, type SecurityResult } from '@/lib/client/pdf/security';

export type SecurityMode = 'protect' | 'unlock' | 'permissions';

interface PdfSecurityEngineProps {
  mode: SecurityMode;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

export function PdfSecurityEngine({ mode }: PdfSecurityEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Permission flags
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultNote, setResultNote] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toolSlug =
    mode === 'protect' ? 'pdf-schuetzen' : mode === 'unlock' ? 'pdf-entsperren' : 'pdf-berechtigungen-aendern';

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      trackEvent('upload_completed', { toolSlug });
    }
  };

  const validate = (): string | null => {
    if (mode === 'protect') {
      if (!password) return 'Bitte geben Sie ein Kennwort ein.';
      if (password.length < 4) return 'Das Kennwort sollte aus Sicherheitsgründen mindestens 4 Zeichen lang sein.';
      if (password !== confirmPassword) return 'Die Kennwörter stimmen nicht überein.';
      if (ownerPassword && ownerPassword === password) {
        return 'Das Besitzer-Kennwort muss sich vom Öffnen-Kennwort unterscheiden.';
      }
    }
    if (mode === 'permissions' && ownerPassword && ownerPassword.length < 4) {
      return 'Das neue Besitzer-Kennwort sollte mindestens 4 Zeichen lang sein.';
    }
    return null;
  };

  const handleExecute = async () => {
    if (!file) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(5);
    setStatusText('PDF-Werkzeug wird im Browser geladen...');
    trackEvent('conversion_started', { toolSlug });

    const onProgress = (pct: number, text?: string) => {
      setProgress(pct);
      if (text) setStatusText(text);
    };
    const permissions = { allowPrinting, allowCopying, allowModifying };

    try {
      const input = await readFileBytes(file);
      let result: SecurityResult;
      let suffix: string;
      if (mode === 'protect') {
        result = await protectPdf(input, { userPassword: password, ownerPassword, permissions }, onProgress);
        suffix = '_geschuetzt';
      } else if (mode === 'unlock') {
        result = await unlockPdf(input, password, onProgress);
        suffix = '_entsperrt';
      } else {
        result = await changePermissions(
          input,
          { currentPassword: password, newOwnerPassword: ownerPassword, permissions },
          onProgress
        );
        suffix = '_berechtigungen';
      }

      setProgress(100);
      setStatusText('Fertig');
      setResultBlob(pdfBlob(result.bytes));
      setResultNote(result.note ?? null);
      setOutputFilename(outputName(file.name, suffix));
      trackEvent('conversion_completed', { toolSlug });
    } catch (err: unknown) {
      setError(toGermanErrorMessage(err));
      trackEvent('conversion_failed', { toolSlug });
    } finally {
      setIsProcessing(false);
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
    setOwnerPassword('');
    setResultBlob(null);
    setResultNote(null);
    setError(null);
    setIsProcessing(false);
  };

  if (resultBlob && file) {
    return (
      <div className="w-full space-y-4">
        {resultNote && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-700" />
            <span>{resultNote}</span>
          </div>
        )}
        <DownloadBox
          filename={outputFilename}
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
      </div>
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  const passwordLabel =
    mode === 'protect'
      ? 'Öffnen-Kennwort festlegen'
      : mode === 'unlock'
        ? 'Aktuelles PDF-Kennwort'
        : 'Aktuelles Kennwort (nur falls das PDF geschützt ist)';

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={CLIENT_PDF_LIMITS.maxFileSizeMB}
          onFilesSelected={handleFileSelected}
          isLocal
          title={
            mode === 'protect'
              ? 'PDF zum Schützen ablegen'
              : mode === 'unlock'
                ? 'Geschütztes PDF zum Entsperren ablegen'
                : 'PDF zum Ändern der Berechtigungen ablegen'
          }
          subtitle={
            mode === 'protect'
              ? 'AES-256-Verschlüsselung direkt in Ihrem Browser – die Datei verlässt Ihr Gerät nicht'
              : mode === 'unlock'
                ? 'Entfernen Sie das bekannte Kennwort dauerhaft – lokal in Ihrem Browser'
                : 'Steuern Sie Zugriffsrechte für Drucken, Kopieren und Bearbeiten – lokal in Ihrem Browser'
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
                {passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'protect' ? 'Sicheres Kennwort vergeben...' : 'Bestehendes Kennwort eingeben...'}
                  autoComplete={mode === 'protect' ? 'new-password' : 'off'}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Kennwort verbergen' : 'Kennwort anzeigen'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'unlock' && (
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Hat das PDF nur Einschränkungen (z. B. Drucken gesperrt), aber kein Öffnen-Kennwort, kann das Feld
                  leer bleiben.
                </p>
              )}
            </div>

            {/* Confirm password for Protect mode */}
            {mode === 'protect' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kennwort bestätigen
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Kennwort wiederholen..."
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            )}

            {/* Owner password (optional) */}
            {(mode === 'protect' || mode === 'permissions') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {mode === 'protect' ? 'Besitzer-Kennwort (optional)' : 'Neues Besitzer-Kennwort (optional)'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Leer lassen für ein zufälliges Kennwort"
                  autoComplete="new-password"
                  className={inputClass}
                />
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Mit dem Besitzer-Kennwort lassen sich die Berechtigungen später wieder ändern.
                </p>
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
                    <span>Bearbeiten, Kommentieren und Formulare ausfüllen erlauben</span>
                  </label>
                </div>
              </div>
            )}

            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 leading-relaxed">
              <strong>100 % lokal:</strong> Die Verarbeitung (qpdf, AES-256) läuft vollständig in Ihrem Browser.
              Weder die Datei noch Ihre Kennwörter werden an einen Server übertragen.
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
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
