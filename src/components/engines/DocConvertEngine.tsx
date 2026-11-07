'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import {
  AlertCircle,
  BookOpen,
  FileCode,
  FileSpreadsheet,
  FileText,
  Info,
  Presentation,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import { useClientSubscription } from '@/hooks/useClientSubscription';
import type { ConvertOptions } from '@/lib/client/docs/convert';

export type DocConvertMode =
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-excel'
  | 'excel-to-pdf'
  | 'pdf-to-ppt'
  | 'ppt-to-pdf'
  | 'doc-to-pdf'
  | 'odt-to-pdf'
  | 'rtf-to-pdf'
  | 'txt-to-pdf'
  | 'html-to-pdf'
  | 'doc-to-docx'
  | 'docx-to-doc'
  | 'odt-to-docx'
  | 'docx-to-odt'
  | 'rtf-to-docx'
  | 'txt-to-docx'
  | 'xls-to-xlsx'
  | 'xlsx-to-xls'
  | 'csv-to-xlsx'
  | 'xlsx-to-csv'
  | 'csv-to-pdf'
  | 'ppt-to-pptx'
  | 'pptx-to-ppt'
  | 'odp-to-pptx'
  | 'epub-to-pdf'
  | 'epub-to-txt';

interface DocConvertEngineProps {
  mode: DocConvertMode;
}

/** Modes that cannot be performed in the browser (shown as unavailable). */
const UNSUPPORTED_MODES: ReadonlySet<DocConvertMode> = new Set<DocConvertMode>(['pptx-to-ppt']);

const ACCEPTED: Record<DocConvertMode, string[]> = {
  'pdf-to-word': ['.pdf'],
  'pdf-to-excel': ['.pdf'],
  'pdf-to-ppt': ['.pdf'],
  'word-to-pdf': ['.docx', '.doc'],
  'docx-to-doc': ['.docx'],
  'docx-to-odt': ['.docx'],
  'doc-to-pdf': ['.doc'],
  'doc-to-docx': ['.doc'],
  'odt-to-pdf': ['.odt'],
  'odt-to-docx': ['.odt'],
  'rtf-to-pdf': ['.rtf'],
  'rtf-to-docx': ['.rtf'],
  'txt-to-pdf': ['.txt'],
  'txt-to-docx': ['.txt'],
  'html-to-pdf': ['.html', '.htm'],
  'excel-to-pdf': ['.xlsx', '.xls', '.csv', '.ods'],
  'xlsx-to-xls': ['.xlsx'],
  'xlsx-to-csv': ['.xlsx', '.xls', '.ods'],
  'xls-to-xlsx': ['.xls'],
  'csv-to-xlsx': ['.csv'],
  'csv-to-pdf': ['.csv'],
  'ppt-to-pdf': ['.pptx', '.ppt'],
  'pptx-to-ppt': ['.pptx'],
  'ppt-to-pptx': ['.ppt'],
  'odp-to-pptx': ['.odp'],
  'epub-to-pdf': ['.epub'],
  'epub-to-txt': ['.epub'],
};

const TARGET: Record<DocConvertMode, string> = {
  'pdf-to-word': 'docx',
  'doc-to-docx': 'docx',
  'odt-to-docx': 'docx',
  'rtf-to-docx': 'docx',
  'txt-to-docx': 'docx',
  'docx-to-doc': 'doc',
  'docx-to-odt': 'odt',
  'pdf-to-excel': 'xlsx',
  'xls-to-xlsx': 'xlsx',
  'csv-to-xlsx': 'xlsx',
  'xlsx-to-xls': 'xls',
  'xlsx-to-csv': 'csv',
  'pdf-to-ppt': 'pptx',
  'ppt-to-pptx': 'pptx',
  'odp-to-pptx': 'pptx',
  'pptx-to-ppt': 'ppt',
  'epub-to-txt': 'txt',
  'word-to-pdf': 'pdf',
  'excel-to-pdf': 'pdf',
  'ppt-to-pdf': 'pdf',
  'doc-to-pdf': 'pdf',
  'odt-to-pdf': 'pdf',
  'rtf-to-pdf': 'pdf',
  'txt-to-pdf': 'pdf',
  'html-to-pdf': 'pdf',
  'csv-to-pdf': 'pdf',
  'epub-to-pdf': 'pdf',
};

