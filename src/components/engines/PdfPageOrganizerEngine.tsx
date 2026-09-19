'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileText, 
  Trash2, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Scissors 
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type OrganizeMode = 'extract' | 'delete' | 'reorder';

interface PdfPageOrganizerEngineProps {
  mode: OrganizeMode;
}

export function PdfPageOrganizerEngine({ mode }: PdfPageOrganizerEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setIsProcessing(true);
    setProgress(30);
    setStatusText('PDF-Seiten werden analysiert...');

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      const initialOrder = Array.from({ length: count }, (_, i) => i + 1);
      setPageOrder(initialOrder);

      if (mode === 'extract') {
        setSelectedPages([1]);
        setRangeInput('1');
      } else if (mode === 'delete') {
        setSelectedPages([]);
      }

      setIsProcessing(false);
      trackEvent('upload_completed', { mode, pageCount: count });
    } catch (err) {
      console.error(err);
      setError('Die PDF-Datei konnte nicht geladen werden. Möglicherweise ist sie passwortgeschützt.');
      setIsProcessing(false);
      setFile(null);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    if (mode === 'extract') {
      const updated = selectedPages.includes(pageNum)
        ? selectedPages.filter((p) => p !== pageNum)
        : [...selectedPages, pageNum].sort((a, b) => a - b);
      setSelectedPages(updated);
      setRangeInput(updated.join(', '));
    } else if (mode === 'delete') {
      const updated = selectedPages.includes(pageNum)
        ? selectedPages.filter((p) => p !== pageNum)
        : [...selectedPages, pageNum].sort((a, b) => a - b);
      setSelectedPages(updated);
    }
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    // Parse range e.g. "1, 3-5, 8"
    try {
      const parts = val.split(',').map((p) => p.trim()).filter(Boolean);
      const pages = new Set<number>();
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= pageCount) pages.add(i);
            }
          }
        } else {
          const num = parseInt(part, 10);
          if (!isNaN(num) && num >= 1 && num <= pageCount) {
            pages.add(num);
          }
        }
      }
      setSelectedPages(Array.from(pages).sort((a, b) => a - b));
    } catch {
      // ignore parsing errors while typing
    }
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageOrder.length) return;
    const updated = [...pageOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPageOrder(updated);
  };

  const executeOperation = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    setProgress(20);
    setStatusText('PDF-Seiten werden neu strukturiert...');
    trackEvent('page_organize_started', { mode });

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      let pagesToInclude: number[] = [];

      if (mode === 'extract') {
        if (selectedPages.length === 0) {
          setError('Bitte wählen Sie mindestens eine Seite zum Extrahieren aus.');
          setIsProcessing(false);
          return;
        }
        pagesToInclude = selectedPages;
      } else if (mode === 'delete') {
        if (selectedPages.length >= pageCount) {
          setError('Sie können nicht alle Seiten des Dokuments löschen.');
          setIsProcessing(false);
          return;
        }
        pagesToInclude = pageOrder.filter((p) => !selectedPages.includes(p));
      } else if (mode === 'reorder') {
        pagesToInclude = pageOrder;
      }

      setProgress(50);
      setStatusText('Seiten werden in neues Dokument kopiert...');

      // Copy pages (0-indexed)
      const pageIndices = pagesToInclude.map((p) => p - 1);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      setProgress(80);
      setStatusText('PDF wird gespeichert...');

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);

      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const suffix = mode === 'extract' ? 'extrahiert' : mode === 'delete' ? 'bereinigt' : 'sortiert';
      setOutputFilename(`coolwave_${base}_${suffix}.pdf`);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('page_organize_completed', { mode, outputPages: pagesToInclude.length });
    } catch (err) {
      console.error(err);
      setError('Fehler bei der Seitenbearbeitung.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { mode });
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setProgress(0);
    setIsProcessing(false);
    setSelectedPages([]);
    setPageOrder([]);
    setError(null);
  };

  return (
    <div className="w-full">
      {!file && (
        <FileUploader
          onFilesSelected={handleFileSelected}
          allowMultiple={false}
          maxFileSizeMB={500}
          acceptedExtensions={['.pdf']}
          title="PDF-Dokument hier ablegen"
          subtitle="Wählen Sie eine PDF-Datei aus (bis zu 500 MB, 100% lokal im Browser verarbeitet)"
          isLocal={true}
        />
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {file && !resultBlob && !isProcessing && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {/* Document Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{file.name}</h3>
                <p className="text-xs text-slate-500">
                  {pageCount} {pageCount === 1 ? 'Seite' : 'Seiten'} • {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            >
              Anderes Dokument wählen
            </button>
          </div>

          {/* Mode 1: Extract Pages */}
          {mode === 'extract' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seitenbereich eingeben oder unten anklicken:
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => handleRangeInputChange(e.target.value)}
                  placeholder="z. B. 1, 3-5, 8"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Klicken Sie auf einzelne Seitenkacheln, um sie zur Auswahl hinzuzufügen.
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                  const isSelected = selectedPages.includes(pageNum);
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => togglePageSelection(pageNum)}
                      className={`p-3 rounded-xl text-center font-bold text-xs transition-all border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-normal opacity-80 mb-0.5">Seite</div>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={executeOperation}
                  className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{selectedPages.length} {selectedPages.length === 1 ? 'Seite' : 'Seiten'} extrahieren & PDF erstellen</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Delete Pages */}
          {mode === 'delete' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Klicken Sie auf die Seiten, die Sie <strong>löschen</strong> möchten. Markierte Seiten werden rot durchgestrichen.
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                  const isMarked = selectedPages.includes(pageNum);
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => togglePageSelection(pageNum)}
                      className={`p-3 rounded-xl text-center font-bold text-xs transition-all border ${
                        isMarked
                          ? 'bg-rose-50 text-rose-700 border-rose-300 line-through opacity-75'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-normal mb-0.5">Seite</div>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={executeOperation}
                  disabled={selectedPages.length === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{selectedPages.length} {selectedPages.length === 1 ? 'Seite' : 'Seiten'} unwiderruflich löschen & PDF speichern</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Reorder Pages */}
          {mode === 'reorder' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800">
                Nutzen Sie die Pfeile unter den Seitenkacheln, um Seiten nach links oder rechts zu verschieben.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                {pageOrder.map((pageNum, index) => (
                  <div
                    key={`${pageNum}-${index}`}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div className="text-center mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Position {index + 1}</span>
                      <div className="text-base font-black text-slate-900 mt-0.5">Seite {pageNum}</div>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => movePage(index, 'left')}
                        disabled={index === 0}
                        aria-label="Nach links verschieben"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(index, 'right')}
                        disabled={index === pageOrder.length - 1}
                        aria-label="Nach rechts verschieben"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={executeOperation}
                  className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Neue Seitenreihenfolge speichern & Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isProcessing && (
        <ProcessingStatus
          progress={progress}
          statusText={statusText}
        />
      )}

      {resultBlob && (
        <div className="space-y-4">
          <DownloadBox
            filename={outputFilename}
            resultSizeBytes={resultBlob.size}
            onDownload={handleDownload}
            onReset={handleReset}
            downloadLabel="Bearbeitetes PDF jetzt herunterladen"
          />

          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Weiteres PDF bearbeiten</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
