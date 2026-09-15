'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  FileSpreadsheet, 
  Presentation, 
  FileCode,
  BookOpen,
  Download,
  Layers
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import { getClientSubscription } from '@/lib/monetization/subscription';

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
  | 'html-to-pdf'
  | 'doc-to-docx'
  | 'docx-to-doc'
  | 'odt-to-docx'
  | 'docx-to-odt'
  | 'rtf-to-docx'
  | 'txt-to-docx'
  | 'xls-to-xlsx'
  | 'xlsx-to-xls'
  | 'csv-to-xlsx'
  | 'xlsx-to-csv'
  | 'csv-to-pdf'
  | 'ppt-to-pptx'
  | 'pptx-to-ppt'
  | 'odp-to-pptx'
  | 'epub-to-pdf'
  | 'epub-to-txt';

interface DocConvertEngineProps {
  mode: DocConvertMode;
}

export function DocConvertEngine({ mode }: DocConvertEngineProps) {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocrLanguage, setOcrLanguage] = useState<'deu' | 'eng'>('deu');
  const [scanMode, setScanMode] = useState<'layout' | 'text'>('text');

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = getClientSubscription().isPro;
  const limits = getBatchLimits(isPro);

  const getAcceptedExtensions = (): string[] => {
    switch (mode) {
      case 'pdf-to-word':
      case 'pdf-to-excel':
      case 'pdf-to-ppt':
        return ['.pdf'];
      case 'word-to-pdf':
      case 'docx-to-doc':
      case 'docx-to-odt':
        return ['.docx'];
      case 'doc-to-pdf':
      case 'doc-to-docx':
        return ['.doc'];
      case 'odt-to-pdf':
      case 'odt-to-docx':
        return ['.odt'];
      case 'rtf-to-pdf':
      case 'rtf-to-docx':
        return ['.rtf'];
      case 'txt-to-pdf':
      case 'txt-to-docx':
        return ['.txt'];
      case 'html-to-pdf':
        return ['.html', '.htm'];
      case 'excel-to-pdf':
      case 'xlsx-to-xls':
      case 'xlsx-to-csv':
        return ['.xlsx'];
      case 'xls-to-xlsx':
        return ['.xls'];
      case 'csv-to-xlsx':
      case 'csv-to-pdf':
        return ['.csv'];
      case 'ppt-to-pdf':
      case 'pptx-to-ppt':
        return ['.pptx'];
      case 'ppt-to-pptx':
        return ['.ppt'];
      case 'odp-to-pptx':
        return ['.odp'];
      case 'epub-to-pdf':
      case 'epub-to-txt':
        return ['.epub'];
      default:
        return ['.pdf', '.docx', '.xlsx', '.pptx', '.txt'];
    }
  };

  const getTargetExtension = (): string => {
    switch (mode) {
      case 'pdf-to-word':
      case 'doc-to-docx':
      case 'odt-to-docx':
      case 'rtf-to-docx':
      case 'txt-to-docx':
        return 'docx';
      case 'docx-to-doc':
        return 'doc';
      case 'docx-to-odt':
        return 'odt';
      case 'pdf-to-excel':
      case 'xls-to-xlsx':
      case 'csv-to-xlsx':
        return 'xlsx';
      case 'xlsx-to-xls':
        return 'xls';
      case 'xlsx-to-csv':
        return 'csv';
      case 'pdf-to-ppt':
      case 'ppt-to-pptx':
      case 'odp-to-pptx':
        return 'pptx';
      case 'pptx-to-ppt':
        return 'ppt';
      case 'epub-to-txt':
        return 'txt';
      default:
        return 'pdf';
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
      case 'doc-to-docx': return 'office_doc_to_docx';
      case 'docx-to-doc': return 'office_docx_to_doc';
      case 'odt-to-docx': return 'office_odt_to_docx';
      case 'docx-to-odt': return 'office_docx_to_odt';
      case 'rtf-to-docx': return 'office_rtf_to_docx';
      case 'txt-to-docx': return 'office_txt_to_docx';
      case 'xls-to-xlsx': return 'office_xls_to_xlsx';
      case 'xlsx-to-xls': return 'office_xlsx_to_xls';
      case 'csv-to-xlsx': return 'office_csv_to_xlsx';
      case 'xlsx-to-csv': return 'office_xlsx_to_csv';
      case 'csv-to-pdf': return 'office_csv_to_pdf';
      case 'ppt-to-pptx': return 'office_ppt_to_pptx';
      case 'pptx-to-ppt': return 'office_pptx_to_ppt';
      case 'odp-to-pptx': return 'office_odp_to_pptx';
      case 'epub-to-pdf': return 'office_epub_to_pdf';
      case 'epub-to-txt': return 'office_epub_to_txt';
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
      case 'doc-to-docx': return 'Altes DOC in modernes DOCX umwandeln';
      case 'docx-to-doc': return 'DOCX in abwärtskompatibles DOC umwandeln';
      case 'odt-to-docx': return 'OpenDocument (ODT) in Word (DOCX) umwandeln';
      case 'docx-to-odt': return 'Word (DOCX) in OpenDocument (ODT) umwandeln';
      case 'rtf-to-docx': return 'Rich Text (RTF) in Word (DOCX) umwandeln';
      case 'txt-to-docx': return 'Textdatei (TXT) in Word (DOCX) formatieren';
      case 'xls-to-xlsx': return 'Altes XLS in modernes XLSX umwandeln';
      case 'xlsx-to-xls': return 'XLSX in abwärtskompatibles XLS umwandeln';
      case 'csv-to-xlsx': return 'CSV-Tabelle in Excel (XLSX) umwandeln';
      case 'xlsx-to-csv': return 'Excel-Tabelle in CSV exportieren';
      case 'csv-to-pdf': return 'CSV-Tabelle in formatiertes PDF umwandeln';
      case 'ppt-to-pptx': return 'Altes PPT in modernes PPTX umwandeln';
      case 'pptx-to-ppt': return 'PowerPoint (PPTX) als PPT speichern';
      case 'odp-to-pptx': return 'OpenDocument (ODP) in PowerPoint (PPTX) umwandeln';
      case 'epub-to-pdf': return 'EPUB eBook in druckbares PDF umwandeln';
      case 'epub-to-txt': return 'EPUB eBook in reinen Text extrahieren';
      default: return 'Dokument umwandeln';
    }
  };

  const getModeIcon = () => {
    if (mode.includes('excel') || mode.includes('csv') || mode.includes('xls')) return <FileSpreadsheet className="w-5 h-5" />;
    if (mode.includes('ppt') || mode.includes('odp')) return <Presentation className="w-5 h-5" />;
    if (mode.includes('epub')) return <BookOpen className="w-5 h-5" />;
    if (mode.includes('html') || mode.includes('txt')) return <FileCode className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      setSingleFile(files[0]);
      setIsBatchMode(false);
      setError(null);
      setResultBlob(null);
      trackEvent('upload_completed', { mode, size: files[0].size });
    } else {
      const validation = validateBatchFiles(files, isPro);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `doc_batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { mode, count: files.length });
    }
  };

  /**
   * Helper to execute a single document conversion via /api/v1/jobs
   */
  const convertSingleDoc = async (
    file: File,
    onProgress?: (pct: number, statusText?: string) => void,
    signal?: AbortSignal
  ): Promise<{ blob: Blob; fileName: string; size: number }> => {
    onProgress?.(15, 'Dokument wird an Server übertragen...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', getJobType());
    formData.append('targetFormat', getTargetExtension());
    if (mode === 'pdf-to-word') {
      formData.append('language', ocrLanguage);
      formData.append('scanMode', scanMode);
    }

    const res = await fetch('/api/v1/jobs', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server-Fehler: HTTP ${res.status}`);
    }

    const jobData = await res.json();
    const jobId = jobData.jobId;

    onProgress?.(35, 'In Warteschlange...');

    let attempts = 0;
    const maxAttempts = 60;
    let completedJob = null;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((r) => setTimeout(r, 600));

      if (signal?.aborted) {
        throw new Error('Konvertierung abgebrochen.');
      }

      const pollRes = await fetch(`/api/v1/jobs/${jobId}`, { signal });
      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      const currentJob = pollData;

      if (currentJob.status === 'processing') {
        const curProgress = Math.max(35, Math.min(currentJob.progress || 50, 85));
        onProgress?.(curProgress, `Wird transformiert (${curProgress}%)...`);
      } else if (currentJob.status === 'completed') {
        completedJob = currentJob;
        break;
      } else if (currentJob.status === 'failed') {
        throw new Error(currentJob.error || 'Konvertierung fehlgeschlagen.');
      }
    }

    if (!completedJob) {
      throw new Error('Zeitüberschreitung bei der Verarbeitung des Dokuments.');
    }

    onProgress?.(90, 'Ergebnis wird empfangen...');
    const downloadRes = await fetch(completedJob.output.downloadUrl, { signal });
    if (!downloadRes.ok) {
      throw new Error('Download der Datei fehlgeschlagen.');
    }

    const blob = await downloadRes.blob();
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outName = mode === 'pdf-to-word' && completedJob.output.fileName?.endsWith('_ocr.docx')
      ? `coolwave_${baseName}_editierbar.docx`
      : `coolwave_${baseName}.${getTargetExtension()}`;

    onProgress?.(100, 'Fertig');
    return { blob, fileName: outName, size: blob.size };
  };

  // Single file execute
  const executeSingleConversion = async () => {
    if (!singleFile) return;
    setError(null);
    setIsProcessing(true);
    setProgress(15);
    setStatusText('Dokument wird zum sicheren Konvertierungs-Worker übertragen...');
    trackEvent('conversion_started', { mode });

    abortControllerRef.current = new AbortController();

    try {
      const result = await convertSingleDoc(
        singleFile,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusText(msg);
        },
        abortControllerRef.current.signal
      );

      setResultBlob(result.blob);
      setOutputFilename(result.fileName);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { mode, size: result.size });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setError(err.message || 'Fehler bei der Konvertierung.');
      trackEvent('conversion_failed', { mode, error: err.message });
    }
  };

  // Batch execute
  const startBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const tasks = batchItems.map((item) => ({
      id: item.id,
      run: async (signal?: AbortSignal) => {
        if (signal?.aborted) throw new Error('Abgebrochen');
        return await convertSingleDoc(
          item.file,
          (pct, statusText) => {
            setBatchItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress: pct, statusText } : i))
            );
          },
          signal
        );
      },
    }));

    await runConcurrentBatch(tasks, {
      concurrency: limits.clientConcurrency,
      signal: abortControllerRef.current.signal,
      onItemStart: (id) => {
        setBatchItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 10 } : i))
        );
      },
      onItemComplete: (id, result) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  outputBlob: result.blob,
                  outputFileName: result.fileName,
                  outputSize: result.size,
                }
              : i
          )
        );
      },
      onItemError: (id, err) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: 'failed', error: err.message, progress: 0 } : i
          )
        );
      },
    });

    setIsProcessing(false);
  };

  const cancelBatch = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setBatchItems((prev) =>
      prev.map((i) => (i.status === 'processing' || i.status === 'queued' ? { ...i, status: 'cancelled' } : i))
    );
  };

  const clearQueue = () => {
    setBatchItems([]);
    setIsBatchMode(false);
  };

  const removeItem = (id: string) => {
    setBatchItems((prev) => prev.filter((i) => i.id !== id));
  };

  const downloadItem = (item: BatchItem) => {
    if (item.outputBlob && item.outputFileName) {
      downloadBlob(item.outputBlob, item.outputFileName);
    }
  };

  const downloadAllZip = async () => {
    const completedItems = batchItems.filter((i) => i.status === 'completed' && i.outputBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      completedItems.forEach((item) => {
        if (item.outputBlob && item.outputFileName) {
          zip.file(item.outputFileName, item.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `coolwave_dokumente_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setSingleFile(null);
    setResultBlob(null);
    setError(null);
    setIsProcessing(false);
    setProgress(0);
  };

  if (resultBlob && singleFile) {
    return (
      <div className="space-y-4">
        <DownloadBox
          filename={outputFilename}
          originalSizeBytes={singleFile.size}
          resultSizeBytes={resultBlob.size}
          onDownload={() => downloadBlob(resultBlob, outputFilename)}
          onReset={handleResetSingle}
          downloadLabel="Konvertiertes Dokument herunterladen"
        />
        {mode === 'pdf-to-word' && <button
          type="button"
          onClick={() => { setResultBlob(null); setProgress(0); }}
          className="mx-auto block rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
        >
          Mit derselben PDF eine andere Word-Ausgabe erstellen
        </button>}
      </div>
    );
  }

  if (isProcessing && !isBatchMode) {
    return (
      <ProcessingStatus
        progress={progress}
        statusText={statusText}
        onCancel={() => {
          abortControllerRef.current?.abort();
          setIsProcessing(false);
        }}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {mode === 'pptx-to-ppt' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <span className="font-semibold">Hinweis zum veralteten PPT-Format (Office 97–2003):</span>
            <p className="mt-1">
              Das binäre .ppt-Format ist veraltet und wird auf modernen Betriebssystemen und Mobilgeräten häufig blockiert. Für maximale Kompatibilität empfehlen wir die Umwandlung in PDF:{' '}
              <Link href="/de/powerpoint-in-pdf-umwandeln" className="font-medium underline hover:text-amber-950">
                PowerPoint in PDF umwandeln →
              </Link>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isBatchMode && batchItems.length > 0 ? (
        <BatchProcessingQueue
          items={batchItems}
          isProcessing={isProcessing}
          onStartBatch={startBatch}
          onCancelBatch={cancelBatch}
          onClearQueue={clearQueue}
          onRemoveItem={removeItem}
          onDownloadItem={downloadItem}
          onDownloadAllZip={downloadAllZip}
          isZipping={isZipping}
          toolTitle={`Dokumente umwandeln (Stapel · ${getModeLabel()})`}
        />
      ) : !singleFile ? (
        <FileUploader
          acceptedExtensions={getAcceptedExtensions()}
          maxFileSizeMB={limits.maxFileSizeMB}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="Dokumente hier ablegen (Einzel- oder Stapelverarbeitung)"
          subtitle={`Unterstützt: ${getAcceptedExtensions().join(', ').toUpperCase()} • Bis zu ${limits.maxBatchFiles} Dateien gleichzeitig (${isPro ? 'Pro' : 'Kostenlos'})`}
          isLocal={false}
        />
      ) : (
        /* Single File View (Preserved) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              {getModeIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{singleFile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span> • Zielformat:{' '}
                <span className="font-bold text-sky-700 uppercase">.{getTargetExtension()}</span>
              </p>
            </div>
          </div>

          {mode === 'pdf-to-word' && <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
            <label htmlFor="pdf-word-scan-mode" className="mb-2 block font-semibold">Word-Ausgabe für gescannte PDF-Seiten</label>
            <select id="pdf-word-scan-mode" value={scanMode} onChange={event => setScanMode(event.target.value as 'layout' | 'text')} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3">
              <option value="text">Bearbeitbarer Text (OCR, angenähertes Layout)</option>
              <option value="layout">Originalansicht (Seite als nicht bearbeitbares Bild)</option>
            </select>
            {scanMode === 'text' ? <>
              <label htmlFor="pdf-word-language" className="mb-2 mt-4 block font-semibold">Sprache des Textes</label>
              <select id="pdf-word-language" value={ocrLanguage} onChange={event => setOcrLanguage(event.target.value as 'deu' | 'eng')} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3">
                <option value="deu">Deutsch</option><option value="eng">Englisch</option>
              </select>
              <p className="mt-2">Der erkannte Text ist in Word bearbeitbar. Zeilenpositionen und Überschriften werden angenähert; prüfen Sie Namen, Zahlen und Spalten am Original.</p>
            </> : <p className="mt-2">Die gescannte Seite sieht im Word-Dokument wie das Original aus. Ihr Text bleibt ein Bild und ist nicht bearbeitbar.</p>}
          </div>}

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetSingle}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Anderes Dokument wählen
            </button>

            <button
              onClick={executeSingleConversion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{getModeLabel()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
