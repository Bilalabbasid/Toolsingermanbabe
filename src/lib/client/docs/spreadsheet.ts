/**
 * Spreadsheet conversions with SheetJS: CSV ↔ XLSX, XLS ↔ XLSX, sheets → PDF tables.
 */
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import type { Block, TableBlock, TableCell, TableRow } from './model';
import { ConversionError } from './model';
import { csvValue, decodeText, parseCsv } from './textDecode';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function readWorkbook(data: Uint8Array, opts: XLSX.ParsingOptions = {}): XLSX.WorkBook {
  try {
    return XLSX.read(data, { type: 'array', cellNF: true, cellStyles: true, ...opts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/password|encrypt/i.test(msg)) {
      throw new ConversionError('Die Arbeitsmappe ist passwortgeschützt. Bitte entfernen Sie den Kennwortschutz in Excel und versuchen Sie es erneut.');
    }
    throw new ConversionError('Die Tabellendatei konnte nicht gelesen werden. Bitte prüfen Sie, ob sie beschädigt ist.');
  }
}

function safeSheetName(name: string): string {
  const cleaned = name.replace(/[[\]:*?/\\]/g, ' ').trim().substring(0, 31);
  return cleaned || 'Tabelle1';
}

/** CSV → XLSX. Leading zeros and quoted values stay text, numbers become numbers. */
export function csvToXlsx(bytes: Uint8Array, sheetName: string): Uint8Array {
  const parsed = parseCsv(decodeText(bytes));
  if (!parsed.rows.length) throw new ConversionError('Die CSV-Datei enthält keine Daten.');
  const ws: XLSX.WorkSheet = {};
  let maxCols = 0;
  const widths: number[] = [];
  parsed.rows.forEach((row, r) => {
    maxCols = Math.max(maxCols, row.length);
    row.forEach((raw, c) => {
      if (raw === '' && !parsed.quoted[r][c]) return;
      const v = csvValue(raw, parsed.quoted[r][c]);
      const addr = XLSX.utils.encode_cell({ r, c });
      if (typeof v === 'number') ws[addr] = { t: 'n', v };
      else {
        const s = String(v);
        ws[addr] = { t: 's', v: s };
        if (/^[+-]?\d+([.,]\d+)?$/.test(s.trim())) ws[addr].z = '@';
      }
      widths[c] = Math.max(widths[c] ?? 6, Math.min(60, String(raw).length + 2));
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: parsed.rows.length - 1, c: Math.max(0, maxCols - 1) } });
  ws['!cols'] = Array.from({ length: maxCols }, (_, i) => ({ wch: widths[i] ?? 8 }));
  if (parsed.rows.length > 1 && maxCols > 0) {
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } }) };
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(sheetName));
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);
}

export interface CsvExportOptions {
  delimiter: ';' | ',' | '\t';
  bom: boolean;
}

