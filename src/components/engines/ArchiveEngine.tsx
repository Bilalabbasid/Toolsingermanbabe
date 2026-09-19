'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Archive,
  FolderArchive,
  FileCheck,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  FileCode,
  Image as ImageIcon,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { useClientSubscription } from '@/hooks/useClientSubscription';
import { featureFlags } from '@/config/featureFlags.config';

export type ArchiveToolId =
  | 'zip-erstellen'
  | 'zip-entpacken'
  | '7z-entpacken'
  | 'tar-entpacken'
  | 'gzip-entpacken';

interface ArchiveEngineProps {
  toolId: ArchiveToolId;
}

export function ArchiveEngine({ toolId }: ArchiveEngineProps) {
  const isPro = useClientSubscription().isPro;
  const expandedAccess = isPro || !featureFlags.enableStripeCheckout;

  const isCreate = toolId === 'zip-erstellen';

  // State for ZIP creation (multi-file)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState('archiv');

  // State for Archive extraction (single archive file)
  const [archiveFile, setArchiveFile] = useState<File | null>(null);

  // Common processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Extracted manifest preview
  const [extractedFiles, setExtractedFiles] = useState<Array<{ name: string; size: number }>>([]);

  // Restore unfinished or completed job if window was reloaded/reopened
  useEffect(() => {
    if (isCreate) return;
    try {
      const saved = sessionStorage.getItem(`coolwave_archive_${toolId}`);
      if (!saved) return;
      const { jobId, filename } = JSON.parse(saved);
      if (!jobId) return;

      let isCancelled = false;
      setIsProcessing(true);
      setStatusText('Vorherige Entpackung wird im Hintergrund fortgeführt...');
      setProgress(40);

      const restore = async () => {
        let attempts = 0;
        while (attempts < 120 && !isCancelled) {
          attempts++;
          await new Promise((r) => setTimeout(r, 1000));
          if (isCancelled) return;
          try {
            const pollRes = await fetch(`/api/v1/jobs/${jobId}`);
            if (!pollRes.ok) {
              sessionStorage.removeItem(`coolwave_archive_${toolId}`);
              setIsProcessing(false);
              return;
            }
            const currentJob = await pollRes.json();
            if (currentJob.status === 'processing') {
              const curPct = Math.max(35, Math.min(currentJob.progress || 50, 90));
              setProgress(curPct);
              setStatusText(`Wird dekomprimiert (${curPct}%)...`);
            } else if (currentJob.status === 'completed') {
              const dlRes = await fetch(currentJob.output.downloadUrl || `/api/v1/jobs/${jobId}/download`);
              if (dlRes.ok) {
                const blob = await dlRes.blob();
                setResultBlob(blob);
                setOutputFilename(currentJob.output?.fileName || `${filename}.extracted.zip`);
                sessionStorage.removeItem(`coolwave_archive_${toolId}`);
              }
              setIsProcessing(false);
              return;
            } else if (currentJob.status === 'failed' || currentJob.status === 'expired') {
              sessionStorage.removeItem(`coolwave_archive_${toolId}`);
              setIsProcessing(false);
              return;
            }
          } catch {
            // Ignore network hiccup
          }
        }
        setIsProcessing(false);
      };

      void restore();
      return () => {
        isCancelled = true;
      };
    } catch {}
  }, [toolId, isCreate]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (isCreate) {
      // Append files to create list
      setSelectedFiles((prev) => [...prev, ...files]);
      setError(null);
      setResultBlob(null);
      trackEvent('upload_completed', { toolId, count: files.length });
    } else {
      // Single archive file for extraction
      const archive = files[0];
      setArchiveFile(archive);
      setError(null);
      setResultBlob(null);
      setExtractedFiles([]);
      trackEvent('upload_completed', { toolId, size: archive.size });
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // ZIP ERSTELLEN (In-Browser via JSZip)
  // -------------------------------------------------------------
  const handleCreateZip = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(20);
    setStatusText('ZIP-Archiv wird im Browser gepackt...');
    setError(null);

    try {
      const zip = new JSZip();
      for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i];
        zip.file(f.name, f);
        setProgress(20 + Math.round(((i + 1) / selectedFiles.length) * 50));
      }

      setStatusText('Archiv wird komprimiert...');
      setProgress(75);

      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setProgress(75 + Math.round((metadata.percent / 100) * 20));
        }
      );

      const filename = `${zipName.trim() || 'archiv'}.zip`;
      setResultBlob(blob);
      setOutputFilename(filename);
      setProgress(100);
      trackEvent('conversion_completed', { toolId, fileCount: selectedFiles.length, outputSize: blob.size });
    } catch (err: any) {
      console.error('[Archive Create Error]:', err);
      setError(err?.message || 'Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // ARCHIV ENTPACKEN (Server-side isolated execution)
  // -------------------------------------------------------------
  const handleExtractArchive = async () => {
    if (!archiveFile) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Archiv wird übertragen...');
    setError(null);

    const formData = new FormData();
    formData.append('file', archiveFile);
    formData.append('type', toolId);

    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server-Fehler: HTTP ${res.status}`);
      }

      const { jobId } = await res.json();
      try {
        sessionStorage.setItem(`coolwave_archive_${toolId}`, JSON.stringify({ jobId, filename: archiveFile.name }));
      } catch {}
      setStatusText('Archiv wird sicher entpackt & geprüft...');
      setProgress(30);

      let attempts = 0;
      const maxAttempts = 60;
      let completedJob = null;

      while (attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 600));

        const pollRes = await fetch(`/api/v1/jobs/${jobId}`);
        if (!pollRes.ok) continue;

        const currentJob = await pollRes.json();

        if (currentJob.status === 'processing') {
          const curPct = Math.max(35, Math.min(currentJob.progress || 50, 90));
          setProgress(curPct);
          setStatusText(`Wird dekomprimiert (${curPct}%)...`);
        } else if (currentJob.status === 'completed') {
          completedJob = currentJob;
          break;
        } else if (currentJob.status === 'failed') {
          throw new Error(currentJob.error || 'Entpacken fehlgeschlagen.');
        }
      }

      if (!completedJob) {
        throw new Error('Zeitüberschreitung beim Entpacken des Archivs.');
      }

      setProgress(90);
      setStatusText('Entpackte Dateien werden vorbereitet...');

      const downloadRes = await fetch(completedJob.output.downloadUrl);
      if (!downloadRes.ok) {
        throw new Error('Fehler beim Abrufen des entpackten Archivs.');
      }

      const blob = await downloadRes.blob();
      try {
        sessionStorage.removeItem(`coolwave_archive_${toolId}`);
      } catch {}
      setResultBlob(blob);
      setOutputFilename(completedJob.output.fileName);

      // If output is zip, inspect its internal files to display file tree
      if (completedJob.output.fileName.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const loaded = await zip.loadAsync(blob);
          const manifest: Array<{ name: string; size: number }> = [];
          loaded.forEach((relPath, zipEntry) => {
            if (!zipEntry.dir) {
              manifest.push({ name: relPath, size: (zipEntry as any)._data?.uncompressedSize || 0 });
            }
          });
          setExtractedFiles(manifest);
        } catch {
          // ignore manifest parse error
        }
      }

      setProgress(100);
      trackEvent('conversion_completed', { toolId, inputSize: archiveFile.size, outputSize: blob.size });
    } catch (err: any) {
      console.error('[Archive Extract Error]:', err);
      setError(err?.message || 'Fehler beim Entpacken des Archivs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSelectedFiles([]);
    setArchiveFile(null);
    setResultBlob(null);
    setExtractedFiles([]);
    setError(null);
    setProgress(0);
  };

  const getAcceptedExtensions = (): string[] => {
    switch (toolId) {
      case 'zip-erstellen':
        return ['*'];
      case 'zip-entpacken':
        return ['.zip'];
      case '7z-entpacken':
        return ['.7z'];
      case 'tar-entpacken':
        return ['.tar', '.tar.gz', '.tgz'];
      case 'gzip-entpacken':
        return ['.gz', '.gzip'];
      default:
        return ['.zip', '.7z', '.tar', '.gz'];
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload area */}
      {selectedFiles.length === 0 && !archiveFile && !resultBlob && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          acceptedExtensions={getAcceptedExtensions()}
          allowMultiple={isCreate}
          title={
            isCreate
              ? 'Dateien hier ablegen, um ein ZIP zu erstellen'
              : `Archivdatei (${toolId.split('-')[0].toUpperCase()}) hier ablegen zum Entpacken`
          }
          subtitle={
            isCreate
              ? 'Bündeln Sie beliebig viele Dateien bis zu 500 MB direkt und geschützt in Ihrem Browser.'
              : 'Sichere Dekomprimierung von Archiven bis zu 50 MB mit Schutz vor Decompression-Bombs.'
          }
          maxFileSizeMB={isCreate ? 500 : 50}
        />
      )}

      {/* ZIP Erstellen: File list preview & Action */}
      {isCreate && selectedFiles.length > 0 && !resultBlob && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-sky-600" />
              <div className="text-sm font-bold text-slate-800">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'Datei' : 'Dateien'} ausgewählt
              </div>
            </div>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Alle entfernen
            </button>
          </div>

          {/* Archive Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Archivname:</label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500">
              <input
                type="text"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                placeholder="archiv"
              />
              <span className="px-3 text-xs font-mono text-slate-400 bg-slate-50 border-l border-slate-200">.zip</span>
            </div>
          </div>

          {/* Files List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">{f.name}</span>
                  <span className="text-2xs text-slate-400">({formatBytes(f.size)})</span>
                </div>
                <button
                  onClick={() => removeSelectedFile(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Datei entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateZip}
              className="flex-1 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ZIP-Archiv erstellen & bündeln</span>
            </button>
            <label className="cursor-pointer py-3.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <span>+ Mehr Dateien</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Archive Entpacken: Single file preview & Action */}
      {!isCreate && archiveFile && !resultBlob && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{archiveFile.name}</div>
                <div className="text-xs text-slate-500">{formatBytes(archiveFile.size)}</div>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Anderes Archiv wählen
            </button>
          </div>

          <button
            onClick={handleExtractArchive}
            className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Jetzt sicher entpacken</span>
          </button>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <ProcessingStatus
          progress={progress}
          statusText={statusText}
          isLargeFile={Boolean(archiveFile && archiveFile.size > 15 * 1024 * 1024)}
          isBackgroundSafe={!isCreate}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Archivverarbeitung fehlgeschlagen</div>
            <div className="text-xs text-rose-600">{error}</div>
            <button
              onClick={resetAll}
              className="mt-2 text-xs font-bold text-rose-700 underline hover:no-underline"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Result State */}
      {resultBlob && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-base font-bold text-slate-800">
                {isCreate ? 'ZIP-Archiv erfolgreich erstellt!' : 'Archiv erfolgreich entpackt!'}
              </div>
              <div className="text-xs text-slate-500">
                Größe: {formatBytes(resultBlob.size)}
                {extractedFiles.length > 0 && ` • ${extractedFiles.length} Dateien extrahiert`}
              </div>
            </div>
          </div>

          {/* Extracted file manifest tree */}
          {extractedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enthaltene Dateien ({extractedFiles.length})
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {extractedFiles.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-white transition-colors">
                    <span className="font-mono text-slate-700 truncate">{item.name}</span>
                    {item.size > 0 && (
                      <span className="text-2xs text-slate-400 shrink-0 ml-2">{formatBytes(item.size)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => downloadBlob(resultBlob, outputFilename)}
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{outputFilename} herunterladen ({formatBytes(resultBlob.size)})</span>
            </button>
            <button
              onClick={resetAll}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Weiteres Archiv bearbeiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
