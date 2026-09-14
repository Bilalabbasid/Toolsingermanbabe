"use client";

import React, { useState } from "react";
import { AlertTriangle, Info, Download, RotateCcw, Layers } from "lucide-react";
import { FileUploader } from "@/components/tools/FileUploader";
import { ProcessingStatus } from "@/components/tools/ProcessingStatus";
import { DownloadBox } from "@/components/tools/DownloadBox";
import { formatBytes } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export type DesignConvertMode =
  | "psd-to-raster"   // PSD -> PNG/JPG/WebP
  | "raster-to-psd"   // PNG/JPG -> PSD (flat raster PSD)
  | "svg-to-pdf"      // SVG -> PDF
  | "pdf-to-svg"      // PDF -> SVG (raster-in-SVG, honest)
  | "eps-to-svg"      // EPS -> SVG
  | "eps-to-pdf";     // EPS -> PDF

interface DesignConvertEngineProps {
  mode: DesignConvertMode;
  targetFormat?: string;
}

const DISCLAIMERS: Record<DesignConvertMode, { title: string; body: string; type: "warning" | "info" } | null> = {
  "psd-to-raster": {
    title: "Hinweis zur PSD-Konvertierung",
    body: "CoolWave liest das zusammengesetzte Vorschau-Bild der PSD-Datei. Einzelne Ebenen, Effekte, Smartobjekte und Einstellungsebenen werden nicht separat verarbeitet. Das Ergebnis entspricht der sichtbaren Gesamtansicht der PSD-Datei.",
    type: "info",
  },
  "raster-to-psd": {
    title: "Wichtig: Flache PSD ohne Ebenen",
    body: "Die erzeugte PSD-Datei enthält das Bild als einzige, nicht aufgeteilte Ebene (Flat PSD). Es werden KEINE editierbaren Photoshop-Ebenen, Ebenenmasken oder Vektorgrafiken erstellt. Die Datei kann in Photoshop geöffnet werden, bietet jedoch keine Ebenenfunktionen.",
    type: "warning",
  },
  "svg-to-pdf": {
    title: "SVG wird als Rasterbild in PDF eingebettet",
    body: "SVG-Vektorgrafiken werden für die PDF-Ausgabe auf 150 DPI gerendert und als Pixelbild eingebettet. Die Vektorpfade bleiben im PDF nicht als skalierbare Vektoren erhalten. Für vektorbasierte PDF-Ausgabe empfehlen wir professionelle Tools wie Inkscape oder Adobe Illustrator.",
    type: "info",
  },
  "pdf-to-svg": {
    title: "PDF-Vektordaten können nicht extrahiert werden",
    body: "CoolWave kann aus einem PDF keine echten Vektordaten extrahieren. Das Ergebnis ist eine SVG-Datei, die das gerenderte Seitenbild als Rasterbild enthält, nicht als Vektorpfade. Für echte Vektorextraktion ist spezialisierte Software (z. B. Inkscape, Adobe Acrobat Pro) erforderlich.",
    type: "warning",
  },
  "eps-to-svg": {
    title: "EPS-Konvertierung erfordert Ghostscript",
    body: "EPS-Dateien können auf dem Server nur konvertiert werden, wenn Ghostscript installiert ist. Falls die Konvertierung fehlschlägt, konvertieren Sie die EPS-Datei zunächst lokal in PDF oder PNG und laden Sie diese Datei dann hoch.",
    type: "warning",
  },
  "eps-to-pdf": {
    title: "EPS-Konvertierung erfordert Ghostscript",
    body: "EPS-Dateien werden über den serverseitigen Ghostscript-Decoder verarbeitet. Falls keine Ghostscript-Installation verfügbar ist, wird ein hilfreicher Fehler angezeigt.",
    type: "warning",
  },
};

const MODE_CONFIG: Record<DesignConvertMode, {
  accept: string[];
  targetFmt: string;
  jobTargetFormat: string;
  title: string;
  subtitle: string;
  btnLabel: string;
  outputExt: string;
}> = {
  "psd-to-raster": {
    accept: [".psd"],
    targetFmt: "PNG",
    jobTargetFormat: "png",
    title: "PSD-Datei zum Konvertieren ablegen",
    subtitle: "Liest das zusammengesetzte Bild der PSD-Datei und exportiert als PNG, JPG oder WebP",
    btnLabel: "PSD konvertieren",
    outputExt: "png",
  },
  "raster-to-psd": {
    accept: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    targetFmt: "PSD",
    jobTargetFormat: "psd",
    title: "Bild als PSD exportieren",
    subtitle: "Erzeugt eine PSD-Datei mit dem Bild als einzelne flache Ebene",
    btnLabel: "Als PSD exportieren",
    outputExt: "psd",
  },
  "svg-to-pdf": {
    accept: [".svg"],
    targetFmt: "PDF",
    jobTargetFormat: "pdf",
    title: "SVG-Datei in PDF umwandeln",
    subtitle: "SVG wird auf 150 DPI gerendert und als PDF gespeichert",
    btnLabel: "SVG in PDF umwandeln",
    outputExt: "pdf",
  },
  "pdf-to-svg": {
    accept: [".pdf"],
    targetFmt: "SVG",
    jobTargetFormat: "svg",
    title: "PDF-Seite als SVG exportieren",
    subtitle: "Erste Seite des PDFs wird als SVG-Datei (Rasterbild) exportiert",
    btnLabel: "PDF zu SVG exportieren",
    outputExt: "svg",
  },
  "eps-to-svg": {
    accept: [".eps"],
    targetFmt: "SVG",
    jobTargetFormat: "svg",
    title: "EPS-Datei in SVG konvertieren",
    subtitle: "EPS-Vektorgrafik über Ghostscript in SVG umwandeln",
    btnLabel: "EPS in SVG umwandeln",
    outputExt: "svg",
  },
  "eps-to-pdf": {
    accept: [".eps"],
    targetFmt: "PDF",
    jobTargetFormat: "pdf",
    title: "EPS-Datei in PDF umwandeln",
    subtitle: "EPS-Datei über Ghostscript in ein druckfähiges PDF konvertieren",
    btnLabel: "EPS in PDF umwandeln",
    outputExt: "pdf",
  },
};

