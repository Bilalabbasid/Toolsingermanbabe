"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download, Info, Layers, RotateCcw, ShieldCheck, Sliders } from "lucide-react";
import { FileUploader } from "@/components/tools/FileUploader";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadBox } from "@/components/tools/DownloadBox";
import { BatchProcessingQueue } from "@/components/tools/BatchProcessingQueue";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getBatchLimits, validateBatchFiles } from "@/config/batch.config";
import { pdfToSvg, psdToRaster, rasterToPsd, svgToPdf, type DesignResult, type RasterTarget } from "@/lib/client/design/convert";
import { useConversionQueue } from "@/lib/client/image/useConversionQueue";
import { FilePreview } from "@/lib/client/image/FilePreview";

export type DesignConvertMode =
  | "psd-to-raster"   // PSD -> PNG/JPG/WebP
  | "raster-to-psd"   // PNG/JPG -> PSD (single pixel layer)
  | "svg-to-pdf"      // SVG -> PDF (high-res raster)
  | "pdf-to-svg"      // PDF -> SVG (raster page + selectable text)
  | "eps-to-svg"      // EPS -> SVG (not possible in the browser)
  | "eps-to-pdf";     // EPS -> PDF (not possible in the browser)

interface DesignConvertEngineProps {
  mode: DesignConvertMode;
  targetFormat?: string;
}

const DISCLAIMERS: Record<DesignConvertMode, { title: string; body: string; type: "warning" | "info" } | null> = {
  "psd-to-raster": {
    title: "Hinweis zur PSD-Konvertierung",
    body: "Datei Tools liest das zusammengesetzte Gesamtbild der PSD-Datei – so, wie Photoshop es zuletzt gespeichert hat. Einzelne Ebenen werden nicht separat exportiert. Fehlt das Gesamtbild (Datei ohne „Kompatibilität maximieren“ gespeichert), wird es vereinfacht aus den sichtbaren Pixelebenen zusammengesetzt.",
    type: "info",
  },
  "raster-to-psd": {
    title: "PSD mit einer Bildebene",
    body: "Die erzeugte PSD-Datei enthält Ihr Bild als eine normale, bearbeitbare Pixelebene (Transparenz bleibt erhalten). Es werden keine zusätzlichen Ebenen, Masken oder Vektorformen erzeugt – Photoshop, GIMP und Photopea öffnen die Datei problemlos.",
    type: "info",
  },
  "svg-to-pdf": {
    title: "SVG wird hochaufgelöst als Bild ins PDF eingebettet",
    body: "Die SVG-Grafik wird im Browser mit wählbarer Auflösung (150 oder 300 DPI) gerendert und als verlustfreies Bild in eine PDF-Seite in Originalgröße eingebettet. Die Vektorpfade bleiben im PDF nicht als skalierbare Vektoren erhalten. Für vektorbasierte PDFs empfehlen wir Inkscape oder Adobe Illustrator.",
    type: "info",
  },
  "pdf-to-svg": {
    title: "So funktioniert PDF → SVG",
    body: "Jede PDF-Seite wird als eigene SVG-Datei ausgegeben: Das Seitenbild ist als hochaufgelöste Rastergrafik eingebettet, der Text liegt zusätzlich als unsichtbare, auswählbare und durchsuchbare SVG-Textebene darüber. Echte Vektorpfade werden nicht extrahiert – dafür ist spezialisierte Software wie Inkscape oder Adobe Illustrator nötig.",
    type: "warning",
  },
  "eps-to-svg": null,
  "eps-to-pdf": null,
};

const MODE_CONFIG: Record<DesignConvertMode, {
  accept: string[];
  title: string;
  subtitle: string;
  btnLabel: string;
  label: string;
}> = {
  "psd-to-raster": {
    accept: [".psd"],
    title: "PSD-Dateien zum Konvertieren ablegen",
    subtitle: "Exportiert das Gesamtbild der PSD als PNG, JPG oder WebP – direkt im Browser",
    btnLabel: "PSD konvertieren",
    label: "PSD",
  },
  "raster-to-psd": {
    accept: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    title: "Bilder als PSD exportieren",
    subtitle: "Erzeugt eine Photoshop-Datei mit dem Bild als bearbeitbare Ebene",
    btnLabel: "Als PSD exportieren",
    label: "PSD",
  },
  "svg-to-pdf": {
    accept: [".svg"],
    title: "SVG-Dateien in PDF umwandeln",
    subtitle: "Jede SVG wird hochaufgelöst als PDF-Seite gespeichert",
    btnLabel: "SVG in PDF umwandeln",
    label: "PDF",
  },
  "pdf-to-svg": {
    accept: [".pdf"],
    title: "PDF-Datei als SVG exportieren",
    subtitle: "Alle Seiten als SVG (Seitenbild + auswählbarer Text), mehrere Seiten als ZIP",
    btnLabel: "PDF in SVG umwandeln",
    label: "SVG",
  },
  "eps-to-svg": { accept: [".eps"], title: "", subtitle: "", btnLabel: "", label: "SVG" },
  "eps-to-pdf": { accept: [".eps"], title: "", subtitle: "", btnLabel: "", label: "PDF" },
};