const LABEL: Record<DocConvertMode, string> = {
  'pdf-to-word': 'In Word umwandeln (DOCX)',
  'word-to-pdf': 'In PDF umwandeln',
  'pdf-to-excel': 'In Excel umwandeln (XLSX)',
  'excel-to-pdf': 'In PDF umwandeln',
  'pdf-to-ppt': 'In PowerPoint umwandeln (PPTX)',
  'ppt-to-pdf': 'In PDF umwandeln',
  'doc-to-pdf': 'Klassisches DOC in PDF umwandeln',
  'odt-to-pdf': 'OpenDocument in PDF umwandeln',
  'rtf-to-pdf': 'Rich-Text in PDF umwandeln',
  'txt-to-pdf': 'Textdatei in PDF layouten',
  'html-to-pdf': 'HTML-Datei in PDF umwandeln',
  'doc-to-docx': 'Altes DOC in modernes DOCX umwandeln',
  'docx-to-doc': 'DOCX in abwärtskompatibles DOC umwandeln',
  'odt-to-docx': 'OpenDocument (ODT) in Word (DOCX) umwandeln',
  'docx-to-odt': 'Word (DOCX) in OpenDocument (ODT) umwandeln',
  'rtf-to-docx': 'Rich Text (RTF) in Word (DOCX) umwandeln',
  'txt-to-docx': 'Textdatei (TXT) in Word (DOCX) umwandeln',
  'xls-to-xlsx': 'Altes XLS in modernes XLSX umwandeln',
  'xlsx-to-xls': 'XLSX in abwärtskompatibles XLS umwandeln',
  'csv-to-xlsx': 'CSV-Tabelle in Excel (XLSX) umwandeln',
  'xlsx-to-csv': 'Excel-Tabelle in CSV exportieren',
  'csv-to-pdf': 'CSV-Tabelle in PDF umwandeln',
  'ppt-to-pptx': 'Altes PPT in modernes PPTX umwandeln',
  'pptx-to-ppt': 'PowerPoint (PPTX) als PPT speichern',
  'odp-to-pptx': 'OpenDocument (ODP) in PowerPoint (PPTX) umwandeln',
  'epub-to-pdf': 'EPUB-E-Book in PDF umwandeln',
  'epub-to-txt': 'EPUB-E-Book in reinen Text umwandeln',
};

