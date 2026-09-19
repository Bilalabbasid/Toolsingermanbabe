'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { FileList } from '@/components/tools/FileList';
import { Button } from '@/components/common/Button';
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
          maxFileSizeMB={500}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="PDF-Dateien hier ablegen"
          subtitle="Wählen Sie zwei oder mehr PDF-Dateien aus (bis zu 500 MB, 100% lokal im Browser verarbeitet)"
          isLocal={true}
        />
      ) : (
        <div className="space-y-4">
          <FileList
            items={files}
            onRemove={removeFile}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onAddFiles={handleFilesSelected}
            acceptedExtensions={['.pdf']}
            title="Ausgewählte PDF-Dokumente"
          />

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Gesamtgröße:{' '}
              <strong className="text-slate-800 font-mono">
                {formatBytes(files.reduce((a, b) => a + b.size, 0))}
              </strong>{' '}
              ({files.length} {files.length === 1 ? 'Dokument' : 'Dokumente'})
            </span>

            <Button
              onClick={mergePdfs}
              disabled={files.length < 2}
              size="lg"
              className="w-full sm:w-auto"
            >
              PDF zusammenfügen ({files.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