function csvEscape(v: string, delimiter: string): string {
  if (v.includes(delimiter) || v.includes('"') || v.includes('\n') || v.includes('\r') || /^\s|\s$/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const SSF = XLSX.SSF as { is_date: (fmt: string | number) => boolean };

/**
 * Displayed text of a cell. SheetJS formats with English separators; for the
 * German output numbers are shown as Excel would in a German locale
 * (1.234,56 € instead of 1,234.56 €). Dates and times are left untouched.
 */
function displayText(cell: XLSX.CellObject, german: boolean): string {
  let text = cell.w ?? XLSX.utils.format_cell(cell) ?? String(cell.v);
  if (german && cell.t === 'n') {
    let isDate = false;
    try {
      isDate = SSF.is_date(cell.z ?? 'General');
    } catch {
      isDate = false;
    }
    if (!isDate && /^[^\dA-Za-z]*-?[\d.,]+[^\dA-Za-z]*$/.test(text)) {
      text = text.replace(/[.,]/g, (m) => (m === '.' ? ',' : '.'));
    }
  }
  return text;
}

function isPlainNumberFormat(z: unknown): boolean {
  return !z || z === 'General' || /^[#0.,]+$/.test(String(z));
}

function sheetToCsv(ws: XLSX.WorkSheet, opts: CsvExportOptions): string {
  if (!ws['!ref']) return '';
  const range = XLSX.utils.decode_range(ws['!ref']);
  const german = opts.delimiter === ';';
  const lines: string[] = [];
  let lastNonEmpty = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    const fields: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
      let text = '';
      if (cell && cell.t !== 'z' && cell.v !== undefined && cell.v !== null) {
        if (cell.t === 'n' && isPlainNumberFormat(cell.z)) {
          text = String(cell.v);
          if (german) text = text.replace('.', ',');
        } else if (cell.t === 'b') {
          text = german ? (cell.v ? 'WAHR' : 'FALSCH') : cell.v ? 'TRUE' : 'FALSE';
        } else if (cell.t === 'e') {
          text = cell.w ?? '#FEHLER';
        } else {
          text = displayText(cell, german);
        }
      }
      fields.push(csvEscape(text, opts.delimiter));
    }
    while (fields.length && fields[fields.length - 1] === '') fields.pop();
    lines.push(fields.join(opts.delimiter));
    if (fields.length) lastNonEmpty = lines.length - 1;
  }
  return lines.slice(0, lastNonEmpty + 1).join('\r\n');
}

function encodeCsv(text: string, bom: boolean): Uint8Array {
  const body = new TextEncoder().encode(text);
  if (!bom) return body;
  const out = new Uint8Array(body.length + 3);
  out.set([0xef, 0xbb, 0xbf], 0);
  out.set(body, 3);
  return out;
}

/** XLSX/XLS/ODS → CSV. Multiple non-empty sheets produce a ZIP with one CSV per sheet. */
export async function workbookToCsv(
  bytes: Uint8Array,
  baseName: string,
  opts: CsvExportOptions
): Promise<{ data: Uint8Array; extension: 'csv' | 'zip'; sheets: number }> {
  const wb = readWorkbook(bytes);
  const sheets = wb.SheetNames.map((name) => ({ name, csv: sheetToCsv(wb.Sheets[name], opts) })).filter((s) => s.csv.trim());
  if (!sheets.length) throw new ConversionError('Die Arbeitsmappe enthält keine Daten.');
  if (sheets.length === 1) return { data: encodeCsv(sheets[0].csv, opts.bom), extension: 'csv', sheets: 1 };
  const zip = new JSZip();
  const used = new Set<string>();
  for (const s of sheets) {
    let fname = `${baseName}_${s.name}`.replace(/[\\/:*?"<>|]/g, '_');
    while (used.has(fname)) fname += '_';
    used.add(fname);
    zip.file(`${fname}.csv`, encodeCsv(s.csv, opts.bom));
  }
  return { data: await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }), extension: 'zip', sheets: sheets.length };
}

export function xlsToXlsx(bytes: Uint8Array): { data: Uint8Array; mime: string } {
  const wb = readWorkbook(bytes, { cellFormula: true });
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx', compression: true, cellStyles: true }) as ArrayBuffer;
  return { data: new Uint8Array(out), mime: XLSX_MIME };
}

export function xlsxToXls(bytes: Uint8Array): { data: Uint8Array; warnings: string[] } {
  const wb = readWorkbook(bytes, { cellFormula: true });
  const warnings: string[] = [];
  let hasFormula = false;
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const ref = ws['!ref'];
    if (!ref) continue;
    if (!hasFormula) hasFormula = Object.keys(ws).some((k) => k[0] !== '!' && Boolean((ws[k] as XLSX.CellObject).f));
    const range = XLSX.utils.decode_range(ref);
    if (range.e.r >= 65536 || range.e.c >= 256) {
      throw new ConversionError(
        `Das Tabellenblatt „${name}“ ist zu groß für das alte XLS-Format (max. 65.536 Zeilen und 256 Spalten). Bitte verwenden Sie XLSX.`
      );
    }
  }
  if (hasFormula) warnings.push('Formeln wurden als berechnete Werte gespeichert (das XLS-Format wird ohne Formeln geschrieben).');
  // Excel's file validation rejects BIFF8 files written from a workbook that still
  // carries XLSX-specific metadata/styles – rebuild a clean workbook first.
  const clean = XLSX.utils.book_new();
  for (const name of wb.SheetNames) {
    const src = wb.Sheets[name];
    const ws: XLSX.WorkSheet = {};
    for (const addr of Object.keys(src)) {
      if (addr[0] === '!') continue;
      const c = src[addr] as XLSX.CellObject;
      if (c.v === undefined || c.v === null) continue;
      const cell: XLSX.CellObject = { t: c.t === 'd' ? 'n' : c.t === 'z' ? 's' : c.t, v: c.v instanceof Date ? dateToSerial(c.v) : c.v };
      if (c.z && c.z !== 'General') cell.z = c.z;
      ws[addr] = cell;
    }
    if (src['!ref']) ws['!ref'] = src['!ref'];
    if (src['!merges']) ws['!merges'] = src['!merges'];
    if (src['!cols']) ws['!cols'] = src['!cols'].map((col) => (col?.wch ? { wch: col.wch } : col?.width ? { wch: Math.round(col.width) } : {}));
    XLSX.utils.book_append_sheet(clean, ws, safeSheetName(name));
  }
  const out = XLSX.write(clean, { type: 'array', bookType: 'biff8' }) as ArrayBuffer;
  return { data: new Uint8Array(out), warnings };
}

