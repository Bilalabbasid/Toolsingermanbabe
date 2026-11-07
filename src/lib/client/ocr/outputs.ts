/**
 * Builds the OCR output documents (searchable PDF, DOCX, TXT) from recognised
 * pages. No DOM access – runs in the browser and under Node (for tests).
 */
import type { OcrLine, OcrPageResult, OcrParagraph } from './types';

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function lineText(line: OcrLine): string {
  return line.words
    .map((w) => w.text.trim())
    .filter(Boolean)
    .join(' ');
}

/** Joins the lines of a paragraph into flowing text, undoing end-of-line hyphenation ("Ver-" + "arbeitung"). */
export function paragraphToFlowText(paragraph: OcrParagraph): string {
  let out = '';
  for (const line of paragraph.lines) {
    const text = lineText(line);
    if (!text) continue;
    if (!out) {
      out = text;
    } else if (/[A-Za-zÄÖÜäöüß]-$/.test(out) && /^[a-zäöüß]/.test(text)) {
      out = out.slice(0, -1) + text;
    } else if (out.endsWith('-')) {
      out += text;
    } else {
      out += ' ' + text;
    }
  }
  return out;
}

/** Tesseract sometimes splits a hyphenated word across two "paragraphs" – join them again. */
export function mergeHyphenatedParagraphs(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const p of paragraphs) {
    const prev = out[out.length - 1];
    if (prev && /[A-Za-zÄÖÜäöüß]-$/.test(prev) && /^[a-zäöüß]/.test(p)) {
      out[out.length - 1] = prev.slice(0, -1) + p;
    } else {
      out.push(p);
    }
  }
  return out;
}

/** Plain text that keeps the original line breaks; paragraphs separated by blank lines. */
export function pageToPlainText(page: OcrPageResult): string {
  if (page.paragraphs.length === 0) return page.text.trim();
  return page.paragraphs
    .map((p) => p.lines.map(lineText).filter(Boolean).join('\n'))
    .filter(Boolean)
    .join('\n\n');
}

export function buildTxt(pages: OcrPageResult[]): string {
  if (pages.length === 1) return pageToPlainText(pages[0]) + '\n';
  return (
    pages
      .map((p) => `--- Seite ${p.index + 1} ---\n\n${pageToPlainText(p) || '[Kein Text erkannt]'}`)
      .join('\n\n') + '\n'
  );
}

// ---------------------------------------------------------------------------
// Searchable PDF (page image + invisible text layer)
// ---------------------------------------------------------------------------

export interface PdfBuildOptions {
  title?: string;
}

export async function buildSearchablePdf(pages: OcrPageResult[], options: PdfBuildOptions = {}): Promise<Uint8Array> {
  const {
    PDFDocument,
    StandardFonts,
    TextRenderingMode,
    beginText,
    endText,
    popGraphicsState,
    pushGraphicsState,
    setCharacterSqueeze,
    setFontAndSize,
    setTextMatrix,
    setTextRenderingMode,
    showText,
  } = await import('pdf-lib');

  const pdf = await PDFDocument.create();
  if (options.title) pdf.setTitle(options.title);
  pdf.setCreator('Datei Tools – OCR im Browser');
  pdf.setProducer('Datei Tools (pdf-lib, Tesseract)');
  pdf.setCreationDate(new Date());

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const supported = new Set(font.getCharacterSet());
  const toWinAnsi = (text: string): string => {
    let out = '';
    for (const ch of text.normalize('NFKC')) {
      const cp = ch.codePointAt(0)!;
      out += supported.has(cp) ? ch : '?';
    }
    return out;
  };

  for (const page of pages) {
    const pdfPage = pdf.addPage([page.pageWidthPt, page.pageHeightPt]);
    if (page.jpeg) {
      const img = await pdf.embedJpg(page.jpeg);
      pdfPage.drawImage(img, { x: 0, y: 0, width: page.pageWidthPt, height: page.pageHeightPt });
    }

    const sx = page.pageWidthPt / page.widthPx;
    const sy = page.pageHeightPt / page.heightPx;
    const fontKey = pdfPage.node.newFontDictionary(font.name, font.ref);
    const ops = [pushGraphicsState(), beginText(), setTextRenderingMode(TextRenderingMode.Invisible)];
    let wordCount = 0;

    for (const paragraph of page.paragraphs) {
      for (const line of paragraph.lines) {
        const words = line.words.filter((w) => w.text.trim());
        const lineHeightPt = Math.max(1, (line.y1 - line.y0) * sy);
        words.forEach((word, i) => {
          const raw = toWinAnsi(word.text.trim());
          if (!raw) return;
          const text = i < words.length - 1 ? `${raw} ` : raw;
          // Font size from the line height (stable within a line), baseline from Tesseract if available.
          const size = Math.max(1, Math.min(lineHeightPt * 0.85, 200));
          let baselinePx = word.y1;
          const bl = line.baseline;
          if (bl && bl.x1 > bl.x0) {
            const t = Math.max(0, Math.min(1, (word.x0 - bl.x0) / (bl.x1 - bl.x0)));
            baselinePx = bl.y0 + (bl.y1 - bl.y0) * t;
          }
          const x = word.x0 * sx;
          const y = page.pageHeightPt - baselinePx * sy;
          const naturalWidth = font.widthOfTextAtSize(raw, size);
          const targetWidth = Math.max(0.5, (word.x1 - word.x0) * sx);
          const squeeze = naturalWidth > 0 ? Math.max(10, Math.min(1000, (targetWidth / naturalWidth) * 100)) : 100;
          ops.push(
            setFontAndSize(fontKey, size),
            setCharacterSqueeze(squeeze),
            setTextMatrix(1, 0, 0, 1, x, y),
            showText(font.encodeText(text))
          );
          wordCount++;
        });
      }
    }
    ops.push(endText(), popGraphicsState());
    if (wordCount > 0) pdfPage.pushOperators(...ops);
  }

  return pdf.save({ useObjectStreams: true });
}

// ---------------------------------------------------------------------------
// DOCX
// ---------------------------------------------------------------------------

export async function buildDocx(pages: OcrPageResult[], options: { title?: string } = {}): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const children: InstanceType<typeof Paragraph>[] = [];

  pages.forEach((page, pageIdx) => {
    const paragraphs = mergeHyphenatedParagraphs(page.paragraphs.map(paragraphToFlowText).filter(Boolean));
    if (paragraphs.length === 0) {
      children.push(
        new Paragraph({
          pageBreakBefore: pageIdx > 0,
          children: [new TextRun({ text: `[Seite ${page.index + 1}: kein Text erkannt]`, italics: true, color: '888888' })],
        })
      );
      return;
    }
    paragraphs.forEach((text, i) => {
      children.push(
        new Paragraph({
          pageBreakBefore: pageIdx > 0 && i === 0,
          spacing: { after: 160 },
          children: [new TextRun({ text })],
        })
      );
    });
  });

  const doc = new Document({
    creator: 'Datei Tools',
    title: options.title || 'OCR-Ergebnis',
    description: 'Mit Texterkennung (OCR) im Browser erstellt',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [{ properties: {}, children }],
  });
  return Packer.toBlob(doc);
}
