'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Info
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type MetadataMode = 'view' | 'strip';

interface PdfMetadataEngineProps {
  mode: MetadataMode;
}

interface ParsedMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
}

export function PdfMetadataEngine({ mode }: PdfMetadataEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError(null);
    setIsProcessing(true);
    setProgress(30);
    setStatusText('Metadaten werden ausgelesen...');

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const meta: ParsedMetadata = {
        title: pdf.getTitle() || 'Nicht hinterlegt',
        author: pdf.getAuthor() || 'Nicht hinterlegt',
        subject: pdf.getSubject() || 'Nicht hinterlegt',
        keywords: pdf.getKeywords() ? [pdf.getKeywords()!] : [],
        creator: pdf.getCreator() || 'Nicht hinterlegt',
        producer: pdf.getProducer() || 'Nicht hinterlegt',
        creationDate: pdf.getCreationDate() ? pdf.getCreationDate()!.toLocaleString('de-DE') : 'Nicht hinterlegt',
        modificationDate: pdf.getModificationDate() ? pdf.getModificationDate()!.toLocaleString('de-DE') : 'Nicht hinterlegt',
        pageCount: pdf.getPageCount(),
      };

      setMetadata(meta);
      setIsProcessing(false);
      trackEvent('metadata_inspected', { mode });
    } catch (err) {
      console.error(err);
      setError('Metadaten konnten nicht gelesen werden. Möglicherweise ist die Datei verschlüsselt.');
      setIsProcessing(false);
      setFile(null);
    }
  };

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executeStripMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(30);
    setStatusText('Metadaten und Tracking-Tags werden bereinigt...');
    trackEvent('metadata_strip_started');

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Erase all metadata headers
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setCreator('CoolWave Privacy Engine');
      pdf.setProducer('CoolWave Privacy Engine');

      setProgress(75);
      setStatusText('Dokument wird anonymisiert gespeichert...');

      const pdfBytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);

      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setOutputFilename(`coolwave_${base}_anonymisiert.pdf`);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('metadata_strip_completed');
    } catch (err) {
      console.error(err);
      setError('Fehler beim Entfernen der Metadaten.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, outputFilename);
    trackEvent('download_completed', { mode: 'strip' });
  };

  const handleReset = () => {
    setFile(null);
    setMetadata(null);
    setResultBlob(null);
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
          title="PDF-Dokument hier ablegen"
          subtitle={
            mode === 'view'
              ? 'PDF wählen, um verborgene Metadaten anzuzeigen'
              : 'PDF wählen, um alle Autoren- & Ersteller-Metadaten restlos zu löschen'
          }
        />
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {file && metadata && !resultBlob && !isProcessing && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{file.name}</h3>
                <p className="text-xs text-slate-500">
                  {metadata.pageCount} {metadata.pageCount === 1 ? 'Seite' : 'Seiten'} • {formatBytes(file.size)}
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

          {/* Metadata Display Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enthaltene Dokumenten-Metadaten:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Titel:</span>
                  <span className="font-semibold text-slate-800">{metadata.title}</span>
                </div>
                {metadata.title !== 'Nicht hinterlegt' && (
                  <button
                    onClick={() => handleCopy('title', metadata.title)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Kopieren"
                  >
                    {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Autor / Verfasser:</span>
                  <span className="font-semibold text-slate-800">{metadata.author}</span>
                </div>
                {metadata.author !== 'Nicht hinterlegt' && (
                  <button
                    onClick={() => handleCopy('author', metadata.author)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Kopieren"
                  >
                    {copiedKey === 'author' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Thema / Betreff:</span>
                  <span className="font-semibold text-slate-800">{metadata.subject}</span>
                </div>
                {metadata.subject !== 'Nicht hinterlegt' && (
                  <button
                    onClick={() => handleCopy('subject', metadata.subject)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Kopieren"
                  >
                    {copiedKey === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Ersteller-Software (Creator):</span>
                  <span className="font-semibold text-slate-800">{metadata.creator}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">PDF-Producer:</span>
                  <span className="font-semibold text-slate-800">{metadata.producer}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Erstellungsdatum:</span>
                  <span className="font-semibold text-slate-800">{metadata.creationDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action according to mode */}
          {mode === 'strip' ? (
            <div className="pt-2">
              <button
                onClick={executeStripMetadata}
                className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Alle Metadaten restlos löschen & anonymisiertes PDF herunterladen</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Möchten Sie diese sensiblen Angaben vor der Weitergabe entfernen? Nutzen Sie unser Werkzeug „PDF Metadaten entfernen“.
              </span>
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
            downloadLabel="Anonymisiertes PDF jetzt herunterladen"
          />

          <div className="text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Weiteres PDF bereinigen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
