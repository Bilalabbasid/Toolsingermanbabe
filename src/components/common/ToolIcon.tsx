'use client';

import React from 'react';
import {
  AlignLeft,
  Archive,
  Binary,
  Blend,
  BookOpen,
  Braces,
  CheckCircle,
  Circle,
  CircleDot,
  Clock,
  Code,
  Code2,
  Combine,
  Crop,
  Edit3,
  EyeOff,
  FileAudio,
  FileCheck,
  FileCode,
  FileCode2,
  FileDiff,
  FileImage,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FileType,
  FileUp,
  FileVideo,
  FlipHorizontal,
  Focus,
  FolderArchive,
  GitCompare,
  Hash,
  Image as ImageIcon,
  Info,
  Key,
  Layers,
  Link2,
  ListFilter,
  Lock,
  Maximize2,
  MessageSquareOff,
  Minimize2,
  Monitor,
  Music,
  Palette,
  Paperclip,
  PenTool,
  Presentation,
  Printer,
  RotateCw,
  ScanText,
  Scissors,
  Search,
  ShieldCheck,
  ShieldOff,
  Shrink,
  Sliders,
  Smartphone,
  Sparkles,
  Split,
  Stamp,
  Star,
  SunMedium,
  Table,
  Trash2,
  Type,
  Unlock,
  Spline,
  Video,
  Wrench,
  Zap,
  ZoomOut,
  // Additional modern icons
  FileLock2,
  FileKey,
  FileWarning,
  FileX,
  FileMinus,
  FilePlus,
  FileOutput,
  FileInput,
  FolderOpen,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  FlipVertical,
  Eraser,
  Highlighter,
  PenLine,
  Signature,
  Ruler,
  SquareStack,
  Layers3,
  ImagePlus,
  ImageMinus,
  Images,
  Camera,
  Film,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Package,
  PackageOpen,
  Archive as ArchiveIcon,
  Fingerprint,
  ShieldAlert,
  ShieldPlus,
  ScanLine,
  TextCursorInput,
  LetterText,
  ListOrdered,
  AlignJustify,
  Regex,
  QrCode,
  Barcode,
  Link,
  Unlink,
  ChevronRight,
  LucideProps,
} from 'lucide-react';
import { ToolCategory } from '@/types/tool';

// Direct mapping of tool icon strings to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // Core file operations
  AlignLeft,
  Archive,
  Binary,
  Blend,
  BookOpen,
  Braces,
  CheckCircle,
  Circle,
  CircleHalf: CircleDot,
  Clock,
  Code,
  Code2,
  Combine,
  Crop,
  Edit3,
  EyeOff,

  // File type icons
  FileAudio,
  FileCheck,
  FileCode,
  FileCode2,
  FileDiff,
  FileImage,
  FileInput,
  FileLock: FileLock2,
  FileLock2,
  FileKey,
  FileMinus,
  FilePlus,
  FileOutput,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FileType,
  FileUp,
  FileVideo,
  FileWarning,
  FileX,

  // Flip / rotate
  FlipHorizontal,
  FlipVertical,
  Focus,

  // Folder / archive
  FolderArchive,
  FolderOpen,
  Package,
  PackageOpen,

  // Git / compare
  GitCompare,
  Hash,

  // Image
  Image: ImageIcon,
  ImageIcon,
  ImagePlus,
  ImageMinus,
  Images,
  Camera,

  // Info / meta
  Info,
  Key,
  Layers,
  Layers3,
  SquareStack,
  Link2,
  Link,
  Unlink,
  ListFilter,
  ListOrdered,
  Lock,
  Maximize2,
  MessageSquareOff,
  Minimize2,
  Monitor,

  // Media
  Music,
  Film,
  Video,
  Mic,
  Volume2,
  Headphones,
  Radio,

  // Drawing / annotation
  Palette,
  Paperclip,
  PenTool,
  PenLine,
  Eraser,
  Highlighter,
  Ruler,

  // Presentation / print
  Presentation,
  Printer,

  // Rotate / refresh
  RotateCw,
  RotateCcw,
  RefreshCw,

  // Scan / OCR
  ScanText,
  ScanLine,
  Scissors,
  Search,

  // Security
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  ShieldPlus,
  Fingerprint,
  Signature,

  // Size
  Shrink,
  Sliders,
  Smartphone,
  Sparkles,
  Split,
  Stamp,
  Star,
  SunMedium,
  Table,
  Trash2,
  Type,

  // Text utilities
  TextCursorInput,
  LetterText,
  AlignJustify,
  Regex,

  // QR / barcode
  QrCode,
  Barcode,

  Unlock,
  Upload,
  Download,
  Vector: Spline,
  Wrench,
  Zap,
  ZoomOut,

  // Nav
  ChevronRight,
};

const CATEGORY_DEFAULT_ICONS: Record<ToolCategory, React.ComponentType<LucideProps>> = {
  pdf:       FileText,
  images:    ImageIcon,
  documents: FileSpreadsheet,
  security:  ShieldCheck,
  utilities: Wrench,
  ocr:       ScanText,
};

interface ToolIconProps extends LucideProps {
  name?: string;
  category?: ToolCategory;
  className?: string;
}

export function ToolIcon({ name, category, className = 'w-5 h-5', ...props }: ToolIconProps) {
  let IconComponent: React.ComponentType<LucideProps> | undefined;

  if (name && ICON_MAP[name]) {
    IconComponent = ICON_MAP[name];
  } else if (category && CATEGORY_DEFAULT_ICONS[category]) {
    IconComponent = CATEGORY_DEFAULT_ICONS[category];
  } else {
    IconComponent = FileText;
  }

  return <IconComponent className={className} aria-hidden="true" {...props} />;
}
