/**
 * Maps arbitrary Unicode text onto characters the PDF standard fonts
 * (Helvetica/Times/Courier, WinAnsiEncoding) can encode. German umlauts and ß
 * are native WinAnsi characters; anything else is transliterated or replaced
 * by "?" so pdf-lib never throws "WinAnsi cannot encode".
 */

// Unicode code points of the Windows-1252 range 0x80–0x9F.
const CP1252_EXTENSIONS = new Set<number>([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
]);

const BULLET = '•';
const EM_DASH = '—';

// Code point → replacement (ASCII / WinAnsi only).
const SUBSTITUTE_TABLE: Array<[number, string]> = [
  [0x2192, '->'],
  [0x2190, '<-'],
  [0x2194, '<->'],
  [0x21d2, '=>'],
  [0x21d0, '<='],
  [0x2191, '^'],
  [0x2193, 'v'],
  [0x2713, 'v'],
  [0x2714, 'v'],
  [0x2717, 'x'],
  [0x2718, 'x'],
  [0x2212, '-'],
  [0x2010, '-'],
  [0x2011, '-'],
  [0x2012, '-'],
  [0x2015, EM_DASH],
  [0x2032, "'"],
  [0x2033, '"'],
  [0x2035, '`'],
  [0x2002, ' '],
  [0x2003, ' '],
  [0x2004, ' '],
  [0x2005, ' '],
  [0x2006, ' '],
  [0x2007, ' '],
  [0x2008, ' '],
  [0x2009, ' '],
  [0x200a, ' '],
  [0x202f, ' '],
  [0x205f, ' '],
  [0x3000, ' '],
  [0x2028, ' '],
  [0x2029, ' '],
  [0x200b, ''],
  [0x200c, ''],
  [0x200d, ''],
  [0x200e, ''],
  [0x200f, ''],
  [0x2060, ''],
  [0xfeff, ''],
  [0x00ad, ''],
  [0x25cf, BULLET],
  [0x25aa, BULLET],
  [0x25a0, BULLET],
  [0x25e6, BULLET],
  [0x2023, BULLET],
  [0x2219, BULLET],
  [0x2043, '-'],
  [0x25cb, 'o'],
  [0x25a1, '[ ]'],
  [0x2610, '[ ]'],
  [0x2611, '[x]'],
  [0x2612, '[x]'],
  [0x25b6, '>'],
  [0x25ba, '>'],
  [0x2605, '*'],
  [0x2606, '*'],
  [0x2264, '<='],
  [0x2265, '>='],
  [0x2260, '!='],
  [0x2248, '~'],
  [0x221e, 'oo'],
  [0x2116, 'Nr.'],
  [0x1e9e, 'SS'],
  [0x0131, 'i'],
  [0x0141, 'L'],
  [0x0142, 'l'],
  [0x0110, 'D'],
  [0x0111, 'd'],
  [0x0126, 'H'],
  [0x0127, 'h'],
  // Symbol / Wingdings private-use bullets frequently found in Word documents
  [0xf0b7, BULLET],
  [0xf0a7, BULLET],
  [0xf076, BULLET],
  [0xf0a8, BULLET],
  [0xf06e, BULLET],
  [0xf071, BULLET],
  [0xf0d8, '>'],
  [0xf0e0, '->'],
  [0xf0fc, 'v'],
];

const SUBSTITUTES = new Map<number, string>(SUBSTITUTE_TABLE);

export function isWinAnsiCodePoint(cp: number): boolean {
  return (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff) || CP1252_EXTENSIONS.has(cp);
}

const cache = new Map<number, string>();

function substituteCodePoint(cp: number, ch: string): string {
  const cached = cache.get(cp);
  if (cached !== undefined) return cached;
  let result = SUBSTITUTES.get(cp);
  if (result === undefined) {
    // Try compatibility decomposition (é → e + ´, ﬁ → fi, ① → 1 …)
    const decomposed = ch.normalize('NFKD');
    let ok = '';
    let valid = decomposed !== ch;
    for (const c of decomposed) {
      const p = c.codePointAt(0) ?? 0;
      if (isWinAnsiCodePoint(p)) ok += c;
      else if (p >= 0x300 && p <= 0x36f) continue; // combining marks
      else {
        valid = false;
        break;
      }
    }
    result = valid && ok ? ok : '?';
  }
  cache.set(cp, result);
  return result;
}

/**
 * Converts a string to WinAnsi-safe text. Tabs become 4 spaces, newlines are
 * kept (callers split on them), other control characters are removed.
 */
export function toWinAnsi(input: string): string {
  let out = '';
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isWinAnsiCodePoint(cp)) {
      out += ch;
    } else if (cp === 0x09) {
      out += '    ';
    } else if (cp === 0x0a) {
      out += '\n';
    } else if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) {
      continue;
    } else {
      out += substituteCodePoint(cp, ch);
    }
  }
  return out;
}
