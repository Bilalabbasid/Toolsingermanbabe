/**
 * EPUB reader: spine chapters (XHTML) → Block[] / plain text.
 */
import JSZip from 'jszip';
import type { Block } from './model';
import { ConversionError, blocksToPlainText, checkAbort } from './model';
import { htmlStringToBlocks, resolveImages } from './htmlBlocks';
import { descendants, firstDescendant, parseXml } from './odfCommon';
import { decodeText } from './textDecode';
import { mimeForKind, sniffImage } from './images';

const FONT_OBFUSCATION = ['http://www.idpf.org/2008/embedding', 'http://ns.adobe.com/pdf/enc#RC'];

function dirOf(path: string): string {
  const i = path.lastIndexOf('/');
  return i >= 0 ? path.substring(0, i + 1) : '';
}

function joinPath(base: string, rel: string): string {
  const clean = rel.split('#')[0].split('?')[0];
  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    decoded = clean;
  }
  const parts = (decoded.startsWith('/') ? decoded.substring(1) : base + decoded).split('/');
  const out: string[] = [];
  for (const p of parts) {
    if (p === '..') out.pop();
    else if (p !== '.' && p !== '') out.push(p);
  }
  return out.join('/');
}

function findFile(zip: JSZip, path: string): JSZip.JSZipObject | null {
  const f = zip.file(path);
  if (f) return f;
  const lower = path.toLowerCase();
  const key = Object.keys(zip.files).find((k) => k.toLowerCase() === lower);
  return key ? zip.files[key] : null;
}

export interface EpubContent {
  title?: string;
  author?: string;
  chapters: Block[][];
}

export async function readEpub(data: Uint8Array | ArrayBuffer, ctx: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<EpubContent> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new ConversionError('Die Datei ist kein gültiges EPUB-E-Book oder beschädigt.');
  }
  const containerXml = await findFile(zip, 'META-INF/container.xml')?.async('string');
  if (!containerXml) throw new ConversionError('Ungültiges EPUB: META-INF/container.xml fehlt.');
  const container = parseXml(containerXml);
  const rootfile = firstDescendant(container, 'rootfile');
  const opfPath = rootfile?.getAttribute('full-path');
  if (!opfPath) throw new ConversionError('Ungültiges EPUB: Paketdatei (OPF) nicht gefunden.');

  const encXml = await findFile(zip, 'META-INF/encryption.xml')?.async('string');
  if (encXml) {
    const enc = parseXml(encXml);
    const methods = descendants(enc, 'EncryptionMethod').map((m) => m.getAttribute('Algorithm') || '');
    if (methods.some((a) => !FONT_OBFUSCATION.includes(a))) {
      throw new ConversionError('Dieses E-Book ist durch DRM (Kopierschutz) geschützt und kann nicht umgewandelt werden.');
    }
  }

  const opfXml = await findFile(zip, opfPath)?.async('string');
  if (!opfXml) throw new ConversionError('Ungültiges EPUB: Paketdatei (OPF) fehlt.');
  const opf = parseXml(opfXml);
  const opfDir = dirOf(opfPath);
  const title = firstDescendant(opf, 'title')?.textContent?.trim() || undefined;
  const author = firstDescendant(opf, 'creator')?.textContent?.trim() || undefined;

  const manifest = new Map<string, { href: string; type: string }>();
  for (const item of descendants(opf, 'item')) {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) manifest.set(id, { href: joinPath(opfDir, href), type: item.getAttribute('media-type') || '' });
  }
  const spine = descendants(opf, 'itemref')
    .map((r) => manifest.get(r.getAttribute('idref') || ''))
    .filter((m): m is { href: string; type: string } => Boolean(m) && /html|xml/i.test(m?.type ?? ''));
  if (!spine.length) throw new ConversionError('Das E-Book enthält keine lesbaren Kapitel.');

  const chapters: Block[][] = [];
  for (let i = 0; i < spine.length; i++) {
    checkAbort(ctx.signal);
    ctx.onProgress?.(i / spine.length);
    const entry = spine[i];
    const file = findFile(zip, entry.href);
    if (!file) continue;
    const raw = decodeText(await file.async('uint8array'));
    const { blocks } = htmlStringToBlocks(raw, true);
    const base = dirOf(entry.href);
    await resolveImages(blocks, async (src) => {
      if (/^[a-z]+:/i.test(src)) return null;
      const f = findFile(zip, joinPath(base, src));
      if (!f) return null;
      const bytes = await f.async('uint8array');
      return { data: bytes, mime: mimeForKind(sniffImage(bytes)) };
    });
    if (blocks.length) chapters.push(blocks);
  }
  if (!chapters.length) throw new ConversionError('Im E-Book wurde kein Inhalt gefunden.');
  return { title, author, chapters };
}

export function epubChaptersToBlocks(content: EpubContent): Block[] {
  const blocks: Block[] = [];
  if (content.title) {
    blocks.push({ type: 'heading', level: 1, runs: [{ text: content.title }], align: 'center' });
    if (content.author) blocks.push({ type: 'paragraph', runs: [{ text: content.author, italic: true }], align: 'center' });
    blocks.push({ type: 'pageBreak' });
  }
  content.chapters.forEach((ch, i) => {
    if (i > 0) blocks.push({ type: 'pageBreak' });
    blocks.push(...ch);
  });
  return blocks;
}

export function epubToText(content: EpubContent): string {
  const parts: string[] = [];
  if (content.title) parts.push(content.title + (content.author ? `\n${content.author}` : ''));
  for (const ch of content.chapters) {
    const text = blocksToPlainText(ch);
    if (text) parts.push(text);
  }
  return parts.join('\n\n\n') + '\n';
}
