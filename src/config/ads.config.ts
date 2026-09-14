export interface AdSlotConfig {
  slotId: string;
  format: 'horizontal' | 'rectangle' | 'content' | 'leaderboard';
  minHeightPx: number;
  label: string;
}

export interface AdvertisingConfig {
  enabled: boolean;
  clientId: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX (configured via env)
  slots: Record<string, AdSlotConfig>;
}

export const adsConfig: AdvertisingConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false',
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  slots: {
    homepage_top: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP || 'coolwave-home-top',
      format: 'leaderboard',
      minHeightPx: 100,
      label: 'Homepage Header Banner',
    },
    homepage_bottom: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BOTTOM || 'coolwave-home-bottom',
      format: 'horizontal',
      minHeightPx: 110,
      label: 'Homepage Content Banner',
    },
    category_top: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_TOP || 'coolwave-cat-top',
      format: 'horizontal',
      minHeightPx: 100,
      label: 'Kategorie Top Banner',
    },
    tool_content: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_CONTENT || 'coolwave-tool-content',
      format: 'content',
      minHeightPx: 130,
      label: 'Werkzeug Content Banner',
    },
    sidebar: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || 'coolwave-sidebar',
      format: 'rectangle',
      minHeightPx: 260,
      label: 'Seitenleiste Banner',
    },
  },
};

export function isAdsEnabled(): boolean {
  return adsConfig.enabled;
}

export function getAdSlotConfig(slotKey: string): AdSlotConfig {
  return (
    adsConfig.slots[slotKey] || {
      slotId: `coolwave-slot-${slotKey}`,
      format: 'horizontal',
      minHeightPx: 100,
      label: 'Standard Banner',
    }
  );
}
