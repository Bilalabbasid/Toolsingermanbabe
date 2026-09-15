'use client';

import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileAudio, 
  FileVideo, 
  FileArchive, 
  Trash2, 
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

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    return <ImageIcon className="w-4 h-4 text-purple-600" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return <FileAudio className="w-4 h-4 text-amber-600" />;
  }
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
    return <FileVideo className="w-4 h-4 text-rose-600" />;
  }
  if (['zip', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className="w-4 h-4 text-slate-600" />;
  }
  return <FileText className="w-4 h-4 text-sky-600" />;
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
  const ext = item.name.split('.').pop()?.toUpperCase() || '';
  const canReorder = onMoveUp !== undefined && onMoveDown !== undefined && total !== undefined && total > 1;

  return (
    <div
      className={`group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 transition-all ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {index !== undefined && (
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
        )}

        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
          {getFileIcon(item.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md block"
              title={item.name}
            >
              {item.name}
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
              {ext}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{formatBytes(item.size)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {canReorder && (
          <>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer touch-target-44"
              aria-label={`„${item.name}" nach oben verschieben`}
              title="Nach oben verschieben"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index !== undefined && total !== undefined && index === total - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer touch-target-44"
              aria-label={`„${item.name}" nach unten verschieben`}
              title="Nach unten verschieben"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer touch-target-44"
            aria-label={`„${item.name}" entfernen`}
            title="Datei entfernen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
