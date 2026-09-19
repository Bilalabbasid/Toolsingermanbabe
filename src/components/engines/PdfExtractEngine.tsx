'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw 
} from 'lucide-react';
import JSZip from 'jszip';
import { PDFDocument, PDFName, PDFDict, PDFStream } from 'pdf-lib';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { getClientPdfJs } from '@/lib/pdfjsClient';

export type ExtractMode = 'images' | 'text' | 'attachments';

interface ExtractedImage {
  id: string;
  name: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
}

interface ExtractedAttachment {
  name: string;
  size: number;
  data: Uint8Array;
}

interface PdfExtractEngineProps {
  mode: ExtractMode;
  toolSlug?: string;
}

export function PdfExtractEngine({ 
  mode,
  toolSlug = 'pdf-bilder-extrahieren'
}: PdfExtractEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Results state
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageTexts, setPageTexts] = useState<Array<{ page: number; text: string }>>([]);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [extractedAttachments, setExtractedAttachments] = useState<ExtractedAttachment[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | number>('all');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setHasExtracted(false);
      setExtractedText('');
      setPageTexts([]);
      setExtractedImages([]);
      setExtractedAttachments([]);
      trackEvent('upload_completed', { toolSlug, mode });
    }
  };

  const executeExtraction = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusText('PDF-Dokument wird analysiert...');
    trackEvent('conversion_started', { toolSlug, mode });

    try {
      const arrayBuffer = await file.arrayBuffer();

      if (mode === 'text') {
        const pdfjsLib = await getClientPdfJs();
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const totalPages = doc.numPages;
        const pages: Array<{ page: number; text: string }> = [];
        let fullText = '';

        for (let p = 1; p <= totalPages; p++) {
          setProgress(20 + Math.round((p / totalPages) * 70));
          setStatusText(`Text aus Seite ${p} von ${totalPages} wird extrahiert...`);

          const pageObj = await doc.getPage(p);
          const tc = await pageObj.getTextContent();
          const pageStr = tc.items.map((it: any) => it.str || '').join(' ').replace(/\s+/g, ' ').trim();

          pages.push({ page: p, text: pageStr });
          fullText += `--- Seite ${p} ---\n${pageStr}\n\n`;
        }

        setPageTexts(pages);
        setExtractedText(fullText.trim());
      } else if (mode === 'images') {
        const pdfjsLib = await getClientPdfJs();
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const totalPages = doc.numPages;
        const images: ExtractedImage[] = [];

        // Extract images page-by-page
        for (let p = 1; p <= totalPages; p++) {
          setProgress(15 + Math.round((p / totalPages) * 75));
          setStatusText(`Bilder aus Seite ${p} von ${totalPages} werden lokalisiert...`);

          const page = await doc.getPage(p);
          const ops = await page.getOperatorList();

          for (let i = 0; i < ops.fnArray.length; i++) {
            // Check for paintImageXObject operator
            if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
              const imgObjId = ops.argsArray[i][0];
              try {
                const imgObj: any = await new Promise((resolve) => {
                  page.objs.get(imgObjId, (obj: any) => resolve(obj));
                });

                if (imgObj && imgObj.data) {
                  const w = imgObj.width;
                  const h = imgObj.height;
                  if (w > 10 && h > 10) {
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      const imgData = ctx.createImageData(w, h);
                      const srcData = imgObj.data;
                      if (srcData.length === w * h * 4) {
                        imgData.data.set(srcData);
                      } else if (srcData.length === w * h * 3) {
                        // RGB to RGBA
                        for (let si = 0, di = 0; si < srcData.length; si += 3, di += 4) {
                          imgData.data[di] = srcData[si];
                          imgData.data[di + 1] = srcData[si + 1];
                          imgData.data[di + 2] = srcData[si + 2];
                          imgData.data[di + 3] = 255;
                        }
                      } else if (srcData.length === w * h) {
                        // Grayscale to RGBA
                        for (let si = 0, di = 0; si < srcData.length; si++, di += 4) {
                          imgData.data[di] = srcData[si];
                          imgData.data[di + 1] = srcData[si];
                          imgData.data[di + 2] = srcData[si];
                          imgData.data[di + 3] = 255;
                        }
                      }
                      ctx.putImageData(imgData, 0, 0);

                      const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob((b) => resolve(b), 'image/png')
                      );

                      if (blob) {
                        const dataUrl = canvas.toDataURL('image/png');
                        images.push({
                          id: `${p}_${imgObjId}`,
                          name: `bild_s${p}_${images.length + 1}.png`,
                          blob,
                          width: w,
                          height: h,
                          size: blob.size,
                          dataUrl,
                        });
                      }
                    }
                  }
                }
              } catch {
                // Ignore non-standard image formats
              }
            }
          }
        }

        // Store only genuine embedded images (XObjects)
        setExtractedImages(images);
      } else if (mode === 'attachments') {
        setProgress(50);
        setStatusText('Dateianhänge & ZUGFeRD-Rechnungsdaten durchsuchen...');

        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const attachments: ExtractedAttachment[] = [];

        // Search EmbeddedFiles name tree in document catalog
        try {
          const names = pdfDoc.catalog.lookup(PDFName.of('Names'));
          if (names instanceof PDFDict) {
            const embeddedFiles = names.lookup(PDFName.of('EmbeddedFiles'));
            if (embeddedFiles instanceof PDFDict) {
              const namesArray = embeddedFiles.lookup(PDFName.of('Names'));
              // Names array pairs: [String, Dict]
              if (namesArray && 'asArray' in (namesArray as any)) {
                const arr = (namesArray as any).asArray();
                for (let i = 0; i < arr.length; i += 2) {
                  const fname = arr[i].value ? String(arr[i].value) : `anhang_${Math.floor(i / 2) + 1}.bin`;
                  const fileSpec = arr[i + 1];
                  if (fileSpec instanceof PDFDict) {
                    const ef = fileSpec.lookup(PDFName.of('EF'));
                    if (ef instanceof PDFDict) {
                      const fStream = ef.lookup(PDFName.of('F'));
                      if (fStream instanceof PDFStream) {
                        const bytes = fStream.getContents();
                        attachments.push({
                          name: fname,
                          size: bytes.length,
                          data: bytes,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        } catch {
          // No standard EmbeddedFiles tree
        }

        setExtractedAttachments(attachments);
      }

      setProgress(100);
      setIsProcessing(false);
      setHasExtracted(true);
      trackEvent('conversion_completed', { toolSlug, mode });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      alert(`Fehler beim Extrahieren: ${err?.message || 'Unbekannter Fehler'}`);
      trackEvent('conversion_failed', { toolSlug, mode });
    }
  };

  const renderAllPageSnapshots = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusText('PDF-Seiten werden als Bilder gerendert...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await getClientPdfJs();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const totalPages = doc.numPages;
      const images: ExtractedImage[] = [];

      for (let p = 1; p <= totalPages; p++) {
        setProgress(15 + Math.round((p / totalPages) * 80));
        setStatusText(`Seite ${p} von ${totalPages} wird als Bild gerendert...`);

        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), 'image/png')
          );
          if (blob) {
            images.push({
              id: `page_${p}`,
              name: `seite_${p}.png`,
              blob,
              width: Math.round(viewport.width),
              height: Math.round(viewport.height),
              size: blob.size,
              dataUrl: canvas.toDataURL('image/png'),
            });
          }
        }
      }

      setExtractedImages(images);
      setProgress(100);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Fehler beim Rendern der Seiten als Bilder.');
    }
  };

  const handleDownloadAllImagesZip = async () => {
    if (extractedImages.length === 0 || !file) return;
    const zip = new JSZip();
    extractedImages.forEach((img) => {
      zip.file(img.name, img.blob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `bilder_${file.name.replace('.pdf', '')}.zip`);
  };

  const handleDownloadAllAttachmentsZip = async () => {
    if (extractedAttachments.length === 0 || !file) return;
    const zip = new JSZip();
    extractedAttachments.forEach((att) => {
      zip.file(att.name, att.data);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `anhaenge_${file.name.replace('.pdf', '')}.zip`);
  };

  const handleDownloadText = () => {
    if (!extractedText || !file) return;
    const textBlob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(textBlob, `${file.name.replace('.pdf', '')}_text.txt`);
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setHasExtracted(false);
    setExtractedText('');
    setPageTexts([]);
    setExtractedImages([]);
    setExtractedAttachments([]);
    setIsProcessing(false);
  };

  if (isProcessing) {
    return <ProcessingStatus progress={progress} statusText={statusText} />;
  }

  return (
    <div className="w-full">
      {!file ? (
        <FileUploader
          acceptedExtensions={['.pdf']}
          maxFileSizeMB={500}
          onFilesSelected={handleFileSelected}
          title={
            mode === 'images'
              ? 'PDF für Bild-Extraktion ablegen'
              : mode === 'text'
                ? 'PDF für Text-Extraktion ablegen'
                : 'PDF für Anhänge-Extraktion ablegen'
          }
          subtitle="Schnelle und sichere Extraktion von Elementen (bis zu 500 MB direkt in Ihrem Browser)"
          isLocal={true}
        />
      ) : !hasExtracted ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
              {mode === 'images' ? <ImageIcon className="w-5 h-5" /> : mode === 'text' ? <FileText className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="py-6 max-w-xl text-xs text-slate-600 leading-relaxed">
            {mode === 'images' && (
              <p>
                CoolWave durchsucht das Dokument nach allen eingebetteten Rastergrafiken und Fotos. Sie können jedes Bild einzeln ansehen oder alle Bilder gebündelt als ZIP-Archiv herunterladen.
              </p>
            )}
            {mode === 'text' && (
              <p>
                Extrahiert den gesamten lesbaren Text der PDF-Datei strukturiert nach Seitenzahlen. Ideal für Notizen, Suchanalysen oder die Weiterverarbeitung in Textverarbeitungsprogrammen.
              </p>
            )}
            {mode === 'attachments' && (
              <p>
                Liest eingebettete Dateianhänge (z. B. ZUGFeRD / Factur-X XML-Rechnungen, Tabellen oder Begleitdokumente) aus dem PDF-Datenbaum aus.
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Andere Datei wählen
            </button>

            <button
              onClick={executeExtraction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
            >
              {mode === 'images' ? <ImageIcon className="w-4 h-4" /> : mode === 'text' ? <FileText className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
              <span>
                {mode === 'images' ? 'Bilder extrahieren' : mode === 'text' ? 'Text extrahieren' : 'Anhänge suchen & extrahieren'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Extraktion abgeschlossen
              </span>
              <h2 className="text-lg font-bold text-slate-900">{file.name}</h2>
              <p className="text-xs text-slate-500">
                {mode === 'images' && `${extractedImages.length} Bild(er) gefunden`}
                {mode === 'text' && `${pageTexts.length} Seiten extrahiert (${extractedText.split(/\s+/).filter(Boolean).length} Wörter)`}
                {mode === 'attachments' && `${extractedAttachments.length} Dateianhang/-anhänge gefunden`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {mode === 'images' && extractedImages.length > 0 && (
                <button
                  onClick={handleDownloadAllImagesZip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Alle Bilder als ZIP ({extractedImages.length})
                </button>
              )}

              {mode === 'attachments' && extractedAttachments.length > 0 && (
                <button
                  onClick={handleDownloadAllAttachmentsZip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Alle Anhänge als ZIP ({extractedAttachments.length})
                </button>
              )}

              {mode === 'text' && (
                <>
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}
                  </button>
                  <button
                    onClick={handleDownloadText}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Als .TXT speichern
                  </button>
                </>
              )}

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Neu
              </button>
            </div>
          </div>

          {/* Mode-Specific Content Area */}
          {mode === 'images' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {extractedImages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 max-w-md mx-auto">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-slate-700">Keine eingebetteten Rasterbilder gefunden</p>
                  <p className="text-xs text-slate-500 mt-1 mb-6">
                    Dieses Dokument enthält keine separat eingebetteten JPG/PNG-Bilder (XObjects), sondern besteht aus Vektorgrafiken und Text.
                  </p>
                  <button
                    type="button"
                    onClick={renderAllPageSnapshots}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Alle PDF-Seiten als Bild rendern (Seiten-Snapshot)</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {extractedImages.map((img) => (
                    <div key={img.id} className="group relative rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square flex items-center justify-center overflow-hidden rounded-lg bg-white mb-2">
                        <img src={img.dataUrl} alt={img.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800 truncate max-w-[110px]">{img.name}</p>
                          <p className="text-[10px] text-slate-400">{img.width} × {img.height} px • {formatBytes(img.size)}</p>
                        </div>
                        <button
                          onClick={() => downloadBlob(img.blob, img.name)}
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                          title="Bild herunterladen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'text' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Gesamter Text
                </button>
                {pageTexts.map((pt) => (
                  <button
                    key={pt.page}
                    onClick={() => setActiveTab(pt.page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === pt.page ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Seite {pt.page}
                  </button>
                ))}
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                {activeTab === 'all' 
                  ? extractedText || 'Kein Text im Dokument enthalten.' 
                  : pageTexts.find((pt) => pt.page === activeTab)?.text || 'Kein Text auf dieser Seite.'}
              </div>
            </div>
          )}

          {mode === 'attachments' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {extractedAttachments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Paperclip className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-slate-700">Keine eingebetteten Dateianhänge gefunden</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Dieses Dokument enthält keine eingebetteten Dateianhänge oder ZUGFeRD / Factur-X XML-Rechnungsdaten.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {extractedAttachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-sky-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{att.name}</p>
                          <p className="text-xs text-slate-500">{formatBytes(att.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const b = new Blob([att.data as unknown as BlobPart]);
                          downloadBlob(b, att.name);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Herunterladen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
