'use client';

import React, { useState } from 'react';
import { EyeOff, FileText, Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function PdfRedactionEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [currentTerm, setCurrentTerm] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      trackEvent('upload_completed', { toolSlug: 'pdf-schwaerzen' });
    }
  };

  const handleAddTerm = () => {
    const trimmed = currentTerm.trim();
    if (trimmed && !terms.includes(trimmed)) {
      setTerms([...terms, trimmed]);
      setCurrentTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTerm();
    }
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    if (!file) return;
    if (terms.length === 0 && !currentTerm.trim()) {
      setError('Bitte geben Sie mindestens einen Begriff oder ein Datenmuster zum Schwärzen ein.');
      return;
    }

    const finalTerms = [...terms];
    if (currentTerm.trim() && !finalTerms.includes(currentTerm.trim())) {
      finalTerms.push(currentTerm.trim());
    }

    setIsProcessing(true);
    setError(null);
    setProgress(20);
    setStatusText('PDF-Datenströme werden analysiert und dekomprimiert...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'redact');
      formData.append('terms', JSON.stringify(finalTerms));

      setProgress(50);
      setStatusText('Vertrauliche Textsegmente werden physisch aus dem Dokument gelöscht...');

      const res = await fetch('/api/v1/pdf/security', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Fehler beim Schwärzen der PDF-Datei.';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // Fallback
        }
        throw new Error(errMessage);
      }

      setProgress(85);
      setStatusText('Dokument wird optimiert und neu assembliert...');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let outName = `geschwaerzt_${file.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) outName = decodeURIComponent(match[1]);
      }

      setResultBlob(blob);
      setOutputFilename(outName);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-schwaerzen' });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Fehler bei der Schwärzung.';
      setError(msg);
      setIsProcessing(false);
      trackEvent('conversion_failed', { toolSlug: 'pdf-schwaerzen' });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-schwaerzen' });
  };

  const handleReset = () => {
    setFile(null);
    setCurrentTerm('');
    setTerms([]);
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
        downloadLabel="Geschwärztes PDF herunterladen"
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
          title="PDF zum echten Schwärzen ablegen"
          subtitle="Entfernt sensible Begriffe physisch aus dem PDF-Datenstrom – nicht kopierbar"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="py-6 space-y-5 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Zu schwärzende Begriffe oder Kennungen hinzufügen
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="z. B. Max Mustermann, DE123456..., Kundennummer"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hinzufügen</span>
                </button>
              </div>
            </div>

            {/* Terms List Tags */}
            {terms.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-2">
                  Bereit zum unwiderruflichen Löschen ({terms.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {terms.map((term, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-medium border border-slate-200"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* True Redaction Guarantee Card */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Echte Schwärzung (True Redaction)</span>
              </div>
              <p className="leading-relaxed text-amber-900/90">
                Im Unterschied zu visuellen Überdeckungen werden die Zeichenfolgen physisch aus den
                internen Inhaltsströmen (Content Streams) des PDFs entfernt. Der Inhalt kann nach dem
                Vorgang weder markiert, kopiert, durchsucht noch durch Extrahierungs-Werkzeuge
                wiederhergestellt werden.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sicher für DSGVO, Verträge und Bankdokumente</span>
              </div>
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span>PDF unwiderruflich schwärzen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
