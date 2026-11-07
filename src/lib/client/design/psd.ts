/**
 * PSD reading/writing in the browser via ag-psd.
 */
import type { Layer, Psd } from 'ag-psd';
import { createCanvas, get2d, getImageData } from '@/lib/client/image/canvas';

async function loadAgPsd() {
  return import('ag-psd');
}

function isUniform(canvas: HTMLCanvasElement): boolean {
  const px = getImageData(canvas).data;
  const r = px[0], g = px[1], b = px[2], a = px[3];
  for (let i = 4; i < px.length; i += 4) {
    if (px[i] !== r || px[i + 1] !== g || px[i + 2] !== b || px[i + 3] !== a) return false;
  }
  return true;
}

const BLEND_MAP: Record<string, GlobalCompositeOperation> = {
  normal: 'source-over',
  'pass through': 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color dodge': 'color-dodge',
  'color burn': 'color-burn',
  'hard light': 'hard-light',
  'soft light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
};

function hasPixelLayers(layers: Layer[] | undefined): boolean {
  return !!layers?.some((l) => !l.hidden && (l.canvas || hasPixelLayers(l.children)));
}

/**
 * Simplified compositing of visible pixel layers (normal opacity + standard blend modes).
 * Layer effects, masks, adjustment layers and clipping are not rendered.
 */
function drawLayers(ctx: CanvasRenderingContext2D, layers: Layer[] | undefined, parentOpacity: number) {
  if (!layers) return;
  for (const layer of layers) {
    if (layer.hidden) continue;
    const opacity = parentOpacity * (layer.opacity ?? 1);
    if (layer.children) {
      drawLayers(ctx, layer.children, opacity);
      continue;
    }
    if (!layer.canvas || layer.clipping) continue;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = BLEND_MAP[layer.blendMode || 'normal'] || 'source-over';
    ctx.drawImage(layer.canvas, layer.left || 0, layer.top || 0);
    ctx.restore();
  }
}

export interface PsdReadResult {
  canvas: HTMLCanvasElement;
  /** true when the image was assembled from layers (no usable composite in the file) */
  composedFromLayers: boolean;
}

export async function readPsdComposite(file: File): Promise<PsdReadResult> {
  const { readPsd } = await loadAgPsd();
  const buffer = await file.arrayBuffer();
  let psd: Psd;
  try {
    psd = readPsd(buffer, { skipLayerImageData: true, skipThumbnail: true, skipLinkedFilesData: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/Color mode not supported/i.test(msg)) {
      throw new Error('Der Farbmodus dieser PSD-Datei (z. B. Lab, Mehrkanal oder Duplex) wird im Browser nicht unterstützt.');
    }
    if (/Invalid signature|Invalid version/i.test(msg)) {
      throw new Error('Dies ist keine gültige PSD-Datei.');
    }
    throw new Error('Die PSD-Datei konnte nicht gelesen werden. Sie ist möglicherweise beschädigt.');
  }

  const composite = psd.canvas;
  const layersPresent = (psd.children?.length ?? 0) > 0;
  if (composite && !(layersPresent && isUniform(composite))) {
    return { canvas: composite, composedFromLayers: false };
  }

  // No (or blank) composite image – e.g. saved without "Maximize compatibility".
  let layered: Psd;
  try {
    layered = readPsd(buffer, { skipCompositeImageData: true, skipThumbnail: true, skipLinkedFilesData: true });
  } catch {
    throw new Error('Die Ebenen der PSD-Datei konnten nicht gelesen werden.');
  }
  if (!hasPixelLayers(layered.children)) {
    if (composite) return { canvas: composite, composedFromLayers: false };
    throw new Error('Die PSD-Datei enthält kein zusammengesetztes Bild und keine lesbaren Pixelebenen.');
  }
  const canvas = createCanvas(psd.width, psd.height);
  drawLayers(get2d(canvas), layered.children, 1);
  return { canvas, composedFromLayers: true };
}

/** Writes a PSD with the image as one normal, editable pixel layer plus composite. */
export async function canvasToPsd(canvas: HTMLCanvasElement, layerName = 'Ebene 1'): Promise<Uint8Array> {
  const { writePsdUint8Array } = await loadAgPsd();
  const psd: Psd = {
    width: canvas.width,
    height: canvas.height,
    canvas,
    children: [{ name: layerName, top: 0, left: 0, canvas, opacity: 1, blendMode: 'normal' }],
  };
  return writePsdUint8Array(psd, { generateThumbnail: true });
}
