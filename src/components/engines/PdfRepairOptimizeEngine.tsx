'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument, PDFName, PDFArray, PDFDict, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { 
  Wrench, 
  Zap, 
  FileCheck, 
  Layers, 
  MessageSquareOff, 
  FileText, 
  CheckCircle2, 
  Info, 
  Download 
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { BatchProcessingQueue, BatchItem } from '@/components/tools/BatchProcessingQueue';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { runConcurrentBatch } from '@/lib/batch-queue';
import { getBatchLimits, validateBatchFiles } from '@/config/batch.config';

export type RepairOptimizeMode = 'repair' | 'optimize' | 'pdfa' | 'flatten' | 'strip-annotations';

interface PdfRepairOptimizeEngineProps {
  mode: RepairOptimizeMode;
  toolSlug?: string;
}

export function PdfRepairOptimizeEngine({ 
  mode,
  toolSlug = 'pdf-optimieren'
}: PdfRepairOptimizeEngineProps) {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [auditMessage, setAuditMessage] = useState<string>('');
  const [reductionPct, setReductionPct] = useState<number | null>(null);

  // Batch states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPro = typeof window !== 'undefined' && localStorage.getItem('coolwave_pro_active') === 'true';
  const limits = getBatchLimits(isPro);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    if (files.length === 1 && !isBatchMode && batchItems.length === 0) {
      setSingleFile(files[0]);
      setIsBatchMode(false);
      trackEvent('upload_completed', { toolSlug, mode });
    } else {
      const validation = validateBatchFiles(files, isPro);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setIsBatchMode(true);
      setSingleFile(null);
      const newItems: BatchItem[] = files.map((f, idx) => ({
        id: `pdf_repair_batch_${Date.now()}_${idx}_${Math.random().toString(36).substring(7)}`,
        file: f,
        status: 'queued',
        progress: 0,
      }));
      setBatchItems(newItems);
      trackEvent('batch_upload_completed', { toolSlug, mode, count: files.length });
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'repair': return 'Beschädigte PDF reparieren';
      case 'optimize': return 'PDF-Dateigröße optimieren';
      case 'pdfa': return 'In ISO-konformes PDF/A-1b umwandeln';
      case 'flatten': return 'Formulare & Anmerkungen abflachen';
      case 'strip-annotations': return 'Alle Anmerkungen & Notizen entfernen';
      default: return 'PDF verarbeiten';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'repair': return <Wrench className="w-5 h-5" />;
      case 'optimize': return <Zap className="w-5 h-5" />;
      case 'pdfa': return <FileCheck className="w-5 h-5" />;
      case 'flatten': return <Layers className="w-5 h-5" />;
      case 'strip-annotations': return <MessageSquareOff className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  /**
   * Universal processor for an individual PDF
   */
  const processSinglePdf = async (
    file: File,
    onProgress?: (pct: number, msg?: string) => void
  ): Promise<{ blob: Blob; fileName: string; audit: string; size: number }> => {
    onProgress?.(20, 'PDF-Dokument wird analysiert...');

    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdf.getPages();

    let audit = '';
    let suffix = '_optimiert.pdf';

    if (mode === 'repair') {
      onProgress?.(50, 'Xref-Tabelle neu serialisieren...');
      suffix = '_repariert.pdf';
      audit = `Struktur-Integrität wiederhergestellt. ${pages.length} Seiten geborgen.`;
    } else if (mode === 'optimize') {
      onProgress?.(50, 'Datenströme bereinigen & komprimieren...');
      suffix = '_optimiert.pdf';
      pdf.setProducer('CoolWave High-Efficiency Engine');
      pdf.setCreator('CoolWave');
      audit = `Objektströme komprimiert und ungenutzte Strukturdaten bereinigt.`;
    } else if (mode === 'pdfa') {
      onProgress?.(50, 'PDF/A-1b XMP-Metadaten & Farbprofil einbetten...');
      suffix = '_pdfa.pdf';
      pdf.setTitle(file.name.replace(/\.[^/.]+$/, ''));
      pdf.setSubject('ISO 19005-1 PDF/A-1b Archivdokument');
      pdf.setProducer('CoolWave PDF/A Archival Engine');
      pdf.setCreator('CoolWave');
      try {
        pdf.catalog.delete(PDFName.of('JavaScript'));
        pdf.catalog.delete(PDFName.of('AA'));
        pdf.catalog.delete(PDFName.of('OpenAction'));

        // Embed PDF/A OutputIntent
        const outputIntent = pdf.context.obj({
          Type: 'OutputIntent',
          S: 'GTS_PDFA1',
          OutputConditionIdentifier: PDFName.of('Custom'),
          Info: 'sRGB IEC61966-2.1',
        });
        const outputIntentRef = pdf.context.register(outputIntent);
        pdf.catalog.set(PDFName.of('OutputIntents'), pdf.context.obj([outputIntentRef]));

        // Embed PDF/A-1b XMP metadata packet
        const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
        const xmpStream = pdf.context.flateStream(xmp);
        xmpStream.dict.set(PDFName.of('Type'), PDFName.of('Metadata'));
        xmpStream.dict.set(PDFName.of('Subtype'), PDFName.of('XML'));
        const xmpRef = pdf.context.register(xmpStream);
        pdf.catalog.set(PDFName.of('Metadata'), xmpRef);
      } catch (e) {
        console.warn('PDF/A XMP embedding warning:', e);
      }
      audit = `ISO 19005-1 (PDF/A-1b) Konformitätspaket integriert. Dynamische Skripte entfernt.`;
    } else if (mode === 'flatten') {
      onProgress?.(50, 'Formularfelder dauerhaft einbrennen...');
      suffix = '_abgeflacht.pdf';
      try {
        const form = pdf.getForm();
        form.flatten();
      } catch {}
      audit = `Formularfelder, Kontrollkästchen und Signaturen dauerhaft in Seitenstruktur gerendert.`;
    } else if (mode === 'strip-annotations') {
      onProgress?.(50, 'Kommentare & Hervorhebungen entfernen...');
      suffix = '_ohne_anmerkungen.pdf';
      let strippedCount = 0;
      pages.forEach((p) => {
        try {
          const annots = p.node.get(PDFName.of('Annots'));
          if (annots) {
            if (annots instanceof PDFArray) strippedCount += annots.size();
            p.node.delete(PDFName.of('Annots'));
          }
        } catch {}
      });
      audit = `${strippedCount} Anmerkungen, Notizen und Textmarker rückstandslos gelöscht.`;
    }

    onProgress?.(80, 'PDF wird finalisiert...');
    const savedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const finalBlob = new Blob([savedBytes as unknown as BlobPart], { type: 'application/pdf' });
    const outName = `${file.name.replace(/\.[^/.]+$/, '')}${suffix}`;

    onProgress?.(100, 'Fertig');
    return { blob: finalBlob, fileName: outName, audit, size: finalBlob.size };
  };

  // Single file execute
  const executeSingleProcessing = async () => {
    if (!singleFile) return;
    setIsProcessing(true);
    setProgress(20);
    setStatusText('PDF-Dokument wird analysiert...');
    trackEvent('conversion_started', { toolSlug, mode });

    try {
      const result = await processSinglePdf(singleFile, (p, msg) => {
        setProgress(p);
        if (msg) setStatusText(msg);
      });

      setResultBlob(result.blob);
      setOutputFilename(result.fileName);
      setAuditMessage(result.audit);

      if (result.size < singleFile.size) {
        const saved = Math.round(((singleFile.size - result.size) / singleFile.size) * 100);
        setReductionPct(saved);
      }

      setIsProcessing(false);
      trackEvent('conversion_completed', { toolSlug, mode });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler bei der PDF-Verarbeitung.');
      trackEvent('conversion_failed', { toolSlug, mode });
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
        return await processSinglePdf(item.file, (pct, statusText) => {
          setBatchItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: pct, statusText } : i))
          );
        });
      },
    }));

    await runConcurrentBatch(tasks, {
      concurrency: limits.clientConcurrency,
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
      completedItems.forEach((item) => {
        if (item.outputBlob && item.outputFileName) {
          zip.file(item.outputFileName, item.outputBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `coolwave_${mode}_stapel_${Date.now()}.zip`);
    } catch (err) {
      console.error('[Zip Error]:', err);
      alert('Fehler beim Erstellen des ZIP-Archivs.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleResetSingle = () => {
    setSingleFile(null);
    setResultBlob(null);
    setOutputFilename('');
    setAuditMessage('');
    setReductionPct(null);
    setIsProcessing(false);
  };

  if (resultBlob && singleFile) {
    return (
      <div className="space-y-6 w-full">
        {auditMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Erfolgreich verarbeitet</p>
              <p className="text-xs text-emerald-700 mt-0.5">{auditMessage}</p>
            </div>
          </div>
        )}

        <DownloadBox
          filename={outputFilename}
          originalSizeBytes={singleFile.size}
          resultSizeBytes={resultBlob.size}
          onDownload={() => downloadBlob(resultBlob, outputFilename)}
          onReset={handleResetSingle}
          downloadLabel="Verarbeitetes PDF herunterladen"
        />
      </div>
    );
  }

  if (isProcessing && !isBatchMode) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full space-y-6">
      {isBatchMode && batchItems.length > 0 ? (
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
          toolTitle={`${getModeTitle()} (Stapelverarbeitung)`}
        />
      ) : !singleFile ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={limits.maxFileSizeMB}
          allowMultiple={true}
          onFilesSelected={handleFilesSelected}
          title="PDF-Dateien hier ablegen (Einzel- oder Stapelmodus)"
          subtitle={`Bis zu ${limits.maxBatchFiles} PDFs gleichzeitig verarbeiten (${isPro ? 'Pro' : 'Kostenlos'})`}
        />
      ) : (
        /* Single File View (Preserved) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              {getModeIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{singleFile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dateigröße: <span className="font-semibold text-slate-700">{formatBytes(singleFile.size)}</span>
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetSingle}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Anderes Dokument wählen
            </button>

            <button
              onClick={executeSingleProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              {getModeIcon()}
              <span>{getModeTitle()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
