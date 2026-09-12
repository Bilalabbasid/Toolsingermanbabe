import React from 'react';

interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'content';
  className?: string;
}

export function AdSlot({ slotId, format = 'horizontal', className = '' }: AdSlotProps) {
  // Respect environment variable if ads are globally disabled or Pro user
  const isAdsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';

  if (!isAdsEnabled) {
    return null;
  }

  const heightClasses = {
    horizontal: 'h-24 sm:h-28 max-w-4xl',
    rectangle: 'h-64 max-w-sm',
    content: 'h-32 max-w-3xl',
  }[format];

  return (
    <div
      className={`mx-auto my-8 p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center text-xs text-slate-400 overflow-hidden ${heightClasses} ${className}`}
      aria-label="Werbeplatz"
    >
      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
        Anzeige
      </span>
      <div id={slotId || 'ad-slot-default'} className="w-full flex items-center justify-center">
        {/* Placeholder for Google AdSense / Ad Manager script tag */}
        <span className="text-slate-400">CoolWave Partner-Netzwerk</span>
      </div>
    </div>
  );
}
