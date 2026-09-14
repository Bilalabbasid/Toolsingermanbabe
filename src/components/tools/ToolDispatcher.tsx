'use client';

import React from 'react';
import { ToolDefinition } from '@/types/tool';
import { PdfMergeEngine } from '@/components/engines/PdfMergeEngine';
import { PdfSplitEngine } from '@/components/engines/PdfSplitEngine';
import { PdfCompressEngine } from '@/components/engines/PdfCompressEngine';
import { PdfRotateEngine } from '@/components/engines/PdfRotateEngine';
import { PdfEditorEngine } from '@/components/engines/PdfEditorEngine';
import { PdfSecurityEngine } from '@/components/engines/PdfSecurityEngine';
import { PdfRedactionEngine } from '@/components/engines/PdfRedactionEngine';
import { PdfSignEngine } from '@/components/engines/PdfSignEngine';
import { PdfWatermarkEngine } from '@/components/engines/PdfWatermarkEngine';
import { PdfPageOrganizerEngine, OrganizeMode } from '@/components/engines/PdfPageOrganizerEngine';
import { PdfMetadataEngine, MetadataMode } from '@/components/engines/PdfMetadataEngine';
import { PdfToImageEngine } from '@/components/engines/PdfToImageEngine';
import { ImageConvertEngine } from '@/components/engines/ImageConvertEngine';
import { ImageCompressEngine } from '@/components/engines/ImageCompressEngine';
import { ImageResizeEngine } from '@/components/engines/ImageResizeEngine';
import { ImageCropEngine } from '@/components/engines/ImageCropEngine';
import { ImageRotateFlipEngine } from '@/components/engines/ImageRotateFlipEngine';
import { ImageEffectsEngine } from '@/components/engines/ImageEffectsEngine';
import { ImageDpiEngine } from '@/components/engines/ImageDpiEngine';
import { FaviconEngine } from '@/components/engines/FaviconEngine';
import { DesignConvertEngine, DesignConvertMode } from '@/components/engines/DesignConvertEngine';
import { OcrEngine } from '@/components/engines/OcrEngine';
import { DocConvertEngine, DocConvertMode } from '@/components/engines/DocConvertEngine';
import { TextUtilityEngine } from '@/components/engines/TextUtilityEngine';
import { DevUtilityEngine } from '@/components/engines/DevUtilityEngine';
import { MediaEngine } from '@/components/engines/MediaEngine';
import { ArchiveEngine } from '@/components/engines/ArchiveEngine';
import { PdfHeaderFooterEngine, HeaderFooterMode } from '@/components/engines/PdfHeaderFooterEngine';
import { PdfCompareEngine } from '@/components/engines/PdfCompareEngine';
import { PdfRepairOptimizeEngine, RepairOptimizeMode } from '@/components/engines/PdfRepairOptimizeEngine';
import { PdfExtractEngine, ExtractMode } from '@/components/engines/PdfExtractEngine';

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
      let effectMode: 'sharpen' | 'blur' | 'brightness' | 'grayscale' = 'sharpen';
      if (tool.slug === 'bild-weichzeichnen') effectMode = 'blur';
      else if (tool.slug === 'bild-schaerfen') effectMode = 'sharpen';
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
      else if (s === 'ppt-to-pptx-umwandeln') mode = 'ppt-to-pptx';
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
      return <DesignConvertEngine mode={designMode} />;
    }

    default:
      return <PdfCompressEngine />;
  }
}