function dateToSerial(d: Date): number {
  return (d.getTime() - Date.UTC(1899, 11, 30)) / 86400000 - d.getTimezoneOffset() / 1440;
}

function columnLetter(c: number): string {
  return XLSX.utils.encode_col(c);
}

function cellTextBlock(text: string): Block[] {
  return text ? [{ type: 'paragraph', runs: [{ text }] }] : [];
}

export interface SheetTablesResult {
  blocks: Block[];
  maxColumns: number;
  sheetCount: number;
}

/** Splits a wide grid into column groups that fit on a page. */
function buildTables(grid: Array<Array<TableCell | null>>, colIndexes: number[], maxColsPerTable: number, headerRow: boolean, label?: string): Block[] {
  const blocks: Block[] = [];
  const ncols = colIndexes.length;
  const groups = Math.ceil(ncols / maxColsPerTable);
  for (let g = 0; g < groups; g++) {
    const from = g * maxColsPerTable;
    const to = Math.min(ncols, from + maxColsPerTable);
    if (groups > 1) {
      blocks.push({
        type: 'paragraph',
        runs: [{ text: `${label ? label + ' – ' : ''}Spalten ${columnLetter(colIndexes[from])}–${columnLetter(colIndexes[to - 1])}`, italic: true }],
        spaceAfter: 4,
      });
    }
    const rows: TableRow[] = grid.map((r) => {
      const cells: TableCell[] = [];
      r.slice(from, to).forEach((c, i) => {
        if (c) cells.push({ ...c, colSpan: c.colSpan ? Math.min(c.colSpan, to - (from + i)) : undefined });
      });
      return { cells };
    });
    const table: TableBlock = { type: 'table', rows, headerRows: headerRow ? 1 : 0, fontSize: ncols > 10 ? 7 : ncols > 6 ? 8 : 9 };
    blocks.push(table);
    if (g < groups - 1) blocks.push({ type: 'pageBreak' });
  }
  return blocks;
}

