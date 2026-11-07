/** Shared data structures for the in-browser OCR pipeline. */

export type OcrLanguage = 'deu' | 'eng' | 'deu+eng';
export type OcrOutputType = 'pdf' | 'docx' | 'txt';

export interface OcrBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OcrWord extends OcrBox {
  text: string;
  confidence: number;
}

export interface OcrLine extends OcrBox {
  words: OcrWord[];
  /** Baseline in image pixels (Tesseract), if available. */
  baseline?: OcrBox;
}

export interface OcrParagraph {
  lines: OcrLine[];
}

export interface OcrPageResult {
  /** 0-based page index. */
  index: number;
  /** Size of the OCR'd raster image in pixels. */
  widthPx: number;
  heightPx: number;
  /** Size of the output PDF page in points (1/72 inch). */
  pageWidthPt: number;
  pageHeightPt: number;
  /** JPEG of the page (only kept when a searchable PDF is produced). */
  jpeg?: Uint8Array;
  text: string;
  paragraphs: OcrParagraph[];
  /** Mean confidence 0–100. */
  confidence: number;
}
