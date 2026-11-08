import { describe, it, expect } from 'vitest';
import { decodeText, parseCsv, csvValue } from '@/lib/client/docs/textDecode';
import { csvToXlsx, readWorkbook } from '@/lib/client/docs/spreadsheet';

describe('Spreadsheet & Text Decoding Pure Modules', () => {
  it('should decode UTF-8 with BOM correctly', () => {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode('München, Köln, Berlin');
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...utf8Bytes]);

    expect(decodeText(withBom)).toBe('München, Köln, Berlin');
  });

  it('should parse standard comma-separated and semicolon-separated CSV', () => {
    const csvSemicolon = 'Name;Betrag;Ort\nMax Mustermann;123,45;Berlin\nErika Musterfrau;678,90;München';
    const parsed = parseCsv(csvSemicolon);

    expect(parsed.delimiter).toBe(';');
    expect(parsed.rows.length).toBe(3);
    expect(parsed.rows[0]).toEqual(['Name', 'Betrag', 'Ort']);
    expect(parsed.rows[1]).toEqual(['Max Mustermann', '123,45', 'Berlin']);
  });

  it('should handle quoted CSV fields with commas and newlines', () => {
    const complexCsv = 'ID,"Beschreibung, Details",Preis\n1,"Erste Zeile\nZweite Zeile",99.99';
    const parsed = parseCsv(complexCsv);

    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[0]).toEqual(['ID', 'Beschreibung, Details', 'Preis']);
    expect(parsed.rows[1][1]).toBe('Erste Zeile\nZweite Zeile');
  });

  it('should convert CSV to valid XLSX workbook bytes', () => {
    const csvData = new TextEncoder().encode('Produkt,Preis,Menge\nApfel,1.50,10\nBanane,2.00,5');
    const xlsxBytes = csvToXlsx(csvData, 'Inventar');

    expect(xlsxBytes.length).toBeGreaterThan(100);

    const wb = readWorkbook(xlsxBytes);
    expect(wb.SheetNames).toContain('Inventar');
    const ws = wb.Sheets['Inventar'];
    expect(ws['A1'].v).toBe('Produkt');
    expect(ws['B2'].v).toBe(1.5);
    expect(ws['C2'].v).toBe(10);
  });
});

