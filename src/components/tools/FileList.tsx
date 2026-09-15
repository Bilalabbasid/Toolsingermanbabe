'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FileCard, FileItem } from './FileCard';
import { Button } from '@/components/common/Button';

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
  if (items.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {items.length}
            </span>
          </h3>
          {onMoveUp && onMoveDown && items.length > 1 && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reihenfolge mit den Pfeiltasten nach Wunsch anpassen.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onAddFiles && allowMultiple && (
            <label
              htmlFor="file-list-add-more"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>Weitere hinzufügen</span>
              <input
                id="file-list-add-more"
                type="file"
                multiple
                accept={acceptedExtensions.join(',')}
                className="hidden"
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
              className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Alle entfernen"
              aria-label="Alle Dateien entfernen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-3.5 max-h-[380px] overflow-y-auto pr-1">
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
