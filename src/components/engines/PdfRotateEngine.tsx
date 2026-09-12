'use client';

import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { RotateCw, RotateCcw, FileText, Check } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function PdfRotateEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      trackEvent('upload_completed', { toolSlug: 'pdf-drehen', size: files[0].size });
    }
  };

  const executeRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(25);
    setStatusText('PDF-Seiten werden geladen...');
    trackEvent('conversion_started', { toolSlug: 'pdf-drehen', angle: rotationAngle });

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdf.getPages();

      setProgress(60);
      setStatusText(`Drehe ${pages.length} Seiten um ${rotationAngle}°...`);

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      setProgress(85);
      setStatusText('Dokument wird gespeichert...');

      const rotatedBytes = await pdf.save();
      const blob = new Blob([rotatedBytes as unknown as BlobPart], { type: 'application/pdf' });
      setRotatedBlob(blob);
      setOutputFilename(`coolwave_gedreht_${file.name}`);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-drehen' });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler beim Drehen der PDF. Bitte prüfen Sie, ob die Datei geschützt ist.');
      trackEvent('conversion_failed', { toolSlug: 'pdf-drehen' });
    }
  };

  const handleDownload = () => {
    if (!rotatedBlob) return;
    downloadBlob(rotatedBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-drehen' });
  };

  const handleReset = () => {
    setFile(null);
    setRotatedBlob(null);
    setIsProcessing(false);
  };

  if (rotatedBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={rotatedBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="Gedrehtes PDF herunterladen"
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
          title="PDF zum Drehen ablegen"
          subtitle="Drehen Sie querliegende oder auf dem Kopf stehende Seiten dauerhaft"
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

          <div className="py-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Drehwinkel wählen
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRotationAngle(90)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  rotationAngle === 90
                    ? 'border-sky-600 bg-sky-50/50 text-sky-950 ring-1 ring-sky-600 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RotateCw className="w-5 h-5 mx-auto mb-2 text-sky-600" />
                <span className="text-sm">90° Rechts</span>
                <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                  Im Uhrzeigersinn
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRotationAngle(180)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  rotationAngle === 180
                    ? 'border-sky-600 bg-sky-50/50 text-sky-950 ring-1 ring-sky-600 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RotateCw className="w-5 h-5 mx-auto mb-2 text-sky-600" />
                <span className="text-sm">180° Drehen</span>
                <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                  Auf den Kopf
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRotationAngle(270)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  rotationAngle === 270
                    ? 'border-sky-600 bg-sky-50/50 text-sky-950 ring-1 ring-sky-600 font-bold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RotateCcw className="w-5 h-5 mx-auto mb-2 text-sky-600" />
                <span className="text-sm">90° Links</span>
                <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                  Gegen Uhrzeigersinn
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={executeRotate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              <span>Seiten dauerhaft drehen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
