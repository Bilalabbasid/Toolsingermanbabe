'use client';

import React, { useState } from 'react';
import { Type, Code2, Binary, Copy, Check, RotateCcw } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface TextUtilityEngineProps {
  toolId: 'wortzaehler' | 'json-formatter' | 'base64-umwandeln';
}

export function TextUtilityEngine({ toolId }: TextUtilityEngineProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState<number>(2);
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');

  // Word counter calculations
  const trimmed = input.trim();
  const wordsCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charsCount = input.length;
  const charsNoSpaces = input.replace(/\s/g, '').length;
  const paragraphsCount = trimmed ? input.split(/\n+/).filter(Boolean).length : 0;
  const linesCount = input ? input.split('\n').length : 0;
  const readingTimeMin = Math.ceil(wordsCount / 200);

  // JSON Formatter handlers
  const formatJson = (spaces: number) => {
    setError(null);
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, spaces));
      trackEvent('conversion_completed', { toolSlug: 'json-formatter' });
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const minifyJson = () => {
    setError(null);
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      trackEvent('conversion_completed', { toolSlug: 'json-formatter' });
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  // Base64 handlers (with UTF-8 support for German Umlaute)
  const handleBase64 = (mode: 'encode' | 'decode') => {
    setError(null);
    try {
      if (!input.trim()) return;
      if (mode === 'encode') {
        const utf8Bytes = new TextEncoder().encode(input);
        let binary = '';
        utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
        setOutput(btoa(binary));
      } else {
        const binary = atob(input.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        setOutput(new TextDecoder().decode(bytes));
      }
      trackEvent('conversion_completed', { toolSlug: 'base64-umwandeln' });
    } catch (err: unknown) {
      setError('Ungültiger Base64-String zum Dekodieren.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* 1. WORD COUNTER UI */}
      {toolId === 'wortzaehler' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
              <div className="text-2xl font-black text-sky-700">{wordsCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Wörter</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-2xl font-black text-slate-800">{charsCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Zeichen (gesamt)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-2xl font-black text-slate-800">{charsNoSpaces}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Ohne Leerzeichen</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-2xl font-black text-emerald-700">~{readingTimeMin} Min.</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Lesezeit</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Text eingeben oder einfügen
              </label>
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Text leeren
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fügen Sie Ihren Text hier ein (z. B. Hausarbeit, Blogartikel, Anschreiben)..."
              rows={10}
              className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              {paragraphsCount} Absätze • {linesCount} Zeilen
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setInput(input.toUpperCase())}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
              >
                GROSSBUCHSTABEN
              </button>
              <button
                onClick={() => setInput(input.toLowerCase())}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
              >
                kleinbuchstaben
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. JSON FORMATTER UI */}
      {toolId === 'json-formatter' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Unformatiertes JSON einfügen
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"beispiel": "wert", "zahlen": [1, 2, 3]}'
              rows={8}
              className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => formatJson(2)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Formatieren (2 Leerzeichen)
              </button>
              <button
                onClick={() => formatJson(4)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Formatieren (4 Leerzeichen)
              </button>
              <button
                onClick={minifyJson}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Kompaktieren (Minify)
              </button>
            </div>

            {output && (
              <button
                onClick={() => copyToClipboard(output)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopiert!' : 'Ergebnis kopieren'}</span>
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
              Syntax-Fehler: {error}
            </div>
          )}

          {output && !error && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Formatiertes Ergebnis
              </label>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-auto max-h-96 leading-relaxed">
                {output}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 3. BASE64 UI */}
      {toolId === 'base64-umwandeln' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setB64Mode('encode');
                setOutput('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                b64Mode === 'encode'
                  ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Text → Base64 (Enkodieren)
            </button>
            <button
              onClick={() => {
                setB64Mode('decode');
                setOutput('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                b64Mode === 'decode'
                  ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Base64 → Text (Dekodieren)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {b64Mode === 'encode' ? 'Klartext eingeben' : 'Base64-Zeichenkette eingeben'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={b64Mode === 'encode' ? 'Geben Sie den umzuwandelnden Text ein...' : 'SGVsZG8sIFdvcmxkIQ=='}
              rows={6}
              className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => handleBase64(b64Mode)}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              {b64Mode === 'encode' ? 'In Base64 enkodieren' : 'Aus Base64 dekodieren'}
            </button>

            {output && (
              <button
                onClick={() => copyToClipboard(output)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {output && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ergebnis
              </label>
              <textarea
                readOnly
                value={output}
                rows={6}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
