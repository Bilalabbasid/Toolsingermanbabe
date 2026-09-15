'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertCircle,
  FileCode,
  Binary,
  Hash,
  Clock,
  Key,
  ShieldCheck,
  Search,
  Braces,
  Settings,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export type DevUtilityToolId =
  | 'json-formatter'
  | 'json-validator'
  | 'json-in-csv-umwandeln'
  | 'csv-in-json-umwandeln'
  | 'base64-encoder'
  | 'base64-decoder'
  | 'base64-umwandeln'
  | 'url-encoder'
  | 'url-decoder'
  | 'jwt-decoder'
  | 'uuid-generator'
  | 'hash-generator'
  | 'timestamp-umrechnen'
  | 'regex-tester'
  | 'html-formatter'
  | 'css-formatter'
  | 'javascript-formatter';

interface DevUtilityEngineProps {
  toolId: DevUtilityToolId;
}

export function DevUtilityEngine({ toolId }: DevUtilityEngineProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // JSON / CSV options
  const [jsonIndent, setJsonIndent] = useState<number>(2);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t'>(',');

  // URL options
  const [urlComponentMode, setUrlComponentMode] = useState(true);

  // UUID options
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidUppercase, setUuidUppercase] = useState(false);
  const [uuidHyphens, setUuidHyphens] = useState(true);

  // Hash options
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1' | 'SHA-384'>('SHA-256');
  const [hashOutput, setHashOutput] = useState<Record<string, string>>({});

  // Timestamp options
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [targetDateInput, setTargetDateInput] = useState('');

  // Regex options
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');

  // Live timestamp clock ticker
  useEffect(() => {
    if (toolId !== 'timestamp-umrechnen') return;
    const timer = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [toolId]);

  // Copy helper
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // 1. JSON FORMATTER & VALIDATOR
  // -------------------------------------------------------------
  const handleFormatJson = (spaces: number) => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, spaces));
      trackEvent('conversion_completed', { toolSlug: 'json-formatter' });
    } catch (err: any) {
      setError(`JSON Syntaxfehler: ${err?.message || 'Ungültiges JSON'}`);
    }
  };

  const handleMinifyJson = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      trackEvent('conversion_completed', { toolSlug: 'json-formatter' });
    } catch (err: any) {
      setError(`JSON Syntaxfehler: ${err?.message || 'Ungültiges JSON'}`);
    }
  };

  const handleValidateJson = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      JSON.parse(input);
      setOutput('✓ Gültiges JSON! Die Syntax entspricht vollständig dem JSON-Standard (RFC 8259).');
      trackEvent('conversion_completed', { toolSlug: 'json-validator' });
    } catch (err: any) {
      setError(`Syntaxfehler: ${err?.message}`);
      setOutput('');
    }
  };

  // -------------------------------------------------------------
  // 2. JSON ↔ CSV CONVERTER
  // -------------------------------------------------------------
  const handleJsonToCsv = () => {
    setError(null);
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0 || typeof arr[0] !== 'object') {
        throw new Error('JSON muss ein Array von Objekten sein (z. B. [{"id": 1, "name": "Beispiel"}]).');
      }

      // Collect all keys
      const headers = Array.from(new Set(arr.flatMap((obj) => Object.keys(obj))));
      const rows: string[] = [headers.join(csvDelimiter)];

      for (const obj of arr) {
        const row = headers.map((header) => {
          const val = obj[header];
          if (val === null || val === undefined) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          if (str.includes(csvDelimiter) || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        rows.push(row.join(csvDelimiter));
      }

      setOutput(rows.join('\n'));
      trackEvent('conversion_completed', { toolSlug: 'json-in-csv-umwandeln' });
    } catch (err: any) {
      setError(`Konvertierungsfehler: ${err?.message}`);
    }
  };

  const handleCsvToJson = () => {
    setError(null);
    if (!input.trim()) return;
    try {
      const lines = input.trim().split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error('CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
      }

      // Auto detect delimiter
      const firstLine = lines[0];
      const delim = firstLine.includes(';') && !firstLine.includes(',') ? ';' : firstLine.includes('\t') ? '\t' : ',';

      // Parse headers
      const headers = firstLine.split(delim).map((h) => h.replace(/^"|"$/g, '').trim());
      const resultArr: Array<Record<string, any>> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV split considering quotes
        const values: string[] = [];
        let curr = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const c = line[j];
          if (c === '"') inQuotes = !inQuotes;
          else if (c === delim && !inQuotes) {
            values.push(curr.trim());
            curr = '';
          } else {
            curr += c;
          }
        }
        values.push(curr.trim());

        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          let val = values[idx] !== undefined ? values[idx].replace(/^"|"$/g, '').replace(/""/g, '"') : '';
          // Type coercion for numbers and booleans
          if (val === 'true') obj[h] = true;
          else if (val === 'false') obj[h] = false;
          else if (!isNaN(Number(val)) && val !== '') obj[h] = Number(val);
          else obj[h] = val;
        });
        resultArr.push(obj);
      }

      setOutput(JSON.stringify(resultArr, null, 2));
      trackEvent('conversion_completed', { toolSlug: 'csv-in-json-umwandeln' });
    } catch (err: any) {
      setError(`CSV-Parser-Fehler: ${err?.message}`);
    }
  };

  // -------------------------------------------------------------
  // 3. BASE64 & URL ENCODE / DECODE
  // -------------------------------------------------------------
  const handleBase64 = (mode: 'encode' | 'decode') => {
    setError(null);
    if (!input.trim()) return;
    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(input);
        let bin = '';
        bytes.forEach((b) => (bin += String.fromCharCode(b)));
        setOutput(btoa(bin));
      } else {
        const bin = atob(input.trim());
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        setOutput(new TextDecoder().decode(bytes));
      }
      trackEvent('conversion_completed', { toolSlug: 'base64-umwandeln', mode });
    } catch (err: any) {
      setError('Ungültiger Base64-String zum Dekodieren.');
    }
  };

  const handleUrl = (mode: 'encode' | 'decode') => {
    setError(null);
    if (!input.trim()) return;
    try {
      if (mode === 'encode') {
        setOutput(urlComponentMode ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(urlComponentMode ? decodeURIComponent(input) : decodeURI(input));
      }
      trackEvent('conversion_completed', { toolSlug: 'url-encoder', mode });
    } catch (err: any) {
      setError('Fehler bei der URL-Dekodierung. Überprüfen Sie fehlerhafte Prozent-Sequenzen.');
    }
  };

  // -------------------------------------------------------------
  // 4. JWT DECODER
  // -------------------------------------------------------------
  const decodedJwt = useMemo(() => {
    if (toolId !== 'jwt-decoder' || !input.trim()) return null;
    const parts = input.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Ungültiges JWT-Format (muss aus Header.Payload.Signatur mit 3 Teilen bestehen).' };
    }
    try {
      const decodeB64Url = (str: string) => {
        let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return JSON.parse(new TextDecoder().decode(bytes));
      };

      const header = decodeB64Url(parts[0]);
      const payload = decodeB64Url(parts[1]);

      let isExpired = false;
      let expDate: string | null = null;
      if (payload.exp) {
        const expMs = payload.exp * 1000;
        isExpired = Date.now() > expMs;
        expDate = new Date(expMs).toLocaleString('de-DE');
      }

      return { header, payload, signature: parts[2], isExpired, expDate };
    } catch (err: any) {
      return { error: 'Konnte Token nicht dekodieren: Ungültige Base64Url-Codierung.' };
    }
  }, [toolId, input]);

  // -------------------------------------------------------------
  // 5. UUID GENERATOR
  // -------------------------------------------------------------
  const handleGenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = crypto.randomUUID();
      if (!uuidHyphens) u = u.replace(/-/g, '');
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setOutput(list.join('\n'));
    trackEvent('conversion_completed', { toolSlug: 'uuid-generator', count: uuidCount });
  };

  // -------------------------------------------------------------
  // 6. HASH GENERATOR (Web Crypto API)
  // -------------------------------------------------------------
  const handleGenerateHash = async () => {
    if (!input) {
      setHashOutput({});
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const algos = ['SHA-256', 'SHA-512', 'SHA-1', 'SHA-384'] as const;
    const results: Record<string, string> = {};

    for (const alg of algos) {
      try {
        const hashBuf = await crypto.subtle.digest(alg, data);
        const hashArr = Array.from(new Uint8Array(hashBuf));
        const hashHex = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
        results[alg] = hashHex;
      } catch {}
    }
    setHashOutput(results);
    trackEvent('conversion_completed', { toolSlug: 'hash-generator' });
  };

  // -------------------------------------------------------------
  // 7. TIMESTAMP CONVERTER
  // -------------------------------------------------------------
  const convertedTimestamp = useMemo(() => {
    if (toolId !== 'timestamp-umrechnen') return null;
    const val = input.trim();
    if (!val) return null;

    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      // If 10 digits -> seconds, if 13 digits -> ms
      const ms = num < 10000000000 ? num * 1000 : num;
      const d = new Date(ms);
      return {
        iso: d.toISOString(),
        berlin: d.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
        utc: d.toUTCString(),
        relative: `${Math.round((Date.now() - ms) / 1000 / 60)} Minuten vergangen`,
      };
    }
    return null;
  }, [toolId, input]);

  // -------------------------------------------------------------
  // 8. REGEX TESTER (Worker-Isolated with ReDoS Protection)
  // -------------------------------------------------------------
  const [regexResult, setRegexResult] = useState<{
    count: number;
    matches: Array<{ match: string; index?: number; groups?: string[] }>;
    valid: boolean;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (toolId !== 'regex-tester' || !regexPattern) {
      setRegexResult(null);
      return;
    }

    if (regexPattern.length > 500) {
      setRegexResult({
        count: 0,
        matches: [],
        valid: false,
        error: 'Regex-Muster überschreitet die maximale Länge von 500 Zeichen.',
      });
      return;
    }

    if (input.length > 200000) {
      setRegexResult({
        count: 0,
        matches: [],
        valid: false,
        error: 'Test-Text überschreitet das Limit von 200.000 Zeichen.',
      });
      return;
    }

    const workerCode = `
      self.onmessage = function(e) {
        var pattern = e.data.pattern;
        var flags = e.data.flags;
        var text = e.data.text;
        try {
          var reg = new RegExp(pattern, flags);
          var matches = [];
          var m;
          var count = 0;
          var cap = 1000;
          if (!flags.includes('g')) {
            var single = reg.exec(text);
            if (single) {
              matches.push({ match: single[0], index: single.index, groups: Array.from(single.slice(1)) });
            }
          } else {
            while ((m = reg.exec(text)) !== null) {
              matches.push({ match: m[0], index: m.index, groups: Array.from(m.slice(1)) });
              count++;
              if (count >= cap) break;
              if (m[0].length === 0) reg.lastIndex++;
            }
          }
          self.postMessage({ success: true, matches: matches });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;

    let worker: Worker | null = null;
    let workerUrl = '';
    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
    } catch {
      try {
        const reg = new RegExp(regexPattern, regexFlags);
        const matches = Array.from(input.matchAll(reg)).slice(0, 1000);
        setRegexResult({
          count: matches.length,
          matches: matches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })),
          valid: true,
          error: null,
        });
      } catch (err: any) {
        setRegexResult({ count: 0, matches: [], valid: false, error: err?.message || 'Ungültiger Regex' });
      }
      return;
    }

    const timeout = setTimeout(() => {
      if (worker) {
        worker.terminate();
        setRegexResult({
          count: 0,
          matches: [],
          valid: false,
          error: 'Zeitüberschreitung (ReDoS-Schutz): Der reguläre Ausdruck benötigt zu viele Backtracking-Schritte und wurde nach 500ms gestoppt.',
        });
      }
    }, 500);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      if (e.data.success) {
        setRegexResult({
          count: e.data.matches.length,
          matches: e.data.matches,
          valid: true,
          error: null,
        });
      } else {
        setRegexResult({
          count: 0,
          matches: [],
          valid: false,
          error: e.data.error || 'Ungültiger regulärer Ausdruck',
        });
      }
      worker?.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      setRegexResult({
        count: 0,
        matches: [],
        valid: false,
        error: 'Fehler bei der Regex-Auswertung: ' + err.message,
      });
      worker?.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };

    worker.postMessage({ pattern: regexPattern, flags: regexFlags, text: input });

    return () => {
      clearTimeout(timeout);
      if (worker) worker.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };
  }, [toolId, regexPattern, regexFlags, input]);

  // -------------------------------------------------------------
  // 9. CODE FORMATTERS (HTML, CSS, JS with String Preservation)
  // -------------------------------------------------------------
  const safeMinifyJs = (code: string): string => {
    let result = '';
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let inBlockComment = false;
    let inLineComment = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const next = code[i + 1];

      if (inLineComment) {
        if (char === '\n') {
          inLineComment = false;
          result += '\n';
        }
        continue;
      }

      if (inBlockComment) {
        if (char === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }

      if (inSingle) {
        result += char;
        if (char === '\\') {
          result += next || '';
          i++;
        } else if (char === "'") {
          inSingle = false;
        }
        continue;
      }

      if (inDouble) {
        result += char;
        if (char === '\\') {
          result += next || '';
          i++;
        } else if (char === '"') {
          inDouble = false;
        }
        continue;
      }

      if (inTemplate) {
        result += char;
        if (char === '\\') {
          result += next || '';
          i++;
        } else if (char === '`') {
          inTemplate = false;
        }
        continue;
      }

      if (char === '/' && next === '/') {
        inLineComment = true;
        i++;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }

      if (char === "'") {
        inSingle = true;
        result += char;
        continue;
      }
      if (char === '"') {
        inDouble = true;
        result += char;
        continue;
      }
      if (char === '`') {
        inTemplate = true;
        result += char;
        continue;
      }

      result += char;
    }

    return result
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s*([{};:,=+\-*/<>!&|])\s*/g, '$1')
      .trim();
  };

  const safeMinifyCss = (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s*([{};:,>+~])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  };

  const safeMinifyHtml = (html: string): string => {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .trim();
  };

  const handleFormatCode = (type: 'html' | 'css' | 'js', mode: 'beautify' | 'minify') => {
    setError(null);
    if (!input.trim()) return;
    try {
      if (mode === 'minify') {
        if (type === 'html') {
          setOutput(safeMinifyHtml(input));
        } else if (type === 'css') {
          setOutput(safeMinifyCss(input));
        } else {
          setOutput(safeMinifyJs(input));
        }
      } else {
        // Beautifier
        if (type === 'html') {
          let indent = 0;
          const formatted = input
            .replace(/>\s*</g, '>\n<')
            .split('\n')
            .map((line) => {
              line = line.trim();
              if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
              const pad = '  '.repeat(indent);
              if (line.match(/^<\w[^>]*[^\/]>$/) && !line.match(/<(input|img|br|hr|meta|link)/i)) {
                indent++;
              }
              return pad + line;
            })
            .join('\n');
          setOutput(formatted);
        } else if (type === 'css') {
          const formatted = input
            .replace(/\s*\{\s*/g, ' {\n  ')
            .replace(/\s*;\s*/g, ';\n  ')
            .replace(/\s*\}\s*/g, '\n}\n\n')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
          setOutput(formatted);
        } else {
          try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
          } catch {
            const formatted = input
              .replace(/\{/g, '{\n  ')
              .replace(/\}/g, '\n}')
              .replace(/;/g, ';\n')
              .replace(/\n\s*\n/g, '\n');
            setOutput(formatted);
          }
        }
      }
      trackEvent('conversion_completed', { toolSlug: `${type}-formatter`, mode });
    } catch (err: any) {
      setError(`Formatierungsfehler: ${err?.message}`);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* ------------------------------------------------------------- */}
      {/* JSON FORMATTER & VALIDATOR */}
      {/* ------------------------------------------------------------- */}
      {(toolId === 'json-formatter' || toolId === 'json-validator') && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Einrückung:</span>
              <button
                onClick={() => handleFormatJson(2)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
              >
                2 Leerzeichen
              </button>
              <button
                onClick={() => handleFormatJson(4)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
              >
                4 Leerzeichen
              </button>
              <button
                onClick={handleMinifyJson}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
              >
                Kompakt minimieren
              </button>
            </div>
            <button
              onClick={handleValidateJson}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
            >
              JSON Syntax prüfen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Eingabe (JSON)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"name": "CoolWave", "features": ["PDF", "Convert"]}'
                rows={12}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Ergebnis
                </label>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Kopieren</span>
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                placeholder="Formatiertes oder validiertes JSON erscheint hier..."
                rows={12}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* JSON ↔ CSV CONVERTER */}
      {/* ------------------------------------------------------------- */}
      {(toolId === 'json-in-csv-umwandeln' || toolId === 'csv-in-json-umwandeln') && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Trennzeichen:</span>
              <select
                value={csvDelimiter}
                onChange={(e) => setCsvDelimiter(e.target.value as any)}
                className="px-2.5 py-1 rounded-md border border-slate-300 bg-white"
              >
                <option value=",">Komma (,)</option>
                <option value=";">Semikolon (;)</option>
                <option value="&#9;">Tabulator (\t)</option>
              </select>
            </div>
            <button
              onClick={toolId === 'json-in-csv-umwandeln' ? handleJsonToCsv : handleCsvToJson}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm"
            >
              {toolId === 'json-in-csv-umwandeln' ? 'In CSV konvertieren' : 'In JSON konvertieren'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                {toolId === 'json-in-csv-umwandeln' ? 'JSON Eingabe (Array von Objekten)' : 'CSV Eingabe (mit Kopfzeile)'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  toolId === 'json-in-csv-umwandeln'
                    ? '[{"id": 1, "name": "Anna", "stadt": "Berlin"}, {"id": 2, "name": "Ben", "stadt": "München"}]'
                    : 'id,name,stadt\n1,Anna,Berlin\n2,Ben,München'
                }
                rows={10}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Ergebnis ({toolId === 'json-in-csv-umwandeln' ? 'CSV' : 'JSON'})
                </label>
                {output && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        downloadFile(
                          output,
                          toolId === 'json-in-csv-umwandeln' ? 'export.csv' : 'export.json',
                          toolId === 'json-in-csv-umwandeln' ? 'text/csv' : 'application/json'
                        )
                      }
                      className="text-xs text-slate-600 hover:text-slate-800 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopieren
                    </button>
                  </div>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                rows={10}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BASE64 & URL ENCODER / DECODER */}
      {/* ------------------------------------------------------------- */}
      {(toolId === 'base64-encoder' ||
        toolId === 'base64-decoder' ||
        toolId === 'base64-umwandeln' ||
        toolId === 'url-encoder' ||
        toolId === 'url-decoder') && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              {toolId.startsWith('base64') ? (
                <>
                  <button
                    onClick={() => handleBase64('encode')}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                  >
                    Base64 Enkodieren
                  </button>
                  <button
                    onClick={() => handleBase64('decode')}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                  >
                    Base64 Dekodieren
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleUrl('encode')}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                  >
                    URL Enkodieren
                  </button>
                  <button
                    onClick={() => handleUrl('decode')}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                  >
                    URL Dekodieren
                  </button>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={urlComponentMode}
                      onChange={(e) => setUrlComponentMode(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    Komponenten-Modus (Sonderzeichen enkodieren)
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Eingabetext
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Geben Sie den umzuwandelnden String ein..."
                rows={8}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Ergebnis
                </label>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopieren
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                rows={8}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* JWT DECODER */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'jwt-decoder' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              JSON Web Token (JWT) einfügen
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.signature..."
              rows={4}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 break-all"
            />
          </div>

          {decodedJwt && !decodedJwt.error && (
            <div className="space-y-4">
              {decodedJwt.payload?.exp && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    decodedJwt.isExpired ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <strong>Status: {decodedJwt.isExpired ? 'Abgelaufen (Expired)' : 'Gültig (Aktiv)'}</strong>
                  </div>
                  <div>Ablaufzeitpunkt: {decodedJwt.expDate}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                    HEADER (Algorithmus & Typ)
                  </div>
                  <pre className="p-4 text-xs font-mono bg-slate-50 overflow-x-auto text-slate-800">
                    {JSON.stringify(decodedJwt.header, null, 2)}
                  </pre>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                    PAYLOAD (Claims & Daten)
                  </div>
                  <pre className="p-4 text-xs font-mono bg-slate-50 overflow-x-auto text-slate-800">
                    {JSON.stringify(decodedJwt.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {decodedJwt?.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{decodedJwt.error}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* UUID GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'uuid-generator' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span>Anzahl:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-md border border-slate-300 bg-white"
                >
                  <option value={1}>1 UUID</option>
                  <option value={5}>5 UUIDs</option>
                  <option value={10}>10 UUIDs</option>
                  <option value={25}>25 UUIDs</option>
                  <option value={50}>50 UUIDs</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUppercase}
                  onChange={(e) => setUuidUppercase(e.target.checked)}
                  className="rounded text-sky-600"
                />
                Großbuchstaben (UPPERCASE)
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidHyphens}
                  onChange={(e) => setUuidHyphens(e.target.checked)}
                  className="rounded text-sky-600"
                />
                Mit Bindestrichen
              </label>
            </div>

            <button
              onClick={handleGenerateUuids}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm"
            >
              UUIDs generieren
            </button>
          </div>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Generierte UUID v4 ({output.split('\n').length} Stück)
                </label>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopieren
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                rows={Math.min(12, uuidCount + 1)}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none select-all"
              />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HASH GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'hash-generator' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Eingabetext für Hash-Berechnung
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Geben Sie den zu hashenden Text ein..."
              rows={4}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateHash}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm"
            >
              Kryptografische Hashes berechnen
            </button>
          </div>

          {Object.keys(hashOutput).length > 0 && (
            <div className="space-y-3">
              {Object.entries(hashOutput).map(([algo, h]) => (
                <div key={algo} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{algo}</span>
                    <button
                      onClick={() => copyToClipboard(h)}
                      className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3 h-3" /> Kopieren
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-800 break-all select-all">{h}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TIMESTAMP CONVERTER */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'timestamp-umrechnen' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-800 uppercase tracking-wide">Aktuelle Unix-Epoche</div>
              <div className="text-2xl font-black text-sky-950 font-mono mt-0.5">{currentTimestamp}</div>
            </div>
            <button
              onClick={() => setInput(String(currentTimestamp))}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-sky-200 text-xs font-bold text-sky-700 hover:bg-sky-100"
            >
              Übernehmen
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Unix-Timestamp (Sekunden oder Millisekunden)
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Z. B. 1773500000"
              className="w-full p-3.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {convertedTimestamp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-500 font-semibold mb-1">Deutsche Lokalzeit (Berlin)</div>
                <div className="text-sm font-bold text-slate-900 font-mono">{convertedTimestamp.berlin}</div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-500 font-semibold mb-1">ISO 8601 (UTC)</div>
                <div className="text-sm font-bold text-slate-900 font-mono">{convertedTimestamp.iso}</div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 sm:col-span-2">
                <div className="text-xs text-slate-500 font-semibold mb-1">RFC 2822 / GMT</div>
                <div className="text-xs font-bold text-slate-800 font-mono">{convertedTimestamp.utc}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REGEX TESTER */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'regex-tester' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                Regulärer Ausdruck (Pattern)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono text-sm">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  className="w-full pl-6 pr-12 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="absolute right-3 text-slate-400 font-mono text-sm">/</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                Flags (z. B. g, i, m, s)
              </label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                placeholder="g"
                className="w-full py-2.5 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
              Test-Text (String)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fügen Sie Text ein, um Treffer in Echtzeit zu überprüfen..."
              rows={6}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {regexResult && regexResult.valid && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">
                {regexResult.count} Treffer gefunden
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
                {regexResult.matches?.map((m, idx) => (
                  <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-sky-800 font-bold">{m.match}</span>
                    <span className="text-slate-400 text-2xs">Index: {m.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {regexResult && !regexResult.valid && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Ungültiger regulärer Ausdruck: {regexResult.error}</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CODE FORMATTERS (HTML, CSS, JAVASCRIPT) */}
      {/* ------------------------------------------------------------- */}
      {(toolId === 'html-formatter' || toolId === 'css-formatter' || toolId === 'javascript-formatter') && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleFormatCode(
                  toolId === 'html-formatter' ? 'html' : toolId === 'css-formatter' ? 'css' : 'js',
                  'beautify'
                )
              }
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
            >
              Sauber einrücken (Beautify)
            </button>
            <button
              onClick={() =>
                handleFormatCode(
                  toolId === 'html-formatter' ? 'html' : toolId === 'css-formatter' ? 'css' : 'js',
                  'minify'
                )
              }
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
            >
              Minimieren (Minify)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Quellcode-Eingabe
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Fügen Sie Ihren unformatierten Code hier ein..."
                rows={12}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Formatiertes Ergebnis
                </label>
                {output && (
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Kopieren
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={output}
                rows={12}
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
