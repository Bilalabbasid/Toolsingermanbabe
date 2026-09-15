/**
 * Safely sanitizes and converts Unicode text for pdf-lib standard fonts (WinAnsi / Windows-1252).
 * Strips UTF-8 BOM, translates unsupported symbols (checkmarks, arrows, bullets),
 * and prevents "WinAnsi cannot encode" runtime exceptions.
 */

// Characters supported natively in Windows-1252:
// 0x20..0x7E (ASCII), 0xA0..0xFF (Latin-1 Supplement: umlauts, etc.), plus specific Windows-1252 extensions.
const WIN_1252_EXTENSIONS = new Set([
  0x20AC, // € Euro
  0x201A, // ‚
  0x0192, // ƒ
  0x201E, // „
  0x2026, // …
  0x2020, // †
  0x2021, // ‡
  0x02C6, // ˆ
  0x2030, // ‰
  0x0160, // Š
  0x2039, // ‹
  0x0152, // Œ
  0x017D, // Ž
  0x2018, // ‘
  0x2019, // ’
  0x201C, // “
  0x201D, // ”
  0x2022, // •
  0x2013, // –
  0x2014, // —
  0x02DC, // ˜
  0x2122, // ™
  0x0161, // š
  0x203A, // ›
  0x0153, // œ
  0x017E, // ž
  0x0178, // Ÿ
]);

const SYMBOL_MAP: Record<string, string> = {
  '☑': '[x]',
  '☐': '[ ]',
  '☒': '[x]',
  '✓': '[v]',
  '✔': '[v]',
  '✗': '[x]',
  '✘': '[x]',
  '→': '->',
  '←': '<-',
  '↔': '<->',
  '⇒': '=>',
  '⇐': '<=',
  '★': '*',
  '☆': '*',
  '●': '*',
  '◆': '*',
  '◇': '*',
  '▲': '^',
  '▼': 'v',
  '…': '...',
  '—': '-',
  '–': '-',
  '“': '"',
  '”': '"',
  '„': '"',
  '‘': "'",
  '’': "'",
};

export function cleanWinAnsiText(input: string): string {
  if (!input) return '';

  // 1. Strip UTF-8 BOM
  let str = input.replace(/^\uFEFF/, '');

  // 2. Map known non-WinAnsi symbols
  for (const [sym, rep] of Object.entries(SYMBOL_MAP)) {
    if (str.includes(sym)) {
      str = str.replaceAll(sym, rep);
    }
  }

  // 3. Ensure every character is valid for WinAnsi
  const chars: string[] = [];
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    // Allow ASCII newline, tab, carriage return, standard printable ASCII, Latin-1 supplement
    if (code === 0x09 || code === 0x0A || code === 0x0D) {
      chars.push(ch);
    } else if (code >= 0x20 && code <= 0x7E) {
      chars.push(ch);
    } else if (code >= 0xA0 && code <= 0xFF) {
      chars.push(ch);
    } else if (WIN_1252_EXTENSIONS.has(code)) {
      chars.push(ch);
    } else {
      // Fallback for emojis, complex CJK, or symbols outside WinAnsi
      chars.push('?');
    }
  }

  return chars.join('');
}
