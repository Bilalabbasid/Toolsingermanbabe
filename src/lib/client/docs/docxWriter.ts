/**
 * Block[] → DOCX (Office Open XML) using the `docx` package.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun as DocxTextRun,
  WidthType,
} from 'docx';
import type { Align, Block, RGB, TextRun } from './model';
import { type ImageTranscoder, imagePixelSize, sniffImage } from './images';

const HEADINGS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

const ALIGN: Record<Align, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

const CONTENT_WIDTH_TWIPS = 11906 - 2 * 1134;
const MAX_IMAGE_PX = 600;
const BULLET_CHARS = ['•', '◦', '▪'];

export interface DocxWriteOptions {
  title?: string;
  imageTranscoder?: ImageTranscoder;
  /** Default font (Word font name). */
  font?: string;
  /** Default size in pt. */
  fontSize?: number;
}

type Child = Paragraph | Table;
type InlineChild = DocxTextRun | ExternalHyperlink;

function hex(c?: RGB): string | undefined {
  if (!c) return undefined;
  return c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
}

function runsToChildren(runs: TextRun[], force: { bold?: boolean } = {}): InlineChild[] {
  const out: InlineChild[] = [];
  for (const run of runs) {
    const parts = run.text.replace(/\r\n?/g, '\n').split('\n');
    const mk = (text: string, brk: boolean) =>
      new DocxTextRun({
        text: text.replace(/\t/g, '    '),
        bold: run.bold || force.bold || undefined,
        italics: run.italic || undefined,
        underline: run.underline || run.link ? {} : undefined,
        strike: run.strike || undefined,
        font: run.mono ? 'Courier New' : undefined,
        size: run.size ? Math.round(run.size * 2) : undefined,
        color: run.link ? '0563C1' : hex(run.color),
        break: brk ? 1 : undefined,
      });
    const items = parts.map((p, i) => mk(p, i > 0));
    if (run.link && /^(https?:|mailto:)/i.test(run.link)) {
      out.push(new ExternalHyperlink({ link: run.link, children: items }));
    } else {
      out.push(...items);
    }
  }
  return out;
}

interface Ctx {
  level: number; // list nesting level (-1 = not in list)
  numbering?: { reference: string; level: number; instance: number };
}

class DocxBuilder {
  private instance = 0;
  private warnedImages = false;
  warnings: string[] = [];
  constructor(private opts: DocxWriteOptions) {}

