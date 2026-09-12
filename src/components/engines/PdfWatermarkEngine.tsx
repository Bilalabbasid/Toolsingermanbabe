'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Stamp, FileText } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export function PdfWatermarkEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('VERTRAULICH');
  const [opacity, setOpacity] = useState(30); // percent
  const [fontSize, setFontSize] = useState(50);
  const [isDiagonal, setIsDiagonal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      trackEvent('upload_completed', { toolSlug: 'pdf-wasserzeichen' });
    }
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    setProgress(20);
    setStatusText('PDF wird geladen...');
    trackEvent('conversion_started', { toolSlug: 'pdf-wasserzeichen' });

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      setProgress(50);
      setStatusText(`Wasserzeichen wird auf ${pages.length} Seiten angebracht...`);

      const alpha = opacity / 100;
      const angle = isDiagonal ? degrees(45) : degrees(0);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helveticaBold.heightAtSize(fontSize);

        // Center calculation
        const x = width / 2 - (isDiagonal ? textWidth / 2.8 : textWidth / 2);
        const y = height / 2 - (isDiagonal ? 0 : textHeight / 2);

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaBold,
          color: rgb(0.8, 0.1, 0.1),
          opacity: alpha,
          rotate: angle,
        });
      });

      setProgress(85);
      setStatusText('PDF wird finalisiert...');

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);
      setOutputFilename(`coolwave_wasserzeichen_${file.name}`);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-wasserzeichen' });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler beim Anbringen des Wasserzeichens.');
      trackEvent('conversion_failed', { toolSlug: 'pdf-wasserzeichen' });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-wasserzeichen' });
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setIsProcessing(false);
  };

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={resultBlob.size}
        onDownload={handleDownload}
        onReset={handleReset}
        downloadLabel="PDF mit Wasserzeichen herunterladen"
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
          title="PDF für Wasserzeichen ablegen"
          subtitle="Fügen Sie Status-Texte wie „Vertraulich“, „Entwurf“ oder Ihren Namen ein"
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

          <div className="py-6 space-y-5 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Wasserzeichen-Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['VERTRAULICH', 'ENTWURF', 'KOPIE', 'MUSTER', 'NUR ZUR ANSICHT'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWatermarkText(preset)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deckkraft: {opacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Schriftgröße: {fontSize}pt
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ausrichtung
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDiagonal(true)}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                    isDiagonal
                      ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  45° Diagonal
                </button>
                <button
                  type="button"
                  onClick={() => setIsDiagonal(false)}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                    !isDiagonal
                      ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Horizontal (0°)
                </button>
              </div>
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
              onClick={applyWatermark}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <Stamp className="w-4 h-4" />
              <span>Wasserzeichen anwenden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
