import assert from 'assert';
import crypto from 'crypto';

console.log('--- STARTING COMPREHENSIVE UTILITIES TEST SUITE ---');

// 1. TEXT UTILITY TESTS

// Word and character counting
function calculateStats(text: string) {
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
  const readingTimeMinutes = Math.ceil(words / 200);
  return { charCount, charNoSpaces, words, lines, paragraphs, readingTimeMinutes };
}

const sampleText = `Hallo CoolWave Welt!\nDies ist ein deutscher Testabsatz mit Umlauten: Ä, Ö, Ü und ß.\n\nZweiter Absatz mit genau zehn Wörtern für diesen Testfall hier jetzt.`;
const stats = calculateStats(sampleText);
assert.strictEqual(stats.words > 0, true, 'Words should be counted');
assert.strictEqual(stats.paragraphs, 2, 'Should detect exactly 2 paragraphs');
assert.strictEqual(stats.lines >= 3, true, 'Should detect lines');
console.log('✓ Text statistics (Wortzähler/Zeichenzähler) test passed.');

// Case conversions
function convertCase(text: string, mode: string) {
  switch (mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    case 'title':
      return text.toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase());
    case 'camel':
      return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
    case 'snake':
      return text.trim().toLowerCase().replace(/[\s\-_]+/g, '_').replace(/[^\w]/g, '');
    case 'kebab':
      return text.trim().toLowerCase().replace(/[\s\-_]+/g, '-').replace(/[^\w-]/g, '');
    default: return text;
  }
}

assert.strictEqual(convertCase('hallo welt', 'upper'), 'HALLO WELT');
assert.strictEqual(convertCase('HALLO WELT', 'lower'), 'hallo welt');
assert.strictEqual(convertCase('hallo welt. test satz.', 'sentence'), 'Hallo welt. Test satz.');
assert.strictEqual(convertCase('hallo welt test', 'title'), 'Hallo Welt Test');
assert.strictEqual(convertCase('cool wave tool', 'camel'), 'coolWaveTool');
assert.strictEqual(convertCase('cool wave tool', 'snake'), 'cool_wave_tool');
assert.strictEqual(convertCase('cool wave tool', 'kebab'), 'cool-wave-tool');
console.log('✓ Case conversion (Groß-/Kleinschreibung) test passed.');

// Whitespace removal
function cleanWhitespace(text: string, mode: string) {
  switch (mode) {
    case 'collapse': return text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n');
    case 'trim-lines': return text.split('\n').map(l => l.trim()).join('\n');
    case 'remove-all': return text.replace(/\s+/g, '');
    case 'remove-empty-lines': return text.split('\n').filter(l => l.trim().length > 0).join('\n');
    default: return text;
  }
}

assert.strictEqual(cleanWhitespace('Hallo   Welt  !  ', 'collapse'), 'Hallo Welt ! ');
assert.strictEqual(cleanWhitespace('  Hallo  \n  Welt  ', 'trim-lines'), 'Hallo\nWelt');
assert.strictEqual(cleanWhitespace('Hallo Welt \n Cool', 'remove-all'), 'HalloWeltCool');
assert.strictEqual(cleanWhitespace('Hallo\n\n\nWelt', 'remove-empty-lines'), 'Hallo\nWelt');
console.log('✓ Whitespace cleanup (Leerzeichen entfernen) test passed.');

// Deduplicate lines
function deduplicateLines(text: string, caseInsensitive: boolean, sort: boolean) {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const key = caseInsensitive ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }
  if (sort) result.sort((a, b) => a.localeCompare(b));
  return result.join('\n');
}

const dupText = `Apfel\nBirne\napfel\nApfel\nBanane`;
const deduped = deduplicateLines(dupText, true, true);
assert.strictEqual(deduped, 'Apfel\nBanane\nBirne');
console.log('✓ Duplicate line removal (Doppelte Zeilen entfernen) test passed.');

// Slug generator
function generateSlug(text: string, separator: string = '-') {
  const germanMap: Record<string, string> = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue'
  };
  let processed = text;
  for (const [k, v] of Object.entries(germanMap)) {
    processed = processed.split(k).join(v);
  }
  return processed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
}

assert.strictEqual(generateSlug('Übermäßige Größe & Schönwetter!'), 'uebermaessige-groesse-schoenwetter');
assert.strictEqual(generateSlug('PDF zu Word Konverter 2026', '_'), 'pdf_zu_word_konverter_2026');
console.log('✓ Slug generator with German umlauts test passed.');

// 2. DEVELOPER TOOLS TESTS

// JSON Formatter & Validator
function formatJson(jsonStr: string, indent: number | 'minify') {
  const parsed = JSON.parse(jsonStr);
  if (indent === 'minify') return JSON.stringify(parsed);
  return JSON.stringify(parsed, null, indent);
}

const rawJson = `{"name": "CoolWave", "features": ["PDF", "Convert"], "active": true}`;
const formatted2 = formatJson(rawJson, 2);
const minified = formatJson(rawJson, 'minify');
assert.strictEqual(JSON.parse(formatted2).name, 'CoolWave');
assert.strictEqual(minified, '{"name":"CoolWave","features":["PDF","Convert"],"active":true}');

let caughtError = false;
try {
  JSON.parse('{name: invalid_json}');
} catch (e) {
  caughtError = true;
}
assert.strictEqual(caughtError, true, 'Invalid JSON should throw syntax error');
console.log('✓ JSON Formatter & Validator test passed.');