  private async imageParagraph(b: Extract<Block, { type: 'image' }>): Promise<Paragraph | null> {
    if (!b.data) return null;
    let data = b.data;
    let kind = sniffImage(data);
    if (kind !== 'png' && kind !== 'jpg' && kind !== 'gif' && kind !== 'bmp') {
      const t = this.opts.imageTranscoder ? await this.opts.imageTranscoder(data, kind) : null;
      if (!t) {
        if (!this.warnedImages) {
          this.warnings.push('Einige Grafiken in einem nicht unterstützten Format wurden ausgelassen.');
          this.warnedImages = true;
        }
        return null;
      }
      data = t.data;
      kind = t.kind;
    }
    const px = imagePixelSize(data) ?? { width: 400, height: 300 };
    let w = b.widthPt ? b.widthPt / 0.75 : px.width;
    let h = b.heightPt ? b.heightPt / 0.75 : px.height;
    if (b.widthPt && !b.heightPt) h = (px.height / px.width) * w;
    if (b.heightPt && !b.widthPt) w = (px.width / px.height) * h;
    const scale = Math.min(1, MAX_IMAGE_PX / w, 900 / h);
    return new Paragraph({
      alignment: b.align ? ALIGN[b.align] : undefined,
      children: [
        new ImageRun({
          type: kind as 'png' | 'jpg' | 'gif' | 'bmp',
          data,
          transformation: { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) },
          altText: b.alt ? { name: b.alt, description: b.alt, title: b.alt } : undefined,
        }),
      ],
    });
  }

  async convert(blocks: Block[], ctx: Ctx = { level: -1 }): Promise<Child[]> {
    const out: Child[] = [];
    let numbering = ctx.numbering;
    const listIndent = ctx.level >= 0 ? { left: 720 * (ctx.level + 1) } : undefined;
    for (const b of blocks) {
      switch (b.type) {
        case 'heading':
          out.push(
            new Paragraph({
              heading: HEADINGS[Math.min(6, Math.max(1, b.level)) - 1],
              alignment: b.align ? ALIGN[b.align] : undefined,
              children: runsToChildren(b.runs),
              numbering,
              indent: numbering ? undefined : listIndent,
            })
          );
          numbering = undefined;
          break;
        case 'paragraph':
          out.push(
            new Paragraph({
              alignment: b.align ? ALIGN[b.align] : undefined,
              children: runsToChildren(b.runs),
              numbering,
              indent: numbering
                ? undefined
                : listIndent ?? (b.indent || b.quote ? { left: Math.round(((b.indent ?? 0) + (b.quote ? 20 : 0)) * 20) } : undefined),
              spacing: b.preformatted || b.spaceAfter === 0 ? { after: 0, before: 0 } : undefined,
              border: b.quote ? { left: { style: BorderStyle.SINGLE, size: 12, color: 'C8CDD6', space: 8 } } : undefined,
            })
          );
          numbering = undefined;
          break;
        case 'list': {
          const level = Math.min(8, ctx.level + 1);
          const instance = ++this.instance;
          for (const item of b.items) {
            const itemChildren = await this.convert(item, {
              level,
              numbering: { reference: b.ordered ? 'dt-numbered' : 'dt-bullet', level, instance },
            });
            if (!itemChildren.length) {
              itemChildren.push(new Paragraph({ children: [], numbering: { reference: b.ordered ? 'dt-numbered' : 'dt-bullet', level, instance } }));
            }
            out.push(...itemChildren);
          }
          break;
        }
        case 'table': {
          const ncols = Math.max(1, ...b.rows.map((r) => r.cells.reduce((s, c) => s + (c.colSpan ?? 1), 0)));
          const colW = Math.floor(CONTENT_WIDTH_TWIPS / ncols);
          const rows: TableRow[] = [];
          for (let ri = 0; ri < b.rows.length; ri++) {
            const r = b.rows[ri];
            const isHeader = ri < (b.headerRows ?? 0);
            const cells: TableCell[] = [];
            for (const c of r.cells) {
              let children = await this.convert(c.blocks, { level: -1 });
              if (!children.length) children = [new Paragraph({ children: [] })];
              if (isHeader || c.header) {
                children = children.map((ch) =>
                  ch instanceof Paragraph && c.blocks.length === 1 && c.blocks[0].type === 'paragraph'
                    ? new Paragraph({ children: runsToChildren((c.blocks[0] as { runs: TextRun[] }).runs, { bold: true }) })
                    : ch
                );
              }
              cells.push(
                new TableCell({
                  children,
                  columnSpan: c.colSpan,
                  rowSpan: c.rowSpan,
                  shading: isHeader || c.header ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8ECF2' } : undefined,
                  margins: { top: 40, bottom: 40, left: 80, right: 80 },
                })
              );
            }
            if (cells.length) rows.push(new TableRow({ children: cells, tableHeader: isHeader || undefined }));
          }
          if (rows.length) {
            out.push(
              new Table({
                rows,
                width: { size: CONTENT_WIDTH_TWIPS, type: WidthType.DXA },
                columnWidths: new Array(ncols).fill(colW),
              })
            );
            out.push(new Paragraph({ children: [] }));
          }
          numbering = undefined;
          break;
        }
        case 'image': {
          const p = await this.imageParagraph(b);
          if (p) out.push(p);
          break;
        }
        case 'pageBreak':
          out.push(new Paragraph({ children: [new PageBreak()] }));
          break;
        case 'rule':
          out.push(new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 1 } } }));
          break;
      }
    }
    return out;
  }
}

function levels(ordered: boolean) {
  return Array.from({ length: 9 }, (_, level) => ({
    level,
    format: ordered ? LevelFormat.DECIMAL : LevelFormat.BULLET,
    text: ordered ? `%${level + 1}.` : BULLET_CHARS[level % BULLET_CHARS.length],
    alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
  }));
}

export async function blocksToDocx(blocks: Block[], opts: DocxWriteOptions = {}): Promise<{ data: Uint8Array; warnings: string[] }> {
  const builder = new DocxBuilder(opts);
  const children = await builder.convert(blocks);
  if (!children.length) children.push(new Paragraph({ children: [] }));
  const doc = new Document({
    creator: 'Datei Tools',
    title: opts.title,
    styles: {
      default: {
        document: { run: { font: opts.font ?? 'Calibri', size: Math.round((opts.fontSize ?? 11) * 2) } },
      },
    },
    numbering: {
      config: [
        { reference: 'dt-bullet', levels: levels(false) },
        { reference: 'dt-numbered', levels: levels(true) },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children,
      },
    ],
  });
  const buf = await Packer.toArrayBuffer(doc);
  return { data: new Uint8Array(buf), warnings: builder.warnings };
}
