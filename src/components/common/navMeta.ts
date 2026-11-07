import type { ToolCategory } from '@/types/tool';

/**
 * Client-safe navigation types and constants (no tool registry import!).
 * Server-side builders live in navData.ts.
 */
export interface NavTool {
  slug: string;
  name: string;
  icon: string;
  category: ToolCategory;
}

export interface NavCategory {
  slug: ToolCategory;
  /** Short label for menus, e.g. "PDF" */
  label: string;
  /** Full category name, e.g. "PDF-Tools" */
  name: string;
  description: string;
  count: number;
  tools: NavTool[];
}

/** Display order of categories across header, footer and home page. */
export const CATEGORY_ORDER: ToolCategory[] = ['pdf', 'images', 'documents', 'ocr', 'security', 'utilities'];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pdf: 'PDF',
  images: 'Bilder',
  documents: 'Dokumente',
  ocr: 'OCR',
  security: 'Sicherheit',
  utilities: 'Text, Medien & Mehr',
};

/** Accent colours per category (icon tiles). Kept here so every surface agrees. */
export const CATEGORY_ACCENTS: Record<ToolCategory, { tile: string; text: string }> = {
  pdf: { tile: 'bg-rose-50 text-rose-700 ring-rose-100', text: 'text-rose-700' },
  images: { tile: 'bg-violet-50 text-violet-700 ring-violet-100', text: 'text-violet-700' },
  documents: { tile: 'bg-blue-50 text-blue-700 ring-blue-100', text: 'text-blue-700' },
  ocr: { tile: 'bg-emerald-50 text-emerald-700 ring-emerald-100', text: 'text-emerald-700' },
  security: { tile: 'bg-amber-50 text-amber-800 ring-amber-100', text: 'text-amber-800' },
  utilities: { tile: 'bg-slate-100 text-slate-700 ring-slate-200', text: 'text-slate-700' },
};
