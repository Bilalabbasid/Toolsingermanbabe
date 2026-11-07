/**
 * Minimal PresentationML (PPTX) writer for the slide model.
 *
 * Written by hand instead of using pptxgenjs, whose ESM build imports
 * `node:fs`/`node:https`, which webpack cannot bundle for the browser.
 * Produces one blank master/layout, absolute-positioned text boxes, shapes,
 * pictures and tables.
 */
import JSZip from 'jszip';
import type { RGB, TextRun } from './model';
import { xmlEscape } from './model';
import type { Deck, SlideElement, SlidePara, SlideTable, SlideText } from './slides';
import { type ImageTranscoder, sniffImage } from './images';

const EMU = 12700;
const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const emu = (pt: number) => Math.max(0, Math.round(pt * EMU));

function hex(c: RGB): string {
  return c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function solid(c: RGB): string {
  return `<a:solidFill><a:srgbClr val="${hex(c)}"/></a:solidFill>`;
}

class SlideRels {
  private rels: string[] = [];
  constructor() {
    this.rels.push(`<Relationship Id="rId1" Type="${REL}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`);
  }
  add(type: string, target: string, external = false): string {
    const id = `rId${this.rels.length + 1}`;
    this.rels.push(`<Relationship Id="${id}" Type="${REL}/${type}" Target="${xmlEscape(target)}"${external ? ' TargetMode="External"' : ''}/>`);
    return id;
  }
  xml(): string {
    return `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${this.rels.join('')}</Relationships>`;
  }
}

function runXml(r: TextRun, defaultSize: number | undefined, defaultColor: RGB | undefined, rels: SlideRels): string {
  const attrs: string[] = ['lang="de-DE"'];
  const size = r.size ?? defaultSize;
  if (size) attrs.push(`sz="${Math.round(Math.max(1, Math.min(4000, size)) * 100)}"`);
  if (r.bold) attrs.push('b="1"');
  if (r.italic) attrs.push('i="1"');
  if (r.underline || r.link) attrs.push('u="sng"');
  if (r.strike) attrs.push('strike="sngStrike"');
  attrs.push('dirty="0"');
  const color = r.color ?? defaultColor;
  let inner = color ? solid(color) : '';
  if (r.mono) inner += '<a:latin typeface="Courier New"/>';
  if (r.link && /^(https?:|mailto:)/i.test(r.link)) inner += `<a:hlinkClick r:id="${rels.add('hyperlink', r.link, true)}"/>`;
  const rPr = `<a:rPr ${attrs.join(' ')}>${inner}</a:rPr>`;
  return r.text
    .split('\n')
    .map((part, i) => `${i > 0 ? `<a:br>${rPr}</a:br>` : ''}${part ? `<a:r>${rPr}<a:t>${xmlEscape(part.replace(/\t/g, '    '))}</a:t></a:r>` : ''}`)
    .join('');
}

function parasXml(paras: SlidePara[], defaultSize: number | undefined, defaultColor: RGB | undefined, rels: SlideRels): string {
  if (!paras.length) return '<a:p><a:endParaRPr lang="de-DE" dirty="0"/></a:p>';
  return paras
    .map((p) => {
      const lvl = Math.min(8, Math.max(0, p.level));
      const attrs: string[] = [];
      const size = p.defaultSize ?? defaultSize ?? 18;
      let bullet = '<a:buNone/>';
      if (p.bullet) {
        const hang = Math.round(size * 1.1 * EMU);
        attrs.push(`marL="${emu(p.marginLeft ?? lvl * 24) + hang}"`, `indent="-${hang}"`);
        bullet = p.bullet === 'number' ? '<a:buFont typeface="+mj-lt"/><a:buAutoNum type="arabicPeriod"/>' : `<a:buFont typeface="Arial"/><a:buChar char="${xmlEscape(p.bullet)}"/>`;
      } else if (p.marginLeft || lvl) {
        attrs.push(`marL="${emu(p.marginLeft ?? lvl * 24)}"`, 'indent="0"');
      }
      if (lvl) attrs.push(`lvl="${lvl}"`);
      if (p.align) attrs.push(`algn="${p.align === 'center' ? 'ctr' : p.align === 'right' ? 'r' : p.align === 'justify' ? 'just' : 'l'}"`);
      const runs = p.runs.map((r) => runXml({ ...r, size: r.size ?? p.defaultSize }, defaultSize, defaultColor, rels)).join('');
      return `<a:p><a:pPr${attrs.length ? ' ' + attrs.join(' ') : ''}>${bullet}</a:pPr>${runs}<a:endParaRPr lang="de-DE" sz="${Math.round(size * 100)}" dirty="0"/></a:p>`;
    })
    .join('');
}

function xfrm(el: { x: number; y: number; w: number; h: number }, tag = 'a:xfrm'): string {
  return `<${tag}><a:off x="${emu(el.x)}" y="${emu(el.y)}"/><a:ext cx="${Math.max(1, emu(el.w))}" cy="${Math.max(1, emu(el.h))}"/></${tag}>`;
}

function textShapeXml(el: SlideText, id: number, rels: SlideRels): string {
  const geom = el.geom === 'ellipse' ? 'ellipse' : el.geom === 'roundRect' ? 'roundRect' : 'rect';
  const fill = el.fill ? solid(el.fill) : '<a:noFill/>';
  const line = el.line ? `<a:ln w="12700">${solid(el.line)}</a:ln>` : '';
  const [l, t, r, b] = (el.insets ?? [7.2, 3.6, 7.2, 3.6]).map(emu);
  const anchor = el.anchor === 'middle' ? 'ctr' : el.anchor === 'bottom' ? 'b' : 't';
  const autofit = el.autofit ? '<a:normAutofit/>' : '';
  return (
    `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Textfeld ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>` +
    `<p:spPr>${xfrm(el)}<a:prstGeom prst="${geom}"><a:avLst/></a:prstGeom>${fill}${line}</p:spPr>` +
    `<p:txBody><a:bodyPr wrap="square" lIns="${l}" tIns="${t}" rIns="${r}" bIns="${b}" anchor="${anchor}" rtlCol="0">${autofit}</a:bodyPr><a:lstStyle/>` +
    parasXml(el.paragraphs, el.defaultSize, el.defaultColor, rels) +
    '</p:txBody></p:sp>'
  );
}

function tableXml(el: SlideTable, id: number, rels: SlideRels): string {
  const ncols = Math.max(el.colWidths.length, ...el.rows.map((r) => r.cells.length), 1);
  const totalW = el.colWidths.reduce((a, b) => a + b, 0) || el.w;
  const widths = Array.from({ length: ncols }, (_, i) => ((el.colWidths[i] ?? totalW / ncols) / totalW) * el.w);
  const border = (tag: string) => `<a:${tag} w="9525">${solid([0.6, 0.62, 0.66])}</a:${tag}>`;
  const rows = el.rows
    .map((row) => {
      const cells = Array.from({ length: ncols }, (_, i) => {
        const cell = row.cells[i];
        const body = parasXml(cell?.paragraphs ?? [], 12, undefined, rels);
        const fill = cell?.fill ? solid(cell.fill) : '<a:noFill/>';
        return `<a:tc><a:txBody><a:bodyPr/><a:lstStyle/>${body}</a:txBody><a:tcPr>${border('lnL')}${border('lnR')}${border('lnT')}${border('lnB')}${fill}</a:tcPr></a:tc>`;
      }).join('');
      return `<a:tr h="${Math.max(emu(row.h), 190500)}">${cells}</a:tr>`;
    })
    .join('');
  return (
    `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${id}" name="Tabelle ${id}"/><p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr>` +
    xfrm(el, 'p:xfrm') +
    `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr/><a:tblGrid>${widths.map((w) => `<a:gridCol w="${emu(w)}"/>`).join('')}</a:tblGrid>${rows}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`
  );
}

const THEME = `${XML_HEAD}<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Datei Tools"><a:themeElements>
<a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme>
<a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
</a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;

const EMPTY_TREE = '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>';

const MASTER = `${XML_HEAD}<p:sldMaster ${NS}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>${EMPTY_TREE}</p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr sz="3200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mj-lt"/></a:defRPr></a:lvl1pPr></p:titleStyle><p:bodyStyle><a:lvl1pPr><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/></a:defRPr></a:lvl1pPr></p:bodyStyle><p:otherStyle><a:lvl1pPr><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/></a:defRPr></a:lvl1pPr></p:otherStyle></p:txStyles></p:sldMaster>`;

const LAYOUT = `${XML_HEAD}<p:sldLayout ${NS} type="blank" preserve="1"><p:cSld name="Leer">${EMPTY_TREE}</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;

const IMAGE_EXT: Record<string, { ext: string; mime: string }> = {
  png: { ext: 'png', mime: 'image/png' },
  jpg: { ext: 'jpeg', mime: 'image/jpeg' },
  gif: { ext: 'gif', mime: 'image/gif' },
  bmp: { ext: 'bmp', mime: 'image/bmp' },
};

export async function writePptx(deck: Deck, opts: { imageTranscoder?: ImageTranscoder } = {}): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', ''); // reserve first position in the archive
  const media = new Map<Uint8Array, string | null>();
  const usedExt = new Set<string>();
  let mediaCount = 0;

  const addImage = async (data: Uint8Array): Promise<string | null> => {
    if (media.has(data)) return media.get(data) ?? null;
    let bytes = data;
    let kind = sniffImage(data);
    if (!IMAGE_EXT[kind]) {
      const t = opts.imageTranscoder ? await opts.imageTranscoder(data, kind) : null;
      if (!t) {
        media.set(data, null);
        return null;
      }
      bytes = t.data;
      kind = t.kind;
    }
    const info = IMAGE_EXT[kind];
    const name = `image${++mediaCount}.${info.ext}`;
    zip.file(`ppt/media/${name}`, bytes);
    usedExt.add(info.ext);
    media.set(data, name);
    return name;
  };

  const W = Math.min(51206400, Math.max(914400, emu(deck.width)));
  const H = Math.min(51206400, Math.max(914400, emu(deck.height)));

  for (let s = 0; s < deck.slides.length; s++) {
    const slide = deck.slides[s];
    const rels = new SlideRels();
    const shapes: string[] = [];
    let nextId = 2;
    let bg = '';
    if (slide.backgroundImage) {
      const name = await addImage(slide.backgroundImage);
      if (name) {
        const rid = rels.add('image', `../media/${name}`);
        bg = `<p:bg><p:bgPr><a:blipFill dpi="0" rotWithShape="1"><a:blip r:embed="${rid}"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:effectLst/></p:bgPr></p:bg>`;
      }
    }
    if (!bg && slide.background) bg = `<p:bg><p:bgPr>${solid(slide.background)}<a:effectLst/></p:bgPr></p:bg>`;
    for (const el of slide.elements as SlideElement[]) {
      if (el.w <= 0 || el.h <= 0) continue;
      const id = nextId++;
      if (el.kind === 'image') {
        const name = await addImage(el.data);
        if (!name) continue;
        const rid = rels.add('image', `../media/${name}`);
        shapes.push(
          `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Bild ${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>` +
            `<p:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>` +
            `<p:spPr>${xfrm(el)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`
        );
      } else if (el.kind === 'text') {
        shapes.push(textShapeXml(el, id, rels));
      } else if (el.kind === 'table') {
        shapes.push(tableXml(el, id, rels));
      }
    }
    const tree = EMPTY_TREE.replace('</p:spTree>', `${shapes.join('')}</p:spTree>`);
    zip.file(`ppt/slides/slide${s + 1}.xml`, `${XML_HEAD}<p:sld ${NS}><p:cSld>${bg}${tree}</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`);
    zip.file(`ppt/slides/_rels/slide${s + 1}.xml.rels`, rels.xml());
  }

  const n = deck.slides.length;
  const slideIds = Array.from({ length: n }, (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 3}"/>`).join('');
  zip.file(
    'ppt/presentation.xml',
    `${XML_HEAD}<p:presentation ${NS} saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>${n ? `<p:sldIdLst>${slideIds}</p:sldIdLst>` : ''}<p:sldSz cx="${W}" cy="${H}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`
  );
  const presRels = [
    `<Relationship Id="rId1" Type="${REL}/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
    `<Relationship Id="rId2" Type="${REL}/theme" Target="theme/theme1.xml"/>`,
    ...Array.from({ length: n }, (_, i) => `<Relationship Id="rId${i + 3}" Type="${REL}/slide" Target="slides/slide${i + 1}.xml"/>`),
    `<Relationship Id="rId${n + 3}" Type="${REL}/presProps" Target="presProps.xml"/>`,
    `<Relationship Id="rId${n + 4}" Type="${REL}/viewProps" Target="viewProps.xml"/>`,
    `<Relationship Id="rId${n + 5}" Type="${REL}/tableStyles" Target="tableStyles.xml"/>`,
  ];
  zip.file('ppt/_rels/presentation.xml.rels', `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels.join('')}</Relationships>`);
  zip.file('ppt/presProps.xml', `${XML_HEAD}<p:presentationPr ${NS}/>`);
  zip.file('ppt/viewProps.xml', `${XML_HEAD}<p:viewPr ${NS}><p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr><p:gridSpacing cx="72008" cy="72008"/></p:viewPr>`);
  zip.file('ppt/tableStyles.xml', `${XML_HEAD}<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>`);
  zip.file('ppt/theme/theme1.xml', THEME);
  zip.file('ppt/slideMasters/slideMaster1.xml', MASTER);
  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="${REL}/theme" Target="../theme/theme1.xml"/></Relationships>`);
  zip.file('ppt/slideLayouts/slideLayout1.xml', LAYOUT);
  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`);

  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  zip.file(
    'docProps/core.xml',
    `${XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${deck.title ? `<dc:title>${xmlEscape(deck.title)}</dc:title>` : ''}<dc:creator>Datei Tools</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`
  );
  zip.file('docProps/app.xml', `${XML_HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Datei Tools</Application><Slides>${n}</Slides></Properties>`);
  zip.file('_rels/.rels', `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="${REL}/extended-properties" Target="docProps/app.xml"/></Relationships>`);

  const P = 'application/vnd.openxmlformats-officedocument.presentationml';
  const overrides = [
    `<Override PartName="/ppt/presentation.xml" ContentType="${P}.presentation.main+xml"/>`,
    `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="${P}.slideMaster+xml"/>`,
    `<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="${P}.slideLayout+xml"/>`,
    `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`,
    `<Override PartName="/ppt/presProps.xml" ContentType="${P}.presProps+xml"/>`,
    `<Override PartName="/ppt/viewProps.xml" ContentType="${P}.viewProps+xml"/>`,
    `<Override PartName="/ppt/tableStyles.xml" ContentType="${P}.tableStyles+xml"/>`,
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>`,
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`,
    ...Array.from({ length: n }, (_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="${P}.slide+xml"/>`),
  ];
  const defaults = [
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    ...[...usedExt].map((e) => `<Default Extension="${e}" ContentType="${Object.values(IMAGE_EXT).find((x) => x.ext === e)?.mime}"/>`),
  ];
  zip.file('[Content_Types].xml', `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${defaults.join('')}${overrides.join('')}</Types>`);

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', mimeType: `${P}.presentation` });
}
