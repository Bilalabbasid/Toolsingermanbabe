'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ToolDefinition } from '@/types/tool';
import type { OrganizeMode } from '@/components/engines/PdfPageOrganizerEngine';
import type { MetadataMode } from '@/components/engines/PdfMetadataEngine';
import type { DesignConvertMode } from '@/components/engines/DesignConvertEngine';
import type { DocConvertMode } from '@/components/engines/DocConvertEngine';
import type { HeaderFooterMode } from '@/components/engines/PdfHeaderFooterEngine';
import type { RepairOptimizeMode } from '@/components/engines/PdfRepairOptimizeEngine';
import type { ExtractMode } from '@/components/engines/PdfExtractEngine';

// Zero-CLS Skeleton Loader for asynchronous engine chunk hydration
function EngineSkeleton() {
  return (
    <div className="w-full min-h-[320px] bg-slate-50/70 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center p-8 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4" />
      <div className="h-4 w-44 bg-slate-200 rounded-md mb-2" />
      <div className="h-3 w-28 bg-slate-200 rounded-md" />
    </div>
  );
}

// Dynamic Imports with Isolated Code-Splitting Chunks
const PdfMergeEngine = dynamic(() => import('@/components/engines/PdfMergeEngine').then((m) => m.PdfMergeEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfSplitEngine = dynamic(() => import('@/components/engines/PdfSplitEngine').then((m) => m.PdfSplitEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfCompressEngine = dynamic(() => import('@/components/engines/PdfCompressEngine').then((m) => m.PdfCompressEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfRotateEngine = dynamic(() => import('@/components/engines/PdfRotateEngine').then((m) => m.PdfRotateEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfEditorEngine = dynamic(() => import('@/components/engines/PdfEditorEngine').then((m) => m.PdfEditorEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfSecurityEngine = dynamic(() => import('@/components/engines/PdfSecurityEngine').then((m) => m.PdfSecurityEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfRedactionEngine = dynamic(() => import('@/components/engines/PdfRedactionEngine').then((m) => m.PdfRedactionEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfSignEngine = dynamic(() => import('@/components/engines/PdfSignEngine').then((m) => m.PdfSignEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfWatermarkEngine = dynamic(() => import('@/components/engines/PdfWatermarkEngine').then((m) => m.PdfWatermarkEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfPageOrganizerEngine = dynamic(() => import('@/components/engines/PdfPageOrganizerEngine').then((m) => m.PdfPageOrganizerEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfMetadataEngine = dynamic(() => import('@/components/engines/PdfMetadataEngine').then((m) => m.PdfMetadataEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfToImageEngine = dynamic(() => import('@/components/engines/PdfToImageEngine').then((m) => m.PdfToImageEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageConvertEngine = dynamic(() => import('@/components/engines/ImageConvertEngine').then((m) => m.ImageConvertEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageCompressEngine = dynamic(() => import('@/components/engines/ImageCompressEngine').then((m) => m.ImageCompressEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageResizeEngine = dynamic(() => import('@/components/engines/ImageResizeEngine').then((m) => m.ImageResizeEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageCropEngine = dynamic(() => import('@/components/engines/ImageCropEngine').then((m) => m.ImageCropEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageRotateFlipEngine = dynamic(() => import('@/components/engines/ImageRotateFlipEngine').then((m) => m.ImageRotateFlipEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageEffectsEngine = dynamic(() => import('@/components/engines/ImageEffectsEngine').then((m) => m.ImageEffectsEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ImageDpiEngine = dynamic(() => import('@/components/engines/ImageDpiEngine').then((m) => m.ImageDpiEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const FaviconEngine = dynamic(() => import('@/components/engines/FaviconEngine').then((m) => m.FaviconEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const DesignConvertEngine = dynamic(() => import('@/components/engines/DesignConvertEngine').then((m) => m.DesignConvertEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const OcrEngine = dynamic(() => import('@/components/engines/OcrEngine').then((m) => m.OcrEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const DocConvertEngine = dynamic(() => import('@/components/engines/DocConvertEngine').then((m) => m.DocConvertEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const TextUtilityEngine = dynamic(() => import('@/components/engines/TextUtilityEngine').then((m) => m.TextUtilityEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const DevUtilityEngine = dynamic(() => import('@/components/engines/DevUtilityEngine').then((m) => m.DevUtilityEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const MediaEngine = dynamic(() => import('@/components/engines/MediaEngine').then((m) => m.MediaEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const ArchiveEngine = dynamic(() => import('@/components/engines/ArchiveEngine').then((m) => m.ArchiveEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfHeaderFooterEngine = dynamic(() => import('@/components/engines/PdfHeaderFooterEngine').then((m) => m.PdfHeaderFooterEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfCompareEngine = dynamic(() => import('@/components/engines/PdfCompareEngine').then((m) => m.PdfCompareEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfRepairOptimizeEngine = dynamic(() => import('@/components/engines/PdfRepairOptimizeEngine').then((m) => m.PdfRepairOptimizeEngine), {
  loading: EngineSkeleton,
  ssr: false,
});
const PdfExtractEngine = dynamic(() => import('@/components/engines/PdfExtractEngine').then((m) => m.PdfExtractEngine), {
  loading: EngineSkeleton,
  ssr: false,
});

interface ToolDispatcherProps {
  tool: ToolDefinition;
}

export function ToolDispatcher({ tool }: ToolDispatcherProps) {
  switch (tool.processingEngine) {
    case 'pdf-merge':
      return <PdfMergeEngine />;

    case 'pdf-split':
      return <PdfSplitEngine />;

    case 'pdf-organize': {
      let mode: OrganizeMode = 'extract';
      if (tool.slug === 'pdf-seiten-loeschen') mode = 'delete';
      else if (tool.slug === 'pdf-seiten-neu-anordnen') mode = 'reorder';
      return <PdfPageOrganizerEngine mode={mode} />;
    }

    case 'pdf-metadata': {
      const mode: MetadataMode = tool.slug === 'pdf-metadaten-entfernen' ? 'strip' : 'view';
      return <PdfMetadataEngine mode={mode} />;
    }

    case 'pdf-to-image': {
      const targetFormat = tool.slug === 'pdf-in-png-umwandeln' ? 'PNG' : 'JPG';
      return <PdfToImageEngine targetFormat={targetFormat} />;
    }

    case 'pdf-compress':
      return <PdfCompressEngine />;

    case 'pdf-rotate':
      return <PdfRotateEngine />;

    case 'pdf-editor':
      return <PdfEditorEngine />;

    case 'pdf-protect':
      return <PdfSecurityEngine mode="protect" />;

    case 'pdf-unlock':
      return <PdfSecurityEngine mode="unlock" />;

    case 'pdf-permissions':
      return <PdfSecurityEngine mode="permissions" />;

    case 'pdf-redact':
      return <PdfRedactionEngine />;

    case 'pdf-sign':
      return <PdfSignEngine />;

    case 'pdf-watermark':
      return <PdfWatermarkEngine />;

    case 'pdf-numbering':
    case 'pdf-header-footer': {
      let hfMode: HeaderFooterMode = 'numbering';
      if (tool.slug === 'pdf-kopfzeile-hinzufuegen') hfMode = 'header';
      else if (tool.slug === 'pdf-fusszeile-hinzufuegen') hfMode = 'footer';
      return <PdfHeaderFooterEngine defaultMode={hfMode} toolSlug={tool.slug} />;
    }

    case 'pdf-compare':
      return <PdfCompareEngine />;

    case 'pdf-repair':
      return <PdfRepairOptimizeEngine mode="repair" toolSlug={tool.slug} />;

    case 'pdf-optimize':
      return <PdfRepairOptimizeEngine mode="optimize" toolSlug={tool.slug} />;

    case 'pdf-pdfa':
      return <PdfRepairOptimizeEngine mode="pdfa" toolSlug={tool.slug} />;

    case 'pdf-flatten':
      return <PdfRepairOptimizeEngine mode="flatten" toolSlug={tool.slug} />;

    case 'pdf-annotations-remove':
      return <PdfRepairOptimizeEngine mode="strip-annotations" toolSlug={tool.slug} />;

    case 'pdf-extract': {
      let extMode: ExtractMode = 'images';
      if (tool.slug === 'pdf-text-extrahieren') extMode = 'text';
      else if (tool.slug === 'pdf-anhaenge-extrahieren') extMode = 'attachments';
      return <PdfExtractEngine mode={extMode} toolSlug={tool.slug} />;
    }

    case 'image-convert': {
      let primaryTarget = (tool.targetFormats[0] || '.png').replace('.', '').toUpperCase();
      if (primaryTarget === 'JPEG') primaryTarget = 'JPG';
      if (primaryTarget === 'TIF') primaryTarget = 'TIFF';

      const validTargets = ['PNG', 'JPG', 'WebP', 'GIF', 'SVG', 'BMP', 'TIFF', 'ICO', 'AVIF', 'PDF'];
      const targetFormat = (validTargets.includes(primaryTarget) ? primaryTarget : 'PNG') as any;

      return (
        <ImageConvertEngine
          targetFormat={targetFormat}
          sourceExtensions={tool.sourceFormats}
        />
      );
    }

    case 'image-compress':
      return <ImageCompressEngine />;

    case 'image-resize':
      return <ImageResizeEngine />;

    case 'image-bw':
      return <ImageEffectsEngine mode="grayscale" />;

    case 'image-crop':
      return <ImageCropEngine circleMode={false} />;

    case 'image-crop-circle':
      return <ImageCropEngine circleMode={true} />;

    case 'image-rotate-flip': {
      const isFlip = tool.slug === 'bild-spiegeln';
      return <ImageRotateFlipEngine mode={isFlip ? 'flip' : 'rotate'} />;
    }

    case 'image-effects': {
      let effectMode: 'sharpen' | 'blur' | 'brightness' | 'grayscale' | 'optimize' = 'sharpen';
      if (tool.slug === 'bild-weichzeichnen') effectMode = 'blur';
      else if (tool.slug === 'bild-schaerfen') effectMode = 'sharpen';
      else if (tool.slug === 'bildqualitaet-optimieren') effectMode = 'optimize';
      return <ImageEffectsEngine mode={effectMode} />;
    }

    case 'image-dpi':
      return <ImageDpiEngine stripMetadata={false} />;

    case 'image-metadata-strip':
      return <ImageDpiEngine stripMetadata={true} />;

    case 'favicon-create':
      return <FaviconEngine />;

    case 'ocr': {
      let defaultOutput: 'pdf' | 'docx' | 'txt' = 'pdf';
      if (tool.slug === 'scan-zu-word' || tool.slug === 'ocr-in-word') {
        defaultOutput = 'docx';
      } else if (tool.slug === 'bild-zu-text' || tool.slug === 'ocr-text') {
        defaultOutput = 'txt';
      } else if (tool.slug === 'pdf-durchsuchbar-machen' || tool.slug === 'scan-zu-pdf') {
        defaultOutput = 'pdf';
      }
      return <OcrEngine defaultOutputType={defaultOutput} toolSlug={tool.slug} />;
    }

    case 'doc-convert': {
      let mode: DocConvertMode = 'pdf-to-word';
      const s = tool.slug;
      if (s === 'word-in-pdf-umwandeln') mode = 'word-to-pdf';
      else if (s === 'pdf-in-excel-umwandeln') mode = 'pdf-to-excel';
      else if (s === 'excel-in-pdf-umwandeln') mode = 'excel-to-pdf';
      else if (s === 'pdf-in-powerpoint-umwandeln') mode = 'pdf-to-ppt';
      else if (s === 'powerpoint-in-pdf-umwandeln') mode = 'ppt-to-pdf';
      else if (s === 'doc-in-pdf-umwandeln') mode = 'doc-to-pdf';
      else if (s === 'odt-in-pdf-umwandeln') mode = 'odt-to-pdf';
      else if (s === 'rtf-in-pdf-umwandeln') mode = 'rtf-to-pdf';
      else if (s === 'txt-in-pdf-umwandeln') mode = 'txt-to-pdf';
      else if (s === 'html-in-pdf-umwandeln') mode = 'html-to-pdf';
      else if (s === 'doc-in-docx-umwandeln') mode = 'doc-to-docx';
      else if (s === 'docx-in-doc-umwandeln') mode = 'docx-to-doc';
      else if (s === 'odt-in-docx-umwandeln') mode = 'odt-to-docx';
      else if (s === 'docx-in-odt-umwandeln') mode = 'docx-to-odt';
      else if (s === 'rtf-in-docx-umwandeln') mode = 'rtf-to-docx';
      else if (s === 'txt-in-docx-umwandeln') mode = 'txt-to-docx';
      else if (s === 'xls-in-xlsx-umwandeln') mode = 'xls-to-xlsx';
      else if (s === 'xlsx-in-xls-umwandeln') mode = 'xlsx-to-xls';
      else if (s === 'csv-in-xlsx-umwandeln') mode = 'csv-to-xlsx';
      else if (s === 'xlsx-in-csv-umwandeln') mode = 'xlsx-to-csv';
      else if (s === 'csv-in-pdf-umwandeln') mode = 'csv-to-pdf';
      else if (s === 'ppt-in-pptx-umwandeln') mode = 'ppt-to-pptx';
      else if (s === 'pptx-in-ppt-umwandeln') mode = 'pptx-to-ppt';
      else if (s === 'odp-in-pptx-umwandeln') mode = 'odp-to-pptx';
      else if (s === 'epub-in-pdf-umwandeln') mode = 'epub-to-pdf';
      else if (s === 'epub-in-txt-umwandeln') mode = 'epub-to-txt';
      return <DocConvertEngine mode={mode} />;
    }

    case 'text-utility':
      return <TextUtilityEngine toolId={tool.id as any} />;

    case 'dev-utility':
      return <DevUtilityEngine toolId={tool.id as any} />;

    case 'media-convert':
      return <MediaEngine toolId={tool.slug as any} />;

    case 'archive':
    case 'archive-tool':
      return <ArchiveEngine toolId={tool.slug as any} />;

    case 'design-convert': {
      let designMode: DesignConvertMode = 'psd-to-raster';
      const s = tool.slug;
      if (s === 'png-in-psd' || s === 'jpg-in-psd' || s === 'bild-als-psd-exportieren') designMode = 'raster-to-psd';
      else if (s === 'svg-in-pdf-umwandeln') designMode = 'svg-to-pdf';
      else if (s === 'pdf-in-svg-umwandeln') designMode = 'pdf-to-svg';
      else if (s === 'eps-in-svg-umwandeln') designMode = 'eps-to-svg';
      else if (s === 'eps-in-pdf-umwandeln') designMode = 'eps-to-pdf';
      else if (s.startsWith('psd-')) designMode = 'psd-to-raster';
      return (
        <DesignConvertEngine
          mode={designMode}
          targetFormat={(tool.targetFormats[0] || '').replace('.', '').toLowerCase()}
        />
      );
    }

    default:
      return <PdfCompressEngine />;
  }
}
