'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ScanText,
  Copy,
  Check,
  Download,
  Languages,
  FileText,
  FileType,
  FileSearch,
  Sparkles,
  Layers,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { ConversionJob } from '@/types/job';

export type OcrLanguage = 'deu' | 'eng' | 'fra' | 'spa' | 'ita' | 'nld';
export type OcrOutputType = 'pdf' | 'docx' | 'txt';

interface OcrEngineProps {
  defaultOutputType?: OcrOutputType;
  toolSlug?: string;
}

const LANGUAGES: { id: OcrLanguage; label: string; flag: string }[] = [
  { id: 'deu', label: 'Deutsch (Umlaute & ß)', flag: '🇩🇪' },
  { id: 'eng', label: 'Englisch', flag: '🇬🇧' },
  { id: 'fra', label: 'Französisch', flag: '🇫🇷' },
  { id: 'spa', label: 'Spanisch', flag: '🇪🇸' },
  { id: 'ita', label: 'Italienisch', flag: '🇮🇹' },
  { id: 'nld', label: 'Niederländisch', flag: '🇳🇱' },
];

export function OcrEngine({ defaultOutputType = 'pdf', toolSlug = 'ocr-pdf' }: OcrEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>('deu');
  const [outputType, setOutputType] = useState<OcrOutputType>(defaultOutputType);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [completedJob, setCompletedJob] = useState<ConversionJob | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    trackEvent('upload_completed', { toolSlug });
  };

  const startOcrJob = async () => {
    if (!file) return;

    setError(null);
    setJobStatus('submitting');
    setProgress(10);
    setStatusText('Datei wird vorbereitet und an isolierten OCR-Worker übergeben...');
    trackEvent('conversion_started', { toolSlug, language, outputType });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'ocr_pdf');
      formData.append('language', language);
      formData.append('outputType', outputType);

      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Fehler beim Einreihen des OCR-Auftrags.';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // Fallback
        }
        throw new Error(errMessage);
      }

      const data = await res.json();
      setJobId(data.jobId);
      setJobStatus('processing');
      setProgress(20);
      setStatusText('In Warteschlange eingereiht. OCR-Worker wird gestartet...');

      // Start polling
      pollJob(data.jobId);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Fehler beim Starten der Texterkennung.';
      setError(msg);
      setJobStatus('failed');
      trackEvent('conversion_failed', { toolSlug });
    }
  };

  const pollJob = (id: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/jobs/${id}`);
        if (!res.ok) return;

        const job: ConversionJob = await res.json();

        if (job.status === 'processing') {
          setProgress(Math.max(25, job.progress || 35));
          setStatusText(
            job.progress && job.progress > 70
              ? 'Erkanntes Dokument wird neu formatiert und exportiert...'
              : 'OCR-Texterkennung läuft zeilenweise...'
          );
        } else if (job.status === 'completed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setProgress(100);
          setCompletedJob(job);
          setJobStatus('completed');
          trackEvent('conversion_completed', { toolSlug });

          // If output is text, fetch preview
          if (job.output?.downloadUrl && outputType === 'txt') {
            fetch(job.output.downloadUrl)
              .then((r) => r.text())
              .then((txt) => setTextPreview(txt.substring(0, 2000)))
              .catch(() => {});
          }
        } else if (job.status === 'failed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobStatus('failed');
          setError(job.error || 'Fehler bei der serverseitigen OCR-Verarbeitung.');
          trackEvent('conversion_failed', { toolSlug });
        }
      } catch {
        // Polling retry
      }
    }, 1200);
  };

  const handleDownload = () => {
    if (!completedJob?.output?.downloadUrl) return;
    window.location.href = completedJob.output.downloadUrl;
    trackEvent('download_completed', { toolSlug });
  };

  const handleCopy = () => {
    if (!textPreview) return;
    navigator.clipboard.writeText(textPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setFile(null);
    setJobId(null);
    setJobStatus('idle');
    setProgress(0);
    setStatusText('');
    setCompletedJob(null);
    setTextPreview(null);
    setError(null);
  };

  // Completed view
  if (completedJob && completedJob.output && file) {
    return (
      <div className="w-full space-y-4">
        <DownloadBox
          filename={completedJob.output.fileName}
          originalSizeBytes={file.size}
          resultSizeBytes={completedJob.output.sizeBytes}
          onDownload={handleDownload}
          onReset={handleReset}
          downloadLabel={
            outputType === 'pdf'
              ? 'Durchsuchbares PDF herunterladen'
              : outputType === 'docx'
              ? 'Word-Dokument herunterladen'
              : 'Textdatei (.txt) herunterladen'
          }
        />

        {textPreview && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vorschau des erkannten Textes
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={textPreview}
              rows={8}
              className="w-full mt-3 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono leading-relaxed"
            />
          </div>
        )}
      </div>
    );
  }

  // Processing view
  if (jobStatus === 'submitting' || jobStatus === 'processing') {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff']}
          maxFileSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Scan, Bild oder PDF für Texterkennung ablegen"
          subtitle="Automatische optische Zeichenerkennung (OCR) mit isolierter Worker-Verarbeitung"
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

          <div className="py-6 space-y-6 max-w-xl">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-sky-600" />
                <span>Dokumentsprache für beste Erkennungsgenauigkeit</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 ${
                      language === l.id
                        ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span className="truncate">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Output Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileType className="w-4 h-4 text-sky-600" />
                <span>Gewünschtes Ausgabeformat</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOutputType('pdf')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputType === 'pdf'
                      ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <FileSearch className="w-4 h-4 text-sky-700" />
                    <span>Durchsuchbares PDF</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unsichtbare Textebene über dem Original-Scan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOutputType('docx')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputType === 'docx'
                      ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <FileText className="w-4 h-4 text-sky-700" />
                    <span>Word (.docx)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vollständig editierbares Word-Dokument.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOutputType('txt')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    outputType === 'txt'
                      ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Layers className="w-4 h-4 text-sky-700" />
                    <span>Reiner Text (.txt)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Schnelle Extraktion ohne Formatierung.
                  </p>
                </button>
              </div>
            </div>

            {/* Worker Security & Protection Notice */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                <strong>Intelligente Bildoptimierung:</strong> Kontrast und Schärfe werden vor der
                Texterkennung automatisch optimiert, um selbst bei undeutlichen Scans präzise
                Ergebnisse zu erzielen.
              </span>
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
              onClick={startOcrJob}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <ScanText className="w-4 h-4" />
              <span>Texterkennung jetzt starten</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
