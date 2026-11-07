'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Info,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Trash2,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';
import {
  checkTargetSupport,
  convertImageFile,
  TARGET_MIME,
  type ImageConvertOptions,
} from '@/lib/client/image/convert';
import { ICO_SIZES, imagesToPdf, type PdfPageSize, type TracePreset } from '@/lib/client/image/encode';
import { baseNameOf } from '@/lib/client/image/decode';
import { useConversionQueue, type QueueResult } from '@/lib/client/image/useConversionQueue';
import { FilePreview } from '@/lib/client/image/FilePreview';

export type ImageTargetFormat =
  | 'PNG'
  | 'JPG'
  | 'WebP'
  | 'GIF'
  | 'SVG'
  | 'BMP'
  | 'TIFF'
  | 'ICO'
  | 'AVIF'
  | 'PDF';

interface ImageConvertEngineProps {
  targetFormat: ImageTargetFormat;
  sourceExtensions: string[];
}

/** Images that can be combined into one PDF in a single run. */
const PDF_MAX_IMAGES = 100;

const DEFAULT_OPTIONS: ImageConvertOptions = {
  quality: 90,
  background: '#ffffff',
  icoSizes: [...ICO_SIZES],
  svgScale: 2,
  tracePreset: 'logo',
  pdfPageSize: 'image',
};

const LOCAL_NOTE = 'Die Umwandlung läuft vollständig in Ihrem Browser – Ihre Bilder werden nicht hochgeladen.';

/* ------------------------------------------------------------------ */
/* Options panel                                                       */
/* ------------------------------------------------------------------ */

interface OptionsPanelProps {
  target: ImageTargetFormat;
  svgSource: boolean;
  options: ImageConvertOptions;
  onChange: (update: Partial<ImageConvertOptions>) => void;
  disabled?: boolean;
}

function choiceClass(active: boolean) {
  return `px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
    active ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
  }`;
}

