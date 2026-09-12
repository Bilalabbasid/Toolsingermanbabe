'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ArrowUp, ArrowDown, Trash2, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface MergingFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export function PdfMergeEngine() {
  const [files, setFiles] = useState<MergingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('coolwave_zusammengefuegt.pdf');

  const handleFilesSelected = (newFiles: File[]) => {
    const mapped = newFiles.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...mapped]);
    trackEvent('upload_completed', { toolSlug: 'pdf-zusammenfuegen', count: newFiles.length });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText('PDF-Dokumente werden im Browser geladen...');
    trackEvent('conversion_started', { toolSlug: 'pdf-zusammenfuegen', count: files.length });

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        setStatusText(`Lese Dokument ${i + 1} von ${files.length}: ${item.name}`);
        const fileBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        setProgress(10 + Math.round(((i + 1) / files.length) * 75));
      }

      setStatusText('Gesamtdokument wird optimiert und gespeichert...');
      setProgress(90);
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

      setMergedBlob(blob);
      setOutputFilename(`coolwave_zusammengefuegt_${Date.now()}.pdf`);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-zusammenfuegen' });
    } catch (err: unknown) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler beim Zusammenfügen. Bitte überprüfen Sie, ob keine der PDF-Dateien passwortgeschützt oder beschädigt ist.');
      trackEvent('conversion_failed', { toolSlug: 'pdf-zusammenfuegen' });
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-zusammenfuegen' });
  };

  const handleReset = () => {
    setFiles([]);
    setMergedBlob(null);
    setProgress(0);
    setIsProcessing(false);
  };

  if (mergedBlob) {
    const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={totalOriginalSize}
        resultSizeBytes={mergedBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="Zusammengefügtes PDF herunterladen"
      />
    );
  }

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full">
      {files.length === 0 ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={50}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="PDF-Dateien hier ablegen"
          subtitle="Wählen Sie zwei oder mehr PDF-Dateien aus, die Sie zusammenführen möchten"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ausgewählte Dokumente ({files.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Passen Sie die Reihenfolge per Pfeiltasten an.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="add-more-pdfs"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Weitere PDF hinzufügen</span>
              </label>
              <input
                id="add-more-pdfs"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(Array.from(e.target.files));
                  }
                }}
              />
            </div>
          </div>

          {/* Files Reorder List */}
          <div className="divide-y divide-slate-100 my-4">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="p-2 rounded bg-sky-50 text-sky-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatBytes(item.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    title="Nach oben verschieben"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                    title="Nach unten verschieben"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 ml-1"
                    title="Entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Gesamtgröße: {formatBytes(files.reduce((a, b) => a + b.size, 0))}
            </span>

            <button
              onClick={mergePdfs}
              disabled={files.length < 2}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <span>PDF zusammenfügen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
