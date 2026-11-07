'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Archive,
  FolderArchive,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { ExtractedEntry } from '@/lib/client/archive/safety';

export type ArchiveToolId =
  | 'zip-erstellen'
  | 'zip-entpacken'
  | '7z-entpacken'
  | 'tar-entpacken'
  | 'gzip-entpacken';

interface ArchiveEngineProps {
  toolId: ArchiveToolId;
}

/** Client-side limits (browser memory). */
const MAX_CREATE_TOTAL_BYTES = 1024 * 1024 * 1024;
const MAX_ARCHIVE_MB = 500;
const MAX_LISTED_ENTRIES = 500;

const ACCEPTED: Record<ArchiveToolId, string[]> = {
  'zip-erstellen': ['*'],
  'zip-entpacken': ['.zip'],
  '7z-entpacken': ['.7z', '.rar'],
  'tar-entpacken': ['.tar', '.tgz', '.gz', '.tbz', '.tbz2', '.bz2', '.txz', '.xz'],
  'gzip-entpacken': ['.gz', '.gzip', '.tgz'],
};

const FORMAT_LABEL: Record<ArchiveToolId, string> = {
  'zip-erstellen': 'ZIP',
  'zip-entpacken': 'ZIP',
  '7z-entpacken': '7z/RAR',
  'tar-entpacken': 'TAR',
  'gzip-entpacken': 'GZIP',
};

