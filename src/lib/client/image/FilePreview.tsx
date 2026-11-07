'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/** Formats browsers generally cannot show in an <img> tag. */
const NO_PREVIEW = new Set(['heic', 'heif', 'tif', 'tiff', 'psd', 'pdf', 'eps']);

interface FilePreviewProps {
  file: File;
  alt: string;
  className?: string;
}

function Fallback({ ext }: { ext: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-6 text-slate-400">
      <ImageIcon className="w-10 h-10" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase">{ext || 'Datei'}</span>
    </div>
  );
}

function PreviewImage({ file, alt, className, ext }: Required<FilePreviewProps> & { ext: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (failed) return <Fallback ext={ext} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imgRef} alt={alt} className={className} onError={() => setFailed(true)} />;
}

/** Thumbnail with automatic object-URL cleanup and an icon fallback. */
export function FilePreview({ file, alt, className = 'max-h-48 max-w-full object-contain rounded' }: FilePreviewProps) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (NO_PREVIEW.has(ext)) return <Fallback ext={ext} />;
  return (
    <PreviewImage
      key={`${file.name}_${file.size}_${file.lastModified}`}
      file={file}
      alt={alt}
      className={className}
      ext={ext}
    />
  );
}
