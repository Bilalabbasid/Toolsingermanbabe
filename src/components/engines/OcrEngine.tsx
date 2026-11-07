'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ScanText,
  Copy,
  Check,
  Languages,
  FileText,
  FileType,
  FileSearch,
  Layers,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { OcrLanguage as OcrLanguageBase, OcrOutputType as OcrOutputTypeBase } from '@/lib/client/ocr/types';

export type OcrLanguage = OcrLanguageBase;
export type OcrOutputType = OcrOutputTypeBase;

interface OcrEngineProps {
  defaultOutputType?: OcrOutputType;
  toolSlug?: string;
}

const LANGUAGES: { id: OcrLanguage; label: string; flag: string }[] = [
  { id: 'deu', label: 'Deutsch (Umlaute & ß)', flag: '🇩🇪' },
  { id: 'eng', label: 'Englisch', flag: '🇬🇧' },
  { id: 'deu+eng', label: 'Deutsch + Englisch', flag: '🌐' },
];

const MAX_FILE_MB = 50;
const MAX_PAGES = 50;
const PREVIEW_CHARS = 5000;

interface OcrResultState {
  blob: Blob;
  fileName: string;
  text: string;
  pageCount: number;
  skippedPages: number;
  meanConfidence: number;
}

export function OcrEngine({ defaultOutputType = 'pdf', toolSlug = 'ocr-pdf' }: OcrEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>('deu');
  const [outputType, setOutputType] = useState<OcrOutputType>(defaultOutputType);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<OcrResultState | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  // Stop a running recognition when the user leaves the page.
  useEffect(() => {
    const cancelled = cancelledRef;
    const processing = processingRef;
    return () => {
      if (processing.current) {
        cancelled.current = true;
        void import('@/lib/client/ocr/tesseract').then((m) => m.terminateOcrWorker());
      }
    };
  }, []);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
    trackEvent('upload_completed', { toolSlug });
  };

  const startOcrJob = async () => {
    if (!file) return;

    cancelledRef.current = false;
    setError(null);
    setIsProcessing(true);
    setProgress(undefined);
    setStatusText('Datei wird lokal vorbereitet …');
    trackEvent('conversion_started', { toolSlug, language, outputType });

    try {
      const { runOcr } = await import('@/lib/client/ocr/runOcr');
      const res = await runOcr(file, {
        language,
        outputType,
        isCancelled: () => cancelledRef.current,
        onProgress: ({ fraction, text }) => {
          setProgress(Math.round(fraction * 100));
          setStatusText(text);
        },
      });
      setResult(res);
      trackEvent('conversion_completed', { toolSlug, pages: res.pageCount });
    } catch (err) {
      if (cancelledRef.current || (err as Error)?.name === 'OcrCancelledError') {
        setError('Die Texterkennung wurde abgebrochen.');
      } else {
        console.error('[OcrEngine Error]:', err);
        setError((err as Error)?.message || 'Fehler bei der Texterkennung.');
        trackEvent('conversion_failed', { toolSlug });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    void import('@/lib/client/ocr/tesseract').then((m) => m.terminateOcrWorker());
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBlob(result.blob, result.fileName);
    trackEvent('download_completed', { toolSlug });
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsProcessing(false);
    setProgress(0);
    setStatusText('');
    setResult(null);
    setError(null);
  };

  // Completed view
  if (result && file) {
    const preview = result.text.length > PREVIEW_CHARS ? `${result.text.slice(0, PREVIEW_CHARS)} …` : result.text;
    return (
      <div className="w-full space-y-4">
        <DownloadBox
          filename={result.fileName}
          resultSizeBytes={result.blob.size}
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

        {(result.skippedPages > 0 || (result.meanConfidence > 0 && result.meanConfidence < 60) || !result.text.trim()) && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1">
              {result.skippedPages > 0 && (
                <p>
                  Es wurden die ersten {result.pageCount} Seiten verarbeitet; {result.skippedPages} weitere Seiten
                  überschreiten das Browser-Limit von {MAX_PAGES} Seiten.
                </p>
              )}
              {!result.text.trim() ? (
                <p>Es wurde kein Text erkannt. Ist die Vorlage scharf, ausreichend groß und richtig gedreht?</p>
              ) : (
                result.meanConfidence < 60 && (
                  <p>
                    Die Erkennungssicherheit ist gering ({Math.round(result.meanConfidence)} %). Ein schärferer Scan
                    (mind. 300 DPI) oder die passende Dokumentsprache verbessert das Ergebnis.
                  </p>
                )
              )}
            </div>
          </div>
        )}

        {result.text.trim() && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vorschau des erkannten Textes
                {result.pageCount > 1 && ` (${result.pageCount} Seiten)`}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'Gesamten Text kopieren'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={preview}
              rows={10}
              aria-label="Erkannter Text"
              className="w-full mt-3 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono leading-relaxed"
            />
          </div>
        )}
      </div>
    );
  }

  // Processing view
  if (isProcessing) {
    return (
      <ProcessingStatus
        progress={progress}
        statusText={statusText}
        onCancel={handleCancel}
        isLargeFile={Boolean(file && (file.size > 5 * 1024 * 1024 || /\.pdf$/i.test(file.name)))}
      />
    );
  }

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tif', '.tiff']}
          maxFileSizeMB={MAX_FILE_MB}
          onFilesSelected={handleFileSelected}
          title="Scan, Bild oder PDF für Texterkennung ablegen"
          subtitle="Optische Zeichenerkennung (OCR) direkt in Ihrem Browser – Ihre Dokumente werden nicht hochgeladen"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">{file.name}</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  <p className="text-[11px] text-slate-500 mt-1">Unsichtbare Textebene über dem Original-Scan.</p>
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
                  <p className="text-[11px] text-slate-500 mt-1">Editierbarer Text mit Absätzen und Seitenumbrüchen.</p>
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
                  <p className="text-[11px] text-slate-500 mt-1">Schnelle Extraktion ohne Formatierung.</p>
                </button>
              </div>
            </div>

            {/* Local processing notice */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100 % lokal:</strong> Seiten werden mit ca. 300 DPI gerastert und mit Tesseract direkt in
                Ihrem Browser erkannt. Beim ersten Start werden OCR-Engine und Sprachdaten einmalig geladen. PDFs
                werden bis {MAX_PAGES} Seiten verarbeitet – je Seite dauert die Erkennung einige Sekunden.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
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
