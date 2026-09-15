/**
 * Standards-compliant RFC 4180 CSV parser
 * Correctly handles:
 * - Quoted values with embedded delimiters
 * - Escaped double quotes ("")
 * - Embedded newlines inside quoted fields
 * - UTF-8 Byte Order Mark (BOM)
 * - Preservation of leading zeros ("00123" -> string "00123", NOT 123)
 * - Semicolon and comma auto-detection
 */

export interface CsvCell {
  value: string | number;
  wasQuoted: boolean;
  hasLeadingZero: boolean;
}

export interface ParseCsvResult {
  delimiter: string;
  rows: CsvCell[][];
}

export function detectDelimiter(text: string): string {
  // Inspect first non-empty line without quotes
  let inQuote = false;
  let line = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') inQuote = !inQuote;
    if ((c === '\n' || c === '\r') && !inQuote) {
      if (line.trim()) break;
      line = '';
    } else {
      line += c;
    }
  }

  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

export function parseCsv(rawCsv: string, explicitDelimiter?: string): ParseCsvResult {
  // 1. Strip UTF-8 BOM if present
  const text = rawCsv.replace(/^\uFEFF/, '');
  const delimiter = explicitDelimiter || detectDelimiter(text);

  const rows: CsvCell[][] = [];
  let currentRow: CsvCell[] = [];
  let currentField = '';
  let inQuotes = false;
  let wasQuoted = false;

  const pushField = () => {
    const trimmed = currentField;
    const isLeadingZeroString = /^0\d+$/.test(trimmed);
    const isPureNumber = /^-?\d+(\.\d+)?$/.test(trimmed);

    let finalValue: string | number = trimmed;
    // Only convert unquoted numbers without leading zeros to numbers
    if (!wasQuoted && !isLeadingZeroString && isPureNumber && trimmed !== '') {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        finalValue = num;
      }
    }

    currentRow.push({
      value: finalValue,
      wasQuoted,
      hasLeadingZero: isLeadingZeroString,
    });

    currentField = '';
    inQuotes = false;
    wasQuoted = false;
  };

  const pushRow = () => {
    pushField();
    // Don't push empty trailing row if entire row is just one empty field
    if (currentRow.length > 1 || (currentRow.length === 1 && (currentRow[0].value !== '' || currentRow[0].wasQuoted))) {
      rows.push(currentRow);
    }
    currentRow = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i++; // Skip the next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        wasQuoted = true;
      } else if (char === delimiter) {
        pushField();
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // Consume CRLF
        }
        pushRow();
      } else if (char === '\n') {
        pushRow();
      } else {
        currentField += char;
      }
    }
  }

  // Push final field/row if buffer remaining
  if (currentField.length > 0 || currentRow.length > 0 || wasQuoted) {
    pushField();
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
  }

  return { delimiter, rows };
}
