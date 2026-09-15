import fs from 'fs/promises';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';

let cachedFontBuffer: Buffer | null = null;

const FONT_CANDIDATES = [
  // Docker / Linux paths (from fonts-dejavu-core & fonts-liberation)
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
  // Windows paths
  'C:\\Windows\\Fonts\\arial.ttf',
  'C:\\Windows\\Fonts\\segoeui.ttf',
  'C:\\Windows\\Fonts\\calibri.ttf',
  // macOS paths
  '/System/Library/Fonts/Helvetica.ttc',
  '/Library/Fonts/Arial.ttf',
];

export async function getUnicodeFontBytes(): Promise<Buffer | null> {
  if (cachedFontBuffer) return cachedFontBuffer;

  for (const fontPath of FONT_CANDIDATES) {
    try {
      const buf = await fs.readFile(/*turbopackIgnore: true*/ fontPath);
      if (buf && buf.length > 1000) {
        cachedFontBuffer = buf;
        return buf;
      }
    } catch {
      // Try next
    }
  }

  return null;
}

/**
 * Embeds a Unicode-capable font if available, falling back to standard Helvetica
 */
export async function embedUnicodeFont(pdfDoc: PDFDocument): Promise<PDFFont> {
  try {
    const fontBytes = await getUnicodeFontBytes();
    if (fontBytes) {
      pdfDoc.registerFontkit(fontkit);
      return await pdfDoc.embedFont(fontBytes, { subset: true });
    }
  } catch (err) {
    console.warn('[UnicodeFont] Embedding TrueType font failed, falling back to Helvetica:', err);
  }

  return await pdfDoc.embedFont(StandardFonts.Helvetica);
}
