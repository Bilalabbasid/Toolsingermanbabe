'use client';

import React, { useState, useRef, useId, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { UploadCloud, AlertCircle, Plus, X, Sparkles, ArrowRight, Minimize2, ShieldCheck, FileDown } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { trackUploadStarted, trackUploadCompleted, getActiveToolSlug } from '@/lib/analytics';
import { featureFlags } from '@/config/featureFlags.config';

interface FileUploaderProps {
  acceptedExtensions: string[];
  maxFileSizeMB: number;
  allowMultiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  /**
   * @deprecated All tools process files locally now; the uploader always shows the
   * local-processing promise. Kept for backwards compatibility.
   */
  isLocal?: boolean;
  /** Disable the drop zone (e.g. while an engine is busy). */
  disabled?: boolean;
}

const MAX_VISIBLE_FORMATS = 6;

// Coarse pointer (phones/tablets) → adapt wording. Server snapshot is "desktop" to avoid hydration mismatch.
const COARSE_POINTER_QUERY = '(pointer: coarse)';
function subscribePointer(onChange: () => void) {
  const mql = window.matchMedia(COARSE_POINTER_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}
const getPointerSnapshot = () => window.matchMedia(COARSE_POINTER_QUERY).matches;
const getPointerServerSnapshot = () => false;

function formatLabel(ext: string) {
  return ext.replace(/^\./, '').toUpperCase();
}

export function FileUploader({
  acceptedExtensions,
  maxFileSizeMB,
  allowMultiple = false,
  onFilesSelected,
  title = 'Dateien hier ablegen',
  subtitle,
  disabled = false,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sizeExceededFile, setSizeExceededFile] = useState<{ name: string; size: number } | null>(null);
  const isTouchDevice = useSyncExternalStore(subscribePointer, getPointerSnapshot, getPointerServerSnapshot);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const instructionsId = useId();

  const acceptsAll = acceptedExtensions.length === 0 || acceptedExtensions.includes('*') || acceptedExtensions.includes('*/*');
  const formats = acceptsAll ? [] : Array.from(new Set(acceptedExtensions.map(formatLabel)));
  const visibleFormats = formats.slice(0, MAX_VISIBLE_FORMATS);
  const hiddenFormatCount = formats.length - visibleFormats.length;

  const validateAndProcessFiles = (rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;
    setErrorMessage(null);
    setSizeExceededFile(null);

    const validFiles: File[] = [];
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!acceptsAll && !acceptedExtensions.includes(ext)) {
        setErrorMessage(
          `Das Format von „${file.name}“ wird hier nicht unterstützt. Erlaubt: ${formats.join(', ')}.`
        );
        return;
      }

      if (file.size > maxBytes) {
        setSizeExceededFile({ name: file.name, size: file.size });
        return;
      }

      validFiles.push(file);
      if (!allowMultiple) break;
    }

    if (validFiles.length > 0) {
      const activeSlug = getActiveToolSlug();
      if (activeSlug) {
        const totalBytes = validFiles.reduce((acc, f) => acc + f.size, 0);
        // Analytics event names are historical – no file ever leaves the device.
        trackUploadStarted(activeSlug, totalBytes);
        trackUploadCompleted(activeSlug, totalBytes);
      }
      onFilesSelected(validFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragOver(false);
    if (disabled) return;
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const openPicker = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const displayTitle = isTouchDevice ? (allowMultiple ? 'Dateien auswählen' : 'Datei auswählen') : title;
  const displaySubtitle = isTouchDevice
    ? subtitle || 'Tippen Sie hier, um Dateien von Ihrem Gerät zu wählen'
    : subtitle || 'oder klicken Sie, um Dateien von Ihrem Gerät auszuwählen';

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={`${displayTitle}. ${formats.length ? `Formate: ${formats.join(', ')}. ` : ''}Maximal ${maxFileSizeMB} MB pro Datei.`}
        aria-describedby={instructionsId}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`group relative w-full overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 sm:px-10 sm:py-12 md:py-14 text-center transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 ${
          disabled
            ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50'
            : isDragOver
              ? 'cursor-copy border-sky-500 bg-sky-50 shadow-[inset_0_0_0_4px_rgb(12_149_224/0.08)]'
              : 'cursor-pointer border-slate-300 bg-gradient-to-b from-white to-slate-50/80 hover:border-sky-400 hover:from-sky-50/40 hover:to-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptsAll ? undefined : acceptedExtensions.join(',')}
          onChange={(e) => {
            validateAndProcessFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
          id="file-upload-input"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled}
        />

        <div className="relative flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${
              isDragOver
                ? 'bg-sky-600 text-white scale-110 shadow-brand'
                : 'bg-sky-50 text-sky-600 ring-1 ring-sky-100 group-hover:scale-105'
            }`}
            aria-hidden="true"
          >
            {isDragOver ? <FileDown className="w-7 h-7 sm:w-8 sm:h-8" /> : <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />}
          </span>

          <p className="text-base sm:text-xl font-bold text-ink tracking-tight px-2">
            {isDragOver ? 'Loslassen zum Hinzufügen' : displayTitle}
          </p>
          <p className="mt-1 text-[13px] sm:text-sm text-ink-subtle max-w-md px-2">{displaySubtitle}</p>

          <span
            className={`mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-xl text-sm sm:text-base font-semibold transition-colors ${
              isDragOver ? 'invisible' : 'bg-sky-600 text-white shadow-brand group-hover:bg-sky-700'
            }`}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            {allowMultiple ? 'Dateien auswählen' : 'Datei auswählen'}
          </span>

          {/* Format, size and privacy hints */}
          <div id={instructionsId} className="mt-5 flex flex-col items-center gap-2.5">
            {visibleFormats.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Unterstützte Formate">
                {visibleFormats.map((f) => (
                  <li
                    key={f}
                    className="px-2 py-0.5 rounded-md bg-white ring-1 ring-line text-[11px] font-semibold tracking-wide text-ink-muted"
                  >
                    {f}
                  </li>
                ))}
                {hiddenFormatCount > 0 && (
                  <li className="px-2 py-0.5 rounded-md bg-white ring-1 ring-line text-[11px] font-semibold text-ink-subtle" title={formats.join(', ')}>
                    +{hiddenFormatCount}
                  </li>
                )}
              </ul>
            )}
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
              <span>
                max. <strong className="font-semibold text-ink-muted">{maxFileSizeMB} MB</strong>
                {allowMultiple ? ' pro Datei' : ''}
              </span>
              {allowMultiple && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Mehrfachauswahl möglich</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Bleibt auf Ihrem Gerät – kein Upload
              </span>
            </p>
          </div>
        </div>
      </div>

      {sizeExceededFile && (
        <div
          role="alert"
          className="mt-3 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200 text-left animate-fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0" aria-hidden="true">
                <Sparkles className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Datei ist größer als {maxFileSizeMB} MB</p>
                <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">
                  „<strong className="break-all">{sizeExceededFile.name}</strong>“ hat {formatBytes(sizeExceededFile.size)}.
                  Größere Dateien können den Browser-Arbeitsspeicher überlasten.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {sizeExceededFile.name.toLowerCase().endsWith('.pdf') && (
                    <Link
                      href="/de/pdf-komprimieren"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white ring-1 ring-line hover:ring-sky-300 text-xs font-semibold text-sky-700 transition-colors"
                    >
                      <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Erst PDF verkleinern
                    </Link>
                  )}
                  {featureFlags.enableStripeCheckout && (
                    <Link
                      href="/de/preise"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                    >
                      Bis zu 500 MB mit Pro
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSizeExceededFile(null)}
              className="text-ink-subtle hover:text-ink p-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Hinweis schließen"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-3 p-3.5 rounded-xl bg-rose-50 ring-1 ring-rose-200 text-rose-900 text-[13px] sm:text-sm flex items-start gap-2.5 animate-shake"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="flex-1 min-w-0 break-words">{errorMessage}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage(null);
            }}
            className="text-rose-500 hover:text-rose-700 p-1.5 -m-1 rounded-lg hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Fehlermeldung schließen"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
