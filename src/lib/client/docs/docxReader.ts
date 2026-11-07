/**
 * DOCX → Block[] via mammoth (semantic HTML) + the HTML walker.
 */
import mammoth from 'mammoth';
import type { Block } from './model';
import { ConversionError } from './model';
import { htmlStringToBlocks } from './htmlBlocks';

interface MammothElement {
  type?: string;
  styleName?: string | null;
  styleId?: string | null;
  alignment?: string | null;
  numbering?: unknown;
  children?: MammothElement[];
}

const ALIGN_CLASS: Record<string, string> = { center: 'center', right: 'right', end: 'right', both: 'justify', distribute: 'justify' };

/** Marks centred/right/justified body paragraphs so they survive the HTML step. */
function markAlignment(el: MammothElement): MammothElement {
  if (el.type === 'paragraph') {
    const align = el.alignment ? ALIGN_CLASS[el.alignment] : undefined;
    const name = el.styleName || '';
    if (align && !el.numbering && !/heading|title|titel|berschrift|list|caption/i.test(name)) {
      return { ...el, styleName: `__align_${align}` };
    }
    return el;
  }
  if (el.children) return { ...el, children: el.children.map(markAlignment) };
  return el;
}

export async function docxToBlocks(data: ArrayBuffer): Promise<{ blocks: Block[]; warnings: string[] }> {
  let html: string;
  let messages: Array<{ type: string; message: string }> = [];
  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer: data },
      {
        styleMap: [
          'u => u',
          'strike => s',
          "br[type='page'] => hr.page-break",
          "p[style-name='__align_center'] => p.align-center:fresh",
          "p[style-name='__align_right'] => p.align-right:fresh",
          "p[style-name='__align_justify'] => p.align-justify:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Titel'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "p[style-name='Untertitel'] => h2:fresh",
          "p[style-name='Überschrift 1'] => h1:fresh",
          "p[style-name='Überschrift 2'] => h2:fresh",
          "p[style-name='Überschrift 3'] => h3:fresh",
          "p[style-name='Überschrift 4'] => h4:fresh",
        ],
        transformDocument: markAlignment,
      }
    );
    html = result.value;
    messages = result.messages as Array<{ type: string; message: string }>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/zip|central directory|end of data/i.test(msg)) {
      throw new ConversionError('Die Datei ist kein gültiges Word-Dokument (DOCX) oder beschädigt.');
    }
    throw new ConversionError('Das Word-Dokument konnte nicht gelesen werden. Bitte prüfen Sie, ob die Datei beschädigt oder passwortgeschützt ist.');
  }
  const { blocks } = htmlStringToBlocks(`<!DOCTYPE html><html><body>${html}</body></html>`);
  const warnings: string[] = [];
  if (messages.some((m) => /image|emf|wmf/i.test(m.message))) {
    warnings.push('Einige Grafiken (z. B. EMF/WMF-Vektorgrafiken) konnten nicht übernommen werden.');
  }
  return { blocks, warnings };
}