/** Short, honest fidelity hint per mode (shown before conversion). */
const HINT: Record<DocConvertMode, string> = {
  'pdf-to-word':
    'Text, Absätze, Überschriften, Listen und Fett/Kursiv werden aus der PDF rekonstruiert. Bilder, Spaltensatz und exakte Positionen werden nicht übernommen; gescannte Seiten werden als Bild eingefügt (keine Texterkennung).',
  'word-to-pdf':
    'Überschriften, Absätze, Listen, Tabellen, Bilder und Seitenumbrüche werden übernommen. Schriftarten, Kopf-/Fußzeilen, Textfelder und exakte Abstände können vom Original abweichen. Bei DOC-Dateien werden keine Bilder übernommen.',
  'pdf-to-excel':
    'Zeilen und Spalten werden anhand der Textpositionen erkannt – jede PDF-Seite wird ein Tabellenblatt. Funktioniert am besten bei klar ausgerichteten Tabellen; gescannte PDFs enthalten keinen auslesbaren Text.',
  'excel-to-pdf':
    'Alle sichtbaren Tabellenblätter werden als Tabellen gesetzt (breite Tabellen im Querformat, ggf. auf mehrere Seiten verteilt). Zellfarben, Schriftarten, Diagramme und Druckbereiche werden nicht übernommen.',
  'pdf-to-ppt':
    'Jede PDF-Seite wird als Bild auf eine eigene Folie gesetzt. Die Folien sehen aus wie das Original, der Text ist jedoch nicht bearbeitbar.',
  'ppt-to-pdf':
    'Texte, Aufzählungen, Bilder, Tabellen und einfache Formen werden an ihrer Position gezeichnet. Diagramme, SmartArt, Effekte, Animationen und eingebettete Schriften werden nicht dargestellt; bei alten PPT-Dateien fehlen außerdem Folienmaster und Hintergründe.',
  'doc-to-pdf':
    'Text, Überschriften, Listen, Tabellen und Grundformatierung des Word-97–2003-Dokuments werden übernommen. Bilder, Textfelder, Kopf-/Fußzeilen und Fußnoten aus DOC-Dateien werden nicht übernommen.',
  'odt-to-pdf':
    'Überschriften, Absätze, Listen, Tabellen und Bilder werden übernommen. Schriftarten, Kopf-/Fußzeilen und exakte Abstände können abweichen.',
  'rtf-to-pdf':
    'Text, Fett/Kursiv/Unterstrichen, Schriftgrößen, Ausrichtung, Tabellen und PNG/JPEG-Bilder werden übernommen. Schriftarten und komplexe Layouts können abweichen.',
  'txt-to-pdf':
    'Der Text wird zeilengetreu auf A4-Seiten gesetzt (Umlaute bleiben erhalten). Zeichen außerhalb des westeuropäischen Zeichensatzes werden ersetzt.',
  'html-to-pdf':
    'Inhalt, Überschriften, Listen, Tabellen und eingebettete Bilder werden übernommen. CSS-Layout, Farben, Schriftarten, Skripte und externe Bilder werden nicht dargestellt.',
  'doc-to-docx':
    'Text, Überschriften, Listen, Tabellen und Grundformatierung werden in ein modernes DOCX übertragen. Bilder, Textfelder, Kopf-/Fußzeilen und Fußnoten werden nicht übernommen.',
  'docx-to-doc':
    'Die Datei wird im Rich-Text-Format (RTF) mit der Endung .doc gespeichert – Word und LibreOffice öffnen sie wie ein Word-97–2003-Dokument. Überschriften, Listen, Tabellen und Bilder bleiben erhalten; Kopf-/Fußzeilen und spezielle Formatierungen nicht.',
  'odt-to-docx':
    'Überschriften, Absätze, Listen, Tabellen, Bilder und Grundformatierung werden übernommen. Kopf-/Fußzeilen, Textrahmen-Positionen und Formatvorlagen können abweichen.',
  'docx-to-odt':
    'Überschriften, Absätze, Listen, Tabellen, Bilder und Grundformatierung werden übernommen. Kopf-/Fußzeilen, Kommentare und Formatvorlagen können abweichen.',
  'rtf-to-docx':
    'Text, Fett/Kursiv/Unterstrichen, Schriftgrößen, Ausrichtung, Tabellen und PNG/JPEG-Bilder werden übernommen.',
  'txt-to-docx': 'Jede Zeile der Textdatei wird als Absatz in ein Word-Dokument übernommen.',
  'xls-to-xlsx':
    'Werte, Formeln, Zahlenformate, verbundene Zellen und Spaltenbreiten werden übernommen. Zellfarben, Diagramme, Bilder und Makros können verloren gehen.',
  'xlsx-to-xls':
    'Werte, Zahlenformate und verbundene Zellen werden im XLS-Format (Excel 97–2003) gespeichert. Formeln werden als berechnete Werte gespeichert; Formatierungen, Diagramme und Bilder gehen verloren. Maximal 65.536 Zeilen und 256 Spalten.',
  'csv-to-xlsx':
    'Trennzeichen und Zeichenkodierung werden automatisch erkannt. Führende Nullen (z. B. Postleitzahlen) bleiben als Text erhalten, Zahlen werden als Zahlen gespeichert.',
  'xlsx-to-csv':
    'Exportiert werden die angezeigten Werte. Enthält die Arbeitsmappe mehrere Tabellenblätter, erhalten Sie ein ZIP mit einer CSV-Datei pro Blatt.',
  'csv-to-pdf':
    'Die CSV-Datei wird als Tabelle gesetzt (breite Tabellen im Querformat, ggf. auf mehrere Seiten verteilt). Trennzeichen und Kodierung werden automatisch erkannt.',
  'ppt-to-pptx':
    'Folientexte (mit Aufzählungen und Grundformatierung), Positionen und Bilder (PNG/JPEG/BMP) werden übernommen. Folienmaster, Hintergründe, Diagramme, Vektorgrafiken (EMF/WMF), Animationen und Notizen gehen verloren.',
  'pptx-to-ppt': '',
  'odp-to-pptx':
    'Texte, Aufzählungen, Bilder, Tabellen und einfache Formen werden an ihrer Position übernommen. Diagramme, Effekte, Animationen und Notizen gehen verloren.',
  'epub-to-pdf':
    'Kapitel, Überschriften, Absätze, Listen, Tabellen und Bilder werden in ein druckbares A4-PDF gesetzt. Das CSS-Layout des E-Books wird nicht übernommen. DRM-geschützte E-Books können nicht umgewandelt werden.',
  'epub-to-txt':
    'Der Text aller Kapitel wird als UTF-8-Textdatei ausgegeben (Absätze, Überschriften und Aufzählungen bleiben lesbar). DRM-geschützte E-Books können nicht umgewandelt werden.',
};

