'use client';

import React, { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FileCard, FileItem } from './FileCard';
import { formatBytes } from '@/lib/utils';

interface FileListProps {
  items: FileItem[];
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onClearAll?: () => void;
  onAddFiles?: (files: File[]) => void;
  acceptedExtensions?: string[];
  title?: string;
  allowMultiple?: boolean;
}

export function FileList({
  items,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearAll,
  onAddFiles,
  acceptedExtensions = [],
  title = 'Ausgewählte Dateien',
  allowMultiple = true,
}: FileListProps) {
  const addInputId = useId();
  if (items.length === 0) return null;

  const totalBytes = items.reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <div className="w-full card p-3.5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-line">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
            <span>{title}</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold tabular-nums">{items.length}</span>
          </h3>
          <p className="text-xs text-ink-subtle mt-0.5">
            {formatBytes(totalBytes)} gesamt
            {onMoveUp && onMoveDown && items.length > 1 ? ' · Reihenfolge mit den Pfeilen anpassen' : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddFiles && allowMultiple && (
            <label
              htmlFor={addInputId}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg ring-1 ring-line bg-white hover:bg-surface-muted text-ink text-xs font-semibold cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-sky-400"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span>Weitere hinzufügen</span>
              <input
                id={addInputId}
                type="file"
                multiple
                accept={acceptedExtensions.length ? acceptedExtensions.join(',') : undefined}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddFiles(Array.from(e.target.files));
                    e.target.value = '';
                  }
                }}
              />
            </label>
          )}

          {onClearAll && items.length > 1 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-2.5 text-xs font-semibold text-ink-subtle hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              aria-label="Alle Dateien entfernen"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Alle entfernen</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-3.5 max-h-[400px] overflow-y-auto overscroll-contain -mx-1 px-1 py-0.5">
        {items.map((item, index) => (
          <FileCard
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            onRemove={() => onRemove(item.id)}
            onMoveUp={onMoveUp ? () => onMoveUp(index) : undefined}
            onMoveDown={onMoveDown ? () => onMoveDown(index) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
