/**
 * ODT (OpenDocument Text) reader (→ Block[]) and writer (Block[] → ODT).
 */
import JSZip from 'jszip';
import type { Align, Block, ImageBlock, TableRow, TextRun } from './model';
import { ConversionError, runsText, xmlEscape } from './model';
import {
  NS,
  OdfStyles,
  assertNotEncrypted,
  attrNS,
  childNodesOf,
  elementChildren,
  lengthToPt,
  localName,
  parseXml,
  readZipText,
  type OdfStyle,
} from './odfCommon';
import { base64ToBytes, type ImageTranscoder, imagePixelSize, mimeForKind, sniffImage } from './images';

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

interface ReadCtx {
  zip: JSZip;
  styles: OdfStyles;
  images: Map<string, Uint8Array>;
}

type InlineStyle = Pick<TextRun, 'bold' | 'italic' | 'underline' | 'strike' | 'mono' | 'size' | 'color' | 'link'>;

function applyStyle(base: InlineStyle, st: OdfStyle | undefined): InlineStyle {
  if (!st) return base;
  return {
    ...base,
    bold: st.bold ?? base.bold,
    italic: st.italic ?? base.italic,
    underline: st.underline ?? base.underline,
    strike: st.strike ?? base.strike,
    mono: st.mono ?? base.mono,
    size: st.fontSize ?? base.size,
    color: st.color ?? base.color,
  };
}