function ModeIcon({ mode }: { mode: DocConvertMode }) {
  if (mode.includes('excel') || mode.includes('csv') || mode.includes('xls')) return <FileSpreadsheet className="w-5 h-5" />;
  if (mode.includes('ppt') || mode.includes('odp')) return <Presentation className="w-5 h-5" />;
  if (mode.includes('epub')) return <BookOpen className="w-5 h-5" />;
  if (mode.includes('html') || mode.includes('txt')) return <FileCode className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

const selectClass = 'min-h-11 w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 text-sm';

export function DocConvertEngine({ mode }: DocConvertEngineProps) {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [autoDownload, setAutoDownload] = useState(true);

  // Mode-specific options
  const [pdfWordLayout, setPdfWordLayout] = useState<'text' | 'image'>('text');
  const [csvDelimiter, setCsvDelimiter] = useState<';' | ',' | '\t'>(';');
  const [csvBom, setCsvBom] = useState(true);
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [txtFont, setTxtFont] = useState<'sans' | 'mono'>('sans');

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = useClientSubscription().isPro;
  const limits = getBatchLimits(isPro);
  const accepted = ACCEPTED[mode];
  const targetExt = TARGET[mode];
  const unsupported = UNSUPPORTED_MODES.has(mode);

  const options: ConvertOptions = { pdfWordLayout, csvDelimiter, csvBom, orientation, txtFont };

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      setSingleFile(files[0]);
      setIsBatchMode(false);
      setError(null);
      setWarnings([]);
      setResultBlob(null);
      trackEvent('upload_completed', { mode, size: files[0].size });
    } else {
      const validation = validateBatchFiles(files, isPro);
      if (!validation.valid) {
        setError(validation.error ?? 'Die Dateiauswahl ist ungültig.');
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      setError(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `doc_batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { mode, count: files.length });
    }
  };

  /** Converts one file completely in the browser. */
  const convertSingleDoc = async (
    file: File,
    onProgress?: (pct: number, statusText?: string) => void,
    signal?: AbortSignal
  ): Promise<{ blob: Blob; fileName: string; size: number; warnings: string[] }> => {
    onProgress?.(3, 'Konverter wird geladen…');
    const { convertDocument } = await import('@/lib/client/docs/convert');
    const result = await convertDocument(mode, file, options, { onProgress, signal });
    return { blob: result.blob, fileName: result.fileName, size: result.blob.size, warnings: result.warnings };
  };

  const describeError = (err: unknown): string => {
    if (err instanceof Error && err.name === 'ConversionError') return err.message;
    if (err instanceof Error && /abgebrochen/i.test(err.message)) return err.message;
    console.error('[DocConvert]', err);
    return 'Die Datei konnte nicht umgewandelt werden. Bitte prüfen Sie, ob sie beschädigt oder passwortgeschützt ist.';
  };

  // Single file execute
  const executeSingleConversion = async () => {
    if (!singleFile) return;
    setError(null);
    setWarnings([]);
    setIsProcessing(true);
    setProgress(3);
    setStatusText('Konverter wird geladen…');
    trackEvent('conversion_started', { mode });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await convertSingleDoc(
        singleFile,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusText(msg);
        },
        controller.signal
      );
      if (controller.signal.aborted) return;

      setResultBlob(result.blob);
      setOutputFilename(result.fileName);
      setWarnings(result.warnings);
      setProgress(100);
      setIsProcessing(false);
      if (autoDownload) {
        downloadBlob(result.blob, result.fileName);
      }
      trackEvent('conversion_completed', { mode, size: result.size });
    } catch (err: unknown) {
      setIsProcessing(false);
      if (controller.signal.aborted) return;
      const message = describeError(err);
      setError(message);
      trackEvent('conversion_failed', { mode, error: message });
    }
  };

  // Batch execute
  const startBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const tasks = batchItems.map((item) => ({
      id: item.id,
      run: async (signal?: AbortSignal) => {
        if (signal?.aborted) throw new Error('Abgebrochen');
        try {
          return await convertSingleDoc(
            item.file,
            (pct, text) => {
              setBatchItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, progress: pct, statusText: text } : i))
              );
            },
            signal
          );
        } catch (err) {
          throw new Error(describeError(err));
        }
      },
    }));

    await runConcurrentBatch(tasks, {
      // Conversions are CPU/memory bound in the browser – keep concurrency low
      concurrency: Math.min(2, limits.clientConcurrency),
      signal: abortControllerRef.current.signal,
      onItemStart: (id) => {
        setBatchItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 10 } : i))
        );
      },
      onItemComplete: (id, result) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  outputBlob: result.blob,
                  outputFileName: result.fileName,
                  outputSize: result.size,
                }
              : i
          )
        );
      },
      onItemError: (id, err) => {
        setBatchItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: 'failed', error: err.message, progress: 0 } : i
          )
        );
      },
    });

    setIsProcessing(false);
  };

  const cancelBatch = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setBatchItems((prev) =>
      prev.map((i) => (i.status === 'processing' || i.status === 'queued' ? { ...i, status: 'cancelled' } : i))
    );
  };

  const clearQueue = () => {
    setBatchItems([]);
    setIsBatchMode(false);
  };

  const removeItem = (id: string) => {
    setBatchItems((prev) => prev.filter((i) => i.id !== id));
  };

  const downloadItem = (item: BatchItem) => {
    if (item.outputBlob && item.outputFileName) {
      downloadBlob(item.outputBlob, item.outputFileName);
    }
  };

  const downloadAllZip = async () => {
    const completedItems = batchItems.filter((i) => i.status === 'completed' && i.outputBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      completedItems.forEach((item) => {
        if (item.outputBlob && item.outputFileName) {
          let name = item.outputFileName;
          let n = 2;
          while (used.has(name)) {
            const dot = item.outputFileName.lastIndexOf('.');
            name = `${item.outputFileName.substring(0, dot)}_${n++}${item.outputFileName.substring(dot)}`;
          }
          used.add(name);
          zip.file(name, item.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `datei_tools_dokumente_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      setError('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setSingleFile(null);
    setResultBlob(null);
    setError(null);
    setWarnings([]);
    setIsProcessing(false);
    setProgress(0);
  };

  const warningBox = warnings.length > 0 && (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
      <Info className="w-5 h-5 shrink-0 mt-0.5" />
      <ul className="text-sm leading-relaxed space-y-1">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );

  if (unsupported) {
    return (
      <div className="w-full space-y-6">
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">Diese Umwandlung ist im Browser nicht verfügbar.</p>
            <p className="mt-1">
              Das alte binäre PowerPoint-Format (.ppt, Office 97–2003) kann nicht direkt im Browser erzeugt werden.
              PowerPoint und LibreOffice öffnen PPTX-Dateien direkt. Für maximale Kompatibilität empfehlen wir PDF:{' '}
              <Link href="/de/powerpoint-in-pdf-umwandeln" className="font-medium underline hover:text-amber-950">
                PowerPoint in PDF umwandeln →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (resultBlob && singleFile) {
    return (
      <div className="space-y-4">
        <DownloadBox
          filename={outputFilename}
          resultSizeBytes={resultBlob.size}
          onDownload={() => downloadBlob(resultBlob, outputFilename)}
          onReset={handleResetSingle}
          downloadLabel="Konvertiertes Dokument herunterladen"
        />
        {warningBox}
        {mode === 'pdf-to-word' && (
          <button
            type="button"
            onClick={() => {
              setResultBlob(null);
              setWarnings([]);
              setProgress(0);
            }}
            className="mx-auto block rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            Mit derselben PDF eine andere Word-Ausgabe erstellen
          </button>
        )}
      </div>
    );
  }

  if (isProcessing && !isBatchMode) {
    return (
      <ProcessingStatus
        progress={progress}
        statusText={statusText}
        isLargeFile={Boolean(singleFile && singleFile.size > 15 * 1024 * 1024)}
        isBackgroundSafe={false}
        autoDownload={autoDownload}
        onAutoDownloadChange={setAutoDownload}
        onCancel={() => {
          abortControllerRef.current?.abort();
          setIsProcessing(false);
        }}
      />
    );
  }

  const optionsPanel = (() => {
    switch (mode) {
      case 'pdf-to-word':
        return (
          <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
            <label htmlFor="pdf-word-layout" className="mb-2 block font-semibold">Word-Ausgabe</label>
            <select id="pdf-word-layout" value={pdfWordLayout} onChange={(e) => setPdfWordLayout(e.target.value as 'text' | 'image')} className={selectClass}>
              <option value="text">Bearbeitbarer Text (Absätze werden rekonstruiert)</option>
              <option value="image">Originalansicht (jede Seite als Bild, nicht bearbeitbar)</option>
            </select>
            <p className="mt-2">
              {pdfWordLayout === 'text'
                ? 'Text, Überschriften und Listen sind in Word bearbeitbar. Prüfen Sie Spalten, Tabellen und Zahlen am Original.'
                : 'Jede Seite sieht im Word-Dokument wie das Original aus, ist aber nicht bearbeitbar.'}
            </p>
          </div>
        );
      case 'xlsx-to-csv':
        return (
          <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-slate-700 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="csv-delimiter" className="mb-2 block font-semibold">Trennzeichen</label>
              <select id="csv-delimiter" value={csvDelimiter} onChange={(e) => setCsvDelimiter(e.target.value as ';' | ',' | '\t')} className={selectClass}>
                <option value=";">Semikolon ; (deutsches Excel, Dezimalkomma)</option>
                <option value=",">Komma , (international, Dezimalpunkt)</option>
                <option value={'\t'}>Tabulator (TSV)</option>
              </select>
            </div>
            <label className="flex items-start gap-2 sm:mt-7">
              <input type="checkbox" checked={csvBom} onChange={(e) => setCsvBom(e.target.checked)} className="mt-1 h-4 w-4" />
              <span>UTF-8 mit BOM speichern (Umlaute werden in Excel korrekt angezeigt)</span>
            </label>
          </div>
        );
      case 'excel-to-pdf':
      case 'csv-to-pdf':
        return (
          <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
            <label htmlFor="pdf-orientation" className="mb-2 block font-semibold">Seitenausrichtung</label>
            <select id="pdf-orientation" value={orientation} onChange={(e) => setOrientation(e.target.value as 'auto' | 'portrait' | 'landscape')} className={selectClass}>
              <option value="auto">Automatisch (Querformat bei breiten Tabellen)</option>
              <option value="portrait">Hochformat</option>
              <option value="landscape">Querformat</option>
            </select>
          </div>
        );
      case 'txt-to-pdf':
        return (
          <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
            <label htmlFor="txt-font" className="mb-2 block font-semibold">Schrift</label>
            <select id="txt-font" value={txtFont} onChange={(e) => setTxtFont(e.target.value as 'sans' | 'mono')} className={selectClass}>
              <option value="sans">Proportional (Fließtext)</option>
              <option value="mono">Festbreite (Code, Tabellen aus Leerzeichen)</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  })();

  const hint = HINT[mode] ? (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3">
      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold text-slate-900">100 % lokal im Browser – Ihre Datei wird nicht hochgeladen.</p>
        <p className="mt-1">{HINT[mode]}</p>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full space-y-6">
      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isBatchMode && batchItems.length > 0 ? (
        <>
          {optionsPanel && <div className="bg-white rounded-2xl border border-slate-200 px-6 pb-5 shadow-sm">{optionsPanel}</div>}
          <BatchProcessingQueue
            items={batchItems}
            isProcessing={isProcessing}
            onStartBatch={startBatch}
            onCancelBatch={cancelBatch}
            onClearQueue={clearQueue}
            onRemoveItem={removeItem}
            onDownloadItem={downloadItem}
            onDownloadAllZip={downloadAllZip}
            isZipping={isZipping}
            toolTitle={`Dokumente umwandeln (Stapel · ${LABEL[mode]})`}
          />
        </>
      ) : !singleFile ? (
        <>
          <FileUploader
            acceptedExtensions={accepted}
            maxFileSizeMB={limits.maxFileSizeMB}
            allowMultiple={true}
            onFilesSelected={handleFilesSelected}
            title="Dokumente hier ablegen (Einzel- oder Stapelverarbeitung)"
            subtitle={`Unterstützt: ${accepted.join(', ').toUpperCase()} • Bis zu ${limits.maxBatchFiles} Dateien gleichzeitig (${isPro ? 'Pro' : 'Kostenlos'})`}
            isLocal={true}
          />
          {hint}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <ModeIcon mode={mode} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 break-all">{singleFile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span> • Zielformat:{' '}
                <span className="font-bold text-sky-700 uppercase">.{targetExt}</span>
              </p>
            </div>
          </div>

          {optionsPanel}
          {hint && <div className="mt-5">{hint}</div>}

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={handleResetSingle} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Anderes Dokument wählen
            </button>

            <button
              onClick={executeSingleConversion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{LABEL[mode]}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