function choiceClass(active: boolean) {
  return `px-4 py-2 rounded-lg border text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
    active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-400"
  }`;
}

/* ------------------------------------------------------------------ */
/* EPS notice                                                          */
/* ------------------------------------------------------------------ */

function EpsUnavailableNotice({ target }: { target: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-3">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm font-bold text-amber-900">EPS in {target} ist im Browser derzeit nicht verfügbar</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            EPS-Dateien bestehen aus PostScript-Programmcode. Für eine korrekte Umwandlung wird ein vollständiger
            PostScript-Interpreter (z. B. Ghostscript) benötigt, der nicht im Browser läuft. Da Datei Tools Ihre Dateien
            ausschließlich lokal auf Ihrem Gerät verarbeitet, bieten wir diese Umwandlung bewusst nicht an, statt Ihnen
            nur ein unscharfes Vorschaubild auszugeben.
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Alternative:</strong> Öffnen Sie die EPS-Datei in Inkscape (kostenlos), Adobe Illustrator oder
            Affinity Designer und speichern Sie sie dort direkt als {target}.
            {target === "SVG" && (
              <>
                {" "}Liegt Ihre Grafik bereits als PDF vor, hilft{" "}
                <Link href="/de/pdf-in-svg-umwandeln" className="font-semibold underline">PDF in SVG umwandeln</Link>.
              </>
            )}
            {target === "PDF" && (
              <>
                {" "}Liegt Ihre Grafik als SVG vor, nutzen Sie{" "}
                <Link href="/de/svg-in-pdf-umwandeln" className="font-semibold underline">SVG in PDF umwandeln</Link>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function DesignConvertEngine({ mode, targetFormat }: DesignConvertEngineProps) {
  const cfg = MODE_CONFIG[mode];
  const disclaimer = DISCLAIMERS[mode];
  const limits = getBatchLimits(false);

  const configuredRasterTarget: RasterTarget = (["png", "jpg", "webp"] as const).includes(
    (targetFormat || "").toLowerCase() as RasterTarget
  )
    ? ((targetFormat || "").toLowerCase() as RasterTarget)
    : "png";

  const [rasterTarget, setRasterTarget] = useState<RasterTarget>(configuredRasterTarget);
  const [quality, setQuality] = useState(92);
  const [svgDpi, setSvgDpi] = useState(300);
  const [pdfScale, setPdfScale] = useState(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(disclaimer?.type !== "warning");

  const effectiveTarget =
    mode === "psd-to-raster" ? rasterTarget : mode === "raster-to-psd" ? "psd" : mode === "svg-to-pdf" ? "pdf" : "svg";

  const converter = useCallback(
    async (file: File, onProgress: (p: number, m?: string) => void): Promise<DesignResult> => {
      try {
        let res: DesignResult;
        if (mode === "psd-to-raster") res = await psdToRaster(file, rasterTarget, quality, onProgress);
        else if (mode === "raster-to-psd") res = await rasterToPsd(file, onProgress);
        else if (mode === "svg-to-pdf") res = await svgToPdf(file, svgDpi, onProgress);
        else if (mode === "pdf-to-svg") res = await pdfToSvg(file, pdfScale, onProgress);
        else throw new Error("EPS-Dateien können im Browser nicht umgewandelt werden.");
        trackEvent("conversion_completed", { toolSlug: mode, target: effectiveTarget, mode: "browser" });
        return res;
      } catch (err) {
        trackEvent("conversion_failed", { toolSlug: mode, mode: "browser", error: (err as Error)?.message });
        throw err;
      }
    },
    [mode, rasterTarget, quality, svgDpi, pdfScale, effectiveTarget]
  );

  const queue = useConversionQueue(converter, limits.clientConcurrency);
  const items = queue.items;
  const single = items.length === 1 ? items[0] : null;
  const optionsLocked = queue.isProcessing || items.some((i) => i.status === "completed");

  if (mode === "eps-to-svg" || mode === "eps-to-pdf") {
    return <EpsUnavailableNotice target={mode === "eps-to-svg" ? "SVG" : "PDF"} />;
  }

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setErrorMsg(null);
    const combined = [...items.map((i) => i.file), ...files];
    const validation = validateBatchFiles(combined, false);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Die Auswahl überschreitet die Limits.");
      return;
    }
    queue.addFiles(files);
    trackEvent("upload_completed", { toolSlug: mode, count: files.length });
  };

  const resetAll = () => {
    queue.clear();
    setErrorMsg(null);
    setDisclaimerAccepted(disclaimer?.type !== "warning");
  };

  /* ---------------------------- options ---------------------------- */

  const options = (
    <div className="space-y-4">
      {mode === "psd-to-raster" && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Ausgabeformat</label>
          <div className="flex gap-2">
            {(["png", "jpg", "webp"] as const).map((fmt) => (
              <button key={fmt} type="button" disabled={optionsLocked} onClick={() => setRasterTarget(fmt)} className={choiceClass(rasterTarget === fmt)}>
                .{fmt.toUpperCase()}
              </button>
            ))}
          </div>
          {rasterTarget !== "png" && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" /> Bildqualität:
                </span>
                <span className="text-sky-600 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                disabled={optionsLocked}
                aria-label="Bildqualität in Prozent"
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer disabled:opacity-50"
              />
              {rasterTarget === "jpg" && (
                <p className="text-[11px] text-slate-500">Transparente Bereiche werden bei JPG weiß gefüllt.</p>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "svg-to-pdf" && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Auflösung</label>
          <div className="flex gap-2">
            {[150, 300].map((dpi) => (
              <button key={dpi} type="button" disabled={optionsLocked} onClick={() => setSvgDpi(dpi)} className={choiceClass(svgDpi === dpi)}>
                {dpi} DPI{dpi === 300 ? " (Druck)" : " (Bildschirm)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "pdf-to-svg" && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Auflösung des Seitenbilds</label>
          <div className="flex gap-2">
            {[
              { v: 2, l: "144 DPI (kleinere Dateien)" },
              { v: 3, l: "216 DPI (schärfer)" },
            ].map((o) => (
              <button key={o.v} type="button" disabled={optionsLocked} onClick={() => setPdfScale(o.v)} className={choiceClass(pdfScale === o.v)}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const localNote = (
    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
      <ShieldCheck className="w-3.5 h-3.5" />
      Die Umwandlung läuft vollständig in Ihrem Browser – Ihre Dateien werden nicht hochgeladen.
    </p>
  );

  const errorBanner = errorMsg && (
    <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
    </div>
  );

  /* ---------------------------- single ----------------------------- */

  if (single?.status === "completed" && single.outputBlob && single.outputFileName) {
    const blob = single.outputBlob;
    const name = single.outputFileName;
    return (
      <div className="w-full space-y-4">
        {single.note && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">{single.note}</p>
          </div>
        )}
        <DownloadBox
          filename={name}
          resultSizeBytes={blob.size}
          onDownload={() => downloadBlob(blob, name)}
          onReset={resetAll}
          downloadLabel={name.endsWith(".zip") ? "ZIP mit SVG-Seiten herunterladen" : `${effectiveTarget.toUpperCase()}-Datei herunterladen`}
        />
      </div>
    );
  }

  if (single?.status === "processing") {
    return <ProcessingStatus progress={single.progress} statusText={single.statusText || "Wird verarbeitet..."} />;
  }

  return (
    <div className="w-full space-y-4">
      {disclaimer && (
        <div className={`rounded-xl border p-4 flex gap-3 ${disclaimer.type === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
          {disclaimer.type === "warning" ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-bold mb-1 ${disclaimer.type === "warning" ? "text-amber-800" : "text-blue-800"}`}>{disclaimer.title}</p>
            <p className={`text-xs leading-relaxed ${disclaimer.type === "warning" ? "text-amber-700" : "text-blue-700"}`}>{disclaimer.body}</p>
            {disclaimer.type === "warning" && !disclaimerAccepted && (
              <button
                onClick={() => setDisclaimerAccepted(true)}
                className="mt-3 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                Ich verstehe – fortfahren
              </button>
            )}
          </div>
        </div>
      )}

      {disclaimerAccepted && (
        <>
          {errorBanner}
          {items.length === 0 ? (
            <FileUploader
              acceptedExtensions={cfg.accept}
              maxFileSizeMB={limits.maxFileSizeMB}
              allowMultiple={true}
              isLocal={true}
              onFilesSelected={handleFilesSelected}
              title={cfg.title}
              subtitle={cfg.subtitle}
            />
          ) : single ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {mode === "raster-to-psd" || mode === "svg-to-pdf" ? (
                    <FilePreview file={single.file} alt={`Vorschau von ${single.file.name}`} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Layers className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{single.file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatBytes(single.file.size)} • Ziel: <span className="font-semibold text-sky-600">{effectiveTarget.toUpperCase()}</span>
                  </p>
                </div>
              </div>

              {options}

              {single.status === "failed" && single.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800 mb-1">Konvertierung fehlgeschlagen</p>
                    <p className="text-xs text-red-700 leading-relaxed">{single.error}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <button onClick={resetAll} className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Andere Datei
                  </button>
                  {localNote}
                </div>
                <button
                  onClick={() => (single.status === "failed" ? queue.retry(single.id) : queue.start())}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {single.status === "failed" ? "Erneut versuchen" : cfg.btnLabel}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-3">
                {options}
                {localNote}
              </div>
              <BatchProcessingQueue
                items={items}
                isProcessing={queue.isProcessing}
                onStartBatch={queue.start}
                onCancelBatch={queue.cancel}
                onClearQueue={resetAll}
                onRemoveItem={queue.remove}
                onRetryItem={queue.retry}
                onDownloadItem={queue.downloadItem}
                onDownloadAllZip={() => queue.downloadZip(`datei_tools_${effectiveTarget}_stapel_${Date.now()}.zip`)}
                isZipping={queue.isZipping}
                toolTitle={`${cfg.label}-Konvertierung (Stapel)`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
