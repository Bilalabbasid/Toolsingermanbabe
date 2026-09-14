'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { openCookiePreferencesModal } from './CookieBanner';

interface CookiePreferencesButtonProps {
  className?: string;
  variant?: 'button' | 'link';
  label?: string;
}

export function CookiePreferencesButton({
  className = '',
  variant = 'button',
  label = 'Cookie-Einstellungen anpassen',
}: CookiePreferencesButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCookiePreferencesModal();
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        className={`text-left hover:text-white transition-colors cursor-pointer ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-sky-500/20 cursor-pointer ${className}`}
    >
      <Settings className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
