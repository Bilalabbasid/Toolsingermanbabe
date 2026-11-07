/**
 * Text decoding (BOM / UTF-8 / Windows-1252 fallback) and an RFC 4180 CSV
 * parser with delimiter detection (ported from the former server csvParser).
 */

function tryDecode(bytes: Uint8Array, label: string, fatal = false): string | null {
  try {
    return new TextDecoder(label, { fatal }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Decodes text bytes. Honours BOMs, then tries strict UTF-8 and falls back to
 * Windows-1252 (typical for German Excel/Notepad exports).
 */
export function decodeText(bytes: Uint8Array, hint?: string): string {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return tryDecode(bytes.subarray(3), 'utf-8') ?? '';
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return tryDecode(bytes.subarray(2), 'utf-16le') ?? '';
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return tryDecode(bytes.subarray(2), 'utf-16be') ?? '';
  }
  // UTF-16 without BOM (lots of NUL bytes at odd/even positions)
  if (bytes.length >= 4 && bytes[1] === 0 && bytes[3] === 0 && bytes[0] !== 0) {
    const t = tryDecode(bytes, 'utf-16le');
    if (t) return t;
  }
  if (hint) {
    const normalized = hint.trim().toLowerCase();
    if (normalized && normalized !== 'utf-8' && normalized !== 'utf8') {
      const t = tryDecode(bytes, normalized);
      if (t !== null) return t;
    }
  }
  const utf8 = tryDecode(bytes, 'utf-8', true);
  if (utf8 !== null) return utf8;
  return tryDecode(bytes, 'windows-1252') ?? tryDecode(bytes, 'utf-8') ?? '';
}

/** Decodes an HTML file honouring `<meta charset>` declarations. */
export function decodeHtml(bytes: Uint8Array): string {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
  const m =
    /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head) ||
    /<\?xml[^>]+encoding\s*=\s*["']([\w-]+)/i.exec(head);
  return decodeText(bytes, m?.[1]);
}

export function detectDelimiter(text: string): string {
  // Look at the first few non-empty lines (outside quotes)
  const sample: string[] = [];
  let inQuote = false;
  let line = '';
  for (let i = 0; i < text.length && sample.length < 5; i++) {
    const c = text[i];
    if (c === '"') inQuote = !inQuote;
    if ((c === '\n' || c === '\r') && !inQuote) {
      if (line.trim()) sample.push(line);
      line = '';
    } else if (!inQuote) {
      line += c;
    }
  }
  if (line.trim() && sample.length < 5) sample.push(line);
  const candidates = [';', ',', '\t', '|'];
  let best = ',';
  let bestScore = -1;
  for (const d of candidates) {
    const counts = sample.map((l) => l.split(d).length - 1);
    if (!counts.length || counts[0] === 0) continue;
    const consistent = counts.every((c) => c === counts[0]);
    const score = counts[0] * (consistent ? 2 : 1);
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

export interface CsvParseResult {
  delimiter: string;
  rows: string[][];
  /** Parallel matrix: true when the field was quoted in the source. */
  quoted: boolean[][];
}

export function parseCsv(raw: string, explicitDelimiter?: string): CsvParseResult {
  const text = raw.replace(/^﻿/, '');
  const delimiter = explicitDelimiter || detectDelimiter(text);
  const rows: string[][] = [];
  const quoted: boolean[][] = [];
  let row: string[] = [];
  let rowQ: boolean[] = [];
  let field = '';
  let inQuotes = false;
  let wasQuoted = false;

  const pushField = () => {
    row.push(field);
    rowQ.push(wasQuoted);
    field = '';
    wasQuoted = false;
  };
  const pushRow = () => {
    pushField();
    if (row.length > 1 || row[0] !== '' || rowQ[0]) {
      rows.push(row);
      quoted.push(rowQ);
    }
    row = [];
    rowQ = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"' && (field === '' || field.trim() === '')) {
      inQuotes = true;
      wasQuoted = true;
      field = '';
    } else if (c === delimiter) {
      pushField();
    } else if (c === '\r') {
      if (text[i + 1] === '\n') i++;
      pushRow();
    } else if (c === '\n') {
      pushRow();
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0 || wasQuoted) pushRow();

  return { delimiter, rows, quoted };
}

/** CSV field → typed value. Keeps leading zeros, quoted fields and phone numbers as text. */
export function csvValue(value: string, wasQuoted: boolean): string | number | boolean {
  const v = value.trim();
  if (wasQuoted || v === '') return value;
  if (/^0\d+$/.test(v)) return value; // leading zeros (PLZ, Artikelnummern)
  if (/^[+-]?\d{16,}$/.test(v)) return value; // too long for exact numbers (IBAN parts, IDs)
  if (/^-?(0|[1-9]\d*)$/.test(v)) return Number(v);
  if (/^-?(0|[1-9]\d{0,2})(\.\d{3})+(,\d+)?$/.test(v)) return Number(v.replace(/\./g, '').replace(',', '.'));
  if (/^-?(0|[1-9]\d*),\d+$/.test(v)) return Number(v.replace(',', '.'));
  if (/^-?(0|[1-9]\d{0,2})(,\d{3})+\.\d+$/.test(v)) return Number(v.replace(/,/g, ''));
  if (/^-?(0|[1-9]\d*)\.\d+$/.test(v)) return Number(v);
  return value;
}