function imageFromFrame(frame: Element, ctx: ReadCtx): ImageBlock | null {
  for (const child of elementChildren(frame)) {
    if (localName(child) !== 'image') continue;
    const href = attrNS(child, NS.xlink, 'href');
    let data: Uint8Array | undefined;
    if (href && !/^[a-z]+:/i.test(href)) data = ctx.images.get(href.replace(/^\.\//, ''));
    if (!data) {
      const bin = elementChildren(child).find((c) => localName(c) === 'binary-data');
      if (bin?.textContent) data = base64ToBytes(bin.textContent);
    }
    if (!data) continue;
    const kind = sniffImage(data);
    if (kind === 'unknown') continue;
    return {
      type: 'image',
      data,
      mime: mimeForKind(kind),
      widthPt: lengthToPt(attrNS(frame, NS.svg, 'width')),
      heightPt: lengthToPt(attrNS(frame, NS.svg, 'height')),
      alt: elementChildren(frame).find((c) => localName(c) === 'title' || localName(c) === 'desc')?.textContent || undefined,
    };
  }
  return null;
}

function inlineRuns(el: Element, base: InlineStyle, ctx: ReadCtx, runs: TextRun[], extra: Block[]) {
  for (const node of childNodesOf(el)) {
    if (node.nodeType === 3) {
      const t = (node.nodeValue || '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ');
      if (t) runs.push({ ...base, text: t });
      continue;
    }
    if (node.nodeType !== 1) continue;
    const c = node as Element;
    switch (localName(c)) {
      case 'span':
        inlineRuns(c, applyStyle(base, ctx.styles.resolve(attrNS(c, NS.text, 'style-name'), 'text')), ctx, runs, extra);
        break;
      case 'a': {
        const href = attrNS(c, NS.xlink, 'href');
        inlineRuns(c, { ...base, link: href && /^(https?:|mailto:)/i.test(href) ? href : base.link }, ctx, runs, extra);
        break;
      }
      case 's':
        runs.push({ ...base, text: ' '.repeat(Math.max(1, parseInt(attrNS(c, NS.text, 'c') || '1', 10))) });
        break;
      case 'tab':
        runs.push({ ...base, text: '\t' });
        break;
      case 'line-break':
        runs.push({ text: '\n' });
        break;
      case 'note': {
        const cit = elementChildren(c).find((x) => localName(x) === 'note-citation');
        if (cit?.textContent) runs.push({ ...base, text: `[${cit.textContent}]` });
        break;
      }
      case 'frame': {
        const img = imageFromFrame(c, ctx);
        if (img) extra.push(img);
        const tb = elementChildren(c).find((x) => localName(x) === 'text-box');
        if (tb) extra.push(...convertBody(tb, ctx, 0));
        break;
      }
      case 'bookmark': case 'bookmark-start': case 'bookmark-end': case 'reference-mark':
      case 'reference-mark-start': case 'reference-mark-end': case 'soft-page-break':
      case 'annotation': case 'annotation-end': case 'change': case 'change-start': case 'change-end':
      case 'toc-mark': case 'alphabetical-index-mark': case 'user-index-mark':
        break;
      case 'ruby': {
        const rb = elementChildren(c).find((x) => localName(x) === 'ruby-base');
        if (rb) inlineRuns(rb, base, ctx, runs, extra);
        break;
      }
      default:
        inlineRuns(c, base, ctx, runs, extra);
    }
  }
}

function trimRuns(runs: TextRun[]): TextRun[] {
  const out = runs.filter((r) => r.text.length > 0).map((r) => ({ ...r }));
  if (out.length) out[0].text = out[0].text.replace(/^ +/, '');
  if (out.length) out[out.length - 1].text = out[out.length - 1].text.replace(/ +$/, '');
  return out.filter((r) => r.text.length > 0);
}

function convertBody(parent: Element, ctx: ReadCtx, listDepth: number, inheritedList?: string): Block[] {
  const out: Block[] = [];
  const pushEmpty = () => {
    const last = out[out.length - 1];
    const prev = out[out.length - 2];
    const isEmpty = (b?: Block) => b?.type === 'paragraph' && !runsText(b.runs).trim();
    if (!(isEmpty(last) && isEmpty(prev))) out.push({ type: 'paragraph', runs: [{ text: '' }], spaceAfter: 0 });
  };
  for (const el of elementChildren(parent)) {
    const ln = localName(el);
    switch (ln) {
      case 'h':
      case 'p': {
        const st = ctx.styles.resolve(attrNS(el, NS.text, 'style-name'), 'paragraph');
        if (st?.breakBefore && out.length) out.push({ type: 'pageBreak' });
        const runs: TextRun[] = [];
        const extra: Block[] = [];
        inlineRuns(el, applyStyle({}, st), ctx, runs, extra);
        const cleaned = trimRuns(runs);
        const align: Align | undefined = st?.align && st.align !== 'left' ? st.align : undefined;
        if (ln === 'h') {
          const level = Math.min(6, Math.max(1, parseInt(attrNS(el, NS.text, 'outline-level') || '1', 10)));
          if (cleaned.some((r) => r.text.trim())) {
            out.push({ type: 'heading', level, runs: cleaned.map((r) => ({ ...r, size: undefined, bold: undefined })), align });
          }
        } else if (cleaned.some((r) => r.text.trim())) {
          out.push({
            type: 'paragraph',
            runs: cleaned,
            align,
            indent: st?.marginLeft && st.marginLeft > 4 && listDepth === 0 ? Math.min(st.marginLeft, 200) : undefined,
          });
        } else if (!extra.length) {
          pushEmpty();
        }
        for (const b of extra) {
          if (b.type === 'image' && !b.align) b.align = align;
          out.push(b);
        }
        if (st?.breakAfter) out.push({ type: 'pageBreak' });
        break;
      }
      case 'list': {
        const styleName = attrNS(el, NS.text, 'style-name') || inheritedList;
        const items: Block[][] = [];
        for (const item of elementChildren(el)) {
          const il = localName(item);
          if (il !== 'list-item' && il !== 'list-header') continue;
          const blocks = convertBody(item, ctx, listDepth + 1, styleName);
          if (il === 'list-header') {
            out.push(...blocks);
            continue;
          }
          items.push(blocks.length ? blocks : [{ type: 'paragraph', runs: [{ text: '' }] }]);
        }
        if (items.length) {
          // Lists that only wrap a heading (outline numbering) are unwrapped
          if (items.every((it) => it.length === 1 && it[0].type === 'heading')) {
            items.forEach((it) => out.push(...it));
          } else {
            const startAttr = attrNS(el, NS.text, 'start-value');
            out.push({
              type: 'list',
              ordered: ctx.styles.isOrdered(styleName, listDepth),
              start: startAttr ? parseInt(startAttr, 10) || 1 : 1,
              items,
            });
          }
        }
        break;
      }
      case 'table': {
        const rows: TableRow[] = [];
        let headerRows = 0;
        const visitRows = (container: Element, header: boolean) => {
          for (const r of elementChildren(container)) {
            const rl = localName(r);
            if (rl === 'table-header-rows') visitRows(r, true);
            else if (rl === 'table-rows' || rl === 'table-row-group') visitRows(r, header);
            else if (rl === 'table-row') {
              const repeat = Math.min(50, parseInt(attrNS(r, NS.table, 'number-rows-repeated') || '1', 10) || 1);
              const cells = elementChildren(r)
                .filter((c) => localName(c) === 'table-cell')
                .map((c) => {
                  const colSpan = parseInt(attrNS(c, NS.table, 'number-columns-spanned') || '1', 10);
                  const rowSpan = parseInt(attrNS(c, NS.table, 'number-rows-spanned') || '1', 10);
                  return {
                    blocks: convertBody(c, ctx, 0),
                    colSpan: colSpan > 1 ? colSpan : undefined,
                    rowSpan: rowSpan > 1 ? rowSpan : undefined,
                  };
                });
              const hasContent = cells.some((c) => c.blocks.length);
              for (let k = 0; k < (hasContent ? 1 : repeat > 1 ? 0 : 1); k++) {
                rows.push({ cells });
                if (header) headerRows++;
              }
            }
          }
        };
        visitRows(el, false);
        if (rows.length) out.push({ type: 'table', rows, headerRows: Math.min(headerRows, rows.length - 1) });
        break;
      }
      case 'frame': {
        const img = imageFromFrame(el, ctx);
        if (img) out.push(img);
        const tb = elementChildren(el).find((x) => localName(x) === 'text-box');
        if (tb) out.push(...convertBody(tb, ctx, listDepth));
        break;
      }
      case 'section':
      case 'index-body':
      case 'index-title':
      case 'table-of-content':
      case 'alphabetical-index':
      case 'illustration-index':
      case 'bibliography':
      case 'user-index':
      case 'object-index':
      case 'table-index':
      case 'text-box':
      case 'a':
        out.push(...convertBody(el, ctx, listDepth, inheritedList));
        break;
      default:
        break;
    }
  }
  return out;
}

export async function odtToBlocks(data: Uint8Array | ArrayBuffer): Promise<{ blocks: Block[]; title?: string }> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new ConversionError('Die Datei ist kein gültiges OpenDocument (ODT) oder beschädigt.');
  }
  await assertNotEncrypted(zip);
  const contentXml = await readZipText(zip, 'content.xml');
  if (!contentXml) throw new ConversionError('Die ODT-Datei enthält keinen Dokumentinhalt (content.xml fehlt).');
  const styles = new OdfStyles();
  const stylesXml = await readZipText(zip, 'styles.xml');
  if (stylesXml) styles.addFrom(parseXml(stylesXml));
  const content = parseXml(contentXml);
  styles.addFrom(content);

  const images = new Map<string, Uint8Array>();
  const pics = Object.keys(zip.files).filter((p) => !zip.files[p].dir && /^(Pictures|media|ObjectReplacements)\//i.test(p));
  for (const p of pics) images.set(p, await zip.files[p].async('uint8array'));

  const textEl = content.getElementsByTagNameNS(NS.office, 'text')[0] ||
    Array.from(content.getElementsByTagName('*')).find((e) => localName(e) === 'text' && localName(e.parentNode as Element) === 'body');
  if (!textEl) throw new ConversionError('Die ODT-Datei enthält keinen Textkörper.');

  const blocks = convertBody(textEl as Element, { zip, styles, images }, 0);
  let title: string | undefined;
  const meta = await readZipText(zip, 'meta.xml');
  if (meta) {
    const m = /<dc:title>([^<]*)<\/dc:title>/.exec(meta);
    if (m?.[1]) title = m[1];
  }
  return { blocks, title };
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

const ODT_NS =
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" ' +
  'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" ' +
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" ' +
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" ' +
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" ' +
  'xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
  'xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" ' +
  'xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"';

class OdtWriter {
  private textStyles = new Map<string, string>();
  private paraStyles = new Map<string, string>();
  private pictures: Array<{ path: string; data: Uint8Array; mime: string }> = [];
  private frameCount = 0;
  private tableCount = 0;
  warnings: string[] = [];

  constructor(private opts: { imageTranscoder?: ImageTranscoder }) {}

  private textStyle(r: TextRun): string | null {
    const props: string[] = [];
    if (r.bold) props.push('fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"');
    if (r.italic) props.push('fo:font-style="italic" style:font-style-asian="italic" style:font-style-complex="italic"');
    if (r.underline || r.link) props.push('style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"');
    if (r.strike) props.push('style:text-line-through-style="solid"');
    if (r.mono) props.push('style:font-name="Liberation Mono" fo:font-family="\'Courier New\'"');
    if (r.size) props.push(`fo:font-size="${Math.round(r.size * 10) / 10}pt"`);
    if (r.link) props.push('fo:color="#0563c1"');
    else if (r.color) props.push(`fo:color="#${r.color.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}"`);
    if (!props.length) return null;
    const key = props.join(' ');
    let name = this.textStyles.get(key);
    if (!name) {
      name = `T${this.textStyles.size + 1}`;
      this.textStyles.set(key, name);
    }
    return name;
  }

  private paraStyle(parent: string, align?: Align, opts: { indent?: number; breakBefore?: boolean; tight?: boolean } = {}): string {
    const props: string[] = [];
    if (align && align !== 'left') props.push(`fo:text-align="${align === 'right' ? 'end' : align === 'center' ? 'center' : 'justify'}"`);
    if (opts.indent) props.push(`fo:margin-left="${(opts.indent / 72 * 2.54).toFixed(2)}cm"`);
    if (opts.breakBefore) props.push('fo:break-before="page"');
    if (opts.tight) props.push('fo:margin-top="0cm" fo:margin-bottom="0cm"');
    if (!props.length) return parent;
    const key = `${parent}|${props.join(' ')}`;
    let name = this.paraStyles.get(key);
    if (!name) {
      name = `P${this.paraStyles.size + 1}`;
      this.paraStyles.set(key, name);
    }
    return name;
  }

  private runs(runs: TextRun[]): string {
    return runs
      .map((r) => {
        const parts = r.text.split('\n');
        const body = parts
          .map((p) =>
            xmlEscape(p)
              .replace(/\t/g, '<text:tab/>')
              .replace(/ {2,}/g, (m) => ` <text:s text:c="${m.length - 1}"/>`)
          )
          .join('<text:line-break/>');
        const style = this.textStyle(r);
        let xml = style ? `<text:span text:style-name="${style}">${body}</text:span>` : body;
        if (r.link && /^(https?:|mailto:)/i.test(r.link)) {
          xml = `<text:a xlink:type="simple" xlink:href="${xmlEscape(r.link)}">${xml}</text:a>`;
        }
        return xml;
      })
      .join('');
  }

  private async image(b: ImageBlock): Promise<string> {
    if (!b.data) return '';
    let data = b.data;
    let kind = sniffImage(data);
    if (!['png', 'jpg', 'gif', 'svg'].includes(kind)) {
      const t = this.opts.imageTranscoder ? await this.opts.imageTranscoder(data, kind) : null;
      if (!t) return '';
      data = t.data;
      kind = t.kind;
    }
    const ext = kind === 'jpg' ? 'jpg' : kind;
    const path = `Pictures/image${this.pictures.length + 1}.${ext}`;
    this.pictures.push({ path, data, mime: mimeForKind(kind) });
    const px = imagePixelSize(data) ?? { width: 400, height: 300 };
    let w = b.widthPt ?? px.width * 0.75;
    let h = b.heightPt ?? px.height * 0.75;
    if (b.widthPt && !b.heightPt) h = (px.height / px.width) * w;
    if (b.heightPt && !b.widthPt) w = (px.width / px.height) * h;
    const scale = Math.min(1, 481 / w, 680 / h);
    const cm = (pt: number) => `${((pt * scale) / 72 * 2.54).toFixed(3)}cm`;
    this.frameCount++;
    return `<draw:frame draw:style-name="fr1" draw:name="Bild${this.frameCount}" text:anchor-type="as-char" svg:width="${cm(w)}" svg:height="${cm(h)}" draw:z-index="0"><draw:image xlink:href="${path}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>${b.alt ? `<svg:title>${xmlEscape(b.alt)}</svg:title>` : ''}</draw:frame>`;
  }

  async body(blocks: Block[], listDepth = 0, pendingBreak = { value: false }): Promise<string> {
    const out: string[] = [];
    const takeBreak = () => {
      const v = pendingBreak.value;
      pendingBreak.value = false;
      return v;
    };
    for (const b of blocks) {
      switch (b.type) {
        case 'heading': {
          const lvl = Math.min(6, Math.max(1, b.level));
          const st = this.paraStyle(`Heading_20_${lvl}`, b.align, { breakBefore: takeBreak() });
          out.push(`<text:h text:style-name="${st}" text:outline-level="${lvl}">${this.runs(b.runs)}</text:h>`);
          break;
        }
        case 'paragraph': {
          const parent = b.preformatted ? 'Preformatted_20_Text' : b.quote ? 'Quotations' : 'Standard';
          const st = this.paraStyle(parent, b.align, {
            indent: listDepth === 0 ? b.indent : undefined,
            breakBefore: takeBreak(),
            tight: b.spaceAfter === 0 && !b.preformatted,
          });
          out.push(`<text:p text:style-name="${st}">${this.runs(b.runs)}</text:p>`);
          break;
        }
        case 'list': {
          const items: string[] = [];
          for (const item of b.items) {
            const inner = await this.body(item.length ? item : [{ type: 'paragraph', runs: [{ text: '' }] }], listDepth + 1, pendingBreak);
            items.push(`<text:list-item>${inner}</text:list-item>`);
          }
          const style = listDepth === 0 ? ` text:style-name="${b.ordered ? 'LNum' : 'LBullet'}"` : '';
          out.push(`<text:list${style}>${items.join('')}</text:list>`);
          break;
        }
        case 'table': {
          const ncols = Math.max(1, ...b.rows.map((r) => r.cells.reduce((s, c) => s + (c.colSpan ?? 1), 0)));
          this.tableCount++;
          const name = `Tabelle${this.tableCount}`;
          const rowsXml: string[] = [];
          const headerRows = b.headerRows ?? 0;
          for (let ri = 0; ri < b.rows.length; ri++) {
            const r = b.rows[ri];
            const cells: string[] = [];
            let used = 0;
            for (const c of r.cells) {
              let inner = await this.body(c.blocks, 0);
              if (!inner) inner = '<text:p text:style-name="Table_20_Contents"/>';
              if (ri < headerRows || c.header) inner = inner.replace(/text:style-name="Standard"/g, 'text:style-name="Table_20_Heading"');
              const span = c.colSpan ?? 1;
              const rs = c.rowSpan ?? 1;
              cells.push(
                `<table:table-cell table:style-name="TCell" office:value-type="string"${span > 1 ? ` table:number-columns-spanned="${span}"` : ''}${rs > 1 ? ` table:number-rows-spanned="${rs}"` : ''}>${inner}</table:table-cell>`
              );
              for (let k = 1; k < span; k++) cells.push('<table:covered-table-cell/>');
              used += span;
            }
            for (; used < ncols; used++) cells.push('<table:table-cell table:style-name="TCell"><text:p/></table:table-cell>');
            rowsXml.push(`<table:table-row>${cells.join('')}</table:table-row>`);
          }
          const header = headerRows > 0 ? `<table:table-header-rows>${rowsXml.slice(0, headerRows).join('')}</table:table-header-rows>` : '';
          out.push(
            `<table:table table:name="${name}" table:style-name="Tbl"><table:table-column table:number-columns-repeated="${ncols}"/>${header}${rowsXml.slice(headerRows).join('')}</table:table>`
          );
          break;
        }
        case 'image': {
          const frame = await this.image(b);
          if (frame) {
            const st = this.paraStyle('Standard', b.align, { breakBefore: takeBreak() });
            out.push(`<text:p text:style-name="${st}">${frame}</text:p>`);
          }
          break;
        }
        case 'pageBreak':
          pendingBreak.value = true;
          break;
        case 'rule':
          out.push('<text:p text:style-name="Horizontal_20_Line"/>');
          break;
      }
    }
    if (pendingBreak.value && listDepth === 0 && blocks.length && blocks[blocks.length - 1].type === 'pageBreak') {
      // trailing page break: nothing follows, ignore
      pendingBreak.value = false;
    }
    return out.join('');
  }

  automaticStyles(): string {
    const parts: string[] = [];
    for (const [props, name] of this.textStyles) {
      parts.push(`<style:style style:name="${name}" style:family="text"><style:text-properties ${props}/></style:style>`);
    }
    for (const [key, name] of this.paraStyles) {
      const [parent, props] = key.split('|');
      parts.push(`<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}"><style:paragraph-properties ${props}/></style:style>`);
    }
    parts.push(
      '<style:style style:name="Tbl" style:family="table"><style:table-properties style:width="17cm" table:align="margins" fo:margin-bottom="0.2cm"/></style:style>',
      '<style:style style:name="TCell" style:family="table-cell"><style:table-cell-properties fo:padding="0.1cm" fo:border="0.5pt solid #9ea6b3"/></style:style>',
      '<style:style style:name="fr1" style:family="graphic" style:parent-style-name="Graphics"><style:graphic-properties style:vertical-pos="top" style:vertical-rel="baseline" fo:border="none"/></style:style>'
    );
    const levels = (ordered: boolean) =>
      Array.from({ length: 10 }, (_, i) => {
        const indent = (0.635 * (i + 1)).toFixed(3);
        const props = `<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${indent}cm" fo:text-indent="-0.635cm" fo:margin-left="${indent}cm"/></style:list-level-properties>`;
        return ordered
          ? `<text:list-level-style-number text:level="${i + 1}" style:num-suffix="." style:num-format="1">${props}</text:list-level-style-number>`
          : `<text:list-level-style-bullet text:level="${i + 1}" text:bullet-char="${['•', '◦', '▪'][i % 3]}">${props}</text:list-level-style-bullet>`;
      }).join('');
    parts.push(`<text:list-style style:name="LBullet">${levels(false)}</text:list-style>`);
    parts.push(`<text:list-style style:name="LNum">${levels(true)}</text:list-style>`);
    return parts.join('');
  }

  get pictureFiles() {
    return this.pictures;
  }
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles ${ODT_NS} office:version="1.3">
<office:font-face-decls>
<style:font-face style:name="Liberation Sans" svg:font-family="'Liberation Sans'" style:font-family-generic="swiss" style:font-pitch="variable"/>
<style:font-face style:name="Liberation Mono" svg:font-family="'Liberation Mono'" style:font-family-generic="modern" style:font-pitch="fixed"/>
</office:font-face-decls>
<office:styles>
<style:default-style style:family="paragraph"><style:paragraph-properties fo:orphans="2" fo:widows="2"/><style:text-properties style:font-name="Liberation Sans" fo:font-size="11pt" fo:language="de" fo:country="DE"/></style:default-style>
<style:style style:name="Standard" style:family="paragraph" style:class="text"><style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.212cm" fo:line-height="115%"/></style:style>
<style:style style:name="Heading" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Standard" style:class="text"><style:paragraph-properties fo:margin-top="0.423cm" fo:margin-bottom="0.212cm" fo:keep-with-next="always"/><style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/></style:style>
${[20, 16, 14, 12.5, 11.5, 11]
  .map(
    (sz, i) =>
      `<style:style style:name="Heading_20_${i + 1}" style:display-name="Heading ${i + 1}" style:family="paragraph" style:parent-style-name="Heading" style:next-style-name="Standard" style:default-outline-level="${i + 1}" style:class="text"><style:text-properties fo:font-size="${sz}pt"/></style:style>`
  )
  .join('\n')}
<style:style style:name="Preformatted_20_Text" style:display-name="Preformatted Text" style:family="paragraph" style:parent-style-name="Standard" style:class="html"><style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0cm"/><style:text-properties style:font-name="Liberation Mono" fo:font-size="10pt"/></style:style>
<style:style style:name="Quotations" style:family="paragraph" style:parent-style-name="Standard" style:class="html"><style:paragraph-properties fo:margin-left="1cm" fo:margin-right="1cm"/><style:text-properties fo:font-style="italic"/></style:style>
<style:style style:name="Table_20_Contents" style:display-name="Table Contents" style:family="paragraph" style:parent-style-name="Standard" style:class="extra"><style:paragraph-properties fo:margin-bottom="0cm"/></style:style>
<style:style style:name="Table_20_Heading" style:display-name="Table Heading" style:family="paragraph" style:parent-style-name="Table_20_Contents" style:class="extra"><style:text-properties fo:font-weight="bold"/></style:style>
<style:style style:name="Horizontal_20_Line" style:display-name="Horizontal Line" style:family="paragraph" style:parent-style-name="Standard" style:class="html"><style:paragraph-properties fo:margin-bottom="0.3cm" fo:border-bottom="0.06pt solid #808080" fo:padding="0cm"/></style:style>
<style:style style:name="Graphics" style:family="graphic"><style:graphic-properties text:anchor-type="paragraph" svg:x="0cm" svg:y="0cm" style:wrap="none" style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph"/></style:style>
</office:styles>
<office:automatic-styles>
<style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" style:print-orientation="portrait" fo:margin-top="2cm" fo:margin-bottom="2cm" fo:margin-left="2cm" fo:margin-right="2cm"/></style:page-layout>
</office:automatic-styles>
<office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`;

export async function blocksToOdt(
  blocks: Block[],
  opts: { title?: string; imageTranscoder?: ImageTranscoder } = {}
): Promise<Uint8Array> {
  const w = new OdtWriter(opts);
  const body = (await w.body(blocks)) || '<text:p text:style-name="Standard"/>';
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content ${ODT_NS} office:version="1.3"><office:automatic-styles>${w.automaticStyles()}</office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
  const meta = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta ${ODT_NS} office:version="1.3"><office:meta><meta:generator>Datei Tools</meta:generator>${opts.title ? `<dc:title>${xmlEscape(opts.title)}</dc:title>` : ''}</office:meta></office:document-meta>`;
  const pictures = w.pictureFiles;
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
<manifest:file-entry manifest:full-path="/" manifest:version="1.3" manifest:media-type="application/vnd.oasis.opendocument.text"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
${pictures.map((p) => `<manifest:file-entry manifest:full-path="${p.path}" manifest:media-type="${p.mime}"/>`).join('\n')}
</manifest:manifest>`;

  const zip = new JSZip();
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
  zip.file('content.xml', content);
  zip.file('styles.xml', STYLES_XML);
  zip.file('meta.xml', meta);
  for (const p of pictures) zip.file(p.path, p.data, { compression: 'STORE' });
  zip.file('META-INF/manifest.xml', manifest);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', mimeType: 'application/vnd.oasis.opendocument.text' });
}