export function DesignConvertEngine({ mode, targetFormat }: DesignConvertEngineProps) {
  const cfg = MODE_CONFIG[mode];
  const disclaimer = DISCLAIMERS[mode];

  const [file, setFile] = useState<File | null>(null);
  const [rasterTarget, setRasterTarget] = useState<"png" | "jpg" | "webp">("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    disclaimer?.type === "info" // auto-accept info, require confirm for warning
  );

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setResultBlob(null);
    setErrorMsg(null);
    trackEvent("upload_completed", { toolSlug: mode, size: files[0].size });
  };

  const effectiveTarget = mode === "psd-to-raster" ? rasterTarget : cfg.jobTargetFormat;

  const executeConversion = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusText("Datei wird hochgeladen...");
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "design_convert");
      formData.append("targetFormat", effectiveTarget);
      formData.append("options", JSON.stringify({
        targetFormat: effectiveTarget,
        quality: 92,
        backgroundColor: "#ffffff",
      }));

      const res = await fetch("/api/v1/jobs", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server-Fehler: ${res.status} ${res.statusText}`);
      }

      const { jobId } = await res.json();
      setStatusText("Datei wird verarbeitet...");
      setProgress(30);

      let pollCount = 0;
      while (pollCount < 90) {
        await new Promise((r) => setTimeout(r, 1500));
        pollCount++;
        const check = await fetch(`/api/v1/jobs/${jobId}`);
        if (!check.ok) continue;
        const poll = await check.json();
        if (poll.progress) setProgress(Math.max(30, poll.progress));

        if (poll.status === "completed" && poll.output?.downloadUrl) {
          setStatusText("Download wird vorbereitet...");
          setProgress(100);
          const fileRes = await fetch(poll.output.downloadUrl);
          const blob = await fileRes.blob();
          setResultBlob(blob);
          const base = file.name.replace(/\.[^.]+$/, "");
          setOutputFilename(`coolwave_${base}.${effectiveTarget}`);
          setIsProcessing(false);
          trackEvent("conversion_completed", { toolSlug: mode, target: effectiveTarget });
          return;
        }
        if (poll.status === "failed") {
          throw new Error(poll.error || "Konvertierung fehlgeschlagen.");
        }
      }
      throw new Error("Zeitüberschreitung: Die Konvertierung dauert zu lange.");
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || "Unbekannter Fehler.");
      trackEvent("conversion_failed", { toolSlug: mode });
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setErrorMsg(null);
    setIsProcessing(false);
    setDisclaimerAccepted(disclaimer?.type === "info");
  };

  if (resultBlob && file) {
    return (
      <DownloadBox
        filename={outputFilename}
        originalSizeBytes={file.size}
        resultSizeBytes={resultBlob.size}
        onDownload={() => {
          const url = URL.createObjectURL(resultBlob);
          const a = document.createElement("a");
          a.href = url; a.download = outputFilename; a.click();
        }}
        onReset={handleReset}
        downloadLabel={`${effectiveTarget.toUpperCase()}-Datei herunterladen`}
      />
    );
  }

  if (isProcessing) return <ProcessingStatus progress={progress} statusText={statusText} />;

  return (
    <div className="w-full space-y-4">
      {/* Disclaimer box */}
      {disclaimer && (
        <div className={`rounded-xl border p-4 flex gap-3 ${
          disclaimer.type === "warning"
            ? "bg-amber-50 border-amber-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          {disclaimer.type === "warning"
            ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            : <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <p className={`text-sm font-bold mb-1 ${disclaimer.type === "warning" ? "text-amber-800" : "text-blue-800"}`}>
              {disclaimer.title}
            </p>
            <p className={`text-xs leading-relaxed ${disclaimer.type === "warning" ? "text-amber-700" : "text-blue-700"}`}>
              {disclaimer.body}
            </p>
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
          {!file ? (
            <FileUploader
              acceptedExtensions={cfg.accept}
              maxFileSizeMB={50}
              onFilesSelected={handleFileSelected}
              title={cfg.title}
              subtitle={cfg.subtitle}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
              {/* File info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.size)}</p>
                </div>
              </div>

              {/* PSD target selector */}
              {mode === "psd-to-raster" && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Ausgabeformat
                  </label>
                  <div className="flex gap-2">
                    {(["png", "jpg", "webp"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setRasterTarget(fmt)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold transition-colors ${
                          rasterTarget === fmt
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 text-slate-600 hover:border-sky-400"
                        }`}
                      >
                        .{fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800 mb-1">Konvertierung fehlgeschlagen</p>
                    <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Andere Datei
                </button>
                <button
                  onClick={executeConversion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {cfg.btnLabel}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
