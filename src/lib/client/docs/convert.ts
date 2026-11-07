/**
 * Client-side document conversion dispatcher. Every mode runs entirely in the
 * browser; heavy libraries are loaded lazily per mode.
 */
import type { DocConvertMode } from '@/components/engines/DocConvertEngine';
import type { Block, ProgressContext } from './model';
import { ConversionError, baseName, checkAbort, extensionOf, hasTextContent } from './model';

export interface ConvertOptions {
  /** pdf-to-word: editable text or page images. */
  pdfWordLayout?: 'text' | 'image';
  /** xlsx-to-csv */
  csvDelimiter?: ';' | ',' | '\t';
  csvBom?: boolean;
  /** excel/csv-to-pdf */
  orientation?: 'auto' | 'portrait' | 'landscape';
  /** txt-to-pdf */
  txtFont?: 'sans' | 'mono';
}

export interface ConvertResult {
  blob: Blob;
  fileName: string;
  warnings: string[];
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv;charset=utf-8',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain;charset=utf-8',
  zip: 'application/zip',
};

type Kind = 'zip' | 'cfb' | 'rtf' | 'pdf' | 'html' | 'other';

function sniff(bytes: Uint8Array): Kind {
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) return 'zip';
  if (bytes.length >= 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return 'cfb';
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 512)));
  if (/^\s*\{\\rtf/.test(head)) return 'rtf';
  if (head.startsWith('%PDF') || head.includes('%PDF-')) return 'pdf';
  if (/^\s*(<!doctype html|<html|<\?xml[^>]*>\s*<html)/i.test(head)) return 'html';
  return 'other';
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function transcoder() {
  return (await import('./images')).browserImageTranscoder;
}

/** Reads any word-processing input (DOCX, DOC, ODT, RTF, HTML disguised as DOC) into blocks. */
async function readWordLike(bytes: Uint8Array, expected: 'docx' | 'doc' | 'odt' | 'rtf'): Promise<{ blocks: Block[]; warnings: string[]; title?: string }> {
  const kind = sniff(bytes);
  if (kind === 'rtf') {
    const { rtfToBlocks } = await import('./rtf');
    return { blocks: rtfToBlocks(bytes), warnings: [] };
  }
  if (kind === 'html') {
    const [{ htmlStringToBlocks }, { decodeHtml }] = await Promise.all([import('./htmlBlocks'), import('./textDecode')]);
    return { blocks: htmlStringToBlocks(decodeHtml(bytes)).blocks, warnings: [] };
  }
  if (kind === 'cfb') {
    const { docToBlocks, cfbHasStream } = await import('./docBinary');
    if (cfbHasStream(bytes, 'EncryptionInfo')) {
      throw new ConversionError('Das Dokument ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz und versuchen Sie es erneut.');
    }
    return docToBlocks(bytes);
  }
  if (kind === 'zip') {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(bytes).catch(() => null);
    if (!zip) throw new ConversionError('Die Datei ist beschädigt und konnte nicht geöffnet werden.');
    if (zip.file('word/document.xml')) {
      const { docxToBlocks } = await import('./docxReader');
      return docxToBlocks(toArrayBuffer(bytes));
    }
    if (zip.file('content.xml')) {
      const { odtToBlocks } = await import('./odt');
      const r = await odtToBlocks(bytes);
      return { blocks: r.blocks, warnings: [], title: r.title };
    }
    throw new ConversionError('Die Datei ist kein Textdokument (Word/OpenDocument).');
  }
  const names: Record<string, string> = { docx: 'Word-Dokument (DOCX)', doc: 'Word-97–2003-Dokument (DOC)', odt: 'OpenDocument-Text (ODT)', rtf: 'RTF-Dokument' };
  throw new ConversionError(`Die Datei ist kein gültiges ${names[expected]}.`);
}

function ensureContent(blocks: Block[]) {
  if (!hasTextContent(blocks)) throw new ConversionError('Im Dokument wurde kein Inhalt gefunden.');
}

async function blocksToPdfBlob(blocks: Block[], title: string, ctx: ProgressContext, extra: { landscape?: boolean; family?: 'sans' | 'mono'; fontSize?: number } = {}): Promise<Blob> {
  const [{ renderBlocksToPdf, A4_LANDSCAPE, A4_PORTRAIT }, imageTranscoder] = await Promise.all([import('./pdfFlow'), transcoder()]);
  const bytes = await renderBlocksToPdf(blocks, {
    title,
    pageSize: extra.landscape ? A4_LANDSCAPE : A4_PORTRAIT,
    margin: extra.landscape ? 40 : 56,
    fontFamily: extra.family ?? 'sans',
    fontSize: extra.fontSize,
    imageTranscoder,
    signal: ctx.signal,
    onProgress: (f) => ctx.onProgress?.(60 + Math.round(f * 30), 'PDF wird gesetzt…'),
  });
  return new Blob([bytes as BlobPart], { type: MIME.pdf });
}

async function blocksToDocxBlob(blocks: Block[], title: string): Promise<{ blob: Blob; warnings: string[] }> {
  const [{ blocksToDocx }, imageTranscoder] = await Promise.all([import('./docxWriter'), transcoder()]);
  const { data, warnings } = await blocksToDocx(blocks, { title, imageTranscoder });
  return { blob: new Blob([data as BlobPart], { type: MIME.docx }), warnings };
}

export async function convertDocument(
  mode: DocConvertMode,
  file: File,
  opts: ConvertOptions = {},
  ctx: ProgressContext = {}
): Promise<ConvertResult> {
  const progress = (pct: number, text?: string) => ctx.onProgress?.(pct, text);
  const base = baseName(file.name);
  const ext = extensionOf(file.name);
  progress(5, 'Datei wird eingelesen…');
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!bytes.length) throw new ConversionError('Die Datei ist leer.');
  checkAbort(ctx.signal);
  const warnings: string[] = [];
  const done = (blob: Blob, extension: string): ConvertResult => {
    progress(100, 'Fertig');
    return { blob, fileName: `datei_tools_${base}.${extension}`, warnings };
  };

  switch (mode) {
    // ------------------------------------------------------------ Word-like → PDF
    case 'word-to-pdf':
    case 'doc-to-pdf':
    case 'odt-to-pdf':
    case 'rtf-to-pdf': {
      progress(15, 'Dokument wird analysiert…');
      const expected = mode === 'odt-to-pdf' ? 'odt' : mode === 'rtf-to-pdf' ? 'rtf' : ext === 'doc' ? 'doc' : 'docx';
      const r = await readWordLike(bytes, expected);
      warnings.push(...r.warnings);
      ensureContent(r.blocks);
      progress(55, 'Layout wird berechnet…');
      return done(await blocksToPdfBlob(r.blocks, r.title ?? base, ctx), 'pdf');
    }
    case 'txt-to-pdf': {
      const [{ decodeText }, { plainTextToBlocks }] = await Promise.all([import('./textDecode'), import('./model')]);
      const text = decodeText(bytes);
      if (!text.trim()) throw new ConversionError('Die Textdatei ist leer.');
      const mono = opts.txtFont === 'mono';
      progress(40, 'Text wird gesetzt…');
      return done(await blocksToPdfBlob(plainTextToBlocks(text, mono), base, ctx, { family: mono ? 'mono' : 'sans', fontSize: mono ? 9.5 : 11 }), 'pdf');
    }
    case 'html-to-pdf': {
      const [{ htmlStringToBlocks }, { decodeHtml }, { walkBlocks }] = await Promise.all([import('./htmlBlocks'), import('./textDecode'), import('./model')]);
      const parsed = htmlStringToBlocks(decodeHtml(bytes));
      ensureContent(parsed.blocks);
      let external = false;
      walkBlocks(parsed.blocks, (b) => {
        if (b.type === 'image' && !b.data) external = true;
      });
      if (external) warnings.push('Externe Bilder (Links auf andere Dateien oder Webseiten) werden aus Datenschutzgründen nicht geladen.');
      progress(45, 'Seite wird gesetzt…');
      return done(await blocksToPdfBlob(parsed.blocks, parsed.title ?? base, ctx), 'pdf');
    }
    case 'epub-to-pdf':
    case 'epub-to-txt': {
      const epub = await import('./epub');
      const content = await epub.readEpub(bytes, { signal: ctx.signal, onProgress: (f) => progress(10 + Math.round(f * 45), 'Kapitel werden gelesen…') });
      if (mode === 'epub-to-txt') {
        const text = epub.epubToText(content);
        return done(new Blob([text], { type: MIME.txt }), 'txt');
      }
      return done(await blocksToPdfBlob(epub.epubChaptersToBlocks(content), content.title ?? base, ctx), 'pdf');
    }

    // ------------------------------------------------------------ Word-like ↔ Word-like
    case 'doc-to-docx':
    case 'odt-to-docx':
    case 'rtf-to-docx': {
      progress(15, 'Dokument wird analysiert…');
      const r = await readWordLike(bytes, mode === 'doc-to-docx' ? 'doc' : mode === 'odt-to-docx' ? 'odt' : 'rtf');
      warnings.push(...r.warnings);
      ensureContent(r.blocks);
      progress(60, 'Word-Dokument wird erstellt…');
      const out = await blocksToDocxBlob(r.blocks, r.title ?? base);
      warnings.push(...out.warnings);
      return done(out.blob, 'docx');
    }
    case 'txt-to-docx': {
      const [{ decodeText }, { plainTextToBlocks }] = await Promise.all([import('./textDecode'), import('./model')]);
      const text = decodeText(bytes);
      if (!text.trim()) throw new ConversionError('Die Textdatei ist leer.');
      progress(50, 'Word-Dokument wird erstellt…');
      const blocks = plainTextToBlocks(text).map((b) => (b.type === 'paragraph' ? { ...b, preformatted: false } : b));
      const out = await blocksToDocxBlob(blocks, base);
      return done(out.blob, 'docx');
    }
    case 'docx-to-odt': {
      const r = await readWordLike(bytes, 'docx');
      warnings.push(...r.warnings);
      ensureContent(r.blocks);
      progress(60, 'OpenDocument wird erstellt…');
      const [{ blocksToOdt }, imageTranscoder] = await Promise.all([import('./odt'), transcoder()]);
      const data = await blocksToOdt(r.blocks, { title: base, imageTranscoder });
      return done(new Blob([data as BlobPart], { type: MIME.odt }), 'odt');
    }
    case 'docx-to-doc': {
      const r = await readWordLike(bytes, 'docx');
      warnings.push(...r.warnings);
      ensureContent(r.blocks);
      progress(60, 'Word-97–2003-Dokument wird erstellt…');
      const [{ blocksToRtf, rtfToBytes }, imageTranscoder] = await Promise.all([import('./rtf'), transcoder()]);
      const rtf = await blocksToRtf(r.blocks, { title: base, imageTranscoder });
      return done(new Blob([rtfToBytes(rtf) as BlobPart], { type: MIME.doc }), 'doc');
    }

    // ------------------------------------------------------------ Spreadsheets
    case 'csv-to-xlsx': {
      const { csvToXlsx } = await import('./spreadsheet');
      progress(40, 'Tabelle wird erstellt…');
      return done(new Blob([csvToXlsx(bytes, base) as BlobPart], { type: MIME.xlsx }), 'xlsx');
    }
    case 'xlsx-to-csv': {
      const { workbookToCsv } = await import('./spreadsheet');
      progress(40, 'CSV wird erstellt…');
      const r = await workbookToCsv(bytes, base, { delimiter: opts.csvDelimiter ?? ';', bom: opts.csvBom ?? true });
      if (r.extension === 'zip') warnings.push(`Die Arbeitsmappe enthält ${r.sheets} Tabellenblätter – jedes Blatt wurde als eigene CSV-Datei in ein ZIP-Archiv gepackt.`);
      return done(new Blob([r.data as BlobPart], { type: MIME[r.extension] }), r.extension);
    }
    case 'xls-to-xlsx': {
      const { xlsToXlsx } = await import('./spreadsheet');
      progress(40, 'Arbeitsmappe wird umgewandelt…');
      const r = xlsToXlsx(bytes);
      return done(new Blob([r.data as BlobPart], { type: MIME.xlsx }), 'xlsx');
    }
    case 'xlsx-to-xls': {
      const { xlsxToXls } = await import('./spreadsheet');
      progress(40, 'Arbeitsmappe wird umgewandelt…');
      const r = xlsxToXls(bytes);
      warnings.push(...r.warnings);
      return done(new Blob([r.data as BlobPart], { type: MIME.xls }), 'xls');
    }
    case 'excel-to-pdf':
    case 'csv-to-pdf': {
      const sheet = await import('./spreadsheet');
      progress(25, 'Tabelle wird gelesen…');
      const isCsv = mode === 'csv-to-pdf' || ext === 'csv';
      const r = isCsv ? sheet.csvToBlocks(bytes) : sheet.workbookToBlocks(bytes);
      const landscape = opts.orientation === 'landscape' || ((opts.orientation ?? 'auto') === 'auto' && r.maxColumns > 6);
      progress(50, 'PDF wird gesetzt…');
      return done(await blocksToPdfBlob(r.blocks, base, ctx, { landscape }), 'pdf');
    }

    // ------------------------------------------------------------ Presentations
    case 'ppt-to-pdf':
    case 'ppt-to-pptx':
    case 'odp-to-pptx': {
      const kind = sniff(bytes);
      progress(15, 'Präsentation wird gelesen…');
      let deck;
      if (mode === 'odp-to-pptx') {
        if (kind !== 'zip') throw new ConversionError('Die Datei ist keine gültige OpenDocument-Präsentation (ODP).');
        deck = await (await import('./odpReader')).readOdp(bytes, { signal: ctx.signal });
      } else if (kind === 'cfb') {
        const r = (await import('./pptBinary')).readPpt(bytes);
        deck = r.deck;
        warnings.push(...r.warnings);
      } else if (kind === 'zip') {
        deck = await (await import('./pptxReader')).readPptx(bytes, { signal: ctx.signal, onProgress: (f) => progress(15 + Math.round(f * 35), 'Folien werden gelesen…') });
      } else {
        throw new ConversionError('Die Datei ist keine gültige PowerPoint-Präsentation.');
      }
      if (!deck.slides.length) throw new ConversionError('Die Präsentation enthält keine sichtbaren Folien.');
      if (!deck.title) deck.title = base;
      const [slides, imageTranscoder] = await Promise.all([import('./slides'), transcoder()]);
      if (mode === 'ppt-to-pdf') {
        progress(55, 'Folien werden gezeichnet…');
        const pdf = await slides.renderDeckToPdf(deck, { imageTranscoder, signal: ctx.signal, onProgress: (f) => progress(55 + Math.round(f * 40), 'Folien werden gezeichnet…') });
        return done(new Blob([pdf as BlobPart], { type: MIME.pdf }), 'pdf');
      }
      progress(60, 'PowerPoint-Datei wird erstellt…');
      const pptx = await slides.deckToPptx(deck, { imageTranscoder });
      return done(new Blob([pptx as BlobPart], { type: MIME.pptx }), 'pptx');
    }
    case 'pptx-to-ppt':
      throw new ConversionError('Das Speichern im alten binären PPT-Format ist im Browser nicht möglich. Bitte nutzen Sie PPTX oder wandeln Sie die Präsentation in PDF um.');

    // ------------------------------------------------------------ PDF → Office
    case 'pdf-to-word':
    case 'pdf-to-excel':
    case 'pdf-to-ppt': {
      if (sniff(bytes) !== 'pdf') throw new ConversionError('Die Datei ist keine gültige PDF.');
      const [{ extractPdfPages }, pdfText] = await Promise.all([import('./pdfExtract'), import('./pdfText')]);
      const images = mode === 'pdf-to-ppt' || (mode === 'pdf-to-word' && opts.pdfWordLayout === 'image') ? 'all' : mode === 'pdf-to-word' ? 'scanned' : 'none';
      const pages = await extractPdfPages(bytes, {
        images,
        imageWidth: mode === 'pdf-to-ppt' ? 1600 : 1400,
        withFonts: mode === 'pdf-to-word',
        signal: ctx.signal,
        onProgress: (f) => progress(10 + Math.round(f * 55), 'Seiten werden analysiert…'),
      });
      if (!pages.length) throw new ConversionError('Die PDF enthält keine Seiten.');

      if (mode === 'pdf-to-ppt') {
        progress(70, 'Folien werden erstellt…');
        const [{ deckToPptx }] = await Promise.all([import('./slides')]);
        const W = pages[0].width;
        const H = pages[0].height;
        const deck = {
          width: W,
          height: H,
          title: base,
          slides: pages.map((p) => {
            const s = Math.min(W / p.width, H / p.height);
            const w = p.width * s;
            const h = p.height * s;
            return { elements: p.image ? [{ kind: 'image' as const, data: p.image, x: (W - w) / 2, y: (H - h) / 2, w, h }] : [] };
          }),
        };
        const pptx = await deckToPptx(deck);
        return done(new Blob([pptx as BlobPart], { type: MIME.pptx }), 'pptx');
      }

      if (mode === 'pdf-to-excel') {
        progress(70, 'Tabellen werden erkannt…');
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();
        pages.forEach((p, i) => {
          const grid = pdfText.pageToGrid(p);
          if (!grid.length) return;
          const ws = XLSX.utils.aoa_to_sheet(grid);
          const ncols = Math.max(...grid.map((r) => r.length));
          ws['!cols'] = Array.from({ length: ncols }, (_, c) => ({
            wch: Math.min(50, Math.max(8, ...grid.map((r) => String(r[c] ?? '').length + 2))),
          }));
          XLSX.utils.book_append_sheet(wb, ws, `Seite ${i + 1}`);
        });
        if (!wb.SheetNames.length) {
          throw new ConversionError('Die PDF enthält keinen auslesbaren Text (z. B. eingescannte Seiten). Für gescannte Dokumente nutzen Sie bitte zuerst die Texterkennung (OCR).');
        }
        const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer;
        return done(new Blob([out], { type: MIME.xlsx }), 'xlsx');
      }

      // pdf-to-word
      let blocks: Block[];
      if (opts.pdfWordLayout === 'image') {
        blocks = [];
        pages.forEach((p, i) => {
          if (i > 0) blocks.push({ type: 'pageBreak' });
          if (p.image) blocks.push({ type: 'image', data: p.image, widthPt: p.width, heightPt: p.height, align: 'center' });
        });
      } else {
        progress(70, 'Absätze werden rekonstruiert…');
        blocks = pdfText.pagesToBlocks(pages);
        const scanned = pages.filter((p) => p.image && p.items.reduce((s, it) => s + it.str.trim().length, 0) < 20).length;
        if (scanned) {
          warnings.push(
            scanned === pages.length
              ? 'Die PDF enthält keinen Text (gescannte Seiten). Die Seiten wurden als Bilder eingefügt – für bearbeitbaren Text nutzen Sie bitte zuerst die Texterkennung (OCR).'
              : `${scanned} Seite(n) ohne Text (Scan) wurden als Bild eingefügt.`
          );
        }
      }
      ensureContent(blocks);
      progress(85, 'Word-Dokument wird erstellt…');
      const out = await blocksToDocxBlob(blocks, base);
      return done(out.blob, 'docx');
    }
  }
  throw new ConversionError('Dieser Konvertierungsmodus wird nicht unterstützt.');
}