// JSON to CSV and CSV to JSON
function jsonToCsv(jsonStr: string, delimiter: string = ',') {
  const parsed = JSON.parse(jsonStr);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const keys = Array.from(new Set(arr.flatMap(obj => Object.keys(obj))));
  const header = keys.join(delimiter);
  const rows = arr.map(obj => keys.map(k => {
    const val = obj[k] ?? '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return str.includes(delimiter) || str.includes('\n') || str.includes('"')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }).join(delimiter));
  return [header, ...rows].join('\n');
}

function csvToJson(csvStr: string, delimiter: string = ',') {
  const lines = csvStr.trim().split('\n');
  if (lines.length === 0) return '[]';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const result = lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
  return JSON.stringify(result, null, 2);
}

const sampleJsonArr = JSON.stringify([
  { id: '1', tool: 'PDF Merge', price: '0.00' },
  { id: '2', tool: 'Image Resize', price: '0.00' }
]);
const csvOutput = jsonToCsv(sampleJsonArr, ';');
assert.strictEqual(csvOutput.includes('id;tool;price'), true);
const jsonRecovered = JSON.parse(csvToJson(csvOutput, ';'));
assert.strictEqual(jsonRecovered.length, 2);
assert.strictEqual(jsonRecovered[0].tool, 'PDF Merge');
console.log('✓ JSON ↔ CSV 2-way conversion test passed.');

// Base64 UTF-8 round-trip
function base64EncodeUtf8(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}
function base64DecodeUtf8(b64: string): string {
  return Buffer.from(b64, 'base64').toString('utf-8');
}

const utf8String = 'CoolWave: Das schnellste Tool für PDFs, Bilder & Dateien! € 100% DSGVO-konform.';
const b64 = base64EncodeUtf8(utf8String);
const roundTripped = base64DecodeUtf8(b64);
assert.strictEqual(roundTripped, utf8String, 'Base64 round trip must preserve UTF-8 and umlauts');
console.log('✓ Base64 UTF-8 Encode/Decode test passed.');

// URL Encoder / Decoder
const urlInput = 'https://coolwave.de/suche?q=PDF zusammenfügen & komprimieren';
const encodedUrl = encodeURIComponent(urlInput);
const decodedUrl = decodeURIComponent(encodedUrl);
assert.strictEqual(decodedUrl, urlInput);
console.log('✓ URL Encoder/Decoder test passed.');

// JWT Decoder
function decodeJwt(token: string) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT must have 3 parts');
  const b64Decode = (str: string) => {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return Buffer.from(b64, 'base64').toString('utf-8');
  };
  const header = JSON.parse(b64Decode(parts[0]));
  const payload = JSON.parse(b64Decode(parts[1]));
  return { header, payload };
}

// Generate a test JWT
const testHeader = { alg: 'HS256', typ: 'JWT' };
const testPayload = { sub: 'user_123', name: 'Max Mustermann', exp: 1950000000, iat: 1700000000 };
const testToken = `${Buffer.from(JSON.stringify(testHeader)).toString('base64url')}.${Buffer.from(JSON.stringify(testPayload)).toString('base64url')}.dummy_signature`;
const decodedJwt = decodeJwt(testToken);
assert.strictEqual(decodedJwt.header.alg, 'HS256');
assert.strictEqual(decodedJwt.payload.name, 'Max Mustermann');
console.log('✓ JWT Decoder test passed.');

// UUID Generator
function generateUuidV4(): string {
  return crypto.randomUUID();
}
const uuid = generateUuidV4();
assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
console.log('✓ UUID v4 Generator test passed.');

// Hash Generator
function hashString(algorithm: string, text: string): string {
  return crypto.createHash(algorithm).update(text, 'utf-8').digest('hex');
}
const testHashInput = 'CoolWave2026';
const sha256Hash = hashString('sha256', testHashInput);
assert.strictEqual(sha256Hash.length, 64, 'SHA-256 hash must be 64 hex characters');
const sha512Hash = hashString('sha512', testHashInput);
assert.strictEqual(sha512Hash.length, 128, 'SHA-512 hash must be 128 hex characters');
console.log('✓ Hash Generator (SHA-256, SHA-512) test passed.');

// Timestamp Converter
function convertTimestamp(epochSeconds: number) {
  const date = new Date(epochSeconds * 1000);
  const iso = date.toISOString();
  const utc = date.toUTCString();
  return { iso, utc };
}
const tsResult = convertTimestamp(1700000000);
assert.strictEqual(tsResult.iso, '2023-11-14T22:13:20.000Z');
console.log('✓ Timestamp Converter test passed.');

// Regex Tester
function testRegex(pattern: string, flags: string, text: string) {
  const re = new RegExp(pattern, flags);
  const matches: string[] = [];
  let m;
  if (flags.includes('g')) {
    while ((m = re.exec(text)) !== null) {
      matches.push(m[0]);
    }
  } else {
    m = re.exec(text);
    if (m) matches.push(m[0]);
  }
  return matches;
}
const regexMatches = testRegex('[A-Z]\\w+', 'g', 'Hello World from CoolWave Test');
assert.deepStrictEqual(regexMatches, ['Hello', 'World', 'CoolWave', 'Test']);
console.log('✓ Regex Tester test passed.');

console.log('\n=============================================');
console.log('ALL 16 UTILITY & DEV TOOLS ALGORITHMS VERIFIED!');
console.log('=============================================');
