'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Stamp, FileText, Image as ImageIcon, Check, Type } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

type WatermarkMode = 'text' | 'image';

export function PdfWatermarkEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  
  // Text watermark state
  const [watermarkText, setWatermarkText] = useState('VERTRAULICH');
  const [textColor, setTextColor] = useState<'red' | 'gray' | 'blue' | 'black'>('red');
  const [opacity, setOpacity] = useState(30); // percent
  const [fontSize, setFontSize] = useState(50);
  const [isDiagonal, setIsDiagonal] = useState(true);
  const [skipFirstPage, setSkipFirstPage] = useState(false);

  // Image watermark state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(40); // percent of page width

  // Processing state
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

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    }
  };

  const getColorRgb = () => {
    switch (textColor) {
      case 'red': return rgb(0.85, 0.15, 0.15);
      case 'gray': return rgb(0.45, 0.45, 0.45);
      case 'blue': return rgb(0.1, 0.35, 0.8);
      case 'black': return rgb(0.1, 0.1, 0.1);
      default: return rgb(0.85, 0.15, 0.15);
    }
  };

  const applyWatermark = async () => {
    if (!file) return;
    if (mode === 'text' && !watermarkText.trim()) return;
    if (mode === 'image' && !imageFile) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusText('PDF wird geladen...');
    trackEvent('conversion_started', { toolSlug: 'pdf-wasserzeichen', mode });

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdf.getPages();

      setProgress(40);
      setStatusText(`Wasserzeichen wird auf ${pages.length} Seiten aufgebracht...`);

      const alpha = opacity / 100;
      const angle = isDiagonal ? degrees(45) : degrees(0);

      if (mode === 'text') {
        const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const color = getColorRgb();

        pages.forEach((page, idx) => {
          if (skipFirstPage && idx === 0) return;
          const { width, height } = page.getSize();
          const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = helveticaBold.heightAtSize(fontSize);

          // Center positioning
          const x = width / 2 - (isDiagonal ? textWidth / 2.8 : textWidth / 2);
          const y = height / 2 - (isDiagonal ? 0 : textHeight / 2);

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font: helveticaBold,
            color,
            opacity: alpha,
            rotate: angle,
          });
        });
      } else if (mode === 'image' && imageFile) {
        const imgBuffer = await imageFile.arrayBuffer();
        let embeddedImage;
        if (imageFile.type === 'image/png' || imageFile.name.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdf.embedPng(imgBuffer);
        } else {
          embeddedImage = await pdf.embedJpg(imgBuffer);
        }

        pages.forEach((page, idx) => {
          if (skipFirstPage && idx === 0) return;
          const { width, height } = page.getSize();
          const targetWidth = (width * imageScale) / 100;
          const targetHeight = (embeddedImage.height / embeddedImage.width) * targetWidth;

          const x = (width - targetWidth) / 2;
          const y = (height - targetHeight) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: targetWidth,
            height: targetHeight,
            opacity: alpha,
          });
        });
      }

      setProgress(85);
      setStatusText('PDF wird gespeichert...');

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
    setImageFile(null);
    setImagePreview(null);
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
          maxFileSizeMB={500}
          onFilesSelected={handleFileSelected}
          title="PDF für Wasserzeichen ablegen"
          subtitle="Fügen Sie Wasserzeichen ein (bis zu 500 MB, 100% lokal im Browser verarbeitet)"
          isLocal={true}
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

          {/* Mode Switcher */}
          <div className="py-6 space-y-6 max-w-xl">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-4 h-4" />
                Text-Wasserzeichen
              </button>
              <button
                type="button"
                onClick={() => setMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Logo / Bild-Wasserzeichen
              </button>
            </div>

            {mode === 'text' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Wasserzeichen-Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="z. B. VERTRAULICH"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['VERTRAULICH', 'ENTWURF', 'KOPIE', 'MUSTER', 'GEPRÜFT'].map((preset) => (
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

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Farbe
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'red', label: 'Rot', color: 'bg-red-500' },
                      { id: 'gray', label: 'Grau', color: 'bg-slate-500' },
                      { id: 'blue', label: 'Blau', color: 'bg-blue-600' },
                      { id: 'black', label: 'Schwarz', color: 'bg-black' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTextColor(c.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          textColor === c.id ? 'border-sky-600 ring-2 ring-sky-200 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${c.color}`} />
                        {c.label}
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
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Logo / Stempelbild (PNG oder JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageSelected}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                  {imagePreview && (
                    <div className="mt-3 p-3 border border-slate-200 rounded-xl inline-block bg-slate-50">
                      <img src={imagePreview} alt="Vorschau des Wasserzeichen-Logos" className="max-h-24 max-w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Deckkraft: {opacity}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bildgröße: {imageScale}% der Seitenbreite
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Skip first page checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Erste Seite überspringen (Deckblatt ohne Wasserzeichen)
              </label>
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
              disabled={mode === 'image' && !imageFile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors disabled:opacity-50"
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
