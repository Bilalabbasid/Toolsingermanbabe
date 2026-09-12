'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Plus, X } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface FileUploaderProps {
  acceptedExtensions: string[];
  maxFileSizeMB: number;
  allowMultiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export function FileUploader({
  acceptedExtensions,
  maxFileSizeMB,
  allowMultiple = false,
  onFilesSelected,
  title = 'Dateien hier ablegen',
  subtitle,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = (rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;
    setErrorMessage(null);

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
        setErrorMessage(
          `Die Datei „${file.name}“ ist zu groß (${formatBytes(file.size)}). Das Limit für kostenlose Nutzer beträgt ${maxFileSizeMB} MB.`
        );
        return;
      }

      validFiles.push(file);
      if (!allowMultiple) break;
    }

    if (validFiles.length > 0) {
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

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white ${
          isDragOver
            ? 'border-sky-500 bg-sky-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-sky-500 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedExtensions.join(',')}
          onChange={(e) => validateAndProcessFiles(e.target.files)}
          className="hidden"
          id="file-upload-input"
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-sm">
            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-5">
            {subtitle || 'oder klicken Sie hier, um Dateien von Ihrem Gerät auszuwählen'}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm sm:text-base shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Datei auswählen</span>
          </button>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-400">
            <span>Unterstützt: {acceptedExtensions.join(', ').toUpperCase()}</span>
            <span>•</span>
            <span>Maximal: {maxFileSizeMB} MB</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">100% lokal im Browser</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Achtung:</span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
