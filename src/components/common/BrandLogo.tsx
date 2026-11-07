import React from 'react';

interface BrandMarkProps {
  className?: string;
}

/** Square brand mark: a document with a folded corner and a check – "files, handled safely". */
export function BrandMark({ className = 'w-8 h-8' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="dt-mark-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0c95e0" />
          <stop offset="1" stopColor="#035d92" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#dt-mark-bg)" />
      <path d="M11 7.5h7.2l4.8 4.8V23a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 9.5 23V9A1.5 1.5 0 0 1 11 7.5Z" fill="#fff" />
      <path d="M18.2 7.5v3.3a1.5 1.5 0 0 0 1.5 1.5H23" fill="#bae2fd" />
      <path d="m12.9 17.6 2.3 2.3 4.4-4.6" fill="none" stroke="#0273b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface BrandLogoProps {
  className?: string;
  /** Use light text colours on dark backgrounds (e.g. footer). */
  inverted?: boolean;
  showTagline?: boolean;
}

export function BrandLogo({ className = '', inverted = false, showTagline = false }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className="w-8 h-8 shrink-0 sm:w-9 sm:h-9" />
      <span className="flex flex-col leading-none">
        <span className={`text-[1.0625rem] sm:text-lg font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}>
          Datei<span className={inverted ? 'text-sky-300' : 'text-sky-600'}> Tools</span>
        </span>
        {showTagline && (
          <span className={`mt-1 hidden sm:block text-[10px] font-semibold uppercase tracking-[0.12em] ${inverted ? 'text-slate-400' : 'text-ink-subtle'}`}>
            100 % im Browser
          </span>
        )}
      </span>
    </span>
  );
}
