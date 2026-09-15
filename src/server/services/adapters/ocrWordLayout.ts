import { Document, Packer, Paragraph, TabStopType, TextRun } from 'docx';

export interface OcrWordPage {
  text: string;
  tsv?: string | null;
  imageWidth: number;
  imageHeight: number;
  pageWidthTwips: number;
  pageHeightTwips: number;
}

interface OcrWordLine {
  top: number;
  left: number;
  height: number;
  text: string;
}

function parseLines(tsv: string): OcrWordLine[] {
  const lines = new Map<string, { top: number; left: number; bottom: number; words: { left: number; text: string }[] }>();
  for (const row of tsv.split(/\r?\n/).slice(1)) {
    const fields = row.split('\t');
    if (fields.length < 12 || fields[0] !== '5') continue;
    const left = Number(fields[6]);
    const top = Number(fields[7]);
    const height = Number(fields[9]);
    const text = fields.slice(11).join('\t').trim();
    if (!text || !Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(height)) continue;
    const key = fields.slice(1, 5).join(':');
    const line = lines.get(key) ?? { top, left, bottom: top + height, words: [] };
    line.top = Math.min(line.top, top);
    line.left = Math.min(line.left, left);
    line.bottom = Math.max(line.bottom, top + height);
    line.words.push({ left, text });
    lines.set(key, line);
  }
  return [...lines.values()]
    .map(line => ({
      top: line.top,
      left: line.left,
      height: Math.max(1, line.bottom - line.top),
      text: line.words.sort((a, b) => a.left - b.left).map(word => word.text).join(' '),
    }))
    .sort((a, b) => a.top - b.top || a.left - b.left);
}

function styledRun(line: OcrWordLine, imageHeight: number, pageHeightTwips: number): TextRun {
  const pointHeight = line.height * pageHeightTwips / Math.max(imageHeight, 1) / 20;
  const isHeading = /^[\p{Lu}\d\s&|/-]{3,}$/u.test(line.text) && line.text.length < 55;
  return new TextRun({
    text: line.text,
    bold: isHeading,
    color: isHeading ? '1673BC' : '202833',
    font: 'Arial',
    size: Math.round(Math.max(7, Math.min(12, pointHeight * 0.65)) * 2),
  });
}

/** OCR words become native Word runs; positioning is approximate because a scan has no document structure. */
export async function buildEditableOcrDocx(pages: OcrWordPage[]): Promise<Buffer> {
  const sections = pages.map(page => {
    const margin = 360;
    const lines = page.tsv ? parseLines(page.tsv) : [];
    const children: Paragraph[] = [];
    let previousBottom = 0;

    if (lines.length) {
      let index = 0;
      while (index < lines.length) {
        const first = lines[index];
        const row = [first];
        index++;
        while (index < lines.length && Math.abs(lines[index].top - first.top) <= Math.max(4, first.height * 0.4)) {
          row.push(lines[index++]);
        }
        row.sort((a, b) => a.left - b.left);
        const before = Math.max(0, Math.min(900, Math.round((first.top - previousBottom) * page.pageHeightTwips / page.imageHeight)));
        const leftTwips = (x: number) => Math.max(0, Math.min(page.pageWidthTwips - margin * 2, Math.round(x * page.pageWidthTwips / page.imageWidth) - margin));
        const childrenRuns: TextRun[] = [];
        type TabStopTypeVal = typeof TabStopType[keyof typeof TabStopType];
        const stops: { type: TabStopTypeVal; position: number }[] = [];
        for (let part = 0; part < row.length; part++) {
          if (part) {
            childrenRuns.push(new TextRun({ text: '\t' }));
            stops.push({ type: TabStopType.LEFT, position: leftTwips(row[part].left) });
          }
          childrenRuns.push(styledRun(row[part], page.imageHeight, page.pageHeightTwips));
        }
        children.push(new Paragraph({
          indent: row.length === 1 ? { left: leftTwips(first.left) } : undefined,
          tabStops: stops.length ? stops : undefined,
          spacing: { before, after: 0, line: Math.round(Math.max(170, Math.min(360, first.height * page.pageHeightTwips / page.imageHeight * 1.2))) },
          children: childrenRuns,
        }));
        previousBottom = Math.max(...row.map(line => line.top + line.height));
      }
    } else {
      for (const line of page.text.split(/\r?\n/).map(value => value.trim()).filter(Boolean)) {
        children.push(new Paragraph({ children: [new TextRun({ text: line, font: 'Arial', size: 20 })], spacing: { after: 100 } }));
      }
    }

    return {
      properties: { page: { size: { width: page.pageWidthTwips, height: page.pageHeightTwips }, margin: { top: margin, bottom: margin, left: margin, right: margin } } },
      children,
    };
  });
  return Packer.toBuffer(new Document({ sections }));
}
