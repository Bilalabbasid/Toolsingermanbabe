export type ToolCategory =
  | 'pdf'
  | 'images'
  | 'documents'
  | 'utilities'
  | 'security'
  | 'ocr';

export type EngineType =
  | 'pdf-merge'
  | 'pdf-split'
  | 'pdf-organize'
  | 'pdf-metadata'
  | 'pdf-to-image'
  | 'pdf-compress'
  | 'pdf-rotate'
  | 'pdf-editor'
  | 'pdf-protect'
  | 'pdf-unlock'
  | 'pdf-permissions'
  | 'pdf-redact'
  | 'pdf-sign'
  | 'pdf-watermark'
  | 'image-convert'
  | 'image-compress'
  | 'image-resize'
  | 'image-bw'
  | 'image-crop'
  | 'image-rotate-flip'
  | 'image-effects'
  | 'image-crop-circle'
  | 'image-dpi'
  | 'image-metadata-strip'
  | 'favicon-create'
  | 'design-convert'
  | 'ocr'
  | 'doc-convert'
  | 'text-utility'
  | 'dev-utility'
  | 'archive'
  | 'archive-tool'
  | 'media-convert'
  | 'pdf-numbering'
  | 'pdf-header-footer'
  | 'pdf-compare'
  | 'pdf-repair'
  | 'pdf-optimize'
  | 'pdf-pdfa'
  | 'pdf-flatten'
  | 'pdf-annotations-remove'
  | 'pdf-extract';

export interface HowItWorksStep {
  step: number;
  title: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TroubleshootingItem {
  issue: string;
  solution: string;
}

export interface ToolLimits {
  maxFileSizeMB: number;
  maxBatch: number;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  category: ToolCategory;
  sourceFormats: string[]; // e.g. ['.pdf']
  targetFormats: string[]; // e.g. ['.docx']
  nameDe: string;
  shortDescriptionDe: string;
  titleDe: string;
  metaDescriptionDe: string;
  h1De: string;
  introDe: string;
  howItWorksDe: HowItWorksStep[];
  faqDe: FaqItem[];
  supportedFormats: string; // e.g. 'PDF zu Word (DOCX)'
  freeLimits: ToolLimits;
  proLimits: ToolLimits;
  processingEngine: EngineType;
  browserCapable: boolean;
  serverRequired: boolean;
  relatedTools: string[]; // array of related slugs
  icon: string;
  status: 'active' | 'beta' | 'maintenance';
  badge?: 'Beliebt' | 'Neu' | 'DSGVO' | 'Kostenlos';
  features?: string[];
  troubleshootingDe?: TroubleshootingItem[];
  privacyExplanationDe?: string;
  searchKeywordsDe?: string[];
}
