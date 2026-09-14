'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  FileText, 
  Hash, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type HeaderFooterMode = 'numbering' | 'header' | 'footer';

interface PdfHeaderFooterEngineProps {
  defaultMode?: HeaderFooterMode;
  toolSlug?: string;
}

export function PdfHeaderFooterEngine({ 
  defaultMode = 'numbering',
  toolSlug = 'pdf-seiten-nummerieren'
}: PdfHeaderFooterEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<HeaderFooterMode>(defaultMode);

  // Numbering configuration
  const [numberFormat, setNumberFormat] = useState('Seite {n} von {total}');
  const [numberPosition, setNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right'>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);

  // Header / Footer text configuration
  const [leftText, setLeftText] = useState('');
  const [centerText, setCenterText] = useState('');
  const [rightText, setRightText] = useState('');
  const [drawDivider, setDrawDivider] = useState(false);

  // Styling & Options
  const [fontSize, setFontSize] = useState(9);
  const [fontFamily, setFontFamily] = useState<'helvetica' | 'times' | 'courier'>('helvetica');
  const [colorHex, setColorHex] = useState<'gray' | 'black' | 'blue'>('gray');
  const [marginOffset, setMarginOffset] = useState(25); // pt
  const [skipFirstPage, setSkipFirstPage] = useState(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      if (mode === 'header' && !centerText) setCenterText(files[0].name.replace(/\.[^/.]+$/, ''));
      if (mode === 'footer' && !rightText) setRightText('Seite {n}');
      trackEvent('upload_completed', { toolSlug });
    }
  };

  const getFontRgb = () => {
    switch (colorHex) {
      case 'black': return rgb(0.05, 0.05, 0.05);
      case 'gray': return rgb(0.4, 0.45, 0.5);
      case 'blue': return rgb(0.1, 0.35, 0.75);
      default: return rgb(0.4, 0.45, 0.5);
    }
  };

  const executeProcessing = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusText('PDF-Dokument wird analysiert...');
    trackEvent('conversion_started', { toolSlug, mode });

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdf.getPages();
      const totalPages = pages.length;

      let font;
      if (fontFamily === 'times') font = await pdf.embedFont(StandardFonts.TimesRoman);
      else if (fontFamily === 'courier') font = await pdf.embedFont(StandardFonts.Courier);
      else font = await pdf.embedFont(StandardFonts.Helvetica);

      setProgress(40);
      setStatusText(`Seiten (${totalPages}) werden aktualisiert...`);

      const textColor = getFontRgb();
      const todayStr = new Date().toLocaleDateString('de-DE');
      const docTitle = file.name.replace(/\.[^/.]+$/, '');

      // Helper to replace dynamic placeholders
      const resolveText = (pattern: string, pageIdx: number) => {
        const pageNum = pageIdx + startNumber;
        return pattern
          .replace(/{n}/g, String(pageNum))
          .replace(/{total}/g, String(totalPages))
          .replace(/{date}/g, todayStr)
          .replace(/{title}/g, docTitle);
      };

      pages.forEach((page, idx) => {
        if (skipFirstPage && idx === 0) return;

        const { width, height } = page.getSize();
        const sideMargin = 35;

        if (mode === 'numbering') {
          const text = resolveText(numberFormat, idx);
          const textWidth = font.widthOfTextAtSize(text, fontSize);

          let x = (width - textWidth) / 2;
          let y = marginOffset;

          if (numberPosition === 'bottom-left') {
            x = sideMargin;
            y = marginOffset;
          } else if (numberPosition === 'bottom-right') {
            x = width - sideMargin - textWidth;
            y = marginOffset;
          } else if (numberPosition === 'top-center') {
            x = (width - textWidth) / 2;
            y = height - marginOffset;
          } else if (numberPosition === 'top-right') {
            x = width - sideMargin - textWidth;
            y = height - marginOffset;
          }

          page.drawText(text, { x, y, size: fontSize, font, color: textColor });
        } else {
          // Header or Footer
          const isHeader = mode === 'header';
          const y = isHeader ? height - marginOffset : marginOffset;

          // Draw optional divider line
          if (drawDivider) {
            const lineY = isHeader ? y - 6 : y + fontSize + 4;
            page.drawLine({
              start: { x: sideMargin, y: lineY },
              end: { x: width - sideMargin, y: lineY },
              thickness: 0.5,
              color: rgb(0.8, 0.85, 0.9),
            });
          }

          // Left text
          if (leftText.trim()) {
            const resolved = resolveText(leftText, idx);
            page.drawText(resolved, { x: sideMargin, y, size: fontSize, font, color: textColor });
          }

          // Center text
          if (centerText.trim()) {
            const resolved = resolveText(centerText, idx);
            const w = font.widthOfTextAtSize(resolved, fontSize);
            page.drawText(resolved, { x: (width - w) / 2, y, size: fontSize, font, color: textColor });
          }

          // Right text
          if (rightText.trim()) {
            const resolved = resolveText(rightText, idx);
            const w = font.widthOfTextAtSize(resolved, fontSize);
            page.drawText(resolved, { x: width - sideMargin - w, y, size: fontSize, font, color: textColor });
          }
        }
      });

      setProgress(85);
      setStatusText('PDF wird gespeichert...');

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);

      const prefix = mode === 'numbering' ? 'nummeriert' : mode === 'header' ? 'kopfzeile' : 'fusszeile';
      setOutputFilename(`coolwave_${prefix}_${file.name}`);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug, mode });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert(`Fehler beim Bearbeiten der PDF: ${err?.message || 'Unbekannter Fehler'}`);
      trackEvent('conversion_failed', { toolSlug, mode });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug });
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
        downloadLabel="Fertige PDF herunterladen"
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
          title={
            mode === 'numbering' 
              ? 'PDF für Seitennummerierung ablegen' 
              : mode === 'header' 
                ? 'PDF für Kopfzeile ablegen' 
                : 'PDF für Fußzeile ablegen'
          }
          subtitle="Passen Sie Seitenzahlen, Dokumenttitel oder Vertraulichkeitshinweise flexibel an"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* File Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="py-6 space-y-6 max-w-xl">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode('numbering')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'numbering' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="w-4 h-4" />
                Seitenzahlen
              </button>
              <button
                type="button"
                onClick={() => setMode('header')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'header' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                Kopfzeile
              </button>
              <button
                type="button"
                onClick={() => setMode('footer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'footer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                Fußzeile
              </button>
            </div>

            {/* Mode-Specific Settings */}
            {mode === 'numbering' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Zahlenformat
                  </label>
                  <input
                    type="text"
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="z. B. Seite {n} von {total}"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      'Seite {n} von {total}',
                      '{n}/{total}',
                      'Seite {n}',
                      '{n}',
                      '- {n} -',
                    ].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setNumberFormat(fmt)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Position auf der Seite
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bottom-left', label: 'Unten Links' },
                      { id: 'bottom-center', label: 'Unten Mitte' },
                      { id: 'bottom-right', label: 'Unten Rechts' },
                      { id: 'top-center', label: 'Oben Mitte' },
                      { id: 'top-right', label: 'Oben Rechts' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setNumberPosition(pos.id as any)}
                        className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all text-center ${
                          numberPosition === pos.id
                            ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Platzhalter verfügbar: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&#123;n&#125;</code> (Seite), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&#123;total&#125;</code> (Gesamt), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&#123;date&#125;</code> (Datum), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">&#123;title&#125;</code> (Titel).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Links
                    </label>
                    <input
                      type="text"
                      value={leftText}
                      onChange={(e) => setLeftText(e.target.value)}
                      placeholder="z. B. {title}"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mitte
                    </label>
                    <input
                      type="text"
                      value={centerText}
                      onChange={(e) => setCenterText(e.target.value)}
                      placeholder="z. B. VERTRAULICH"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Rechts
                    </label>
                    <input
                      type="text"
                      value={rightText}
                      onChange={(e) => setRightText(e.target.value)}
                      placeholder="z. B. Seite {n}"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={drawDivider}
                      onChange={(e) => setDrawDivider(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    Dezente horizontale Trennlinie zeichnen
                  </label>
                </div>
              </div>
            )}

            {/* Typography & Layout Controls */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Schriftgröße: {fontSize}pt
                </label>
                <input
                  type="range"
                  min="7"
                  max="14"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Schriftart
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                >
                  <option value="helvetica">Helvetica (Standard)</option>
                  <option value="times">Times Roman (Serif)</option>
                  <option value="courier">Courier (Monospace)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farbe
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'gray', label: 'Grau', color: 'bg-slate-500' },
                    { id: 'black', label: 'Schwarz', color: 'bg-black' },
                    { id: 'blue', label: 'Blau', color: 'bg-blue-600' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorHex(c.id as any)}
                      className={`flex-1 py-1.5 rounded border text-[11px] font-semibold transition-all ${
                        colorHex === c.id ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Deckblatt überspringen (Erste Seite bleibt ohne Aufdruck)
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={executeProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {mode === 'numbering' ? 'Seiten nummerieren' : mode === 'header' ? 'Kopfzeile anwenden' : 'Fußzeile anwenden'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
