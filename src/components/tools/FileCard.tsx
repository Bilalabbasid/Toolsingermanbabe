'use client';

import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileAudio, 
  FileVideo, 
  FileArchive, 
  ArrowUp, 
  ArrowDown, 
  X 
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

export interface FileItem {
  id: string;
  file?: File;
  name: string;
  size: number;
}

interface FileCardProps {
  item: FileItem;
  index?: number;
  total?: number;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

function getFileVisual(filename: string): { icon: React.ReactNode; tile: string } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico', 'heic', 'heif', 'avif', 'tif', 'tiff', 'psd'].includes(ext)) {
    return { icon: <ImageIcon className="w-4 h-4" aria-hidden="true" />, tile: 'bg-violet-50 text-violet-700 ring-violet-100' };
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return { icon: <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />, tile: 'bg-emerald-50 text-emerald-700 ring-emerald-100' };
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return { icon: <FileAudio className="w-4 h-4" aria-hidden="true" />, tile: 'bg-amber-50 text-amber-700 ring-amber-100' };
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return { icon: <FileVideo className="w-4 h-4" aria-hidden="true" />, tile: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100' };
  }
  if (['zip', '7z', 'tar', 'gz', 'rar'].includes(ext)) {
    return { icon: <FileArchive className="w-4 h-4" aria-hidden="true" />, tile: 'bg-slate-100 text-slate-700 ring-slate-200' };
  }
  if (ext === 'pdf') {
    return { icon: <FileText className="w-4 h-4" aria-hidden="true" />, tile: 'bg-rose-50 text-rose-700 ring-rose-100' };
  }
  return { icon: <FileText className="w-4 h-4" aria-hidden="true" />, tile: 'bg-sky-50 text-sky-700 ring-sky-100' };
}

export function FileCard({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  className = '',
}: FileCardProps) {
  const ext = item.name.includes('.') ? item.name.split('.').pop()?.toUpperCase() || '' : '';
  const canReorder = onMoveUp !== undefined && onMoveDown !== undefined && total !== undefined && total > 1;
  const visual = getFileVisual(item.name);

  return (
    <div
      className={`group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white ring-1 ring-line hover:ring-line-strong hover:shadow-card transition-[box-shadow] animate-fade-in ${className}`}
    >
      {index !== undefined && (
        <span className="w-6 h-6 rounded-full bg-surface-muted text-ink-subtle text-[11px] font-semibold tabular-nums flex items-center justify-center shrink-0">
          {index + 1}
        </span>
      )}

      <span className={`w-9 h-9 rounded-lg ring-1 flex items-center justify-center shrink-0 ${visual.tile}`}>
        {visual.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] sm:text-sm font-semibold text-ink truncate" title={item.name}>
          {item.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-subtle">
          {ext && (
            <span className="font-semibold tracking-wide px-1.5 rounded bg-surface-muted text-ink-muted">{ext}</span>
          )}
          <span className="tabular-nums">{formatBytes(item.size)}</span>
        </p>
      </div>

      <div className="flex items-center shrink-0">
        {canReorder && (
          <>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-muted disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label={`„${item.name}“ nach oben verschieben`}
              title="Nach oben verschieben"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index !== undefined && total !== undefined && index === total - 1}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-muted disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label={`„${item.name}“ nach unten verschieben`}
              title="Nach unten verschieben"
            >
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-subtle hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            aria-label={`„${item.name}“ entfernen`}
            title="Datei entfernen"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
