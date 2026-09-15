'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UploadCloud, File, AlertCircle, Plus, X, Smartphone, Sparkles, ArrowRight, Minimize2, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { trackUploadStarted, trackUploadCompleted, getActiveToolSlug } from '@/lib/analytics';

interface FileUploaderProps {
  acceptedExtensions: string[];
  maxFileSizeMB: number;
  allowMultiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  isLocal?: boolean;
}

export function FileUploader({
  acceptedExtensions,
  maxFileSizeMB,
  allowMultiple = false,
  onFilesSelected,
  title = 'Dateien hier ablegen',
  subtitle,
  isLocal = false,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sizeExceededFile, setSizeExceededFile] = useState<{ name: string; size: number } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  const validateAndProcessFiles = (rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;
    setErrorMessage(null);
    setSizeExceededFile(null);

    const validFiles: File[] = [];
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      // Validate extension
      if (
        acceptedExtensions.length > 0 &&
        !acceptedExtensions.includes(ext) &&
        !acceptedExtensions.includes('*')
      ) {
        setErrorMessage(
          `Das Format von „${file.name}“ wird nicht unterstützt. Erlaubt sind: ${acceptedExtensions.join(', ')}`
        );
        return;
      }

      // Validate size
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
        trackUploadStarted(activeSlug, totalBytes);
        trackUploadCompleted(activeSlug, totalBytes);
      }
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  // Touch-adaptive title and subtitle
  const displayTitle = isTouchDevice
    ? 'Tippen Sie hier, um eine Datei auszuwählen'
    : title;
  const displaySubtitle = isTouchDevice
    ? subtitle || 'Wählen Sie eine Datei von Ihrem Gerät'
    : subtitle || 'oder klicken Sie hier, um Dateien von Ihrem Gerät auszuwählen';

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${displayTitle}. Unterstützte Formate: ${acceptedExtensions.join(', ').toUpperCase()}. Maximale Dateigröße: ${maxFileSizeMB} MB. Drücken Sie die Eingabetaste oder Leertaste, um Dateien auszuwählen.`}
        aria-describedby="uploader-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed p-6 sm:p-10 md:p-14 text-center cursor-pointer transition-all duration-200 bg-white active:scale-[0.995] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
          isDragOver
            ? 'border-sky-500 bg-sky-50/60 scale-[1.005]'
            : 'border-slate-300/90 hover:border-sky-500 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedExtensions.join(',')}
          onChange={(e) => {
            validateAndProcessFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
          id="file-upload-input"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 sm:mb-4 border border-sky-100/80 shadow-2xs">
            {isTouchDevice ? (
              <Smartphone className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
            ) : (
              <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
            )}
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1 px-2">
            {displayTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4 sm:mb-5 px-2">
            {displaySubtitle}
          </p>

          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm sm:text-base shadow-xs transition-colors touch-target-48">
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Datei auswählen</span>
          </span>

          {/* File format, size and privacy hints */}
          <div
            id="uploader-instructions"
            className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs text-slate-500"
          >
            <span>Unterstützt: <strong className="text-slate-700 font-mono">{acceptedExtensions.join(', ').toUpperCase()}</strong></span>
            <span className="hidden sm:inline" aria-hidden="true">•</span>
            <span>Maximal: <strong className="text-slate-700 font-mono">{maxFileSizeMB} MB</strong></span>
            {allowMultiple && (
              <>
                <span className="hidden sm:inline" aria-hidden="true">•</span>
                <span className="text-sky-700 font-semibold">Mehrfachauswahl möglich</span>
              </>
            )}
            <span className="hidden sm:inline" aria-hidden="true">•</span>
            <span className={isLocal ? 'text-emerald-700 font-semibold' : 'text-slate-600 font-medium'}>
              {isLocal ? '100% lokal im Browser' : 'Verschlüsselt (15 Min. Auto-Löschung)'}
            </span>
          </div>
        </div>
      </div>

      {sizeExceededFile && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 sm:mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-left shadow-2xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Datei ist größer als das kostenlose Limit ({maxFileSizeMB} MB)
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Die Datei „<strong>{sizeExceededFile.name}</strong>“ hat eine Größe von <strong>{formatBytes(sizeExceededFile.size)}</strong>.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {sizeExceededFile.name.toLowerCase().endsWith('.pdf') && (
                    <Link
                      href="/de/pdf-komprimieren"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-300 text-xs font-semibold text-sky-700 shadow-2xs hover:bg-sky-50/50 transition-colors"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Erst kostenlos verkleinern</span>
                    </Link>
                  )}

                  <Link
                    href="/de/preise"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <span>Bis zu 500 MB mit Pro verarbeiten</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSizeExceededFile(null)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Hinweis schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 sm:mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold block">Hinweis:</span>
            <span className="break-words">{errorMessage}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage(null);
            }}
            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-100 transition-colors touch-target-44 shrink-0 cursor-pointer"
            aria-label="Fehlermeldung schließen"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
