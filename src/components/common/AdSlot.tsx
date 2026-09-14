'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { adsConfig, getAdSlotConfig } from '@/config/ads.config';
import { getClientSubscription } from '@/lib/monetization/subscription';
import { getCookieConsent } from '@/components/common/CookieBanner';
import { canDisplayAds, loadAdSenseScript, requestAdRender } from '@/lib/monetization/adsense';

interface AdSlotProps {
  slotKey?: 'homepage_top' | 'homepage_bottom' | 'category_top' | 'tool_content' | 'sidebar';
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'content' | 'leaderboard';
  className?: string;
}

export function AdSlot({
  slotKey,
  slotId: explicitSlotId,
  format: explicitFormat,
  className = '',
}: AdSlotProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasAdSenseLive, setHasAdSenseLive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slotConfig = slotKey ? getAdSlotConfig(slotKey) : null;
  const activeSlotId = explicitSlotId || slotConfig?.slotId || 'coolwave-ad-default';
  const activeFormat = explicitFormat || slotConfig?.format || 'horizontal';

  const evaluateEligibility = () => {
    const sub = getClientSubscription();
    // 1. Pro users receive 0 ads
    if (sub.isPro || sub.entitlements.noAds) {
      setShouldRender(false);
      return;
    }

    if (!adsConfig.enabled) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);

    const consent = getCookieConsent();
    const isConsentGranted = consent ? consent.marketing : false;
    const hasClientId = Boolean(adsConfig.clientId && adsConfig.clientId.startsWith('ca-pub-'));

    if (isConsentGranted && hasClientId) {
      const loaded = loadAdSenseScript();
      if (loaded) {
        setHasAdSenseLive(true);
        requestAdRender(activeSlotId);
      }
    } else {
      setHasAdSenseLive(false);
    }
  };

  useEffect(() => {
    evaluateEligibility();

    const handleSubChange = () => evaluateEligibility();
    const handleConsentChange = () => evaluateEligibility();

    window.addEventListener('coolwave_subscription_changed', handleSubChange);
    window.addEventListener('coolwave_consent_updated', handleConsentChange);

    return () => {
      window.removeEventListener('coolwave_subscription_changed', handleSubChange);
      window.removeEventListener('coolwave_consent_updated', handleConsentChange);
    };
  }, [slotKey, explicitSlotId]);

  if (!shouldRender) {
    return null;
  }

  // Pre-allocated height reserves to strictly protect Core Web Vitals (0 CLS)
  const formatStyles: Record<string, string> = {
    leaderboard: 'min-h-[100px] sm:min-h-[110px] max-w-5xl',
    horizontal: 'min-h-[100px] sm:min-h-[120px] max-w-4xl',
    content: 'min-h-[120px] sm:min-h-[140px] max-w-3xl',
    rectangle: 'min-h-[260px] max-w-sm',
  };

  const selectedStyle = formatStyles[activeFormat] || formatStyles.horizontal;

  return (
    <aside
      ref={containerRef}
      role="complementary"
      aria-label="Werbung"
      className={`w-full mx-auto my-5 sm:my-8 px-2 sm:px-4 flex flex-col items-center justify-center select-none ${className}`}
    >
      <div
        className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-2 sm:p-3 flex flex-col items-center justify-between text-center overflow-hidden transition-all duration-200 ${selectedStyle}`}
      >
        {/* Compliance Header Disclaimer (Distinctly labeled per AdSense policies) */}
        <div className="w-full flex items-center justify-between px-1.5 sm:px-2 mb-1 text-[9px] sm:text-[10px] text-slate-400 font-medium">
          <span className="uppercase tracking-wider font-semibold text-slate-400">
            Anzeige
          </span>
          <Link
            href="/de/preise"
            className="hover:text-sky-600 transition underline underline-offset-2"
          >
            Werbefrei mit Pro
          </Link>
        </div>

        {/* Ad Container */}
        <div className="w-full flex-1 flex items-center justify-center bg-white/80 rounded-xl border border-slate-100/90 overflow-hidden relative">
          {hasAdSenseLive ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '100%' }}
              data-ad-client={adsConfig.clientId}
              data-ad-slot={activeSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="py-2.5 sm:py-4 px-3 sm:px-6 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                CoolWave Partner-Netzwerk
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Konfigurierbarer Werbeplatz • Gesichert durch Google AdSense Richtlinien
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
