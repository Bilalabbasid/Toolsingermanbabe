'use client';

import React, { useState } from 'react';
import { 
  GitCompare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  ArrowRight, 
  Download, 
  RefreshCw,
  Search
} from 'lucide-react';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { getClientPdfJs } from '@/lib/pdfjsClient';

interface DiffPart {
  type: 'added' | 'removed' | 'common';
  value: string;
}

interface PageDiff {
  pageNum: number;
  hasChanges: boolean;
  addedCount: number;
  removedCount: number;
  diffs: DiffPart[];
  textA: string;
  textB: string;
}

interface ComparisonResult {
  docAName: string;
  docBName: string;
  docASize: number;
  docBSize: number;
  pagesA: number;
  pagesB: number;
  wordsA: number;
  wordsB: number;
  addedWords: number;
  removedWords: number;
  similarityScore: number;
  pageDiffs: PageDiff[];
}

export function PdfCompareEngine() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [filterChangesOnly, setFilterChangesOnly] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simple token-based Myers / LCS diff implementation
  const computeWordDiff = (text1: string, text2: string): DiffPart[] => {
    const words1 = text1.split(/(\s+)/);
    const words2 = text2.split(/(\s+)/);

    const diff: DiffPart[] = [];
    let i = 0;
    let j = 0;

    // Fast word-by-word comparison with lookahead
    while (i < words1.length || j < words2.length) {
      if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
        diff.push({ type: 'common', value: words1[i] });
        i++;
        j++;
      } else {
        // Lookahead to find next match
        let foundMatch = false;
        let lookAheadLimit = Math.min(20, Math.max(words1.length - i, words2.length - j));

        for (let k = 1; k < lookAheadLimit; k++) {
          if (i + k < words1.length && words1[i + k] === words2[j]) {
            // words in text1 were deleted
            for (let step = 0; step < k; step++) {
              diff.push({ type: 'removed', value: words1[i + step] });
            }
            i += k;
            foundMatch = true;
            break;
          }
          if (j + k < words2.length && words1[i] === words2[j + k]) {
            // words in text2 were added
            for (let step = 0; step < k; step++) {
              diff.push({ type: 'added', value: words2[j + step] });
            }
            j += k;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          if (i < words1.length) {
            diff.push({ type: 'removed', value: words1[i] });
            i++;
          }
          if (j < words2.length) {
            diff.push({ type: 'added', value: words2[j] });
            j++;
          }
        }
      }
    }

    return diff;
  };

  const comparePdfs = async () => {
    if (!fileA || !fileB) return;
    setError(null);
    setIsProcessing(true);
    setProgress(15);
    setStatusText('PDF-Vergleichs-Engine wird initialisiert...');
    trackEvent('conversion_started', { toolSlug: 'pdf-vergleichen' });

    try {
      const pdfjsLib = await getClientPdfJs();

      setProgress(25);
      setStatusText('Dokument A (Original) wird geladen...');
      const bufA = await fileA.arrayBuffer();
      const docA = await pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise;

      setProgress(40);
      setStatusText('Dokument B (Vergleich) wird geladen...');
      const bufB = await fileB.arrayBuffer();
      const docB = await pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise;

      const maxPages = Math.max(docA.numPages, docB.numPages);
      const pageDiffs: PageDiff[] = [];
      let totalWordsA = 0;
      let totalWordsB = 0;
      let totalAdded = 0;
      let totalRemoved = 0;

      for (let p = 1; p <= maxPages; p++) {
        const pct = 45 + Math.round((p / maxPages) * 45);
        setProgress(pct);
        setStatusText(`Seite ${p} von ${maxPages} wird semantisch verglichen...`);

        let textA = '';
        let textB = '';

        if (p <= docA.numPages) {
          const pageObjA = await docA.getPage(p);
          const tcA = await pageObjA.getTextContent();
          textA = tcA.items.map((it: any) => it.str || '').join(' ').trim();
        }

        if (p <= docB.numPages) {
          const pageObjB = await docB.getPage(p);
          const tcB = await pageObjB.getTextContent();
          textB = tcB.items.map((it: any) => it.str || '').join(' ').trim();
        }

        const wordsCountA = textA ? textA.split(/\s+/).filter(Boolean).length : 0;
        const wordsCountB = textB ? textB.split(/\s+/).filter(Boolean).length : 0;
        totalWordsA += wordsCountA;
        totalWordsB += wordsCountB;

        const diffs = computeWordDiff(textA, textB);
        let pageAdded = 0;
        let pageRemoved = 0;

        diffs.forEach((d) => {
          if (d.type === 'added' && d.value.trim()) pageAdded++;
          if (d.type === 'removed' && d.value.trim()) pageRemoved++;
        });

        totalAdded += pageAdded;
        totalRemoved += pageRemoved;

        pageDiffs.push({
          pageNum: p,
          hasChanges: pageAdded > 0 || pageRemoved > 0,
          addedCount: pageAdded,
          removedCount: pageRemoved,
          diffs,
          textA,
          textB,
        });
      }

      if (totalWordsA === 0 && totalWordsB === 0) {
        setError('In beiden PDF-Dokumenten wurde kein auswählbarer Text gefunden (reine Bild-Scans oder Grafiken). Bitte führen Sie vorab eine OCR-Texterkennung durch.');
        setIsProcessing(false);
        return;
      }

      // Calculate similarity score percentage
      const totalChanges = totalAdded + totalRemoved;
      const baseWordCount = Math.max(totalWordsA, totalWordsB, 1);
      const similarityScore = Math.max(0, Math.min(100, Math.round((1 - totalChanges / (baseWordCount * 1.5)) * 1000) / 10));

      setResult({
        docAName: fileA.name,
        docBName: fileB.name,
        docASize: fileA.size,
        docBSize: fileB.size,
        pagesA: docA.numPages,
        pagesB: docB.numPages,
        wordsA: totalWordsA,
        wordsB: totalWordsB,
        addedWords: totalAdded,
        removedWords: totalRemoved,
        similarityScore,
        pageDiffs,
      });

      // Select first page with changes
      const firstChangedPage = pageDiffs.find((p) => p.hasChanges)?.pageNum || 1;
      setActivePage(firstChangedPage);

      setProgress(100);
      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug: 'pdf-vergleichen', similarityScore });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert(`Fehler beim PDF-Vergleich: ${err?.message || 'Unbekannter Fehler'}`);
      trackEvent('conversion_failed', { toolSlug: 'pdf-vergleichen' });
    }
  };

  const exportReport = () => {
    if (!result) return;
    const lines = [
      '====================================================',
      '        COOLWAVE PDF-VERGLEICHSBERICHT',
      '====================================================',
      `Erstellt am: ${new Date().toLocaleString('de-DE')}`,
      '',
      `Dokument A (Original): ${result.docAName} (${formatBytes(result.docASize)})`,
      `  - Seiten: ${result.pagesA}`,
      `  - Wörter: ${result.wordsA.toLocaleString('de-DE')}`,
      '',
      `Dokument B (Vergleich): ${result.docBName} (${formatBytes(result.docBSize)})`,
      `  - Seiten: ${result.pagesB}`,
      `  - Wörter: ${result.wordsB.toLocaleString('de-DE')}`,
      '',
      '--- ZUSAMMENFASSUNG ---',
      `Übereinstimmungsgrad: ${result.similarityScore}%`,
      `Hinzugefügte Wörter (+): ${result.addedWords}`,
      `Entfernte Wörter (-): ${result.removedWords}`,
      `Seiten mit Unterschieden: ${result.pageDiffs.filter((p) => p.hasChanges).length} von ${result.pageDiffs.length}`,
      '',
      '--- SEITENWEISE DETAILS ---',
    ];

    result.pageDiffs.forEach((p) => {
      if (p.hasChanges) {
        lines.push(`\n[Seite ${p.pageNum}] +${p.addedCount} / -${p.removedCount} Wortänderungen`);
      } else {
        lines.push(`\n[Seite ${p.pageNum}] Keine Abweichungen (Identisch)`);
      }
    });

    const reportBlob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(reportBlob, `vergleichsbericht_${result.docAName.replace('.pdf', '')}_vs_${result.docBName.replace('.pdf', '')}.txt`);
  };

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  // Active page data
  const currentPageData = result?.pageDiffs.find((p) => p.pageNum === activePage);

  return (
    <div className="w-full">
      {!result ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Zwei PDF-Dokumente gegenüberstellen</h2>
            <p className="text-sm text-slate-600">
              Laden Sie das Original und die überarbeitete Fassung hoch. CoolWave analysiert Texte, Wörter und Absätze seitenweise und hebt Änderungen farblich hervor.
            </p>
          </div>

          {error && (
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            {/* Document A Upload Box */}
            <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
              fileA ? 'border-sky-500 bg-sky-50/30' : 'border-slate-300 hover:border-sky-400 bg-slate-50'
            }`}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Dokument A (Original)</h3>
                {fileA ? (
                  <div>
                    <p className="text-xs font-semibold text-sky-900 truncate max-w-[240px] mx-auto">{fileA.name}</p>
                    <p className="text-[11px] text-slate-500 mb-3">{formatBytes(fileA.size)}</p>
                    <button
                      type="button"
                      onClick={() => setFileA(null)}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Datei entfernen
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500 mb-4">Originalfassung hier ablegen</p>
                    <label className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                      <span>PDF A auswählen</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && setFileA(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Document B Upload Box */}
            <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
              fileB ? 'border-sky-500 bg-sky-50/30' : 'border-slate-300 hover:border-sky-400 bg-slate-50'
            }`}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Dokument B (Vergleich)</h3>
                {fileB ? (
                  <div>
                    <p className="text-xs font-semibold text-sky-900 truncate max-w-[240px] mx-auto">{fileB.name}</p>
                    <p className="text-[11px] text-slate-500 mb-3">{formatBytes(fileB.size)}</p>
                    <button
                      type="button"
                      onClick={() => setFileB(null)}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Datei entfernen
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500 mb-4">Neue Version hier ablegen</p>
                    <label className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                      <span>PDF B auswählen</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && setFileB(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={comparePdfs}
              disabled={!fileA || !fileB}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <GitCompare className="w-5 h-5" />
              <span>Dokumente jetzt vergleichen</span>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Summary Scorecard */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Vergleich abgeschlossen
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {result.docAName} <span className="text-slate-400 font-normal">vs.</span> {result.docBName}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Bericht (.txt) exportieren
                </button>
                <button
                  onClick={() => { setResult(null); setFileA(null); setFileB(null); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Neuer Vergleich
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Übereinstimmung</p>
                <p className="text-2xl font-black text-slate-900">{result.similarityScore}%</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium mb-1 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Hinzugefügt
                </p>
                <p className="text-2xl font-black text-emerald-700">+{result.addedWords} Wörter</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <p className="text-xs text-rose-700 font-medium mb-1 flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" /> Entfernt
                </p>
                <p className="text-2xl font-black text-rose-700">-{result.removedWords} Wörter</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Seitenanzahl</p>
                <p className="text-2xl font-black text-slate-900">
                  {result.pagesA} <span className="text-slate-400 text-base font-normal">→</span> {result.pagesB}
                </p>
              </div>
            </div>
          </div>

          {/* Page Diff Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {/* Page Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Seite wählen:</span>
                <div className="flex flex-wrap gap-1.5 max-w-md">
                  {result.pageDiffs.map((p) => {
                    if (filterChangesOnly && !p.hasChanges) return null;
                    const isActive = p.pageNum === activePage;
                    return (
                      <button
                        key={p.pageNum}
                        onClick={() => setActivePage(p.pageNum)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-sm'
                            : p.hasChanges
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        S. {p.pageNum}
                        {p.hasChanges && <span className="ml-1 text-[10px] opacity-80">({p.addedCount + p.removedCount})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterChangesOnly}
                  onChange={(e) => setFilterChangesOnly(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600"
                />
                Nur geänderte Seiten anzeigen
              </label>
            </div>

            {/* Current Page Diff Content */}
            {currentPageData && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Seite {currentPageData.pageNum}
                    {currentPageData.hasChanges ? (
                      <span className="ml-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Änderungen erkannt (+{currentPageData.addedCount} / -{currentPageData.removedCount})
                      </span>
                    ) : (
                      <span className="ml-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Inhalt identisch
                      </span>
                    )}
                  </h3>
                </div>

                {/* Visual Highlighted Diff */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 font-sans text-sm leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                  {currentPageData.diffs.map((part, i) => {
                    if (part.type === 'added') {
                      return (
                        <span key={i} className="bg-emerald-200 text-emerald-950 font-semibold px-1 py-0.5 rounded mx-0.5">
                          {part.value}
                        </span>
                      );
                    }
                    if (part.type === 'removed') {
                      return (
                        <span key={i} className="bg-rose-200 text-rose-950 line-through px-1 py-0.5 rounded mx-0.5">
                          {part.value}
                        </span>
                      );
                    }
                    return <span key={i} className="text-slate-700">{part.value}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
