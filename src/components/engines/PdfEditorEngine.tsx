'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { 
  Type, 
  PenTool, 
  Highlighter, 
  Square, 
  Circle,
  ArrowRight,
  Minus,
  Check, 
  X as CrossIcon, 
  Calendar, 
  EyeOff, 
  Download, 
  Trash2, 
  Copy,
  ZoomIn, 
  ZoomOut, 
  Undo, 
  Redo, 
  RotateCw, 
  Layers, 
  FileText, 
  Image as ImageIcon,
  MousePointer,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type EditorTool = 
  | 'select'
  | 'text'
  | 'image'
  | 'draw'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'check'
  | 'cross'
  | 'signature'
  | 'initials'
  | 'date'
  | 'page-number'
  | 'whiteout';

export interface EditorObject {
  id: string;
  pageIndex: number;
  type: EditorTool;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text?: string;
  fontSize?: number;
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  points?: Array<{ x: number; y: number }>;
  imageData?: string;
}

export function PdfEditorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [objects, setObjects] = useState<EditorObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);

  // Multi-page state
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  const [pageDimensions, setPageDimensions] = useState<Array<{ width: number; height: number }>>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<EditorObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Properties panel state
  const [activeColor, setActiveColor] = useState<string>('#0f172a');
  const [activeFillColor, setActiveFillColor] = useState<string>('transparent');
  const [activeFontSize, setActiveFontSize] = useState<number>(16);
  const [activeFontFamily, setActiveFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [activeStrokeWidth, setActiveStrokeWidth] = useState<number>(2);
  const [activeOpacity, setActiveOpacity] = useState<number>(1);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);

  // Drag & Transform state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  // Signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [isSigningInitials, setIsSigningInitials] = useState<boolean>(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSignatureDrawing, setIsSignatureDrawing] = useState<boolean>(false);

  // Mobile drawer state
  const [showMobileProps, setShowMobileProps] = useState<boolean>(false);
  const [showMobilePages, setShowMobilePages] = useState<boolean>(false);

  // Canvas refs
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Save history state snapshot
  const pushHistory = useCallback((newObjects: EditorObject[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newObjects];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Load PDF and initialize pages
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setObjects([]);
    setSelectedId(null);
    setHistory([]);
    setHistoryIndex(-1);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setNumPages(count);
      setCurrentPage(0);

      const dims: Array<{ width: number; height: number }> = [];
      const rots: number[] = [];
      const order: number[] = [];

      for (let i = 0; i < count; i++) {
        const p = pdf.getPage(i);
        const { width, height } = p.getSize();
        dims.push({ width, height });
        rots.push(p.getRotation().angle || 0);
        order.push(i);
      }

      setPageDimensions(dims);
      setPageRotations(rots);
      setPageOrder(order);

      trackEvent('upload_completed', { toolSlug: 'pdf-bearbeiten', pageCount: count });
    } catch (err) {
      console.error('Failed to load PDF in editor:', err);
    }
  };

  // Render current PDF page using pdfjs-dist
  useEffect(() => {
    if (!file || pageDimensions.length === 0) return;

    let isMounted = true;

    async function renderPdfPage() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        const buffer = await file!.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;

        const actualPageIndex = pageOrder[currentPage] ?? currentPage;
        const page = await pdf.getPage(actualPageIndex + 1);

        const scale = (zoom / 100) * 1.5; // High-res rendering factor
        const rotation = pageRotations[actualPageIndex] || 0;
        const viewport = page.getViewport({ scale, rotation });

        const canvas = pdfCanvasRef.current;
        if (!canvas || !isMounted) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error('Error rendering PDF page in canvas:', err);
      }
    }

    renderPdfPage();

    return () => {
      isMounted = false;
    };
  }, [file, currentPage, zoom, pageRotations, pageOrder, pageDimensions]);

  // Current page dimensions
  const activePageIdx = pageOrder[currentPage] ?? 0;
  const currentDim = pageDimensions[activePageIdx] || { width: 595.28, height: 841.89 };
  const currentRot = pageRotations[activePageIdx] || 0;
  const isLandscape = (currentRot === 90 || currentRot === 270);
  const visualWidth = isLandscape ? currentDim.height : currentDim.width;
  const visualHeight = isLandscape ? currentDim.width : currentDim.height;
  const scale = zoom / 100;

  // -------------------------------------------------------------------------
  // Interaction Handlers (Click, Drag, Transform)
  // -------------------------------------------------------------------------
  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
      return;
    }

    if (activeTool === 'select') {
      // If clicking blank space, deselect
      if ((e.target as HTMLElement) === overlayRef.current) {
        setSelectedId(null);
      }
      return;
    }

    // Creating a new object
    const newId = `obj_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    let newObj: EditorObject | null = null;

    switch (activeTool) {
      case 'text':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'text',
          x,
          y,
          width: 200,
          height: activeFontSize * 1.5,
          rotation: 0,
          text: 'Hier Text eingeben',
          fontSize: activeFontSize,
          fontFamily: activeFontFamily,
          color: activeColor,
        };
        break;

      case 'highlight':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'highlight',
          x,
          y,
          width: 180,
          height: 22,
          rotation: 0,
          color: '#facc15',
          opacity: 0.4,
        };
        break;

      case 'underline':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'underline',
          x,
          y,
          width: 160,
          height: 3,
          rotation: 0,
          color: activeColor,
          strokeWidth: 2,
        };
        break;

      case 'strikethrough':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'strikethrough',
          x,
          y,
          width: 160,
          height: 3,
          rotation: 0,
          color: '#dc2626',
          strokeWidth: 2,
        };
        break;

      case 'rectangle':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'rectangle',
          x,
          y,
          width: 140,
          height: 80,
          rotation: 0,
          color: activeColor,
          fillColor: activeFillColor === 'transparent' ? undefined : activeFillColor,
          strokeWidth: activeStrokeWidth,
          opacity: activeOpacity,
        };
        break;

      case 'circle':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'circle',
          x,
          y,
          width: 100,
          height: 100,
          rotation: 0,
          color: activeColor,
          fillColor: activeFillColor === 'transparent' ? undefined : activeFillColor,
          strokeWidth: activeStrokeWidth,
          opacity: activeOpacity,
        };
        break;

      case 'line':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'line',
          x,
          y,
          width: 160,
          height: 4,
          rotation: 0,
          color: activeColor,
          strokeWidth: activeStrokeWidth,
        };
        break;

      case 'arrow':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'arrow',
          x,
          y,
          width: 160,
          height: 20,
          rotation: 0,
          color: activeColor,
          strokeWidth: activeStrokeWidth,
        };
        break;

      case 'check':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'check',
          x,
          y,
          width: 32,
          height: 32,
          rotation: 0,
          text: '✓',
          fontSize: 28,
          color: '#16a34a',
        };
        break;

      case 'cross':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'cross',
          x,
          y,
          width: 32,
          height: 32,
          rotation: 0,
          text: '✗',
          fontSize: 28,
          color: '#dc2626',
        };
        break;

      case 'date':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'date',
          x,
          y,
          width: 120,
          height: 24,
          rotation: 0,
          text: new Date().toLocaleDateString('de-DE'),
          fontSize: 14,
          color: activeColor,
        };
        break;

      case 'page-number':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'page-number',
          x,
          y,
          width: 120,
          height: 20,
          rotation: 0,
          text: `Seite ${currentPage + 1} von ${numPages}`,
          fontSize: 12,
          color: '#64748b',
        };
        break;

      case 'whiteout':
        newObj = {
          id: newId,
          pageIndex: activePageIdx,
          type: 'whiteout',
          x,
          y,
          width: 150,
          height: 25,
          rotation: 0,
          color: '#ffffff',
          fillColor: '#ffffff',
          opacity: 1,
        };
        break;

      default:
        break;
    }

    if (newObj) {
      const updated = [...objects, newObj];
      setObjects(updated);
      pushHistory(updated);
      setSelectedId(newId);
      setActiveTool('select');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (isDrawing) {
      setCurrentPath((prev) => [...prev, { x, y }]);
      return;
    }

    if (!selectedId) return;

    if (isDragging) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== selectedId) return obj;
          return {
            ...obj,
            x: Math.max(0, Math.min(visualWidth - 20, obj.x + dx)),
            y: Math.max(0, Math.min(visualHeight - 20, obj.y + dy)),
          };
        })
      );
      setDragStart({ x, y });
    } else if (activeHandle) {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== selectedId) return obj;
          let { x: ox, y: oy, width: ow, height: oh } = obj;

          if (activeHandle.includes('e')) ow = Math.max(20, x - ox);
          if (activeHandle.includes('s')) oh = Math.max(10, y - oy);
          if (activeHandle.includes('w')) {
            const nw = Math.max(20, ox + ow - x);
            ox += ow - nw;
            ow = nw;
          }
          if (activeHandle.includes('n')) {
            const nh = Math.max(10, oy + oh - y);
            oy += oh - nh;
            oh = nh;
          }

          return { ...obj, x: ox, y: oy, width: ow, height: oh };
        })
      );
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && currentPath.length > 1) {
      const newId = `draw_${Date.now()}`;
      const minX = Math.min(...currentPath.map((p) => p.x));
      const minY = Math.min(...currentPath.map((p) => p.y));
      const maxX = Math.max(...currentPath.map((p) => p.x));
      const maxY = Math.max(...currentPath.map((p) => p.y));

      const newObj: EditorObject = {
        id: newId,
        pageIndex: activePageIdx,
        type: 'draw',
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 10),
        height: Math.max(maxY - minY, 10),
        rotation: 0,
        color: activeColor,
        strokeWidth: activeStrokeWidth,
        points: currentPath,
      };

      const updated = [...objects, newObj];
      setObjects(updated);
      pushHistory(updated);
      setSelectedId(newId);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setIsDragging(false);
    setActiveHandle(null);
  };

  // Image insertion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 200;
        const aspect = img.width / img.height;
        const newObj: EditorObject = {
          id: `img_${Date.now()}`,
          pageIndex: activePageIdx,
          type: 'image',
          x: 50,
          y: 50,
          width: maxWidth,
          height: maxWidth / aspect,
          rotation: 0,
          imageData: dataUrl,
        };

        const updated = [...objects, newObj];
        setObjects(updated);
        pushHistory(updated);
        setSelectedId(newObj.id);
        setActiveTool('select');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Signature canvas handlers
  const handleSignaturePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsSignatureDrawing(true);
  };

  const handleSignaturePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSignatureDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const newObj: EditorObject = {
      id: `sig_${Date.now()}`,
      pageIndex: activePageIdx,
      type: isSigningInitials ? 'initials' : 'signature',
      x: 100,
      y: 200,
      width: isSigningInitials ? 80 : 160,
      height: isSigningInitials ? 50 : 70,
      rotation: 0,
      imageData: dataUrl,
    };

    const updated = [...objects, newObj];
    setObjects(updated);
    pushHistory(updated);
    setSelectedId(newObj.id);
    setShowSignatureModal(false);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setObjects(prev);
      setHistoryIndex(historyIndex - 1);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setObjects(next);
      setHistoryIndex(historyIndex + 1);
      setSelectedId(null);
    }
  };

  // Duplicate & Delete
  const duplicateSelected = () => {
    if (!selectedId) return;
    const selected = objects.find((o) => o.id === selectedId);
    if (!selected) return;

    const duplicated: EditorObject = {
      ...selected,
      id: `obj_${Date.now()}_dup`,
      x: selected.x + 20,
      y: selected.y + 20,
    };

    const updated = [...objects, duplicated];
    setObjects(updated);
    pushHistory(updated);
    setSelectedId(duplicated.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const updated = objects.filter((o) => o.id !== selectedId);
    setObjects(updated);
    pushHistory(updated);
    setSelectedId(null);
  };

  // Rotate Page
  const rotateCurrentPage = () => {
    setPageRotations((prev) => {
      const copy = [...prev];
      copy[activePageIdx] = ((copy[activePageIdx] || 0) + 90) % 360;
      return copy;
    });
  };

  // Page reordering
  const movePage = (direction: 'up' | 'down') => {
    const target = direction === 'up' ? currentPage - 1 : currentPage + 1;
    if (target < 0 || target >= numPages) return;
    const newOrder = [...pageOrder];
    const temp = newOrder[currentPage];
    newOrder[currentPage] = newOrder[target];
    newOrder[target] = temp;
    setPageOrder(newOrder);
    setCurrentPage(target);
  };

  // Selected Object
  const selectedObject = objects.find((o) => o.id === selectedId);

  const updateSelected = (updates: Partial<EditorObject>) => {
    if (!selectedId) return;
    setObjects((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, ...updates } : o))
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) deleteSelected();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // -------------------------------------------------------------------------
  // Reliable PDF Export Engine (pdf-lib)
  // -------------------------------------------------------------------------
  const exportEditedPdf = async () => {
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const outDoc = await PDFDocument.create();

      // Copy pages in user-defined pageOrder
      const copiedPages = await outDoc.copyPages(srcDoc, pageOrder);

      const fontHelvetica = await outDoc.embedFont(StandardFonts.Helvetica);
      const fontHelveticaBold = await outDoc.embedFont(StandardFonts.HelveticaBold);
      const fontTimes = await outDoc.embedFont(StandardFonts.TimesRoman);
      const fontCourier = await outDoc.embedFont(StandardFonts.Courier);

      for (let i = 0; i < copiedPages.length; i++) {
        const page = copiedPages[i];
        const originalPageIndex = pageOrder[i];
        const rotationAngle = pageRotations[originalPageIndex] || 0;
        page.setRotation(degrees(rotationAngle));

        const { width: pWidth, height: pHeight } = page.getSize();
        const isRotated = rotationAngle === 90 || rotationAngle === 270;
        const effectiveHeight = isRotated ? pWidth : pHeight;

        // Retrieve annotations on this page
        const pageObjects = objects.filter((o) => o.pageIndex === originalPageIndex);

        for (const obj of pageObjects) {
          // Coordinate mapping from screen Y (0 at top) to PDF Y (0 at bottom)
          const pdfY = effectiveHeight - obj.y;

          // Parse RGB colors
          const hexToRgb = (hex?: string) => {
            if (!hex || !hex.startsWith('#')) return rgb(0.1, 0.1, 0.1);
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return rgb(r, g, b);
          };

          const strokeColor = hexToRgb(obj.color);
          const fillColor = obj.fillColor ? hexToRgb(obj.fillColor) : undefined;

          // Text Family selector
          let selectedFont = fontHelvetica;
          if (obj.fontFamily === 'TimesRoman') selectedFont = fontTimes;
          if (obj.fontFamily === 'Courier') selectedFont = fontCourier;

          switch (obj.type) {
            case 'text':
            case 'date':
            case 'page-number': {
              if (!obj.text) break;
              page.drawText(obj.text, {
                x: obj.x,
                y: pdfY - (obj.fontSize || 14),
                size: obj.fontSize || 14,
                font: selectedFont,
                color: strokeColor,
                opacity: obj.opacity ?? 1,
              });
              break;
            }

            case 'check': {
              const sz = (obj.fontSize || 24) * 0.7;
              page.drawLine({
                start: { x: obj.x, y: pdfY - sz * 0.5 },
                end: { x: obj.x + sz * 0.35, y: pdfY - sz * 0.9 },
                thickness: (obj.strokeWidth || 2) * 1.2,
                color: strokeColor,
              });
              page.drawLine({
                start: { x: obj.x + sz * 0.35, y: pdfY - sz * 0.9 },
                end: { x: obj.x + sz * 0.9, y: pdfY - sz * 0.1 },
                thickness: (obj.strokeWidth || 2) * 1.2,
                color: strokeColor,
              });
              break;
            }

            case 'cross': {
              const sz = (obj.fontSize || 24) * 0.6;
              page.drawLine({
                start: { x: obj.x, y: pdfY - sz },
                end: { x: obj.x + sz, y: pdfY },
                thickness: (obj.strokeWidth || 2) * 1.2,
                color: strokeColor,
              });
              page.drawLine({
                start: { x: obj.x, y: pdfY },
                end: { x: obj.x + sz, y: pdfY - sz },
                thickness: (obj.strokeWidth || 2) * 1.2,
                color: strokeColor,
              });
              break;
            }

            case 'highlight': {
              page.drawRectangle({
                x: obj.x,
                y: pdfY - obj.height,
                width: obj.width,
                height: obj.height,
                color: strokeColor,
                opacity: obj.opacity ?? 0.35,
              });
              break;
            }

            case 'whiteout': {
              page.drawRectangle({
                x: obj.x,
                y: pdfY - obj.height,
                width: obj.width,
                height: obj.height,
                color: rgb(1, 1, 1),
                opacity: 1,
              });
              break;
            }

            case 'rectangle': {
              page.drawRectangle({
                x: obj.x,
                y: pdfY - obj.height,
                width: obj.width,
                height: obj.height,
                borderColor: strokeColor,
                borderWidth: obj.strokeWidth || 1,
                color: fillColor,
                opacity: obj.opacity ?? 1,
              });
              break;
            }

            case 'circle': {
              const rx = obj.width / 2;
              const ry = obj.height / 2;
              page.drawEllipse({
                x: obj.x + rx,
                y: pdfY - ry,
                xScale: rx,
                yScale: ry,
                borderColor: strokeColor,
                borderWidth: obj.strokeWidth || 1,
                color: fillColor,
                opacity: obj.opacity ?? 1,
              });
              break;
            }

            case 'line':
            case 'underline':
            case 'strikethrough': {
              page.drawLine({
                start: { x: obj.x, y: pdfY },
                end: { x: obj.x + obj.width, y: pdfY },
                thickness: obj.strokeWidth || 2,
                color: strokeColor,
                opacity: obj.opacity ?? 1,
              });
              break;
            }

            case 'arrow': {
              const startX = obj.x;
              const endX = obj.x + obj.width;
              page.drawLine({
                start: { x: startX, y: pdfY },
                end: { x: endX, y: pdfY },
                thickness: obj.strokeWidth || 2,
                color: strokeColor,
                opacity: obj.opacity ?? 1,
              });
              // Arrowhead
              page.drawLine({
                start: { x: endX - 8, y: pdfY + 5 },
                end: { x: endX, y: pdfY },
                thickness: obj.strokeWidth || 2,
                color: strokeColor,
              });
              page.drawLine({
                start: { x: endX - 8, y: pdfY - 5 },
                end: { x: endX, y: pdfY },
                thickness: obj.strokeWidth || 2,
                color: strokeColor,
              });
              break;
            }

            case 'image':
            case 'signature':
            case 'initials': {
              if (!obj.imageData) break;
              try {
                const base64Data = obj.imageData.split(',')[1];
                const imgBuffer = Buffer.from(base64Data, 'base64');
                const isPng = obj.imageData.startsWith('data:image/png');
                const embedded = isPng 
                  ? await outDoc.embedPng(imgBuffer) 
                  : await outDoc.embedJpg(imgBuffer);

                page.drawImage(embedded, {
                  x: obj.x,
                  y: pdfY - obj.height,
                  width: obj.width,
                  height: obj.height,
                  opacity: obj.opacity ?? 1,
                });
              } catch (err) {
                console.error('Failed to embed image:', err);
              }
              break;
            }

            case 'draw': {
              if (obj.points && obj.points.length > 1) {
                for (let p = 0; p < obj.points.length - 1; p++) {
                  const pt1 = obj.points[p];
                  const pt2 = obj.points[p + 1];
                  page.drawLine({
                    start: { x: pt1.x, y: effectiveHeight - pt1.y },
                    end: { x: pt2.x, y: effectiveHeight - pt2.y },
                    thickness: obj.strokeWidth || 2,
                    color: strokeColor,
                    opacity: obj.opacity ?? 1,
                  });
                }
              }
              break;
            }
          }
        }

        outDoc.addPage(page);
      }

      const exportedBytes = await outDoc.save();
      const blob = new Blob([exportedBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `coolwave_bearbeitet_${file.name}`);
      trackEvent('conversion_completed', { toolSlug: 'pdf-bearbeiten', count: objects.length });
    } catch (err) {
      console.error('Export error:', err);
      alert('Fehler beim Exportieren des PDFs.');
    }
  };

  // Reset editor
  const handleReset = () => {
    setFile(null);
    setObjects([]);
    setSelectedId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Upload Screen */}
      {!file && (
        <div className="max-w-4xl mx-auto">
          <FileUploader
            acceptedExtensions={['.pdf']}
            maxFileSizeMB={50}
            allowMultiple={false}
            onFilesSelected={handleFileSelected}
            title="PDF-Dokument hier ablegen oder auswählen"
            subtitle="100% Clientseitig im Browser • Text, Formen, Zeichnungen & Signaturen hinzufügen"
          />
        </div>
      )}

      {/* Editor Main Interface */}
      {file && (
        <div className="flex flex-col bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[750px]">
          {/* Top Global Bar */}
          <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
              >
                Neue Datei
              </button>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </span>
              <span className="hidden md:inline-block text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                {formatBytes(file.size)}
              </span>
            </div>

            {/* Middle Zoom & Undo Controls */}
            <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="Ansichts- und Verlaufswerkzeuge">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Rückgängig (Strg+Z)"
                aria-label="Rückgängig (Strg+Z)"
              >
                <Undo className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Wiederholen (Strg+Y)"
                aria-label="Wiederholen (Strg+Y)"
              >
                <Redo className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" aria-hidden="true" />

              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Verkleinern"
                aria-label="Verkleinern"
              >
                <ZoomOut className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 min-w-[45px] text-center" aria-live="polite">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Vergrößern"
                aria-label="Vergrößern"
              >
                <ZoomIn className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Export Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileProps(!showMobileProps)}
                className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Eigenschaften"
                aria-label="Eigenschaften einblenden"
              >
                <Sliders className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={exportEditedPdf}
                aria-label="Bearbeitetes PDF exportieren und herunterladen"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Exportieren</span>
              </button>
            </div>
          </div>

          {/* Distinction Banner */}
          <div className="bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40 px-4 py-1.5 text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>
              <strong>Bearbeitung mit Ebenen:</strong> Text, Formen und Zeichnungen werden als Vektor- und Textebenen ueber das Original gelegt. Abdecken entfernt keinen Text. Fuer vertrauliche Inhalte verwenden Sie das separate Werkzeug PDF schwaerzen.
            </span>
          </div>

          {/* 3-Panel Main Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
            {/* LEFT TOOL PANEL */}
            <div 
              role="toolbar" 
              aria-label="PDF-Editor Werkzeugleiste"
              className="w-full lg:w-16 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex lg:flex-col items-center justify-start py-2 lg:py-4 px-2 gap-1.5 overflow-x-auto lg:overflow-y-auto shrink-0 z-10"
            >
              <button
                onClick={() => setActiveTool('select')}
                aria-label="Auswählen und verschieben"
                aria-pressed={activeTool === 'select'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'select' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Auswählen / Verschieben"
              >
                <MousePointer className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('text')}
                aria-label="Text hinzufügen"
                aria-pressed={activeTool === 'text'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'text' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Text hinzufügen"
              >
                <Type className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('draw')}
                aria-label="Freihand zeichnen"
                aria-pressed={activeTool === 'draw'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'draw' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Freihand zeichnen"
              >
                <PenTool className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('highlight')}
                aria-label="Text markieren"
                aria-pressed={activeTool === 'highlight'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'highlight' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Text markieren"
              >
                <Highlighter className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('whiteout')}
                aria-label="Optisch abdecken (Text bleibt erhalten)"
                aria-pressed={activeTool === 'whiteout'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'whiteout' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Optisch abdecken – keine sichere Schwaerzung"
              >
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 my-1 hidden lg:block" aria-hidden="true" />

              <button
                onClick={() => setActiveTool('rectangle')}
                aria-label="Rechteck zeichnen"
                aria-pressed={activeTool === 'rectangle'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'rectangle' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Rechteck"
              >
                <Square className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('circle')}
                aria-label="Kreis oder Ellipse zeichnen"
                aria-pressed={activeTool === 'circle'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'circle' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Kreis / Ellipse"
              >
                <Circle className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('line')}
                aria-label="Gerade Linie zeichnen"
                aria-pressed={activeTool === 'line'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'line' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Linie"
              >
                <Minus className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('arrow')}
                aria-label="Pfeil zeichnen"
                aria-pressed={activeTool === 'arrow'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'arrow' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Pfeil"
              >
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 my-1 hidden lg:block" aria-hidden="true" />

              <button
                onClick={() => {
                  setIsSigningInitials(false);
                  setShowSignatureModal(true);
                }}
                aria-label="Unterschrift einfügen"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Unterschrift einfügen"
              >
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </button>

              <button
                onClick={() => imageInputRef.current?.click()}
                aria-label="Bild in PDF einfügen"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Bild einfügen"
              >
                <ImageIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />

              <button
                onClick={() => setActiveTool('date')}
                aria-label="Aktuelles Datum einfügen"
                aria-pressed={activeTool === 'date'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'date' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Datum einfügen"
              >
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('check')}
                aria-label="Häkchen einfügen"
                aria-pressed={activeTool === 'check'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'check' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Häkchen (✓)"
              >
                <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              </button>

              <button
                onClick={() => setActiveTool('cross')}
                aria-label="Kreuz einfügen"
                aria-pressed={activeTool === 'cross'}
                className={`p-2.5 rounded-xl transition cursor-pointer ${activeTool === 'cross' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Kreuz (✗)"
              >
                <CrossIcon className="w-5 h-5 text-red-600" aria-hidden="true" />
              </button>

              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 my-1 hidden lg:block" aria-hidden="true" />

              <button
                onClick={() => setShowMobilePages(!showMobilePages)}
                aria-label="Seitenübersicht umschalten"
                aria-expanded={showMobilePages}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Seitenübersicht"
              >
                <Layers className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* CENTER VIEWPORT CANVAS */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950">
              <div 
                className="relative bg-white shadow-2xl transition-all"
                style={{
                  width: visualWidth * scale,
                  height: visualHeight * scale,
                }}
              >
                {/* Underlying Rendered PDF Page */}
                <canvas
                  ref={pdfCanvasRef}
                  className="absolute inset-0 pointer-events-none w-full h-full"
                />

                {/* Interactive Annotation Overlay */}
                <div
                  ref={overlayRef}
                  onPointerDown={handleOverlayPointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="absolute inset-0 select-none cursor-crosshair"
                  style={{
                    cursor: activeTool === 'select' ? 'default' : 'crosshair',
                  }}
                >
                  {/* Current Active Freehand Path */}
                  {isDrawing && currentPath.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polyline
                        points={currentPath.map((p) => `${p.x * scale},${p.y * scale}`).join(' ')}
                        fill="none"
                        stroke={activeColor}
                        strokeWidth={activeStrokeWidth * scale}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  {/* Render Objects for Current Page */}
                  {objects
                    .filter((obj) => obj.pageIndex === activePageIdx)
                    .map((obj) => {
                      const isSelected = obj.id === selectedId;

                      return (
                        <div
                          key={obj.id}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedId(obj.id);
                            if (activeTool === 'select') {
                              setIsDragging(true);
                              const rect = overlayRef.current?.getBoundingClientRect();
                              if (rect) {
                                setDragStart({
                                  x: (e.clientX - rect.left) / scale,
                                  y: (e.clientY - rect.top) / scale,
                                });
                              }
                            }
                          }}
                          className={`absolute ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-30' : 'z-10'}`}
                          style={{
                            left: obj.x * scale,
                            top: obj.y * scale,
                            width: obj.width * scale,
                            height: obj.height * scale,
                            transform: `rotate(${obj.rotation}deg)`,
                            opacity: obj.opacity ?? 1,
                            cursor: activeTool === 'select' ? 'move' : 'default',
                          }}
                        >
                          {/* Render Object Body */}
                          {obj.type === 'text' && (
                            <div
                              contentEditable={isSelected}
                              suppressContentEditableWarning
                              onBlur={(e) => updateSelected({ text: e.currentTarget.textContent || '' })}
                              style={{
                                color: obj.color,
                                fontSize: (obj.fontSize || 16) * scale,
                                fontFamily: obj.fontFamily || 'Helvetica',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                              className="w-full h-full outline-none select-text"
                            >
                              {obj.text}
                            </div>
                          )}

                          {obj.type === 'date' && (
                            <div
                              style={{
                                color: obj.color,
                                fontSize: (obj.fontSize || 14) * scale,
                              }}
                              className="font-medium"
                            >
                              {obj.text}
                            </div>
                          )}

                          {obj.type === 'page-number' && (
                            <div
                              style={{
                                color: obj.color,
                                fontSize: (obj.fontSize || 12) * scale,
                              }}
                              className="font-medium text-slate-500"
                            >
                              {obj.text}
                            </div>
                          )}

                          {obj.type === 'check' && (
                            <div
                              style={{
                                color: obj.color || '#16a34a',
                                fontSize: (obj.fontSize || 28) * scale,
                              }}
                              className="font-bold select-none leading-none"
                            >
                              ✓
                            </div>
                          )}

                          {obj.type === 'cross' && (
                            <div
                              style={{
                                color: obj.color || '#dc2626',
                                fontSize: (obj.fontSize || 28) * scale,
                              }}
                              className="font-bold select-none leading-none"
                            >
                              ✗
                            </div>
                          )}

                          {obj.type === 'highlight' && (
                            <div
                              style={{
                                backgroundColor: obj.color || '#facc15',
                                opacity: obj.opacity ?? 0.4,
                              }}
                              className="w-full h-full rounded"
                            />
                          )}

                          {obj.type === 'whiteout' && (
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                              }}
                              className="w-full h-full border border-slate-200/50"
                            />
                          )}

                          {obj.type === 'rectangle' && (
                            <div
                              style={{
                                borderColor: obj.color || '#0f172a',
                                borderWidth: (obj.strokeWidth || 2) * scale,
                                backgroundColor: obj.fillColor || 'transparent',
                              }}
                              className="w-full h-full border rounded-sm"
                            />
                          )}

                          {obj.type === 'circle' && (
                            <div
                              style={{
                                borderColor: obj.color || '#0f172a',
                                borderWidth: (obj.strokeWidth || 2) * scale,
                                backgroundColor: obj.fillColor || 'transparent',
                              }}
                              className="w-full h-full border rounded-full"
                            />
                          )}

                          {obj.type === 'line' && (
                            <div
                              style={{
                                backgroundColor: obj.color || '#0f172a',
                                height: (obj.strokeWidth || 2) * scale,
                              }}
                              className="w-full mt-[calc(50%-1px)]"
                            />
                          )}

                          {obj.type === 'arrow' && (
                            <div className="w-full h-full flex items-center">
                              <div
                                style={{
                                  backgroundColor: obj.color || '#0f172a',
                                  height: (obj.strokeWidth || 2) * scale,
                                }}
                                className="flex-1"
                              />
                              <div
                                style={{
                                  borderColor: `transparent transparent transparent ${obj.color || '#0f172a'}`,
                                  borderWidth: `${6 * scale}px 0 ${6 * scale}px ${10 * scale}px`,
                                }}
                                className="w-0 h-0 border-solid"
                              />
                            </div>
                          )}

                          {(obj.type === 'image' || obj.type === 'signature' || obj.type === 'initials') && obj.imageData && (
                            <img
                              src={obj.imageData}
                              alt="Inserted element"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          )}

                          {obj.type === 'draw' && obj.points && (
                            <svg className="w-full h-full overflow-visible pointer-events-none">
                              <polyline
                                points={obj.points.map((p) => `${(p.x - obj.x) * scale},${(p.y - obj.y) * scale}`).join(' ')}
                                fill="none"
                                stroke={obj.color || '#0f172a'}
                                strokeWidth={(obj.strokeWidth || 2) * scale}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}

                          {/* 8-Point Resize Handles (Active when selected) */}
                          {isSelected && activeTool === 'select' && (
                            <>
                              <div
                                onPointerDown={(e) => { e.stopPropagation(); setActiveHandle('nw'); }}
                                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-40"
                              />
                              <div
                                onPointerDown={(e) => { e.stopPropagation(); setActiveHandle('ne'); }}
                                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-40"
                              />
                              <div
                                onPointerDown={(e) => { e.stopPropagation(); setActiveHandle('se'); }}
                                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-40"
                              />
                              <div
                                onPointerDown={(e) => { e.stopPropagation(); setActiveHandle('sw'); }}
                                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-40"
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* RIGHT PROPERTIES PANEL (Desktop & Mobile Drawer) */}
            <div
              className={`w-full lg:w-72 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 z-20 ${showMobileProps ? 'block' : 'hidden lg:flex'}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {selectedObject ? 'Objekt bearbeiten' : 'Werkzeug-Optionen'}
                </h4>
                {selectedObject && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={duplicateSelected}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                      title="Duplizieren (Strg+D)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="p-1 text-red-500 hover:text-red-700 rounded"
                      title="Löschen (Entf)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Security Distinction: Whiteout Overlay vs. True Redaction */}
              {(activeTool === 'whiteout' || selectedObject?.type === 'whiteout') && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Optische Überdeckung (Cover)</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-300 leading-relaxed">
                    Dieses Werkzeug legt ein weißes Rechteck über den Bereich. Der darunterliegende Text bleibt im PDF-Quellcode erhalten und kann kopiert oder extrahiert werden.
                  </p>
                  <a
                    href="/de/pdf-schwaerzen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline pt-0.5"
                  >
                    <span>Für DSGVO-sichere echte Schwärzung hier klicken &rarr;</span>
                  </a>
                </div>
              )}

              {/* Color Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
                  Farbe
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#0f172a', '#dc2626', '#16a34a', '#2563eb', '#facc15', '#9333ea', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setActiveColor(c);
                        if (selectedObject) updateSelected({ color: c });
                      }}
                      className={`w-6 h-6 rounded-full border border-slate-300 shadow-sm transition ${activeColor === c ? 'scale-110 ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => {
                      setActiveColor(e.target.value);
                      if (selectedObject) updateSelected({ color: e.target.value });
                    }}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              {/* Typography for text objects */}
              {(!selectedObject || selectedObject.type === 'text') && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Schriftart
                    </label>
                    <select
                      value={selectedObject?.fontFamily || activeFontFamily}
                      onChange={(e) => {
                        const fam = e.target.value as 'Helvetica' | 'TimesRoman' | 'Courier';
                        setActiveFontFamily(fam);
                        if (selectedObject) updateSelected({ fontFamily: fam });
                      }}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-white"
                    >
                      <option value="Helvetica">Helvetica (Standard)</option>
                      <option value="TimesRoman">Times New Roman (Serif)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Schriftgröße ({selectedObject?.fontSize || activeFontSize}px)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={selectedObject?.fontSize || activeFontSize}
                      onChange={(e) => {
                        const size = parseInt(e.target.value, 10);
                        setActiveFontSize(size);
                        if (selectedObject) updateSelected({ fontSize: size });
                      }}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Stroke width for shapes / pen */}
              {(!selectedObject || ['draw', 'rectangle', 'circle', 'line', 'arrow'].includes(selectedObject.type)) && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Linienstärke ({selectedObject?.strokeWidth || activeStrokeWidth}px)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={selectedObject?.strokeWidth || activeStrokeWidth}
                    onChange={(e) => {
                      const w = parseInt(e.target.value, 10);
                      setActiveStrokeWidth(w);
                      if (selectedObject) updateSelected({ strokeWidth: w });
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}

              {/* Opacity */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Deckkraft ({Math.round((selectedObject?.opacity ?? activeOpacity) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedObject?.opacity ?? activeOpacity}
                  onChange={(e) => {
                    const op = parseFloat(e.target.value);
                    setActiveOpacity(op);
                    if (selectedObject) updateSelected({ opacity: op });
                  }}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Rotation */}
              {selectedObject && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Drehung ({selectedObject.rotation}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedObject.rotation}
                    onChange={(e) => updateSelected({ rotation: parseInt(e.target.value, 10) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}

              {/* Page Controls & Navigation */}
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Seite {currentPage + 1} von {numPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="p-1 rounded text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(numPages - 1, p + 1))}
                      disabled={currentPage === numPages - 1}
                      className="p-1 rounded text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={rotateCurrentPage}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Seite drehen</span>
                  </button>
                  <button
                    onClick={() => movePage('up')}
                    disabled={currentPage === 0}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition"
                  >
                    <span>Nach oben</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Quick Mobile Dock */}
          <div className="lg:hidden h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-20">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-lg ${activeTool === 'select' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <MousePointer className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTool('text')}
              className={`p-2 rounded-lg ${activeTool === 'text' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTool('draw')}
              className={`p-2 rounded-lg ${activeTool === 'draw' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTool('highlight')}
              className={`p-2 rounded-lg ${activeTool === 'highlight' ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Highlighter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSignatureModal(true)}
              className="p-2 rounded-lg text-indigo-600"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMobileProps(!showMobileProps)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Signature & Initials Drawing Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {isSigningInitials ? 'Initialen zeichnen' : 'Digitale Unterschrift zeichnen'}
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <CrossIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 p-1 mb-4 flex items-center justify-center">
              <canvas
                ref={signatureCanvasRef}
                width={440}
                height={180}
                onPointerDown={handleSignaturePointerDown}
                onPointerMove={handleSignaturePointerMove}
                onPointerUp={() => setIsSignatureDrawing(false)}
                className="w-full h-44 cursor-crosshair bg-white dark:bg-slate-900 rounded-lg shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={clearSignature}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              >
                Löschen
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-xl transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveSignature}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Einfügen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
