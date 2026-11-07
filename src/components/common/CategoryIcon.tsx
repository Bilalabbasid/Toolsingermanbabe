import React from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, ScanText, ShieldCheck, Wrench, type LucideProps } from 'lucide-react';
import type { ToolCategory } from '@/types/tool';

const ICONS: Record<ToolCategory, React.ComponentType<LucideProps>> = {
  pdf: FileText,
  images: ImageIcon,
  documents: FileSpreadsheet,
  ocr: ScanText,
  security: ShieldCheck,
  utilities: Wrench,
};

/** Small category icon – a light-weight alternative to ToolIcon for navigation. */
export function CategoryIcon({ category, className = 'w-4 h-4' }: { category: ToolCategory; className?: string }) {
  const Icon = ICONS[category] ?? FileText;
  return <Icon className={className} aria-hidden="true" />;
}
