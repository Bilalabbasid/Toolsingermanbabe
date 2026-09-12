'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FileImage, 
  RefreshCw 
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface PdfToImageEngineProps {
  targetFormat: 'JPG' | 'PNG';
}

export function PdfToImageEngine({ targetFormat }: PdfToImageEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [firstPagePreview, setFirstPagePreview] = useState<string | null>(null);
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
    setProgress(20);
    setStatusText('PDF wird analysiert & Vorschau generiert...');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const buffer = await f.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const count = pdf.numPages;
      setPageCount(count);

      // Render first page preview
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page1.render({ canvasContext: ctx, viewport }).promise;
        setFirstPagePreview(canvas.toDataURL('image/jpeg', 0.8));
      }

      setIsProcessing(false);
      trackEvent('upload_completed', { targetFormat, pageCount: count });
    } catch (err) {
      console.error(err);
      setError('Die PDF-Datei konnte nicht gerendert werden. Eventuell ist sie passwortgeschützt.');
      setIsProcessing(false);
      setFile(null);
    }
  };

  const executeRasterization = async () => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    setProgress(10);
    setStatusText('PDF-Seiten werden als Bilder gerendert...');
    trackEvent('conversion_started', { targetFormat });

    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const count = pdf.numPages;

      const mimeType = targetFormat === 'JPG' ? 'image/jpeg' : 'image/png';
      const extension = targetFormat.toLowerCase();
      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

      if (count === 1) {
        // Single page: direct image download
        setProgress(50);
        setStatusText('Seite 1 wird gerendert...');
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x high resolution
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        if (targetFormat === 'JPG') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport }).promise;

        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Bild-Generierung fehlgeschlagen');
          setResultBlob(blob);
          setOutputFilename(`coolwave_${base}.${extension}`);
          setProgress(100);
          setIsProcessing(false);
          trackEvent('conversion_completed', { targetFormat, pages: 1 });
        }, mimeType, targetFormat === 'JPG' ? 0.92 : undefined);
      } else {
        // Multi-page: render all pages and bundle into ZIP
        const zip = new JSZip();

        for (let i = 1; i <= count; i++) {
          const currentProgress = 10 + Math.round((i / count) * 75);
          setProgress(currentProgress);
          setStatusText(`Seite ${i} von ${count} wird gerendert...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          if (targetFormat === 'JPG') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: ctx, viewport }).promise;

          const dataUrl = canvas.toDataURL(mimeType, targetFormat === 'JPG' ? 0.92 : undefined);
          const base64Data = dataUrl.split(',')[1];
          const padIndex = String(i).padStart(2, '0');
          zip.file(`seite_${padIndex}.${extension}`, base64Data, { base64: true });
        }

        setProgress(90);
        setStatusText('ZIP-Archiv wird erstellt...');

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob(zipBlob);
        setOutputFilename(`coolwave_${base}_${targetFormat.toLowerCase()}.zip`);
        setProgress(100);
        setIsProcessing(false);
        trackEvent('conversion_completed', { targetFormat, pages: count });
      }
    } catch (err) {
      console.error(err);
      setError('Fehler bei der Umwandlung der PDF in Bilder.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { targetFormat });
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setFirstPagePreview(null);
    setPageCount(0);
    setProgress(0);
    setIsProcessing(false);
    setError(null);
  };

  return (
    <div className="w-full">
      {!file && (
        <FileUploader
          onFilesSelected={handleFileSelected}
          allowMultiple={false}
          maxFileSizeMB={50}
          acceptedExtensions={['.pdf']}
          title={`PDF in ${targetFormat} umwandeln`}
          subtitle={`Wählen Sie eine PDF-Datei, um alle Seiten als ${targetFormat} zu exportieren`}
        />
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {file && !resultBlob && !isProcessing && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <FileImage className="w-5 h-5" />
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
              Anderes PDF wählen
            </button>
          </div>

          {/* First Page Preview */}
          {firstPagePreview && (
            <div className="flex flex-col items-center p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Vorschau (Seite 1 von {pageCount}):
              </span>
              <img
                src={firstPagePreview}
                alt="PDF Vorschau"
                className="max-h-64 rounded-lg shadow-sm border border-slate-200 object-contain"
              />
            </div>
          )}

          <div>
            <button
              onClick={executeRasterization}
              className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              <span>
                {pageCount === 1 
                  ? `Als hochauflösendes ${targetFormat} umwandeln`
                  : `Alle ${pageCount} Seiten in ${targetFormat} umwandeln (ZIP-Download)`
                }
              </span>
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
        <div className="space-y-4">
          <DownloadBox
            filename={outputFilename}
            resultSizeBytes={resultBlob.size}
            onDownload={handleDownload}
            onReset={handleReset}
            downloadLabel={
              outputFilename.endsWith('.zip')
                ? 'ZIP-Archiv mit allen Bildern herunterladen'
                : `${targetFormat}-Bild jetzt herunterladen`
            }
          />

          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Weiteres PDF in Bilder umwandeln</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
