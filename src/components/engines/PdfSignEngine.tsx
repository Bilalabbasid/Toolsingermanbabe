'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PenTool, FileText, CheckCircle2, ShieldCheck, RotateCcw, Upload, Type } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

type SignMode = 'draw' | 'type' | 'upload';

export function PdfSignEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [signMode, setSignMode] = useState<SignMode>('draw');
  const [signerName, setSignerName] = useState('');
  const [reason, setReason] = useState('Vertragsabschluss & Dokumentenfreigabe');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      trackEvent('upload_completed', { toolSlug: 'pdf-signieren' });
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; // CoolWave Blue signature ink
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Upload signature image handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (imgFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedSignatureUrl(reader.result as string);
      };
      reader.readAsDataURL(imgFile);
    }
  };

  // Render typed signature onto an offscreen canvas
  const getTypedSignatureDataUrl = (): string | null => {
    if (!typedSignature.trim()) return null;
    const offscreen = document.createElement('canvas');
    offscreen.width = 400;
    offscreen.height = 120;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0284c7';
    ctx.font = 'italic 42px "Brush Script MT", "Segoe Script", cursive, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, 30, 60);
    return offscreen.toDataURL('image/png');
  };

  const handleExecute = async () => {
    if (!file) return;

    let signaturePngBase64: string | undefined;

    if (signMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        setError('Bitte zeichnen Sie Ihre Unterschrift in das vorgesehene Feld.');
        return;
      }
      signaturePngBase64 = canvasRef.current.toDataURL('image/png');
    } else if (signMode === 'type') {
      const dataUrl = getTypedSignatureDataUrl();
      if (!dataUrl) {
        setError('Bitte geben Sie Ihren Namen für die Signatur ein.');
        return;
      }
      signaturePngBase64 = dataUrl;
    } else if (signMode === 'upload') {
      if (!uploadedSignatureUrl) {
        setError('Bitte laden Sie eine Bilddatei Ihrer Unterschrift hoch.');
        return;
      }
      signaturePngBase64 = uploadedSignatureUrl;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(20);
    setStatusText('Signatur und SHA-256 Integritätsstempel werden generiert...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'sign');
      if (signaturePngBase64) {
        formData.append('signature', signaturePngBase64);
      }
      formData.append('signerName', signerName.trim() || 'CoolWave Benutzer');
      formData.append('reason', reason.trim() || 'Dokumentenfreigabe');

      setProgress(55);

      const res = await fetch('/api/v1/pdf/security', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Fehler beim Signieren des PDFs.';
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // Fallback
        }
        throw new Error(errMessage);
      }

      setProgress(85);
      setStatusText('Kryptografische Signatur wird eingebettet...');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let outName = `signiert_${file.name}`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) outName = decodeURIComponent(match[1]);
      }

      setResultBlob(blob);
      setOutputFilename(outName);
      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-signieren' });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Fehler beim Signieren.';
      setError(msg);
      setIsProcessing(false);
      trackEvent('conversion_failed', { toolSlug: 'pdf-signieren' });
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { toolSlug: 'pdf-signieren' });
  };

  const handleReset = () => {
    setFile(null);
    setSignerName('');
    setTypedSignature('');
    setUploadedSignatureUrl(null);
    clearCanvas();
    setResultBlob(null);
    setError(null);
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
        downloadLabel="Signiertes PDF herunterladen"
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
          title="PDF zum Signieren ablegen"
          subtitle="Rechtssichere digitale Signatur mit SHA-256 Integritätsprüfung erstellen"
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

          <div className="py-6 space-y-6 max-w-lg">
            {/* Signature Creation Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Unterschrift erstellen
              </label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    signMode === 'draw'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Zeichnen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('type')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    signMode === 'type'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Tippen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('upload')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    signMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bild laden</span>
                </button>
              </div>

              {/* Mode: Draw */}
              {signMode === 'draw' && (
                <div className="space-y-2">
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={460}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 touch-none"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                        Hier mit Maus oder Touchpad unterschreiben...
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Unterschrift löschen</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: Type */}
              {signMode === 'type' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Vorname Nachname eingeben..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {typedSignature && (
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-center">
                      <span className="text-3xl text-sky-700 italic font-serif">
                        {typedSignature}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode: Upload */}
              {signMode === 'upload' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleSignatureUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                  {uploadedSignatureUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedSignatureUrl}
                        alt="Hochgeladene Unterschrift Vorschau"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audit Details */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Name des Unterzeichners
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="z. B. Max Mustermann"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Signaturgrund / Verwendungszweck
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="z. B. Geprüft und freigegeben"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Verification badge preview info */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Digitale CoolWave Prüfmarke</span>
              </div>
              <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                Das Dokument erhält auf der letzten Seite einen fälschungssicheren Prüfstempel
                inklusive aktuellem Zeitstempel und SHA-256 Integritätshash.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={handleExecute}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PDF jetzt signieren</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
