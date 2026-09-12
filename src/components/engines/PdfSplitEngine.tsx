'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { Split, FileText, AlertCircle } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function PdfSplitEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('1');
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setError(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setTotalPages(count);
      setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : '1');
      trackEvent('upload_completed', { toolSlug: 'pdf-teilen', pages: count });
    } catch {
      setError('Konnte die Seitenzahl der PDF-Datei nicht ermitteln. Möglicherweise ist die Datei verschlüsselt.');
    }
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(maxPages, end); p++) {
            pages.add(p - 1); // 0-indexed for pdf-lib
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const executeSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(15);
    setStatusText('PDF wird im Browser vorbereitet...');
    trackEvent('conversion_started', { toolSlug: 'pdf-teilen', mode: splitMode });

    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (splitMode === 'range') {
        const selectedIndices = parsePageRange(pageRange, totalPages);
        if (selectedIndices.length === 0) {
          setError('Ungültiger Seitenbereich. Bitte prüfen Sie Ihre Eingabe.');
          setIsProcessing(false);
          return;
        }

        setStatusText('Seiten werden in neues Dokument extrahiert...');
        setProgress(50);
        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(sourcePdf, selectedIndices);
        copied.forEach((page) => newPdf.addPage(page));

        setProgress(85);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        setResultBlob(blob);
        setOutputFilename(`coolwave_extrahiert_${Date.now()}.pdf`);
      } else {
        // Extract all pages into a zip
        setStatusText('Seiten werden einzeln getrennt & komprimiert...');
        const zip = new JSZip();

        for (let i = 0; i < totalPages; i++) {
          const singlePdf = await PDFDocument.create();
          const [page] = await singlePdf.copyPages(sourcePdf, [i]);
          singlePdf.addPage(page);
          const bytes = await singlePdf.save();
          zip.file(`seite_${i + 1}.pdf`, bytes);
          setProgress(15 + Math.round(((i + 1) / totalPages) * 70));
        }

        setStatusText('ZIP-Archiv wird erstellt...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob(zipBlob);
        setOutputFilename(`coolwave_seiten_einzeln_${Date.now()}.zip`);
      }

      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-teilen' });
    } catch (err) {
      console.error(err);
      setError('Fehler beim Teilen der Datei. Bitte versuchen Sie es erneut.');
      setIsProcessing(false);
      trackEvent('conversion_failed', { toolSlug: 'pdf-teilen' });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-teilen' });
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setResultBlob(null);
    setIsProcessing(false);
  };

  if (resultBlob) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file?.size}
        resultSizeBytes={resultBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="Geteiltes Dokument herunterladen"
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
          title="PDF zum Teilen ablegen"
          subtitle="Wählen Sie eine PDF-Datei aus, um einzelne Seiten zu extrahieren"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Insgesamt {totalPages} Seiten
              </p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Teilungs-Modus wählen
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSplitMode('range')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    splitMode === 'range'
                      ? 'border-sky-600 bg-sky-50/40 text-sky-900 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">Seitenbereich extrahieren</div>
                  <div className="text-xs text-slate-500 mt-1">
                    z.B. Seiten 1 bis 3 in ein neues PDF zusammenfassen.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('all')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    splitMode === 'all'
                      ? 'border-sky-600 bg-sky-50/40 text-sky-900 ring-1 ring-sky-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">Alle Seiten trennen (ZIP)</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Jede Seite als eigene PDF-Datei im ZIP-Archiv speichern.
                  </div>
                </button>
              </div>
            </div>

            {splitMode === 'range' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Gewünschte Seiten eingeben (1 bis {totalPages}):
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="z.B. 1-3, 5"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[11px] text-slate-400 mt-1.5 block">
                  Beispiel: „1-3, 5“ extrahiert die Seiten 1, 2, 3 und 5.
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={executeSplit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <Split className="w-4 h-4" />
              <span>PDF jetzt teilen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
