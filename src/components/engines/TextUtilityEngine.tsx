'use client';

import React, { useState, useMemo } from 'react';
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Sliders,
  AlignLeft,
  ListFilter,
  FileDiff,
  Link2,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export type TextUtilityToolId =
  | 'wortzaehler'
  | 'zeichenzaehler'
  | 'zeilen-zaehlen'
  | 'gross-kleinschreibung-aendern'
  | 'leerzeichen-entfernen'
  | 'doppelte-zeilen-entfernen'
  | 'text-vergleichen'
  | 'slug-generator';

interface TextUtilityEngineProps {
  toolId: TextUtilityToolId;
}

export function TextUtilityEngine({ toolId }: TextUtilityEngineProps) {
  const [input, setInput] = useState('');
  const [compareInput, setCompareInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Options for Case Converter
  const [caseType, setCaseType] = useState<
    'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'alternating'
  >('title');

  // Options for Whitespace Remover
  const [whitespaceOption, setWhitespaceOption] = useState<
    'trim' | 'collapse' | 'all' | 'empty_lines' | 'tabs_to_spaces'
  >('collapse');

  // Options for Deduplicate
  const [caseSensitiveDedup, setCaseSensitiveDedup] = useState(false);
  const [sortDedup, setSortDedup] = useState<'none' | 'asc' | 'desc'>('none');

  // Options for Slug Generator
  const [slugSeparator, setSlugSeparator] = useState<'-' | '_'>('-');
  const [slugLowercase, setSlugLowercase] = useState(true);

  // Statistics
  const stats = useMemo(() => {
    const trimmed = input.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordsCount = words.length;
    const charsCount = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const lettersCount = (input.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
    const digitsCount = (input.match(/\d/g) || []).length;
    const whitespacesCount = (input.match(/\s/g) || []).length;
    const lines = input ? input.split('\n') : [];
    const linesCount = lines.length;
    const nonEmptyLinesCount = lines.filter((l) => l.trim().length > 0).length;
    const emptyLinesCount = linesCount - nonEmptyLinesCount;
    const paragraphsCount = trimmed ? input.split(/\n\s*\n/).filter(Boolean).length : 0;
    const sentencesCount = trimmed ? (input.match(/[.!?]+(?:\s|$)/g) || []).length || 1 : 0;
    const byteSize = new TextEncoder().encode(input).length;
    const readingTimeMin = Math.ceil(wordsCount / 200);
    const speakingTimeMin = Math.ceil(wordsCount / 130);

    const lineLengths = lines.map((l) => l.length);
    const maxLineLength = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;
    const avgLineLength = linesCount > 0 ? Math.round(charsCount / linesCount) : 0;

    return {
      wordsCount,
      charsCount,
      charsNoSpaces,
      lettersCount,
      digitsCount,
      whitespacesCount,
      linesCount,
      nonEmptyLinesCount,
      emptyLinesCount,
      paragraphsCount,
      sentencesCount,
      byteSize,
      readingTimeMin,
      speakingTimeMin,
      maxLineLength,
      avgLineLength,
    };
  }, [input]);

  // Copy helper
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Case Converter Logic
  const handleCaseConvert = (type: typeof caseType) => {
    setCaseType(type);
    if (!input) {
      setOutput('');
      return;
    }

    let res = '';
    switch (type) {
      case 'upper':
        res = input.toUpperCase();
        break;
      case 'lower':
        res = input.toLowerCase();
        break;
      case 'title':
        res = input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        res = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel': {
        const words = input.trim().split(/[\s_-]+/);
        res = words
          .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
          .join('');
        break;
      }
      case 'pascal': {
        const words = input.trim().split(/[\s_-]+/);
        res = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      }
      case 'snake':
        res = input
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, '_')
          .replace(/[^\w_]/g, '');
        break;
      case 'kebab':
        res = input
          .trim()
          .toLowerCase()
          .replace(/[\s_]+/g, '-')
          .replace(/[^\w-]/g, '');
        break;
      case 'alternating':
        res = input
          .split('')
          .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
          .join('');
        break;
    }
    setOutput(res);
    trackEvent('conversion_completed', { toolSlug: 'gross-kleinschreibung-aendern', type });
  };

  // 2. Whitespace Remover Logic
  const handleWhitespaceRemove = (option: typeof whitespaceOption) => {
    setWhitespaceOption(option);
    if (!input) {
      setOutput('');
      return;
    }

    let res = '';
    switch (option) {
      case 'trim':
        res = input
          .split('\n')
          .map((l) => l.trim())
          .join('\n')
          .trim();
        break;
      case 'collapse':
        res = input.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        break;
      case 'all':
        res = input.replace(/\s+/g, '');
        break;
      case 'empty_lines':
        res = input
          .split('\n')
          .filter((l) => l.trim().length > 0)
          .join('\n');
        break;
      case 'tabs_to_spaces':
        res = input.replace(/\t/g, '  ');
        break;
    }
    setOutput(res);
    trackEvent('conversion_completed', { toolSlug: 'leerzeichen-entfernen', option });
  };

  // 3. Deduplicate Lines Logic
  const handleDeduplicate = () => {
    if (!input) {
      setOutput('');
      return;
    }

    const lines = input.split(/\r?\n/);
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const key = caseSensitiveDedup ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    }

    if (sortDedup === 'asc') {
      uniqueLines.sort((a, b) => a.localeCompare(b, 'de'));
    } else if (sortDedup === 'desc') {
      uniqueLines.sort((a, b) => b.localeCompare(a, 'de'));
    }

    setOutput(uniqueLines.join('\n'));
    trackEvent('conversion_completed', { toolSlug: 'doppelte-zeilen-entfernen' });
  };

  // 4. Slug Generator Logic
  const handleSlugGenerate = () => {
    if (!input) {
      setOutput('');
      return;
    }

    let slug = input.trim();

    // German umlauts conversion
    const umlautMap: Record<string, string> = {
      ä: 'ae',
      ö: 'oe',
      ü: 'ue',
      Ä: 'Ae',
      Ö: 'Oe',
      Ü: 'Ue',
      ß: 'ss',
    };
    for (const [k, v] of Object.entries(umlautMap)) {
      slug = slug.replace(new RegExp(k, 'g'), v);
    }

    if (slugLowercase) {
      slug = slug.toLowerCase();
    }

    // Remove accents
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Replace special chars and whitespace with separator
    slug = slug.replace(/[^a-zA-Z0-9_-]+/g, slugSeparator);

    // Collapse duplicate separators
    const sepRegex = new RegExp(`\\${slugSeparator}+`, 'g');
    slug = slug.replace(sepRegex, slugSeparator);

    // Trim leading/trailing separators
    const trimRegex = new RegExp(`^\\${slugSeparator}|\\${slugSeparator}$`, 'g');
    slug = slug.replace(trimRegex, '');

    setOutput(slug);
    trackEvent('conversion_completed', { toolSlug: 'slug-generator' });
  };

  // 5. Diff Lines calculation for Text Vergleichen
  const diffResult = useMemo(() => {
    if (toolId !== 'text-vergleichen') return [];
    const linesA = input.split(/\r?\n/);
    const linesB = compareInput.split(/\r?\n/);
    const max = Math.max(linesA.length, linesB.length);
    const diffs: Array<{ lineNum: number; left?: string; right?: string; type: 'same' | 'diff' | 'left_only' | 'right_only' }> = [];

    for (let i = 0; i < max; i++) {
      const left = linesA[i];
      const right = linesB[i];
      if (left === undefined) {
        diffs.push({ lineNum: i + 1, right, type: 'right_only' });
      } else if (right === undefined) {
        diffs.push({ lineNum: i + 1, left, type: 'left_only' });
      } else if (left === right) {
        diffs.push({ lineNum: i + 1, left, right, type: 'same' });
      } else {
        diffs.push({ lineNum: i + 1, left, right, type: 'diff' });
      }
    }
    return diffs;
  }, [toolId, input, compareInput]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* ------------------------------------------------------------- */}
      {/* 1. WORTZÄHLER & ZEICHENZÄHLER & ZEILENZÄHLER */}
      {/* ------------------------------------------------------------- */}
      {(toolId === 'wortzaehler' || toolId === 'zeichenzaehler' || toolId === 'zeilen-zaehlen') && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-xl text-center border ${toolId === 'wortzaehler' ? 'bg-sky-50 border-sky-200 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-2xl font-black text-sky-700">{stats.wordsCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Wörter</div>
            </div>
            <div className={`p-4 rounded-xl text-center border ${toolId === 'zeichenzaehler' ? 'bg-sky-50 border-sky-200 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-2xl font-black text-slate-800">{stats.charsCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Zeichen (inkl. Leerz.)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-2xl font-black text-slate-800">{stats.charsNoSpaces}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Ohne Leerzeichen</div>
            </div>
            <div className={`p-4 rounded-xl text-center border ${toolId === 'zeilen-zaehlen' ? 'bg-sky-50 border-sky-200 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-2xl font-black text-slate-800">{stats.linesCount}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Zeilen</div>
            </div>
          </div>

          {/* Secondary Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500">Absätze:</span>
              <span className="font-bold text-slate-800">{stats.paragraphsCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500">Sätze:</span>
              <span className="font-bold text-slate-800">{stats.sentencesCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500">Nicht-leere Zeilen:</span>
              <span className="font-bold text-slate-800">{stats.nonEmptyLinesCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
              <span className="text-slate-500">Lesezeit:</span>
              <span className="font-bold text-slate-800">~{stats.readingTimeMin} Min.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between col-span-2 sm:col-span-1">
              <span className="text-slate-500">Dateigröße:</span>
              <span className="font-bold text-slate-800">{stats.byteSize} B</span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Text zur Analyse eingeben oder einfügen
              </label>
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Text leeren
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fügen Sie Ihren Text hier ein (z. B. Essay, Artikel, E-Mail oder Quellcode)..."
              rows={12}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed resize-y"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. GROSS-/KLEINSCHREIBUNG ÄNDERN */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'gross-kleinschreibung-aendern' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Originaltext
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Geben Sie den Text ein, dessen Groß- und Kleinschreibung geändert werden soll..."
              rows={6}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Wählen Sie den Zielstil
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleCaseConvert('upper')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'upper' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                GROSSBUCHSTABEN
              </button>
              <button
                onClick={() => handleCaseConvert('lower')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'lower' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                kleinbuchstaben
              </button>
              <button
                onClick={() => handleCaseConvert('title')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'title' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                Title Case (Jedes Wort)
              </button>
              <button
                onClick={() => handleCaseConvert('sentence')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'sentence' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                Sentence case. (Satzanfang)
              </button>
              <button
                onClick={() => handleCaseConvert('camel')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'camel' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                camelCase
              </button>
              <button
                onClick={() => handleCaseConvert('pascal')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'pascal' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                PascalCase
              </button>
              <button
                onClick={() => handleCaseConvert('snake')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'snake' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                snake_case
              </button>
              <button
                onClick={() => handleCaseConvert('kebab')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-colors ${caseType === 'kebab' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                kebab-case
              </button>
            </div>
          </div>

          {/* Output Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Konvertiertes Ergebnis
              </label>
              {output && (
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Das konvertierte Ergebnis erscheint hier nach Klick auf eine der Schaltflächen..."
              rows={6}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 bg-slate-50 font-sans leading-relaxed focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. LEERZEICHEN ENTFERNEN */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'leerzeichen-entfernen' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Originaltext
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fügen Sie Text mit überflüssigen Leerzeichen oder Zeilenumbrüchen ein..."
              rows={6}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleWhitespaceRemove('collapse')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors ${whitespaceOption === 'collapse' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
            >
              Mehrfache Leerzeichen zusammenfassen
            </button>
            <button
              onClick={() => handleWhitespaceRemove('trim')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors ${whitespaceOption === 'trim' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
            >
              Zeilenanfang & -ende trimmen
            </button>
            <button
              onClick={() => handleWhitespaceRemove('empty_lines')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors ${whitespaceOption === 'empty_lines' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
            >
              Leerzeilen löschen
            </button>
            <button
              onClick={() => handleWhitespaceRemove('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors ${whitespaceOption === 'all' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
            >
              Alle Leerzeichen restlos entfernen
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Bereinigter Text
              </label>
              {output && (
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Bereinigter Text erscheint hier..."
              rows={6}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 bg-slate-50 font-sans leading-relaxed focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. DOPPELTE ZEILEN ENTFERNEN */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'doppelte-zeilen-entfernen' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Zeilenorientierter Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fügen Sie Ihre Liste ein (z. B. E-Mail-Adressen, URLs, Keywords)..."
              rows={7}
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitiveDedup}
                  onChange={(e) => setCaseSensitiveDedup(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                Groß-/Kleinschreibung beachten
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sortierung:</span>
                <select
                  value={sortDedup}
                  onChange={(e) => setSortDedup(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
                >
                  <option value="none">Reihenfolge beibehalten</option>
                  <option value="asc">Alphabetisch (A → Z)</option>
                  <option value="desc">Alphabetisch (Z → A)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleDeduplicate}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Duplikate filtern
            </button>
          </div>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Eindeutige Zeilen ({output.split('\n').length} Zeilen)
                </label>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                rows={7}
                className="w-full p-4 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TEXT VERGLEICHEN (DIFF) */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'text-vergleichen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Originaltext (Version A)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Fügen Sie die ursprüngliche Version des Textes ein..."
                rows={8}
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Veränderter Text (Version B)
              </label>
              <textarea
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
                placeholder="Fügen Sie die überarbeitete Version des Textes ein..."
                rows={8}
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {diffResult.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Zeilenweiser Vergleich</span>
                <span className="text-slate-500 font-normal">Grün = Hinzugefügt / Rot = Entfernt / Gelb = Geändert</span>
              </div>
              <div className="divide-y divide-slate-100 font-mono text-xs max-h-96 overflow-y-auto">
                {diffResult.map((d, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 px-3 py-1.5 ${
                      d.type === 'same'
                        ? 'bg-white text-slate-700'
                        : d.type === 'diff'
                        ? 'bg-amber-50/80 text-amber-950'
                        : d.type === 'left_only'
                        ? 'bg-rose-50 text-rose-900'
                        : 'bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    <div className="col-span-1 text-slate-400 select-none">{d.lineNum}</div>
                    <div className="col-span-5 border-r border-slate-200/60 pr-2 truncate">
                      {d.left !== undefined ? d.left : <span className="text-slate-300 italic">—</span>}
                    </div>
                    <div className="col-span-1 text-slate-400 select-none pl-2">{d.lineNum}</div>
                    <div className="col-span-5 truncate">
                      {d.right !== undefined ? d.right : <span className="text-slate-300 italic">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. SLUG GENERATOR */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'slug-generator' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Titel oder Text für SEO-URL
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Z. B.: Die 10 besten Tipps für schöne Fotos & günstige Kameras im März!"
              className="w-full p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slugLowercase}
                  onChange={(e) => setSlugLowercase(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                In Kleinbuchstaben umwandeln
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Trennzeichen:</span>
                <button
                  onClick={() => setSlugSeparator('-')}
                  className={`px-3 py-1 rounded-md border text-xs font-mono font-bold ${slugSeparator === '-' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300 text-slate-700'}`}
                >
                  Bindestrich (-)
                </button>
                <button
                  onClick={() => setSlugSeparator('_')}
                  className={`px-3 py-1 rounded-md border text-xs font-mono font-bold ${slugSeparator === '_' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-300 text-slate-700'}`}
                >
                  Unterstrich (_)
                </button>
              </div>
            </div>

            <button
              onClick={handleSlugGenerate}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Slug generieren
            </button>
          </div>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Generierter URL-Slug
                </label>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-sky-900 break-all select-all">
                {output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
