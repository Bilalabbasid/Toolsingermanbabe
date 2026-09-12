'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  FileSpreadsheet, 
  Presentation, 
  FileCode 
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type DocConvertMode = 
  | 'pdf-to-word' 
  | 'word-to-pdf' 
  | 'pdf-to-excel' 
  | 'excel-to-pdf' 
  | 'pdf-to-ppt' 
  | 'ppt-to-pdf'
  | 'doc-to-pdf'
  | 'odt-to-pdf'
  | 'rtf-to-pdf'
  | 'txt-to-pdf'
  | 'html-to-pdf';

interface DocConvertEngineProps {
  mode: DocConvertMode;
}

export function DocConvertEngine({ mode }: DocConvertEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const getAcceptedExtensions = (): string[] => {
    switch (mode) {
      case 'pdf-to-word':
      case 'pdf-to-excel':
      case 'pdf-to-ppt':
        return ['.pdf'];
      case 'word-to-pdf':
        return ['.docx'];
      case 'doc-to-pdf':
        return ['.doc'];
      case 'odt-to-pdf':
        return ['.odt'];
      case 'rtf-to-pdf':
        return ['.rtf'];
      case 'txt-to-pdf':
        return ['.txt'];
      case 'html-to-pdf':
        return ['.html', '.htm'];
      case 'excel-to-pdf':
        return ['.xlsx', '.xls'];
      case 'ppt-to-pdf':
        return ['.pptx', '.ppt'];
      default:
        return ['.pdf'];
    }
  };

  const getTargetExtension = (): string => {
    switch (mode) {
      case 'pdf-to-word': return 'docx';
      case 'pdf-to-excel': return 'xlsx';
      case 'pdf-to-ppt': return 'pptx';
      default: return 'pdf';
    }
  };

  const getJobType = (): string => {
    switch (mode) {
      case 'pdf-to-word': return 'office_pdf_to_docx';
      case 'word-to-pdf': return 'office_docx_to_pdf';
      case 'pdf-to-excel': return 'office_pdf_to_xlsx';
      case 'excel-to-pdf': return 'office_xlsx_to_pdf';
      case 'pdf-to-ppt': return 'office_pdf_to_pptx';
      case 'ppt-to-pdf': return 'office_pptx_to_pdf';
      case 'doc-to-pdf': return 'office_doc_to_pdf';
      case 'odt-to-pdf': return 'office_odt_to_pdf';
      case 'rtf-to-pdf': return 'office_rtf_to_pdf';
      case 'txt-to-pdf': return 'office_txt_to_pdf';
      case 'html-to-pdf': return 'office_html_to_pdf';
      default: return 'office_convert';
    }
  };

  const getModeLabel = (): string => {
    switch (mode) {
      case 'pdf-to-word': return 'In Word umwandeln (DOCX)';
      case 'word-to-pdf': return 'In PDF umwandeln';
      case 'pdf-to-excel': return 'In Excel umwandeln (XLSX)';
      case 'excel-to-pdf': return 'In PDF umwandeln';
      case 'pdf-to-ppt': return 'In PowerPoint umwandeln (PPTX)';
      case 'ppt-to-pdf': return 'In PDF umwandeln';
      case 'doc-to-pdf': return 'Klassisches DOC in PDF umwandeln';
      case 'odt-to-pdf': return 'OpenDocument in PDF umwandeln';
      case 'rtf-to-pdf': return 'Rich-Text in PDF umwandeln';
      case 'txt-to-pdf': return 'Textdatei in PDF layouten';
      case 'html-to-pdf': return 'HTML-Code in PDF rendern';
      default: return 'Dokument umwandeln';
    }
  };

  const getModeIcon = () => {
    if (mode.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    if (mode.includes('ppt')) return <Presentation className="w-5 h-5" />;
    if (mode.includes('html') || mode.includes('txt')) return <FileCode className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResultBlob(null);
    trackEvent('upload_completed', { mode, size: files[0].size });
  };

  const executeConversion = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    setProgress(15);
    setStatusText('Dokument wird zum sicheren Konvertierungs-Worker übertragen...');
    trackEvent('conversion_started', { mode });

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', getJobType());
      formData.append('targetFormat', getTargetExtension());

      // 1. Enqueue job to worker
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server-Fehler: HTTP ${res.status}`);
      }

      const jobData = await res.json();
      const jobId = jobData.jobId;

      setProgress(30);
      setStatusText('Auftrag in der Warteschlange. Worker bereitet Konvertierung vor...');

      // 2. Poll job status
      let attempts = 0;
      const maxAttempts = 60; // 60 * 600ms = 36 seconds
      let completedJob = null;

      while (attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 600));

        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Konvertierung abgebrochen.');
        }

        const pollRes = await fetch(`/api/v1/jobs/${jobId}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!pollRes.ok) continue;

        const pollData = await pollRes.json();
        const currentJob = pollData.job;

        if (currentJob.status === 'processing') {
          const currentProgress = Math.max(35, Math.min(currentJob.progress || 50, 85));
          setProgress(currentProgress);
          setStatusText(`Worker verarbeitet Dokument (${currentProgress}%)...`);
        } else if (currentJob.status === 'completed') {
          completedJob = currentJob;
          break;
        } else if (currentJob.status === 'failed') {
          throw new Error(currentJob.error || 'Die Konvertierung ist fehlgeschlagen.');
        }
      }

      if (!completedJob) {
        throw new Error('Zeitüberschreitung bei der Verarbeitung des Dokuments.');
      }

      // 3. Fetch completed binary output
      setProgress(90);
      setStatusText('Ergebnis wird heruntergeladen...');

      const downloadRes = await fetch(`/api/v1/jobs/${jobId}/download`, {
        signal: abortControllerRef.current.signal,
      });

      if (!downloadRes.ok) {
        throw new Error('Die konvertierte Datei konnte nicht vom Speicher abgerufen werden.');
      }

      const blob = await downloadRes.blob();
      const filename = completedJob.output?.fileName || `coolwave_${file.name.replace(/\.[^/.]+$/, '')}.${getTargetExtension()}`;

      setResultBlob(blob);
      setOutputFilename(filename);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { mode, sizeBytes: blob.size });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[DocConvertEngine Error]:', err);
      const msg = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.';
      setError(msg);
      setIsProcessing(false);
      trackEvent('conversion_failed', { mode, error: msg });
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !outputFilename) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { mode, filename: outputFilename });
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setFile(null);
    setResultBlob(null);
    setOutputFilename('');
    setError(null);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Konvertierungsfehler</h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Schließen
          </button>
        </div>
      )}

      {!file && !resultBlob && (
        <FileUploader
          acceptedExtensions={getAcceptedExtensions()}
          maxFileSizeMB={50}
          allowMultiple={false}
          onFilesSelected={handleFileSelected}
        />
      )}

      {file && !resultBlob && !isProcessing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {getModeIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                  {file.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • Ziel: .{getTargetExtension().toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Anderes Dokument wählen"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Decoupled Worker-Engine bereit • 100% Dateischutz
            </div>

            <button
              onClick={executeConversion}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition flex items-center justify-center gap-2 text-base"
            >
              {getModeIcon()}
              <span>{getModeLabel()}</span>
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <ProcessingStatus
          progress={progress}
          statusText={statusText}
        />
      )}

      {resultBlob && (
        <DownloadBox
          filename={outputFilename}
          resultSizeBytes={resultBlob.size}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
