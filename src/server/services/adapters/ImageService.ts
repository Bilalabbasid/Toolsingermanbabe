import { IConversionService, ConversionResult } from "../base.service";
import { ServiceOptions } from "@/types/job";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { getLoadedPdfJs, getPdfJsDocumentOptions } from "@/server/pdf/pdfjsNode";

export type SupportedImageTarget =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "gif"
  | "svg"
  | "bmp"
  | "tiff"
  | "tif"
  | "ico"
  | "avif"
  | "pdf"
  | "psd";

export class ImageService implements IConversionService {
  name = "ImageService";
  supportedTypes = [
    "image_convert",
    "image_convert_server",
    "image_to_pdf",
    "image_metadata_strip",
    "design_convert",
  ];

  canHandle(type: string): boolean {
    return (
      this.supportedTypes.includes(type) ||
      type.startsWith("image_") ||
      type.startsWith("img_") ||
      type.startsWith("design_")
    );
  }

  async execute(
    inputBuffer: Buffer,
    inputName: string,
    options: ServiceOptions,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(10);
    if (signal?.aborted) throw new Error("Bildkonvertierung abgebrochen.");

    const maxSizeBytes = Number(options.maxFileSizeMB || 50) * 1024 * 1024;
    if (inputBuffer.length > maxSizeBytes) {
      throw new Error(`Die Datei ueberschreitet das Limit von ${options.maxFileSizeMB || 50} MB.`);
    }

    const baseName = inputName.replace(/\.[^/.]+$/, "");
    const ext = (inputName.split(".").pop() || "").toLowerCase();

    let target = (
      options.targetFormat ||
      options.outputType ||
      (options.jobType === "image_to_pdf" ? "pdf" : "")
    ).toLowerCase().replace(".", "") as SupportedImageTarget;

    const jobTypeStr = String(options.jobType || "");
    if (!target) {
      if (jobTypeStr.includes("to_png")) target = "png";
      else if (jobTypeStr.includes("to_jpg") || jobTypeStr.includes("to_jpeg")) target = "jpg";
      else if (jobTypeStr.includes("to_webp")) target = "webp";
      else if (jobTypeStr.includes("to_gif")) target = "gif";
      else if (jobTypeStr.includes("to_svg")) target = "svg";
      else if (jobTypeStr.includes("to_bmp")) target = "bmp";
      else if (jobTypeStr.includes("to_tiff")) target = "tiff";
      else if (jobTypeStr.includes("to_ico")) target = "ico";
      else if (jobTypeStr.includes("to_avif")) target = "avif";
      else if (jobTypeStr.includes("to_pdf")) target = "pdf";
      else if (jobTypeStr.includes("to_psd")) target = "psd";
      else target = "png";
    }

    // PSD INPUT: decode flat composite via ag-psd or sharp fallback
    if (ext === "psd" && target !== "psd") {
      onProgress(20);
      let psdPngBuffer: Buffer;
      try {
        const agPsd = await import("ag-psd");
        const psd = agPsd.readPsd(inputBuffer, { skipLayerImageData: true });
        const imgData = (psd as any).imageData;
        if (imgData && imgData.data) {
          psdPngBuffer = await sharp(Buffer.from(imgData.data), {
            raw: { width: imgData.width, height: imgData.height, channels: 4 },
          }).png().toBuffer();
        } else {
          throw new Error("Kein Bildinhalt im PSD gefunden.");
        }
      } catch {
        try { psdPngBuffer = await sharp(inputBuffer).png().toBuffer(); }
        catch (e: any) {
          throw new Error(`PSD-Datei konnte nicht gelesen werden: ${e?.message || e}`);
        }
      }
      return this._encodeSharp(sharp(psdPngBuffer), target, baseName, options, onProgress, signal);
    }

    // EPS INPUT: requires Ghostscript via sharp/libvips
    if (ext === "eps" && (target as string) !== "eps") {
      onProgress(20);
      let epsPngBuffer: Buffer;
      try {
        epsPngBuffer = await sharp(inputBuffer, { density: 150 }).png().toBuffer();
      } catch {
        throw new Error(
          "EPS-Konvertierung benoetigt Ghostscript auf dem Server. " +
          "Die Datei konnte nicht verarbeitet werden. " +
          "Tipp: Konvertieren Sie die EPS-Datei zunaechst mit einem lokalen Tool in PDF oder PNG."
        );
      }
      return this._encodeSharp(sharp(epsPngBuffer), target, baseName, options, onProgress, signal);
    }

    // TARGET: PSD (raster-in-PSD, flat)
    if (target === "psd") {
      onProgress(25);
      let pngBuffer: Buffer;
      try { pngBuffer = await sharp(inputBuffer).png().toBuffer(); }
      catch { throw new Error("Das Eingabebild konnte nicht verarbeitet werden."); }
      onProgress(60);
      const psdData = await this._buildMinimalPsd(pngBuffer);
      onProgress(100);
      return {
        data: psdData,
        fileName: `${baseName}.psd`,
        mimeType: "image/vnd.adobe.photoshop",
      };
    }

    // PDF -> SVG: Genuine vector/image extraction via Poppler or high-res rendered canvas
    if (ext === "pdf" && target === "svg") {
      onProgress(20);
      const targetPageNum = Math.max(1, Number(options.page || (options.pageIndex ? Number(options.pageIndex) + 1 : 1)) || 1);

      // 1. Try native pdftocairo (true vector + embedded raster graphics)
      try {
        const { isPdfToCairoAvailable, convertPdfToSvgWithPoppler } = await import("./popplerRunner");
        if (await isPdfToCairoAvailable()) {
          const svgData = await convertPdfToSvgWithPoppler(inputBuffer, targetPageNum);
          onProgress(100);
          return {
            data: svgData,
            fileName: `${baseName}.svg`,
            mimeType: "image/svg+xml",
          };
        }
      } catch (cairoErr) {
        console.warn("[ImageService] pdftocairo fallback to in-process canvas renderer:", cairoErr);
      }

      // 2. High-fidelity in-process canvas renderer fallback
      try {
        const napi = await import("@napi-rs/canvas");
        const canvasGlobals = globalThis as unknown as Record<string, unknown>;
        if (!canvasGlobals.Path2D) canvasGlobals.Path2D = napi.Path2D;
        if (!canvasGlobals.ImageData) canvasGlobals.ImageData = napi.ImageData;
        if (!canvasGlobals.DOMMatrix) canvasGlobals.DOMMatrix = napi.DOMMatrix;
        if (!canvasGlobals.DOMPoint) canvasGlobals.DOMPoint = napi.DOMPoint;

        const pdfjsLib = await getLoadedPdfJs();
        const loadingTask = pdfjsLib.getDocument(getPdfJsDocumentOptions(inputBuffer));
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        const validPage = Math.min(Math.max(1, targetPageNum), pageCount);

        const page = await pdf.getPage(validPage);
        const scale = 2.0; // Render at 2x for sharp high-DPI visual fidelity
        const viewport = page.getViewport({ scale });
        const ptWidth = Math.round(viewport.width / scale);
        const ptHeight = Math.round(viewport.height / scale);

        onProgress(50);
        const canvas = napi.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        await page.render({ canvasContext: canvas.getContext("2d") as never, viewport }).promise;
        const pngBuffer = canvas.toBuffer("image/png");

        onProgress(75);
        const textContent = await page.getTextContent();
        const escapeXml = (str: string) =>
          str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const textElements: string[] = [];
        for (const item of textContent.items as Array<{ str: string; transform: number[]; fontName?: string }>) {
          if (!item.str || !item.str.trim()) continue;
          const x = Math.round(item.transform[4]);
          const y = Math.round(ptHeight - item.transform[5]);
          const fontSize = Math.max(8, Math.round(Math.hypot(item.transform[0], item.transform[1]))) || 12;
          textElements.push(
            `    <text x="${x}" y="${y}" font-size="${fontSize}px" font-family="Inter, -apple-system, sans-serif" fill="#1e293b" opacity="0">${escapeXml(item.str)}</text>`
          );
        }

        const base64Png = pngBuffer.toString("base64");
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${ptWidth}pt" height="${ptHeight}pt" viewBox="0 0 ${ptWidth} ${ptHeight}">
  <title>${escapeXml(baseName)} – CoolWave SVG</title>
  <image width="${ptWidth}" height="${ptHeight}" xlink:href="data:image/png;base64,${base64Png}" preserveAspectRatio="none"/>
  <!-- Selectable vector text layer -->
  <g class="pdf-text-layer" aria-hidden="true">
${textElements.join("\n")}
  </g>
</svg>`;

        onProgress(100);
        return {
          data: Buffer.from(svgContent, "utf-8"),
          fileName: `${baseName}.svg`,
          mimeType: "image/svg+xml",
        };
      } catch (e: any) {
        throw new Error(`PDF-SVG-Konvertierung fehlgeschlagen: ${e?.message}`);
      }
    }

    // SVG -> PDF: rasterize via sharp then embed
    if (ext === "svg" && target === "pdf") {
      onProgress(25);
      const svgPng = await sharp(inputBuffer, { density: 150 }).png().toBuffer();
      onProgress(55);
      const pdf = await PDFDocument.create();
      const embeddedImg = await pdf.embedPng(svgPng);
      const { width, height } = embeddedImg.scale(1);
      const pdfPage = pdf.addPage([width, height]);
      pdfPage.drawImage(embeddedImg, { x: 0, y: 0, width, height });
      const pdfBytes = await pdf.save();
      onProgress(100);
      return {
        data: Buffer.from(pdfBytes),
        fileName: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    // Image -> PDF
    if (target === "pdf") {
      onProgress(30);
      const pdf = await PDFDocument.create();
      let normalizedBuffer = inputBuffer;
      if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
        normalizedBuffer = await sharp(inputBuffer).png().toBuffer();
      }
      onProgress(60);
      let embeddedImg;
      try { embeddedImg = await pdf.embedPng(normalizedBuffer); }
      catch { embeddedImg = await pdf.embedJpg(normalizedBuffer); }
      const { width, height } = embeddedImg.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(embeddedImg, { x: 0, y: 0, width, height });
      const pdfBytes = await pdf.save();
      onProgress(100);
      return {
        data: Buffer.from(pdfBytes),
        fileName: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }

    onProgress(25);
    if (signal?.aborted) throw new Error("Bildkonvertierung abgebrochen.");

    let sharpInstance: any;
    if (ext === "heic" || ext === "heif") {
      try {
        const heicDecodeModule = await import("heic-decode");
        const heicDecode = (heicDecodeModule as any).default || heicDecodeModule;
        const decoded = await heicDecode({ buffer: inputBuffer });
        sharpInstance = sharp(Buffer.from(decoded.data), {
          raw: { width: decoded.width, height: decoded.height, channels: 4 },
        });
      } catch (heicErr: any) {
        try { sharpInstance = sharp(inputBuffer); await sharpInstance.metadata(); }
        catch { throw new Error(`HEIC-Dekodierung fehlgeschlagen: ${heicErr?.message || heicErr}`); }
      }
    } else if (ext === "bmp") {
      try { sharpInstance = sharp(inputBuffer); await sharpInstance.metadata(); }
      catch {
        const bmpModule = await import("bmp-js");
        const bmp = (bmpModule as any).default || bmpModule;
        const decoded = bmp.decode(inputBuffer);
        sharpInstance = sharp(decoded.data, {
          raw: { width: decoded.width, height: decoded.height, channels: 4 },
        });
      }
    } else if (ext === "ico") {
      try {
        const icoModule = await import("icojs");
        const { decodeIco } = (icoModule as any).default || icoModule;
        const images = await decodeIco(inputBuffer);
        if (!images || images.length === 0) throw new Error("Keine gueltigen Icon-Bilder gefunden.");
        images.sort((a: any, b: any) => b.width * b.height - a.width * a.height);
        sharpInstance = sharp(Buffer.from(images[0].buffer));
      } catch (err: any) {
        throw new Error(`ICO-Dekodierung fehlgeschlagen: ${err.message || err}`);
      }
    } else {
      sharpInstance = sharp(inputBuffer);
    }

    return this._encodeSharp(sharpInstance, target, baseName, options, onProgress, signal);
  }

  private async _encodeSharp(
    sharpInstance: any,
    target: SupportedImageTarget,
    baseName: string,
    options: ServiceOptions,
    onProgress: (p: number) => void,
    signal?: AbortSignal
  ): Promise<ConversionResult> {
    onProgress(50);
    if (signal?.aborted) throw new Error("Abgebrochen.");

    let outputBuffer: Buffer;
    let outputMime = "image/png";
    let outputExt: string = target;
    const quality = typeof options.quality === "number" ? options.quality : 90;

    switch (target) {
      case "png": {
        outputBuffer = await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
        outputMime = "image/png"; outputExt = "png"; break;
      }
      case "jpg": case "jpeg": {
        outputBuffer = await sharpInstance
          .flatten({ background: options.backgroundColor || "#ffffff" })
          .jpeg({ quality, mozjpeg: true }).toBuffer();
        outputMime = "image/jpeg"; outputExt = "jpg"; break;
      }
      case "webp": {
        outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
        outputMime = "image/webp"; outputExt = "webp"; break;
      }
      case "gif": {
        outputBuffer = await sharpInstance.gif().toBuffer();
        outputMime = "image/gif"; outputExt = "gif"; break;
      }
      case "avif": {
        outputBuffer = await sharpInstance.avif({ quality }).toBuffer();
        outputMime = "image/avif"; outputExt = "avif"; break;
      }
      case "tiff": case "tif": {
        outputBuffer = await sharpInstance.tiff().toBuffer();
        outputMime = "image/tiff"; outputExt = "tiff"; break;
      }
      case "bmp": {
        const { data, info } = await sharpInstance.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const bmpModule = await import("bmp-js");
        const bmp = (bmpModule as any).default || bmpModule;
        const encoded = bmp.encode({ data, width: info.width, height: info.height });
        outputBuffer = encoded.data;
        outputMime = "image/bmp"; outputExt = "bmp"; break;
      }
      case "ico": {
        const pngForIco = await sharpInstance
          .resize(256, 256, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png().toBuffer();
        const pModule = await import("png-to-ico");
        const pngToIco = (pModule as any).default || pModule;
        outputBuffer = await pngToIco(pngForIco);
        outputMime = "image/x-icon"; outputExt = "ico"; break;
      }
      case "svg": {
        const intermediatePng = await sharpInstance.png().toBuffer();
        const potraceModule = await import("potrace");
        const potrace = (potraceModule as any).default || potraceModule;
        const svgString: string = await new Promise((resolve, reject) => {
          potrace.trace(intermediatePng, { threshold: 128, steps: 4 }, (err: Error | null, svg: string) => {
            if (err) reject(err); else resolve(svg);
          });
        });
        outputBuffer = Buffer.from(svgString, "utf-8");
        outputMime = "image/svg+xml"; outputExt = "svg"; break;
      }
      default: {
        outputBuffer = await sharpInstance.png().toBuffer();
        outputMime = "image/png"; outputExt = "png"; break;
      }
    }

    onProgress(100);
    return {
      data: outputBuffer,
      fileName: `${baseName}.${outputExt}`,
      mimeType: outputMime,
    };
  }

  private async _buildMinimalPsd(pngBuffer: Buffer): Promise<Buffer> {
    const meta = await sharp(pngBuffer).metadata();
    const w = meta.width || 1;
    const h = meta.height || 1;
    const rgbRaw = await sharp(pngBuffer).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer();

    const rPlane = Buffer.alloc(w * h);
    const gPlane = Buffer.alloc(w * h);
    const bPlane = Buffer.alloc(w * h);
    for (let i = 0; i < w * h; i++) {
      rPlane[i] = rgbRaw[i * 3];
      gPlane[i] = rgbRaw[i * 3 + 1];
      bPlane[i] = rgbRaw[i * 3 + 2];
    }

    const header = Buffer.alloc(26);
    header.write("8BPS", 0, "ascii");
    header.writeUInt16BE(1, 4);
    header.writeUInt16BE(3, 12);
    header.writeUInt32BE(h, 14);
    header.writeUInt32BE(w, 18);
    header.writeUInt16BE(8, 22);
    header.writeUInt16BE(3, 24);

    const colorModeLen = Buffer.alloc(4);
    const resourcesLen = Buffer.alloc(4);
    const layersLen = Buffer.alloc(4);
    const compression = Buffer.alloc(2);
    const imageData = Buffer.concat([rPlane, gPlane, bPlane]);

    return Buffer.concat([header, colorModeLen, resourcesLen, layersLen, compression, imageData]);
  }
}

export const imageService = new ImageService();