function fileNameOf(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

function archiveBaseName(name: string): string {
  return name.replace(/\.(tar\.(gz|bz2|xz)|tgz|tbz2?|txz|zip|7z|rar|tar|gz|gzip|bz2|xz)$/i, '') || 'entpackt';
}

export function ArchiveEngine({ toolId }: ArchiveEngineProps) {
  const isCreate = toolId === 'zip-erstellen';

  // ZIP creation (multi-file)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState('archiv');

  // Extraction (single archive)
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ExtractedEntry[]>([]);
  const [extractNote, setExtractNote] = useState<string | null>(null);

  // Common state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(true);
  const [isZipping, setIsZipping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const totalSelectedBytes = useMemo(() => selectedFiles.reduce((s, f) => s + f.size, 0), [selectedFiles]);
  const totalExtractedBytes = useMemo(() => entries.reduce((s, e) => s + e.size, 0), [entries]);
  const hasExtractResult = !isCreate && entries.length > 0;

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setResultBlob(null);

    if (isCreate) {
      setSelectedFiles((prev) => [...prev, ...files]);
      trackEvent('upload_completed', { toolId, count: files.length });
    } else {
      const archive = files[0];
      setArchiveFile(archive);
      setEntries([]);
      setExtractNote(null);
      trackEvent('upload_completed', { toolId, size: archive.size });
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // ZIP ERSTELLEN (100 % im Browser via JSZip)
  // -------------------------------------------------------------
  const handleCreateZip = async () => {
    if (selectedFiles.length === 0) return;
    if (totalSelectedBytes > MAX_CREATE_TOTAL_BYTES) {
      setError(
        `Die ausgewählten Dateien sind zusammen ${formatBytes(totalSelectedBytes)} groß. Im Browser können maximal ${formatBytes(MAX_CREATE_TOTAL_BYTES)} gebündelt werden.`
      );
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusText('ZIP-Archiv wird lokal in Ihrem Browser gepackt …');
    setError(null);
    trackEvent('conversion_started', { toolId, fileCount: selectedFiles.length });

    try {
      const { createZipBlob } = await import('@/lib/client/archive/extract');
      const blob = await createZipBlob(
        selectedFiles.map((f) => ({ path: f.name, data: f, date: new Date(f.lastModified) })),
        (fraction) => {
          setProgress(5 + Math.round(fraction * 94));
          setStatusText(`Archiv wird komprimiert … ${Math.round(fraction * 100)} %`);
        }
      );

      const safeBase = zipName.trim().replace(/[\\/:*?"<>|]+/g, '_') || 'archiv';
      const filename = `${safeBase}.zip`;
      setResultBlob(blob);
      setOutputFilename(filename);
      setProgress(100);
      if (autoDownload) downloadBlob(blob, filename);
      trackEvent('conversion_completed', { toolId, fileCount: selectedFiles.length, outputSize: blob.size });
    } catch (err) {
      console.error('[Archive Create Error]:', err);
      setError(
        (err as Error)?.message?.includes('memory') || (err as Error)?.name === 'RangeError'
          ? 'Nicht genügend Arbeitsspeicher im Browser, um dieses Archiv zu erstellen. Bitte wählen Sie weniger oder kleinere Dateien.'
          : 'Beim Erstellen des ZIP-Archivs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
      );
      trackEvent('conversion_failed', { toolId });
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // ARCHIV ENTPACKEN (100 % im Browser: JSZip / TAR-Parser / GZIP / 7-Zip-WASM)
  // -------------------------------------------------------------
  const handleExtractArchive = async () => {
    if (!archiveFile) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsProcessing(true);
    setProgress(undefined);
    setStatusText('Archiv wird lokal analysiert …');
    setError(null);
    trackEvent('conversion_started', { toolId, size: archiveFile.size });

    try {
      const { extractArchive } = await import('@/lib/client/archive/extract');
      const result = await extractArchive(archiveFile, {
        signal: controller.signal,
        onStatus: (text) => setStatusText(text),
        onProgress: (fraction) => setProgress(Math.round(fraction * 100)),
      });
      if (result.entries.length === 0) {
        throw new Error('Das Archiv enthält keine Dateien (nur leere Ordner).');
      }
      setEntries(result.entries);
      setExtractNote(result.note ?? null);
      setProgress(100);

      if (result.entries.length === 1) {
        const only = result.entries[0];
        const blob = new Blob([only.data as BlobPart]);
        setResultBlob(blob);
        setOutputFilename(fileNameOf(only.path));
        if (autoDownload) downloadBlob(blob, fileNameOf(only.path));
      }
      trackEvent('conversion_completed', {
        toolId,
        inputSize: archiveFile.size,
        fileCount: result.entries.length,
        archiveType: result.type,
      });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        setError('Der Vorgang wurde abgebrochen.');
      } else {
        console.error('[Archive Extract Error]:', err);
        setError((err as Error)?.message || 'Fehler beim Entpacken des Archivs.');
        trackEvent('conversion_failed', { toolId });
      }
    } finally {
      abortRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const downloadEntry = (entry: ExtractedEntry) => {
    downloadBlob(new Blob([entry.data as BlobPart]), fileNameOf(entry.path));
    trackEvent('download_completed', { toolId, mode: 'single' });
  };

  const downloadAllAsZip = async () => {
    if (!archiveFile || entries.length === 0) return;
    setIsZipping(true);
    try {
      const { createZipBlob } = await import('@/lib/client/archive/extract');
      const blob = await createZipBlob(entries.map((e) => ({ path: e.path, data: e.data })));
      downloadBlob(blob, `${archiveBaseName(archiveFile.name)}_entpackt.zip`);
      trackEvent('download_completed', { toolId, mode: 'zip' });
    } catch {
      setError('Das ZIP mit allen Dateien konnte nicht erstellt werden (zu wenig Arbeitsspeicher?). Laden Sie die Dateien einzeln herunter.');
    } finally {
      setIsZipping(false);
    }
  };

  const resetAll = () => {
    abortRef.current?.abort();
    setSelectedFiles([]);
    setArchiveFile(null);
    setResultBlob(null);
    setEntries([]);
    setExtractNote(null);
    setError(null);
    setProgress(0);
  };

  const showCreateResult = isCreate && resultBlob;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload area */}
      {selectedFiles.length === 0 && !archiveFile && !resultBlob && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          acceptedExtensions={ACCEPTED[toolId] ?? ['.zip', '.7z', '.tar', '.gz']}
          allowMultiple={isCreate}
          title={
            isCreate
              ? 'Dateien hier ablegen, um ein ZIP zu erstellen'
              : `Archivdatei (${FORMAT_LABEL[toolId]}) hier ablegen zum Entpacken`
          }
          subtitle={
            isCreate
              ? 'Bündeln Sie beliebig viele Dateien (zusammen bis 1 GB) direkt in Ihrem Browser – ohne Upload.'
              : `Entpacken direkt im Browser – Archive bis ${MAX_ARCHIVE_MB} MB, mit Schutz vor Decompression-Bombs. Keine Datei verlässt Ihr Gerät.`
          }
          maxFileSizeMB={MAX_ARCHIVE_MB}
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
                <span className="ml-2 text-xs font-medium text-slate-500">({formatBytes(totalSelectedBytes)})</span>
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
            <label htmlFor="zip-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Archivname:
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500">
              <input
                id="zip-name"
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
                key={`${f.name}-${idx}`}
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
                  aria-label={`${f.name} entfernen`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {totalSelectedBytes > MAX_CREATE_TOTAL_BYTES && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              Die Gesamtgröße überschreitet {formatBytes(MAX_CREATE_TOTAL_BYTES)}. Bitte entfernen Sie einige Dateien.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreateZip}
              disabled={totalSelectedBytes > MAX_CREATE_TOTAL_BYTES}
              className="flex-1 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
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
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Archive Entpacken: Single file preview & Action */}
      {!isCreate && archiveFile && !hasExtractResult && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{archiveFile.name}</div>
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

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Das Archiv wird vollständig lokal in Ihrem Browser entpackt. Pfade wie <code>../</code> werden
              entschärft und ungewöhnlich hohe Kompressionsraten (Decompression-Bombs) werden erkannt.
            </span>
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
          isLargeFile={Boolean(archiveFile && archiveFile.size > 50 * 1024 * 1024)}
          onCancel={!isCreate ? handleCancel : undefined}
          autoDownload={autoDownload}
          onAutoDownloadChange={setAutoDownload}
        />
      )}

      {/* Error State */}
      {error && !isProcessing && (
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

      {/* Result: ZIP created */}
      {showCreateResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-base font-bold text-slate-800">ZIP-Archiv erfolgreich erstellt!</div>
              <div className="text-xs text-slate-500">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'Datei' : 'Dateien'} • {formatBytes(totalSelectedBytes)} →{' '}
                {formatBytes(resultBlob.size)}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                downloadBlob(resultBlob, outputFilename);
                trackEvent('download_completed', { toolId });
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="truncate">
                {outputFilename} herunterladen ({formatBytes(resultBlob.size)})
              </span>
            </button>
            <button
              onClick={resetAll}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Neues Archiv erstellen
            </button>
          </div>
        </div>
      )}

      {/* Result: extracted files */}
      {hasExtractResult && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-base font-bold text-slate-800">Archiv erfolgreich entpackt!</div>
              <div className="text-xs text-slate-500">
                {entries.length} {entries.length === 1 ? 'Datei' : 'Dateien'} • {formatBytes(totalExtractedBytes)} entpackt
              </div>
            </div>
          </div>

          {extractNote && (
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{extractNote}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enthaltene Dateien ({entries.length})
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              {entries.slice(0, MAX_LISTED_ENTRIES).map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-white transition-colors"
                >
                  <span className="font-mono text-slate-700 truncate" title={item.path}>
                    {item.path}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xs text-slate-400">{formatBytes(item.size)}</span>
                    <button
                      onClick={() => downloadEntry(item)}
                      className="p-1 rounded text-sky-600 hover:text-sky-800 hover:bg-sky-50"
                      title="Datei herunterladen"
                      aria-label={`${item.path} herunterladen`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {entries.length > MAX_LISTED_ENTRIES && (
                <div className="py-2 px-2 text-slate-500">
                  … und {entries.length - MAX_LISTED_ENTRIES} weitere Dateien (im ZIP-Download enthalten).
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {entries.length === 1 && resultBlob ? (
              <button
                onClick={() => downloadEntry(entries[0])}
                className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="truncate">
                  {outputFilename} herunterladen ({formatBytes(entries[0].size)})
                </span>
              </button>
            ) : (
              <button
                onClick={downloadAllAsZip}
                disabled={isZipping}
                className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isZipping ? 'ZIP wird erstellt …' : 'Alle Dateien als ZIP herunterladen'}</span>
              </button>
            )}
            <button
              onClick={resetAll}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Weiteres Archiv entpacken
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