/** Workbook (xlsx/xls/ods/csv) → PDF-ready blocks (one table per sheet). */
export function workbookToBlocks(bytes: Uint8Array): SheetTablesResult {
  const wb = readWorkbook(bytes);
  const blocks: Block[] = [];
  let maxColumns = 0;
  let sheetCount = 0;
  const visible = wb.SheetNames.filter((_, i) => !wb.Workbook?.Sheets?.[i]?.Hidden);
  for (const name of visible) {
    const ws = wb.Sheets[name];
    if (!ws || !ws['!ref']) continue;
    const range = XLSX.utils.decode_range(ws['!ref']);
    // Determine real data bounds
    let maxR = -1;
    let maxC = -1;
    let minR = Number.MAX_SAFE_INTEGER;
    let minC = Number.MAX_SAFE_INTEGER;
    for (const addr of Object.keys(ws)) {
      if (addr[0] === '!') continue;
      const cell = ws[addr] as XLSX.CellObject;
      if (cell.v === undefined || cell.v === null || cell.v === '') continue;
      const { r, c } = XLSX.utils.decode_cell(addr);
      if (r < range.s.r || c < range.s.c) continue;
      maxR = Math.max(maxR, r);
      maxC = Math.max(maxC, c);
      minR = Math.min(minR, r);
      minC = Math.min(minC, c);
    }
    if (maxR < 0) continue;
    const hiddenRows = new Set<number>();
    (ws['!rows'] || []).forEach((ri, i) => { if (ri?.hidden) hiddenRows.add(i); });
    const hiddenCols = new Set<number>();
    (ws['!cols'] || []).forEach((ci, i) => { if (ci?.hidden) hiddenCols.add(i); });

    const colIndexes: number[] = [];
    for (let c = minC; c <= maxC; c++) if (!hiddenCols.has(c)) colIndexes.push(c);
    const merges = ws['!merges'] || [];
    const covered = new Set<string>();
    const spans = new Map<string, { colSpan: number; rowSpan: number }>();
    for (const m of merges) {
      spans.set(`${m.s.r}:${m.s.c}`, { colSpan: m.e.c - m.s.c + 1, rowSpan: m.e.r - m.s.r + 1 });
      for (let r = m.s.r; r <= m.e.r; r++) for (let c = m.s.c; c <= m.e.c; c++) if (r !== m.s.r || c !== m.s.c) covered.add(`${r}:${c}`);
    }

    const grid: Array<Array<TableCell | null>> = [];
    for (let r = minR; r <= maxR; r++) {
      if (hiddenRows.has(r)) continue;
      const row: Array<TableCell | null> = [];
      for (const c of colIndexes) {
        if (covered.has(`${r}:${c}`)) {
          // Covered by a merge: omitted (the renderer fills rowspan gaps itself)
          row.push(null);
          continue;
        }
        const cell = ws[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
        let text = '';
        if (cell && cell.v !== undefined && cell.v !== null) {
          text = displayText(cell, true);
        }
        const span = spans.get(`${r}:${c}`);
        row.push({
          blocks: cellTextBlock(text.replace(/\r\n?/g, '\n')),
          align: cell?.t === 'n' ? 'right' : undefined,
          colSpan: span && span.colSpan > 1 ? span.colSpan : undefined,
          rowSpan: span && span.rowSpan > 1 ? span.rowSpan : undefined,
        });
      }
      grid.push(row);
    }
    if (!grid.length) continue;
    const first = grid[0].filter((c): c is TableCell => c !== null);
    const headerRow = grid.length > 1 && first.length > 1 && first.every((c) => c.align !== 'right') && first.filter((c) => c.blocks.length).length >= Math.ceil(first.length / 2);

    if (sheetCount > 0) blocks.push({ type: 'pageBreak' });
    if (visible.length > 1) blocks.push({ type: 'heading', level: 2, runs: [{ text: name }] });
    sheetCount++;
    maxColumns = Math.max(maxColumns, colIndexes.length);
    blocks.push(...buildTables(grid, colIndexes, 14, headerRow, visible.length > 1 ? name : undefined));
  }
  if (!sheetCount) throw new ConversionError('Die Tabelle enthält keine Daten.');
  return { blocks, maxColumns, sheetCount };
}

/** CSV → PDF-ready blocks. */
export function csvToBlocks(bytes: Uint8Array): SheetTablesResult {
  const parsed = parseCsv(decodeText(bytes));
  if (!parsed.rows.length) throw new ConversionError('Die CSV-Datei enthält keine Daten.');
  const ncols = Math.max(...parsed.rows.map((r) => r.length));
  const grid: TableCell[][] = parsed.rows.map((row, r) =>
    Array.from({ length: ncols }, (_, c) => {
      const raw = row[c] ?? '';
      const v = csvValue(raw, parsed.quoted[r]?.[c] ?? false);
      return { blocks: cellTextBlock(raw), align: typeof v === 'number' ? ('right' as const) : undefined };
    })
  );
  const headerRow = grid.length > 1 && grid[0].every((c) => c.align !== 'right');
  const colIndexes = Array.from({ length: ncols }, (_, i) => i);
  return { blocks: buildTables(grid, colIndexes, 14, headerRow), maxColumns: ncols, sheetCount: 1 };
}