function OptionsPanel({ target, svgSource, options, onChange, disabled }: OptionsPanelProps) {
  const lossy = target === 'JPG' || target === 'WebP' || target === 'AVIF';
  const needsBackground = target === 'JPG' || target === 'BMP';
  const showSvgScale = svgSource && target !== 'SVG' && target !== 'PDF';

  const toggleIcoSize = (size: number) => {
    const has = options.icoSizes.includes(size);
    const next = has ? options.icoSizes.filter((s) => s !== size) : [...options.icoSizes, size];
    onChange({ icoSizes: next.sort((a, b) => a - b) });
  };

  const traceChoices: { value: TracePreset; label: string; hint: string }[] = [
    { value: 'logo', label: 'Logo / Grafik', hint: 'bis zu 8 Farben, glatte Flächen' },
    { value: 'detailed', label: 'Detailliert', hint: 'bis zu 32 Farben, mehr Pfade' },
    { value: 'bw', label: 'Schwarz-Weiß', hint: 'ideal für Strichzeichnungen und Signaturen' },
  ];

  const pdfChoices: { value: PdfPageSize; label: string }[] = [
    { value: 'image', label: 'Bildgröße (Originalformat)' },
    { value: 'a4', label: 'DIN A4 (automatisch hoch/quer)' },
  ];

  return (
    <div className="space-y-4">
      {lossy && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              Bildqualität / Kompression:
            </span>
            <span className="text-sky-600 font-bold">{options.quality}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            value={options.quality}
            disabled={disabled}
            aria-label="Bildqualität in Prozent"
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            className="w-full accent-sky-600 cursor-pointer disabled:opacity-50"
          />
        </div>
      )}

      {needsBackground && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">
            Hintergrundfarbe für transparente Bereiche ({target} unterstützt keine Transparenz):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={disabled} onClick={() => onChange({ background: '#ffffff' })} className={choiceClass(options.background === '#ffffff')}>
              <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
              Weiß
            </button>
            <button type="button" disabled={disabled} onClick={() => onChange({ background: '#000000' })} className={choiceClass(options.background === '#000000')}>
              <span className="w-3 h-3 rounded-full bg-black border border-slate-700" />
              Schwarz
            </button>
            <label className={choiceClass(options.background !== '#ffffff' && options.background !== '#000000')}>
              <input
                type="color"
                value={options.background}
                disabled={disabled}
                onChange={(e) => onChange({ background: e.target.value })}
                className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer"
                aria-label="Eigene Hintergrundfarbe wählen"
              />
              Eigene Farbe
            </label>
          </div>
        </div>
      )}

      {target === 'ICO' && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">Enthaltene Icon-Größen (Pixel):</span>
          <div className="flex flex-wrap gap-2">
            {ICO_SIZES.map((size) => (
              <label key={size} className={choiceClass(options.icoSizes.includes(size))}>
                <input
                  type="checkbox"
                  className="accent-sky-600"
                  checked={options.icoSizes.includes(size)}
                  disabled={disabled}
                  onChange={() => toggleIcoSize(size)}
                />
                {size}×{size}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Nicht quadratische Bilder werden mittig mit transparentem Rand eingepasst. Für Favicons genügen 16, 32 und 48 Pixel.
          </p>
        </div>
      )}

      {showSvgScale && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">Auflösung der Rastergrafik (bezogen auf die SVG-Größe):</span>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 4].map((s) => (
              <button key={s} type="button" disabled={disabled} onClick={() => onChange({ svgScale: s })} className={choiceClass(options.svgScale === s)}>
                {s}×{s === 1 ? ' (Originalgröße)' : s === 2 ? ' (Retina)' : ' (Druck)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {target === 'SVG' && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">Vektorisierungs-Modus:</span>
          <div className="flex flex-wrap gap-2">
            {traceChoices.map((c) => (
              <button key={c.value} type="button" disabled={disabled} onClick={() => onChange({ tracePreset: c.value })} className={choiceClass(options.tracePreset === c.value)} title={c.hint}>
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Das Bild wird automatisch nachgezeichnet und in echte Vektorpfade umgewandelt. Am besten funktioniert das bei Logos, Icons und
            Grafiken mit klaren Farbflächen – Fotos ergeben eine plakative, vereinfachte Darstellung. Große Bilder werden vor dem
            Nachzeichnen auf max. 1.000–1.400 Pixel verkleinert, das SVG behält die Originalabmessungen.
          </p>
        </div>
      )}

      {target === 'PDF' && (
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">Seitengröße im PDF:</span>
          <div className="flex flex-wrap gap-2">
            {pdfChoices.map((c) => (
              <button key={c.value} type="button" disabled={disabled} onClick={() => onChange({ pdfPageSize: c.value })} className={choiceClass(options.pdfPageSize === c.value)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {target === 'GIF' && (
        <p className="text-[11px] text-slate-500 flex gap-1.5 leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-600" />
          GIF speichert höchstens 256 Farben und nur volle Transparenz. Bei Fotos können daher sichtbare Farbabstufungen entstehen.
        </p>
      )}
      {target === 'TIFF' && (
        <p className="text-[11px] text-slate-500 flex gap-1.5 leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-600" />
          Das TIFF wird unkomprimiert (verlustfrei, maximal kompatibel) gespeichert und ist daher deutlich größer als das Original.
          Transparenz bleibt erhalten.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function ImageConvertEngine({ targetFormat, sourceExtensions }: ImageConvertEngineProps) {
  const limits = getBatchLimits(false);
  const svgSource = sourceExtensions.some((e) => e.toLowerCase() === '.svg');
  const isPdfTarget = targetFormat === 'PDF';

  const [options, setOptions] = useState<ImageConvertOptions>(DEFAULT_OPTIONS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  // Combined-PDF state
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStatus, setPdfStatus] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    checkTargetSupport(targetFormat).then((msg) => {
      if (active) setSupportError(msg);
    });
    return () => {
      active = false;
    };
  }, [targetFormat]);

  const converter = useCallback(
    async (file: File, onProgress: (p: number, m?: string) => void): Promise<QueueResult> => {
      try {
        const res = await convertImageFile(file, targetFormat, options, onProgress);
        trackEvent('conversion_completed', { targetFormat, mode: 'browser' });
        return res;
      } catch (err) {
        trackEvent('conversion_failed', { targetFormat, mode: 'browser', error: (err as Error)?.message });
        throw err;
      }
    },
    [targetFormat, options]
  );

  const queue = useConversionQueue(converter, limits.clientConcurrency);
  const items = queue.items;
  const single = items.length === 1 ? items[0] : null;
  const optionsLocked = queue.isProcessing || items.some((i) => i.status === 'completed');

  const updateOptions = (update: Partial<ImageConvertOptions>) => setOptions((prev) => ({ ...prev, ...update }));

  const validateOptions = (): string | null => {
    if (targetFormat === 'ICO' && options.icoSizes.length === 0) return 'Bitte mindestens eine Icon-Größe auswählen.';
    return supportError;
  };

  /* ---------------------------- file intake ---------------------------- */

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setErrorMsg(null);

    if (isPdfTarget) {
      const combined = [...pdfFiles, ...newFiles];
      if (combined.length > PDF_MAX_IMAGES) {
        setErrorMsg(`Es können maximal ${PDF_MAX_IMAGES} Bilder in ein PDF zusammengefügt werden.`);
        return;
      }
      setPdfFiles(combined);
      setPdfBlob(null);
      trackEvent('upload_completed', { targetFormat, count: newFiles.length });
      return;
    }

    const combined = [...items.map((i) => i.file), ...newFiles];
    const validation = validateBatchFiles(combined, false);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Die Auswahl überschreitet die Limits.');
      return;
    }
    queue.addFiles(newFiles);
    trackEvent(combined.length > 1 ? 'batch_upload_completed' : 'upload_completed', { targetFormat, count: newFiles.length });
  };

  const startConversion = () => {
    const problem = validateOptions();
    if (problem) {
      setErrorMsg(problem);
      return;
    }
    setErrorMsg(null);
    queue.start();
  };

  const retrySingle = (id: string) => {
    const problem = validateOptions();
    if (problem) {
      setErrorMsg(problem);
      return;
    }
    setErrorMsg(null);
    queue.retry(id);
  };

  const resetAll = () => {
    queue.clear();
    setPdfFiles([]);
    setPdfBlob(null);
    setPdfBusy(false);
    setPdfProgress(0);
    setErrorMsg(null);
  };

  /* ----------------------------- PDF mode ------------------------------ */

  const movePdfFile = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= pdfFiles.length) return;
    const next = [...pdfFiles];
    [next[index], next[target]] = [next[target], next[index]];
    setPdfFiles(next);
  };

  const createPdf = async () => {
    if (pdfFiles.length === 0) return;
    setPdfBusy(true);
    setErrorMsg(null);
    setPdfProgress(5);
    setPdfStatus('PDF wird vorbereitet...');
    try {
      const bytes = await imagesToPdf(pdfFiles, {
        pageSize: options.pdfPageSize,
        jpegQuality: 0.92,
        onProgress: (i, total) => {
          setPdfProgress(5 + Math.round((i / total) * 85));
          setPdfStatus(i < total ? `Bild ${i + 1} von ${total} wird eingebettet...` : 'PDF wird gespeichert...');
        },
      });
      const blob = new Blob([bytes as BlobPart], { type: TARGET_MIME.PDF });
      const base = baseNameOf(pdfFiles[0].name);
      setPdfName(pdfFiles.length === 1 ? `datei_tools_${base}.pdf` : `datei_tools_${base}_kombiniert.pdf`);
      setPdfProgress(100);
      setPdfBlob(blob);
      trackEvent('conversion_completed', { targetFormat, mode: 'browser', count: pdfFiles.length });
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error)?.message || 'Das PDF konnte nicht erstellt werden.');
      trackEvent('conversion_failed', { targetFormat, mode: 'browser', error: (err as Error)?.message });
    } finally {
      setPdfBusy(false);
    }
  };

  /* ------------------------------ render ------------------------------- */

  const errorBanner = (errorMsg || supportError) && (
    <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{errorMsg || supportError}</p>
    </div>
  );

  const localNote = (
    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
      <ShieldCheck className="w-3.5 h-3.5" />
      {LOCAL_NOTE}
    </p>
  );

  const uploader = (
    <FileUploader
      onFilesSelected={handleFilesSelected}
      allowMultiple={true}
      isLocal={true}
      maxFileSizeMB={limits.maxFileSizeMB}
      acceptedExtensions={sourceExtensions}
      title={isPdfTarget ? 'Bilder hier ablegen (Mehrfachauswahl möglich)' : 'Bilder hier ablegen (Einzel- oder Stapelverarbeitung)'}
      subtitle={
        isPdfTarget
          ? `Unterstützt: ${sourceExtensions.join(', ').toUpperCase()} • Bis zu ${PDF_MAX_IMAGES} Bilder pro PDF`
          : `Unterstützt: ${sourceExtensions.join(', ').toUpperCase()} • Bis zu ${limits.maxBatchFiles} Dateien gleichzeitig`
      }
    />
  );

  /* ---- PDF target ---- */
  if (isPdfTarget) {
    if (pdfBlob) {
      return (
        <DownloadBox
          filename={pdfName}
         
          resultSizeBytes={pdfBlob.size}
          onDownload={() => downloadBlob(pdfBlob, pdfName)}
          onReset={resetAll}
          downloadLabel="PDF herunterladen"
        />
      );
    }
    if (pdfBusy) return <ProcessingStatus progress={pdfProgress} statusText={pdfStatus} />;

    return (
      <div className="w-full space-y-6">
        {errorBanner}
        {pdfFiles.length === 0 ? (
          uploader
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {pdfFiles.length === 1 ? pdfFiles[0].name : `${pdfFiles.length} Bilder ausgewählt`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Größe: {formatBytes(pdfFiles.reduce((acc, f) => acc + f.size, 0))} • Zielformat:{' '}
                    <span className="font-semibold text-sky-600">PDF</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => addInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Weitere Bilder
                </button>
                <button onClick={resetAll} className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer">
                  Neu starten
                </button>
                <input
                  ref={addInputRef}
                  type="file"
                  multiple
                  accept={sourceExtensions.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    e.target.value = '';
                    const maxBytes = limits.maxFileSizeMB * 1024 * 1024;
                    const tooBig = list.find((f) => f.size > maxBytes);
                    if (tooBig) {
                      setErrorMsg(`Die Datei „${tooBig.name}“ ist größer als ${limits.maxFileSizeMB} MB.`);
                      return;
                    }
                    handleFilesSelected(list);
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Seitenreihenfolge im PDF {pdfFiles.length > 1 && '(Bilder mit den Pfeilen neu anordnen)'}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {pdfFiles.map((file, idx) => (
                  <div key={`${file.name}_${file.size}_${file.lastModified}_${idx}`} className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center">
                    <span className="absolute top-1 left-1 bg-slate-800 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                      {idx + 1}
                    </span>
                    <div className="w-full h-20 flex items-center justify-center mb-2">
                      <FilePreview file={file} alt={`Seite ${idx + 1}: ${file.name}`} className="w-full h-20 object-contain rounded" />
                    </div>
                    <span className="text-[10px] text-slate-600 truncate w-full text-center">{file.name}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <button type="button" aria-label="Nach links verschieben" onClick={() => movePdfFile(idx, -1)} disabled={idx === 0} className="p-1 rounded bg-white shadow-xs hover:bg-slate-100 disabled:opacity-30">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button type="button" aria-label="Nach rechts verschieben" onClick={() => movePdfFile(idx, 1)} disabled={idx === pdfFiles.length - 1} className="p-1 rounded bg-white shadow-xs hover:bg-slate-100 disabled:opacity-30">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button type="button" aria-label="Bild entfernen" onClick={() => setPdfFiles(pdfFiles.filter((_, i) => i !== idx))} className="p-1 rounded bg-white text-red-500 shadow-xs hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <OptionsPanel target={targetFormat} svgSource={svgSource} options={options} onChange={updateOptions} />

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {localNote}
              <button
                onClick={createPdf}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{pdfFiles.length > 1 ? 'PDF jetzt zusammenfügen' : 'PDF jetzt erstellen'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---- Single image ---- */
  if (single) {
    if (single.status === 'completed' && single.outputBlob && single.outputFileName) {
      const blob = single.outputBlob;
      const name = single.outputFileName;
      return (
        <DownloadBox
          filename={name}
         
          resultSizeBytes={blob.size}
          onDownload={() => downloadBlob(blob, name)}
          onReset={resetAll}
          downloadLabel={`Konvertiertes ${targetFormat} herunterladen`}
        />
      );
    }
    if (single.status === 'processing') {
      return <ProcessingStatus progress={single.progress} statusText={single.statusText || 'Wird verarbeitet...'} />;
    }

    return (
      <div className="w-full space-y-6">
        {errorBanner}
        {single.status === 'failed' && single.error && (
          <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Konvertierung fehlgeschlagen</p>
              <p className="text-sm">{single.error}</p>
            </div>
          </div>
        )}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{single.file.name}</h3>
                <p className="text-xs text-slate-500">
                  Größe: {formatBytes(single.file.size)} • Zielformat: <span className="font-semibold text-sky-600">{targetFormat}</span>
                </p>
              </div>
            </div>
            <button onClick={resetAll} className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer">
              Neu starten
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center min-h-32">
              <FilePreview file={single.file} alt={`Vorschau von ${single.file.name}`} />
            </div>
            <div className="md:col-span-2">
              <OptionsPanel target={targetFormat} svgSource={svgSource} options={options} onChange={updateOptions} />
              {targetFormat === 'PNG' && !svgSource && (
                <p className="text-xs text-slate-500">Keine weiteren Einstellungen nötig – {targetFormat} wird verlustfrei mit Transparenz gespeichert.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {localNote}
            <button
              onClick={() => (single.status === 'failed' ? retrySingle(single.id) : startConversion())}
              disabled={!!supportError}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{single.status === 'failed' ? 'Erneut versuchen' : 'Jetzt umwandeln'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Batch ---- */
  if (items.length > 1) {
    return (
      <div className="w-full space-y-6">
        {errorBanner}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            Einstellungen für alle Bilder
          </h3>
          <OptionsPanel target={targetFormat} svgSource={svgSource} options={options} onChange={updateOptions} disabled={optionsLocked} />
          {optionsLocked && !queue.isProcessing && (
            <p className="text-[11px] text-slate-500">Einstellungen gelten für bereits umgewandelte Bilder nicht mehr – für neue Einstellungen „Liste leeren“ und Bilder erneut hinzufügen.</p>
          )}
          {localNote}
        </div>
        <BatchProcessingQueue
          items={items}
          isProcessing={queue.isProcessing}
          onStartBatch={startConversion}
          onCancelBatch={queue.cancel}
          onClearQueue={resetAll}
          onRemoveItem={queue.remove}
          onRetryItem={queue.retry}
          onDownloadItem={queue.downloadItem}
          onDownloadAllZip={() => queue.downloadZip(`datei_tools_${targetFormat.toLowerCase()}_stapel_${Date.now()}.zip`)}
          isZipping={queue.isZipping}
          toolTitle={`Bilder nach ${targetFormat} umwandeln (Stapel)`}
        />
      </div>
    );
  }

  /* ---- Empty ---- */
  return (
    <div className="w-full space-y-6">
      {errorBanner}
      {uploader}
    </div>
  );
}
